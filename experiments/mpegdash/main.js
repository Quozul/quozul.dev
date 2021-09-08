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

        const video = document.createElement("video");
        video.controls = true;
        this.append(video);

        // video.onloadeddata = video.onloadedmetadata = video.onprogress = video.onsuspend = video.onstalled = ev => console.log(ev.type);

        video.addEventListener("canplay", ev => {
            console.log(ev.type);
            // video.play();
        }, {passive: true});

        this.initVideo(video);
    }

    async initVideo(video) {
        const url = `video.php`;

        // Init media source
        const mediaSource = await initMediaStream(video);

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

        function isBuffered(seconds, sourceBuffer) {
            const length = sourceBuffer.buffered.length;
            for (let i = 0; i < length; i++) {
                if (sourceBuffer.buffered.start(i) <= seconds && seconds <= sourceBuffer.buffered.end(i)) {
                    return true;
                }
            }
            return false;
        }

        function getSegmentIndex(seconds) {
            return Math.floor(seconds / segmentSize);
        }

        function addBuffer(index) {
            return new Promise(async resolve => {
                const range = SegmentURL[index]["@attributes"]["mediaRange"];
                const buffer = await (await fetch(url, {
                    headers: {
                        ["Range"]: range,
                    }
                })).arrayBuffer();
                sourceBuffer.appendBuffer(buffer);
                sourceBuffer.addEventListener("updateend", resolve, {passive: true, once: true});
            });
        }

        async function requestData() {
            if (sourceBuffer.updating) return;

            const bufferIndex = getBufferIndex(video.currentTime, sourceBuffer);
            const segmentIndex = getSegmentIndex(video.currentTime);
            let index = 0;

            if (bufferIndex !== undefined) {
                index = getSegmentIndex(sourceBuffer.buffered.end(bufferIndex)) + 1;
                console.log(bufferIndex, sourceBuffer.buffered.start(bufferIndex), video.currentTime, sourceBuffer.buffered.end(bufferIndex))
            } else {
                index = segmentIndex;
            }

            if (!isBuffered(index * segmentSize, sourceBuffer) && video.currentTime + BUFFER_SIZE > index * segmentSize) {
                await addBuffer(index);
                // console.log(index, index * segmentSize, video.currentTime, (index + 1) * segmentSize);
            }
        }

        video.onwaiting = sourceBuffer.onupdateend = video.ontimeupdate = ev => {
            requestData();
        }
    }
}

window.addEventListener("load", async () => {
    window.customElements.define("video-player", Player);
}, {passive: true, once: true});