async function caricaProgetto() {
    // 1. Prende il parametro "p" dall'URL (es. ?p=casa-frejus)
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get("p");

    // 2. Carica il file JSON con tutti i progetti
    const response = await fetch("../data/progetti.json");
    const progetti = await response.json();

    // 3. Trova il progetto giusto
    const progetto = progetti.find(proj => proj.slug === slug);

    if (progetto) {
        // 4. Riempie la pagina con i dati giusti
        document.title = progetto.titolo;
        document.getElementById("titolo").innerText = progetto.titolo;
        document.getElementById("descrizione").innerText = progetto.descrizione;
        document.getElementById("luogo").innerText = progetto.luogo;
        document.getElementById("anno").innerText = progetto.anno;
        document.getElementById("commitente").innerText = progetto.commitente;
        document.getElementById("tipologia").innerText = progetto.tipologia;
        document.getElementById("superficie").innerText = progetto.superficie;
        document.getElementById("foto_crediti").innerText = progetto.foto_crediti;

        // 5. Cambia l'immagine hero
        document.getElementById("immagine_hero").src = progetto.immagine_hero;

        // 6. Crea la griglia di immagini
        const griglia = document.getElementById("griglia-immagini");
        progetto.immagini.forEach(imgSrc => {
            const img = document.createElement("img");
            img.src = imgSrc;
            img.alt = "Foto progetto";
            griglia.appendChild(img);
        });

        const sliderIframe = document.querySelector(".slider-iframe");

        // Quando il progetto è caricato, invia lo slug allo slider
        if (sliderIframe) {
            sliderIframe.onload = function () {
                sliderIframe.contentWindow.postMessage({ slug: progetto.slug }, "*");
            };
        }   
    } else {
        // Se il progetto non esiste, mostra un messaggio di errore
        document.getElementById("titolo").innerText = "Progetto non trovato";
        document.getElementById("descrizione").innerText = "Il progetto richiesto non esiste.";
    }
}

// Chiama la funzione quando la pagina viene caricata
caricaProgetto();