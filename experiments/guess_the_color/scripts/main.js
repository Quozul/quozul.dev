let color;
let dif = 255;
let guess_timer;
let win_timer;
let g_anim;
let won = false;
let clicks = 0;
let wins = 0;
let last_color;
let clicked_colors = [];

// $ function from jquery remake
const $ = s => {
    let f = s.slice(0, 1);
    if (f == '#' || f == '.')
        s = s.slice(1, s.length);

    switch (f) {
        case '#': return document.getElementById(s);
        case '.': return document.getElementsByClassName(s);
        default: return document.getElementsByTagName(s);
    }
}

const win_sound = new Audio('assets/win.mp3');
const wrong_sound = new Audio('assets/wrong.mp3');

const circles = $('.color-circle');
const cookie_name = 'gtcgame';

const win_msg = ['Well done!', 'Good job!', 'So smart!'];
const encouraging = ['Don\'t give up.', 'Never give up.', 'You can do it.'];

// random in a range
const rand = (l = 0, u = 1) => Math.random() * u + l;
const rgbToHex = (r, g, b) => "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);

// random color generator
function random_color(base, dif) {
    let min_dif = dif / 2;
    let max_dif = dif;

    let c = [];

    base.forEach((v, i) => {
        let x = rand(-min_dif, max_dif);
        x = Math.floor(255 - x < 0 ? 255 + (255 - x) : x);

        c[i] = Math.min(Math.max(v + x, 0), 255);
    });

    return c;
}

// deep comparison of 2 arrays
function deep_compare(a, base) {
    for (var i = 0; i < a.length; i++)
        if (a[i] != base[i])
            return false;
    return true;
}

function randomize_colors() {
    color = [Math.floor(rand(0, 255)), Math.floor(rand(0, 255)), Math.floor(rand(0, 255))];
    let circle = Math.floor(rand(0, 5));

    for (index in circles)
        if (circles.hasOwnProperty(index)) {
            const element = circles[index];

            if (index == circle)
                element.style.backgroundColor = `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
            else {
                let new_color;
                do {
                    new_color = random_color(color, dif);

                    element.style.backgroundColor = `rgb(${new_color[0]}, ${new_color[1]}, ${new_color[2]})`;
                } while (deep_compare(new_color, color));
            }
        }

    $('#color-code').innerHTML = `(<span class="red">${color[0]}</span>, <span class="green">${color[1]}</span>, <span class="blue">${color[2]}</span>)`;
}

function verify_color() {
    if (won || clicked_colors.includes(this)) return

    clicks++;
    const g = $('#guess');

    if (deep_compare(this.style.backgroundColor.slice(4, -1).split(', '), color)) {
        g.innerHTML = win_msg[Math.floor(rand(0, win_msg.length))];

        full_anim();
        win_sound.play();

        won = true;
        wins++;

        // save last color hex code
        last_color = rgbToHex(color[0], color[1], color[2]);
        let n_match = ntc.name(last_color);
        console.log(n_match);

        let lc = $('#last-color');
        lc.style.opacity = '0'; // create smooth transition between color names

        // display last color name according to ntc library
        setTimeout(() => {
            lc.style.opacity = '1';
            lc.innerHTML =
                `<b>That was the color:</b>
                <span id="copy-color" class="gtc-tooltip" onclick="copy_color_code();">
                    <span id="copy-tooltip" class="gtc-tooltip toggle-tooltip gtc-tooltip-clickable"><span class="gtc-tooltip-text">Copy color code</span>
                        ${n_match[1]} ${!n_match[2] ? '<h6>(approx.)</h6>' : ''}
                </span><span id="copied" class="gtc-tooltip-text">Copied!</span></span>`;
        }, 200);

        if (win_timer != undefined) clearTimeout(win_timer);

        // wait 1s until the animation ends and randomize colors
        dif = Math.max(dif - 1, 8);
        win_timer = setTimeout(() => {
            randomize_colors();
            $('#difficulty').innerHTML = 255 - dif;
            won = false;

            clicked_colors.forEach((circle) => circle.style.transform = '');
            clicked_colors = [];
        }, 1000);
    } else {
        text_anim();
        wrong_sound.play();
        g.innerHTML = encouraging[Math.floor(rand(0, encouraging.length))];
        clicked_colors.push(this);
        this.style.backgroundColor = '#777';
        this.style.transform = 'scale(.75)';
    }

    $('#win-rate').innerHTML = Math.round(wins / clicks * 100);

    // resets text after 1s
    if (guess_timer != undefined) clearTimeout(guess_timer);
    guess_timer = setTimeout(() => g.innerHTML = 'Guess the color', 1000);

    update_cookie();
    update_gameinfo();
}

// cheat functions
function log_colors() {
    for (index in circles)
        if (circles.hasOwnProperty(index))
            console.log(parseInt(index) + 1, circles[index].style.backgroundColor);
}

function log_answers() {
    for (index in circles)
        if (circles.hasOwnProperty(index))
            if (deep_compare(circles[index].style.backgroundColor.slice(4, -1).split(', '), color))
                console.log(parseInt(index) + 1);
}

// animation functions
function text_anim() {
    if (g_anim != undefined)
        clearTimeout(g_anim);

    $('#guess').style.transform = 'scale(1.1)';
    g_anim = setTimeout(() => $('#guess').style.transform = '', 1000);
}

function full_anim() {
    for (index in circles)
        if (circles.hasOwnProperty(index)) {
            const element = circles[index];
            setTimeout(() => {
                element.style.borderRadius = '16px';
                setTimeout(() => element.style.borderRadius = '', 200);
            }, index * 200);
        }

    text_anim();
}

function update_gameinfo() {
    if (document.cookie == '') return;
    // load cookie
    let cookie = JSON.parse(document.cookie.replace(/(?:(?:^|.*;\s*)gtcgame\s*\=\s*([^;]*).*$)|^.*$/, '$1'));

    wins = cookie.wins || 0;
    clicks = cookie.clicks || 0;
    dif = cookie.dif || 255;

    $('#difficulty').innerHTML = 255 - dif;
    $('#win-rate').innerHTML =
        `<span class="gtc-tooltip toggle-tooltip">
            <span class="gtc-tooltip-text">${wins} / ${clicks} ${clicks > 1 ? 'tries' : 'try'}</span>
        ${Math.round(wins / clicks * 100) || '??'}%</span>`;
}

function update_cookie() {
    document.cookie = `${cookie_name}=${JSON.stringify({ dif: dif, clicks: clicks, wins: wins })}; expires=Fri, 31 Dec 9999 23:59:59 GMT`;
}

function copy_color_code() {
    navigator.clipboard.writeText(last_color).then(() =>
        // display copied tooltip and hides it after 2s
        toggle_tooltip($('#copied'), $('#copy-tooltip')), (err) =>
        console.error('Couldn\'t copy to clipboard: ', err)
    );
}

function toggle_tooltip(t1, t2 = undefined) {
    let t2_toogleable = false;
    if (t2 != undefined && t2.classList.contains('toggle-tooltip') || t1.style.opacity != 0)
        t2_toogleable = true;

    t1.style.opacity = 1;
    t1.style.transform = 'scale(1)';

    if (t2_toogleable)
        t2.classList.remove('toggle-tooltip');

    t1.parentNode.onmouseleave = () => {
        t1.style.opacity = 0;
        t1.style.transform = 'scale(0)';

        console.log(t2_toogleable);
        if (t2_toogleable) {
            t2.classList.add('toggle-tooltip');
        }
    }
}

// add event listeners
function init() {
    // on reset
    $('#reset-arrow').onclick = () => {
        dif = 255;
        clicks = 0;
        wins = 0;

        toggle_tooltip($('#reseted'), $('#reset'));

        clicked_colors.forEach((circle) => circle.style.transform = '');
        clicked_colors = [];

        update_cookie();
        update_gameinfo();
        randomize_colors();
    }

    // click on the circle to toggle verification
    document.body.onload = randomize_colors;
    $('#difficulty').innerHTML = 255 - dif;
    for (index in circles)
        if (circles.hasOwnProperty(index))
            circles[index].onclick = verify_color;

    // press a number between 1-5 to toggle verification
    document.addEventListener('keydown', (event) => {
        if (event.repeat) return;
        let circle = circles[parseInt(event.key) - 1];
        if (circle != undefined)
            circle.click();
    });

    $('#js-enabled').style.display = 'block';

    update_gameinfo();
}