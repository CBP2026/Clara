#!/usr/bin/env python3
# Gera material/matematica.html (e o PDF é feito depois com Chromium).
import random, sys
random.seed(7)

AZUL, LARANJA, VERDE, CINZA = "#2563eb", "#ea580c", "#15803d", "#94a3b8"

def dots(n, cols=5, r=11, gap=6, cor=AZUL):
    """n bolinhas em fileiras de 5 (nunca espalhadas)."""
    rows = (n + cols - 1) // cols or 1
    w = cols * (2 * r + gap)
    h = rows * (2 * r + gap)
    s = f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}">'
    for i in range(n):
        x = (i % cols) * (2 * r + gap) + r + gap / 2
        y = (i // cols) * (2 * r + gap) + r + gap / 2
        s += f'<circle cx="{x}" cy="{y}" r="{r}" fill="{cor}"/>'
    return s + "</svg>"

def frame(n, vazio=False, r=15):
    """Quadro de 10 (2 filas de 5). 1ª fila azul, 2ª laranja."""
    cell = 2 * r + 6
    w, h = 5 * cell + 4, 2 * cell + 4
    s = f'<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}">'
    s += f'<rect x="2" y="2" width="{w-4}" height="{h-4}" fill="#fff" stroke="#334155" stroke-width="2.5" rx="4"/>'
    for i in range(1, 5):
        s += f'<line x1="{2+i*cell}" y1="2" x2="{2+i*cell}" y2="{h-2}" stroke="#cbd5e1" stroke-width="1.5"/>'
    s += f'<line x1="2" y1="{2+cell}" x2="{w-2}" y2="{2+cell}" stroke="#334155" stroke-width="2.5"/>'
    for i in range(min(n, 10)):
        cx = 2 + (i % 5) * cell + cell / 2
        cy = 2 + (i // 5) * cell + cell / 2
        s += f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{AZUL if i < 5 else LARANJA}"/>'
    return s + "</svg>"

def frames(n, r=15):
    """Mostra n (0..20) em um ou dois quadros de 10."""
    a = frame(min(n, 10), r=r)
    out = f'<span class="fr">{a}</span>'
    if n > 10:
        out += f'<span class="fr">{frame(n-10, r=r)}</span>'
    return out

def reta(a, b, saltos=None, marcas=None, destaque=(), sentido=1, larg=640):
    """Reta numérica de a até b. saltos = lista de (de, para, texto)."""
    n = b - a
    pad = 22
    esp = (larg - 2 * pad) / n
    h = 96
    s = f'<svg width="{larg}" height="{h}" viewBox="0 0 {larg} {h}">'
    y = 58
    s += f'<line x1="{pad-10}" y1="{y}" x2="{larg-pad+10}" y2="{y}" stroke="#334155" stroke-width="3"/>'
    for v in range(a, b + 1):
        x = pad + (v - a) * esp
        alto = 12 if v % 5 == 0 else 7
        s += f'<line x1="{x}" y1="{y-alto}" x2="{x}" y2="{y+alto}" stroke="#334155" stroke-width="{3 if v%5==0 else 2}"/>'
        mostra = marcas is None or v in marcas
        cor = "#0f172a"
        peso = "700" if v % 5 == 0 else "500"
        if v in destaque:
            s += f'<circle cx="{x}" cy="{y+27}" r="15" fill="#fde68a"/>'
        if mostra:
            s += f'<text x="{x}" y="{y+33}" text-anchor="middle" font-size="15" font-weight="{peso}" fill="{cor}">{v}</text>'
    for (de, para, txt) in (saltos or []):
        x1 = pad + (de - a) * esp
        x2 = pad + (para - a) * esp
        xm = (x1 + x2) / 2
        s += f'<path d="M{x1},{y-8} Q{xm},{y-52} {x2},{y-8}" fill="none" stroke="{VERDE}" stroke-width="3"/>'
        # ponta de seta
        d = 1 if x2 > x1 else -1
        s += f'<path d="M{x2-d*8},{y-18} L{x2},{y-8} L{x2+d*3},{y-20}" fill="none" stroke="{VERDE}" stroke-width="3"/>'
        s += f'<text x="{xm}" y="{y-36}" text-anchor="middle" font-size="14" font-weight="700" fill="{VERDE}">{txt}</text>'
    return s + "</svg>"

def moeda(v, tipo="m"):
    if tipo == "n":  # nota
        cor = {5: "#a3a3a3", 10: "#f87171", 20: "#60a5fa"}[v]
        return (f'<svg width="92" height="52" viewBox="0 0 92 52"><rect x="2" y="2" width="88" height="48" rx="5" '
                f'fill="{cor}" stroke="#334155" stroke-width="2.5"/><text x="46" y="35" text-anchor="middle" '
                f'font-size="24" font-weight="800" fill="#fff" stroke="#334155" stroke-width=".6">{v} €</text></svg>')
    fundo = "#facc15" if v == 1 else "#d1d5db"
    anel = "#d1d5db" if v == 1 else "#facc15"
    return (f'<svg width="52" height="52" viewBox="0 0 52 52"><circle cx="26" cy="26" r="24" fill="{anel}" stroke="#334155" stroke-width="2.5"/>'
            f'<circle cx="26" cy="26" r="16" fill="{fundo}" stroke="#334155" stroke-width="1.5"/>'
            f'<text x="26" y="33" text-anchor="middle" font-size="19" font-weight="800" fill="#334155">{v}</text></svg>')

def moedas(lista):
    out = ""
    for v in lista:
        out += f'<span class="mo">{moeda(v, "n" if v >= 5 else "m")}</span>'
    return out

def caixa_resposta(w=70):
    return f'<span class="resp" style="width:{w}px"></span>'

# ---------------------------------------------------------------- exercícios
respostas = {}

def ex(n, lista):
    return f'<ol class="ex" start="{n}">' + "".join(f"<li>{x}</li>" for x in lista) + "</ol>"

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

pags = []

# ============================================================ CAPA
capa = f"""
<div class="pg" style="font-size:12pt;line-height:1.32">
<h1>Matemática da Clara</h1>
<p style="font-size:15pt;color:#475569;margin-bottom:6px">Material de estudo para fazer em casa: devagar, com as mãos e com desenhos.</p>

{caixa("aprende", "Antes de começar", '''
<p>Este material tem <b>5 lições</b>. Faça <b>uma lição por dia</b> (cerca de 20 a 30 minutos). Não precisa fazer tudo de uma vez.</p>
<p>Em cada lição tem <b>quatro partes</b>, sempre na mesma ordem:</p>
<p><span class="az">1. Aprenda</span>: uma ideia nova, explicada com desenhos.<br>
<span class="v">2. Exemplo</span>: uma conta resolvida passo a passo.<br>
<span class="la">3. Com as mãos</span>: fazer a mesma coisa com objetos de verdade.<br>
<b>4. Agora você</b>: algumas contas para fazer sozinha.</p>
''')}

{caixa("dica", "Três regras de ouro", '''
<p><b>1. Pode usar os dedos, os objetos e os desenhos. Sempre.</b> Não é fazer batota: é assim que o cérebro aprende números.</p>
<p><b>2. Errar não faz mal.</b> Se não souber, volte ao desenho da lição ou escreva “não sei” e pule. Um dia depois, tente de novo.</p>
<p><b>3. Devagar é melhor do que depressa.</b> Leia a pergunta duas vezes antes de responder.</p>
''')}

<h3>O que você vai aprender</h3>
<table class="k">
<tr><th style="width:50px">Dia</th><th>Lição</th><th>Para que serve</th></tr>
<tr><td><b>1</b></td><td>Os números até 20 em “casinhas” de 5 e de 10</td><td>Ver quanto é sem contar um por um</td></tr>
<tr><td><b>2</b></td><td>Mais, menos, antes e depois</td><td>Comparar e saber que número vem a seguir</td></tr>
<tr><td><b>3</b></td><td>Somar (juntar)</td><td>Quantas figurinhas eu tenho no total?</td></tr>
<tr><td><b>4</b></td><td>Tirar (subtrair)</td><td>Quantas sobraram? Quanto falta?</td></tr>
<tr><td><b>5</b></td><td>Dinheiro em euros</td><td>Pagar, somar preços e conferir o troco</td></tr>
</table>

<h3>Material que você vai precisar</h3>
<p style="margin-top:2px">Lápis e borracha · 20 objetos pequenos iguais (botões, tampinhas, feijões, moedas de brinquedo) · um copo ou tigela · 2 euros em moedas de verdade, se possível.</p>

{caixa("pais", "Para os pais · como ajudar", '''
<p>A Clara tem discalculia: o sentido de quantidade não é automático. Por isso o material nunca pede “decorar contas”. Ele constrói o <b>sentido do número</b> com quadros de 10, reta numérica e objetos, e só depois passa ao papel.</p>
<p>• Sente-se ao lado na parte “Com as mãos” da primeira vez. Depois ela repete sozinha.<br>
• Se ela errar, <b>não diga “errado”</b>: peça para mostrar com os objetos. A resposta aparece sozinha.<br>
• Se ela “fugir” (chutar sem olhar), a tarefa está difícil demais: volte um passo, não insista.<br>
• Respostas na última página. Confira só depois de ela terminar.</p>
''')}
{rod(1)}
</div>
"""
pags.append(capa)

# ============================================================ LIÇÃO 1
resp1 = {}
q1 = [(7), (13), (16), (9)]
L1_ex = []
for i, n in enumerate(q1):
    L1_ex.append(f'<div class="linha">{frames(n, r=13)}<span>Quantos? {caixa_resposta(70)}</span></div>')
resp1["1"] = [str(n) for n in q1]

pintar = [6, 10, 14]
L1_pintar = []
for n in pintar:
    base = (f'<span class="fr">{frame(0, r=13)}</span>' + (f'<span class="fr">{frame(0, r=13)}</span>' if n > 10 else ""))
    L1_pintar.append(f'<div class="linha">{base}<span>Pinte (ou ponha tampinhas) até ficar <b class="grande">{n}</b></span></div>')

L1 = f"""
<div class="pg">
{topo(1, "Os números até 20 em casinhas", "Dia 1 · ver quantos são sem contar um por um")}

{caixa("aprende", "Aprenda · o quadro de 10", f'''
<p>Contar um por um cansa e a gente se perde. Vamos usar um <b>quadro de 10</b>: duas filas de 5 casinhas.</p>
<div class="linha">{frame(5)} <span>= <b class="az">5</b> (a fila de cima cheia)</span></div>
<div class="linha">{frame(10)} <span>= <b>10</b> (as duas filas cheias)</span></div>
<p>Repare nas cores: a <span class="az">fila azul</span> sempre tem 5. A <span class="la">fila laranja</span> é o que passa de 5.</p>
<p><b>Para ler um número, olhe para os 5 azuis primeiro e depois conte só o que sobra.</b></p>
''')}

{caixa("exemplo", "Exemplo · quanto é isto?", f'''
<div class="linha">{frames(13)}</div>
<p>1. O primeiro quadro está <b>cheio</b>: é <b>10</b>.<br>
2. No segundo quadro há só <b class="az">3</b> bolinhas, todas na fila azul.<br>
3. <b>10 e mais 3</b> = <span class="grande v">13</span></p>
''')}

{caixa("mao", "Com as mãos", '''
<p>1. Pegue <b>13 tampinhas</b>. Desenhe, num papel, 2 quadros de 10 (ou use o desenho acima).<br>
2. Ponha as tampinhas nas casinhas, <b>fila por fila</b>, sempre começando pela fila de cima.<br>
3. Quando o primeiro quadro encher, olhe: sobraram quantas? Diga em voz alta: “<b>10 e mais 3</b>”.<br>
4. Repita com 8, 12, 15 e 19.</p>
''')}

</div><div class="pg"><div class="topo" style="margin-bottom:6px"><div class="num" style="background:#ea580c">✎</div><div><h2>Agora você</h2><small>Faça devagar. Pode usar os dedos, as tampinhas e os desenhos.</small></div></div>
<p class="mini">Passo 1 · Diga quantas bolinhas. Use “10 e mais…” se precisar.</p>
{ex(1, L1_ex)}
<p class="mini">Passo 2 · Desenhe as bolinhas para chegar ao número.</p>
{ex(5, L1_pintar)}
{rod(2)}
</div>
"""
pags.append(L1)

# ============================================================ LIÇÃO 2
# comparar
comp = [(8, 5), (6, 9), (7, 7), (12, 10), (4, 11)]
def texto_comp(a, b):
    return "igual" if a == b else ("esquerda" if a > b else "direita")
L2_comp = []
resp2_comp = []
for a, b in comp:
    L2_comp.append(
        f'<div class="linha"><span class="par">{dots(a)}</span>'
        f'<span class="mini">ou</span><span class="par">{dots(b, cor=LARANJA)}</span></div>'
        f'<div class="mini">Quem tem mais? <span class="circ"></span> esquerda &nbsp; <span class="circ"></span> direita &nbsp; <span class="circ"></span> iguais</div>')
    resp2_comp.append(f"{a} e {b} → " + ("iguais" if a == b else ("esquerda (azul)" if a > b else "direita (laranja)")))

seq = [(8, None), (None, 15), (11, None), (None, 20), (5, None)]
# (depois de x), (antes de y)
L2_seq = []
resp2_seq = []
for dep, antes in seq:
    if dep is not None:
        L2_seq.append(f'O número que vem <b>depois</b> do <span class="grande">{dep}</span> é {caixa_resposta(60)}')
        resp2_seq.append(f"depois do {dep} → {dep+1}")
    else:
        L2_seq.append(f'O número que vem <b>antes</b> do <span class="grande">{antes}</span> é {caixa_resposta(60)}')
        resp2_seq.append(f"antes do {antes} → {antes-1}")

L2 = f"""
<div class="pg">
{topo(2, "Mais, menos, antes e depois", "Dia 2 · comparar grupos e usar a reta dos números")}

{caixa("aprende", "Aprenda · quem tem mais?", f'''
<p>Para saber quem tem <b>mais</b>, não precisa contar tudo. <b>Faça pares</b>: ligue uma bolinha de um lado com uma do outro. Quem ficar com bolinhas sobrando tem mais.</p>
<div class="linha"><span class="par">{dots(7)}</span><span class="mini">ou</span><span class="par">{dots(4, cor=LARANJA)}</span></div>
<p>O azul tem <b>mais</b> (sobram 3). O laranja tem <b>menos</b>.</p>
''')}

{caixa("aprende", "Aprenda · a reta dos números", f'''
<p>Os números ficam <b>em fila</b>, sempre na mesma ordem. Andar para a <b>direita</b> é ficar com <b>mais</b>. Andar para a <b>esquerda</b> é ficar com <b>menos</b>.</p>
{reta(0, 20, destaque=(), saltos=[(8, 9, "+1")], marcas=set(range(0, 21)), larg=700)}
<p>Depois do 8 vem o <b>9</b> (um passo para a direita). Antes do 8 vem o <b>7</b> (um passo para a esquerda).</p>
''')}

{caixa("mao", "Com as mãos", '''
<p>Faça duas fileiras de tampinhas, uma de <b>6</b> e outra de <b>9</b>. Ponha uma embaixo da outra, alinhadas. Quem passa do fim da outra tem mais. Diga: “<b>9 é mais que 6. Sobram 3.</b>”</p>
<p>Depois, no chão, faça com fita ou giz uma reta de 0 a 10. Dê um passo de cada vez, falando o número: “6… 7… 8…”.</p>
''')}

</div><div class="pg"><div class="topo" style="margin-bottom:6px"><div class="num" style="background:#ea580c">✎</div><div><h2>Agora você</h2><small>Faça devagar. Pode usar os dedos, as tampinhas e os desenhos.</small></div></div>
<p class="mini">Passo 1 · Faça pares com os olhos (ou com o dedo) e marque quem tem mais.</p>
{ex(1, L2_comp)}
<p class="mini">Passo 2 · Use a reta de cima. Escreva o número que vem antes ou depois.</p>
{ex(6, L2_seq)}
{rod(3)}
</div>
"""
pags.append(L2)

# ============================================================ LIÇÃO 3
soma_reta = [(4, 3), (5, 4), (6, 2)]
L3_reta = []
resp3_reta = []
for a, b in soma_reta:
    L3_reta.append(f'<span class="conta">{a} + {b} = </span>{caixa_resposta(70)}'
                   f'<br><span class="mini">Comece no {a}. Dê {b} passos para a direita.</span>')
    resp3_reta.append(f"{a}+{b}={a+b}")

soma10 = [(9, 4), (8, 5), (7, 6), (8, 7)]
L3_10 = []
resp3_10 = []
for a, b in soma10:
    falta = 10 - a
    resto = b - falta
    L3_10.append(f'<span class="conta">{a} + {b}</span> &nbsp;→ para chegar a 10, o {a} precisa de {caixa_resposta(40)} &nbsp;sobra {caixa_resposta(40)} &nbsp;→ 10 + sobra = {caixa_resposta(50)}')
    resp3_10.append(f"{a}+{b}: precisa de {falta}, sobra {resto}, resultado {a+b}")

L3_hist = [
    ("A Clara tem <b>8 figurinhas</b> e ganha mais <b>5</b>. Quantas tem agora?", 13),
    ("No treino de jiu-jitsu, ela ganhou <b>6 pontos</b> no primeiro combate e <b>7</b> no segundo. Quantos pontos ao todo?", 13),
]
resp3_hist = [str(x) for _, x in L3_hist]

L3 = f"""
<div class="pg">
{topo(3, "Somar: juntar para saber o total", "Dia 3 · duas maneiras de somar sem decorar")}

{caixa("aprende", "Aprenda · somar é andar para a direita", f'''
<p>Somar é <b>juntar</b>. O sinal <b class="grande">+</b> quer dizer “e mais”. O sinal <b class="grande">=</b> quer dizer “dá”.</p>
<p><b>Maneira 1 · na reta.</b> Comece no primeiro número. Dê tantos passos quantos o segundo número manda.</p>
{reta(0, 12, saltos=[(5, 6, "1"), (6, 7, "2"), (7, 8, "3")], destaque=(5, 8), larg=700)}
<p><b>5 + 3</b>: começo no 5, dou 3 passos (6, 7, 8) e chego no <b class="v">8</b>. <span class="mini">Dica: comece sempre pelo número maior.</span></p>
''')}

{caixa("aprende", "Aprenda · Maneira 2: completar o 10", f'''
<p>Quando a conta passa de 10, é difícil contar. O truque: <b>primeiro encher o quadro de 10</b>.</p>
<p><b>9 + 4</b></p>
<div class="linha">{frame(9)} <span class="grande">+</span> {frame(4)}</div>
<p>1. O 9 precisa de <b>1</b> para chegar a 10.<br>
2. Do 4, tiro 1 e sobram <b>3</b>.<br>
3. <b>10 e mais 3 = <span class="v">13</span></b>.</p>
''')}

{caixa("mao", "Com as mãos", '''
<p>Faça <b>8 + 5</b> com tampinhas: ponha 8 no quadro de 10. Quantas faltam para encher? (2.) Tire 2 das 5 e passe para o quadro. Sobraram quantas? (3.) Agora é <b>10 e mais 3</b>.</p>
''')}

</div><div class="pg"><div class="topo" style="margin-bottom:6px"><div class="num" style="background:#ea580c">✎</div><div><h2>Agora você</h2><small>Faça devagar. Pode usar os dedos, as tampinhas e os desenhos.</small></div></div>
<p class="mini">Passo 1 · Use a reta: comece no primeiro número e dê os passos.</p>
{reta(0, 12, larg=700)}
{ex(1, L3_reta)}
<p class="mini">Passo 2 · Complete o 10, como no exemplo.</p>
{ex(4, L3_10)}
<p class="mini">Passo 3 · Problemas da vida real. Desenhe se ajudar.</p>
{ex(8, [t + f"<br><span class='mini'>Resposta: {caixa_resposta(60)}</span>" for t, _ in L3_hist])}
{rod(4)}
</div>
"""
pags.append(L3)

# ============================================================ LIÇÃO 4
sub_reta = [(9, 4), (8, 3), (10, 6)]
L4_reta = []
resp4_reta = []
for a, b in sub_reta:
    L4_reta.append(f'<span class="conta">{a} − {b} = </span>{caixa_resposta(70)}'
                   f'<br><span class="mini">Comece no {a}. Dê {b} passos para a esquerda.</span>')
    resp4_reta.append(f"{a}−{b}={a-b}")

sub_dez = [(12, 5), (14, 6), (15, 8)]
L4_dez = []
resp4_dez = []
for a, b in sub_dez:
    p1 = a - 10
    p2 = b - p1
    res = a - b
    L4_dez.append(f'<span class="conta">{a} − {b}</span> &nbsp;→ tiro {p1} para chegar a 10; falta tirar {caixa_resposta(40)}; &nbsp;10 − {p2} = {caixa_resposta(50)}')
    resp4_dez.append(f"{a}−{b}: tira {p1}, falta tirar {p2}, resultado {res}")

sub_falta = [(8, 11), (6, 13)]
L4_falta = []
resp4_falta = []
for a, b in sub_falta:
    L4_falta.append(f'A Clara tem <b>{a}</b> euros e quer um boné que custa <b>{b}</b> euros. Quanto <b>falta</b>?<br>'
                    f'<span class="mini">Comece no {a} e conte quantos passos faltam até {b}.</span> {caixa_resposta(60)}')
    resp4_falta.append(f"{b}−{a}={b-a}")

L4_hist = [("Havia <b>15 bolachas</b> no prato. A Clara e a Malu comeram <b>7</b>. Quantas sobraram?", 8)]

L4 = f"""
<div class="pg">
{topo(4, "Tirar: o que sobra e o que falta", "Dia 4 · subtrair com a reta e com o quadro de 10")}

{caixa("aprende", "Aprenda · tirar é andar para a esquerda", f'''
<p>Tirar é o contrário de somar. O sinal <b class="grande">−</b> quer dizer “tira”. <b>Começo no primeiro número e ando para a esquerda.</b></p>
{reta(0, 12, saltos=[(9, 8, "1"), (8, 7, "2"), (7, 6, "3"), (6, 5, "4")], destaque=(9, 5), larg=700)}
<p><b>9 − 4</b>: começo no 9, dou 4 passos para trás (8, 7, 6, 5) e chego no <b class="v">5</b>.</p>
''')}

{caixa("aprende", "Aprenda · quando passa de 10, volte ao 10", f'''
<p><b>13 − 5</b>. Primeiro tiro o que dá para chegar ao 10; depois tiro o resto.</p>
<div class="linha">{frames(13)}</div>
<p>1. Para chegar a 10, tiro <b>3</b> (13 − 3 = 10).<br>
2. Eu devia tirar 5. Já tirei 3, então <b>faltam 2</b>.<br>
3. <b>10 − 2 = <span class="v">8</span></b>.</p>
''')}

{caixa("aprende", "Aprenda · quanto falta? (a conta de comprar)", f'''
<p>Às vezes não se tira: <b>conta-se de baixo para cima</b>. Tenho 7 euros, preciso de 12. Quanto falta?</p>
{reta(0, 14, saltos=[(7, 12, "5")], destaque=(7, 12), larg=700)}
<p>De 7 até 12 são <b>5</b> passos. Faltam <b class="v">5 euros</b>.</p>
''')}

{caixa("mao", "Com as mãos", '''
<p>Ponha <b>12 tampinhas</b> na mesa. Tire 5 e esconda-as com o copo. Conte o que sobrou: <b>7</b>. Levante o copo e confira: 7 + 5 = 12. <b>Somar e tirar são amigos: um desfaz o outro.</b></p>
''')}

</div><div class="pg"><div class="topo" style="margin-bottom:6px"><div class="num" style="background:#ea580c">✎</div><div><h2>Agora você</h2><small>Faça devagar. Pode usar os dedos, as tampinhas e os desenhos.</small></div></div>
<p class="mini">Passo 1 · Ande para a esquerda.</p>
{ex(1, L4_reta)}
<p class="mini">Passo 2 · Volte ao 10.</p>
{ex(4, L4_dez)}
<p class="mini">Passo 3 · Quanto falta?</p>
{ex(7, L4_falta)}
<p class="mini">Passo 4 · Problema.</p>
{ex(9, [L4_hist[0][0] + f"<br><span class='mini'>Resposta: {caixa_resposta(60)}</span>"])}
{rod(5)}
</div>
"""
pags.append(L4)

# ============================================================ LIÇÃO 5 · EUROS
euros_soma = [([2, 1], "uma sandes (2 €) e um sumo (1 €)", 3),
              ([5, 2], "um livro (5 €) e uma caneta (2 €)", 7),
              ([2, 2, 2], "três pulseiras de 2 € cada", 6),
              ([5, 5, 1], "dois cadernos de 5 € e um lápis de 1 €", 11)]
L5_soma = []
resp5_soma = []
for l, t, r in euros_soma:
    L5_soma.append(f'{t}.<br><div class="linha">{moedas(l)}<span class="conta">= </span>{caixa_resposta(70)}<span class="mini">euros</span></div>')
    resp5_soma.append(f"{' + '.join(map(str,l))} = {r} €")

troco = [(5, 3), (10, 7), (10, 4), (5, 1)]
L5_troco = []
resp5_troco = []
for pago, preco in troco:
    L5_troco.append(f'Paga com <b>{pago} €</b> uma coisa de <b>{preco} €</b>. Quanto é o troco?<br>'
                    f'<span class="mini">Conte de {preco} até {pago}, de euro em euro.</span> {caixa_resposta(60)}')
    resp5_troco.append(f"{pago}−{preco}={pago-preco} €")

L5 = f"""
<div class="pg">
{topo(5, "Dinheiro em euros", "Dia 5 · somar preços e conferir o troco")}

{caixa("aprende", "Aprenda · moedas e notas que vamos usar", f'''
<div class="linha">{moedas([1])}<span>moeda de <b>1 €</b></span> {moedas([2])}<span>moeda de <b>2 €</b></span></div>
<div class="linha">{moedas([5])}<span>nota de <b>5 €</b></span> {moedas([10])}<span>nota de <b>10 €</b></span></div>
<p>Para somar dinheiro, <b>comece pelo maior</b> e vá juntando o resto.</p>
''')}

{caixa("exemplo", "Exemplo · somar preços", f'''
<p>Na cantina: sandes <b>2 €</b> + sumo <b>1 €</b> + bolo <b>2 €</b>.</p>
<div class="linha">{moedas([2, 1, 2])}</div>
<p>Comece pelo maior: 2… junte o outro 2: <b>4</b>… junte o 1: <b class="v">5 €</b>.</p>
''')}

{caixa("exemplo", "Exemplo · o troco: contar para cima", f'''
<p>A Clara paga com a nota de <b>10 €</b> um caderno de <b>7 €</b>. Quanto recebe de troco?</p>
{reta(0, 12, saltos=[(7, 10, "3")], destaque=(7, 10), larg=700)}
<p>De 7 até 10 são <b>3</b> passos. O troco é <b class="v">3 €</b>. <span class="mini">Confira: 7 + 3 = 10.</span></p>
''')}

{caixa("mao", "Com as mãos · brincar de loja", '''
<p>Coloque 4 produtos com etiqueta de 1 € a 7 €. Uma pessoa é a <b>vendedora</b> e a outra é a <b>cliente</b>. Use moedas de verdade (ou de brinquedo). A cliente paga com uma nota e a vendedora conta o troco <b>moeda por moeda</b>, em voz alta: “7… 8… 9… 10”. Depois troquem de papel.</p>
''')}

</div><div class="pg"><div class="topo" style="margin-bottom:6px"><div class="num" style="background:#ea580c">✎</div><div><h2>Agora você</h2><small>Faça devagar. Pode usar os dedos, as tampinhas e os desenhos.</small></div></div>
<p class="mini">Passo 1 · Some os preços. Comece pelo maior.</p>
{ex(1, L5_soma)}
<p class="mini">Passo 2 · Qual é o troco?</p>
{ex(5, L5_troco)}
{rod(6)}
</div>
"""
pags.append(L5)

# ============================================================ DESAFIO + RESPOSTAS
def li(lst):
    return "<br>".join(lst)

fecho = f"""
<div class="pg">
<h2 style="font-size:24pt">Meu quadro de estrelas</h2>
<p>Pinte uma estrela por lição concluída. Cada lição vale uma estrela, mesmo que tenha errado algumas contas.</p>
<p class="estrelas">★ ★ ★ ★ ★</p>
<table class="k" style="margin-bottom:10px">
<tr><th style="width:55px">Dia</th><th>Lição</th><th style="width:300px">Como foi? (circule)</th></tr>
<tr><td>1</td><td>Casinhas de 5 e 10</td><td>Fácil · Mais ou menos · Difícil</td></tr>
<tr><td>2</td><td>Mais, menos, antes e depois</td><td>Fácil · Mais ou menos · Difícil</td></tr>
<tr><td>3</td><td>Somar</td><td>Fácil · Mais ou menos · Difícil</td></tr>
<tr><td>4</td><td>Tirar</td><td>Fácil · Mais ou menos · Difícil</td></tr>
<tr><td>5</td><td>Dinheiro</td><td>Fácil · Mais ou menos · Difícil</td></tr>
</table>

{caixa("dica", "Desafio de fim de semana", '''
<p><b>Vamos ao supermercado (ou ao folheto de promoções).</b> Escolha 3 produtos baratos. Escreva o preço de cada um (arredonde para euros inteiros), some, e invente um troco para uma nota de 10 €. Mostre à mãe, ao pai ou à irmã como pensou.</p>
''')}

<h2 style="margin-top:14px">Respostas (para os pais)</h2>
<p class="mini">Confira só depois de ela terminar. Quando houver erro, volte ao desenho/objetos da lição em vez de dar a resposta.</p>
<table class="k">
<tr><th style="width:80px">Lição</th><th>Respostas</th></tr>
<tr><td><b>1</b></td><td>Passo 1: {', '.join(resp1['1'])}. Passo 2: desenhar 6, 10 e 14 bolinhas.</td></tr>
<tr><td><b>2</b></td><td>Passo 1: {'; '.join(resp2_comp)}.<br>Passo 2: {'; '.join(resp2_seq)}.</td></tr>
<tr><td><b>3</b></td><td>Passo 1: {', '.join(resp3_reta)}.<br>Passo 2: {'; '.join(resp3_10)}.<br>Passo 3: {', '.join(resp3_hist)}.</td></tr>
<tr><td><b>4</b></td><td>Passo 1: {', '.join(resp4_reta)}.<br>Passo 2: {'; '.join(resp4_dez)}.<br>Passo 3: faltam {', '.join(r.split('=')[1] for r in resp4_falta)} €. Passo 4: {L4_hist[0][1]}.</td></tr>
<tr><td><b>5</b></td><td>Passo 1: {'; '.join(resp5_soma)}.<br>Passo 2: {', '.join(resp5_troco)}.</td></tr>
</table>
{rod(7)}
</div>
"""
pags.append(fecho)

html = f"""<!doctype html><html lang="pt"><head><meta charset="utf-8"><title>Matemática da Clara</title>
<style>{css()}</style></head><body>{''.join(pags)}</body></html>"""
open(sys.argv[1], "w", encoding="utf-8").write(html)
print("ok", len(html))
