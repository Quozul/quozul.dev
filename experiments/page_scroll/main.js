/**
 * @param {HTMLElement} target
 * @returns {PageContainer|null} Returns the first parent PageContainer of the given target
 */
function getPageContainer(target) {
    let element = target;
    do {
        element = element.parentElement;
    } while (!(element instanceof PageContainer || element === null));
    return element;
}

class PageContainer extends HTMLElement {
    constructor() {
        // Always call super first in constructor
        super();

        // Write element functionality in here
        this.style.width = this.getAttribute("width");
        this.style.height = this.getAttribute("height");
        this.direction = this.getAttribute("direction") === "horizontal";

        this.pages = this.querySelectorAll(":scope > page-section");

        // Prevent changing page if element is already transitioning
        // You should create a menu if you want to switch page more quickly
        this.transitioning = false;

        const selectedSection = window.location.hash.substr(1);
        if (selectedSection) {
            const toSelect = this.querySelector(`:scope > [data-name=${selectedSection}]`);
            if (toSelect) {
                this.select(Array.prototype.indexOf.call(this.children, toSelect));
            } else {
                this.select(0);
            }
        } else {
            this.select(0);
        }

        this.addEventListener("wheel", function (ev) {
            if (this.transitioning || ev.deltaY === 0 /* If horizontal scroll, then Y is 0 */) {
                ev.stopPropagation();
                return;
            }

            /** @type {PageSection} */
            const currentlySelected = this.querySelector(":scope > .page-current");
            let nextSelected;

            if (ev.deltaY > 0) {
                // Scroll down
                nextSelected = currentlySelected.nextElementSibling;
            } else {
                // Scroll up
                nextSelected = currentlySelected.previousElementSibling;
            }

            if (nextSelected) {
                nextSelected.select();
                ev.stopPropagation();
            }
        }, {passive: true});

        let startTouchY, contentScroll = 0;
        this.addEventListener("touchstart", function (ev) {
            /** @type {PageSection} */
            const currentlySelected = this.querySelector(":scope > .page-current");
            contentScroll = currentlySelected.scrollTop;

            startTouchY = ev.changedTouches[0].pageY;
        }, {passive: true});

        /*this.addEventListener("touchmove", function (ev) {
            const curTouchY = ev.changedTouches[0].pageY;
            // TODO: Do animation when the section is ready to scroll
        }, {passive: true});*/

        this.addEventListener("touchend", function (ev) {
            if (this.transitioning) {
                ev.stopPropagation();
                return;
            }

            const containerTarget = getPageContainer(ev.target);
            const curTouchY = ev.changedTouches[0].pageY;

            /** @type {PageSection} */
            const currentlySelected = this.querySelector(":scope > .page-current");

            const {offsetHeight, scrollTop, scrollHeight} = currentlySelected;

            if (containerTarget !== this) {
                const selected = containerTarget.getSelected();
                if (selected !== 0 && curTouchY > startTouchY) {
                    // Can't scroll up
                    return;
                } else if (selected !== containerTarget.pages.length - 1 && curTouchY < startTouchY) {
                    // Can't scroll down
                    return;
                }
            }

            if (contentScroll !== scrollTop) return;

            let nextSelected;
            if (curTouchY < startTouchY) {
                // Scroll down
                nextSelected = currentlySelected.nextElementSibling;
            } else if (curTouchY > startTouchY) {
                // Scroll up
                nextSelected = currentlySelected.previousElementSibling;
            } // If the touch hasn't moved, do nothing

            if (nextSelected) {
                nextSelected.select();
                ev.stopPropagation();
            }
        }, {passive: true});
    }

    /**
     * Select the page with the given child index
     * /!\ Slow!
     * @param childIndex
     */
    select(childIndex) {
        /** @type {NodeListOf<PageSection>} */
        const sections = this.pages;

        for (let i = 0; i < sections.length; i++) {
            const section = sections[i];
            section.classList.remove("page-up", "page-down", "page-current", "page-left", "page-right");

            if (i < childIndex) {
                section.classList.add(this.direction ? "page-left" : "page-up");
            } else if (i > childIndex) {
                section.classList.add(this.direction ? "page-right" : "page-down");
            } else {
                section.classList.add("page-current");
            }
        }

        this.dispatchEvent(PageContainer.containerSelect);
    }

    /**
     * Returns the index of the selected page
     * @returns {number}
     */
    getSelected() {
        const selected = this.querySelector(":scope > .page-current");
        return Array.prototype.indexOf.call(this.children, selected);
    }

    /**
     * Returns all the pages of the container
     * @returns {NodeListOf<PageSection>}
     */
    getPages() {
        return this.pages;
    }

    /**
     * Event fired when the container changes page
     * @type {Event}
     */
    static containerSelect = new Event("containerselect");
}

class PageSection extends HTMLElement {
    constructor() {
        // Always call super first in constructor
        super();

        // Write element functionality in here
        /** @type {PageContainer} */
        this.parent = this.parentElement;
        if (!this.parentElement instanceof PageContainer) {
            console.error("PageSection is not in the right container");
        }

        this.position = Array.prototype.indexOf.call(this.parent.children, this);

        this.transitioning = false;
        this.addEventListener("transitionstart", ev => this.parent.transitioning = this.transitioning = true);
        this.addEventListener("transitionend", ev => this.parent.transitioning = this.transitioning = false);
    }

    /**
     * Selects this section
     */
    forceSelect() {
        this.classList.remove("page-down", "page-up", "page-left", "page-right");
        this.classList.add("page-current");
        this.parent.dispatchEvent(PageContainer.containerSelect);
    }

    /**
     * Verify if this section can be selected and then select
     */
    select() {
        /** @type {PageSection} */
        const currentlySelected = this.parent.querySelector(":scope > .page-current");

        if (currentlySelected) {
            if (currentlySelected.position === this.position) return;

            // Verify scroll, it is better to be able to see all the content of the page
            const direction = currentlySelected.position > this.position; // True for scroll up, false for scroll down

            const {offsetHeight, scrollTop, scrollHeight} = currentlySelected;
            if (direction && scrollTop !== 0) return;
            if (!direction && offsetHeight + scrollTop !== scrollHeight) return;

            // Set proper new position
            currentlySelected.classList.remove("page-current");
            if (direction) {
                currentlySelected.classList.add(this.parent.direction ? "page-right" : "page-down");
            } else {
                currentlySelected.classList.add(this.parent.direction ? "page-left" : "page-up");
            }
        }

        this.parent.transitioning = this.transitioning = true;
        this.forceSelect();
    }
}

/**
 * Build the example's menu
 */
function buildMenu() {
    /** @type {HTMLUListElement} */
    const menu = document.getElementById("menu");
    /** @type {PageContainer} */
    const pageContainer = document.getElementById("menuReady");
    const pages = pageContainer.getPages();

    const selected = pageContainer.getSelected();

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
        const i = pageContainer.getSelected();
        menu.querySelector(".selected")?.classList?.remove("selected");
        menu.children.item(i).classList.add("selected");
    });
}

window.addEventListener("load", function (ev) {
    // Load custom elements
    window.customElements.define('page-section', PageSection);
    window.customElements.define('page-container', PageContainer);

    try {
        buildMenu();
    } catch (e) {}
});
