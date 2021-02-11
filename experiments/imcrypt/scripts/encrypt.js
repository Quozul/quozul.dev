importScripts('/scripts/utils.min.js');

onmessage = function (message) {
    const file = message.data;

    let charsReceived = 0;
    let result = [];
    const reader = file.stream().getReader();

    reader.read()
        .then(function processText({ done, value }) {
            if (done)
                return result;

            charsReceived += value.length;
            postMessage(['progress', 'Loading file...', charsReceived / file.size * 100]);

            result = result.concat(Array.from(value));

            // Read some more, and call this function again
            return reader.read().then(processText);
        })
        .then((data) => {
            const color = (Math.ceil(data.length / 3));
            const side = Math.ceil(Math.sqrt(color));

            const content = new Uint8ClampedArray(Math.pow(side, 2) * 4);

            for (let i = 0; i < data.length; i++) {
                const j = i + Math.floor(i / 3);
                content[j] = data[i] != undefined ? data[i] : 0;
            }

            for (let i = 0; i < content.length; i++)
                if (i % 4 == 3) content[i] = 255;

            const imageData = new ImageData(content, side, side);

            postMessage(['done', imageData]);
        });
}