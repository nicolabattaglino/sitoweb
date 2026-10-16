async function caricaProgetto() {
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get("p");
    const response = await fetch("../data/progetti.json");
    const progetti = await response.json();
    const progetto = progetti.find(proj => proj.slug === slug);

    if (progetto) {
        document.title = progetto.titolo;
        document.getElementById("titolo").innerText = progetto.titolo;
        const sottotitoloEl = document.getElementById("sottotitolo");
        if (sottotitoloEl) {
            const sottotitolo = progetto.sottotitolo && progetto.sottotitolo.trim();
            if (sottotitolo) {
                sottotitoloEl.innerText = sottotitolo;
                sottotitoloEl.style.display = "";
            } else {
                sottotitoloEl.style.display = "none";
            }
        }
        document.getElementById("descrizione").innerText = progetto.descrizione;
        document.getElementById("luogo").innerText = progetto.luogo;
        document.getElementById("anno").innerText = progetto.anno;
        document.getElementById("commitente").innerText = progetto.commitente;
        document.getElementById("tipologia").innerText = progetto.tipologia;
        document.getElementById("superficie").innerText = progetto.superficie;
        document.getElementById("foto_crediti").innerText = progetto.foto_crediti;
        document.getElementById("immagine_hero").src = progetto.immagine_hero;

        const griglia = document.getElementById("griglia-immagini");
        if (progetto.slug === "casa-armonia") griglia.classList.add("photo-grid");
        aggiungiImmagini(griglia, progetto.immagini, `Foto del progetto ${progetto.titolo}`);

        const sezioneRender = document.getElementById("sezione-render");
        const grigliaRender = document.getElementById("griglia-render");
        const toggleRender = document.getElementById("toggle-render");
        if (Array.isArray(progetto.immagini_render) && progetto.immagini_render.length > 0 && sezioneRender) {
            sezioneRender.hidden = false;
            aggiungiImmagini(grigliaRender, progetto.immagini_render, `Render del progetto ${progetto.titolo}`);
            toggleRender.addEventListener("click", () => {
                const isOpen = toggleRender.getAttribute("aria-expanded") === "true";
                toggleRender.setAttribute("aria-expanded", String(!isOpen));
                grigliaRender.hidden = isOpen;
                toggleRender.querySelector(".render-toggle-icon").textContent = isOpen ? "+" : "−";
                toggleRender.querySelector("span").textContent = isOpen ? "Scopri i render del progetto" : "Nascondi i render del progetto";
            });
        }

        const sliderIframe = document.querySelector(".slider-iframe");
        if (sliderIframe) {
            const rawLinePercent = Number(progetto.slider_line_percent);
            const linePercent = Number.isFinite(rawLinePercent)
                ? Math.max(20, Math.min(100, Math.round(rawLinePercent)))
                : 100;
            sliderIframe.src = `../slider-block/index.html?slug=${encodeURIComponent(progetto.slug)}&line=${linePercent}&v=20260225`;
        }

        // **🔽 INIZIALIZZA LIGHTBOX SOLO DOPO AVER CREATO LE IMMAGINI 🔽**
        inizializzaLightbox();
    } else {
        document.getElementById("titolo").innerText = "Progetto non trovato";
        document.getElementById("descrizione").innerText = "Il progetto richiesto non esiste.";
    }
}

function aggiungiImmagini(griglia, immagini, descrizione) {
    if (!griglia || !Array.isArray(immagini)) return;
    immagini.forEach((imgSrc, index) => {
        const img = document.createElement("img");
        img.src = imgSrc;
        img.alt = `${descrizione} ${index + 1}`;
        img.loading = "lazy";
        img.decoding = "async";
        griglia.appendChild(img);
    });
}

// **NUOVA FUNZIONE PER INIZIALIZZARE LA LIGHTBOX**
let indiceCorrente = 0;
let immaginiProgetto = [];
let scrollLockY = 0;

function inizializzaLightbox() {
    const gallerie = [
        document.getElementById("griglia-immagini"),
        document.getElementById("griglia-render")
    ].filter(Boolean);
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    const closeBtn = document.querySelector(".close");
    const btnPrev = document.querySelector(".prev");  // Modificato per corrispondere all'HTML
    const btnNext = document.querySelector(".next");  // Modificato per corrispondere all'HTML
    const dotsContainer = document.querySelector(".lightbox-dots");

    const tutteLeImmagini = gallerie.flatMap(griglia => Array.from(griglia.querySelectorAll("img")));
    if (tutteLeImmagini.length === 0) {
        console.warn("⚠ Nessuna immagine trovata nella griglia!");
        return;
    }

    const updateLightbox = (index) => {
        indiceCorrente = (index + immaginiProgetto.length) % immaginiProgetto.length;
        lightboxImg.src = immaginiProgetto[indiceCorrente];
        if (dotsContainer) {
            dotsContainer.querySelectorAll("button").forEach((dot, dotIndex) => {
                dot.classList.toggle("is-active", dotIndex === indiceCorrente);
                dot.setAttribute("aria-current", dotIndex === indiceCorrente ? "true" : "false");
            });
        }
    };

    const preparaPuntini = () => {
        if (!dotsContainer) return;
        dotsContainer.innerHTML = "";
        immaginiProgetto.forEach((_, index) => {
            const dot = document.createElement("button");
            dot.type = "button";
            dot.className = "lightbox-dot";
            dot.setAttribute("aria-label", `Immagine ${index + 1}`);
            dot.addEventListener("click", () => updateLightbox(index));
            dotsContainer.appendChild(dot);
        });
    };

    const lockScroll = () => {
        scrollLockY = window.scrollY || window.pageYOffset;
        document.documentElement.classList.add("no-scroll");
        document.body.classList.add("no-scroll");
        document.body.style.top = `-${scrollLockY}px`;
    };

    const unlockScroll = () => {
        document.documentElement.classList.remove("no-scroll");
        document.body.classList.remove("no-scroll");
        document.body.style.top = "";
        window.scrollTo(0, scrollLockY);
    };

    gallerie.forEach(griglia => {
        const immagini = Array.from(griglia.querySelectorAll("img"));
        immagini.forEach((img, index) => {
            img.addEventListener("click", function() {
                immaginiProgetto = immagini.map(elemento => elemento.src);
                preparaPuntini();
                lightbox.style.display = "flex";
                lockScroll();
                updateLightbox(index);
            });
        });
    });

    if (closeBtn) {
        closeBtn.addEventListener("click", function() {
            lightbox.style.display = "none";
            unlockScroll();
        });
    }

    // Pulsanti avanti/indietro
    if (btnNext) {
        btnNext.addEventListener("click", function() {
            updateLightbox(indiceCorrente + 1);
        });
    }

    if (btnPrev) {
        btnPrev.addEventListener("click", function() {
            updateLightbox(indiceCorrente - 1);
        });
    }

    // Chiudi lightbox cliccando fuori dall'immagine
    lightbox.addEventListener("click", function(event) {
        if (event.target === lightbox) {
            lightbox.style.display = "none";
            unlockScroll();
        }
    });

    // Navigazione con tastiera nella lightbox
    document.addEventListener("keydown", function(e) {
        // Controlla che la lightbox sia visibile
        if (window.getComputedStyle(lightbox).display !== "none") {
            if (e.key === "ArrowRight") {
                updateLightbox(indiceCorrente + 1);
            }
            if (e.key === "ArrowLeft") {
                updateLightbox(indiceCorrente - 1);
            }
            if (e.key === "Escape") {
                lightbox.style.display = "none";
                unlockScroll();
            }
        }
    });

    // Swipe su mobile per cambiare immagine
    let touchStartX = 0;
    let touchStartY = 0;
    const swipeThreshold = 40;

    lightbox.addEventListener("touchstart", function(event) {
        const touch = event.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
    }, { passive: true });

    lightbox.addEventListener("touchend", function(event) {
        const touch = event.changedTouches[0];
        const deltaX = touch.clientX - touchStartX;
        const deltaY = touch.clientY - touchStartY;

        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > swipeThreshold) {
            if (deltaX < 0) {
                updateLightbox(indiceCorrente + 1);
            } else {
                updateLightbox(indiceCorrente - 1);
            }
        }
    }, { passive: true });

    // Drag su desktop per cambiare immagine
    let dragStartX = 0;
    let dragStartY = 0;
    let isDragging = false;

    const onPointerDown = (event) => {
        if (event.pointerType === "mouse" || event.pointerType === "pen") {
            isDragging = true;
            dragStartX = event.clientX;
            dragStartY = event.clientY;
            lightboxImg.setPointerCapture(event.pointerId);
        }
    };

    const onPointerUp = (event) => {
        if (!isDragging) return;
        isDragging = false;
        const deltaX = event.clientX - dragStartX;
        const deltaY = event.clientY - dragStartY;

        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > swipeThreshold) {
            if (deltaX < 0) {
                updateLightbox(indiceCorrente + 1);
            } else {
                updateLightbox(indiceCorrente - 1);
            }
        }
    };

    lightboxImg.addEventListener("pointerdown", onPointerDown);
    lightboxImg.addEventListener("pointerup", onPointerUp);
    lightboxImg.addEventListener("pointercancel", () => {
        isDragging = false;
    });

    console.log("✅ Lightbox inizializzata con", immaginiProgetto.length, "immagini.");
}

// Esegui la funzione principale
caricaProgetto();
