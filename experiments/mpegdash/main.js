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

    video.onloadeddata = video.onloadedmetadata = video.onprogress = video.oncanplay = video.onwaiting =
    video.onsuspend = video.onstalled = video.ontimeupdate = ev => console.log(ev.type);

    const url = `video.php`;

    const mediaSource = await initMediaStream(video);

    const mpd = await (await fetch(url, {
        headers: {}
    })).json();

    const {codecs, mimeType} = mpd["Period"]["AdaptationSet"]["Representation"]["@attributes"];
    const {Initialization, SegmentURL} = mpd["Period"]["AdaptationSet"]["Representation"]["SegmentList"];

    const sourceBuffer = mediaSource.addSourceBuffer(`${mimeType}; codecs="${codecs}"`);

    const initBuffer = await (await fetch(url, {
        headers: {
            ["Range"]: Initialization["@attributes"]["range"],
        }
    })).arrayBuffer();

    sourceBuffer.appendBuffer(initBuffer);
    await sleep(1000);

    for (const segment of SegmentURL) {
        const range = segment["@attributes"]["mediaRange"];
        const buffer = await (await fetch(url, {
            headers: {
                ["Range"]: range,
            }
        })).arrayBuffer();
        sourceBuffer.appendBuffer(buffer);
        await sleep(1000);
    }


}, {passive: true, once: true});