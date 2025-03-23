document.addEventListener("DOMContentLoaded", function () {
    const popupOverlay = document.querySelector(".popup-overlay");
    const popup = document.querySelector(".popup");
    const closeButton = document.querySelector(".close");

    function openPopup() {
        // Chiude eventuali popup aperti prima di aprire uno nuovo
        closePopup();
        popup.style.display = "flex"; 
        popupOverlay.style.display = "block"; 
        document.body.classList.add("blurred");

    }

    function closePopup() {
        popup.style.display = "none";
        popupOverlay.style.display = "none";    
        document.body.classList.remove("blurred");

    }

    closeButton.addEventListener("click", closePopup);
    popupOverlay.addEventListener("click", closePopup);

    // Esempio di apertura popup: Associa questo evento al tuo trigger
    document.querySelectorAll(".card").forEach(card => {
        card.addEventListener("click", openPopup);
    });
});



document.addEventListener("DOMContentLoaded", function () {
    const carousel = document.querySelector(".carousel");
    const prevButton = document.querySelector(".prev");
    const nextButton = document.querySelector(".next");

    function updateButtons() {
        const scrollPos = carousel.scrollLeft;
        const maxScroll = carousel.scrollWidth - carousel.clientWidth;
        
        prevButton.classList.toggle("disabled", scrollPos <= 5);
        nextButton.classList.toggle("disabled", scrollPos >= maxScroll - 5);
    }

    function scrollLeft() {
        carousel.scrollBy({ left: -300, behavior: "smooth" });
    }

    function scrollRight() {
        carousel.scrollBy({ left: 300, behavior: "smooth" });
    }

    prevButton.addEventListener("click", scrollLeft);
    nextButton.addEventListener("click", scrollRight);
    carousel.addEventListener("scroll", () => setTimeout(updateButtons, 50));

    updateButtons(); // Stato iniziale dei bottoni
});


