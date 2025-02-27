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