window.addEventListener("load", () => {
    const cookiesaccepted = new Event("cookiesaccepted");
    const cookiesdissmissed = new Event("cookiesdissmissed");

    if (!JSON.parse(window.localStorage.getItem("cookies"))) {
        const toast = document.createElement("div");
        toast.setAttribute("class", "toast-container position-fixed p-3 bottom-0 end-0 z-2000");
        toast.setAttribute("id", "toastPlacement");

        toast.innerHTML = `<div class="toast text-white bg-dark show w-auto" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-body">
            This website uses cookies. <a class="show-link" href="/cookies">Learn more</a>.
            <div class="mt-2 pt-2 border-top">
                <button type="button" class="btn btn-primary btn-sm" id="acceptCookies">Accept</button>
                <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="toast">Dismiss</button>
            </div>
        </div>`;

        document.body.append(toast);

        toast.querySelector("#acceptCookies").addEventListener("click", (ev) => {
            window.localStorage.setItem("cookies", "true");
            toast.remove();
            document.dispatchEvent(cookiesaccepted);
        }, {passive: true, once: true});

        document.dispatchEvent(cookiesdissmissed);
    } else {
        document.dispatchEvent(cookiesaccepted);
    }
}, {passive: true, once: true});