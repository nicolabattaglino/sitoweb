function initComparisons() {
  var x = document.getElementsByClassName("img-comp-overlay");
  for (var i = 0; i < x.length; i++) {
    compareImages(x[i]);
  }

  function compareImages(img) {
    var slider, clicked = 0;
    var container = img.parentElement.parentElement;
    var w = container.offsetWidth;
    var h = container.offsetHeight;

    img.style.width = "100%";
    img.style.height = "100%";
    img.parentElement.style.width = (w / 2) + "px";

    slider = document.createElement("DIV");
    slider.setAttribute("class", "img-comp-slider");
    img.parentElement.insertBefore(slider, img);
    slider.style.top = (h / 2) - 20 + "px";
    slider.style.left = (w / 2) - 20 + "px";

    slider.addEventListener("touchstart", slideReady);
    window.addEventListener("touchend", slideFinish);

    function slideReady(e) {
      e.preventDefault();
      clicked = 1;
      window.addEventListener("touchmove", slideMove);
    }

    function slideFinish() {
      clicked = 0;
      window.removeEventListener("touchmove", slideMove);
    }

    function slideMove(e) {
      if (clicked == 0) return false;
      var pos = getCursorPos(e);
      if (pos < 0) pos = 0;
      if (pos > w) pos = w;
      slide(pos);
    }

    function getCursorPos(e) {
      var a = container.getBoundingClientRect();
      return e.touches[0].pageX - a.left - window.pageXOffset;
    }

    function slide(x) {
      img.parentElement.style.width = x + "px";
      slider.style.left = x - 20 + "px";
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

