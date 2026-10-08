const { test, before, after } = require("node:test");
const assert = require("node:assert");
const { spawn } = require("node:child_process");
const http = require("node:http");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const PORT = 18084, FAKE = 18085;
const base = "http://localhost:" + PORT;
const auth = "Basic " + Buffer.from("pais:segredo").toString("base64");
let srv, fake, dir;
// roteiro do Venice falso: cada pedido de chat tira a proxima resposta; o moderador responde pelo roteiro "mod"
let chatRoteiro = [], modRoteiro = [], chamadas = [];

before(async () => {
  fake = http.createServer((req, res) => {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      const j = JSON.parse(body);
      const ehMod = String(j.messages[0].content).includes("moderador de segurança");
      chamadas.push({ mod: ehMod, sistema: j.messages[0].content });
      const texto = (ehMod ? modRoteiro : chatRoteiro).shift() || "";
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ choices: [{ message: { content: texto } }] }));
    });
  }).listen(FAKE);
  dir = fs.mkdtempSync(path.join(os.tmpdir(), "clara-lua-"));
  srv = spawn(process.execPath, ["server.js"], {
    env: { ...process.env, PORT, PAIS_SENHA: "segredo", DATA_DIR: dir, VENICE_API_KEY: "fake", VENICE_URL: "http://localhost:" + FAKE },
    stdio: "ignore"
  });
  for (let i = 0; i < 50; i++) {
    try { await fetch(base + "/api/config"); break; } catch (e) { await new Promise((r) => setTimeout(r, 100)); }
  }
  await fetch(base + "/pais/chat", { method: "POST", headers: { Authorization: auth, "Content-Type": "application/x-www-form-urlencoded" }, body: "ligar=1" });
});
after(() => { srv.kill(); fake.close(); fs.rmSync(dir, { recursive: true, force: true }); });

let n = 0;
const fala = async (user, extra) => {
  n++;
  const r = await fetch(base + "/api/conversa", { method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: "cccccccc-" + n, modo: "papo", msgs: [{ role: "user", content: user }], ...extra }) });
  return { status: r.status, ...(await r.json()) };
};
const conversas = async () => {
  await new Promise((r) => setTimeout(r, 150));
  return fs.readFileSync(path.join(dir, "conversas.jsonl"), "utf8").trim().split("\n").map(JSON.parse);
};

test("pedido para mudar novela: resposta fixa com acao perfil, sem chamar o modelo", async () => {
  chamadas = [];
  const r = await fala("quero mudar a minha novela");
  assert.equal(r.acao, "perfil");
  assert.match(r.resposta, /⚙️/);
  assert.equal(chamadas.length, 0);
  const ult = (await conversas()).pop();
  assert.equal(ult.origem, "pedido-app");
  assert.equal(ult.pedido, "perfil");
});

test("pedido de suporte/e-mail: não promete nada e fica nos 'Pedidos dela'", async () => {
  chamadas = [];
  const r = await fala("manda um email pro suporte pra arrumar o app");
  assert.equal(chamadas.length, 0);
  assert.doesNotMatch(r.resposta, /vou (fazer|mandar|falar)/i);
  const html = await (await fetch(base + "/pais", { headers: { Authorization: auth } })).text();
  assert.match(html, /Pedidos dela sobre a app/);
  assert.match(html, /manda um email pro suporte/);
});

test("conversa normal passa pelo modelo e pelo moderador", async () => {
  chatRoteiro = ["Oi! Que bom te ver 😊 Como foi o seu dia?"];
  modRoteiro = ["SEGURA"];
  const r = await fala("Oi! Como você está?");
  assert.match(r.resposta, /Que bom te ver/);
});

test("filtro de saída bloqueia na 1.ª e a 2.ª tentativa (mais rígida) é aceite", async () => {
  chamadas = [];
  chatRoteiro = ["Manda para o meu e-mail amiga@teste.com", "Vamos falar da sua música favorita? 🎵"];
  modRoteiro = ["SEGURA"];
  const r = await fala("o que fazemos hoje?");
  assert.match(r.resposta, /música favorita/);
  assert.ok(chamadas.filter((c) => !c.mod)[1].sistema.includes("tentativa anterior foi bloqueada"));
  const ult = (await conversas()).pop();
  assert.equal(ult.tentativas, 2);
  assert.match(ult.anteriores[0], /filtro-saida/);
});

test("moderador sem resposta clara é perguntado de novo; duas falhas bloqueiam e usam fallback", async () => {
  chatRoteiro = ["Olá, tudo bem!", "Olá de novo!"];
  modRoteiro = ["", "talvez", "", ""]; // 2 pedidos ao moderador por tentativa
  const r = await fala("bom dia");
  assert.ok(r.resposta.length > 5);
  assert.doesNotMatch(r.resposta, /Olá/);
  const ult = (await conversas()).pop();
  assert.equal(ult.origem, "moderador");
  assert.match(ult.motivo, /moderador disse/);
  assert.equal(ult.tentativas, 2);
});

test("modo teste não conta no limite e fica marcado", async () => {
  chatRoteiro = ["Oi!"]; modRoteiro = ["SEGURA"];
  await fala("oi", { teste: true });
  assert.equal((await conversas()).pop().teste, true);
});

test("modo novela: prompt próprio, ignora pedidos de app e aceita comentário", async () => {
  chamadas = [];
  chatRoteiro = ["Que bonito o Sol! O que ele faz depois?"]; modRoteiro = ["SEGURA"];
  const r = await fala("O Sol era um cavalo e quero mudar a novela para o mar", { modo: "novela" });
  assert.match(r.resposta, /Sol/);
  assert.equal(r.acao, undefined);
  assert.ok(chamadas.find((c) => !c.mod).sistema.includes("MODO NOVELA"));
  assert.equal((await conversas()).pop().modo, "novela");
});
