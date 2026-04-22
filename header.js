document.addEventListener("DOMContentLoaded", function () {
    fetch("../header/header.html")
        .then(response => response.text())
        .then(data => {
            // Inserisce l'header all'inizio del body
            document.body.insertAdjacentHTML("afterbegin", data);

            // Assegna l'ID all'header
            document.querySelector("header").id = "main-header";

            // Evidenzia il link attivo
            highlightActiveLink();

            // Attiva il menu toggle (dopo un attimo per assicurarsi che sia nel DOM)
            setTimeout(() => {
                const toggleBtn = document.getElementById("menu-toggle");
                const nav = document.querySelector("nav");

                if (toggleBtn && nav) {
                    toggleBtn.addEventListener("click", () => {
                        nav.classList.toggle("show");
                    });

                    nav.querySelectorAll("a").forEach(link => {
                        link.addEventListener("click", () => {
                            nav.classList.remove("show");
                        });
                    });
                }
            }, 100);
    });
});

function highlightActiveLink() {
    let path = window.location.pathname;
    let navLinks = document.querySelectorAll("nav ul li a");

    navLinks.forEach(link => {
        let href = link.getAttribute("href").replace("..", "");

        if (path.includes(href)) {
            link.classList.add("active");
        }
    });
}
