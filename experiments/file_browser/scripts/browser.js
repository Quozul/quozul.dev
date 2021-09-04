const fileBrowser = {
    TRANSITION_DURATION: 200,
    toggleAnimation: function (elements, classToToggle, delay = 1000, end = null, finalDelay = null) {
        if (elements.length === 0) {
            if (end) {
                setTimeout(() => end(), finalDelay ?? delay);
            }
            return;
        }
        const element = elements.shift();
        setTimeout(() => {
            element.classList.toggle(classToToggle);
            this.toggleAnimation(elements, classToToggle, delay, end, finalDelay)
        }, delay);
    },
    findHandler: function (entries, path = []) {
        if (path.length === 0) return entries;

        for (const entry of entries) {
            const name = entry.name;

            if (name === path[0]) {
                if (path.length === 1) {
                    return entry.content;
                } else {
                    return this.findHandler(entry.content, path.slice(1));
                }
            }
        }

        return null;
    },
    FileBrowser: class extends HTMLElement {
        constructor() {
            // Always call super first in constructor
            super();

            // Write element functionality in here
            this.files = [];
            this.path = unescape(atob(window.location.hash.substring(1))).split(/\//g).filter(v => v.length > 0);

            this.append(this.preview = document.createElement("div"));
            this.append(this.pathElement = document.createElement("div"));
            this.append(this.browser = document.createElement("div"));
            this.append(this.search = document.createElement("input"));
            this.append(this.downloadCenter = document.createElement("div"));
            this.append(this.contextMenu = document.createElement("ul"));
            this.browser.classList.add("browser");
            this.pathElement.classList.add("path");
            this.preview.classList.add("preview");
            this.search.classList.add("search");
            this.downloadCenter.classList.add("download-center");
            this.contextMenu.classList.add("context-menu");

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
            }, {passive: true});

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
                this.path = unescape(atob(window.location.hash.substring(1))).split(/\//g).filter(v => v.length > 0);
                const elements = Array.from(this.browser.children);
                fileBrowser.toggleAnimation(elements, "open", fileBrowser.TRANSITION_DURATION / elements.length, () => this.setPath(), fileBrowser.TRANSITION_DURATION);
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
            fileBrowser.toggleAnimation(elements, "open", fileBrowser.TRANSITION_DURATION / elements.length, () => this.setPath(), fileBrowser.TRANSITION_DURATION);

            const url = new URL(window.location);
            url.hash = btoa(escape(this.path.join("/")));
            window.history.pushState({}, document.title, url.toString());
        }

        setAuthorization(token) {
            this.auth = token;
        }

        setCallbackUrl(url) {
            this.callbackUrl = url;
        }

        async downloadFile(filename) {
            const downloadElement = document.createElement("div");
            downloadElement.classList.add("download");
            this.downloadCenter.append(downloadElement);

            const downloadProgress = document.createElement("div");
            downloadProgress.classList.add("progress");
            downloadElement.append(downloadProgress);

            const downloadInfo = document.createElement("div");
            downloadInfo.classList.add("info")
            downloadElement.append(downloadInfo);

            const headers = new Headers({"Authorization": this.auth});
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

            // Step 3: read the data
            let receivedLength = 0; // received that many bytes at the moment
            let chunks = []; // array of received binary chunks (comprises the body)
            let entry;
            while (!(entry = await reader.read()).done) {
                const {value} = entry;

                chunks.push(value);
                receivedLength += value.length;

                downloadProgress.style.width = `${receivedLength / contentLength * 100}%`;
            }

            // Step 4: concatenate chunks into single Uint8Array
            let chunksAll = new Uint8Array(receivedLength); // (4.1)
            let position = 0;
            for (let chunk of chunks) {
                chunksAll.set(chunk, position); // (4.2)
                position += chunk.length;
            }

            // We're done!
            download(filename, new Blob([chunksAll]));

            setTimeout(() => {
                downloadProgress.style.width = `0`;
                downloadElement.classList.remove("downloading");

                setTimeout(() => {
                    downloadElement.remove();
                }, 200);
            }, 1000);
        }

        async openPath() {
            let request, headers = {};
            let url = "/api/resources/";
            if (this.path.length > 0) url += `?path=${this.path.join("/")}`;
            if (this.auth) headers["Authorization"] = this.auth;
            request = await fetch(url, {headers: headers});

            this.browser.innerHTML = "";
            this.preview.innerHTML = "";

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

            const files = (await request.json()).content;
            let size = 0;

            for (const file of files) {
                size += file.size;

                const element = document.createElement("div");
                element.classList.add(file.content ? "folder" : "file");

                const nameElement = document.createElement("span");
                nameElement.classList.add("name");
                nameElement.innerText = file.name;
                element.append(nameElement);

                const statElement = document.createElement("span");
                statElement.classList.add("stat");
                statElement.innerText = getReadableFileSizeString(file.size);
                element.append(statElement);

                const fileExt = file.name.split('.').slice(-1).pop();
                const img = document.createElement('img');

                const icons = getFileIcon(fileExt);

                img.src = `/public/assets/icons/${file.content ? "folder" : icons[0]?.name}.svg`;
                img.classList.add('icon');
                img.alt = `${icons[0]?.name} icon`;

                element.prepend(img);
                element.setAttribute("data-name", file.name);

                // Right click on element
                element.addEventListener("contextmenu", ev => {
                    ev.preventDefault();

                    this.contextMenu.style.left = ev.x - this.x + "px";
                    this.contextMenu.style.top = ev.y - this.y + "px";

                    this.contextMenu.innerHTML = "";

                    const copyLi = document.createElement("li");
                    copyLi.innerText = "Copy link";
                    this.contextMenu.append(copyLi);

                    copyLi.addEventListener("click", () => {
                        console.log(escape([...this.path, file.name].join("/")));
                        const url = "https://quozul.dev/resources/#" + btoa(escape([...this.path, file.name].join("/")));
                        console.log(url);
                        navigator.clipboard.writeText(url)
                        this.contextMenu.classList.remove("visible");
                    }, {passive: true, once: true});

                    this.contextMenu.classList.add("visible");
                });

                if (file.content) {
                    statElement.innerText += ` - ${file.content.length} elements`;
                }

                // Click on element
                element.addEventListener("click", ev => {
                    if (!element.classList.contains("open")) {
                        ev.preventDefault();
                        ev.stopPropagation();
                        return;
                    }

                    if (file.content) {
                        // Open directory
                        this.path.push(file.name);
                        this.changeDirectory("open");
                    } else {
                        // View or download file
                        this.downloadFile(file.name);
                    }
                }, {passive: true});
                this.browser.append(element);
            }

            const elements = Array.from(this.browser.children);
            fileBrowser.toggleAnimation(elements, "open", fileBrowser.TRANSITION_DURATION / elements.length);

            this.preview.innerText = `${files.length} elements - ${getReadableFileSizeString(size)} total size`
        }
    },
    init: function () {
        window.customElements.define('file-browser', this.FileBrowser);
    },
}