"use strict";

import { addPages } from "../../experiments/page_scroll/page"

function buildMainMenu() {
    /** @type {HTMLDivElement} */
    const menu = document.querySelector(".bubbles");
    /** @type {PageContainer} */
    const pageContainer = document.getElementById("menuReady");
    const pages = pageContainer.getPages();
    const selected = pageContainer.getSelectedIndex();

    for (let i = 0; i < pages.length; i++) {
        /** @type {PageSection} */
        const page = pages[i];

        if (page.getAttribute("data-hidden")) return;

        const node = document.createElement("div");
        node.innerText = page.getAttribute("data-name");
        node.classList.add("bubble");
        node.addEventListener("click", () => pageContainer.select(i));
        if (selected === i) node.classList.add("selected");
        menu.appendChild(node);
    }

    pageContainer.addEventListener("containerselect", function (e) {
        const i = pageContainer.getSelectedIndex();
        menu.querySelector(".selected")?.classList?.remove("selected");
        menu.children.item(i).classList.add("selected");
    });
}

function buildProjectMenu() {
    /** @type {HTMLDivElement} */
    const menu = document.querySelector("#subMenu > div");

    /** @type {PageContainer} */
    const pageContainer = document.getElementById("projectsContainer");
    const pages = pageContainer.getPages();
    const selected = pageContainer.getSelectedIndex();

    for (let i = 0; i < pages.length; i++) {
        /** @type {PageSection} */
        const page = pages[i];

        if (page.getAttribute("data-hidden")) return;

        const node = document.createElement("div");
        node.innerText = page.getAttribute("data-name");
        node.classList.add();
        node.addEventListener("click", () => pageContainer.select(i));
        if (selected === i) node.classList.add("selected");
        menu.appendChild(node);
    }

    pageContainer.addEventListener("containerselect", function (e) {
        const i = pageContainer.getSelectedIndex();
        menu.querySelector(".selected")?.classList?.remove("selected");
        const node = menu.children.item(i);
        node.classList.add("selected");
        menu.parentElement.scroll({behavior: "smooth", left: node.getBoundingClientRect().x});
    });
}

// Prevent right click
document.addEventListener("contextmenu", function (ev) {
    if (!(ev.target instanceof HTMLAnchorElement)) {
        ev.preventDefault();
    }
});

window.addEventListener("load", function () {
    addPages()
    buildMainMenu();
    buildProjectMenu();
}, {once: true});