function buildExperimentList() {
    fetch(`/api/v2/experiments`)
        .then(res => res.json())
        .then(experiments => {
            const parent = document.getElementById("experiments");

            experiments.sort((a, b) => {
                return new Date(b.date).getTime() - new Date(a.date).getTime();
            });

            for (const e of experiments) {
                const div = document.createElement("div");

                div.classList.add("card", "text-white", "bg-q-light", "mt-3", "shadow-sm");
                div.style.width = "18rem";

                div.innerHTML = `<div class="card-body text-white">
                                    <h5 class="card-title"><a href="${e.url}" class="stretched-link link-light">${e.name}</a></h5>
                                    <p class="card-text">${e.description}</p>
                                </div>
                                <div class="card-footer text-white-50">Creation: ${new Date(e.date).toLocaleDateString()}</div>`;

                parent.append(div);
            }
        });
}

window.addEventListener("load", buildExperimentList);