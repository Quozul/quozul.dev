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

exports.format = Date.prototype.format;
exports.zeros = Number.prototype.zeros;