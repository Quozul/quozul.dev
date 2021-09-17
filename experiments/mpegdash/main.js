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

class Player extends HTMLElement{
    constructor() {
        super();

        this.video = document.createElement("video");
        this.video.controls = true;
        this.append(this.video);

        this.video.oncanplay = this.video.play;
        this.initVideo("video.php");
    }

    async initVideo(url) {
        // Init media source
        const mediaSource = await initMediaStream(this.video);

        // Get metadata
        const mpd = await (await fetch(url, {
            headers: {}
        })).json();

        const {id, mime, codecs, width, height, framerate, bandwidth, duration, timescale, segments, init} = mpd[0];
        const segmentSize = duration / timescale;

        const fullMime = `${mime}; codecs="${codecs}"`;
        if (!MediaSource.isTypeSupported(fullMime)) {
            console.warn("Incompatible video type.");
            return;
        }
        const sourceBuffer = mediaSource.addSourceBuffer(fullMime);

        const initBuffer = await (await fetch(url, {
            headers: {
                ["Range"]: `${init[0]}-${init[1]}`,
            }
        })).arrayBuffer();
        sourceBuffer.appendBuffer(initBuffer);

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
            return `${segments[startIndex][0]}-${segments[endIndex][1]}`;
        }

        // Define if the player is currently fetching data
        let updating = false;

        async function addBuffer(seconds) {
            if (updating || sourceBuffer.updating) return;
            updating = true;
            const range = getRange(seconds);
            const response = await fetch(url, {
                headers: {
                    // TODO: Add authorization header here
                    ["Range"]: range,
                }
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
            const end = getBufferEnd(this.video.currentTime, this.video);
            if (this.video.currentTime + BUFFER_SIZE > end) await addBuffer(end);
            this.bufferBars();
        }

        this.video.onseeking = this.video.onwaiting = sourceBuffer.onupdateend = this.video.ontimeupdate = requestData;
    }
}

window.addEventListener("load", async () => {
    window.customElements.define("video-player", Player);
}, {passive: true, once: true});