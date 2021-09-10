window.addEventListener("load", async function () {
    initFileBrowser();
    /**
     * @type {FileBrowser}
     */
    const browser = document.querySelector("file-browser");
    browser.setCallbackUrl("/api/resources");
    const discord = JSON.parse(window.localStorage.getItem("discord"));

    if (discord) {
        browser.setAuthorization("Bearer " + discord.token);
    }
    browser.setPath();
});