async function buildTree(elements, appendTo, path) {
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

            buildTree(element.dir, fileContent, fullPath);
        } else {
            // Is file
            // Create link
            filePath.href = fullPath;
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

                img.src = `/assets/icons/${icons[0]?.name}.svg`;
                img.classList.add('icon');

                filePath.prepend(img);
            }
        }

        div.append(fileContent);
    }

    appendTo.append(div);
}

function getResources() {
    fetch('/api/resources.php')
        .then((res) => res.json())
        .then((json) => {
            const tree = document.getElementById('resource-tree');

            buildTree(json[0].dir, tree, '/~erwan');
        });
}

window.addEventListener('load', getResources);