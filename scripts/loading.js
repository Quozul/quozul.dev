function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

const bars = document.querySelectorAll('.bar');
for (const bar of bars) {
    setAnimationTime(bar);
}

function setAnimationTime(element) {
    element.style.animation = 'none';
    element.offsetHeight; /* trigger reflow */
    element.style.animation = null;

    const time = Math.floor(Math.random() * 1000 + 1000);
    element.style.setProperty('--animation-time', time + 'ms');

    element.style.setProperty('--start-color', element.style.getPropertyValue('--mid-color'));
    element.style.setProperty('--mid-color', getRandomColor());
    setTimeout(setAnimationTime, time, element);
}