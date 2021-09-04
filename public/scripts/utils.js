/**
 * Get a random number in a specified range of values
 * @param {int} min Lower value
 * @param {int} max Upper value
 */
function rangedRandom(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Downloads a blob with a given filename
 * @param {string} filename
 * @param {Blob} blob Blob to download as a file
 */
function download(filename, blob) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
}

/**
 * Converts bytes into human-readable size
 * @param fileSizeInBytes
 * @returns {string}
 */
function getReadableFileSizeString(fileSizeInBytes) {
    let i = -1;
    const byteUnits = [' kB', ' MB', ' GB', ' TB', 'PB', 'EB', 'ZB', 'YB'];
    do {
        fileSizeInBytes = fileSizeInBytes / 1024;
        i++;
    } while (fileSizeInBytes > 1024);

    return Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[i];
}