import {initFileBrowser} from "./browser.mjs";

window.addEventListener("load", async function () {
    initFileBrowser();
    /**
     * @type {FileBrowser}
     */
    const browser = document.querySelector("file-browser");
    browser.setApiUrl(`/api/v1`);
    const discord = JSON.parse(window.localStorage.getItem("discord"));

    if (discord) {
        browser.setAuthorization("Bearer " + discord.token);
    }
    browser.setPath();
});