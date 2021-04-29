function buildExperimentList() {
    fetch("/api/experiments")
        .then(res => res.json())
        .then(experiments => {
            const parent = document.getElementById("experiments");

            experiments.sort((a, b) => {
                return new Date(a.date) < new Date(b.date);
            });

            console.log(experiments)

            for (const e of experiments) {
                const div = document.createElement("div");

                div.classList.add("card", "text-white", "bg-primary", "mt-3", "shadow-sm");
                div.style.width = "18rem";

                div.innerHTML = `<div class="card-header">
                                    <a href="${e.url}" class="stretched-link link-light">${e.name}</a>
                                </div>
                                <div class="card-body text-white">
                                    <h5 class="card-title">${e.name}</h5>
                                    <p class="card-text">${e.description}</p>
                                </div>
                                <div class="card-footer text-white-50">
                                    ${e.date}
                                </div>`;

                parent.append(div);
            }
        });
}

window.addEventListener("load", buildExperimentList);