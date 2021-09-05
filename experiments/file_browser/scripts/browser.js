/**
 * @typedef ResourceMetadata
 * @property {?string} description Resource's description
 * @property {?boolean} restricted Is the resource's access restricted
 * @property {?string} view_mode The mode to view the resource's content
 */
/**
 * @typedef ResourceList
 * @property {string} name Resource's name
 * @property {number} size Resource's size in bytes
 * @property {?boolean} dir This resource is a directory
 * @property {?number} elements Directory's amount of elements
 * @property {?ResourceList} content Directory's content
 * @property {?ResourceMetadata} metadata Directory's metadata
 * @property {?boolean} has_thumbnail Does the directory has a thumbnail
 * @property {?number[]} seasons Amount of episodes in each seasons
 */

class FileBrowser extends HTMLElement {
    static TRANSITION_DURATION = 200;

    static createElement(tagName, ...c) {
        const element = document.createElement(tagName);
        element.classList.add(...c);
        return element;
    }

    /**
     * @param {ResourceList} file
     * @param {FileBrowser} browser
     * @param {string} view_mode
     * @returns {HTMLDivElement}
     */
    static buildFileBrowserElement(file, browser, view_mode = "default") {
        const element = document.createElement("div");
        element.classList.add(file.dir ? "folder" : "file");

        const nameElement = document.createElement("span");
        nameElement.classList.add("name");
        nameElement.innerText = file.name;
        element.append(nameElement);

        const statElement = document.createElement("span");
        statElement.classList.add("stat");
        element.append(statElement);

        const fileExt = file.name.split('.').slice(-1).pop();
        const img = document.createElement('img');

        const icons = getFileIcon(fileExt);

        if (view_mode && file.has_thumbnail) {
            img.src = `/api/thumbnail/${browser.encodePath([...browser.path, file.name])}`;
        } else {
            img.src = `/public/assets/icons/${file.dir ? "folder" : icons[0]?.name}.svg`;
        }

        img.loading = "lazy";
        img.classList.add('icon');
        img.alt = `${icons[0]?.name} icon`;

        element.prepend(img);
        element.setAttribute("data-name", file.name);

        // Right click on element
        element.addEventListener("contextmenu", ev => {
            ev.preventDefault();

            browser.contextMenu.style.left = ev.x - browser.x + "px";
            browser.contextMenu.style.top = ev.y - browser.y + "px";

            browser.contextMenu.innerHTML = "";

            const copyLi = document.createElement("li");
            copyLi.innerText = "Copy link";
            browser.contextMenu.append(copyLi);

            copyLi.addEventListener("click", () => {
                const url = "https://quozul.dev/resources/#" + btoa(escape([...browser.path, file.name].join("/")));
                navigator.clipboard.writeText(url)
                browser.contextMenu.classList.remove("visible");
            }, {passive: true, once: true});

            const downLi = document.createElement("li");
            downLi.innerText = "Download";
            browser.contextMenu.append(downLi);

            downLi.addEventListener("click", () => {
                browser.downloadFile(file.name, true);
                browser.contextMenu.classList.remove("visible");
            }, {passive: true, once: true});

            browser.contextMenu.classList.add("visible");
        });

        if (view_mode === "library") {
            let episodes = 0;
            for (const season of file.seasons) episodes += season;
            statElement.innerText = `${file.seasons.length} season(s) - ${episodes} episode(s)`;
        } else if (file.dir) {
            statElement.innerText = `${getReadableFileSizeString(file.size)} - ${file.elements} element(s)`;
        } else {
            statElement.innerText = `${getReadableFileSizeString(file.size)} - ${new Date(file.time * 1000).format("%yyyy-%MM-%dd %hh:%mm")}`;
        }

        // Click on element
        element.addEventListener("click", ev => {
            if (!element.classList.contains("open")) {
                ev.preventDefault();
                ev.stopPropagation();
                return;
            }

            if (file.dir) {
                // Open directory
                browser.path.push(file.name);
                browser.changeDirectory("open");
            } else {
                // View or download file
                browser.downloadFile(file.name);
            }
        }, {passive: true});

        return element;
    }

    constructor() {
        // Always call super first in constructor
        super();

        // Write element functionality in here
        this.path = this.decodePath();

        // Build browser elements
        this.append(this.stat = FileBrowser.createElement("div", "stat"));
        this.append(this.pathElement = FileBrowser.createElement("div", "path"));
        this.append(this.browser = FileBrowser.createElement("div", "browser"));
        this.append(this.search = FileBrowser.createElement("input", "search"));
        this.append(this.downloadCenter = FileBrowser.createElement("div", "download-center"));
        this.append(this.contextMenu = FileBrowser.createElement("ul", "context-menu"));

        // Build preview div
        this.append(this.preview = FileBrowser.createElement("div", "preview"));
        const close = FileBrowser.createElement("div", "close");
        close.addEventListener("click", () => {
            this.preview.classList.remove("show");
        }, {passive: true});
        this.preview.append(close); // Cross
        this.preview.append(this.previewContent = FileBrowser.createElement("div", "content")); // Content

        this.getSize();
        document.addEventListener("resize", () => this.getSize(), {passive: true});

        // Context menu loose focus
        document.addEventListener("click", ev => {
            if (ev.target === this.contextMenu || this.contextMenu.contains(ev.target)) return false;
            this.contextMenu.classList.remove("visible");
        }, {passive: true});

        this.searchIndex = 0;

        // Prevent CTRL+F & select custom input
        window.addEventListener("keydown", ev => {
            if (ev.keyCode === 114 || (ev.ctrlKey && ev.keyCode === 70)) {
                ev.preventDefault();

                this.search.select();
            } else if (!ev.ctrlKey && ev.key.length === 1) {
                this.search.focus();
            }
        });

        this.search.addEventListener("focusin", () => {
            this.search.classList.add("visible");
        }, {passive: true});

        this.search.addEventListener("focusout", () => {
            if (this.search.value.length === 0) this.search.classList.remove("visible");
        }, {passive: true});

        this.search.addEventListener("keyup", ev => {
            const elements = Array.from(this.browser.children);
            const search = this.search.value;

            if (ev.key === "Enter") {
                let found = false;

                for (let i = this.searchIndex; i < elements.length; i++) {
                    const element = elements[i];
                    const name = element.getAttribute("data-name");

                    if (name.toLowerCase().includes(search)) {
                        this.searchIndex = i + 1;
                        found = true;
                        element.scrollIntoView({behavior: "smooth"});
                        break;
                    }
                }

                if (!found) {
                    this.searchIndex = 0;
                }
            } else {
                for (const element of elements) {
                    const name = element.getAttribute("data-name");
                    const nameElement = element.querySelector(".name");

                    if (name.toLowerCase().includes(search)) {
                        const re = new RegExp(`(.*)(${search})(.*)`, "i")
                        const match = re.exec(name);

                        nameElement.innerHTML = `${match[1]}<span>${match[2]}</span>${match[3]}`;
                    } else {
                        nameElement.innerHTML = name;
                    }
                }
            }
        }, {passive: true});

        window.addEventListener("popstate", () => {
            this.decodePath();
            const elements = Array.from(this.browser.children);
            toggleAnimation(elements, "open", FileBrowser.TRANSITION_DURATION / elements.length, () => this.setPath(), fileBrowser.TRANSITION_DURATION);
        }, {passive: true});
    }

    getSize() {
        const boundingRect = this.getBoundingClientRect();
        this.x = boundingRect.x;
        this.y = boundingRect.y;
    }

    setPath() {
        this.openPath();

        // Build path element
        this.pathElement.innerHTML = "";

        // First element
        const span = document.createElement("span");
        span.innerText = "root" /* Default folder name */;
        span.addEventListener("click", () => {
            this.path = [];
            this.changeDirectory();
        }, {passive: true});
        this.pathElement.append(span);

        // Rest of the folders
        for (let i = 0; i < this.path.length; i++) {
            const string = this.path[i];

            const span = document.createElement("span");
            span.innerText = string;
            span.addEventListener("click", () => {
                // Close directory
                this.path = this.path.slice(0, i + 1);
                this.changeDirectory();
            }, {passive: true});
            this.pathElement.append(span);
        }
    }

    changeDirectory() {
        const elements = Array.from(this.browser.children);
        toggleAnimation(elements, "open", FileBrowser.TRANSITION_DURATION / elements.length, () => this.setPath(), FileBrowser.TRANSITION_DURATION);

        const url = new URL(window.location);
        url.hash = this.encodePath();
        window.history.pushState({}, document.title, url.toString());

        this.browser.scroll({top: 0, behavior: "smooth"});
    }

    setAuthorization(token) {
        this.auth = token;
    }

    setCallbackUrl(url) {
        this.callbackUrl = url;
    }

    encodePath(path = this.path) {
        return btoa(encodeURIComponent(path.join("/")));
    }

    decodePath(hash = window.location.hash.substring(1)) {
        return this.path = decodeURIComponent(atob(hash)).split(/\//g).filter(v => v.length > 0);
    }

    /**
     * @param {string} filename
     * @param {boolean} force_download
     * @returns {Promise<void>}
     */
    async downloadFile(filename, force_download = false) {
        const downloadElement = document.createElement("div");
        downloadElement.classList.add("download");
        this.downloadCenter.append(downloadElement);

        const downloadProgress = document.createElement("div");
        downloadProgress.classList.add("progress");
        downloadElement.append(downloadProgress);

        const downloadInfo = document.createElement("div");
        downloadInfo.classList.add("info")
        downloadElement.append(downloadInfo);

        let headers = {};
        if (this.auth) headers["Authorization"] = this.auth;
        const response = await fetch("/api/download", {
            method: "POST",
            headers: headers,
            body: this.path.join("/") + "/" + filename,
        });

        downloadElement.classList.add("downloading");
        downloadInfo.innerText = `Downloading ${filename}\nPlease hang up...`;

        const reader = response.body.getReader();

        // Step 2: get total length
        const contentLength = response.headers.get('Content-Length');
        const contentType = response.headers.get('Content-Type');

        // Step 3: read the data
        let receivedLength = 0; // received that many bytes at the moment
        let chunks = []; // array of received binary chunks (comprises the body)
        let entry;
        while (!(entry = await reader.read()).done) {
            const {value} = entry;

            chunks.push(value);
            receivedLength += value.length;

            downloadProgress.style.width = `${Math.min(1, receivedLength / contentLength) * 100}%`;
        }

        // Step 4: concatenate chunks into single Uint8Array
        let chunksAll = new Uint8Array(receivedLength); // (4.1)
        let position = 0;
        for (let chunk of chunks) {
            chunksAll.set(chunk, position);
            position += chunk.length;
        }
        const blob = new Blob([chunksAll], {type: contentType});

        if (!force_download) {
            const type = contentType.split("/")[0];
            switch (type) {
                case "image": {
                    // If file is an image, then preview it
                    const img = document.createElement("img");
                    img.src = URL.createObjectURL(blob);
                    img.alt = filename;

                    this.previewContent.innerHTML = "";
                    this.preview.classList.add("show");

                    this.previewContent.append(img);
                    break;
                }
                case "text": {
                    const pre = document.createElement("pre");
                    pre.innerText = new TextDecoder().decode(chunksAll);

                    this.previewContent.innerHTML = "";
                    this.preview.classList.add("show");

                    this.previewContent.append(pre);
                    break;
                }
                default: {
                    // Otherwise, download it
                    download(filename, blob);
                }
            }
        } else {
            download(filename, blob);
        }

        setTimeout(() => {
            downloadProgress.style.width = `0`;
            downloadElement.classList.remove("downloading");

            setTimeout(() => {
                downloadElement.remove();
            }, 200);
        }, 1000);
    }

    async openPath() {
        // Get file and folder list
        let request, headers = {};
        let url = "/api/resources/";
        if (this.path.length > 0) url += `?path=${this.path.join("/")}`;
        if (this.auth) headers["Authorization"] = this.auth;

        this.browser.innerHTML = "";
        // Loading spinner
        const spinner = createSpinner();
        this.browser.append(spinner);

        request = await fetch(url, {headers: headers});

        spinner.remove();
        this.stat.innerHTML = "";

        switch (request.status) {
            case 400: {
                this.browser.innerText = "The provided path is not valid.";
                this.downloadFile(this.path.pop());
                this.setPath();
                return;
            }
            case 401: {
                this.browser.innerText = "You are now allowed to see this folder.";
                return;
            }
            case 404: {
                this.browser.innerText = "This path does not exists.";
                return;
            }
        }

        /** @type {ResourceList} */
        const files = (await request.json());
        let size = 0;

        this.browser.setAttribute("data-view-mode", files?.metadata?.view_mode ?? "default");

        // Build file and folder list
        for (const file of files.content) {
            size += file.size;

            const element = FileBrowser.buildFileBrowserElement(file, this, files?.metadata?.view_mode);
            this.browser.append(element);
        }

        const elements = Array.from(this.browser.children);
        toggleAnimation(elements, "open", FileBrowser.TRANSITION_DURATION / elements.length);

        this.stat.innerText = `${files.content.length} elements - ${getReadableFileSizeString(size)} total size`;
        if (files?.metadata?.description) {
            this.stat.innerText += ` | ${files.metadata.description}`;
        }
    }
}

function initFileBrowser () {
    window.customElements.define('file-browser', FileBrowser);
}