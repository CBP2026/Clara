const { test } = require("node:test");
const assert = require("node:assert");
const { validaCapitulo, contaParaPergunta } = require("../capitulos.js");

const opc = (a, b, c) => [{ t: a, ok: true, why: "Boa escolha." }, { t: b, ok: false, why: "Tente outra vez." }, { t: c, ok: false, why: "Calma, pense de novo." }];
const social = (q, conc) => ({ emoji: "🙂🙂", texto: "Nina pensa no que fazer agora.", pergunta: { conc: conc || "social.amizade", q, opcoes: opc("Falar com calma", "Gritar", "Fugir") } });
function base() {
  return {
    titulo: "O lanche", emoji: "🥪", resumo: "Nina divide o lanche com a Malu.",
    cenas: [
      { emoji: "🏫🙂", texto: "Na hora do recreio, a Nina tem fome." },
      social("O que a Nina faz?"),
      { emoji: "🥪🥪", texto: "A Malu tem 3 bolachas e a Nina tem 4.", conta: { tipo: "soma", a: 3, b: 4, objeto: "bolachas" } },
      social("E agora?", "social.frustracao"),
      social("Como a Malu se sente?", "social.sinais_corpo"),
      { emoji: "🌻🏠", texto: "Em casa, a Nina conta tudo para a mãe." }
    ]
  };
}
const livre = () => "";

test("capitulo valido: a conta e calculada aqui, nunca pelo modelo", () => {
  const cap = validaCapitulo(JSON.stringify(base()), livre);
  const q = cap.cenas[2].pergunta;
  assert.equal(q.conc, "num.somar");
  assert.equal(q.opcoes.filter((o) => o.ok).length, 1);
  assert.equal(q.opcoes.find((o) => o.ok).t, "7");
});
test("aceita JSON dentro de cerca de codigo", () => {
  assert.ok(validaCapitulo("```json\n" + JSON.stringify(base()) + "\n```", livre).titulo);
});
test("recusa: sem perguntas sociais", () => {
  const b = base();
  b.cenas = b.cenas.map((c) => (c.pergunta && c.pergunta.conc && c.pergunta.conc.startsWith("social") ? { emoji: "🙂🙂", texto: "Nina respira fundo e sorri." } : c));
  assert.throws(() => validaCapitulo(b, livre), /sociais/);
});
test("aceita sem conta; recusa conta invalida", () => {
  const b = base(); b.cenas[2] = { emoji: "🥪🥪", texto: "A Malu tem bolachas e a Nina tambem." };
  assert.ok(validaCapitulo(b, livre).titulo);
  const c = base(); c.cenas[2].conta = { tipo: "soma", a: 300, b: 4, objeto: "x" };
  assert.throws(() => validaCapitulo(c, livre), /conta invalida/);
});
test("recusa: duas opcoes certas, pergunta no fim, conteudo proibido", () => {
  const a = base(); a.cenas[1].pergunta.opcoes[1].ok = true;
  assert.throws(() => validaCapitulo(a, livre), /opcoes/);
  const b = base(); b.cenas[5] = social("Fim?");
  assert.throws(() => validaCapitulo(b, livre), /inicio\/fim/);
  const c = base(); c.cenas[0].texto = "A Nina tem muita fome hoje.";
  assert.throws(() => validaCapitulo(c, (t) => /fome/.test(t) && "fome"), /proibido/);
});
test("contas: hora, subtracao e vezes tem uma so resposta certa e valores distintos", () => {
  for (let i = 0; i < 40; i++) {
    for (const c of [{ tipo: "hora", h: 10, m: 15, dur: 30 }, { tipo: "subtracao", a: 9, b: 4, objeto: "baloes" }, { tipo: "vezes", a: 3, b: 4, objeto: "fotos" }]) {
      const q = contaParaPergunta(c);
      assert.equal(q.opcoes.filter((o) => o.ok).length, 1);
      assert.equal(new Set(q.opcoes.map((o) => o.t)).size, 3);
    }
  }
  assert.equal(contaParaPergunta({ tipo: "hora", h: 10, m: 15, dur: 30 }).opcoes.find((o) => o.ok).t, "10:45");
  assert.equal(contaParaPergunta({ tipo: "subtracao", a: 5, b: 9 }), null);
});
