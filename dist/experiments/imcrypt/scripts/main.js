function changeProgress(id, status = '', percentage = 0, error = false) {
    const progressBar = document.getElementById(id);

    progressBar.style.width = Math.floor(percentage) + '%';
    progressBar.innerHTML = status;

    if (error)
        progressBar.classList.add('bg-danger');
    else
        progressBar.classList.remove('bg-danger');
}

function download(data, filename, type, isBlob = false) {
    let file;
    if (isBlob) file = data;
    else file = new Blob([data], { type: type });

    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        const a = document.createElement("a"),
            url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function () {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    }
}

function decrypt(event) {
    const file = this.files[0];
    if (file != undefined) {
        changeProgress('encrypt-progress', '', 0);

        const worker = new Worker('scripts/decrypt.min.js');

        changeProgress('decrypt-progress', 'Loading image...', 10);
        const url = URL.createObjectURL(file),
            img = new Image();
        delete file;

        img.onload = function () {
            console.log('Image loaded!');
            URL.revokeObjectURL(this.src);

            const canvas = document.getElementById('decrypt-canvas');
            const ctx = canvas.getContext('2d');

            canvas.width = this.width.toString();
            canvas.height = this.height.toString();
            canvas.style.width = '100%';

            changeProgress('decrypt-progress', 'Drawing image...', 20);
            ctx.drawImage(this, 0, 0);

            changeProgress('decrypt-progress', 'Getting image data...', 30);
            const imageData = ctx.getImageData(0, 0, this.width, this.height);

            changeProgress('decrypt-progress', 'Starting worker...', 40);
            worker.postMessage(imageData);

            delete imageData;
            delete img;
        };

        img.src = url;

        worker.onmessage = function (e) {

            switch (e.data[0]) {
                case 'progress':
                    changeProgress('decrypt-progress', e.data[1], e.data[2]);
                    break;

                case 'done':
                    changeProgress('decrypt-progress', 'Done!', 100);
                    window.decryptedFile = e.data[1];

                    document.getElementById('download-file').classList.remove('d-none');

                    delete worker;
                    break;

                default:
                    break;
            }

        }
    }
}

function encrypt(event) {
    const file = this.files[0];
    if (file != undefined) {
        changeProgress('encrypt-progress', '', 0);

        const worker = new Worker('scripts/encrypt.min.js');
        worker.postMessage(file);
        delete file;

        worker.onmessage = function (e) {

            switch (e.data[0]) {
                case 'progress':
                    changeProgress('encrypt-progress', e.data[1], e.data[2]);
                    break;

                case 'done':
                    changeProgress('encrypt-progress', 'Done!', 100);

                    const canvas = document.getElementById('encrypt-canvas');
                    canvas.classList.remove('d-none')

                    const ctx = canvas.getContext('2d');
                    canvas.width = e.data[1].width;
                    canvas.height = e.data[1].height;
                    canvas.style.width = '100%';
                    ctx.putImageData(e.data[1], 0, 0);

                    document.getElementById('download-image').classList.remove('d-none');
                    delete worker;
                    break;

                default:
                    break;
            }

        }
    }
}

function downloadImage(e) {
    const canvas = document.getElementById('encrypt-canvas');
    canvas.toBlob(function (blob) {
        download(blob, 'image.png', '', true)
    });
}

function downloadFile(e) {
    download(window.decryptedFile, 'file.txt', '');
}

document.getElementById('encrypt-input').addEventListener('change', encrypt);
document.getElementById('decrypt-input').addEventListener('change', decrypt);
document.getElementById('download-image').addEventListener('click', downloadImage);
document.getElementById('download-file').addEventListener('click', downloadFile);