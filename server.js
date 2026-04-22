const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT || 3000);
const OLLAMA_URL = process.env.OLLAMA_URL || "http://127.0.0.1:11434/api/chat";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.2:3b";
const ROOT = __dirname;

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".JPG": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp"
};

const services = [
  "Parliamo della tua casa: consulenza personalizzata gratuita e senza impegno per chiarire dubbi, esigenze, budget e primi passi.",
  "Progettazione preliminare: analisi esigenze, studio dello stato di fatto, proposte distributive e moodboard.",
  "Modellazione 3D: immagini e viste tridimensionali per visualizzare il progetto prima della realizzazione.",
  "Progettazione esecutiva: rilievo, tavole tecniche, schemi impianti, elaborati per imprese e artigiani.",
  "Pratiche edilizie: analisi documentale, redazione pratica e deposito presso gli enti competenti.",
  "Pratiche catastali: gestione aggiornamenti catastali e documentazione collegata.",
  "Assistenza nella gestione del cantiere: supporto al cliente durante la fase realizzativa.",
  "Consulenza materiali, arredi, finiture e illuminazione: supporto nella scelta di elementi, palette e dettagli."
];

function readChatKnowledge() {
  try {
    return fs.readFileSync(path.join(ROOT, "chat-knowledge.md"), "utf8");
  } catch (error) {
    return "";
  }
}

function readProjectsContext() {
  try {
    const raw = fs.readFileSync(path.join(ROOT, "data", "progetti.json"), "utf8");
    const projects = JSON.parse(raw);
    return projects.map((project) => {
      const description = String(project.descrizione || "").replace(/\s+/g, " ").slice(0, 700);
      const link = `/progetti/progetto.html?p=${project.slug}`;
      return `${project.titolo}: ${project.sottotitolo}. Link: ${link}. Luogo: ${project.luogo}. Anno: ${project.anno}. Tipologia: ${project.tipologia}. Superficie: ${project.superficie}. ${description}`;
    });
  } catch (error) {
    return [];
  }
}

function readProjects() {
  try {
    const raw = fs.readFileSync(path.join(ROOT, "data", "progetti.json"), "utf8");
    return JSON.parse(raw);
  } catch (error) {
    return [];
  }
}

const projects = readProjects();

function sendJson(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body)
  });
  res.end(body);
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 100_000) {
        req.destroy();
        reject(new Error("Payload troppo grande"));
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function isContactRequest(messages) {
  const lastUserMessage = getLastUserMessage(messages);
  if (!lastUserMessage) {
    return false;
  }

  return /contatt|appuntament|preventiv|scriv|email|mail|telefono|informazioni/i.test(lastUserMessage.content);
}

function getLastUserMessage(messages) {
  return [...messages].reverse().find((message) => message.role === "user");
}

function isProjectListRequest(messages) {
  const lastUserMessage = getLastUserMessage(messages);
  if (!lastUserMessage) {
    return false;
  }

  return /lista.*progett|elenco.*progett|quali.*progett|progetti.*sito|link.*progett|link.*questi/i.test(lastUserMessage.content);
}

function buildProjectsListReply() {
  const projectLines = projects.map((project) => {
    const link = `/progetti/progetto.html?p=${project.slug}`;
    return `- [${project.titolo}](${link}) — ${project.sottotitolo}. ${project.luogo}, ${project.anno}.`;
  });

  return `Certo, questi sono i progetti presenti sul sito:\n\n${projectLines.join("\n")}`;
}

function isConsultationRequest(messages) {
  const lastUserMessage = getLastUserMessage(messages);
  return lastUserMessage
    ? /consulenz|preventiv|iniziare|inizio|non so da dove partire|che servizio/i.test(lastUserMessage.content)
    : false;
}

function isPrivacyRequest(messages) {
  const lastUserMessage = getLastUserMessage(messages);
  return lastUserMessage
    ? /privacy|dati personali|trattamento dati|informativa/i.test(lastUserMessage.content)
    : false;
}

function buildContactReply(messages) {
  const lastUserMessage = getLastUserMessage(messages);
  const asksPhone = lastUserMessage && /telefono|telefon|numero/i.test(lastUserMessage.content);

  if (asksPhone) {
    return "Sul sito non e indicato un numero di telefono. Puoi contattare Caterina tramite il form [Contatti](/contatti/contatti.html) oppure scrivere a dibernardocaterina@gmail.com.";
  }

  return "Puoi contattare Caterina tramite il form [Contatti](/contatti/contatti.html), oppure scrivere direttamente a dibernardocaterina@gmail.com. Puoi anche trovarla su Instagram: @cate.dibernardo.";
}

function buildConsultationReply() {
  return "Per richiedere una consulenza puoi usare il percorso guidato [Crea la tua consulenza](/personalizzazione/personalizzazione.html). In alternativa puoi inviare una richiesta dal form [Contatti](/contatti/contatti.html) o scrivere a dibernardocaterina@gmail.com.";
}

function buildPrivacyReply() {
  return "Per informazioni sul trattamento dei dati puoi consultare la pagina [Privacy](/contatti/privacy/privacy.html).";
}

function normalizeText(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function projectAliases(project) {
  return [
    project.titolo,
    project.slug,
    String(project.slug || "").replace(/-/g, " ")
  ].map(normalizeText);
}

function findProjectInText(text) {
  const haystack = normalizeText(text);
  return projects.find((project) => projectAliases(project).some((alias) => alias && haystack.includes(alias)));
}

function findProjectInConversation(messages) {
  for (const message of [...messages].reverse()) {
    const project = findProjectInText(message.content);
    if (project) {
      return project;
    }
  }

  return null;
}

function findRequestedProject(messages, reply) {
  const lastUserMessage = getLastUserMessage(messages);
  const lastUserText = lastUserMessage ? lastUserMessage.content : "";

  if (/primo progetto|primo lavoro|primo caso/i.test(lastUserText)) {
    return projects[0] || null;
  }

  return findProjectInText(lastUserText) || findProjectInConversation(messages) || findProjectInText(reply);
}

function isProjectLinkRequest(messages) {
  const lastUserMessage = getLastUserMessage(messages);
  return lastUserMessage
    ? /link|pagina|aprire|vedere|mandami|inviami/i.test(lastUserMessage.content)
    : false;
}

function isProjectFactRequest(messages) {
  const lastUserMessage = getLastUserMessage(messages);
  return lastUserMessage
    ? /mq|metri quadri|superficie|quanto grande|grandezza|dimensione|dove|luogo|anno|quando|tipologia|committen|committente/i.test(lastUserMessage.content)
    : false;
}

function buildProjectReply(messages) {
  const project = findRequestedProject(messages, "");
  if (!project) {
    return null;
  }

  const link = `/progetti/progetto.html?p=${project.slug}`;
  const lastUserMessage = getLastUserMessage(messages);
  const lastUserText = lastUserMessage ? lastUserMessage.content : "";

  if (/primo progetto|primo lavoro|primo caso/i.test(lastUserText) && !isProjectFactRequest(messages)) {
    return `Il primo progetto del sito e [${project.titolo}](${link}).`;
  }

  if (isProjectLinkRequest(messages)) {
    return `Certo, trovi il progetto qui: [${project.titolo}](${link}).`;
  }

  if (/mq|metri quadri|superficie|quanto grande|grandezza|dimensione/i.test(lastUserText)) {
    return `[${project.titolo}](${link}) ha una superficie di ${project.superficie}.`;
  }

  if (/dove|luogo/i.test(lastUserText)) {
    return `[${project.titolo}](${link}) si trova a ${project.luogo}.`;
  }

  if (/anno|quando/i.test(lastUserText)) {
    return `[${project.titolo}](${link}) e un progetto del ${project.anno}.`;
  }

  if (/tipologia/i.test(lastUserText)) {
    return `[${project.titolo}](${link}) e un progetto di tipologia ${project.tipologia}.`;
  }

  if (/committen|committente/i.test(lastUserText)) {
    return `Per [${project.titolo}](${link}) il committente indicato e: ${project.commitente}.`;
  }

  return null;
}

function isSurfaceRequest(messages) {
  const lastUserMessage = [...messages].reverse().find((message) => message.role === "user");
  return lastUserMessage
    ? /mq|metri quadri|superficie|quanto grande|grandezza|dimensione/i.test(lastUserMessage.content)
    : false;
}

function ensureProjectFacts(reply, messages) {
  if (!isSurfaceRequest(messages)) {
    return reply;
  }

  const project = findRequestedProject(messages, reply);
  if (!project || !project.superficie) {
    return reply;
  }

  const link = `/progetti/progetto.html?p=${project.slug}`;
  return `[${project.titolo}](${link}) ha una superficie di ${project.superficie}.`;
}

function buildDirectReply(messages) {
  if (isProjectListRequest(messages)) {
    return buildProjectsListReply();
  }

  const projectReply = buildProjectReply(messages);
  if (projectReply) {
    return projectReply;
  }

  if (isPrivacyRequest(messages)) {
    return buildPrivacyReply();
  }

  if (isConsultationRequest(messages)) {
    return buildConsultationReply();
  }

  if (isContactRequest(messages)) {
    return buildContactReply(messages);
  }

  return null;
}

function replacePlainInternalLinks(reply) {
  let normalizedReply = reply;

  const internalLinks = [
    { path: "/home/index.html", label: "Home" },
    { path: "/servizi/servizi.html", label: "Servizi" },
    { path: "/progetti/progetti.html", label: "Progetti" },
    { path: "/personalizzazione/personalizzazione.html", label: "Crea la tua consulenza" },
    { path: "/contatti/contatti.html", label: "Contatti" },
    { path: "/contatti/privacy/privacy.html", label: "Privacy" },
    ...projects.map((project) => ({
      path: `/progetti/progetto.html?p=${project.slug}`,
      label: project.titolo
    }))
  ];

  internalLinks.forEach(({ path: linkPath, label }) => {
    const escapedPath = linkPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const markdownLinkPattern = new RegExp(`\\[[^\\]]+\\]\\(${escapedPath}\\)`, "g");
    const placeholders = [];

    normalizedReply = normalizedReply.replace(markdownLinkPattern, (match) => {
      const token = `__LINK_PLACEHOLDER_${placeholders.length}__`;
      placeholders.push({ token, match });
      return token;
    });

    normalizedReply = normalizedReply.replace(new RegExp(escapedPath, "g"), `[${label}](${linkPath})`);

    placeholders.forEach(({ token, match }) => {
      normalizedReply = normalizedReply.replace(token, match);
    });
  });

  return normalizedReply;
}

function buildOllamaContext(messages) {
  const lastUserMessage = getLastUserMessage(messages);
  const lastUserText = lastUserMessage ? lastUserMessage.content : "";
  const project = findProjectInText(lastUserText) || findProjectInConversation(messages);
  const context = [
    readChatKnowledge(),
    "Rispondi solo usando le informazioni di contesto. Se manca un dato certo, proponi il form Contatti.",
    "Non mostrare URL grezzi: usa link Markdown con etichetta leggibile."
  ];

  if (project) {
    const description = String(project.descrizione || "").replace(/\s+/g, " ").slice(0, 1400);
    context.push(
      "Progetto rilevante:",
      `${project.titolo}. Link: /progetti/progetto.html?p=${project.slug}. Sottotitolo: ${project.sottotitolo}. Luogo: ${project.luogo}. Anno: ${project.anno}. Tipologia: ${project.tipologia}. Superficie: ${project.superficie}. ${description}`
    );
  } else if (/progett|casa|ristruttur/i.test(lastUserText)) {
    context.push("Progetti disponibili:", ...readProjectsContext());
  }

  if (/serviz|consulenz|ristruttur|cantiere|pratic|catast|material|arred|3d|render|layout/i.test(lastUserText)) {
    context.push("Servizi disponibili:", ...services);
  }

  return context.join("\n");
}

function enrichReply(reply) {
  return replacePlainInternalLinks(reply);
}

async function handleChat(req, res) {
  try {
    const rawBody = await readRequestBody(req);
    const body = JSON.parse(rawBody || "{}");
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const safeMessages = messages
      .filter((message) => ["user", "assistant"].includes(message.role) && typeof message.content === "string")
      .slice(-8)
      .map((message) => ({
        role: message.role,
        content: message.content.slice(0, 1200)
      }));

    if (!safeMessages.length) {
      sendJson(res, 400, { error: "Messaggio mancante." });
      return;
    }

    const directReply = buildDirectReply(safeMessages);
    if (directReply) {
      sendJson(res, 200, {
        reply: replacePlainInternalLinks(directReply)
      });
      return;
    }

    const ollamaResponse = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        stream: false,
        messages: [
          {
            role: "system",
            content: buildOllamaContext(safeMessages)
          },
          ...safeMessages
        ],
        options: {
          temperature: 0.3,
          num_predict: 450
        }
      })
    });

    if (!ollamaResponse.ok) {
      const detail = await ollamaResponse.text();
      sendJson(res, 502, { error: "Ollama non ha risposto correttamente.", detail });
      return;
    }

    const data = await ollamaResponse.json();
    const reply = data && data.message && data.message.content
      ? data.message.content
      : "Non sono riuscita a generare una risposta. Riprova tra poco.";

    sendJson(res, 200, {
      reply: enrichReply(reply)
    });
  } catch (error) {
    sendJson(res, 500, {
      error: "Errore chat locale.",
      detail: error.message
    });
  }
}

function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  let pathname = decodeURIComponent(url.pathname);

  if (pathname === "/") {
    res.writeHead(302, { Location: "/home/index.html" });
    res.end();
    return;
  }

  const filePath = path.normalize(path.join(ROOT, pathname));

  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.stat(filePath, (statError, stats) => {
    if (statError || !stats.isFile()) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }

    const ext = path.extname(filePath);
    res.writeHead(200, {
      "Content-Type": mimeTypes[ext] || "application/octet-stream"
    });
    fs.createReadStream(filePath).pipe(res);
  });
}

const server = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/api/chat") {
    handleChat(req, res);
    return;
  }

  if (req.method === "GET" || req.method === "HEAD") {
    serveStatic(req, res);
    return;
  }

  res.writeHead(405);
  res.end("Method not allowed");
});

server.listen(PORT, () => {
  console.log(`Sito locale: http://localhost:${PORT}`);
  console.log(`Chat Ollama: modello ${OLLAMA_MODEL}`);
});
