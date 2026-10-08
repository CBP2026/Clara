const { test, before, after } = require("node:test");
const assert = require("node:assert");
const { spawn } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const PORT = 18082;
const base = "http://localhost:" + PORT;
const auth = "Basic " + Buffer.from("pais:segredo").toString("base64");
let srv, dir, logFile, convFile;

const ev = (t, id, extra) => JSON.stringify({ t, id, tipo: "humor", rosto: 0, chips: [], ...extra });
// Lisboa: inverno = UTC, verao = UTC+1
const LINHAS = [
  ev("2026-01-15T12:00:00.000Z", "aaaaaaaa-1", {}),               // 12:00 local (inverno)
  ev("2026-01-15T13:00:00.000Z", "aaaaaaaa-1", {}),               // 13:00 local
  "linha quebrada {",
  ev("2026-07-01T11:00:00.000Z", "bbbbbbbb-2", {}),               // 12:00 local (verao)
  ev("2026-07-01T15:00:00.000Z", "bbbbbbbb-2", { teste: true }),  // 16:00 local, teste
];

before(async () => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), "clara-limp-"));
  logFile = path.join(dir, "log.jsonl");
  convFile = path.join(dir, "conversas.jsonl");
  fs.writeFileSync(logFile, LINHAS.join("\n") + "\n");
  fs.writeFileSync(convFile, JSON.stringify({ t: "2026-01-15T12:30:00.000Z", id: "aaaaaaaa-1", modo: "papo", user: "oi", origem: "ia" }) + "\n");
  srv = spawn(process.execPath, ["server.js"], { env: { ...process.env, PORT, PAIS_SENHA: "segredo", DATA_DIR: dir, PAIS_TZ: "Europe/Lisbon" }, stdio: "ignore" });
  for (let i = 0; i < 50; i++) {
    try { await fetch(base + "/api/config"); return; } catch (e) { await new Promise((r) => setTimeout(r, 100)); }
  }
  throw new Error("servidor não subiu");
});
after(() => { srv.kill(); fs.rmSync(dir, { recursive: true, force: true }); });

const limpar = (campos) => fetch(base + "/pais/limpar", {
  method: "POST",
  headers: { Authorization: auth, "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams(campos).toString()
});
const linhasLog = () => fs.readFileSync(logFile, "utf8").split("\n").filter(Boolean);

test("exige senha", async () => {
  const r = await fetch(base + "/pais/limpar", { method: "POST", body: "de=x" });
  assert.equal(r.status, 401);
});

test("datas invertidas, vazias e sem caixas dão 400 e não mexem no arquivo", async () => {
  const antes = linhasLog().length;
  assert.equal((await limpar({ de: "2026-01-15T14:00", ate: "2026-01-15T12:00", uso: "1" })).status, 400);
  assert.equal((await limpar({ de: "", ate: "", uso: "1" })).status, 400);
  assert.equal((await limpar({ de: "2026-01-15T12:00", ate: "2026-01-15T14:00" })).status, 400);
  assert.equal(linhasLog().length, antes);
});

test("intervalo vazio: nada para apagar", async () => {
  const r = await limpar({ de: "2025-01-01T00:00", ate: "2025-01-02T00:00", uso: "1" });
  assert.match(await r.text(), /Nada para apagar/);
});

test("sem confirmar só mostra a contagem (cancelar não apaga)", async () => {
  const r = await limpar({ de: "2026-01-15T12:00", ate: "2026-01-15T14:00", uso: "1" });
  const html = await r.text();
  assert.match(html, /Confirmar limpeza/);
  assert.match(html, /Registros de uso<\/b>: 2 linhas/);
  assert.equal(linhasLog().length, 5);
  assert.deepEqual(fs.readdirSync(dir).filter((f) => f.includes(".bak-")), []);
});

test("hora local respeita verão: 12:00 local de julho é 11:00Z", async () => {
  // intervalo 12:00-12:30 local em julho apanha so a linha das 11:00Z
  const r = await limpar({ de: "2026-07-01T12:00", ate: "2026-07-01T12:30", uso: "1" });
  assert.match(await r.text(), /Registros de uso<\/b>: 1 linhas/);
  // e 11:00-11:30 local (10:00Z-10:30Z) não apanha nada
  const r2 = await limpar({ de: "2026-07-01T11:00", ate: "2026-07-01T11:30", uso: "1" });
  assert.match(await r2.text(), /Nada para apagar/);
});

test("confirmar: faz backup, apaga só o intervalo e mantém linha quebrada", async () => {
  const r = await limpar({ de: "2026-01-15T12:00", ate: "2026-01-15T14:00", uso: "1", confirmar: "1" });
  assert.match(await r.text(), /Apagadas 2 linhas/);
  const restantes = linhasLog();
  assert.equal(restantes.length, 3);
  assert.ok(restantes.includes("linha quebrada {"));
  const baks = fs.readdirSync(dir).filter((f) => f.startsWith("log.jsonl.bak-"));
  assert.equal(baks.length, 1);
  assert.equal(fs.readFileSync(path.join(dir, baks[0]), "utf8").split("\n").filter(Boolean).length, 5);
  const csv = await (await fetch(base + "/pais/log.csv", { headers: { Authorization: auth } })).text();
  assert.equal(csv.trim().split("\n").length, 3); // cabeçalho + 2 válidas
});

test("caixa 'teste' apaga marcados fora do intervalo; conversas só se marcadas", async () => {
  const r = await limpar({ de: "2025-01-01T00:00", ate: "2025-01-02T00:00", uso: "1", teste: "1", confirmar: "1" });
  assert.match(await r.text(), /Apagadas 1 linhas/);
  assert.equal(linhasLog().filter((l) => l.includes('"teste":true')).length, 0);
  assert.equal(fs.readFileSync(convFile, "utf8").split("\n").filter(Boolean).length, 1);
  const r2 = await limpar({ de: "2026-01-15T12:00", ate: "2026-01-15T13:00", conversas: "1", confirmar: "1" });
  assert.match(await r2.text(), /Apagadas 1 linhas/);
  assert.equal(fs.readFileSync(convFile, "utf8").trim(), "");
});
