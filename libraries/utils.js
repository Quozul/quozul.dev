Number.prototype.zeros = function (c) {
    return this.toString().padStart(c, '0');
}

Date.prototype.format = function (str) {
    return str.replace('%yyyy', this.getFullYear())
        .replace('%MM', (this.getMonth() + 1).zeros(2, '0'))
        .replace('%dd', this.getDate().zeros(2, '0'))
        .replace('%mm', this.getMinutes().zeros(2, '0'))
        .replace('%hh', this.getHours().zeros(2, '0'))
        .replace('%ss', this.getSeconds().zeros(2, '0'))
}

const fs = require('fs');
const prettyBytes = require('pretty-bytes');

function recursive_dir_scan(directory) {
    let files = [];

    fs.readdirSync(directory).forEach(file => {
        const path = directory + '/' + file;
        const stats = fs.statSync(path);
        if (stats.isDirectory())
            files = files.concat(recursive_dir_scan(path));
        else
            files.push({ path: directory, name: file, time: new Date(stats.mtime).getTime(), size: prettyBytes(stats.size) });
    });

    return files;
}

exports.format = Date.prototype.format;
exports.zeros = Number.prototype.zeros;
exports.recursive_dir_scan = recursive_dir_scan;