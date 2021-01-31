importScripts('/scripts/utils.min.js');

onmessage = function (message) {
    const imageData = message.data.data;

    let data = '';

    for (let i = 0; i < imageData.length; i++) {
        if (i % 4 != 3)
            data += String.fromCharCode(imageData[i]);

        if (i % 100 == 0)
            postMessage(['progress', 'Processing file...', i / imageData.length * 50 + 50]);
    }

    postMessage(['done', data]);
}