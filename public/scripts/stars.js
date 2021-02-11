// Star background
function generateStars(c, count) {
    let str = '';

    const width = this.innerWidth;
    const height = this.innerHeight;

    for (let i = 0; i < count; i++)
        str += Math.round(rangedRandom(0, width)) + 'px ' + Math.round(rangedRandom(0, height)) + 'px #FFF, ';

    str = str.slice(0, -2);
    str += ';';

    const div = document.createElement('div');
    div.style.cssText = '--shadows-small: ' + str;
    div.classList.add(c);

    return div;
}

async function allStars() {
    const width = this.innerWidth;
    const height = this.innerHeight;

    const surface = width * height / 1000;

    const div = document.createElement('div');
    div.classList.add('stars');

    div.append(generateStars('stars1', surface / 10 / this.devicePixelRatio));
    div.append(generateStars('stars2', surface / 20 / this.devicePixelRatio));
    div.append(generateStars('stars3', surface / 40 / this.devicePixelRatio));

    const stars = document.getElementsByClassName('stars');
    for (const star of stars) {
        star.outerHTML = '';
    }

    document.body.append(div);
}

//window.addEventListener('resize', allStars);
window.addEventListener('load', allStars);