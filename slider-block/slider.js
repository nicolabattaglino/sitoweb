(function () {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug') || 'casa-frejus';
  const container = document.getElementById('slider-container');
  const errorBox = document.getElementById('slider-error');

  const basePath = `../immagini/${slug}/`;
  renderSlider(basePath);

  function renderSlider(path) {
    container.innerHTML = `
      <div class="img-comp-img">
        <img src="${path}d.png" alt="Immagine dopo">
      </div>
      <div class="img-comp-img img-comp-overlay">
        <img src="${path}u.png" alt="Immagine prima">
      </div>
    `;

    const imgs = Array.from(container.querySelectorAll('img'));
    let loaded = 0;
    imgs.forEach((img, idx) => {
      img.addEventListener('load', () => {
        loaded += 1;
        if (loaded === imgs.length) initComparisons(container);
      });
      img.addEventListener('error', () => {
        // Fallback placeholder se le immagini non esistono
        const placeholder = idx === 0 ? PLACEHOLDER_D : PLACEHOLDER_U;
        img.onerror = null; // evita loop
        img.src = placeholder;
        loaded += 1;
        if (loaded === imgs.length) initComparisons(container);
        errorBox.hidden = false;
        errorBox.textContent = `Immagini non trovate in ${path} — uso placeholder.`;
      });
    });
  }

  // Placeholder SVG in data URI
  const PLACEHOLDER_D =
    'data:image/svg+xml;base64,' + btoa(`<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#b6cbe8"/><stop offset="100%" stop-color="#7d9ad1"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="72" fill="#ffffff" font-family="Arial">DOPO</text></svg>`);

  const PLACEHOLDER_U =
    'data:image/svg+xml;base64,' + btoa(`<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><defs><linearGradient id="g2" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f7d9b3"/><stop offset="100%" stop-color="#e3a86b"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g2)"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="72" fill="#ffffff" font-family="Arial">PRIMA</text></svg>`);

  function initComparisons(ctx) {
    const overlay = ctx.querySelector('.img-comp-overlay');
    if (!overlay) return;

    const img = overlay.querySelector('img');
    const beforeWrapper = overlay;
    const containerRect = ctx.getBoundingClientRect();
    const w = containerRect.width;
    const h = containerRect.height;

    // Copri metà in partenza; l'immagine sopra resta full-size, si vede solo la porzione clip
    beforeWrapper.style.width = w / 2 + 'px';
    img.style.width = w + 'px';
    img.style.height = h + 'px';

    const slider = document.createElement('div');
    slider.className = 'img-comp-slider';
    slider.setAttribute('role', 'slider');
    slider.setAttribute('aria-valuemin', '0');
    slider.setAttribute('aria-valuemax', '100');
    slider.setAttribute('aria-valuenow', '50');
    slider.title = 'Trascina per confrontare';
    beforeWrapper.insertAdjacentElement('beforebegin', slider);

    positionSlider(w / 2);

    let dragging = false;
    let activePointerId = null;

    const startDrag = (e) => {
      dragging = true;
      activePointerId = e.pointerId;
      if (e.target === slider && slider.setPointerCapture) {
        slider.setPointerCapture(e.pointerId);
      }
      move(e.clientX);
    };

    slider.addEventListener('pointerdown', startDrag);
    ctx.addEventListener('pointerdown', startDrag);

    window.addEventListener('pointerup', () => {
      dragging = false;
      activePointerId = null;
    });

    window.addEventListener('pointermove', (e) => {
      if (!dragging || (activePointerId && e.pointerId !== activePointerId)) return;
      move(e.clientX);
    });

    slider.addEventListener('keydown', (e) => {
      const step = w * 0.05;
      if (e.key === 'ArrowLeft') {
        move(slider.offsetLeft - step + containerRect.left);
      } else if (e.key === 'ArrowRight') {
        move(slider.offsetLeft + step + containerRect.left);
      }
    });

    function move(clientX) {
      const rect = ctx.getBoundingClientRect();
      let pos = clientX - rect.left;
      pos = Math.max(0, Math.min(pos, rect.width));
      positionSlider(pos);
    }

    function positionSlider(x) {
      const rect = ctx.getBoundingClientRect();
      const bounded = Math.max(0, Math.min(x, rect.width));
      slider.style.left = bounded + 'px';
      beforeWrapper.style.width = bounded + 'px';
      slider.setAttribute('aria-valuenow', Math.round((bounded / rect.width) * 100));
    }
  }
})();
