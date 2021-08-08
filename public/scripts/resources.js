/**
 * @typedef FileElement
 * @property {string} path
 * @property {string} metadata
 * @property {?number} size
 * @property {?number} time
 * @property {FileElement[]} dir
 */

/**
 * @param {FileElement} elements
 * @param {HTMLElement} appendTo
 * @param {string} path Base path
 * @param {string[]} open
 * @param rootPath
 * @returns {HTMLDivElement}
 */
function buildTree(elements, appendTo, path, open, rootPath = path) {
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
                const elem = fileContent.querySelector('.content');
                elem.classList.toggle('expand');

                const arrow = fileContent.querySelector('.arrow');
                arrow.classList.toggle('right');
                arrow.classList.toggle('down');

                const p = fullPath.replace(rootPath, "");
                if (elem.classList.contains("expand")) {
                    window.location.hash = p;
                } else {
                    window.location.hash = p.substr(0, p.length - element.path.length);
                }
                e.preventDefault();
            });

            // Add folder icon
            const i = document.createElement('i');
            i.classList.add('arrow', 'right');
            filePath.prepend(i);

            const shouldOpen = open.length > 0 && open[0] === element.path;

            if (shouldOpen) open.shift();

            const content = buildTree(element.dir, fileContent, fullPath, open, rootPath);

            if (shouldOpen) filePath.click();

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

/**
 * @param {MouseEvent} e
 * @param {string} filePath
 */
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


            switch (contentType?.split('/')?.[0]) {
                case 'image':
                    content.innerHTML = `<img src="${filePath}" class="img-fluid">`;
                    break;
                case 'text':
                case 'application':
                    if (res.headers.get("Content-Length") < 1024) {
                        res.text().then(txt => {
                            if (contentType === "text/markdown") {
                                const converter = new showdown.Converter();
                                content.innerHTML = converter.makeHtml(txt);
                            } else {
                                content.innerHTML = `<pre>${txt}</pre>`;
                            }
                        });
                    } else {
                        content.innerHTML = "Sorry, this file can't be previewed (too long).";
                    }
                    break;
                default:
                    content.innerHTML = "Sorry, this file can't be previewed (non-text file).";
                    break;
            }
        })
}

function getResources() {
    fetch('/api/resources')
        .then((res) => res.json())
        .then((json) => {
            const tree = document.getElementById('resource-tree');

            const open = window.location.hash.substr(1).split(/\//g).filter(e => e.length > 0);
            buildTree(json[0].dir, tree, '/~erwan', open);
        });
}

window.addEventListener('load', getResources);