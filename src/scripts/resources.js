import { initFileBrowser } from "../../experiments/file_browser/scripts/browser.mjs";

window.addEventListener("load", async function () {
    // Initialize browser
    initFileBrowser();
    /** @type {FileBrowser} */
    const browser = document.querySelector("file-browser");
    browser.setApiUrl(`/api/v2`);

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