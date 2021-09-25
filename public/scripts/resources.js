window.addEventListener("load", async function () {
    const discord = JSON.parse(window.localStorage.getItem("discord"));

    // Initialize browser
    initFileBrowser();
    /** @type {FileBrowser} */
    const browser = document.querySelector("file-browser");
    browser.setCallbackUrl(`/api/v1/resources`);

    document.addEventListener("loggedin", () => {
        const discord = JSON.parse(window.localStorage.getItem("discord"));

        browser.setAuthorization("Bearer " + discord.token);
        browser.setPath();
    }, {passive: true});

    document.addEventListener("loggedout", () => {
        browser.setAuthorization(null);
        browser.setPath();
    }, {passive: true});

});