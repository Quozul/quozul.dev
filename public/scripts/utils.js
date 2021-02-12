/**
 * Get the position of the element in its parent
 * @param {HTMLElement} node
 */

function getChildNumber(node) {
    return Array.prototype.indexOf.call(node.parentNode.children, node);
}

/**
 * Get a random number in a specified range of values
 * @param {int} min Lower value
 * @param {int} max Upper value
 */
function rangedRandom(min, max) {
    return Math.random() * (max - min) + min;
}

/**
 * Execute a document without getting its content, returns a Promise
 * @param {string} url String containing the url
 * @param {string} query String containing the query parameters
 */
function request(url, query = '') {
    return new Promise(function (resolve, reject) {
        let req = new XMLHttpRequest();
        req.onreadystatechange = function () {
            if (req.readyState == 4)
                if (req.status == 200)
                    resolve(req);
                else
                    reject(req);
        }

        req.open('get', url, true);
        req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        req.send(query);
    });
}

/**
 * Makes the first character of a given string to uppercase
 * @param {string} str 
 */
function firstToUpper(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Converts bytes into human-readable size
 * @param fileSizeInBytes
 * @returns {string}
 */
function getReadableFileSizeString(fileSizeInBytes) {
    var i = -1;
    var byteUnits = [' kB', ' MB', ' GB', ' TB', 'PB', 'EB', 'ZB', 'YB'];
    do {
        fileSizeInBytes = fileSizeInBytes / 1024;
        i++;
    } while (fileSizeInBytes > 1024);

    return Math.max(fileSizeInBytes, 0.1).toFixed(1) + byteUnits[i];
};