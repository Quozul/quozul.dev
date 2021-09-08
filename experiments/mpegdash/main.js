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

window.addEventListener("load", async () => {
    const video = document.createElement("video");
    video.controls = true;
    document.body.append(video);

    video.onloadeddata = video.onloadedmetadata = video.onprogress = video.onsuspend = video.onstalled = ev => console.log(ev.type);

    video.addEventListener("canplay", ev => {
        console.log(ev.type);
        // video.play();
    }, {passive: true});

    const url = `video.php`;

    const mediaSource = await initMediaStream(video);

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

    async function requestData() {
        if (!sourceBuffer.updating && (sourceBuffer.buffered.length === 0 || video.currentTime + BUFFER_SIZE >= sourceBuffer.buffered.end(0))) {
            let end = sourceBuffer.buffered.length > 0 ? sourceBuffer.buffered.end(0) : 0;
            let index = Math.ceil(end / segmentSize);
            if (video.currentTime > end) {
                end = video.currentTime;
                index = Math.floor(end / segmentSize);
            }
            console.log(end, index);
            const range = SegmentURL[index]["@attributes"]["mediaRange"];
            const buffer = await (await fetch(url, {
                headers: {
                    ["Range"]: range,
                }
            })).arrayBuffer();
            sourceBuffer.appendBuffer(buffer);
        }
    }

    video.onwaiting = ev => {
        if (video.buffered.length > 0 && video.buffered.start(0) < video.currentTime) {
            requestData();
        } /*else {
            if (sourceBuffer.buffered.length > 0) {
                sourceBuffer.abort();
                sourceBuffer.remove(sourceBuffer.buffered.start(0), sourceBuffer.buffered.end(0)); // Empty buffers
            }
        }*/
    }

    sourceBuffer.onupdateend = video.ontimeupdate = ev => {
        requestData();
    }

}, {passive: true, once: true});