class Modal extends HTMLElement {
    constructor() {
        super();

        this.titleElement = this.createChild("div", "title");
        this.content = this.createChild("div", "content");
        this.buttons = this.createChild("div", "buttons");

        if (this.hasAttribute("data-title")) {
            this.setTitle(this.getAttribute("data-title"));
        }
        if (this.hasAttribute("data-content")) {
            this.setContent(this.getAttribute("data-content"));
        }
        if (this.hasAttribute("data-close")) {
            this.addButton("Close", "gray", () => this.hide());
        }
    }

    /**
     * @param tagName
     * @param c
     * @returns {HTMLElement}
     */
    createChild(tagName, ...c) {
        const tag = document.createElement(tagName);
        if (c.length > 0) tag.classList.add(...c);
        this.append(tag);
        return tag;
    }

    setTitle(title) {
        this.titleElement.innerText = title;
    }

    setContent(content) {
        this.content.innerText = content;
    }

    addButton(name, color, callback) {
        const button = document.createElement("button");
        button.style.backgroundColor = color;
        button.innerText = name;
        button.addEventListener("click", callback, {passive: true});
        this.buttons.append(button);
    }

    show() {

    }

    hide() {
        this.classList.remove("show");
    }
}

window.addEventListener("load", () => {
    window.customElements.define('modal-element', Modal);
}, {passive: true, once: true});