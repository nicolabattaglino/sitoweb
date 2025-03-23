document.addEventListener("DOMContentLoaded", function () {
    fetch("../header/header.html")
        .then(response => response.text())
        .then(data => {
            document.body.insertAdjacentHTML("afterbegin", data);
            
            // Ora che l'header è stato caricato, gli assegniamo un ID
            document.querySelector("header").id = "main-header";
        });
});