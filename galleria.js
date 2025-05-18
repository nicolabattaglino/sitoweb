document.addEventListener("DOMContentLoaded", function() {
    const immagini = document.querySelectorAll('.griglia-immagini img');
    
    if (immagini.length === 0) {
        console.warn("⚠ Nessuna immagine trovata nella griglia!");
        return;
    }

    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightbox-img");
    const closeBtn = document.querySelector(".close");

    immagini.forEach(img => {
        img.addEventListener("click", function() {
            lightbox.style.display = "flex";
            lightboxImg.src = this.src;
        });
    });

    closeBtn.addEventListener("click", function() {
        lightbox.style.display = "none";
    });
});


    function openLightbox(src) {
        console.log("📷 Apertura lightbox con immagine:", src);
        lightboxImg.src = src;
        lightbox.style.display = "flex";
    }

    function closeLightbox() {
        lightbox.style.display = "none";
    }

    function showNext() {
        currentIndex = (currentIndex + 1) % imageArray.length;
        openLightbox(imageArray[currentIndex]);
    }

    function showPrev() {
        currentIndex = (currentIndex - 1 + imageArray.length) % imageArray.length;
        openLightbox(imageArray[currentIndex]);
    }

    closeBtn.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", function (e) {
        if (e.target === lightbox) closeLightbox();
    });

nextBtn.addEventListener("click", showNext);
prevBtn.addEventListener("click", showPrev);
