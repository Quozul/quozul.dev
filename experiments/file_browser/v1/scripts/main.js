window.addEventListener("load", async function () {
    initFileBrowser();
    /**
     * @type {FileBrowser}
     */
    const browser = document.querySelector("file-browser");
    browser.setCallbackUrl("/api/resources");
    browser.setPath();
});