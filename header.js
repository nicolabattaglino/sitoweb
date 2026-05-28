document.addEventListener("DOMContentLoaded", function () {
    initCustomCursor();

    fetch("../header/header.html")
        .then(response => response.text())
        .then(data => {
            // Inserisce l'header all'inizio del body
            document.body.insertAdjacentHTML("afterbegin", data);

            // Assegna l'ID all'header
            document.querySelector("header").id = "main-header";

            // Evidenzia il link attivo
            highlightActiveLink();

            // Attiva il menu toggle (dopo un attimo per assicurarsi che sia nel DOM)
            setTimeout(() => {
                const toggleBtn = document.getElementById("menu-toggle");
                const nav = document.querySelector("nav");

                if (toggleBtn && nav) {
                    toggleBtn.addEventListener("click", () => {
                        nav.classList.toggle("show");
                    });

                    nav.querySelectorAll("a").forEach(link => {
                        link.addEventListener("click", () => {
                            nav.classList.remove("show");
                        });
                    });
                }
            }, 100);
    });
});

function initCustomCursor() {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        return;
    }

    const cursor = document.createElement("div");
    cursor.className = "custom-cursor";
    document.body.appendChild(cursor);

    const cursorStyle = document.createElement("style");
    cursorStyle.textContent = "html, html *, body, body * { cursor: none !important; }";
    document.head.appendChild(cursorStyle);

    const moveCursor = (event) => {
        cursor.classList.add("is-visible");
        cursor.style.left = `${event.clientX}px`;
        cursor.style.top = `${event.clientY}px`;
    };

    document.addEventListener("mousemove", moveCursor);
    document.addEventListener("mousedown", moveCursor);
    document.addEventListener("mouseup", moveCursor);

    document.addEventListener("mouseleave", () => {
        cursor.classList.remove("is-visible");
    });

    function bindIframe(iframe) {
        if (iframe.dataset.customCursorBound === "true") {
            return;
        }

        iframe.dataset.customCursorBound = "true";
        iframe.addEventListener("mouseenter", () => {
            cursor.classList.remove("is-visible");
        });
        iframe.addEventListener("mouseleave", () => {
            cursor.classList.remove("is-visible");
        });
    }

    document.querySelectorAll("iframe").forEach(bindIframe);

    const observer = new MutationObserver(() => {
        document.querySelectorAll("iframe").forEach(bindIframe);
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    const interactiveSelector = "a, button, input, textarea, select, [role='button']";

    document.addEventListener("mouseover", (event) => {
        if (event.target.closest(interactiveSelector)) {
            cursor.classList.add("is-hovering");
        }
    });

    document.addEventListener("mouseout", (event) => {
        const currentInteractive = event.target.closest(interactiveSelector);
        const nextInteractive = event.relatedTarget && event.relatedTarget.closest(interactiveSelector);

        if (currentInteractive && currentInteractive !== nextInteractive) {
            cursor.classList.remove("is-hovering");
        }
    });
}

function highlightActiveLink() {
    let path = window.location.pathname;
    let navLinks = document.querySelectorAll("nav ul li a");

    navLinks.forEach(link => {
        let href = link.getAttribute("href").replace("..", "");

        if (path.includes(href)) {
            link.classList.add("active");
        }
    });
}
