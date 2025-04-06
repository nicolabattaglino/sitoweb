document.addEventListener("DOMContentLoaded", function () {
    const popupOverlay = document.querySelector(".popup-overlay");

    function openPopup(popupId) {
        // Chiude eventuali popup aperti prima di aprirne uno nuovo
        closePopup();
        const popup = document.querySelector(`#${popupId}`);
        popup.style.display = "flex"; 
        popup.classList.add("show");  // Aggiungi la classe 'show' per stilizzare il pop-up
        popupOverlay.style.display = "block"; 
        document.body.classList.add("blurred");
    }

    function closePopup() {
        const popups = document.querySelectorAll(".popup");
        popups.forEach(popup => {
            popup.classList.remove("show");  // Rimuovi la classe 'show' per nascondere il pop-up
            popup.style.display = "none";
        });
        popupOverlay.style.display = "none";    
        document.body.classList.remove("blurred");
    }

    // Gestione della chiusura dei pop-up
    const closeButtons = document.querySelectorAll(".close");
    closeButtons.forEach(button => button.addEventListener("click", closePopup));
    
    popupOverlay.addEventListener("click", closePopup);

    // Associa il click sulle card ai rispettivi pop-up
    document.querySelectorAll(".card").forEach(card => {
        card.addEventListener("click", function () {
            const popupId = card.getAttribute("onclick").match(/'([^']+)'/)[1]; // Estrae l'ID del popup dalla funzione onclick
            openPopup(popupId);
        });
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