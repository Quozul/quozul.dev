window.addEventListener("load", async function () {
    fileBrowser.init();
    /**
     * @type {fileBrowser.FileBrowser}
     */
    const browser = document.querySelector("file-browser");
    browser.setCallbackUrl("/api/resources");
    browser.setPath();
});