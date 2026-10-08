const { test, before, after } = require("node:test");
const assert = require("node:assert");
const { spawn } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const PORT = 18081;
const base = "http://localhost:" + PORT;
const auth = "Basic " + Buffer.from("pais:segredo").toString("base64");
const ID = "teste-aaaa-1111";
let srv, dir;

before(async () => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), "clara-"));
  srv = spawn(process.execPath, ["server.js"], { env: { ...process.env, PORT, PAIS_SENHA: "segredo", DATA_DIR: dir }, stdio: "ignore" });
  for (let i = 0; i < 50; i++) {
    try { await fetch(base + "/api/config"); return; } catch (e) { await new Promise((r) => setTimeout(r, 100)); }
  }
  throw new Error("servidor não subiu");
});
after(() => { srv.kill(); fs.rmSync(dir, { recursive: true, force: true }); });

const post = (rota, corpo) => fetch(base + rota, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(corpo) });

test("eventos de teste ficam marcados no log e fora do painel", async () => {
  const ev = { id: ID, tipo: "humor", rosto: 0, chips: [], texto: "evento-real-visivel" };
  assert.ok((await post("/api/evento", { ...ev, td: Date.now() })).ok);
  assert.ok((await post("/api/evento", { id: ID, tipo: "missao", mundo: "math", td: Date.now(), teste: true, acertos: 3 })).ok);
  await new Promise((r) => setTimeout(r, 200));
  const linhas = fs.readFileSync(path.join(dir, "log.jsonl"), "utf8").trim().split("\n").map(JSON.parse);
  assert.ok(linhas.some((l) => l.teste === true && l.tipo === "missao"));
  assert.ok(linhas.some((l) => !l.teste && l.tipo === "humor"));
  const html = await (await fetch(base + "/pais", { headers: { Authorization: auth } })).text();
  assert.match(html, /Último teste/);
  const csv = await (await fetch(base + "/pais/log.csv", { headers: { Authorization: auth } })).text();
  assert.match(csv.split("\n")[0], /,teste$/);
  assert.match(csv, /"sim"\n/);
});

test("teste-auth: senha certa ok, errada 401, bloqueio após 5 falhas", async () => {
  assert.equal((await post("/api/teste-auth", { senha: "segredo" })).status, 200);
  for (let i = 0; i < 5; i++) assert.equal((await post("/api/teste-auth", { senha: "x" })).status, 401);
  assert.equal((await post("/api/teste-auth", { senha: "segredo" })).status, 429);
});
