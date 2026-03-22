

document.addEventListener("DOMContentLoaded", function () {
    const slides = document.querySelectorAll(".slide");
    const slider = document.querySelector(".slider");
    const introDurationMs = 7600;
    const sliderStartMs = 6200;
    let currentIndex = 0;
    let sliderStarted = false;

    if (!slides.length || !slider) {
        return;
    }

    function changeSlide() {
        slides[currentIndex].classList.remove("active");
        currentIndex = (currentIndex + 1) % slides.length;
        slides[currentIndex].classList.add("active");
    }

    // Durante il carosello parole sfoca lo sfondo e blocca lo slideshow immagini.
    slider.classList.add("intro-active");

    setTimeout(() => {
        if (sliderStarted) {
            return;
        }
        sliderStarted = true;
        slider.classList.remove("intro-active");
        setInterval(changeSlide, 3000); // Cambia immagine ogni 3 secondi
    }, sliderStartMs);

    // Garantisce che la classe intro venga comunque rimossa al termine dell'animazione.
    setTimeout(() => {
        slider.classList.remove("intro-active");
    }, introDurationMs);
});
