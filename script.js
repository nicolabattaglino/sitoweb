// Seleziona il bottone hamburger
const burgerMenu = document.getElementById('burgerMenu');

// Aggiungi un event listener per il click
burgerMenu.addEventListener('click', function() {
    // Alterna la classe "open" sul bottone
    burgerMenu.classList.toggle('open');

    // Mostra o nascondi i link del menu
    const links = document.querySelectorAll('.navbar a');
    links.forEach(link => {
        link.style.display = burgerMenu.classList.contains('open') ? 'block' : 'none';
    });
});

function initComparisons() {
    const overlays = document.getElementsByClassName("img-comp-overlay");
    for (let i = 0; i < overlays.length; i++) {
      compareImages(overlays[i]);
    }
  
    function compareImages(img) {
      let slider, clicked = false, w, h;
  
      /* Calcola dimensioni */
      w = img.offsetWidth;
      h = img.offsetHeight;
  
      /* Posiziona slider al centro */
      slider = document.createElement("DIV");
      slider.setAttribute("class", "img-comp-slider");
      img.parentElement.insertBefore(slider, img);
      slider.style.top = (h / 2 - 20) + "px";
      slider.style.left = (w / 2 - 20) + "px";
  
      /* Imposta larghezza iniziale */
      img.style.width = (w / 2) + "px";
  
      /* Eventi */
      slider.addEventListener("mousedown", () => clicked = true);
      slider.addEventListener("touchstart", () => clicked = true);
      window.addEventListener("mouseup", () => clicked = false);
      window.addEventListener("touchend", () => clicked = false);
  
      window.addEventListener("mousemove", (e) => clicked && slideMove(e));
      window.addEventListener("touchmove", (e) => clicked && slideMove(e));
  
      function slideMove(e) {
        let pos = getCursorPos(e);
        if (pos < 0) pos = 0;
        if (pos > w) pos = w;
        img.style.width = pos + "px";
        slider.style.left = pos - (slider.offsetWidth / 2) + "px";
      }
  
      function getCursorPos(e) {
        e = e.changedTouches ? e.changedTouches[0] : e;
        const a = img.getBoundingClientRect();
        let x = e.pageX - a.left - window.pageXOffset;
        return x;
      }
    }
  }
  
  window.addEventListener("DOMContentLoaded", initComparisons);