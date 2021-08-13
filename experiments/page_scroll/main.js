/**
 * Build the example's menu
 */
function buildMenu() {
    /** @type {HTMLUListElement} */
    const menu = document.getElementById("menu");
    /** @type {PageContainer} */
    const pageContainer = document.getElementById("menuReady");
    const pages = pageContainer.getPages();

    const selected = pageContainer.getSelectedIndex();

    for (let i = 0; i < pages.length; i++) {
        /** @type {PageSection} */
        const page = pages[i];

        if (page.getAttribute("data-hidden")) return;
        const li = document.createElement("li");
        li.innerText = page.getAttribute("data-name");
        li.addEventListener("click", function (ev) {
            pageContainer.select(i);
        });

        if (i === selected) {
            li.classList.add("selected");
        }

        menu.append(li);
    }

    pageContainer.addEventListener("containerselect", function (e) {
        const i = pageContainer.getSelectedIndex();
        menu.querySelector(".selected")?.classList?.remove("selected");
        menu.children.item(i).classList.add("selected");
    });
}