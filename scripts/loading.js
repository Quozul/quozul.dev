function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

function setAnimationTime(element) {
    element.style.animation = 'none';
    element.offsetHeight; /* trigger reflow */
    element.style.animation = null;

    const time = Math.floor(Math.random() * 1000 + 1000);
    element.style.setProperty('--animation-time', time + 'ms');

    element.style.setProperty('--start-color', element.style.getPropertyValue('--mid-color'));
    element.style.setProperty('--mid-color', getRandomColor());

    // If loading element have the animate class, then request next animation
    if (element.parentElement.classList.contains('animate')) {
        element.setAttribute('timeout', setTimeout(setAnimationTime, time, element));
    }
}

function clearTimeouts(loading) {
    const bars = loading.querySelectorAll('.bar');
    for (const bar of bars) {
        clearTimeout(bar.getAttribute('timeout'));
    }
}

function toggleLoading(id) {
    const load = document.getElementById(id);

    const isAnimated = load.classList.contains('animate');
    load.classList.toggle('animate');

    if (!isAnimated) {
        const bars = load.querySelectorAll('.bar');
        for (const bar of bars) {
            setAnimationTime(bar);
        }
    } else {
        clearTimeouts(load);
    }
}