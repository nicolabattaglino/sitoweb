function initComparisons() {
    var x = document.getElementsByClassName("img-comp-overlay");
    for (var i = 0; i < x.length; i++) {
      compareImages(x[i]);
    }
  
    function compareImages(img) {
      var slider, clicked = 0, w = img.offsetWidth;
      img.style.width = (w / 2) + "px";
      slider = document.createElement("DIV");
      slider.setAttribute("class", "img-comp-slider");
      img.parentElement.insertBefore(slider, img);
      slider.style.top = (img.offsetHeight / 2) - 20 + "px"; // Centra meglio il pallino
      slider.style.left = (w / 2) - (slider.offsetWidth / 2) + "px";
  
      slider.addEventListener("mousedown", slideReady);
      window.addEventListener("mouseup", slideFinish);
      slider.addEventListener("touchstart", slideReady);
      window.addEventListener("touchend", slideFinish);
  
      function slideReady(e) {
        e.preventDefault();
        clicked = 1;
        window.addEventListener("mousemove", slideMove);
        window.addEventListener("touchmove", slideMove);
      }
  
      function slideFinish() {
        clicked = 0;
      }
  
      function slideMove(e) {
        if (clicked == 0) return false;
        var pos = getCursorPos(e);
        if (pos < 0) pos = 0;
        if (pos > w) pos = w;
        slide(pos);
      }
  
      function getCursorPos(e) {
        var a = img.getBoundingClientRect();
        return e.pageX - a.left - window.pageXOffset;
      }
  
      function slide(x) {
        img.style.width = x + "px";
        slider.style.left = img.offsetWidth - (slider.offsetWidth / 2) + "px";
      }
    }
  }
  
  document.addEventListener("DOMContentLoaded", initComparisons);

  function caricaSlider(slug) {
    const sliderContainer = document.getElementById("slider-container");

    // Svuota il container
    sliderContainer.innerHTML = "";

    // Percorso della cartella immagini basato sullo slug
    const cartella = `../immagini/${slug}/`;

    // Creazione del markup dello slider
    sliderContainer.innerHTML = `
      <div class="img-comp-container" id="slider-container">

        <div class="img-comp-img">
            <img src="${cartella}d.png" onload="initComparisons()">
        </div>
        <div class="img-comp-img img-comp-overlay">
            <img src="${cartella}u.png">
        </div>
      </div>
    `;
}
// Aspetta il messaggio dalla pagina principale
window.addEventListener("message", (event) => {
    if (event.data.slug) {
        caricaSlider(event.data.slug);
    }
});

