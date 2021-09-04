window.addEventListener("load", async function () {
    fileBrowser.init();
    /**
     * @type {fileBrowser.FileBrowser}
     */
    const browser = document.querySelector("file-browser");
    const files = await (await fetch("/api/resources")).json();
    browser.setFiles(files[0].dir);
});