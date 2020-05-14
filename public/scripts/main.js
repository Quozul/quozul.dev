function link(url) {
    console.log(document.location.protocol + '//' + document.location.host + '/' + url);
    const main = document.getElementsByTagName('main')[0];

    request(document.location.protocol + '//' + document.location.host + '/' + url + '/view').then((res) => {
        window.history.pushState('', '', url);

        if (res.response.includes('<!--noAjax-->'))
            window.location.reload();

        main.innerHTML = res.response;

        handleDates();
    });

    const header = document.getElementsByTagName('header')[0];
    request(document.location.protocol + '//' + document.location.host + '/header?page=' + url.replace('/', '')).then((res) => {
        header.innerHTML = res.response;
        generateMenu();
    });
}

function discorvers() {
    const discovers = document.getElementsByClassName('page-current')[0].getElementsByClassName('discover');
    const elems = [];
    for (const key in discovers)
        if (discovers.hasOwnProperty(key)) {
            elems.push(discovers[key]);
        }

    elems.forEach((e, i) => {
        setTimeout(function () {
            e.classList.remove('discover');
        }, i * 50);
    });
}

function scroll(dir) {
    const cur = document.getElementsByClassName('page-current')[0];
    const stars = document.getElementsByClassName('stars')[0];

    const scroll = cur.firstElementChild.scrollTop + cur.firstElementChild.offsetHeight;

    // scroll down
    if (dir) {
        if (Math.abs(scroll - cur.firstElementChild.scrollHeight) > 1) return;
        const next = cur.nextElementSibling;
        if (next == undefined) return;

        next.classList.add('page-current');
        next.classList.remove('page-down');

        cur.classList.add('page-up');
    } else { // scroll up
        if (cur.firstElementChild.scrollTop != 0) return;
        const prev = cur.previousElementSibling;
        if (prev == undefined) return;

        prev.classList.add('page-current');
        cur.classList.add('page-down');

        cur.classList.remove('page-up');
    }

    cur.classList.remove('page-current');

    discorvers();

    document.getElementsByClassName('selected')[0].classList.remove('selected');
    const i = getChildNumber(document.getElementsByClassName('page-current')[0]);
    document.getElementsByClassName('menu-entry')[i].classList.add('selected');
}

document.addEventListener('wheel', function (e) {
    if (e.deltaY == 0) return;

    scroll(e.deltaY > 0);
});

function scrollto(button, id, select) {
    const cur = document.getElementsByClassName('page-current')[0];
    const element = document.getElementById(id);

    const dif = getChildNumber(cur) - getChildNumber(element);

    if (dif == 0) return;
    else if (dif > 0) {
        cur.classList.add('page-down');
        element.classList.remove('page-up');
    } else {
        cur.classList.add('page-up');
        element.classList.remove('page-down');
    }

    if (Math.abs(dif) > 1)
        for (let i = Math.min(getChildNumber(cur), getChildNumber(element)) + 1; i < Math.max(getChildNumber(cur), getChildNumber(element)); i++) {
            const e = document.getElementsByClassName('page')[i];
            if (dif > 0) {
                e.classList.add('page-down');
                e.classList.remove('page-up');
            } else {
                e.classList.add('page-up');
                e.classList.remove('page-down');
            }
        }


    cur.classList.remove('page-current');
    element.classList.add('page-current');

    document.getElementsByClassName('selected')[0].classList.remove('selected');
    if (select == undefined)
        button.classList.add('selected');
    else
        document.getElementById('menu').childNodes[getChildNumber(document.getElementsByClassName('page-current')[0])].classList.add('selected');

    discorvers();

    togglePhoneMenu();
}

function togglePhoneMenu() {
    const e = document.getElementById('menu');
    if (e.style.transform == 'translateY(0px)')
        e.style.transform = '';
    else
        e.style.transform = 'translateY(0px)';

    if (this.classList.contains('flip'))
        this.classList.remove('flip');
    else
        this.classList.add('flip');
};

const menuEntries = document.getElementById('menu').children;
for (const key in menuEntries)
    if (menuEntries.hasOwnProperty(key))
        menuEntries[key].addEventListener('click', function () {
            document.getElementById('menu').style.transform = '';
        });

// Phone scroll
(function () {
    let startTouchY;
    let previousTouchY;
    let touchYDiff;

    document.addEventListener('touchstart', function (e) {
        document.getElementsByClassName('page-current')[0].style.transition = '0s';
        startTouchY = e.changedTouches[0].pageY;
    }, false);

    document.addEventListener('touchmove', function (e) {
        const cur = document.getElementsByClassName('page-current')[0];
        const scroll = cur.firstElementChild.scrollTop + cur.firstElementChild.offsetHeight;

        const curTouchY = e.changedTouches[0].pageY;

        if (scroll != cur.firstElementChild.scrollHeight && cur.firstElementChild.scrollTop != 0)
            cur.style.transform = '';
        else
            cur.style.transform = `translateY(${curTouchY - startTouchY}px)`;

        if (previousTouchY != curTouchY) {
            touchYDiff = curTouchY - previousTouchY;
            previousTouchY = curTouchY;
        }

    }, false);

    document.addEventListener('touchend', function (e) {
        const cur = document.getElementsByClassName('page-current')[0];
        cur.style.transition = '';
        cur.style.transform = '';
        if (touchYDiff != 0)
            scroll(touchYDiff < 0);
        touchYDiff = 0;
    }, false);
})();

// window.addEventListener('mousemove', function (e) {
//     document.getElementsByClassName('stars')[0].style.transform = `translateX(${e.x / 100}px) translateY(${e.y / 100}px)`;
// });

// Generate menu
function generateMenu() {
    const pages = document.getElementsByClassName('page');
    const menu = document.getElementById('menu-sections');

    menu.innerHTML = '';

    for (const key in pages)
        if (pages.hasOwnProperty(key)) {
            const page = pages[key];
            const pageName = page.getAttribute('name');
            const pageId = page.getAttribute('id');

            const node = document.createElement('li');
            node.innerHTML = pageName;
            node.classList.add('menu-entry');
            node.setAttribute('onclick', `scrollto(this, '${pageId}')`);
            if (key == 0)
                node.classList.add('selected');
            menu.appendChild(node);
        }
}

function handleDates() {
    const dates = document.getElementsByClassName('date');
    for (const key in dates)
        if (dates.hasOwnProperty(key)) {
            const element = dates[key];
            element.innerHTML = new Date(parseInt(element.innerHTML)).toLocaleString();
        }
}

window.addEventListener('load', generateMenu);
window.addEventListener('load', handleDates);