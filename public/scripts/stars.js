// Star background
function generateStars(c, count) {
    let str = '';

    const width = this.innerWidth;
    const height = this.innerHeight;

    for (let i = 0; i < count; i++)
        str += Math.round(rangedRandom(0, width)) + 'px ' + Math.round(rangedRandom(0, height)) + 'px #FFF, ';

    str = str.slice(0, -2);
    str += ';';

    document.getElementsByClassName(c)[0].style.cssText = '--shadows-small: ' + str;
}

function allStars() {
    const width = this.innerWidth;
    const height = this.innerHeight;

    const surface = width * height / 1000;

    generateStars('stars1', surface / 10 / this.devicePixelRatio);
    generateStars('stars2', surface / 20 / this.devicePixelRatio);
    generateStars('stars3', surface / 40 / this.devicePixelRatio);
}

window.addEventListener('resize', allStars);
window.addEventListener('load', allStars);