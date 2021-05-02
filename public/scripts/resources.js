function buildTree(elements, appendTo, path) {
    const div = document.createElement('div');
    div.classList.add('content');

    for (const element of elements) {
        const fullPath = path + (element.path.length > 0 ? '/' + element.path : '');

        const fileContent = document.createElement('div');
        const filePath = document.createElement('a');

        filePath.innerText = element.path;
        fileContent.append(filePath);

        if (element.dir !== undefined) {
            // Is directory
            fileContent.classList.add('folder');

            filePath.addEventListener('click', (e) => {
                const element = fileContent.querySelector('.content');
                element.classList.toggle('expand');

                const arrow = fileContent.querySelector('.arrow');
                arrow.classList.toggle('right');
                arrow.classList.toggle('down');
                e.preventDefault();
            });

            // Add folder icon
            const i = document.createElement('i');
            i.classList.add('arrow', 'right');
            filePath.prepend(i);

            const content = buildTree(element.dir, fileContent, fullPath);

            if (element.metadata !== null) {
                const span = document.createElement("span");
                span.innerText = element.metadata.description;
                span.classList.add("text-muted");
                span.style.marginLeft = "1em";
                content.prepend(span);
            }
        } else {
            // Is file
            // Create link
            //filePath.href = fullPath;
            filePath.addEventListener('click', (e) => viewFile(e, fullPath));
            filePath.target = '_blank';
            filePath.classList.add('show');

            const fileInfo = document.createElement('span');
            fileInfo.innerText = getReadableFileSizeString(element.size) + ' - ' + new Date(element.time * 1000).toLocaleString();

            fileContent.append(fileInfo);

            fileContent.classList.add('file');

            if (element.path.includes('.')) {
                const fileExt = element.path.split('.').slice(-1).pop();
                const img = document.createElement('img');

                const icons = getFileIcon(fileExt);

                img.src = `/public/assets/icons/${icons[0]?.name}.svg`;
                img.classList.add('icon');

                filePath.prepend(img);
            }
        }

        div.append(fileContent);
    }

    appendTo.append(div);

    return div;
}

function viewFile(e, filePath) {
    const content = document.getElementById('resource-content');
    const spinner = document.getElementById('spinner');
    const title = document.getElementById('resource-modal-label');
    const downloadButton = document.getElementById('resource-download-button');

    spinner.classList.remove('d-none');
    spinner.classList.add('d-flex');

    downloadButton.href = filePath;
    title.innerText = filePath.split('/').pop();
    content.innerHTML = '';

    const modal = new bootstrap.Modal(document.getElementById('resource-modal'));
    modal.show();

    fetch(filePath)
        .then(res => {
            const contentType = res.headers.get('content-type');

            spinner.classList.add('d-none');
            spinner.classList.remove('d-flex');

            switch (contentType.split('/')[0]) {
                case 'image':
                    content.innerHTML = `<img src="${filePath}" class="img-fluid">`;
                    break;
                case 'text':
                    res.text().then(txt => {
                        if (contentType === "text/markdown") {
                            const converter = new showdown.Converter();
                            content.innerHTML = converter.makeHtml(txt);
                        } else {
                            content.innerHTML = `<pre>${txt}</pre>`;
                        }
                    });
                    break;
            }
        })
}

function getResources() {
    fetch('/api/resources')
        .then((res) => res.json())
        .then((json) => {
            const tree = document.getElementById('resource-tree');

            buildTree(json[0].dir, tree, '/~erwan');
        });
}

window.addEventListener('load', getResources);