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

test("classifica o que ela tenta fazer com a Lua", () => {
  const i = (user, origem) => S.intencao({ user, origem: origem || "ia" });
  assert.strictEqual(i("amanhã tenho prova de matemática"), "casa");
  assert.strictEqual(i("quanto é 7 mais 8?"), "casa");
  assert.strictEqual(i("quem é a Billie?"), "fatos");
  assert.strictEqual(i("estou triste"), "sentir");
  assert.strictEqual(i("faz mais capítulos", "pedido-app"), "app");
  assert.strictEqual(i("oi"), "outro");
  S.server.close();
});
