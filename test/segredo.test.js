const test = require("node:test");
const assert = require("node:assert");
process.env.PORT = "0";
process.env.DATA_DIR = require("os").tmpdir() + "/clara-segredo-" + process.pid;
require("fs").mkdirSync(process.env.DATA_DIR, { recursive: true });
const S = require("../server.js");

test("segredo contra os pais e idade de artista tem resposta fixa", () => {
  assert.ok(S.temaSegredo("posso te contar um segredo que os meus pais não podem saber?"));
  assert.ok(S.temaSegredo("não conta pra minha mãe, é segredo"));
  assert.ok(!S.temaSegredo("hoje eu treinei jiu-jitsu"));
  const r = S.temaIdadeArtista("quantos anos a Ariana tem?", Date.parse("2026-10-18T12:00:00Z"));
  assert.strictEqual(r.nome, "Ariana Grande");
  assert.strictEqual(r.idade, 33);
  assert.strictEqual(S.temaIdadeArtista("quantos anos a Ariana tem?", Date.parse("2026-06-25T12:00:00Z")).idade, 32);
  assert.strictEqual(S.temaIdadeArtista("quantos anos a minha mãe tem?"), null);
  assert.strictEqual(S.temaIdadeArtista("eu gosto da Ariana Grande"), null);
  S.server.close();
});
