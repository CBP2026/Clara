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
let chatRoteiro = [], modRoteiro = [], factoRoteiro = [], chamadas = [];

before(async () => {
  fake = http.createServer((req, res) => {
    let body = "";
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      const j = JSON.parse(body);
      const ehMod = String(j.messages[0].content).includes("moderador de segurança");
      const ehFacto = String(j.messages[0].content).includes("extrai UM facto");
      if (!ehFacto) chamadas.push({ mod: ehMod, sistema: j.messages[0].content });
      const texto = (ehFacto ? factoRoteiro : ehMod ? modRoteiro : chatRoteiro).shift() || (ehFacto ? "NADA" : "");
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

test("modo guia: prompt próprio, aceita texto de risco da ficção, não gasta o limite e bloqueio devolve vazio", async () => {
  chamadas = [];
  chatRoteiro = ["Quem ajuda a professora Helena?"]; modRoteiro = ["SEGURA"];
  const r = await fala("TIPO: AJUDA\nNovela: Carrossel\nCapítulo atual: Ela morre", { modo: "guia" });
  assert.equal(r.resposta, "Quem ajuda a professora Helena?");
  assert.ok(chamadas.find((c) => !c.mod).sistema.includes("MODO GUIA DA NOVELA"));
  chatRoteiro = ["Que tal conversar sobre namoro?"]; modRoteiro = ["SEGURA", "SEGURA"];
  const r2 = await fala("TIPO: NOVO\nNovela: X", { modo: "guia" });
  assert.equal(r2.resposta, "");
});

test("modo dia: prompt de acolhimento e registo do modo", async () => {
  chamadas = [];
  chatRoteiro = ["Faz sentido ficar assim. O que aconteceu na escola?"]; modRoteiro = ["SEGURA"];
  const r = await fala("hoje foi ruim", { modo: "dia" });
  assert.match(r.resposta, /escola/);
  assert.ok(chamadas.find((c) => !c.mod).sistema.includes("MODO CONVERSA SOBRE O DIA"));
  assert.equal((await conversas()).pop().modo, "dia");
});

test("dica com 'faça' não é bloqueada como 'faca'", async () => {
  chatRoteiro = ["Oi! Que bom te ver 😊\n💡 Ótimo começo, agora faça uma pergunta de volta!"];
  modRoteiro = ["SEGURA"];
  const r = await fala("Bora falar ?");
  assert.match(r.resposta, /faça uma pergunta/);
  assert.equal((await conversas()).pop().origem, "ia");
});

test("faca como objeto continua bloqueada", async () => {
  chatRoteiro = ["Pega a faca", "Vamos falar de música? 🎵"];
  modRoteiro = ["SEGURA"];
  const r = await fala("o que faço?");
  assert.match(r.resposta, /música/);
});

test("namoro: resposta fixa sem modelo e sem alerta", async () => {
  chamadas = [];
  const r = await fala("Quero arranjar um namorado");
  assert.equal(chamadas.length, 0);
  assert.match(r.resposta, /mãe ou o pai/);
  const ult = (await conversas()).pop();
  assert.equal(ult.origem, "tema-namoro");
  assert.ok(!ult.alerta);
});

test("'faz você' é pedido da app, sem modelo", async () => {
  chamadas = [];
  const r = await fala("Faz você");
  assert.match(r.resposta, /não consigo|Eu só consigo|mãe ou ao pai/);
  assert.equal(chamadas.length, 0);
});

test("pedido de capítulo (mesmo com erro 'mas') vai para a escrita de capítulo, não para a conversa", async () => {
  for (const f of ["Faz mas capítulos da turma do girassol", "quero mais episodios"]) {
    const r = await fala(f);
    // o modelo de teste não devolve um capítulo válido: a Lua avisa com carinho, sem inventar
    assert.match(r.resposta, /capítulo/i);
  }
});

test("memória: guarda facto, usa no prompt e pais apagam", async () => {
  const id = "dddddddd-1";
  const manda = (c) => fetch(base + "/api/conversa", { method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, modo: "papo", msgs: [{ role: "user", content: c }] }) });
  chatRoteiro = ["Que legal! Como ela se chama? 😊"]; modRoteiro = ["SEGURA"]; factoRoteiro = ["Tem uma gata chamada Mimi"];
  await manda("Eu tenho uma gata chamada Mimi");
  await new Promise((r) => setTimeout(r, 300));
  chamadas = [];
  chatRoteiro = ["Oi! 😊"]; modRoteiro = ["SEGURA"]; factoRoteiro = [];
  await manda("Oi de novo, tudo bem?");
  assert.match(chamadas.find((c) => !c.mod).sistema, /gata chamada Mimi/);
  const html = await (await fetch(base + "/pais", { headers: { Authorization: auth } })).text();
  assert.match(html, /O que a Lua sabe dela/);
  assert.match(html, /Tem uma gata/);
  await fetch(base + "/pais/memoria", { method: "POST", headers: { Authorization: auth, "Content-Type": "application/x-www-form-urlencoded" }, body: "id=" + id + "&i=0", redirect: "manual" });
  const html2 = await (await fetch(base + "/pais", { headers: { Authorization: auth } })).text();
  assert.doesNotMatch(html2, /Tem uma gata/);
});

test("capítulo novo: a Lua escreve, valida, guarda e devolve; pedido pelo chat também", async () => {
  const opc = (a, b, c) => [{ t: a, ok: true, why: "Boa escolha." }, { t: b, ok: false, why: "Tente outra vez." }, { t: c, ok: false, why: "Pense de novo." }];
  const soc = (q, conc) => ({ emoji: "🙂🙂", texto: "A Nina pensa no que fazer agora.", pergunta: { conc, q, opcoes: opc("Falar com calma", "Gritar", "Fugir") } });
  const cap = () => JSON.stringify({ titulo: "O lanche", emoji: "🥪", resumo: "A Nina divide o lanche com a Malu.", cenas: [
    { emoji: "🏫🙂", texto: "Na hora do recreio, a Nina tem fome." }, soc("O que a Nina faz?", "social.amizade"),
    { emoji: "🥪🥪", texto: "A Malu tem 3 bolachas e a Nina tem 4.", conta: { tipo: "soma", a: 3, b: 4, objeto: "bolachas" } },
    soc("E agora?", "social.frustracao"), soc("Como a Malu se sente?", "social.sinais_corpo"),
    { emoji: "🌻🏠", texto: "Em casa, a Nina conta tudo para a mãe." }] });
  const id = "eeeeeeee-1";
  chatRoteiro = ["isto nao e json", cap()]; modRoteiro = ["SEGURA"];
  const r = await fetch(base + "/api/capitulo", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, tema: "a Nina faz uma amiga nova" }) });
  assert.equal(r.status, 200);
  const j = await r.json();
  assert.equal(j.cap.titulo, "O lanche");
  assert.equal(j.cap.cenas[2].pergunta.opcoes.find((o) => o.ok).t, "7");
  const lista = await (await fetch(base + "/api/capitulos?id=" + id)).json();
  assert.equal(lista.caps.length, 1);
  // pelo chat
  chatRoteiro = [cap()]; modRoteiro = ["SEGURA"];
  const c = await fala("Faz mas capítulos da turma do girassol");
  assert.match(c.resposta, /Escrevi um capítulo novo/);
  // moderador recusa: nada é guardado
  chatRoteiro = [cap(), cap(), cap()]; modRoteiro = ["INSEGURA", "INSEGURA", "INSEGURA"];
  const antes = (await (await fetch(base + "/api/capitulos?id=" + id)).json()).caps.length;
  const f = await fetch(base + "/api/capitulo", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
  assert.equal(f.status, 502);
  assert.equal((await (await fetch(base + "/api/capitulos?id=" + id)).json()).caps.length, antes);
});
