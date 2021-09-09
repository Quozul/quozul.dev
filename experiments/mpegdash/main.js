/**
 * @param {HTMLVideoElement} video
 * @returns {Promise<MediaSource>}
 */
function initMediaStream(video) {
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

function sleep(time) {
    return new Promise(resolve => {
        setTimeout(resolve, time);
    });
}

function roundTo(n, p) {
    return Math.ceil(n / p) * p;
}

class Player extends HTMLElement{
    constructor() {
        super();

        this.video = document.createElement("video");
        this.video.controls = true;
        this.append(this.video);

        this.buffers = document.createElement("div");
        this.buffers.classList.add("buffers");
        this.append(this.buffers);

        // this.video.onloadeddata = this.video.onloadedmetadata = this.video.onprogress = this.video.onsuspend = this.video.onstalled = ev => console.log(ev.type);

        this.video.addEventListener("canplay", ev => {
            console.log(ev.type);
            // this.video.play();
        }, {passive: true});

        this.initVideo();
    }

    bufferBars() {
        const time = this.video.currentTime;
        const duration = this.video.duration;

        for (let i = 0; i < this.video.buffered.length; i++) {
            const start = this.video.buffered.start(i), end = this.video.buffered.end(i);

            let bar = this.buffers.querySelector(`[buffer="${i}"]`);

            if (!bar) {
                bar = document.createElement("div");
                bar.classList.add("bar");
                bar.setAttribute("buffer", i.toString());
                this.buffers.append(bar);
            }

            bar.innerText = `0 - ${start} - ${time} - ${end} - ${duration}`;
        }
    }

    /**
     * @param {HTMLVideoElement} video
     */
    async initVideo() {
        const url = `video.php`;

        // Init media source
        const mediaSource = await initMediaStream(this.video);

        // Get metadata
        const mpd = await (await fetch(url, {
            headers: {}
        })).json();

        const {codecs, mimeType} = mpd["Period"]["AdaptationSet"]["Representation"]["@attributes"];
        const SegmentList = mpd["Period"]["AdaptationSet"]["Representation"]["SegmentList"];
        const {timescale, duration} = SegmentList["@attributes"];
        const segmentSize = duration / timescale;
        const {Initialization, SegmentURL} = SegmentList;

        console.log("segment size", segmentSize);

        const mime = `${mimeType}; codecs="${codecs}"`;
        if (!MediaSource.isTypeSupported(mime)) {
            console.warn("Incompatible video type.");
            return;
        }
        const sourceBuffer = mediaSource.addSourceBuffer(mime);

        console.log(sourceBuffer.mode = "segments");

        const initBuffer = await (await fetch(url, {
            headers: {
                ["Range"]: Initialization["@attributes"]["range"],
            }
        })).arrayBuffer();
        sourceBuffer.appendBuffer(initBuffer);

        console.log("init buffer");

        const BUFFER_SIZE = 60; // Amount of seconds to buffer

        function getBufferIndex(seconds, sourceBuffer) {
            const length = sourceBuffer.buffered.length;
            for (let i = 0; i < length; i++) {
                if (sourceBuffer.buffered.start(i) <= seconds && seconds <= sourceBuffer.buffered.end(i)) {
                    return i;
                }
            }
            return undefined;
        }

        function getBuffers(seconds, video) {
            const length = video.buffered.length;
            const buffers = [];
            for (let i = 0; i < length; i++) {
                const start = video.buffered.start(i), end = video.buffered.end(i);
                if (start <= seconds && seconds <= end) {
                    buffers.push([start, end]);
                }
            }
            return buffers;
        }

        function getBufferTimes(seconds, video) {
            const length = video.buffered.length;
            for (let i = 0; i < length; i++) {
                const start = video.buffered.start(i), end = video.buffered.end(i);
                if (start <= seconds && seconds <= end) {
                    return [start, end];
                }
            }
            return [undefined, seconds];
        }

        function isBuffered(seconds, video) {
            const length = video.buffered.length;
            for (let i = 0; i < length; i++) {
                if (video.buffered.start(i) <= seconds && seconds <= video.buffered.end(i)) {
                    return true;
                }
            }
            return false;
        }

        function getSegmentIndex(seconds) {
            return Math.min(SegmentURL.length, Math.max(0, Math.floor(seconds / segmentSize)));
        }

        function getRange(seconds) {
            const startIndex = getSegmentIndex(seconds - segmentSize);
            const endIndex = getSegmentIndex(seconds + BUFFER_SIZE);
            const startRange = SegmentURL[startIndex]["@attributes"]["mediaRange"].split("-")[0];
            const endRange = SegmentURL[endIndex]["@attributes"]["mediaRange"].split("-")[1];
            console.log("Duration", (endIndex - startIndex) * segmentSize)
            return `${startRange}-${endRange}`;
        }

        async function addBuffer(seconds) {
            if (sourceBuffer.updating) return;

            const range = getRange(seconds);
            const buffer = await (await fetch(url, {
                headers: {
                    ["Range"]: range,
                }
            })).arrayBuffer();
            sourceBuffer.appendBuffer(buffer);
        }

        const requestData = async (ev) => {
            if (sourceBuffer.updating) return;

            let max = undefined, min = undefined;
            const buffers = getBuffers(this.video.currentTime, this.video);
            for (const [start, end] of buffers) {
                if (max === undefined || max < end) {
                    max = end;
                    min = start;
                }
            }

            if (!max || this.video.currentTime + BUFFER_SIZE > max) {
                await addBuffer(max ?? this.video.currentTime);
            }

            this.bufferBars();
        }

        this.video.onseeking = this.video.onwaiting = sourceBuffer.onupdateend = this.video.ontimeupdate = requestData;
    }
}

window.addEventListener("load", async () => {
    window.customElements.define("video-player", Player);
}, {passive: true, once: true});