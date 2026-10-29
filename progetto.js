async function caricaProgetto() {
    const urlParams = new URLSearchParams(window.location.search);
    const legacySlug = urlParams.get("p");
    const routeSlug = window.location.pathname.split("/").filter(Boolean).pop();
    const response = await fetch("/data/progetti.json?v=website-v3-armonia-1");
    const progetti = await response.json();
    const progetto = progetti.find(proj => slugDaTitolo(proj.titolo) === routeSlug || proj.slug === legacySlug);

    if (progetto) {
        if (legacySlug) {
            window.history.replaceState(null, "", `/progetti/${slugDaTitolo(progetto.titolo)}/`);
        }
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
        document.getElementById("immagine_hero").src = percorsoSito(progetto.immagine_hero);

        inizializzaConfronto(progetto);

        const griglia = document.getElementById("griglia-immagini");
        if (progetto.slug === "casa-armonia") griglia.classList.add("photo-grid");
        aggiungiImmagini(griglia, progetto.immagini, `Foto del progetto ${progetto.titolo}`);

        const sezioneRender = document.getElementById("sezione-render");
        const grigliaRender = document.getElementById("griglia-render");
        const toggleRender = document.getElementById("toggle-render");
        if (Array.isArray(progetto.immagini_render) && progetto.immagini_render.length > 0 && sezioneRender && grigliaRender && toggleRender) {
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

        // **🔽 INIZIALIZZA LIGHTBOX SOLO DOPO AVER CREATO LE IMMAGINI 🔽**
        inizializzaLightbox();
    } else {
        document.getElementById("titolo").innerText = "Progetto non trovato";
        document.getElementById("descrizione").innerText = "Il progetto richiesto non esiste.";
    }
}

function inizializzaConfronto(progetto) {
    const slider = document.getElementById("comparison-slider");
    const afterImage = document.getElementById("comparison-after");
    const beforeImage = document.getElementById("comparison-before");
    const range = document.getElementById("comparison-range");
    if (!slider || !afterImage || !beforeImage || !range) return;

    const basePath = `/immagini/${encodeURIComponent(progetto.slug)}/`;
    afterImage.src = `${basePath}d.png`;
    beforeImage.src = `${basePath}u.png`;
    slider.hidden = false;

    const rawLinePercent = Number(progetto.slider_line_percent);
    const linePercent = Number.isFinite(rawLinePercent)
        ? Math.max(20, Math.min(100, Math.round(rawLinePercent)))
        : 100;
    slider.style.setProperty("--comparison-line-height", `${linePercent}%`);

    const update = () => {
        const value = Number(range.value);
        beforeImage.style.clipPath = `inset(0 ${100 - value}% 0 0)`;
        slider.style.setProperty("--comparison-position", `${value}%`);
        range.setAttribute("aria-valuetext", `${value}% prima`);
    };

    range.addEventListener("input", update);
    update();

    // Gestisce il trascinamento anche su Safari iOS, dove il range nativo
    // può non aggiornarsi quando il pollice parte dal cursore grafico.
    let isDragging = false;
    const setPositionFromPointer = (clientX) => {
        const bounds = slider.getBoundingClientRect();
        if (!bounds.width) return;
        const percent = Math.min(100, Math.max(0, ((clientX - bounds.left) / bounds.width) * 100));
        range.value = String(Math.round(percent));
        range.dispatchEvent(new Event("input", { bubbles: true }));
    };

    slider.addEventListener("pointerdown", (event) => {
        if (event.button !== undefined && event.button !== 0) return;
        isDragging = true;
        slider.setPointerCapture(event.pointerId);
        range.focus({ preventScroll: true });
        setPositionFromPointer(event.clientX);
    });

    slider.addEventListener("pointermove", (event) => {
        if (isDragging) setPositionFromPointer(event.clientX);
    });

    const stopDragging = () => {
        isDragging = false;
    };
    slider.addEventListener("pointerup", stopDragging);
    slider.addEventListener("pointercancel", stopDragging);

    [afterImage, beforeImage].forEach((image) => {
        image.addEventListener("dragstart", (event) => event.preventDefault());
    });
}

function aggiungiImmagini(griglia, immagini, descrizione) {
    if (!griglia || !Array.isArray(immagini)) return;
    immagini.forEach((imgSrc, index) => {
        const img = document.createElement("img");
        img.src = percorsoSito(imgSrc);
        img.alt = `${descrizione} ${index + 1}`;
        img.loading = "lazy";
        img.decoding = "async";
        img.tabIndex = 0;
        img.setAttribute("role", "button");
        img.setAttribute("aria-label", `Apri ${img.alt}`);
        griglia.appendChild(img);
    });
}

function slugDaTitolo(titolo) {
    return titolo.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function percorsoSito(percorso) {
    if (/^(?:https?:|data:|\/)/i.test(percorso)) return percorso;
    return `/${percorso.replace(/^(?:\.\.\/)+/, "")}`;
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
    let immagineDiApertura = null;

    const tutteLeImmagini = gallerie.flatMap(griglia => Array.from(griglia.querySelectorAll("img")));
    if (tutteLeImmagini.length === 0) {
        console.warn("⚠ Nessuna immagine trovata nella griglia!");
        return;
    }

    const updateLightbox = (index) => {
        indiceCorrente = (index + immaginiProgetto.length) % immaginiProgetto.length;
        lightboxImg.src = immaginiProgetto[indiceCorrente].src;
        lightboxImg.alt = immaginiProgetto[indiceCorrente].alt;
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

    const chiudiGalleria = () => {
        lightbox.style.display = "none";
        unlockScroll();
        immagineDiApertura?.focus({ preventScroll: true });
    };

    gallerie.forEach(griglia => {
        const immagini = Array.from(griglia.querySelectorAll("img"));
        immagini.forEach((img, index) => {
            const apriGalleria = () => {
                immaginiProgetto = immagini.map(elemento => ({ src: elemento.src, alt: elemento.alt }));
                immagineDiApertura = img;
                preparaPuntini();
                lightbox.setAttribute("aria-label", griglia.id === "griglia-render" ? "Render del progetto" : "Fotografie del progetto");
                lightbox.style.display = "flex";
                lockScroll();
                updateLightbox(index);
                closeBtn?.focus({ preventScroll: true });
            };
            img.addEventListener("click", apriGalleria);
            img.addEventListener("keydown", event => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    apriGalleria();
                }
            });
        });
    });

    if (closeBtn) {
        closeBtn.addEventListener("click", chiudiGalleria);
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
            chiudiGalleria();
        }
    });

    // Navigazione con tastiera nella lightbox
    document.addEventListener("keydown", function(e) {
        // Controlla che la lightbox sia visibile
        if (window.getComputedStyle(lightbox).display !== "none") {
            if (e.key === "ArrowRight") {
                e.preventDefault();
                updateLightbox(indiceCorrente + 1);
            }
            if (e.key === "ArrowLeft") {
                e.preventDefault();
                updateLightbox(indiceCorrente - 1);
            }
            if (e.key === "Escape") {
                e.preventDefault();
                chiudiGalleria();
            }
            if (e.key === "Tab") {
                const pulsanti = Array.from(lightbox.querySelectorAll("button")).filter(button => button.getClientRects().length > 0);
                const primo = pulsanti[0];
                const ultimo = pulsanti[pulsanti.length - 1];
                if (e.shiftKey && document.activeElement === primo) {
                    e.preventDefault();
                    ultimo.focus();
                } else if (!e.shiftKey && document.activeElement === ultimo) {
                    e.preventDefault();
                    primo.focus();
                }
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

    console.log("✅ Lightbox inizializzata con", tutteLeImmagini.length, "immagini in gallerie separate.");
}

// Esegui la funzione principale
caricaProgetto();
