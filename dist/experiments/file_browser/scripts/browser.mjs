/**
 * @typedef ResourceMetadata
 * @property {?string} description Resource's description
 * @property {?boolean} restricted Is the resource's access restricted
 * @property {?string} viewMode The mode to view the resource's content
 */
import {getFileIcon} from "../../../src/scripts/fileIcons.js";
import {createSpinner, getReadableFileSizeString, toggleAnimation, download} from "../../../src/scripts/utils.js";

/**
 * @typedef ResourceList
 * @property {string} name Resource's name
 * @property {number} size Resource's size in bytes
 * @property {?boolean} dir This resource is a directory
 * @property {?number} elements Directory's amount of elements
 * @property {?ResourceList} content Directory's content
 * @property {?ResourceMetadata} metadata Directory's metadata
 * @property {?boolean} hasThumbnail Does the directory has a thumbnail
 * @property {?string} thumbnailPath Path to the thumbnail
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
     * @param {string} viewMode
     * @returns {HTMLDivElement}
     */
    static buildFileBrowserElement(file, browser, viewMode = "default") {
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

        if (file.hasThumbnail) {
            const encoded = browser.encodePath([file.thumbnailPath]);
            img.src = `${browser.apiUrl}/thumbnail/${encoded}`;
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

        if (viewMode === "library") {
            let episodes = 0;
            for (const season of file.seasons) episodes += season;
            statElement.innerText = `${file.seasons.length} season(s) - ${episodes} episode(s)`;
        } else if (file.dir) {
            statElement.innerText = `${getReadableFileSizeString(file.size)} - ${file.elements} element(s)`;
        } else {
            statElement.innerText = `${getReadableFileSizeString(file.size)} - ${new Date(file.time).format("%yyyy-%MM-%dd %hh:%mm")}`;
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

    /**
     * @param {HTMLVideoElement} video
     * @returns {Promise<MediaSource>}
     */
    static initMediaStream(video) {
        return new Promise(resolve => {
            const mediaSource = new MediaSource();

            mediaSource.onsourceopen = function () {
                console.log("Media source opened");
                resolve(mediaSource);
            }

            mediaSource.onsourceclose = function () {
                console.log("Media source closed");
            }

            mediaSource.onsourceended = function () {
                console.log("Media source ended");
            }

            video.src = URL.createObjectURL(mediaSource);
        });
    }
    
    static async initVideo(browser, video, auth, path) {
        let headers = {};
        if (auth) headers["Authorization"] = auth;

        path = path.split(".").slice(0, -1).join(".");

        // Init media source
        const mediaSource = await FileBrowser.initMediaStream(video);

        // Get metadata
        const mpd = await (await fetch(`${browser.apiUrl}/download/?path=${path}_dash.mpd`, {
            method: "GET",
            headers: headers,
        })).text();

        // Parse MPD file
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(mpd, "text/xml");
        const representations = xmlDoc.getElementsByTagName("Representation");
        const json = { lang: [], mpd: [], }
        for (const r of representations) {
            const init = r.getElementsByTagName("Initialization")[0].getAttribute("range");
            const segmentList = r.getElementsByTagName("SegmentList")[0];
            const segments = r.getElementsByTagName("SegmentURL");

            const segs = [];
            for (const segment of segments) {
                const [start, end] = segment.getAttribute("mediaRange").split("-");
                segs.push([parseInt(start), parseInt(end)]);
            }

            const [start, end] = init.split("-");

            json.mpd.push({
                id: r.getAttribute("id"),
                mime: r.getAttribute("mimeType"),
                codecs: r.getAttribute("codecs"),
                width: r.getAttribute("width"),
                height: r.getAttribute("height"),
                framerate: r.getAttribute("frameRate"),
                bandwidth: r.getAttribute("bandwidth"),
                duration: segmentList.getAttribute("duration"),
                timescale: segmentList.getAttribute("timescale"),
                init: [parseInt(start), parseInt(end)],
                segments: segs,
            });
        }

        const {id, mime, codecs, width, height, framerate, bandwidth, duration, timescale, segments, init} = json.mpd[0];
        const segmentSize = duration / timescale;

        // Create source buffer
        const fullMime = `${mime}; codecs="${codecs}"`;
        if (!MediaSource.isTypeSupported(fullMime)) {
            console.warn("Incompatible video type.");
            return;
        }
        const sourceBuffer = mediaSource.addSourceBuffer(fullMime);

        // Get init buffer
        const initBuffer = await (await fetch(`${browser.apiUrl}/download/?path=${path}_dashinit.mp4`, {
            method: "GET",
            headers: Object.assign({ ["Range"]: `bytes=${init[0]}-${init[1]}`}, headers),
        })).arrayBuffer();
        sourceBuffer.appendBuffer(initBuffer);

        // Get subtitles
        const subtitles = await (await fetch(`${browser.apiUrl}/download/?path=${path}.fr-FR.ass`, {
            method: "GET",
            headers: headers,
        })).arrayBuffer();

        const options = {
            video: video, // HTML5 video element
            subUrl: URL.createObjectURL(new Blob([subtitles])), // Link to subtitles
            workerUrl: '/public/scripts/lib/subtitles-octopus-worker.js', // Link to WebAssembly-based file "libassjs-worker.js"
            legacyWorkerUrl: '/public/scripts/lib/subtitles-octopus-worker-legacy.js', // Link to non-WebAssembly worker
        };
        const instance = new SubtitlesOctopus(options);

        // Play the video
        const BUFFER_SIZE = 30; // Amount of seconds to buffer

        function getBufferEnd(seconds, video) {
            const length = video.buffered.length;
            for (let i = 0; i < length; i++) {
                const end = video.buffered.end(i);
                if (video.buffered.start(i) <= seconds && seconds <= end) {
                    return end;
                }
            }
            return seconds;
        }

        const getSegmentIndex = s => Math.min(segments.length, Math.max(0, Math.floor(s / segmentSize)));

        function getRange(seconds) {
            const startIndex = getSegmentIndex(seconds - segmentSize * 2);
            const endIndex = getSegmentIndex(seconds + segmentSize);
            return `bytes=${segments[startIndex][0]}-${segments[endIndex][1]}`;
        }

        // Define if the player is currently fetching data
        let updating = false;
        async function addBuffer(seconds) {
            if (updating || sourceBuffer.updating) return;
            updating = true;
            const range = getRange(seconds);
            const response = await fetch(`${browser.apiUrl}/download/?path=${path}_dashinit.mp4`, {
                method: "GET",
                headers: Object.assign({ ["Range"]: range}, headers),
            });
            if (response.status !== 206) {
                updating = false;
                return;
            }
            const buffer = await response.arrayBuffer();
            sourceBuffer.appendBuffer(buffer);
            updating = false;
        }

        const requestData = async (ev) => {
            if (sourceBuffer.updating) return;
            const end = getBufferEnd(video.currentTime, video);
            if (video.currentTime + BUFFER_SIZE > end) await addBuffer(end);
        }

        video.onseeking = video.onwaiting = sourceBuffer.onupdateend = video.ontimeupdate = requestData;
    }

    constructor() {
        // Always call super first in constructor
        super();

        // Write element functionality in here
        this.path = this.decodePath();
        this.updating = false;
        this.apiUrl = "/api/v1";

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
            for (const child of this.previewContent.children) {
                child.remove();
            }
            this.previewContent.innerHTML = "";
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
            toggleAnimation(elements, "open", FileBrowser.TRANSITION_DURATION / elements.length, () => this.setPath(), FileBrowser.TRANSITION_DURATION);
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

    setApiUrl(url) {
        this.apiUrl = url;
    }

    encodePath(path = this.path) {
        return btoa(encodeURIComponent(path.join("/")));
    }

    decodePath(hash = window.location.hash.substring(1)) {
        return this.path = decodeURIComponent(atob(hash)).split(/\//g).filter(v => v.length > 0);
    }

    async stream(path) {
        // If file is a video, then play it
        const video = document.createElement("video");
        video.oncanplay = video.play;
        video.controls = true;

        FileBrowser.initVideo(this, video, this.auth, path);

        this.previewContent.innerHTML = "";
        this.preview.classList.add("show");

        this.previewContent.append(video);
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
        const path = this.path.join("/") + "/" + filename;
        if (this.auth) headers["Authorization"] = this.auth;

        downloadElement.classList.add("downloading");
        downloadInfo.innerText = `Downloading ${filename}\nPlease hang up...`;
        let start = 0, end = 0, length = null, rangeEnd = 0;
        let chunks = [], contentType, receivedLength = 0;
        do {
            headers["Range"] = `bytes=${start}-${end}`;

            const response = await fetch(`${this.apiUrl}/download/?path=${path}`, {
                method: "GET",
                headers: headers,
            });

            receivedLength += parseInt(response.headers.get("content-length"));
            contentType = response.headers.get("content-type");

            if (contentType.split("/")[0] === "video") {
                downloadProgress.style.width = `0`;
                downloadElement.classList.remove("downloading");
                downloadElement.remove();
                this.stream(path);
                return;
            }

            const range = response.headers.get("content-range");
            const rangeRe = /bytes (\d+)-(\d+)\/(\d+)/;
            const parsed = rangeRe.exec(range);

            // Use the parsed value if available, fallback to the start and end of the entire file
            length = parsed && parsed[3] ? +parsed[3] : 0;
            start = (parsed && parsed[1] ? +parsed[1] : 0);
            rangeEnd = (parsed && parsed[2] ? +parsed[2] : 0);

            start = Math.min(receivedLength, length - 1);
            end = Math.min(receivedLength + 1024 * 1024 * 10, length - 1);

            chunks.push(await response.arrayBuffer());
            downloadProgress.style.width = `${Math.min(1, end / length) * 100}%`;
        } while (rangeEnd !== length - 1);

        downloadInfo.innerText = `Processing ${filename}\nPlease hang up...`;
        let chunksAll = new Uint8Array(receivedLength);
        let position = 0;
        for (const chunk of chunks) {
            const uint = new Uint8Array(chunk);
            chunksAll.set(uint, position);
            position += uint.length;
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
        if (this.updating) return;
        this.updating = true;

        // Get file and folder list
        let request, headers = {};
        let url = `${this.apiUrl}/resources/`;
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

        const viewMode = files?.metadata?.viewMode;
        this.setAttribute("data-view-mode", viewMode ?? "default");

        // Build file and folder list
        for (const file of files.content) {
            size += file.size;

            const element = FileBrowser.buildFileBrowserElement(file, this, files?.metadata?.viewMode);
            this.browser.append(element);
        }

        const elements = Array.from(this.browser.children);
        toggleAnimation(elements, "open", FileBrowser.TRANSITION_DURATION / elements.length);

        switch (viewMode) {
            case "show": {
                const img = document.createElement("img");
                img.src = `${this.apiUrl}/thumbnail/${this.encodePath(this.path)}`;
                this.stat.append(img);

                const title = FileBrowser.createElement("h3", "title");
                title.innerText = this.path[this.path.length - 1];
                this.stat.append(title);

                const description = FileBrowser.createElement("p", "description");
                description.innerText = files.metadata.description;
                this.stat.append(description);
                break;
            }
            default: {
                this.stat.innerText = `${files.content.length} elements - ${getReadableFileSizeString(size)} total size`;

                if (files?.metadata?.description) {
                    this.stat.innerText += ` | ${files.metadata.description}`;
                }
                break;
            }
        }

        this.updating = false;
    }
}

export function initFileBrowser() {
    window.customElements.define("file-browser", FileBrowser);
}