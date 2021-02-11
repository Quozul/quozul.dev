function s2ab(s) {
    var buf = new ArrayBuffer(s.length); //convert s to arrayBuffer
    var view = new Uint8Array(buf);  //create uint8array as viewer
    for (var i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF; //convert to octet
    return buf;
}

function download(data, filename, type) {
    const file = new Blob([data], {type: type, encoding:"UTF-8"});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else { // Others
        const a = document.createElement("a"),
            url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function () {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 0);
    }
}

/**
 * Build a select element with the given options
 * @param {Array<object>} options
 * @return {HTMLSelectElement}
 */
function buildSelect(options) {
    const select = document.createElement('select');

    options.forEach((data) => {
        const option = document.createElement('option');
        option.value = data?.value || '';
        option.id = data?.id || '';
        option.innerText = data?.text || '';

        select.append(option);
    });

    return select;
}

function workerPromise(filename, data) {
    return new Promise((resolve, reject) => {
        const worker = new Worker(filename);
        worker.postMessage(data);

        worker.onmessage = (msg) => {
            resolve(msg.data);
            worker.terminate();
        };
        worker.onerror = () => reject;
    });
}

function avg (v) {
    return v.reduce((a,b) => a+b, 0)/v.length;
}

function smoothOut (vector, variance) {
    var t_avg = avg(vector)*variance;
    var ret = Array(vector.length);
    for (var i = 0; i < vector.length; i++) {
        (function () {
            var prev = i>0 ? ret[i-1] : vector[i];
            var next = i<vector.length ? vector[i] : vector[i-1];
            ret[i] = avg([t_avg, avg([prev, vector[i], next])]);
        })();
    }
    return ret;
}