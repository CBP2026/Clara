#!/usr/bin/env python3
# Gera o HTML do material de inglês (o PDF é feito com Chromium).
import random, sys
random.seed(11)
def css():
    return """
@page { size: A4; margin: 13mm 14mm 13mm 14mm; }
* { box-sizing: border-box; }
body.x {} body { font-family: 'Inter', 'DejaVu Sans', sans-serif; font-size: 13.5pt; line-height: 1.42; color: #0f172a; margin: 0; }
.pg { page-break-after: always; position: relative; }
.pg:last-child { page-break-after: auto; }
h1 { font-size: 26pt; margin: 0 0 4px; line-height: 1.1; }
h2 { font-size: 20pt; margin: 0 0 6px; }
h3 { font-size: 15pt; margin: 14px 0 4px; }
.topo { display:flex; align-items:center; gap:12px; border-bottom: 4px solid #2563eb; padding-bottom: 6px; margin-bottom: 10px; }
.topo .num { background:#2563eb; color:#fff; font-weight:800; font-size:22pt; width:46px; height:46px; border-radius:50%; display:flex; align-items:center; justify-content:center; flex:none; }
.topo h2 { margin:0; }
.topo small { display:block; font-size:11pt; color:#475569; font-weight:500; }
p { margin: 6px 0; }
.caixa { border: 2.5px solid; border-radius: 12px; padding: 8px 14px; margin: 10px 0; break-inside: avoid; }
.aprende { border-color:#2563eb; background:#eff6ff; }
.exemplo { border-color:#15803d; background:#f0fdf4; }
.mao { border-color:#ea580c; background:#fff7ed; }
.dica { border-color:#ca8a04; background:#fefce8; font-size: 13pt; }
.pais { border-color:#7c3aed; background:#f5f3ff; font-size: 11pt; }
.pais p{margin:3px 0}
.caixa .t { font-weight:800; font-size:12pt; letter-spacing:.04em; text-transform:uppercase; display:block; margin-bottom:2px; }
.aprende .t { color:#1d4ed8; } .exemplo .t { color:#15803d; } .mao .t { color:#c2410c; } .dica .t { color:#a16207; } .pais .t { color:#6d28d9; }
.fr { display:inline-block; margin: 2px 10px 2px 0; vertical-align: middle; }
.mo { display:inline-block; margin: 2px 4px; vertical-align: middle; }
.resp { display:inline-block; border-bottom: 3px solid #334155; height: 28px; vertical-align: bottom; margin: 0 4px; }
ol.ex { padding-left: 34px; margin: 6px 0; }
ol.ex li { margin: 0 0 14px; padding-left: 4px; break-inside: avoid; }
ol.ex li::marker { font-weight: 800; color:#2563eb; }
.grande { font-size: 22pt; font-weight: 800; letter-spacing: .02em; }
.conta { font-size: 20pt; font-weight: 800; }
.linha { display:flex; align-items:center; gap:14px; flex-wrap:wrap; }
.v { color:#15803d; font-weight:800; }
.az { color:#2563eb; font-weight:800; } .la { color:#ea580c; font-weight:800; }
.estrelas { font-size: 20pt; letter-spacing: 6px; color:#cbd5e1; }
table.k { border-collapse: collapse; width:100%; font-size: 11pt; }
table.k td, table.k th { border: 1.5px solid #cbd5e1; padding: 3px 8px; text-align:left; vertical-align: top; }
table.k th { background:#f1f5f9; }
.rodape { position:absolute; bottom:-4px; right:0; font-size:9.5pt; color:#94a3b8; }
.par { display:inline-flex; align-items:center; gap:10px; margin-right: 20px; }
.circ { display:inline-block; width:34px; height:34px; border:3px solid #334155; border-radius:50%; vertical-align:middle; }
.mini { font-size: 12pt; color:#475569; }
"""

def topo(n, titulo, sub):
    return (f'<div class="topo"><div class="num">{n}</div><div><h2>{titulo}</h2>'
            f'<small>{sub}</small></div></div>')

def caixa(cls, titulo, corpo):
    return f'<div class="caixa {cls}"><span class="t">{titulo}</span>{corpo}</div>'

def rod(n):
    return f'<div class="rodape">Clara · Matemática · página {n}</div>'


def rod(n):
    return f'<div class="rodape">Clara · English · página {n}</div>'

EXTRA_CSS = """
table.w { border-collapse: collapse; width:100%; margin: 6px 0; }
table.w td { border: 1.5px solid #bfdbfe; padding: 4px 10px; background:#fff; }
table.w td.en { font-size: 16pt; font-weight: 800; color:#1d4ed8; width: 40%; }
table.w td.pr { font-size: 11pt; color:#64748b; width: 30%; }
table.w td.pt { font-size: 13pt; }
.chip { display:inline-block; border:2.5px solid #2563eb; background:#fff; color:#1d4ed8; font-weight:800; border-radius:10px; padding:1px 10px; margin:2px 4px; font-size:14pt; }
.col { display:inline-block; vertical-align: top; width: 46%; }
.lin { display:block; border-bottom: 2.5px solid #94a3b8; height: 30px; margin: 6px 0; }
.fala { border-left: 5px solid #2563eb; background:#f8fafc; padding: 4px 10px; margin: 4px 0; font-size: 14pt; }
.fala.b { border-color:#ea580c; }
.fala b { font-size: 11pt; text-transform: uppercase; color:#475569; display:block; line-height:1.1; }
.tt { font-size: 10.5pt; color:#64748b; }
body { font-size: 12.5pt; line-height: 1.35; }
table.w td { padding: 2px 9px; }
table.w td.en { font-size: 14.5pt; }
.fala { padding: 2px 10px; margin: 3px 0; font-size: 13pt; }
.caixa { margin: 7px 0; padding: 6px 12px; }
"""

def face(tipo, r=24):
    s = f'<svg width="{2*r+6}" height="{2*r+6}" viewBox="0 0 {2*r+6} {2*r+6}"><circle cx="{r+3}" cy="{r+3}" r="{r}" fill="#fde68a" stroke="#334155" stroke-width="2.5"/>'
    cx = r + 3
    s += f'<circle cx="{cx-9}" cy="{cx-5}" r="3" fill="#334155"/><circle cx="{cx+9}" cy="{cx-5}" r="3" fill="#334155"/>'
    if tipo == "happy":
        s += f'<path d="M{cx-11},{cx+5} Q{cx},{cx+20} {cx+11},{cx+5}" fill="none" stroke="#334155" stroke-width="3"/>'
    elif tipo == "sad":
        s += f'<path d="M{cx-11},{cx+14} Q{cx},{cx+3} {cx+11},{cx+14}" fill="none" stroke="#334155" stroke-width="3"/>'
    elif tipo == "tired":
        s = s.replace('r="3" fill="#334155"/><circle', 'r="0"/><circle', 1)
        s += f'<line x1="{cx-13}" y1="{cx-5}" x2="{cx-5}" y2="{cx-5}" stroke="#334155" stroke-width="3"/><line x1="{cx+5}" y1="{cx-5}" x2="{cx+13}" y2="{cx-5}" stroke="#334155" stroke-width="3"/>'
        s += f'<ellipse cx="{cx}" cy="{cx+13}" rx="5" ry="6" fill="#334155"/>'
    elif tipo == "fine":
        s += f'<path d="M{cx-10},{cx+8} Q{cx},{cx+14} {cx+10},{cx+8}" fill="none" stroke="#334155" stroke-width="3"/>'
    return s + "</svg>"

def pal(lst):
    """lista de (en, pronúncia, pt) -> tabela"""
    t = '<table class="w">'
    for en, pr, pt in lst:
        t += f'<tr><td class="en">{en}</td><td class="pr">({pr})</td><td class="pt">{pt}</td></tr>'
    return t + "</table>"

def chips(lst):
    return "".join(f'<span class="chip">{x}</span>' for x in lst)

def lin(n=1):
    return '<span class="lin"></span>' * n

def ex(n, lista):
    return f'<ol class="ex" start="{n}">' + "".join(f"<li>{x}</li>" for x in lista) + "</ol>"

def opcoes(lst):
    return "<br>".join(f'<span class="circ" style="width:22px;height:22px"></span> {o}' for o in lst)

def resp(w=140):
    return f'<span class="resp" style="width:{w}px"></span>'

def casa(pares):
    """ligue: pares (en, pt) -> duas colunas com letras; devolve html + resposta"""
    en = [p[0] for p in pares]
    pt = [p[1] for p in pares]
    ordem = list(range(len(pt)))
    random.shuffle(ordem)
    while ordem == list(range(len(pt))):
        random.shuffle(ordem)
    letras = "ABCDEFGH"
    esq = "".join(f'<div style="margin:6px 0"><b class="az">{i+1}.</b> <span class="grande" style="font-size:16pt">{e}</span> &nbsp; {resp(50)}</div>' for i, e in enumerate(en))
    dire = "".join(f'<div style="margin:6px 0"><b class="la">{letras[k]}.</b> {pt[ordem[k]]}</div>' for k in range(len(pt)))
    chave = [letras[ordem.index(i)] for i in range(len(pt))]
    return (f'<div><span class="col">{esq}</span><span class="col" style="margin-left:6%">{dire}</span></div>',
            ", ".join(f"{i+1}-{c}" for i, c in enumerate(chave)))

def sv(*partes):
    return "".join(partes)

pags = []
R = {}

# ------------------------------------------------------------------ CAPA
pags.append(f"""
<div class="pg" style="font-size:12pt;line-height:1.32">
<h1>English da Clara</h1>
<p style="font-size:15pt;color:#475569;margin-bottom:6px">Inglês para a vida real: escola, cantina e fazer amigas. Frases curtas, para falar em voz alta.</p>

{caixa("aprende", "Antes de começar", '''
<p>Este material tem <b>5 lições</b>. Faça <b>uma por dia</b> (20 a 30 minutos). Cada lição ensina <b>poucas palavras</b> e usa-as logo em frases e em conversas.</p>
<p>A ordem é sempre a mesma:<br>
<span class="az">1. Aprenda</span>: as palavras e frases novas, com o significado e como se diz.<br>
<span class="v">2. Diga em voz alta</span>: repita 3 vezes, como se estivesse a falar com alguém.<br>
<span class="la">3. Brinque</span>: ligar, escolher, completar.<br>
<b>4. Fale de verdade</b>: uma conversa curta para fazer com a mãe, o pai ou a irmã.</p>
''')}

{caixa("dica", "Três regras de ouro", '''
<p><b>1. Falar alto vale mais do que escrever certo.</b> Inglês aprende-se com a boca e com os ouvidos.</p>
<p><b>2. Não tem problema errar a pronúncia.</b> Entre parênteses está “como se lê” em português, só uma ajuda. Quem escuta vai entender.</p>
<p><b>3. Poucas palavras, muitas vezes.</b> Melhor saber 6 palavras bem do que 20 mais ou menos.</p>
''')}

<h3>O que você vai aprender</h3>
<table class="k">
<tr><th style="width:50px">Dia</th><th>Lição</th><th>Para que serve</th></tr>
<tr><td><b>1</b></td><td>Olá, obrigada, desculpa</td><td>Ser simpática com qualquer pessoa</td></tr>
<tr><td><b>2</b></td><td>Falar de mim</td><td>Dizer o nome, a idade e como estou</td></tr>
<tr><td><b>3</b></td><td>Na escola</td><td>Pedir ajuda e dizer “não entendi”</td></tr>
<tr><td><b>4</b></td><td>Na cantina</td><td>Pedir comida e bebida</td></tr>
<tr><td><b>5</b></td><td>Fazer amigas</td><td>Começar e acabar uma conversa</td></tr>
</table>

<p style="margin-top:6px"><b>Para ouvir:</b> peça ao celular “como se diz <i>thank you</i>” (ou use um tradutor com voz) e escute. Repita logo a seguir.</p>

{caixa("pais", "Para os pais · como ajudar", '''
<p>Foco em <b>frases úteis e repetição</b>, não em gramática. As lições seguem os níveis da app (palavras do dia a dia → frases de escola e treino → mini-diálogos).</p>
<p>• Na parte “Fale de verdade”, faça o outro papel e <b>responda devagar</b>. O objetivo é ela ouvir e responder, não acertar tudo.<br>
• A pronúncia entre parênteses é aproximada. Se puder, diga primeiro e deixe ela repetir.<br>
• Se ela “fugir” (chutar sem ler), a lição está difícil: volte às palavras e faça só o “diga em voz alta”.<br>
• As respostas estão na última página.</p>
''')}
{rod(1)}
</div>
""")

# ------------------------------------------------------------------ LIÇÃO 1
l1p = [("hello", "a gente diz: obrigada"), ]
m1, r1 = casa([("hello", "olá"), ("thank you", "obrigada"), ("sorry", "desculpa"), ("please", "por favor"), ("goodbye", "adeus")])
R[1] = r1
pags.append(f"""
<div class="pg">
{topo(1, "Olá, obrigada, desculpa", "Dia 1 · as palavras simpáticas que servem em qualquer lugar")}

{caixa("aprende", "Aprenda · 8 palavras", pal([
    ("hello / hi", "relô / rái", "olá"),
    ("goodbye", "gud-BÁI", "adeus"),
    ("please", "pliiz", "por favor"),
    ("thank you", "THÉNK iú", "obrigada"),
    ("sorry", "SÓ-ri", "desculpa"),
    ("yes", "iés", "sim"),
    ("no", "nôu", "não"),
    ("good morning", "gud MÓR-nin", "bom dia"),
]) + '<p class="tt">No “th” de <i>thank</i>, ponha a ponta da língua entre os dentes e sopre.</p>')}

{caixa("exemplo", "Exemplo · as palavras dentro de frases", '''
<div class="fala"><b>Você</b>Hello! Good morning!</div>
<div class="fala b"><b>Professora</b>Good morning, Clara!</div>
<div class="fala"><b>Você</b>Water, <span class="la">please</span>.</div>
<div class="fala b"><b>Colega</b>Here you are.</div>
<div class="fala"><b>Você</b><span class="la">Thank you!</span></div>
<p class="mini">“Here you are” (RÍAR iú ar) quer dizer “aqui tem”.</p>
''')}

{caixa("mao", "Diga em voz alta (3 vezes cada)", '''
<p>☐ Hello! &nbsp; ☐ Goodbye! &nbsp; ☐ Please. &nbsp; ☐ Thank you. &nbsp; ☐ Sorry.<br>
Dica: diga como se estivesse a falar com a pessoa de verdade, sorrindo.</p>
''')}
</div>
<div class="pg"><div class="topo" style="margin-bottom:6px"><div class="num" style="background:#ea580c">✎</div><div><h2>Agora você</h2><small>Faça devagar. Pode voltar à página anterior para espreitar.</small></div></div>

<p class="mini">Passo 1 · Ligue: escreva a letra do significado.</p>
{m1}

<p class="mini" style="margin-top:12px">Passo 2 · O que você diz? Marque a resposta.</p>
{ex(1, [
 'Alguém lhe dá uma bolacha.<br>' + opcoes(["Sorry.", "Thank you.", "Goodbye."]),
 'Você esbarra numa colega sem querer.<br>' + opcoes(["Sorry.", "Hello.", "No."]),
 'Você quer pedir um sumo com educação.<br>' + opcoes(["Juice, please.", "Juice, no.", "Juice, goodbye."]),
 'Você chega à escola de manhã.<br>' + opcoes(["Goodbye!", "Good morning!", "Sorry!"]),
])}

<p class="mini" style="margin-top:8px">Passo 3 · Complete a frase com uma palavra: <span class="chip">please</span><span class="chip">sorry</span><span class="chip">thank you</span></p>
{ex(5, [
 'Alguém segura a porta para você: “______________!”',
 'Você pisa no pé de alguém: “______________!”',
 'Você pede ajuda: “Help, ______________.”',
])}
{rod(3)}
</div>
""")
R["1b"] = "Passo 2: Thank you · Sorry · Juice, please · Good morning. Passo 3: thank you · sorry · please."

# ------------------------------------------------------------------ LIÇÃO 2
m2, r2 = casa([("happy", "feliz"), ("sad", "triste"), ("tired", "cansada")])
R[2] = r2
pags.append(f"""
<div class="pg">
{topo(2, "Falar de mim", "Dia 2 · nome, idade e como eu estou")}

{caixa("aprende", "Aprenda · quem sou eu", pal([
    ("My name is Clara.", "mái NÊIM iz", "O meu nome é Clara."),
    ("I am 15.", "ái ÉM fif-TIIN", "Tenho 15 anos."),
    ("I am from …", "ái ém FROM", "Eu sou de …"),
    ("Nice to meet you.", "náis tu MIIT iú", "Prazer em conhecer."),
]) + '<p class="tt">Em inglês diz-se “eu sou 15” (<i>I am 15</i>), não “tenho 15”.</p>')}

{caixa("aprende", "Aprenda · como você está?", f'''
<div class="linha"><span>{face("happy")}<br><b>happy</b> <span class="tt">(RÉ-pi)</span><br>feliz</span>
&nbsp;&nbsp;<span>{face("sad")}<br><b>sad</b> <span class="tt">(séd)</span><br>triste</span>
&nbsp;&nbsp;<span>{face("tired")}<br><b>tired</b> <span class="tt">(TÁI-erd)</span><br>cansada</span>
&nbsp;&nbsp;<span>{face("fine")}<br><b>fine</b> <span class="tt">(fáin)</span><br>bem</span></div>
<p><b>How are you?</b> <span class="tt">(RÁU ar iú)</span> = Como você está?<br>
<b>I am happy.</b> / <b>I am tired.</b> = Eu estou feliz. / Eu estou cansada.<br>
<b>I am fine, thank you. And you?</b> = Estou bem, obrigada. E você?</p>
''')}

{caixa("exemplo", "Exemplo · uma conversa", '''
<div class="fala"><b>Colega</b>Hi! What is your name?</div>
<div class="fala b"><b>Clara</b>My name is Clara. Nice to meet you!</div>
<div class="fala"><b>Colega</b>Nice to meet you! How are you?</div>
<div class="fala b"><b>Clara</b>I am fine, thank you. And you?</div>
<p class="mini">“What is your name?” (uót iz iór NÊIM) = Qual é o seu nome?</p>
''')}

{caixa("mao", "Diga em voz alta (3 vezes cada)", '''
<p>☐ My name is Clara. &nbsp; ☐ I am 15. &nbsp; ☐ Nice to meet you. &nbsp; ☐ I am fine, thank you.</p>
''')}
</div>
<div class="pg"><div class="topo" style="margin-bottom:6px"><div class="num" style="background:#ea580c">✎</div><div><h2>Agora você</h2><small>Faça devagar. Pode voltar à página anterior para espreitar.</small></div></div>

<p class="mini">Passo 1 · Escreva a sua resposta.</p>
{ex(1, [
 'My name is ' + resp(200) + '.',
 'I am ' + resp(80) + ' (número).',
 'Hoje eu estou: <span class="chip">happy</span><span class="chip">sad</span><span class="chip">tired</span><span class="chip">fine</span> → I am ' + resp(120) + '.',
])}

<p class="mini" style="margin-top:8px">Passo 2 · Ligue a carinha à palavra.</p>
<div class="linha" style="margin:4px 0 6px">
<span>{face("happy")}<br><b class="la">A</b></span> &nbsp;&nbsp; <span>{face("tired")}<br><b class="la">B</b></span> &nbsp;&nbsp; <span>{face("sad")}<br><b class="la">C</b></span></div>
<div class="grande" style="font-size:15pt">1. sad {resp(50)} &nbsp;&nbsp; 2. happy {resp(50)} &nbsp;&nbsp; 3. tired {resp(50)}</div>

<p class="mini" style="margin-top:12px">Passo 3 · Alguém pergunta “How are you?”. Qual é a boa resposta?</p>
{ex(4, [
 opcoes(["I am fine, thank you.", "I am a cat.", "Goodbye, goodbye."]),
 'Alguém diz “Nice to meet you!”.<br>' + opcoes(["Nice to meet you!", "Sorry, no.", "Water."]),
])}

<p class="mini" style="margin-top:8px">Passo 4 · Escreva (ou diga) uma frase sobre você.</p>
<div class="fala">I am ______________________________________</div>
{rod(5)}
</div>
""")
R["2b"] = "Passo 1: respostas pessoais (a idade é 15). Passo 2: 1-C, 2-A, 3-B. Passo 3: I am fine, thank you · Nice to meet you!"

# ------------------------------------------------------------------ LIÇÃO 3
m3, r3 = casa([("book", "livro"), ("pen", "caneta"), ("bag", "mochila"), ("teacher", "professora"), ("friend", "amiga")])
R[3] = r3
pags.append(f"""
<div class="pg">
{topo(3, "Na escola", "Dia 3 · pedir ajuda e dizer “não entendi”")}

{caixa("aprende", "Aprenda · coisas da sala de aula", pal([
    ("book", "buk", "livro"),
    ("pen", "pén", "caneta"),
    ("bag", "bég", "mochila"),
    ("teacher", "TI-tchâr", "professora"),
    ("friend", "frénd", "amiga / amigo"),
]))}

{caixa("aprende", "Aprenda · 4 frases que salvam", pal([
    ("Help, please.", "rélp PLIIZ", "Ajuda, por favor."),
    ("I don't understand.", "ái DÔN-t ân-der-STÉND", "Eu não entendi."),
    ("Again, please.", "a-GUÉN pliiz", "Outra vez, por favor."),
    ("Can I go to the toilet?", "kén ái gôu tu dâ TÓI-let", "Posso ir à casa de banho?"),
]) + '<p class="tt"><b>Dica:</b> “I don’t understand” não é feio. Quem pergunta aprende mais depressa.</p>')}

{caixa("exemplo", "Exemplo · na aula", '''
<div class="fala"><b>Professora</b>Open your book, please.</div>
<div class="fala b"><b>Clara</b>Sorry, I don’t understand. Again, please.</div>
<div class="fala"><b>Professora</b>Open your <span class="la">book</span>. <span class="tt">(abre o livro e mostra)</span></div>
<div class="fala b"><b>Clara</b>Thank you!</div>
''')}

{caixa("mao", "Diga em voz alta (3 vezes cada)", '''
<p>☐ Help, please. &nbsp; ☐ I don’t understand. &nbsp; ☐ Again, please. &nbsp; ☐ Can I go to the toilet?<br>
Tenha na mochila uma folhinha com estas 4 frases: pode mostrar se esquecer.</p>
''')}
</div>
<div class="pg"><div class="topo" style="margin-bottom:6px"><div class="num" style="background:#ea580c">✎</div><div><h2>Agora você</h2><small>Faça devagar. Pode voltar à página anterior para espreitar.</small></div></div>

<p class="mini">Passo 1 · Ligue: escreva a letra do significado.</p>
{m3}

<p class="mini" style="margin-top:12px">Passo 2 · O que você diz?</p>
{ex(1, [
 'Você não entendeu o que a professora disse.<br>' + opcoes(["I don’t understand.", "Thank you.", "Goodbye."]),
 'Você precisa de ir à casa de banho.<br>' + opcoes(["Can I go to the toilet?", "Good morning.", "Nice to meet you."]),
 'Você quer que ela repita.<br>' + opcoes(["Again, please.", "Sorry, no.", "Happy."]),
])}

<p class="mini" style="margin-top:8px">Passo 3 · Complete: <span class="chip">book</span><span class="chip">help</span><span class="chip">teacher</span><span class="chip">pen</span></p>
{ex(4, [
 'I read my ______________.',
 'I write with a ______________.',
 'The ______________ says: “Good morning!”',
 '“______________, please.” (pedir ajuda)',
])}

<p class="mini" style="margin-top:8px">Passo 4 · Copie devagar a frase que mais vai usar:</p>
<div class="fala">I don’t understand. Again, please.</div>
{lin(1)}
{rod(7)}
</div>
""")
R["3b"] = "Passo 2: I don’t understand · Can I go to the toilet? · Again, please. Passo 3: book · pen · teacher · help."

# ------------------------------------------------------------------ LIÇÃO 4
m4, r4 = casa([("water", "água"), ("juice", "sumo"), ("sandwich", "sandes"), ("apple", "maçã"), ("milk", "leite")])
R[4] = r4
pags.append(f"""
<div class="pg">
{topo(4, "Na cantina", "Dia 4 · pedir comida e bebida com educação")}

{caixa("aprende", "Aprenda · o que há para comer e beber", pal([
    ("water", "UÓ-târ", "água"),
    ("juice", "djuus", "sumo"),
    ("milk", "milk", "leite"),
    ("sandwich", "SÉN-uitch", "sandes"),
    ("apple", "É-pâl", "maçã"),
]))}

{caixa("aprende", "Aprenda · como pedir", pal([
    ("I want …", "ái UÓNT", "Eu quero …"),
    ("I like …", "ái LÁIK", "Eu gosto de …"),
    ("Can I have a water, please?", "kén ái rév a UÓ-târ pliiz", "Posso ter uma água, por favor?"),
    ("Here you are.", "RÍAR iú ar", "Aqui tem."),
]) + '<p class="tt">“Can I have …, please?” é a frase mais útil para pedir qualquer coisa. Troque só a palavra do meio.</p>')}

{caixa("exemplo", "Exemplo · na cantina", '''
<div class="fala"><b>Você</b>Hello! Can I have a <span class="la">sandwich</span>, please?</div>
<div class="fala b"><b>Moça da cantina</b>Yes. Here you are. Water or juice?</div>
<div class="fala"><b>Você</b>Juice, please.</div>
<div class="fala b"><b>Moça da cantina</b>Here you are. Two euros.</div>
<div class="fala"><b>Você</b>Thank you!</div>
<p class="mini">“Two euros” = dois euros. Se não entender o preço: “Again, please.”</p>
''')}

{caixa("mao", "Diga em voz alta (3 vezes cada)", '''
<p>☐ Can I have a water, please? &nbsp; ☐ I want a sandwich. &nbsp; ☐ I like apples. &nbsp; ☐ Thank you!</p>
''')}
</div>
<div class="pg"><div class="topo" style="margin-bottom:6px"><div class="num" style="background:#ea580c">✎</div><div><h2>Agora você</h2><small>Faça devagar. Pode voltar à página anterior para espreitar.</small></div></div>

<p class="mini">Passo 1 · Ligue: escreva a letra do significado.</p>
{m4}

<p class="mini" style="margin-top:12px">Passo 2 · Ponha as palavras em ordem e escreva a frase.</p>
{ex(1, [
 '<span class="chip">have</span><span class="chip">I</span><span class="chip">can</span><span class="chip">a</span><span class="chip">water,</span><span class="chip">please?</span><br>' + lin(1),
 '<span class="chip">want</span><span class="chip">a</span><span class="chip">I</span><span class="chip">sandwich.</span><br>' + lin(1),
 '<span class="chip">apples.</span><span class="chip">like</span><span class="chip">I</span><br>' + lin(1),
])}

<p class="mini" style="margin-top:2px">Passo 3 · Qual é a boa resposta?</p>
{ex(4, [
 'A moça diz: “Water or juice?”<br>' + opcoes(["Juice, please.", "Goodbye.", "I am 15."]),
 'Ela lhe dá o sumo e diz: “Here you are.”<br>' + opcoes(["Thank you!", "Sorry, no.", "Hello."]),
])}

<p class="mini" style="margin-top:8px">Passo 4 · Fale de você: o que você <b>gosta</b> de comer? Escreva 2 coisas.</p>
<div class="fala">I like ___________________ and ___________________.</div>
{rod(9)}
</div>
""")
R["4b"] = "Passo 2: Can I have a water, please? · I want a sandwich. · I like apples. Passo 3: Juice, please · Thank you!"

# ------------------------------------------------------------------ LIÇÃO 5
pags.append(f"""
<div class="pg">
{topo(5, "Fazer amigas", "Dia 5 · começar uma conversa e despedir-se")}

{caixa("aprende", "Aprenda · frases para fazer amigas", pal([
    ("Hi! I am Clara.", "rái ái ém CLÁ-ra", "Oi! Eu sou a Clara."),
    ("Do you want to play?", "du iú UÓNT tu PLÊI", "Você quer brincar/jogar?"),
    ("Yes, please!", "iés PLIIZ", "Sim, por favor!"),
    ("Sorry, I can’t.", "SÓ-ri ái CÁNT", "Desculpa, eu não posso."),
    ("Me too.", "mi TUU", "Eu também."),
    ("See you tomorrow!", "si iú tu-MÓ-rôu", "Até amanhã!"),
]))}

{caixa("exemplo", "Exemplo · conversa no recreio", '''
<div class="fala"><b>Clara</b>Hi! I am Clara.</div>
<div class="fala b"><b>Maria</b>Hi, Clara! I am Maria. Nice to meet you.</div>
<div class="fala"><b>Clara</b>Nice to meet you! Do you want to play?</div>
<div class="fala b"><b>Maria</b>Yes, please! I like games.</div>
<div class="fala"><b>Clara</b>Me too!</div>
<div class="fala b"><b>Maria</b>See you tomorrow!</div>
<div class="fala"><b>Clara</b>See you tomorrow! Goodbye!</div>
''')}

{caixa("dica", "Se ficar nervosa", '''
<p>Respire e diga só a primeira frase: <b>“Hi! I am Clara.”</b> A outra pessoa continua a conversa. Se não entender: <b>“Again, please.”</b> Sorrir ajuda mais do que qualquer palavra.</p>
''')}

{caixa("mao", "Fale de verdade · com a família", '''
<p>Uma pessoa faz a <b>Maria</b> e você faz a <b>Clara</b>. Leiam a conversa do recreio em voz alta, como numa peça de teatro. Depois troquem de papel. Na terceira vez, tente <b>sem olhar</b> para a página.</p>
''')}
</div>
<div class="pg"><div class="topo" style="margin-bottom:6px"><div class="num" style="background:#ea580c">✎</div><div><h2>Agora você</h2><small>Faça devagar. Pode voltar à página anterior para espreitar.</small></div></div>

<p class="mini">Passo 1 · Verdadeiro ou falso? Leia a conversa da página anterior.</p>
{ex(1, [
 'A Maria quer jogar com a Clara. &nbsp; ☐ Verdadeiro &nbsp; ☐ Falso',
 'A Maria diz “Goodbye” e não quer voltar a ver a Clara. &nbsp; ☐ Verdadeiro &nbsp; ☐ Falso',
 'As duas gostam de jogos (<i>games</i>). &nbsp; ☐ Verdadeiro &nbsp; ☐ Falso',
])}

<p class="mini" style="margin-top:4px">Passo 2 · Ponha a conversa em ordem. Escreva 1, 2, 3, 4.</p>
{ex(4, [
 resp(40) + ' Yes, please!',
 resp(40) + ' Do you want to play?',
 resp(40) + ' See you tomorrow!',
 resp(40) + ' Hi! I am Clara.',
])}

<p class="mini" style="margin-top:4px">Passo 3 · Uma colega pergunta “Do you want to play?” e você não pode. O que diz?</p>
{ex(8, [opcoes(["Sorry, I can’t.", "Water, please.", "Good morning."])])}

<p class="mini" style="margin-top:8px">Passo 4 · Invente a sua conversa: complete e depois leia em voz alta.</p>
<div class="fala"><b>Você</b>Hi! I am ______________. </div>
<div class="fala b"><b>Colega</b>Hi! Nice to meet you!</div>
<div class="fala"><b>Você</b>Nice to meet you! Do you want to ______________?</div>
<div class="fala b"><b>Colega</b>Yes, please!</div>
{rod(11)}
</div>
""")

# ------------------------------------------------------------------ FECHO
pags.append(f"""
<div class="pg">
<h2 style="font-size:24pt">Meu quadro de estrelas</h2>
<p>Pinte uma estrela por lição concluída. Cada lição vale uma estrela, mesmo que tenha errado algumas respostas.</p>
<p class="estrelas">★ ★ ★ ★ ★</p>
<table class="k" style="margin-bottom:10px">
<tr><th style="width:55px">Dia</th><th>Lição</th><th style="width:300px">Como foi? (circule)</th></tr>
<tr><td>1</td><td>Olá, obrigada, desculpa</td><td>Fácil · Mais ou menos · Difícil</td></tr>
<tr><td>2</td><td>Falar de mim</td><td>Fácil · Mais ou menos · Difícil</td></tr>
<tr><td>3</td><td>Na escola</td><td>Fácil · Mais ou menos · Difícil</td></tr>
<tr><td>4</td><td>Na cantina</td><td>Fácil · Mais ou menos · Difícil</td></tr>
<tr><td>5</td><td>Fazer amigas</td><td>Fácil · Mais ou menos · Difícil</td></tr>
</table>

{caixa("dica", "Desafio de fim de semana", '''
<p><b>Uma hora só em inglês, brincando.</b> Combine com a família 10 minutos em que só vale falar as frases deste material: pedir água (“Can I have a water, please?”), dizer como está (“I am happy”) e despedir-se (“See you tomorrow!”). Quem disser uma frase em inglês ganha um ponto. Se ela quiser, ouçam uma música em inglês e tentem achar as palavras que já conhecem (<i>please</i>, <i>thank you</i>, <i>friend</i>, <i>happy</i>).</p>
''')}

<h2 style="margin-top:14px">Respostas (para os pais)</h2>
<p class="mini">Confira só depois de ela terminar. Nas respostas pessoais não há errado.</p>
<table class="k">
<tr><th style="width:80px">Lição</th><th>Respostas</th></tr>
<tr><td><b>1</b></td><td>Passo 1: {R[1]}. {R['1b']}</td></tr>
<tr><td><b>2</b></td><td>{R['2b']}</td></tr>
<tr><td><b>3</b></td><td>Passo 1: {R[3]}. {R['3b']}</td></tr>
<tr><td><b>4</b></td><td>Passo 1: {R[4]}. {R['4b']}</td></tr>
<tr><td><b>5</b></td><td>Passo 1: Verdadeiro · Falso · Verdadeiro. Passo 2: Hi! I am Clara = 1 · Do you want to play? = 2 · Yes, please! = 3 · See you tomorrow! = 4. Passo 3: Sorry, I can’t.</td></tr>
</table>
{rod(12)}
</div>
""")

html = f"""<!doctype html><html lang="pt"><head><meta charset="utf-8"><title>English da Clara</title>
<style>{css()}{EXTRA_CSS}</style></head><body>{''.join(pags)}</body></html>"""
open(sys.argv[1], "w", encoding="utf-8").write(html)
print("ok", len(html))
