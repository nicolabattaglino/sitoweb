document.addEventListener("DOMContentLoaded", function () {
    const popupOverlay = document.querySelector(".popup-overlay");
    const popups = Array.from(document.querySelectorAll(".popup"));
    const prevArrow = document.querySelector(".popup-nav-prev");
    const nextArrow = document.querySelector(".popup-nav-next");

    if (prevArrow) prevArrow.style.display = "none";
    if (nextArrow) nextArrow.style.display = "none";


    let currentPopupIndex = null;

    function openPopup(popupId) {
        closePopup();
        const popup = document.getElementById(popupId);
        currentPopupIndex = popups.indexOf(popup);
        popup.style.display = "flex";
        popup.classList.add("show");
        popupOverlay.style.display = "block";
        document.body.classList.add("blurred");
        document.body.classList.add("popup-open");
        showArrows(true);
    }

    function closePopup() {
        popups.forEach(popup => {
            popup.classList.remove("show");
            popup.style.display = "none";
        });
        popupOverlay.style.display = "none";
        document.body.classList.remove("blurred");
        document.body.classList.remove("popup-open");
        showArrows(false);
        currentPopupIndex = null;
    }

    function showArrows(show) {
        if (prevArrow) prevArrow.style.display = show ? "flex" : "none";
        if (nextArrow) nextArrow.style.display = show ? "flex" : "none";
    }

    function goToPopup(index) {
        if (currentPopupIndex === null) return;
        popups[currentPopupIndex].style.display = "none";
        popups[currentPopupIndex].classList.remove("show");
        currentPopupIndex = (index + popups.length) % popups.length;
        popups[currentPopupIndex].style.display = "flex";
        popups[currentPopupIndex].classList.add("show");
    }

    // Click sulle frecce globali
    if (prevArrow) {
        prevArrow.addEventListener("click", () => {
            goToPopup(currentPopupIndex - 1);
        });
    }
    if (nextArrow) {
        nextArrow.addEventListener("click", () => {
            goToPopup(currentPopupIndex + 1);
        });
    }

    // Chiusura popup
    const closeButtons = document.querySelectorAll(".close");
    closeButtons.forEach(button => button.addEventListener("click", closePopup));
    if (popupOverlay) popupOverlay.addEventListener("click", closePopup);

    // Click sulle card
    document.querySelectorAll(".card").forEach(card => {
        card.addEventListener("click", function () {
            const popupId = card.getAttribute("onclick").match(/'([^']+)'/)[1];
            openPopup(popupId);
        });
    });

    // Carousel
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

    updateButtons();
});