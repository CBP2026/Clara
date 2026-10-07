const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const root = __dirname;
const port = Number(process.env.PORT) || 8080;
const senha = process.env.PAIS_SENHA || "";
const tz = process.env.PAIS_TZ || "America/Sao_Paulo";

// Pasta do historico. No Railway, monte um Volume em /data.
const dataDir = process.env.DATA_DIR || (fs.existsSync("/data") ? "/data" : path.join(root, "data"));
const persistente = dataDir === "/data" || !!process.env.DATA_DIR;
const logFile = path.join(dataDir, "log.jsonl");
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

// So estes arquivos sao publicos. Todo o resto da pasta fica fechado.
const files = {
  "/": ["index.html", "text/html; charset=utf-8"],
  "/index.html": ["index.html", "text/html; charset=utf-8"],
  "/manifest.json": ["manifest.json", "application/manifest+json; charset=utf-8"],
  "/sw.js": ["sw.js", "text/javascript; charset=utf-8"],
  "/icon-192.png": ["icon-192.png", "image/png"],
  "/icon-512.png": ["icon-512.png", "image/png"]
};

const mundos = { math: "Números", time: "Tempo", en: "English", soc: "Amigos" };

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

function limpaEvento(b) {
  if (!b || typeof b !== "object") return null;
  if (typeof b.id !== "string" || !/^[A-Za-z0-9-]{8,64}$/.test(b.id)) return null;
  if (!Object.prototype.hasOwnProperty.call(mundos, b.mundo)) return null;
  const tipo = ["missao", "resp", "erro"].includes(b.tipo) ? b.tipo : null;
  if (!tipo) return null;
  const ev = { t: new Date().toISOString(), id: b.id, tipo, mundo: b.mundo };
  if (Number.isFinite(b.td)) ev.td = Math.round(b.td);
  if (tipo === "resp") {
    if (typeof b.ok !== "boolean") return null;
    ev.ok = b.ok;
    ev.tent = b.tent === 1 ? 1 : 2;
    ev.perg = String(b.perg || "").slice(0, 120);
  }
  if (tipo === "erro") {
    ev.perg = String(b.perg || "").slice(0, 120);
    if (!ev.perg) return null;
    ev.q = String(b.q || "").slice(0, 160);
    ev.esc = String(b.esc || "").slice(0, 80);
    ev.certa = String(b.certa || "").slice(0, 80);
    ev.why = String(b.why || "").slice(0, 200);
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

function lerLog() {
  let txt = "";
  try { txt = fs.readFileSync(logFile, "utf8"); } catch (e) { return []; }
  const out = [];
  for (const line of txt.split("\n")) {
    if (!line) continue;
    try {
      const ev = JSON.parse(line);
      const tms = Date.parse(ev.t);
      if (!Number.isFinite(tms)) continue;
      // Se o aparelho estava offline, a hora do aparelho e mais fiel.
      const quando = Number.isFinite(ev.td) && ev.td <= tms && tms - ev.td < 7 * 864e5 ? ev.td : tms;
      ev.quando = quando;
      out.push(ev);
    } catch (e) { /* linha quebrada: ignora */ }
  }
  return out;
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

function painel(res) {
  const evs = lerLog();
  const agora = Date.now();
  const hoje = diaKey(agora);

  const dias = [];
  for (let i = 27; i >= 0; i--) dias.push(diaKey(agora - i * 864e5));
  const porDia = Object.fromEntries(dias.map((d) => [d, { resp: 0, missoes: 0 }]));
  const stats = {};
  for (const k of Object.keys(mundos)) stats[k] = { missoes: 0, resp: 0, certas: 0 };
  const grupos = new Map(); // erros agrupados por pergunta, em todo o historico
  let ultimo = 0;

  evs.sort((x, y) => x.quando - y.quando);
  for (const ev of evs) {
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

  const lista = [...grupos.values()].sort((x, y) =>
    (x.resolvido - y.resolvido) || (y.n - x.n) || (y.ultimo - x.ultimo));
  const naoResolvidos = lista.filter((g) => !g.resolvido).length;
  const LIMITE = 300;
  const itens = lista.slice(0, LIMITE).map((g) => {
    const pergunta = g.q && !g.perg.includes(g.q) ? g.perg + " — " + g.q : g.perg;
    return `<li class="${g.resolvido ? "ok" : "pend"}">
      <div><b>${esc(mundos[g.mundo] || g.mundo)}</b> · ${esc(pergunta)}</div>
      ${g.esc.length ? `<div>Respondeu: ${g.esc.map(esc).join("; ")}</div>` : ""}
      ${g.certa ? `<div>Certa: <b>${esc(g.certa)}</b></div>` : ""}
      ${g.why ? `<div class="mut">${esc(g.why)}</div>` : ""}
      <div class="mut">${g.n}× · última: ${esc(fmtHora.format(new Date(g.ultimo)))} · ${g.resolvido ? "✅ já acertou depois" : "⏳ ainda não acertou"}</div>
    </li>`;
  }).join("");
  const topErros = itens;

  const aviso = persistente ? "" :
    `<p class="warn">Sem volume em /data: o histórico será perdido a cada deploy. Crie um Volume no Railway.</p>`;

  const html = `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Clara – painel dos pais</title>
<style>
  body{font-family:"Trebuchet MS","Segoe UI",sans-serif;background:#1b1430;color:#fff8ef;margin:0;padding:16px}
  main{max-width:520px;margin:0 auto}
  h1{font-size:22px;margin:0 0 4px}h2{font-size:16px;margin:22px 0 8px;color:#ffc857}
  .card{background:#342656;border-radius:16px;padding:14px;margin-bottom:12px}
  .big{font-size:26px;font-weight:800}.mut{color:#d9cce8;font-size:13px}
  .warn{background:#5a2a2a;border-radius:12px;padding:10px;font-size:14px}
  .cal{display:grid;grid-template-columns:repeat(7,1fr);gap:6px}
  .cel{aspect-ratio:1;border-radius:8px;display:grid;place-items:center;font-size:12px;color:#fff8ef}
  .d0{background:rgba(255,255,255,.08);color:#d9cce8}.d1{background:#2f7a5a}.d2{background:#3ddc97;color:#10261c}.d3{background:#ffc857;color:#2a1c08}
  .hoje{outline:2px solid #fff8ef}
  table{width:100%;border-collapse:collapse;font-size:14px}th,td{text-align:left;padding:6px 4px;border-bottom:1px solid rgba(255,255,255,.12)}
  ul{padding-left:18px;margin:0;font-size:14px;line-height:1.5}a{color:#7cc4ff}
  ul.erros{list-style:none;padding:0}ul.erros li{padding:10px 0;border-bottom:1px solid rgba(255,255,255,.12)}
  ul.erros li:last-child{border-bottom:0}li.pend{border-left:3px solid #ff7a59;padding-left:10px!important}li.ok{opacity:.7}
</style></head><body><main>
<h1>🌙 Clara</h1>
<div class="mut">Atualizado ${esc(fmtHora.format(new Date()))} (${esc(tz)})</div>
${aviso}
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
<h2>Últimos 28 dias</h2>
<div class="card"><div class="cal">${cal}</div>
<div class="mut" style="margin-top:8px">Verde claro: poucas respostas · verde: 5+ · amarelo: 10+</div></div>
<h2>Por tema (28 dias)</h2>
<div class="card"><table><tr><th>Tema</th><th>Missões</th><th>Respostas</th><th>Acerto 1ª</th></tr>${linhas}</table></div>
<h2>Tudo que ela errou (${lista.length}${lista.length ? ", " + naoResolvidos + " ainda sem acertar" : ""})</h2>
<div class="card">${topErros ? `<ul class="erros">${topErros}</ul>` : '<span class="mut">Sem erros registrados.</span>'}
${lista.length > LIMITE ? `<p class="mut">Mostrando ${LIMITE} de ${lista.length}. O CSV tem tudo.</p>` : ""}</div>
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
  const rows = ["hora_servidor,hora_aparelho,id,tipo,mundo,acertou_de_primeira,tentativas,pergunta,enunciado,respondeu,certa,explicacao"];
  for (const ev of lerLog()) {
    rows.push([
      ev.t,
      Number.isFinite(ev.td) ? new Date(ev.td).toISOString() : "",
      ev.id, ev.tipo, ev.mundo,
      ev.ok === undefined ? "" : ev.ok ? "sim" : "nao",
      ev.tent, ev.perg, ev.q, ev.esc, ev.certa, ev.why
    ].map(csvCel).join(","));
  }
  res.writeHead(200, {
    "Content-Type": "text/csv; charset=utf-8",
    "Content-Disposition": 'attachment; filename="clara-log.csv"',
    "Cache-Control": "no-store"
  });
  res.end(rows.join("\n") + "\n");
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

  if (rota === "/api/evento") {
    if (req.method === "POST") postEvento(req, res);
    else { res.writeHead(405, { Allow: "POST" }); res.end(); }
    return;
  }
  if (rota === "/pais" || rota === "/pais/" || rota === "/pais/log.csv") {
    if (req.method !== "GET") { res.writeHead(405); res.end(); return; }
    areaPais(req, res, rota === "/pais/log.csv" ? rota : "/pais");
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
