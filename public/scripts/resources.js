function loggedIn(discord) {
    const loginButton = document.getElementById("loginButton");
    if (!discord) discord = JSON.parse(window.localStorage.getItem("discord"));

    loginButton.innerText = "Logged in as " + discord.username;
    loginButton.href = "";
    loginButton.title = "Log out";

    if (discord.avatar) {
        const avatarUrl = `https://cdn.discordapp.com/avatars/${discord.id}/${discord.avatar}.webp?size=64`
        const img = document.createElement("img");
        img.src = avatarUrl;
        img.alt = `${discord.username}'s avatar`;
        img.classList.add("me-1", "avatar");
        loginButton.prepend(img);
    }

    loginButton.addEventListener("click", () => {
        window.localStorage.removeItem("discord");
        loginButton.innerHTML = 'Login with Discord <img src="/public/assets/Discord-Logo-White.svg" class="ms-1 h-1" alt="Discord logo">'
    }, {passive: true, once: true});
}

function removeCodeFromUrl() {
    const url = new URL(window.location);
    url.searchParams.delete("code");
    window.history.pushState({}, document.title, url.toString());
}

window.addEventListener("load", async function () {
    const discord = JSON.parse(window.localStorage.getItem("discord"));

    // Initialize browser
    fileBrowser.init();
    /** @type {fileBrowser.FileBrowser} */
    const browser = document.querySelector("file-browser");
    browser.setCallbackUrl("/api/resources");

    if (discord) {
        if (discord.expiry * 1000 < Date.now()) {
            console.warn("Token has expired");
        } else {
            loggedIn();
            removeCodeFromUrl();

            browser.setAuthorization("Bearer " + discord.token);
            browser.setPath();
            return;
        }
    }

    browser.setPath();

    const code = new URLSearchParams(window.location.search).get("code");
    if (code !== null) {
        const loginButton = document.getElementById("loginButton");

        // Disable login button
        loginButton.classList.add("disable");

        // Add spinner
        const spinner = document.createElement("div");
        spinner.classList.add("spinner-border", "me-1");
        spinner.setAttribute("style", "height: 1em;width: 1em;");
        spinner.setAttribute("role", "status");

        const span_c = document.createElement("span");
        span_c.classList.add("visually-hidden");
        span_c.innerText = "Loading...";
        spinner.append(span_c);

        loginButton.prepend(spinner);

        // Login user and get a JWT
        fetch("/api/login", {method: "POST", body: code})
            .then(res => {
                console.log(res.status);
                if (200 > res.status || res.status >= 300) throw res;
                return res.json();
            })
            .then(json => {
                window.localStorage.setItem("discord", JSON.stringify(json));
                browser.setAuthorization("Bearer " + json.token);
                loggedIn(json);
                browser.setPath();
            })
            .catch(res => {
                console.log("error", res.status);
            })
            .finally(res => {
                spinner.remove();
                removeCodeFromUrl();
            });
    }
});