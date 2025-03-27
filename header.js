document.addEventListener("DOMContentLoaded", function () {
    fetch("../header/header.html")
        .then(response => response.text())
        .then(data => {
            document.body.insertAdjacentHTML("afterbegin", data);
            
            // Ora che l'header è stato caricato, gli assegniamo un ID
            document.querySelector("header").id = "main-header";
        });
});

document.addEventListener("DOMContentLoaded", function () {
    fetch("../header/header.html")
        .then(response => response.text())
        .then(data => {
            document.body.insertAdjacentHTML("afterbegin", data);
            
            // Ora che l'header è stato caricato, assegniamo un ID
            document.querySelector("header").id = "main-header";

            // Chiamiamo la funzione per evidenziare il link attivo
            highlightActiveLink();
        });
});

function highlightActiveLink() {
    let path = window.location.pathname; // Ottiene il percorso URL della pagina attuale
    let navLinks = document.querySelectorAll("nav ul li a"); // Trova tutti i link nel menu

    navLinks.forEach(link => {
        let href = link.getAttribute("href").replace("..", ""); // Normalizza l'href

        if (path.includes(href)) {
            link.classList.add("active"); // Aggiunge la classe "active" al link corrispondente
        }
    });
}