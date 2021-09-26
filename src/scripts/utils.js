/**
 * Get a random number in a specified range of values
 * @param {int} min Lower value
 * @param {int} max Upper value
 */
export function rangedRandom(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Downloads a blob with a given filename
 * @param {string} filename
 * @param {Blob} blob Blob to download as a file
 */
export function download(filename, blob) {
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
export function getReadableFileSizeString(fileSizeInBytes) {
    let i = -1;
    const byteUnits = [' kB', ' MB', ' GB', ' TB', 'PB', 'EB', 'ZB', 'YB'];
    do {
        fileSizeInBytes = fileSizeInBytes / 1024;
        i++;
    } while (fileSizeInBytes > 1024);

    return Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[i];
}

/**
 * Format a date to given format
 * @param {string} format
 * @returns
 */
Date.prototype.format = function (format) {
    const associations = {
        "%yyyy": "getFullYear",
        "%dd": "getDate",
        "%hh": "getHours",
        "%mmmm": "getMilliseconds",
        "%mm": "getMinutes",
        "%MM": "getMonth",
        "%ss": "getSeconds"
    }

    for (const match of format.match(/(?<!%)%(?!%)(\w*)/g)) {
        let value = this[associations[match]]?.call(this);
        format = format.replace(match, (match === "%MM" ? ++value : value)?.toString().padStart(match.length - 1, '0') ?? match);
    }

    return format;
}

/**
 * Toggle class with a delay
 * TODO: Optimize this function
 * @param {Element[]} elements
 * @param {string} classToToggle
 * @param {number} delay Delay between class adding
 * @param {?number} end End callback
 * @param {?number} finalDelay Final delay, usually the transition's delay if any
 */
export function toggleAnimation(elements, classToToggle, delay = 1000, end = null, finalDelay = null) {
    if (elements.length === 0) {
        if (end) {
            setTimeout(() => end(), finalDelay ?? delay);
        }
        return;
    }
    const element = elements.shift();
    setTimeout(() => {
        element.classList.toggle(classToToggle);
        toggleAnimation(elements, classToToggle, delay, end, finalDelay)
    }, delay);
}

export function createSpinner() {
    const container = document.createElement("div");
    container.classList.add("w-100", "h-100", "d-flex", "justify-content-center", "align-items-center", "p-5");

    const spinner = document.createElement("span");
    spinner.classList.add("spinner-border");
    spinner.setAttribute("role", "status");
    spinner.style.width = "3em";
    spinner.style.height = "3em";

    const span = document.createElement("span");
    span.classList.add("visually-hidden");
    span.innerText = "Loading...";
    spinner.append(span);

    container.append(spinner);

    return container;
}