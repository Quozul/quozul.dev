/**
 * @typedef Discord
 * @property {string} id
 * @property {string} username
 * @property {string} avatar
 * @property {string} discriminator
 * @property {number} public_flags
 * @property {number} flags
 * @property {string} banner_color
 * @property {number} accent_color
 * @property {string} locale
 * @property {boolean} mfa_enabled
 * @property {number} premium_type
 * @property {string} token
 * @property {number} expiry
 */

function loggedIn(discord) {
    const loginButton = document.getElementById("loginButton");
    /** @type {Discord} */
    if (!discord) discord = JSON.parse(window.localStorage.getItem("discord"));

    loginButton.innerText = "Logged in as " + discord.username;
    loginButton.removeAttribute("href");
    loginButton.classList.add("logged-in");

    if (discord.avatar) {
        const avatarUrl = `https://cdn.discordapp.com/avatars/${discord.id}/${discord.avatar}.webp?size=64`
        const img = document.createElement("img");
        img.src = avatarUrl;
        img.alt = `${discord.username}'s avatar`;
        img.classList.add("me-1", "avatar");
        loginButton.prepend(img);
    }
}

function removeCodeFromUrl() {
    const url = new URL(window.location);
    url.searchParams.delete("code");
    window.history.pushState({}, document.title, url.toString());
}

window.addEventListener("load", () => {
    /** @type {Discord} */
    const discord = JSON.parse(window.localStorage.getItem("discord"));
    const loggedin = new Event("loggedin");
    const loggedout = new Event("loggedout");

    // Log out
    const loginButton = document.getElementById("loginButton");
    document.querySelector("#logoutButton").addEventListener("click", () => {
        window.localStorage.removeItem("discord");
        loginButton.innerHTML = '<img src="/public/assets/Discord-Logo-White.svg" class="me-1 h-1" alt="Discord logo"> Login with Discord'
        loginButton.href = `https://discord.com/oauth2/authorize?client_id=883631190232399872&redirect_uri=${encodeURIComponent(window.location.origin + window.location.pathname)}&response_type=code&scope=identify`;
        loginButton.classList.remove("logged-in");
        document.dispatchEvent(loggedout);
    }, {passive: true});

    if (discord) {
        if (discord.expiry * 1000 < Date.now()) {
            console.warn("Token has expired");
            document.dispatchEvent(loggedout);
        } else {
            loggedIn();
            document.dispatchEvent(loggedin);
            removeCodeFromUrl();
            return;
        }
    } else {
        document.dispatchEvent(loggedout);
    }

    const code = new URLSearchParams(window.location.search).get("code");
    if (code !== null) {
        const loginButton = document.getElementById("loginButton");

        // Disable login button
        loginButton.classList.add("disable");

        // Add spinner
        const spinner = createSpinner();
        spinner.classList.add("spinner-border-sm", "h-1", "w-1");
        loginButton.prepend(spinner);

        // Login user and get a JWT
        fetch(`/api/v1/login`, {
            method: "POST",
            body: JSON.stringify({code: code, redirectUri: window.location.origin + window.location.pathname})
        })
            .then(res => {
                if (200 > res.status || res.status >= 300) throw res;
                return res.json();
            })
            .then(json => {
                window.localStorage.setItem("discord", JSON.stringify(json));
                loggedIn(json);
                document.dispatchEvent(loggedin);
            })
            .catch(res => {
                console.log("error", res.status);
                document.dispatchEvent(loggedout);
            })
            .finally(res => {
                spinner.remove();
                removeCodeFromUrl();
            });
    } else {
        document.dispatchEvent(loggedout);
    }
});