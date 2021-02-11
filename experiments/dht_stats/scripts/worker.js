postMessage(['Thread started...', 12]);
importScripts('/scripts/utils.min.js');

onmessage = function (message) {
    const file = message.data;

    let charsReceived = 0;
    let result = '';
    const reader = file.stream().getReader();

    reader.read()
        .then(function processText({ done, value }) {
            if (done)
                return result;

            charsReceived += value.length;
            postMessage(['progress', 'Loading file...', charsReceived / file.size * 10 + 1]);

            for (const v of value)
                result += String.fromCharCode(v);

            // Read some more, and call this function again
            return reader.read().then(processText);
        })
        .then((content) => {

            try {
                postMessage(['progress', 'Verifying & parsing file...', 13]);
                const rawData = JSON.parse(content);

                postMessage(['progress', 'Preparing variables...', 14]);

                const meta = rawData.meta;
                const data = rawData.data;

                stats = {
                    hours: {}, // Messages sent by hour and minutes
                    days: {}, // Messages sent by days
                    channels: {}, // Messages sent by channels
                };

                for (let hour = 0; hour < 24; hour++)
                    for (let minutes = 0; minutes < 60; minutes++)
                        stats.hours[hour.padZeros(2) + ':' + minutes.padZeros(2)] = 0

                postMessage(['progress', 'Analysing file...', 15]);

                objectLoop(data, (channel, index, key, keys) => {
                    const channelName = meta.channels[key].name;
                    objectLoop(channel, (message, index, id) => {
                        const date = new Date(message.t);
                        const day = date.format('%yyyy-%MM-%dd');

                        stats.hours[date.format('%hh:%mm')]++;
                        if (stats.days[day] == undefined) stats.days[day] = 0;
                        stats.days[day]++;

                        if (stats.channels[channelName] == undefined) stats.channels[channelName] = 0;
                        stats.channels[channelName]++;
                    });

                    postMessage(['progress', 'Analysing file...', 15 + index / keys.length * (100 - 25)]);
                });

                postMessage(['progress', 'Creating charts...', 85]);
                postMessage(['chart', 'messages-per-hour', stats.hours]);
                postMessage(['chart', 'messages-per-day', stats.days.sortByKey()]);
                postMessage(['chart', 'messages-per-channel', stats.channels.sortByValue().reverse(), 'horizontalBar']);
                postMessage(['progress', 'Done!', 100]);
                postMessage(['done']);
            } catch (error) {
                console.log(error);
                postMessage(['progress', 'File is not in the right format!', 100, true]);
            }
        });
}