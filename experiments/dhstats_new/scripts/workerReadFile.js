onmessage = function (message) {
    const file = message.data;

    const reader = new FileReader();
    reader.readAsText(file);

    reader.onloadend = function(e) {
        postMessage(e.target.result);
    }
}