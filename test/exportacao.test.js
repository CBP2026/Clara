const { test, before, after } = require("node:test");
const assert = require("node:assert");
const { spawn } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const PORT = 18083;
const base = "http://localhost:" + PORT;
const auth = "Basic " + Buffer.from("pais:segredo").toString("base64");
let srv, dir;

before(async () => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), "clara-exp-"));
  fs.writeFileSync(path.join(dir, "conversas.jsonl"), [
    { t: "2026-10-07T10:00:00.000Z", id: "aaaaaaaa-1", modo: "papo", cenario: "", user: "oi, tudo bem?", resposta: "Oi!", origem: "ia" },
    { t: "2026-10-07T10:01:00.000Z", id: "aaaaaaaa-1", modo: "papo", cenario: "", user: "=SOMA(1)", resposta: "Fallback", origem: "filtro-saida", alerta: true, motivo: "vazia", bloqueada: "texto \"bloqueado\"", teste: true }
  ].map((o) => JSON.stringify(o)).join("\n") + "\n");
  srv = spawn(process.execPath, ["server.js"], { env: { ...process.env, PORT, PAIS_SENHA: "segredo", DATA_DIR: dir }, stdio: "ignore" });
  for (let i = 0; i < 50; i++) {
    try { await fetch(base + "/api/config"); return; } catch (e) { await new Promise((r) => setTimeout(r, 100)); }
  }
  throw new Error("servidor não subiu");
});
after(() => { srv.kill(); fs.rmSync(dir, { recursive: true, force: true }); });

const get = (rota, h) => fetch(base + rota, { headers: h || { Authorization: auth } });

test("exportações exigem senha", async () => {
  assert.equal((await get("/pais/conversas.csv", {})).status, 401);
  assert.equal((await get("/pais/perfis.csv", {})).status, 401);
});

test("conversas.csv tem todas as colunas, escapa fórmulas e marca teste", async () => {
  const r = await get("/pais/conversas.csv");
  assert.match(r.headers.get("content-disposition"), /clara-conversas\.csv/);
  const linhas = (await r.text()).trim().split("\n");
  assert.equal(linhas.length, 3);
  assert.match(linhas[0], /^hora_servidor,id,modo,cenario,ela_escreveu,lua_respondeu,origem,alerta,motivo,resposta_bloqueada,teste,tentativas,pedido,bloqueios_anteriores$/);
  assert.match(linhas[1], /"oi, tudo bem\?"/);
  assert.match(linhas[2], /"'=SOMA\(1\)"/);
  assert.match(linhas[2], /"texto ""bloqueado"""/);
  assert.match(linhas[2], /"sim","",""/);
});

test("perfis.csv lista o perfil enviado pelo app", async () => {
  await fetch(base + "/api/evento", { method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: "bbbbbbbb-2", tipo: "perfil", perfil: { nome: "Clara", lua: "Lua", novelas: ["Carrossel", "Chiquititas"], cantores: ["Ariana"], influs: [], jj: true, academia: "Alliance", faixa: "Cinza", proxima: "Cinza e preta", cor: "roxo" } }) });
  const txt = await (await get("/pais/perfis.csv")).text();
  const linhas = txt.trim().split("\n");
  assert.match(linhas[0], /^atualizado,id,nome,lua,novelas,cantores/);
  assert.match(linhas[1], /"bbbbbbbb-2","Clara","Lua","Carrossel; Chiquititas","Ariana"/);
});
