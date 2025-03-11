async function caricaProgetto() {
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get("p");
    const response = await fetch("../data/progetti.json");
    const progetti = await response.json();
    const progetto = progetti.find(proj => proj.slug === slug);

    if (progetto) {
        document.title = progetto.titolo;
        document.getElementById("titolo").innerText = progetto.titolo;
        document.getElementById("descrizione").innerText = progetto.descrizione;
        document.getElementById("luogo").innerText = progetto.luogo;
        document.getElementById("anno").innerText = progetto.anno;
        document.getElementById("commitente").innerText = progetto.commitente;
        document.getElementById("tipologia").innerText = progetto.tipologia;
        document.getElementById("superficie").innerText = progetto.superficie;
        document.getElementById("foto_crediti").innerText = progetto.foto_crediti;
        document.getElementById("immagine_hero").src = progetto.immagine_hero;

        const griglia = document.getElementById("griglia-immagini");
        progetto.immagini.forEach(imgSrc => {
            const img = document.createElement("img");
            img.src = imgSrc;
            img.alt = "Foto progetto";
            griglia.appendChild(img);
        });

        const sliderIframe = document.querySelector(".slider-iframe");
        if (sliderIframe) {
            sliderIframe.onload = function () {
                sliderIframe.contentWindow.postMessage({ slug: progetto.slug }, "*");
            };
        }   

        // **🔽 INIZIALIZZA LIGHTBOX SOLO DOPO AVER CREATO LE IMMAGINI 🔽**
        inizializzaLightbox();
    } else {
        document.getElementById("titolo").innerText = "Progetto non trovato";
        document.getElementById("descrizione").innerText = "Il progetto richiesto non esiste.";
    }
}

// **NUOVA FUNZIONE PER INIZIALIZZARE LA LIGHTBOX**
let indiceCorrente = 0;
let immaginiProgetto = [];

function inizializzaLightbox() {
    const immagini = document.querySelectorAll('#griglia-immagini img');
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    const closeBtn = document.querySelector(".close");
    const btnPrev = document.querySelector(".prev");  // Modificato per corrispondere all'HTML
    const btnNext = document.querySelector(".next");  // Modificato per corrispondere all'HTML

    if (immagini.length === 0) {
        console.warn("⚠ Nessuna immagine trovata nella griglia!");
        return;
    }

    immaginiProgetto = Array.from(immagini).map(img => img.src);

    immagini.forEach((img, index) => {
        img.addEventListener("click", function() {
            lightbox.style.display = "flex";
            lightboxImg.src = this.src;
            indiceCorrente = index;
        });
    });

    if (closeBtn) {
        closeBtn.addEventListener("click", function() {
            lightbox.style.display = "none";
        });
    }

    // Pulsanti avanti/indietro
    if (btnNext) {
        btnNext.addEventListener("click", function() {
            indiceCorrente = (indiceCorrente + 1) % immaginiProgetto.length;
            lightboxImg.src = immaginiProgetto[indiceCorrente];
        });
    }

    if (btnPrev) {
        btnPrev.addEventListener("click", function() {
            indiceCorrente = (indiceCorrente - 1 + immaginiProgetto.length) % immaginiProgetto.length;
            lightboxImg.src = immaginiProgetto[indiceCorrente];
        });
    }

    // Chiudi lightbox cliccando fuori dall'immagine
    lightbox.addEventListener("click", function(event) {
        if (event.target === lightbox) {
            lightbox.style.display = "none";
        }
    });

    console.log("✅ Lightbox inizializzata con", immaginiProgetto.length, "immagini.");
}

// Esegui la funzione principale
caricaProgetto();


// Esegui la funzione principale
caricaProgetto();
