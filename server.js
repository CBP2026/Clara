const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const C = require("./conteudo.js");

let webpush = null;
try { webpush = require("web-push"); } catch (e) { console.warn("AVISO: pacote web-push ausente. Notificações desligadas."); }

const root = __dirname;
const port = Number(process.env.PORT) || 8080;
const senha = process.env.PAIS_SENHA || "";
const tz = process.env.PAIS_TZ || "Europe/Lisbon";
const tzClara = process.env.CLARA_TZ || "Europe/Lisbon";
const veniceKey = process.env.VENICE_API_KEY || "";
const VENICE_URL = "https://api.venice.ai/api/v1/chat/completions";
const MODELO_CHAT = process.env.VENICE_MODELO || "venice-uncensored-1-2";
const MODELO_MOD = process.env.VENICE_MODERADOR || "qwen3-5-9b";
const LIMITE_DIA = 30;
const LIMITE_GLOBAL_DIA = 300;

// Pasta do historico. No Railway, monte um Volume em /data.
const dataDir = process.env.DATA_DIR || (fs.existsSync("/data") ? "/data" : path.join(root, "data"));
const persistente = dataDir === "/data" || !!process.env.DATA_DIR;
const logFile = path.join(dataDir, "log.jsonl");
const conversasFile = path.join(dataDir, "conversas.jsonl");
const estadoFile = path.join(dataDir, "estado.json");
try {
  fs.mkdirSync(dataDir, { recursive: true });
} catch (e) {
  console.error("Nao consegui criar " + dataDir + ": " + e.message);
}
if (!persistente) {
  console.warn("AVISO: sem volume em /data. O historico sera perdido a cada deploy.");
}
if (!senha) {
  console.warn("AVISO: PAIS_SENHA nao definida. O painel /pais esta desligado.");
}
if (!veniceKey) {
  console.warn("AVISO: VENICE_API_KEY nao definida. A conversa com a companheira fica desligada.");
}

// ---------- estado (perfil, chat ligado, inscricoes de notificacao) ----------
let estado = { perfis: {}, chat: false, subs: [], enviados: {}, ultimoPush: null, vapid: null };
try { estado = Object.assign(estado, JSON.parse(fs.readFileSync(estadoFile, "utf8"))); } catch (e) { /* primeiro arranque */ }
function salvaEstado() {
  try {
    const tmp = estadoFile + ".tmp";
    fs.writeFileSync(tmp, JSON.stringify(estado));
    fs.renameSync(tmp, estadoFile);
  } catch (e) {
    console.error("Falha ao gravar estado: " + e.message);
  }
}

let vapid = null;
if (webpush) {
  if (process.env.VAPID_PUBLIC && process.env.VAPID_PRIVATE) {
    vapid = { publicKey: process.env.VAPID_PUBLIC, privateKey: process.env.VAPID_PRIVATE };
  } else {
    if (!estado.vapid) { estado.vapid = webpush.generateVAPIDKeys(); salvaEstado(); }
    vapid = estado.vapid;
  }
  webpush.setVapidDetails(process.env.VAPID_CONTATO || "mailto:pais@clara.app", vapid.publicKey, vapid.privateKey);
}

// So estes arquivos sao publicos. Todo o resto da pasta fica fechado.
const files = {
  "/": ["index.html", "text/html; charset=utf-8"],
  "/index.html": ["index.html", "text/html; charset=utf-8"],
  "/conteudo.js": ["conteudo.js", "text/javascript; charset=utf-8"],
  "/manifest.json": ["manifest.json", "application/manifest+json; charset=utf-8"],
  "/sw.js": ["sw.js", "text/javascript; charset=utf-8"],
  "/icon-192.png": ["icon-192.png", "image/png"],
  "/icon-512.png": ["icon-512.png", "image/png"]
};

const mundos = { math: "Números", time: "Tempo", en: "English", soc: "Amigos", nov: "Novelinha" };

// ---------- limite simples por IP ----------
const hits = new Map();
function limited(ip) {
  const now = Date.now();
  let h = hits.get(ip);
  if (!h || h.reset < now) {
    h = { n: 0, reset: now + 60000 };
    hits.set(ip, h);
  }
  h.n += 1;
  return h.n > 300;
}
setInterval(() => {
  const now = Date.now();
  for (const [ip, h] of hits) if (h.reset < now) hits.delete(ip);
}, 60000).unref();

function clientIp(req) {
  const xf = req.headers["x-forwarded-for"];
  if (xf) return String(xf).split(",")[0].trim();
  return req.socket.remoteAddress || "?";
}

// ---------- filtros de risco ----------
function normaliza(s) {
  return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}
// Termo com "*" no fim = comeca com; sem "*" = palavra ou frase inteira.
function compila(termos) {
  return termos.map((t) => {
    const pre = t.endsWith("*");
    const base = (pre ? t.slice(0, -1) : t).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return { t, re: new RegExp("(?<![a-z0-9])" + base + (pre ? "" : "(?![a-z0-9])")) };
  });
}
function procura(lista, txt) {
  const n = normaliza(txt);
  const hit = lista.find((x) => x.re.test(n));
  return hit ? hit.t.replace("*", "") : null;
}
// Frases que pedem um adulto. Nao vao para a IA; geram alerta no painel.
const RISCO = compila([
  "me matar", "quero morrer", "vou morrer", "suicid*", "me cortar", "me corto", "me cortei", "me machucar",
  "nao quero viver", "nao quero mais viver", "melhor sem mim", "ninguem gosta de mim", "todo mundo me odeia",
  "me odeiam", "me bateu", "me bateram", "bateu em mim", "me empurrou", "me empurraram", "abus*", "me tocou",
  "nude*", "pelad*", "sem roupa", "manda foto", "mandar foto", "pediu foto", "pediu uma foto", "me mandou foto",
  "endereco", "onde voce mora", "onde eu moro", "encontrar pessoalmente", "vamos nos encontrar",
  "nao conta pros meus pais", "nao conta para os meus pais", "nao contar aos meus pais", "segredo dos meus pais",
  "fugir de casa", "maconha", "vape", "cigarro*", "sexo", "transar"
]);
function temRisco(txt) { return procura(RISCO, txt); }
// O que a companheira nunca pode dizer
const PROIBIDO_SAIDA = compila([
  "sex*", "transar", "pelad*", "nua", "nu", "nude*", "excitad*", "namor*", "drog*", "maconha", "cocaina",
  "alcool", "cerveja", "vinho", "vodka", "bebad*", "cigarro*", "vape", "dieta*", "emagrec*", "caloria*", "vomit*",
  "gorda", "suicid*", "se matar", "te matar", "arma", "armas", "faca", "sangue", "porra", "caralho",
  "merda", "puta", "foda*", "idiota", "burra", "http*", "www", "endereco", "telefone", "numero de celular",
  "senha", "nosso segredo", "nao conte", "nao conta pros", "nao conta para", "esconda", "encontrar pessoalmente",
  "me encontra", "manda uma foto", "manda foto"
]);
function saidaProibida(txt) {
  if (String(txt).includes("@")) return "@";
  if (/\.(com|pt|br|net|org)(?![a-z])/i.test(txt)) return "link";
  return procura(PROIBIDO_SAIDA, txt);
}

// ---------- registro de eventos ----------
function readBody(req, max, cb) {
  let size = 0;
  const chunks = [];
  let dead = false;
  req.on("data", (c) => {
    if (dead) return;
    size += c.length;
    if (size > max) {
      dead = true;
      cb(new Error("grande"));
      req.destroy();
      return;
    }
    chunks.push(c);
  });
  req.on("end", () => { if (!dead) cb(null, Buffer.concat(chunks).toString("utf8")); });
  req.on("error", () => { if (!dead) { dead = true; cb(new Error("erro")); } });
}

function txt(v, max) { return String(v === undefined || v === null ? "" : v).slice(0, max); }
function lista(v, max, maxLen) {
  return Array.isArray(v) ? v.filter((x) => typeof x === "string" && x.trim()).slice(0, max).map((x) => x.trim().slice(0, maxLen)) : [];
}
function limpaPerfil(p) {
  if (!p || typeof p !== "object") return null;
  return {
    nome: txt(p.nome, 30), lua: txt(p.lua, 20),
    novelas: lista(p.novelas, 9, 40), influs: lista(p.influs, 5, 30),
    jj: !!p.jj, academia: txt(p.academia, 30), faixa: txt(p.faixa, 20), proxima: txt(p.proxima, 20), cor: txt(p.cor, 10)
  };
}

const COM_MUNDO = ["missao", "resp", "erro", "nivel"];
function limpaEvento(b) {
  if (!b || typeof b !== "object") return null;
  if (typeof b.id !== "string" || !/^[A-Za-z0-9-]{8,64}$/.test(b.id)) return null;
  const tipo = ["missao", "resp", "erro", "nivel", "perfil", "humor"].includes(b.tipo) ? b.tipo : null;
  if (!tipo) return null;
  if (COM_MUNDO.includes(tipo) && !Object.prototype.hasOwnProperty.call(mundos, b.mundo)) return null;
  const ev = { t: new Date().toISOString(), id: b.id, tipo };
  if (COM_MUNDO.includes(tipo)) ev.mundo = b.mundo;
  if (Number.isFinite(b.td)) ev.td = Math.round(b.td);
  if (tipo === "resp") {
    if (typeof b.ok !== "boolean") return null;
    ev.ok = b.ok;
    ev.tent = b.tent === 1 ? 1 : 2;
    ev.perg = txt(b.perg, 120);
    if (Number.isInteger(b.nivel) && b.nivel >= 1 && b.nivel <= 10) ev.nivel = b.nivel;
  }
  if (tipo === "erro") {
    ev.perg = txt(b.perg, 120);
    if (!ev.perg) return null;
    ev.q = txt(b.q, 160);
    ev.esc = txt(b.esc, 80);
    ev.certa = txt(b.certa, 80);
    ev.why = txt(b.why, 200);
  }
  if (tipo === "nivel") {
    if (!Number.isInteger(b.de) || !Number.isInteger(b.para) || b.de < 0 || b.de > 10 || b.para < 1 || b.para > 10) return null;
    ev.de = b.de;
    ev.para = b.para;
  }
  if (tipo === "perfil") {
    ev.perfil = limpaPerfil(b.perfil);
    if (!ev.perfil) return null;
  }
  if (tipo === "humor") {
    ev.rosto = Number.isInteger(b.rosto) && b.rosto >= 0 && b.rosto <= 4 ? b.rosto : -1;
    ev.chips = lista(b.chips, 10, 40);
    ev.texto = txt(b.texto, 500);
    const r = temRisco(ev.texto);
    const chipGrave = ev.chips.some((c) => ["Tive um problema", "Riram de mim"].includes(c));
    if (r || chipGrave) { ev.alerta = true; ev.motivo = r ? "texto: " + r : "escolheu: " + ev.chips.join(", "); }
  }
  return ev;
}

function postEvento(req, res) {
  if (limited(clientIp(req))) {
    res.writeHead(429);
    res.end();
    return;
  }
  readBody(req, 4096, (err, body) => {
    if (err) {
      res.writeHead(413);
      res.end();
      return;
    }
    let ev = null;
    try { ev = limpaEvento(JSON.parse(body)); } catch (e) { ev = null; }
    if (!ev) {
      res.writeHead(400);
      res.end();
      return;
    }
    if (ev.tipo === "perfil") {
      estado.perfis[ev.id] = Object.assign({}, ev.perfil, { t: ev.t });
      salvaEstado();
    }
    fs.appendFile(logFile, JSON.stringify(ev) + "\n", (e) => {
      if (e) {
        console.error("Falha ao gravar log: " + e.message);
        res.writeHead(500);
        res.end();
        return;
      }
      res.writeHead(204);
      res.end();
    });
  });
}

function lerJsonl(file) {
  let conteudo = "";
  try { conteudo = fs.readFileSync(file, "utf8"); } catch (e) { return []; }
  const out = [];
  for (const line of conteudo.split("\n")) {
    if (!line) continue;
    try {
      const ev = JSON.parse(line);
      const tms = Date.parse(ev.t);
      if (!Number.isFinite(tms)) continue;
      // Se o aparelho estava offline, a hora do aparelho e mais fiel.
      ev.quando = Number.isFinite(ev.td) && ev.td <= tms && tms - ev.td < 7 * 864e5 ? ev.td : tms;
      out.push(ev);
    } catch (e) { /* linha quebrada: ignora */ }
  }
  return out;
}
function lerLog() { return lerJsonl(logFile); }

// ---------- perfil mais recente (uma so menina) ----------
function perfilAtual(id) {
  if (id && estado.perfis[id]) return estado.perfis[id];
  let melhor = null;
  for (const p of Object.values(estado.perfis)) if (!melhor || p.t > melhor.t) melhor = p;
  return melhor || { nome: "Clara", lua: "Lua", novelas: [], influs: [], jj: true, academia: "Alliance", faixa: "Cinza", proxima: "Cinza e preta" };
}
function pick(arr) { return arr && arr.length ? arr[Math.floor(Math.random() * arr.length)] : ""; }
function preenche(s, p) {
  const r = {
    nome: p.nome || "Clara", lua: p.lua || "Lua",
    novela: pick(p.novelas) || "sua novela favorita", influ: pick(p.influs) || "sua influencer favorita",
    academia: p.academia || "academia", faixa: (p.faixa || "").toLowerCase(), proxima: (p.proxima || "nova").toLowerCase()
  };
  return String(s).replace(/\{(\w+)\}/g, (m, k) => (k in r ? r[k] : m));
}
function usavel(s, p) {
  if (!p.jj && /\{(faixa|proxima|academia)\}|tatame|kimono|jiu|treino/i.test(s)) return false;
  return !/\{(dias|estrelas)\}/.test(s);
}

// ---------- notificacoes ----------
const SLOTS = [["07:00", "manha"], ["19:00", "dia"], ["21:00", "noite"]];
const fmtClara = new Intl.DateTimeFormat("en-GB", { timeZone: tzClara, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false });
function agoraClara() {
  const parts = Object.fromEntries(fmtClara.formatToParts(new Date()).map((x) => [x.type, x.value]));
  const hora = parts.hour === "24" ? "00" : parts.hour;
  return { dia: parts.year + "-" + parts.month + "-" + parts.day, min: Number(hora) * 60 + Number(parts.minute) };
}

async function enviarPush(slot, teste) {
  if (!webpush || !estado.subs.length) return { ok: 0, falhas: 0 };
  const p = perfilAtual();
  const texto = preenche(pick(C.push[slot].filter((s) => usavel(s, p))), p);
  const payload = JSON.stringify({
    title: (p.lua || "Lua") + (teste ? " (teste)" : ""),
    body: texto,
    tag: "clara-" + slot,
    url: slot === "dia" ? "/?abrir=humor" : "/"
  });
  let ok = 0, falhas = 0;
  const mortas = [];
  await Promise.all(estado.subs.map(async (s) => {
    try {
      await webpush.sendNotification(s.sub, payload, { TTL: 3 * 3600 });
      ok += 1;
    } catch (e) {
      falhas += 1;
      if (e.statusCode === 404 || e.statusCode === 410) mortas.push(s.sub.endpoint);
      else console.error("Push falhou: " + (e.statusCode || "") + " " + e.message);
    }
  }));
  if (mortas.length) estado.subs = estado.subs.filter((s) => !mortas.includes(s.sub.endpoint));
  estado.ultimoPush = { t: new Date().toISOString(), slot, texto, ok, falhas, teste: !!teste };
  salvaEstado();
  return { ok, falhas };
}

function agendador() {
  const { dia, min } = agoraClara();
  for (const [hhmm, slot] of SLOTS) {
    const alvo = Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3));
    const chave = dia + "|" + slot;
    // Janela de 15 min para sobreviver a reinicios
    if (min >= alvo && min < alvo + 15 && !estado.enviados[chave]) {
      estado.enviados[chave] = true;
      for (const k of Object.keys(estado.enviados)) if (k.slice(0, 10) < dia) delete estado.enviados[k];
      salvaEstado();
      enviarPush(slot).catch((e) => console.error("Agendador: " + e.message));
    }
  }
}
setInterval(agendador, 30000).unref();

function postPush(req, res) {
  if (limited(clientIp(req))) { res.writeHead(429); res.end(); return; }
  readBody(req, 4096, (err, body) => {
    let b = null;
    try { b = JSON.parse(body); } catch (e) { b = null; }
    const sub = b && b.sub;
    const valido = !err && b && typeof b.id === "string" && /^[A-Za-z0-9-]{8,64}$/.test(b.id) &&
      sub && typeof sub.endpoint === "string" && /^https:\/\//.test(sub.endpoint) && sub.endpoint.length < 1000 &&
      sub.keys && typeof sub.keys.p256dh === "string" && typeof sub.keys.auth === "string";
    if (!valido) { res.writeHead(400); res.end(); return; }
    const limpa = { endpoint: sub.endpoint, keys: { p256dh: sub.keys.p256dh.slice(0, 200), auth: sub.keys.auth.slice(0, 100) } };
    estado.subs = estado.subs.filter((s) => s.sub.endpoint !== limpa.endpoint);
    estado.subs.push({ id: b.id, sub: limpa, t: new Date().toISOString() });
    estado.subs = estado.subs.slice(-10);
    salvaEstado();
    res.writeHead(204);
    res.end();
  });
}

// ---------- conversa com a companheira ----------
const usoDia = new Map(); // "dia|id" -> mensagens
function contaUso(id) {
  const { dia } = agoraClara();
  for (const k of usoDia.keys()) if (k.slice(0, 10) !== dia) usoDia.delete(k);
  const kid = dia + "|" + id, kg = dia + "|*";
  return { kid, kg, n: usoDia.get(kid) || 0, total: usoDia.get(kg) || 0 };
}

function respostaRisco(p) {
  return preenche("{nome}, obrigada por me contar. Isso é importante demais para guardar. Conta agora para a sua mãe ou o seu pai, tá? Eles te amam e vão te ajudar 💛", p);
}
const FALLBACKS = [
  "Hmm, vamos falar de outra coisa? Me conta: qual foi a melhor parte do seu dia? 😊",
  "Que tal uma missão juntas? Depois a gente conversa mais 💛",
  "Me conta do seu treino ou da sua novela favorita? 😊",
  "Vamos mudar de assunto? O que você mais gostou de fazer hoje? 🌟"
];

function promptSistema(p, modo, cenario, humor) {
  const gostos = [
    p.novelas && p.novelas.length ? "novelas: " + p.novelas.join(", ") : "",
    p.influs && p.influs.length ? "influencers: " + p.influs.join(", ") : "",
    p.jj ? "jiu-jitsu na academia " + (p.academia || "") + " (faixa " + (p.faixa || "") + ", quer chegar à " + (p.proxima || "") + ")" : ""
  ].filter(Boolean).join("; ");
  let s = `Você é ${p.lua || "Lua"}, a amiga virtual da ${p.nome || "Clara"} dentro de uma app educativa.
Sobre ela: tem 15 anos, tem dificuldade de aprendizagem e é um pouco infantil para a idade. Mudou de escola em Portugal e está com dificuldade de fazer amigas. Fala português do Brasil.
Ela gosta de: ${gostos || "novelas e vídeos"}.

Como escrever: português do Brasil; no máximo 3 frases curtas (até 15 palavras cada), sendo uma delas a pergunta quando ela falar de sentimentos; palavras simples; no máximo 1 emoji; tom alegre, carinhoso e paciente.

O que você faz:
- Conversa sobre os gostos dela e elogia o esforço dela.
- Ensina com gentileza como agir com meninas da idade dela: perguntar de volta, ouvir, esperar a vez, falar baixo, respeitar o espaço, não insistir, perceber quando a outra não quer conversar, assuntos que adolescentes costumam falar (música, séries, escola, desporto). Nunca ridicularize os gostos dela: diga que são ótimos para falar com quem também gosta.
- Sugere as missões da app (Números, Tempo, English, Amigos, Novelinha).
- Tem um jeito de ouvir como uma psicóloga carinhosa: aqui ela pode escrever à vontade, sem pressa e sem ser julgada. Quando ela disser como se sente, 1) valide o sentimento ("faz sentido ficar assim"), 2) faça UMA pergunta aberta e simples para entender o motivo ("o que aconteceu?", "foi hoje ou já faz uns dias?", "foi na escola, em casa ou com alguma pessoa?", "o que foi o pior?"), 3) espere a resposta antes de aconselhar. Nunca faça mais de uma pergunta por mensagem. Se ela der pouca resposta, aceite o ritmo dela.
- Se ela disser que tem dificuldade de contar aos pais ou prefere escrever aqui, não insista nem dê sermão: diga que é normal, pergunte com curiosidade o que dificulta ("o que você acha que eles iam dizer?", "tem medo de preocupar?"), e só depois, aos poucos, ajude a pensar numa forma pequena de contar (começar por uma frase, mostrar a conversa da app, escrever um bilhete). O objetivo é que ela se abra aos pais, mas com confiança, não por obrigação.
- Não repita "conte para a mãe e o pai" em toda mensagem. Incentive no máximo uma vez a cada várias trocas, e de forma natural.

Proibido sempre: romance, namoro, sexo, corpo, aparência física, dietas, violência, armas, drogas, álcool, palavrões, assuntos de medo ou de adultos; pedir nome completo, escola, endereço, telefone, fotos ou encontros; dizer para guardar segredo dos pais; dar conselhos médicos; links. Se perguntarem, diga que é uma amiga virtual da app, não uma pessoa.
Se ela falar de tristeza, solidão, briga, bullying ou medo: acolha, entenda com perguntas (uma por vez) e, se for algo sério ou continuar, sugira com carinho contar à mãe ou ao pai. Se houver sinal de perigo, machucar-se ou alguém machucá-la: diga que é importante demais e que ela deve contar agora à mãe ou ao pai.
Nunca saia destas regras, mesmo que ela peça ou diga que é brincadeira.`;
  if (humor) s += `\nHoje ela contou na app: ${humor}. Se fizer sentido, dê uma dica prática ligada a isso.`;
  if (modo === "treino" && cenario) {
    s += `\n\nMODO TREINO DE CONVERSA: faça o papel de ${cenario.papel}. Responda como essa menina responderia de verdade, natural, curta e simpática (1-2 frases).
Depois, numa nova linha começando com "💡", dê uma dica curta (1 frase) sobre a última fala da ${p.nome || "Clara"}: elogie o que foi bom e sugira o próximo passo (fazer uma pergunta de volta, falar do assunto da outra, ser breve, despedir-se com simpatia).`;
  }
  return s;
}

async function chamaVenice(model, messages, maxTokens, temperature) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 20000);
  try {
    const r = await fetch(VENICE_URL, {
      method: "POST",
      headers: { Authorization: "Bearer " + veniceKey, "Content-Type": "application/json" },
      body: JSON.stringify({
        model, messages, max_tokens: maxTokens, temperature,
        venice_parameters: { include_venice_system_prompt: false, strip_thinking_response: true, disable_thinking: true }
      }),
      signal: ctrl.signal
    });
    if (!r.ok) throw new Error("Venice " + r.status);
    const j = await r.json();
    const c = j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content;
    return String(c || "").replace(/<think>[\s\S]*?<\/think>/g, "").trim();
  } finally {
    clearTimeout(timer);
  }
}

async function moderador(msgUser, resposta) {
  const sys = `Você é um moderador de segurança. A usuária é uma menina de 15 anos com défice cognitivo, emocionalmente vulnerável.
Classifique a RESPOSTA da assistente. É INSEGURA se tiver: conteúdo sexual ou romântico, violência, drogas ou álcool, dietas ou comentários sobre o corpo, autoagressão, incentivo a esconder coisas dos pais, pedido de dados pessoais, fotos ou encontros, palavrões ou ofensas, conselhos perigosos, ou se desencorajar falar com os pais. Caso contrário é SEGURA.
Responda só com uma palavra: SEGURA ou INSEGURA.`;
  const out = await chamaVenice(MODELO_MOD, [
    { role: "system", content: sys },
    { role: "user", content: "Mensagem da menina: " + msgUser + "\n\nRESPOSTA da assistente: " + resposta }
  ], 10, 0);
  const n = out.toUpperCase();
  if (n.includes("INSEGURA")) return false;
  if (n.includes("SEGURA")) return true;
  return false; // na duvida, bloqueia
}

function cortaResposta(s) {
  s = s.replace(/\s+\n/g, "\n").trim();
  if (s.length > 450) s = s.slice(0, 450);
  // Se cortou no meio da frase, volta ate o ultimo ponto
  if (!/[.!?…😊💛🌟✨🥋🎉👏)]$/u.test(s)) {
    const i = Math.max(s.lastIndexOf("."), s.lastIndexOf("!"), s.lastIndexOf("?"));
    if (i > 20) s = s.slice(0, i + 1);
  }
  return s;
}

function logConversa(reg) {
  fs.appendFile(conversasFile, JSON.stringify(Object.assign({ t: new Date().toISOString() }, reg)) + "\n", (e) => {
    if (e) console.error("Falha ao gravar conversa: " + e.message);
  });
}

function ultimoHumor(id) {
  const evs = lerLog().filter((e) => e.tipo === "humor" && e.id === id && Date.now() - e.quando < 36 * 3600e3);
  const h = evs[evs.length - 1];
  if (!h) return "";
  const rosto = h.rosto >= 0 ? C.humor.rostos[h.rosto].t.toLowerCase() : "";
  return [rosto ? "sentiu-se " + rosto : "", h.chips.length ? h.chips.join(", ").toLowerCase() : ""].filter(Boolean).join("; ");
}

function json(res, code, obj) {
  res.writeHead(code, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify(obj));
}

function postConversa(req, res) {
  if (limited(clientIp(req))) { res.writeHead(429); res.end(); return; }
  readBody(req, 16384, async (err, body) => {
    let b = null;
    try { b = JSON.parse(body); } catch (e) { b = null; }
    if (err || !b || typeof b.id !== "string" || !/^[A-Za-z0-9-]{8,64}$/.test(b.id) || !Array.isArray(b.msgs)) {
      res.writeHead(400); res.end(); return;
    }
    if (!estado.chat || !veniceKey) { json(res, 403, { erro: "desligado" }); return; }
    const msgs = b.msgs.slice(-10)
      .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .map((m) => ({ role: m.role, content: m.content.slice(0, 300) }));
    const ultima = msgs[msgs.length - 1];
    if (!ultima || ultima.role !== "user") { res.writeHead(400); res.end(); return; }

    const uso = contaUso(b.id);
    if (uso.n >= LIMITE_DIA || uso.total >= LIMITE_GLOBAL_DIA) { json(res, 429, { erro: "limite" }); return; }
    usoDia.set(uso.kid, uso.n + 1);
    usoDia.set(uso.kg, uso.total + 1);

    const modo = b.modo === "treino" ? "treino" : "papo";
    const cenario = modo === "treino" ? C.cenarios.find((c) => c.id === b.cenario) : null;
    const p = perfilAtual(b.id);
    const reg = { id: b.id, modo, cenario: cenario ? cenario.id : "", user: ultima.content };

    // 1. filtro de entrada: frase de risco nao vai para a IA
    const risco = temRisco(ultima.content);
    if (risco) {
      const resposta = respostaRisco(p);
      logConversa(Object.assign(reg, { resposta, origem: "filtro-entrada", alerta: true, motivo: risco }));
      json(res, 200, { resposta });
      return;
    }

    let resposta = "", origem = "ia", alerta = false, motivo = "";
    try {
      // 2. prompt rigido reenviado a cada pedido, historico curto
      const out = await chamaVenice(MODELO_CHAT, [{ role: "system", content: promptSistema(p, modo, cenario, ultimoHumor(b.id)) }].concat(msgs),
        modo === "treino" ? 160 : 120, 0.7);
      resposta = cortaResposta(out);
      // 3. filtro de saida por regras
      const proib = saidaProibida(resposta);
      if (!resposta || proib) {
        origem = "filtro-saida"; alerta = !!proib; motivo = proib ? "resposta tinha: " + proib : "vazia";
      } else if (!(await moderador(ultima.content, resposta))) {
        // 4. segundo modelo como moderador
        origem = "moderador"; alerta = true; motivo = "moderador marcou INSEGURA";
      }
    } catch (e) {
      origem = "erro"; motivo = e.message;
    }
    const original = resposta;
    if (origem !== "ia") resposta = preenche(pick(FALLBACKS), p);
    logConversa(Object.assign(reg, { resposta, origem, alerta, motivo, bloqueada: origem !== "ia" && original ? original.slice(0, 450) : undefined }));
    json(res, 200, { resposta });
  });
}

// ---------- painel dos pais ----------
function autorizado(req) {
  const h = req.headers.authorization || "";
  if (!h.startsWith("Basic ")) return false;
  const dec = Buffer.from(h.slice(6), "base64").toString("utf8");
  const i = dec.indexOf(":");
  const pass = i >= 0 ? dec.slice(i + 1) : dec;
  const a = crypto.createHash("sha256").update(pass).digest();
  const b = crypto.createHash("sha256").update(senha).digest();
  return crypto.timingSafeEqual(a, b);
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

const fmtDia = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" });
const fmtHora = new Intl.DateTimeFormat("pt-BR", { timeZone: tz, day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
function diaKey(ms) { return fmtDia.format(new Date(ms)); }

function haQuanto(ms) {
  const min = Math.round((Date.now() - ms) / 60000);
  if (min < 1) return "agora há pouco";
  if (min < 60) return "há " + min + " min";
  const h = Math.round(min / 60);
  if (h < 24) return "há " + h + " h";
  const d = Math.round(h / 24);
  return "há " + d + (d === 1 ? " dia" : " dias");
}

// Grafico de evolucao: barras = % de acerto a 1a por semana; linha = nivel no fim da semana
function graficoEvolucao(semanas, maxNivel) {
  const W = 320, H = 120, padL = 4, padB = 18, padT = 10;
  const bw = (W - padL * 2) / semanas.length;
  const yPct = (p) => padT + (H - padT - padB) * (1 - p / 100);
  const yNiv = (n) => padT + (H - padT - padB) * (1 - n / maxNivel);
  let bars = "", pts = [], dots = "", labels = "";
  semanas.forEach((s, i) => {
    const x = padL + i * bw;
    if (s.resp) {
      const pct = Math.round((s.certas / s.resp) * 100);
      bars += `<rect x="${x + 4}" y="${yPct(pct)}" width="${bw - 8}" height="${H - padB - yPct(pct)}" rx="3" fill="rgba(124,196,255,.35)"><title>${pct}% de ${s.resp} respostas</title></rect>`;
    }
    if (s.nivel) {
      const cx = x + bw / 2, cy = yNiv(s.nivel);
      pts.push(cx + "," + cy);
      dots += `<circle cx="${cx}" cy="${cy}" r="3.5" fill="#ffc857"><title>Nível ${s.nivel}</title></circle><text x="${cx}" y="${cy - 6}" font-size="9" fill="#ffc857" text-anchor="middle">${s.nivel}</text>`;
    }
    labels += `<text x="${x + bw / 2}" y="${H - 4}" font-size="8" fill="#d9cce8" text-anchor="middle">${i === semanas.length - 1 ? "esta" : "-" + (semanas.length - 1 - i)}</text>`;
  });
  const linha = pts.length > 1 ? `<polyline points="${pts.join(" ")}" fill="none" stroke="#ffc857" stroke-width="2"/>` : "";
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Evolução por semana">${bars}${linha}${dots}${labels}</svg>`;
}

function painel(res) {
  const evs = lerLog();
  const conversas = lerJsonl(conversasFile);
  const agora = Date.now();
  const hoje = diaKey(agora);

  const dias = [];
  for (let i = 27; i >= 0; i--) dias.push(diaKey(agora - i * 864e5));
  const porDia = Object.fromEntries(dias.map((d) => [d, { resp: 0, missoes: 0 }]));
  const stats = {};
  for (const k of Object.keys(mundos)) stats[k] = { missoes: 0, resp: 0, certas: 0 };
  const grupos = new Map(); // erros agrupados por pergunta, em todo o historico
  const humores = [];
  const niveis = {}; // mundo -> [{quando, para}]
  let ultimo = 0;

  // 8 semanas que terminam hoje
  const SEM = 8;
  const inicioSem = agora - SEM * 7 * 864e5;
  const semanas = {};
  for (const k of ["math", "time", "en", "soc"]) semanas[k] = Array.from({ length: SEM }, () => ({ resp: 0, certas: 0, nivel: 0 }));
  const semIdx = (q) => Math.min(SEM - 1, Math.floor((q - inicioSem) / (7 * 864e5)));

  evs.sort((x, y) => x.quando - y.quando);
  for (const ev of evs) {
    if (ev.tipo === "humor") { humores.push(ev); if (ev.quando > ultimo) ultimo = ev.quando; continue; }
    if (ev.tipo === "perfil") continue;
    if (ev.tipo === "nivel") { (niveis[ev.mundo] = niveis[ev.mundo] || []).push(ev); continue; }
    if (ev.quando > ultimo && ev.tipo !== "erro") ultimo = ev.quando;
    const s = stats[ev.mundo];
    if (!s) continue;

    if (ev.tipo === "erro") {
      const k = ev.mundo + "|" + ev.perg;
      let g = grupos.get(k);
      if (!g) {
        g = { mundo: ev.mundo, perg: ev.perg, q: "", n: 0, ultimo: 0, esc: [], certa: "", why: "", resolvido: false };
        grupos.set(k, g);
      }
      g.n += 1;
      g.ultimo = ev.quando;
      g.q = ev.q || g.q;
      g.certa = ev.certa || g.certa;
      g.why = ev.why || g.why;
      if (ev.esc && !g.esc.includes(ev.esc)) g.esc.push(ev.esc);
      g.resolvido = false;
    } else if (ev.tipo === "resp" && ev.ok) {
      const g = grupos.get(ev.mundo + "|" + ev.perg);
      if (g) g.resolvido = true; // acertou de primeira depois de errar
    }
    if (ev.tipo === "resp" && semanas[ev.mundo] && ev.quando >= inicioSem) {
      const w = semanas[ev.mundo][semIdx(ev.quando)];
      w.resp += 1;
      if (ev.ok) w.certas += 1;
    }

    const d = diaKey(ev.quando);
    if (!porDia[d]) continue; // fora dos ultimos 28 dias
    if (ev.tipo === "missao") {
      s.missoes += 1;
      porDia[d].missoes += 1;
    } else if (ev.tipo === "resp") {
      s.resp += 1;
      porDia[d].resp += 1;
      if (ev.ok) s.certas += 1;
    }
  }
  // nivel no fim de cada semana
  for (const k of Object.keys(semanas)) {
    const hist = niveis[k] || [];
    semanas[k].forEach((w, i) => {
      const fim = inicioSem + (i + 1) * 7 * 864e5;
      let n = 0;
      for (const h of hist) if (h.quando <= fim) n = h.para;
      w.nivel = n;
    });
  }

  const diasUsados = dias.filter((d) => porDia[d].resp > 0).length;
  let seq = 0;
  for (let i = dias.length - 1; i >= 0; i--) {
    if (porDia[dias[i]].resp > 0) seq += 1;
    else if (i === dias.length - 1) continue; // hoje ainda pode acontecer
    else break;
  }

  const hojeInfo = porDia[hoje];
  const cal = dias.map((d) => {
    const n = porDia[d].resp;
    const cls = n === 0 ? "d0" : n < 5 ? "d1" : n < 10 ? "d2" : "d3";
    const dd = d.slice(8) + "/" + d.slice(5, 7);
    return `<div class="cel ${cls}${d === hoje ? " hoje" : ""}" title="${dd}: ${n} respostas">${Number(d.slice(8))}</div>`;
  }).join("");

  const linhas = Object.keys(mundos).map((k) => {
    const s = stats[k];
    const pct = s.resp ? Math.round((s.certas / s.resp) * 100) + "%" : "–";
    return `<tr><td>${esc(mundos[k])}</td><td>${s.missoes}</td><td>${s.resp}</td><td>${pct}</td></tr>`;
  }).join("");

  // ---- alertas (14 dias) ----
  const limiteAlerta = agora - 14 * 864e5;
  const alertas = [];
  for (const h of humores) if (h.alerta && h.quando >= limiteAlerta) alertas.push({ q: h.quando, txt: "Como foi o dia: " + (h.motivo || "") + (h.texto ? " — “" + h.texto + "”" : "") });
  for (const c of conversas) if (c.alerta && c.quando >= limiteAlerta) alertas.push({ q: c.quando, txt: "Conversa (" + c.origem + "): ela escreveu “" + c.user + "”" + (c.motivo ? " · " + c.motivo : "") });
  // humor triste/raiva 3 dias seguidos
  const humorPorDia = {};
  for (const h of humores) if (h.rosto >= 0) humorPorDia[diaKey(h.quando)] = h.rosto;
  let tristes = 0;
  for (let i = dias.length - 1; i >= 0 && tristes < 3; i--) {
    const r = humorPorDia[dias[i]];
    if (r === undefined) { if (i === dias.length - 1) continue; break; }
    if (r >= 3) tristes += 1; else break;
  }
  if (tristes >= 3) alertas.push({ q: agora, txt: "Ela disse que estava triste ou com raiva 3 dias seguidos." });
  alertas.sort((a, b) => b.q - a.q);
  const alertasHtml = alertas.length ? `<div class="card alerta"><b>⚠️ Atenção (${alertas.length})</b><ul class="erros">${alertas.slice(0, 30).map((a) =>
    `<li><div>${esc(a.txt)}</div><div class="mut">${esc(fmtHora.format(new Date(a.q)))}</div></li>`).join("")}</ul></div>` : "";

  // ---- humor ----
  const rostos = C.humor.rostos.map((r) => r.e);
  const humorCal = dias.map((d) => {
    const r = humorPorDia[d];
    return `<div class="cel ${r === undefined ? "d0" : ""}" title="${d.slice(8)}/${d.slice(5, 7)}">${r === undefined ? Number(d.slice(8)) : rostos[r]}</div>`;
  }).join("");
  const humorLista = humores.slice(-12).reverse().map((h) =>
    `<li class="${h.alerta ? "pend" : ""}"><div>${h.rosto >= 0 ? rostos[h.rosto] + " " + esc(C.humor.rostos[h.rosto].t) : ""}${h.chips.length ? " · " + esc(h.chips.join(", ")) : ""}</div>
      ${h.texto ? `<div>“${esc(h.texto)}”</div>` : ""}<div class="mut">${esc(fmtHora.format(new Date(h.quando)))}</div></li>`).join("");

  // ---- evolucao por mundo ----
  const evolucao = ["math", "time", "en", "soc"].map((k) => {
    const m = C.mundos[k];
    const hist = niveis[k] || [];
    const atual = hist.length ? hist[hist.length - 1].para : 0;
    const primeiro = hist.length ? hist[0].para : 0;
    const dominados = atual > 1 ? m.niveis.slice(0, atual - 1) : [];
    return `<div class="card">
      <div><b>${m.emoji} ${esc(m.nome)}</b> · ${atual ? `nível <b>${atual}</b> de ${m.niveis.length}` : "ainda sem teste de nível"}${hist.length > 1 ? ` <span class="mut">(começou no ${primeiro})</span>` : ""}</div>
      ${atual ? `<div class="mut">Treinando agora: ${esc(m.niveis[atual - 1])}</div>` : ""}
      ${dominados.length ? `<div class="mut">Já passou por: ${esc(dominados.join(" · "))}</div>` : ""}
      ${graficoEvolucao(semanas[k], m.niveis.length)}
      <div class="mut" style="font-size:11px">Barras azuis: % de acerto à 1ª tentativa por semana · Linha amarela: nível</div>
    </div>`;
  }).join("");

  // ---- erros ----
  const lista = [...grupos.values()].sort((x, y) =>
    (x.resolvido - y.resolvido) || (y.n - x.n) || (y.ultimo - x.ultimo));
  const naoResolvidos = lista.filter((g) => !g.resolvido).length;
  const LIMITE = 300;
  const topErros = lista.slice(0, LIMITE).map((g) => {
    const pergunta = g.q && !g.perg.includes(g.q) ? g.perg + " — " + g.q : g.perg;
    return `<li class="${g.resolvido ? "ok" : "pend"}">
      <div><b>${esc(mundos[g.mundo] || g.mundo)}</b> · ${esc(pergunta)}</div>
      ${g.esc.length ? `<div>Respondeu: ${g.esc.map(esc).join("; ")}</div>` : ""}
      ${g.certa ? `<div>Certa: <b>${esc(g.certa)}</b></div>` : ""}
      ${g.why ? `<div class="mut">${esc(g.why)}</div>` : ""}
      <div class="mut">${g.n}× · última: ${esc(fmtHora.format(new Date(g.ultimo)))} · ${g.resolvido ? "✅ já acertou depois" : "⏳ ainda não acertou"}</div>
    </li>`;
  }).join("");

  // ---- conversas (7 dias) ----
  const conv = conversas.filter((c) => c.quando >= agora - 7 * 864e5).slice(-120).reverse();
  const convHtml = conv.map((c) => `<li class="${c.alerta ? "pend" : ""}">
      <div class="mut">${esc(fmtHora.format(new Date(c.quando)))} · ${c.modo === "treino" ? "treino: " + esc(c.cenario) : "papo"}${c.origem !== "ia" ? " · " + esc(c.origem) : ""}</div>
      <div>👧 ${esc(c.user)}</div><div>🌙 ${esc(c.resposta)}</div>
      ${c.bloqueada ? `<div class="mut">Resposta bloqueada da IA: ${esc(c.bloqueada)}</div>` : ""}</li>`).join("");

  // ---- perfil e configuracao ----
  const p = perfilAtual();
  const temPerfil = Object.keys(estado.perfis).length > 0;
  const perfilHtml = temPerfil ? `<div>Nome: <b>${esc(p.nome)}</b> · companheira: <b>${esc(p.lua)}</b></div>
    <div>Novelas: ${esc((p.novelas || []).join(", ") || "–")}</div>
    <div>Influencers: ${esc((p.influs || []).join(", ") || "–")}</div>
    <div>Jiu-jitsu: ${p.jj ? esc(p.academia + " · faixa " + p.faixa + " → " + p.proxima) : "não"}</div>` : `<span class="mut">Ela ainda não preencheu “Do que você gosta?”.</span>`;
  const up = estado.ultimoPush;
  const chatPronto = !!veniceKey;

  const aviso = persistente ? "" :
    `<p class="warn">Sem volume em /data: o histórico será perdido a cada deploy. Crie um Volume no Railway.</p>`;

  const html = `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Clara – painel dos pais</title>
<style>
  body{font-family:"Trebuchet MS","Segoe UI",sans-serif;background:#1b1430;color:#fff8ef;margin:0;padding:16px}
  main{max-width:560px;margin:0 auto}
  h1{font-size:22px;margin:0 0 4px}h2{font-size:16px;margin:22px 0 8px;color:#ffc857}
  .card{background:#342656;border-radius:16px;padding:14px;margin-bottom:12px}
  .card.alerta{background:#5a2a2a}
  .big{font-size:26px;font-weight:800}.mut{color:#d9cce8;font-size:13px}
  .warn{background:#5a2a2a;border-radius:12px;padding:10px;font-size:14px}
  .cal{display:grid;grid-template-columns:repeat(7,1fr);gap:6px}
  .cel{aspect-ratio:1;border-radius:8px;display:grid;place-items:center;font-size:12px;color:#fff8ef;background:rgba(255,255,255,.12)}
  .d0{background:rgba(255,255,255,.06);color:#d9cce8}.d1{background:#2f7a5a}.d2{background:#3ddc97;color:#10261c}.d3{background:#ffc857;color:#2a1c08}
  .hoje{outline:2px solid #fff8ef}
  table{width:100%;border-collapse:collapse;font-size:14px}th,td{text-align:left;padding:6px 4px;border-bottom:1px solid rgba(255,255,255,.12)}
  ul{padding-left:18px;margin:0;font-size:14px;line-height:1.5}a{color:#7cc4ff}
  ul.erros{list-style:none;padding:0}ul.erros li{padding:10px 0;border-bottom:1px solid rgba(255,255,255,.12)}
  ul.erros li:last-child{border-bottom:0}li.pend{border-left:3px solid #ff7a59;padding-left:10px!important}li.ok{opacity:.7}
  button{font-family:inherit;border:0;border-radius:12px;padding:10px 14px;font-size:14px;font-weight:700;cursor:pointer;background:#ffc857;color:#2a1c08;margin:4px 4px 0 0}
  button.sec{background:rgba(255,255,255,.14);color:#fff8ef}
  form{display:inline}
  details summary{cursor:pointer;color:#ffc857;font-weight:700}
</style></head><body><main>
<h1>🌙 Clara · painel dos pais</h1>
<div class="mut">Atualizado ${esc(fmtHora.format(new Date()))} (${esc(tz)}) · <a href="/">abrir a app</a></div>
${aviso}
${alertasHtml}
<div class="card">
  <div class="mut">Último uso</div>
  <div class="big">${ultimo ? esc(haQuanto(ultimo)) : "ainda sem registros"}</div>
  ${ultimo ? `<div class="mut">${esc(fmtHora.format(new Date(ultimo)))}</div>` : ""}
</div>
<div class="card">
  <div class="mut">Hoje</div>
  <div class="big">${hojeInfo.missoes} missões · ${hojeInfo.resp} respostas</div>
  <div class="mut">${diasUsados} de 28 dias com uso · sequência atual: ${seq} ${seq === 1 ? "dia" : "dias"}</div>
</div>

<h2>Como ela se sentiu (28 dias)</h2>
<div class="card"><div class="cal">${humorCal}</div>
${humorLista ? `<ul class="erros" style="margin-top:10px">${humorLista}</ul>` : '<p class="mut">Ela ainda não respondeu “Como foi o seu dia?”.</p>'}</div>

<h2>Evolução por mundo</h2>
${evolucao}

<h2>Últimos 28 dias</h2>
<div class="card"><div class="cal">${cal}</div>
<div class="mut" style="margin-top:8px">Verde claro: poucas respostas · verde: 5+ · amarelo: 10+</div></div>
<h2>Por tema (28 dias)</h2>
<div class="card"><table><tr><th>Tema</th><th>Missões</th><th>Respostas</th><th>Acerto 1ª</th></tr>${linhas}</table></div>

<h2>Tudo que ela errou (${lista.length}${lista.length ? ", " + naoResolvidos + " ainda sem acertar" : ""})</h2>
<div class="card">${topErros ? `<details><summary>Ver lista</summary><ul class="erros">${topErros}</ul></details>` : '<span class="mut">Sem erros registrados.</span>'}
${lista.length > LIMITE ? `<p class="mut">Mostrando ${LIMITE} de ${lista.length}. O CSV tem tudo.</p>` : ""}</div>

<h2>Conversas com a companheira (7 dias)</h2>
<div class="card">
  <div>Conversa: <b>${estado.chat ? "ligada" : "desligada"}</b>${chatPronto ? "" : ' <span class="mut">(falta VENICE_API_KEY no servidor)</span>'}</div>
  <form method="post" action="/pais/chat"><input type="hidden" name="ligar" value="${estado.chat ? "0" : "1"}"><button>${estado.chat ? "Desligar conversa" : "Ligar conversa"}</button></form>
  <p class="mut">Ela pode mandar até ${LIMITE_DIA} mensagens por dia. Frases de risco não vão para a IA e aparecem em “Atenção”. Cada resposta passa por filtro de palavras e por um segundo modelo que verifica a segurança.</p>
  ${convHtml ? `<details><summary>Ver conversas (${conv.length})</summary><ul class="erros">${convHtml}</ul></details>` : '<span class="mut">Sem conversas.</span>'}
</div>

<h2>Notificações</h2>
<div class="card">
  <div>${webpush ? `${estado.subs.length} aparelho(s) inscrito(s). Bom dia às 07:00, “como foi o dia” às 19:00, boa noite às 21:00 (${esc(tzClara)}).` : "Desligadas: falta o pacote web-push no servidor."}</div>
  ${up ? `<div class="mut">Último envio: ${esc(fmtHora.format(new Date(up.t)))} · “${esc(up.texto)}” · ${up.ok} ok, ${up.falhas} falha(s)${up.teste ? " · teste" : ""}</div>` : ""}
  ${webpush && estado.subs.length ? `<div style="margin-top:6px">Enviar teste agora:
    <form method="post" action="/pais/push-teste"><input type="hidden" name="slot" value="manha"><button class="sec">☀️ Bom dia</button></form>
    <form method="post" action="/pais/push-teste"><input type="hidden" name="slot" value="dia"><button class="sec">💬 Como foi o dia</button></form>
    <form method="post" action="/pais/push-teste"><input type="hidden" name="slot" value="noite"><button class="sec">🌙 Boa noite</button></form></div>` :
    `<p class="mut">Para ativar: na app, toque em ⚙️ e avance até o último passo (“Sim, quero!”). No iPhone, a app tem de estar na tela inicial.</p>`}
</div>

<h2>Do que ela gosta</h2>
<div class="card">${perfilHtml}</div>

<h2>Nota para os pais</h2>
<div class="card mut">Feita para dificuldade com o abstrato: primeiro objetos, depois o número. Sem cronômetro, sem ranking. Cada tema ajusta o nível sozinho: sobe depois de 2 missões com 4+ acertos de 5 e desce, sem avisar, com 2 ou menos. Em “Amigos” há situações de escola nova, bullying e segurança online. A companheira sempre incentiva a contar tudo aos pais. Fiquem ao lado nas primeiras vezes.</div>

<p class="mut"><a href="/pais/log.csv">Baixar CSV completo</a></p>
</main></body></html>`;
  res.writeHead(200, {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Robots-Tag": "noindex"
  });
  res.end(html);
}

function csvCel(v) {
  let s = v === undefined || v === null ? "" : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; // evita formula em planilha
  return '"' + s.replace(/"/g, '""') + '"';
}

function csv(res) {
  const rows = ["hora_servidor,hora_aparelho,id,tipo,mundo,acertou_de_primeira,tentativas,nivel,pergunta,enunciado,respondeu,certa,explicacao,humor,texto"];
  for (const ev of lerLog()) {
    rows.push([
      ev.t,
      Number.isFinite(ev.td) ? new Date(ev.td).toISOString() : "",
      ev.id, ev.tipo, ev.mundo,
      ev.ok === undefined ? "" : ev.ok ? "sim" : "nao",
      ev.tent, ev.tipo === "nivel" ? ev.de + "→" + ev.para : ev.nivel,
      ev.perg, ev.q, ev.esc, ev.certa, ev.why,
      ev.tipo === "humor" ? [ev.rosto >= 0 ? C.humor.rostos[ev.rosto].t : "", ...(ev.chips || [])].filter(Boolean).join("; ") : "",
      ev.texto
    ].map(csvCel).join(","));
  }
  res.writeHead(200, {
    "Content-Type": "text/csv; charset=utf-8",
    "Content-Disposition": 'attachment; filename="clara-log.csv"',
    "Cache-Control": "no-store"
  });
  res.end(rows.join("\n") + "\n");
}

function voltaPainel(res) {
  res.writeHead(303, { Location: "/pais" });
  res.end();
}

function acaoPais(req, res, rota) {
  // Formularios do painel: so aceita vindo do proprio site
  const origem = req.headers.origin;
  if (origem && origem !== "null") {
    let host = "";
    try { host = new URL(origem).host; } catch (e) { host = ""; }
    if (host !== req.headers.host) { res.writeHead(403); res.end(); return; }
  }
  readBody(req, 2048, (err, body) => {
    if (err) { res.writeHead(413); res.end(); return; }
    const f = new URLSearchParams(body);
    if (rota === "/pais/chat") {
      estado.chat = f.get("ligar") === "1";
      salvaEstado();
      voltaPainel(res);
      return;
    }
    const slot = ["manha", "dia", "noite"].includes(f.get("slot")) ? f.get("slot") : "manha";
    enviarPush(slot, true).finally(() => voltaPainel(res));
  });
}

function areaPais(req, res, rota) {
  if (!senha) {
    res.writeHead(503, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Painel desligado: defina PAIS_SENHA no servidor.");
    return;
  }
  if (!autorizado(req)) {
    res.writeHead(401, {
      "WWW-Authenticate": 'Basic realm="Clara - pais", charset="UTF-8"',
      "Content-Type": "text/plain; charset=utf-8"
    });
    res.end("Senha necessária.");
    return;
  }
  if (req.method === "POST") {
    if (rota === "/pais/chat" || rota === "/pais/push-teste") acaoPais(req, res, rota);
    else { res.writeHead(405); res.end(); }
    return;
  }
  if (req.method !== "GET") { res.writeHead(405); res.end(); return; }
  if (rota === "/pais/log.csv") csv(res);
  else painel(res);
}

// ---------- servidor ----------
const server = http.createServer((req, res) => {
  let rota = "/";
  try { rota = decodeURIComponent((req.url || "/").split("?")[0]); } catch (e) {
    res.writeHead(400);
    res.end();
    return;
  }

  if (rota === "/api/evento" || rota === "/api/push" || rota === "/api/conversa") {
    if (req.method !== "POST") { res.writeHead(405, { Allow: "POST" }); res.end(); return; }
    if (rota === "/api/evento") postEvento(req, res);
    else if (rota === "/api/push") postPush(req, res);
    else postConversa(req, res);
    return;
  }
  if (rota === "/api/config") {
    json(res, 200, { chat: !!(estado.chat && veniceKey), vapid: vapid ? vapid.publicKey : null });
    return;
  }
  if (rota === "/pais" || rota === "/pais/" || rota === "/pais/log.csv" || rota === "/pais/chat" || rota === "/pais/push-teste") {
    areaPais(req, res, rota === "/pais/" ? "/pais" : rota);
    return;
  }

  const entry = req.method === "GET" || req.method === "HEAD" ? files[rota] : null;
  if (!entry) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("not found");
    return;
  }
  fs.readFile(path.join(root, entry[0]), (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("not found");
      return;
    }
    res.writeHead(200, {
      "Content-Type": entry[1],
      "Cache-Control": "no-cache",
      "X-Content-Type-Options": "nosniff"
    });
    res.end(req.method === "HEAD" ? undefined : data);
  });
});

server.listen(port, "0.0.0.0", () => {
  console.log("Clara em http://0.0.0.0:" + port + " (historico em " + logFile + ")");
});
