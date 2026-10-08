const { test, before, after } = require("node:test");
const assert = require("node:assert");
const { spawn } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const PORT = 18086;
const base = "http://localhost:" + PORT;
const auth = "Basic " + Buffer.from("pais:segredo").toString("base64");
let srv, dir;
const dias = (n) => new Date(Date.now() - n * 864e5).toISOString();
const ev = (n, extra) => JSON.stringify({ t: dias(n), id: "aaaaaaaa-1", ...extra });

before(async () => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), "clara-resumo-"));
  fs.writeFileSync(path.join(dir, "log.jsonl"), [
    // relógio: errou há 3 dias, acertou de primeira há 2 dias e ontem -> dominado
    ev(3, { tipo: "erro", mundo: "time", perg: "Relógio 3:00", conc: "tempo.relogio", q: "?", esc: "x", certa: "y", why: "z" }),
    ev(2, { tipo: "resp", mundo: "time", ok: true, tent: 1, perg: "Relógio 4:00", conc: "tempo.relogio", ms: 6000 }),
    ev(1, { tipo: "resp", mundo: "time", ok: true, tent: 1, perg: "Relógio 5:00", conc: "tempo.relogio", ms: 4000 }),
    // diferença de minutos: errou ontem e "não sei" -> em dificuldade
    ev(1, { tipo: "erro", mundo: "time", perg: "Falta live 15", conc: "tempo.diferenca_minutos", q: "?", esc: "60 minutos", certa: "15 minutos", why: "z" }),
    ev(1, { tipo: "naosei", mundo: "time", perg: "Falta treino 30", conc: "tempo.diferenca_minutos" }),
    ev(1, { tipo: "resp", mundo: "time", ok: false, tent: 1, perg: "Falta live 15", conc: "tempo.diferenca_minutos", ms: 900 }),
    ev(1, { tipo: "rapido", mundo: "time", perg: "Falta live 15", conc: "tempo.diferenca_minutos", ms: 800 }),
    // teste não conta
    ev(1, { tipo: "erro", mundo: "math", perg: "Contar 7", conc: "num.contar", q: "?", esc: "x", certa: "y", why: "z", teste: true })
  ].join("\n") + "\n");
  srv = spawn(process.execPath, ["server.js"], { env: { ...process.env, PORT, PAIS_SENHA: "segredo", DATA_DIR: dir }, stdio: "ignore" });
  for (let i = 0; i < 50; i++) {
    try { await fetch(base + "/api/config"); return; } catch (e) { await new Promise((r) => setTimeout(r, 100)); }
  }
  throw new Error("servidor não subiu");
});
after(() => { srv.kill(); fs.rmSync(dir, { recursive: true, force: true }); });

const painel = async () => (await fetch(base + "/pais", { headers: { Authorization: auth } })).text();

test("resumo da semana: dominado, em dificuldade, qualidade de uso e atividade para casa", async () => {
  const html = await painel();
  assert.match(html, /Resumo da semana/);
  assert.match(html, /✅ ler o relógio/);
  assert.match(html, /⏳ quanto tempo falta \(minutos\) \(2×\)/);
  assert.doesNotMatch(html, /contar objetos/, "conceitos de teste não aparecem");
  assert.match(html, /3 respostas/);
  assert.match(html, /demora 4,0 s até tocar/);
  assert.match(html, /33% muito rápidas/);
  assert.match(html, /1 aviso\(s\) para ler com calma · “Não sei” 1×/);
  assert.match(html, /Com um relógio de ponteiros na mesa, mostre 10:00 e 10:15/);
});

test("lembretes: parents podem desligar e a escolha fica guardada", async () => {
  assert.match(await painel(), /name="lembretes" value="1" checked/);
  const r = await fetch(base + "/pais/lembretes", { method: "POST", redirect: "manual",
    headers: { Authorization: auth, "Content-Type": "application/x-www-form-urlencoded" }, body: "noite=1" });
  assert.equal(r.status, 303);
  const html = await painel();
  assert.doesNotMatch(html, /name="lembretes" value="1" checked/);
  assert.match(html, /name="noite" value="1" checked/);
});
