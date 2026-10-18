// Turma do Girassol: capitulos novos escritos pelo modelo, validados aqui antes de ela os ver.
// O modelo escreve a historia e as perguntas sociais; as contas (numeros) sao calculadas aqui, nunca pelo modelo.
const CONC_SOCIAIS = ["social.amizade", "social.frustracao", "social.conflito", "social.sinais_corpo", "social.seguranca", "social.digital"];

const BIBLIA = `Série "Turma do Girassol", escola Girassol (Portugal). Personagens fixas: Nina (14 anos, protagonista, nova na escola, sensível, às vezes tímida), Malu (amiga leal, calma, gosta de ler), Teo (colega engraçado mas teimoso e mandão), Rafa (do grupo popular; às vezes exclui sem querer ou diz coisas duras), Professora Lúcia (paciente), a mãe da Nina (acolhe e escuta). Pode surgir UMA personagem nova por capítulo, com nome simples.
Capítulos já escritos: 1) Nina chega, senta com a Malu no recreio e o Rafa derruba o sumo dela; 2) trabalho em grupo dos animais: Teo discorda da ideia da Nina e eles juntam gatos e cães; 3) a Nina não é chamada para o cinema do grupo da Rafa, a Malu a convida para o parque e a Nina conta tudo à mãe.`;

function sistemaCapitulo() {
  return `Você escreve capítulos curtos para uma app que ajuda uma adolescente de 15 anos com défice cognitivo e discalculia a treinar competências sociais, lidar com frustração e fazer amigos. Ela lê devagar: frases curtas, palavras simples, português do Brasil, sem gírias, sem ironia.
${BIBLIA}
O capítulo deve mostrar UMA situação do dia a dia escolar ou de amizade (sem nunca falar da vida real da menina) e ensinar com calma: reconhecer o que sente, respirar, falar com sinceridade, pedir ajuda, dividir, aceitar que nem tudo sai como queremos, contar a um adulto de confiança.
PROIBIDO: namoro, beijo, corpo, dietas, álcool, drogas, violência física, doença grave, morte, armas, sangue, bullying cruel sem saída, redes sociais perigosas, segredos contra os pais, palavrões. Os conflitos são pequenos e resolvem-se com conversa. Termina sempre com esperança e, se couber, com a Nina contando a um adulto.
Responda SÓ com JSON válido, sem texto antes ou depois, neste formato:
{"titulo":"até 30 letras","emoji":"1 ou 2 emojis","resumo":"1 frase com o que acontece","cenas":[
 {"emoji":"2 emojis","texto":"até 130 letras"},
 {"emoji":"2 emojis","texto":"até 130 letras","pergunta":{"conc":"social.amizade|social.frustracao|social.conflito|social.sinais_corpo|social.seguranca","q":"até 70 letras","opcoes":[{"t":"até 55 letras","ok":true,"why":"até 90 letras, gentil"},{"t":"...","ok":false,"why":"..."},{"t":"...","ok":false,"why":"..."}]}},
 {"emoji":"2 emojis","texto":"até 130 letras","conta":{"tipo":"soma|subtracao|vezes|hora","a":0,"b":0,"objeto":"o que se conta","h":0,"m":0,"dur":0}}
]}
Regras: 7 a 9 cenas; a primeira e a última sem pergunta; exatamente 3 cenas com "pergunta" social (3 opções, só 1 certa; as erradas são tentações realistas, nunca humilhantes; o "why" explica com carinho); exatamente 1 cena com "conta" (a conta fica DENTRO da história, ligada ao que acontece). Para "conta": soma usa a e b entre 1 e 10; subtracao usa a entre 5 e 15 e b menor que a; vezes usa a e b entre 2 e 5 (a grupos de b); hora usa h entre 8 e 17, m em 0, 15, 30 ou 45 e dur em 15, 30 ou 45 minutos (a pergunta é a que horas termina). Não escreva o resultado da conta nem a pergunta da conta: só os números e o objeto. A posição da opção certa deve variar.`;
}

function pontuacaoPorConta(c) {
  const t = String(c && c.tipo);
  if (t === "soma") return "num.somar";
  if (t === "subtracao") return "num.subtrair";
  if (t === "vezes") return "num.multiplicar";
  if (t === "hora") return "tempo.duracao";
  return "";
}

function embaralha(a) {
  const r = a.slice();
  for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]]; }
  return r;
}
function hh(h, m) { return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0"); }
function somaMin(h, m, d) { const t = h * 60 + m + d; return [Math.floor(t / 60) % 24, t % 60]; }

// Constroi a pergunta da conta a partir dos numeros do modelo. Devolve null se os numeros nao servirem.
function contaParaPergunta(c) {
  if (!c || typeof c !== "object") return null;
  const objeto = String(c.objeto || "coisas").replace(/[^\p{L} ]/gu, "").slice(0, 25).trim() || "coisas";
  const ni = (v, lo, hi) => Number.isInteger(v) && v >= lo && v <= hi;
  const opts = (certo, errados, fmt, wCerta, wErr) => {
    const unicos = [...new Set(errados.filter((x) => x !== certo && (typeof x !== "number" || x > 0)))].slice(0, 2);
    if (unicos.length < 2) return null;
    return embaralha([{ t: fmt(certo), ok: true, why: wCerta }].concat(unicos.map((x) => ({ t: fmt(x), ok: false, why: wErr }))));
  };
  const str = String;
  if (c.tipo === "soma" && ni(c.a, 1, 10) && ni(c.b, 1, 10)) {
    const r = c.a + c.b;
    const o = opts(r, [r + 1, r - 1, r + 2, r - 2, c.a], str, `${c.a} + ${c.b} = ${r}.`, `Conte tudo junto: ${c.a} + ${c.b} = ${r}.`);
    return o && { conc: "num.somar", q: `${objeto[0].toUpperCase() + objeto.slice(1)}: quantos são ao todo?`, opcoes: o };
  }
  if (c.tipo === "subtracao" && ni(c.a, 5, 15) && ni(c.b, 1, 14) && c.b < c.a) {
    const r = c.a - c.b;
    const o = opts(r, [r + 1, r - 1, r + 2, c.a + c.b, c.b], str, `${c.a} − ${c.b} = ${r}.`, `Para saber o que sobra, tire: ${c.a} − ${c.b} = ${r}.`);
    return o && { conc: "num.subtrair", q: `${objeto[0].toUpperCase() + objeto.slice(1)}: quantos sobram?`, opcoes: o };
  }
  if (c.tipo === "vezes" && ni(c.a, 2, 5) && ni(c.b, 2, 5)) {
    const r = c.a * c.b;
    const o = opts(r, [c.a + c.b, r + c.a, r - c.b, r + 1], str, `${c.a} grupos de ${c.b} = ${r}.`, `Conte de ${c.b} em ${c.b}, ${c.a} vezes: são ${r}.`);
    return o && { conc: "num.multiplicar", q: `${c.a} grupos de ${c.b} ${objeto}. Quantos são ao todo?`, opcoes: o };
  }
  if (c.tipo === "hora" && ni(c.h, 8, 17) && [0, 15, 30, 45].includes(c.m) && [15, 30, 45].includes(c.dur)) {
    const [fh, fm] = somaMin(c.h, c.m, c.dur);
    const [h2, m2] = somaMin(c.h, c.m, c.dur === 30 ? 15 : 30);
    const [h3, m3] = somaMin(c.h, c.m, c.dur + 15);
    const o = opts(hh(fh, fm), [hh(h2, m2), hh(h3, m3), hh(c.h, c.m)], str, `${hh(c.h, c.m)} mais ${c.dur} minutos = ${hh(fh, fm)}.`, `Comece em ${hh(c.h, c.m)} e some ${c.dur} minutos: ${hh(fh, fm)}.`);
    return o && { conc: "tempo.duracao", q: `Começa às ${hh(c.h, c.m)} e dura ${c.dur} minutos. A que horas termina?`, opcoes: o };
  }
  return null;
}

function extraiJson(raw) {
  let s = String(raw || "").trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const a = s.indexOf("{"), b = s.lastIndexOf("}");
  if (a < 0 || b <= a) throw new Error("sem json");
  return JSON.parse(s.slice(a, b + 1));
}
const lim = (s, n) => String(s === undefined || s === null ? "" : s).trim().slice(0, n);

// Valida e normaliza. Lanca Error com o motivo. `proibido(txt)` devolve motivo ou falso.
function validaCapitulo(raw, proibido) {
  const j = typeof raw === "string" ? extraiJson(raw) : raw;
  if (!j || !Array.isArray(j.cenas)) throw new Error("sem cenas");
  if (j.cenas.length < 6 || j.cenas.length > 10) throw new Error("numero de cenas: " + j.cenas.length);
  const titulo = lim(j.titulo, 30), resumo = lim(j.resumo, 160), emoji = lim(j.emoji, 12) || "🌻";
  if (!titulo || !resumo) throw new Error("sem titulo/resumo");
  let nSociais = 0, nContas = 0;
  const cenas = j.cenas.map((c, i) => {
    if (!c || typeof c !== "object") throw new Error("cena invalida");
    const texto = lim(c.texto, 170);
    if (texto.length < 8) throw new Error("texto curto na cena " + (i + 1));
    const cena = { emoji: lim(c.emoji, 12) || "🌻", texto };
    if (c.pergunta) {
      const p = c.pergunta, ops = Array.isArray(p.opcoes) ? p.opcoes : [];
      if (i === 0 || i === j.cenas.length - 1) throw new Error("pergunta no inicio/fim");
      if (ops.length !== 3 || ops.filter((o) => o && o.ok === true).length !== 1) throw new Error("opcoes invalidas");
      const q = lim(p.q, 90);
      const opcoes = ops.map((o) => ({ t: lim(o.t, 70), ok: o.ok === true, why: lim(o.why, 120) }));
      if (!q || opcoes.some((o) => !o.t || !o.why)) throw new Error("pergunta vazia");
      if (new Set(opcoes.map((o) => o.t.toLowerCase())).size < 3) throw new Error("opcoes repetidas");
      cena.pergunta = { conc: CONC_SOCIAIS.includes(p.conc) ? p.conc : "social.novela", q, opcoes };
      nSociais += 1;
    } else if (c.conta) {
      if (i === 0 || i === j.cenas.length - 1) throw new Error("conta no inicio/fim");
      const p = contaParaPergunta(c.conta);
      if (!p) throw new Error("conta invalida");
      cena.pergunta = p;
      nContas += 1;
    }
    return cena;
  });
  if (nSociais !== 3) throw new Error("perguntas sociais: " + nSociais);
  if (nContas !== 1) throw new Error("contas: " + nContas);
  const todo = [titulo, resumo].concat(cenas.flatMap((c) => [c.texto].concat(c.pergunta ? [c.pergunta.q].concat(c.pergunta.opcoes.flatMap((o) => [o.t, o.why])) : []))).join(" \n ");
  const mot = proibido(todo);
  if (mot) throw new Error("conteudo proibido: " + mot);
  return { titulo, emoji, resumo, cenas };
}

module.exports = { sistemaCapitulo, validaCapitulo, contaParaPergunta, extraiJson, CONC_SOCIAIS };
