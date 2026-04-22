(function () {
    if (window.__siteChatLoaded) {
        return;
    }

    window.__siteChatLoaded = true;

    const root = document.createElement("div");
    root.className = "site-chat";
    root.innerHTML = `
        <button class="site-chat__toggle" type="button" aria-expanded="false">Chat</button>
        <section class="site-chat__panel" hidden>
            <div class="site-chat__header">
                <div>
                    <strong>Assistente del sito</strong>
                    <span>Chiedimi di servizi, progetti, consulenze o contatti.</span>
                </div>
                <button class="site-chat__close" type="button" aria-label="Chiudi chat">&times;</button>
            </div>
            <div class="site-chat__messages" aria-live="polite"></div>
            <form class="site-chat__form">
                <textarea class="site-chat__input" rows="1" placeholder="Scrivi una domanda..." required></textarea>
                <button class="site-chat__send" type="submit">Invia</button>
            </form>
        </section>
    `;

    document.body.appendChild(root);

    const toggle = root.querySelector(".site-chat__toggle");
    const panel = root.querySelector(".site-chat__panel");
    const close = root.querySelector(".site-chat__close");
    const messagesEl = root.querySelector(".site-chat__messages");
    const form = root.querySelector(".site-chat__form");
    const input = root.querySelector(".site-chat__input");
    const sendButton = root.querySelector(".site-chat__send");
    const history = [];

    function escapeHtml(text) {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function linkify(text) {
        let html = escapeHtml(text);
        const links = [];

        function storeLink(href, label, extra = "") {
            const token = `__CHAT_LINK_${links.length}__`;
            links.push(`<a href="${href}"${extra}>${label}</a>`);
            return token;
        }

        html = html.replace(/\[Contatti\]\(\s*\/\s*contatti\s*\/\s*contatti\.html\s*\)/gi, function () {
            return storeLink("/contatti/contatti.html", "Contatti");
        });

        html = html.replace(/\[([^\]]+)\]\((\/(?:home|servizi|progetti|personalizzazione|contatti)\/[^)\s]+)\)/g, function (_match, label, href) {
            return storeLink(href, label);
        });

        html = html.replace(/\\?\[link al form dei contatti\]/gi, function () {
            return storeLink("/contatti/contatti.html", "link al form dei contatti");
        });

        html = html.replace(/\\?\[form dei contatti\]/gi, function () {
            return storeLink("/contatti/contatti.html", "form dei contatti");
        });

        html = html.replace(/\/\s*contatti\s*\/\s*contatti\.html/gi, function () {
            return storeLink("/contatti/contatti.html", "/contatti/contatti.html");
        });

        html = html.replace(/\/(?:home|servizi|progetti|personalizzazione|contatti)\/[^\s)<]+/g, function (href) {
            return storeLink(href, href);
        });

        html = html.replace(/([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/gi, function (email) {
            return storeLink(`mailto:${email}`, email);
        });

        html = html.replace(/(^|[\s])@([a-z0-9._]+)/gi, function (_match, prefix, username) {
            return `${prefix}${storeLink(`https://www.instagram.com/${username}`, `@${username}`, ' target="_blank" rel="noopener"')}`;
        });

        links.forEach(function (link, index) {
            html = html.replace(`__CHAT_LINK_${index}__`, link);
        });

        return html;
    }

    function addMessage(role, content) {
        const message = document.createElement("div");
        message.className = `site-chat__message site-chat__message--${role}`;
        message.innerHTML = role === "assistant" ? linkify(content) : escapeHtml(content);
        messagesEl.appendChild(message);
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    function setOpen(isOpen) {
        panel.hidden = !isOpen;
        toggle.setAttribute("aria-expanded", String(isOpen));

        if (isOpen && !history.length) {
            const welcome = "Ciao, sono l'assistente del sito. Posso aiutarti a capire quale servizio fa per te, raccontarti i progetti o indirizzarti ai contatti.";
            addMessage("assistant", welcome);
            history.push({ role: "assistant", content: welcome });
        }

        if (isOpen) {
            input.focus();
        }
    }

    toggle.addEventListener("click", () => {
        setOpen(panel.hidden);
    });

    close.addEventListener("click", () => {
        setOpen(false);
    });

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        const text = input.value.trim();
        if (!text) {
            return;
        }

        input.value = "";
        addMessage("user", text);
        history.push({ role: "user", content: text });

        sendButton.disabled = true;
        const loadingText = "Sto pensando...";
        addMessage("assistant", loadingText);
        const loadingEl = messagesEl.lastElementChild;

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: history.slice(-8) })
            });

            const data = await response.json();
            const reply = response.ok
                ? data.reply
                : "Non riesco a collegarmi al modello locale. Verifica che Ollama sia avviato.";

            loadingEl.innerHTML = linkify(reply);
            history.push({ role: "assistant", content: reply });
        } catch (error) {
            loadingEl.textContent = "Errore di connessione. Avvia il sito con `npm start` e controlla che Ollama sia attivo.";
        } finally {
            sendButton.disabled = false;
            input.focus();
        }
    });
})();
