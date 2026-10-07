# Plano Clara: avaliação e execução

Documento único com tudo o que foi discutido. Nenhum código foi alterado. Cada fase pode ir num branch e PR próprios.

## 0. Contexto e avaliação

**Quem é a Clara:** 15 anos, mudou de escola em Portugal, dificuldade de fazer amigas. Alteração genética, déficit intelectual e **discalculia grave** (sem diagnóstico formal além disso).

**Dados disponíveis:** log de 07/10 (`clara-log.csv`), ID da Clara `98dfca50…` (584 de 598 linhas). Os outros IDs são testes (Maria). Além disso, a manhã (cerca de 11:00–11:55 UTC) e as 20:13–20:18 foram **testes dos pais**, e o capítulo "Ela morre / Dor de barriga / Coco" foi teste. Os sinais de humor "Triste · Fiquei sozinha" (11:24) e "Alguém foi legal comigo" (17:36) devem ser tratados como possivelmente de teste até confirmar.

**Pendente (pais):** confirmar as horas dos testes (para a limpeza), escolher PIN próprio ou senha do painel para o modo teste, e escolher chaves separadas ou cópia e restauro para o estado de teste.

### O que o log mostra (leitura provisória, sessões de 16h e 20h)
- **Tocar sem ler:** 25 de 25 retentativas em menos de 2s às 16h e 10 de 11 às 20h; 2,4s a 3,5s por pergunta. Escolhas absurdas na 1ª tentativa ("I'm a cat", "Good morning, dog"). Com discalculia e déficit, isso pode ser **fuga de uma tarefa impossível**, não preguiça.
- **Tempo é o ponto mais fraco** (50% de acerto de primeira no total): "quanto falta" falha sempre; "60 minutos" aparece como erro em várias perguntas diferentes.
- **Amigos (16h):** escolhe reações impulsivas ("mando 30 mensagens com raiva", "choro e não conto a ninguém") e lê mal sinais do outro (braços cruzados = "muito feliz").
- **Música** é onde ela mais acerta (87%): gancho de motivação.
- O desenho atual **não ensina**: com 3 opções, errar duas vezes deixa a certa (eliminação, 39 de 107 episódios de erro); a pergunta errada volta idêntica (decora-se); depois do 2º erro só aparece a frase da resposta; as estrelas premiam correr.
- O nível oscila (English 0→4→3→2→1→2 em 80s) e desce sem avisar com ≤2 acertos: o gráfico de evolução hoje é ruído.
- O log não distingue "não sabe" de "não leu": faltam tempo até o toque, posição das opções e conceito.

### Conversa com a Lua (Venice)
- Promete o que não pode fazer ("vou fazer as alterações", "equipe de suporte") e inventa fatos/contactos (e-mail inventado, "romance clássico" para uma novela infantil, "eu amo").
- O modo treino é usado para pedidos da app; o 💡 sai em terceira pessoa.
- Bloqueios viram fallbacks incoerentes; um deles bloqueou "Oi! Como você está?" sem motivo visível.
- **Veredito:** o `venice-uncensored-1-2` não serve para este uso. Causa mista: arquitetura (a Lua não sabe o que a app faz) e modelo.

### As duas "novelas"
- **Turma do Girassol** (`nov`, "Novelinha"): 4 capítulos fixos de situações sociais (Bia), com 3 opções por cena, liberados por estrelas (0/10/25/45). Relevância alta, mas curta, previsível (a certa é sempre a mais educada), duplica cenas do mundo Amigos e não ensina quando erra.
- **Minha novela:** ela cria título, personagens e capítulos (6 perguntas fixas, texto livre). Valor maior para os pais (janela emocional) do que para aprender. Falhas: elogio aleatório que não depende do texto; 1 estrela por capítulo mesmo com respostas de segundos (atalho para liberar o Girassol); folha em branco exigente.
- **Trivia das novelas favoritas:** não existe (a trivia é a de Música).

---

## Princípio de desenho (vale para todas as fases)

Com discalculia grave e déficit intelectual: **reduzir carga cognitiva, nunca cobrar atenção**.
- Apoio concreto (relógio animado, tocar para contar), passos muito pequenos, uma ideia por vez.
- "Não sei" sempre disponível e **sem penalidade**.
- Poucos conceitos por vez, repetidos com variantes.
- Sem cronômetro, sem ranking, sem punir o chute: tratá-lo como sinal de que a tarefa está difícil.
- Contas de Números e Tempo geradas por código, nunca pelo modelo.

---

## Fase A: limpar o painel e modo teste (prioridade 1)

### A1. Modo teste (fazer primeiro)
Objetivo: o que for feito num aparelho de teste não entra nas estatísticas, nas estrelas nem no painel.
1. Interruptor no ⚙️, protegido por PIN dos pais (ou pela senha do painel). Ligado grava `mc-teste=1` e mostra a faixa "🧪 Modo teste".
2. Cliente (`index.html`): `track()` acrescenta `teste: true`. Estrelas, níveis e erros do aparelho ficam isolados: chaves separadas (prefixo `mt-`, recomendado) ou cópia do estado real restaurada ao desligar.
3. Servidor (`limpaEvento`): aceitar e guardar `teste`. `painel()`, o CSV e `ultimoHumor()` ignoram eventos de teste (coluna "teste" no CSV para auditoria).
4. `/api/conversa`: aceitar `teste`, gravar a conversa marcada e **não** contar mensagens de teste em `LIMITE_DIA`.
5. Painel: linha "Último teste: <hora> (N eventos, ignorados)".
6. Testes manuais: ligar, fazer missão e novela, confirmar que nada aparece em estatísticas, calendário e erros; desligar e confirmar que estrelas e níveis reais voltam; push de teste continua a funcionar.

### A2. Apagar por intervalo de hora (`server.js`)
1. Formulário "Limpar registros de teste": campos "De" e "Até" (`datetime-local`, fuso `PAIS_TZ`) e caixas (registros de uso, conversas, e também eventos marcados como teste).
2. `msDeLocal("AAAA-MM-DDTHH:MM")` converte a hora local em UTC com `Intl` (respeitando horário de verão).
3. `POST /pais/limpar` sem `confirmar`: valida o intervalo `[de, até)`, conta o que seria apagado (por tipo e por ID) e pede confirmação.
4. Com `confirmar=1`: backup (`log.jsonl.bak-<timestamp>`, `conversas.jsonl.bak-<timestamp>`), reescrita sem as linhas do intervalo (arquivo temporário + `rename`), resultado com contagem.
5. Mesmos controles de senha e `Origin` do `acaoPais`; rota entra na lista permitida de `areaPais`. Critério de hora igual ao do painel (hora do aparelho quando existe); linhas quebradas são mantidas.
6. Testes: cancelar, confirmar, intervalo vazio, datas invertidas, CSV depois da limpeza.
7. README: documentar a seção e os backups.

### A3. Exportação
Exportar também as conversas (`/pais/conversas.csv`) e os perfis, para poder avaliar modelos e dar contexto aos pais.

---

## Fase B: conversa com a Lua

1. **Ajuda da app sem modelo:** pedidos como mudar novela, tirar uma missão ou "não entendi" recebem resposta fixa, com botão que abre o ⚙️ Perfil.
2. **"Pedidos dela" no painel:** o que a app não faz fica registrado para os pais.
3. **Prompt:** dizer o que a Lua não pode fazer (alterar a app, contactar suporte, citar e-mails, dizer que sente algo); "A Infância de Romeu e Julieta" é uma novela infantil.
4. **Modo treino:** o 💡 passa a ser dirigido à Clara, em 2ª pessoa e em 1 frase.
5. **Bloqueios:** registrar o motivo exato no painel; tentar uma segunda vez com instrução mais rígida antes do fallback genérico; rever falsos positivos.
6. **Camada `chamaLLM(papel)`** com modelo por variável de ambiente e fallback.
7. **Escolha do modelo (subir de prioridade, não deixar para o fim):**
   - Tutoria, explicações e diagnóstico (JSON, português do Brasil): Claude Haiku 5.5 (`claude-haiku-5-5`) como padrão.
   - Conversa emocional e resumo para os pais: Claude Sonnet 5.5 (`claude-sonnet-5-5`).
   - Alternativas: modelos "flash"/"mini" da Google e da OpenAI, ou modelos abertos via Groq/Together; exigem teste de português e de segurança. Preços e IDs a confirmar antes.
   - Decidir com dados: montar ~30 casos reais (as conversas desta sessão e os erros do log); cada candidato, Venice incluída, tem de dar respostas corretas, simples e seguras. Só então trocar.

---

## Fase C: tutor (ajustado à discalculia)

1. **Log:** tempo até cada toque, posição das opções e conceito de cada pergunta.
2. **Parar a eliminação:** depois do 1º erro, as outras opções deixam de ser tocáveis e entra o modo de ajuda. "Não sei" sempre disponível, sem penalidade. Toques muito rápidos não contam como erro: a Lua convida a ler com calma.
3. **Conceitos:** marcar cada pergunta (`tempo.diferenca_minutos`, `contar_ate_20`, `social.sinais_corpo`, `en.ouvir_frase`…). O estado de aprendizagem passa a ser por conceito.
4. **Mini-aula ao errar**, em 3 passos com apoio visual:
   - A Lua diz por que a opção escolhida tenta (ex.: "60 é uma hora inteira; aqui passaram só 30 min").
   - Relógio ou linha do tempo; tocar em cada objeto para contar.
   - Exemplo resolvido.
5. **Variante nova do mesmo conceito**, com ajuda por etapas (nunca o mesmo item).
6. **Revisão espaçada** por conceito: na sessão, no dia seguinte e 3 dias depois. "Dominado" = 2 acertos em dias diferentes.
7. **Níveis:** rever a regra de subir/descer (hoje 2 missões com 4+ sobem; ≤2 desce sem avisar). Basear em conceitos dominados e esforço, não em "acertou de primeira"; não deixar o chute rebaixar o nível.
8. **Estrelas** por esforço e conceito aprendido, não só por acertar de primeira.
9. **Números e Tempo** gerados por código (já existem `timeGen`/`mathItem`), com apoio visual.

### Novelas
- **Girassol:** ligar cada cena a um conceito e ao tutor; reescrever opções para a certa não ser sempre a mais educada; capítulos novos com as situações que ela erra (ninguém a chamou, amiga com outras meninas, grupo do WhatsApp); **deduplicar** com o mundo Amigos (cena da mochila); contas da história vindas do gerador.
- **Minha novela:** estrela só com esforço mínimo (ex.: 3 passos com algumas palavras) ou separada das estrelas que liberam capítulos; a Lua responde com algo específico do texto (1 pergunta por capítulo, com filtro de segurança) em vez de elogio aleatório; ajuda para escrever (opções de sentimento, emojis, ditado de voz).
- **Trivia das novelas favoritas (opcional, baixa prioridade):** conteúdo conferido à mão, como em Música.

---

## Fase D: painel e proatividade

### D1. Resumo da semana (topo do painel)
1. Qualidade do uso: tempo por pergunta, % de respostas muito rápidas.
2. O que aprendeu de verdade: conceitos dominados e em dificuldade (ex.: "diferença entre horas").
3. Sinais de atenção: humor triste repetido, temas de exclusão e bullying, "Pedidos dela", palavras de risco; sinalizar temas sensíveis na novela, **com data/sessão e se foi modo teste**.
4. Uma atividade para fazer em casa (ex.: 3 minutos com o relógio na mesa).
As contas são feitas em código; o texto do resumo pode vir do modelo.

### D2. Proatividade
1. Lembretes por pendência ("3 minutos para revisar o relógio?"), no horário em que ela realmente usa a app (hoje fixos às 07h, 19h e 21h).
2. Plano do dia ao abrir a app (1 revisão, 1 novo, 1 de música).
3. Seguimento de humor (ex.: depois de "Fiquei sozinha", perguntar como foi no dia seguinte).
4. A Lua interrompe quando detecta toques em sequência rápida.
5. Alerta aos pais só para sinais fortes, mais o resumo semanal.
6. Limites: no máximo 1 mensagem por faixa horária, sem mensagens à noite, os pais controlam. No iPhone o push só funciona com a app na tela inicial.

---

## Ordem de execução

1. **A1** (modo teste) → **A2** (limpeza por intervalo) → **A3** (exportação).
2. **B1 a B5**, e em paralelo **B7** (escolha do modelo com casos reais); depois **B6**.
3. **C1 a C3** (log, parar a eliminação, conceitos), depois **C4 a C9** (tutor) e o desacoplamento da estrela da Minha novela.
4. **D1**, depois **D2**.
5. Novelas (Girassol/Minha novela) e trivia opcional.

## Decisões pendentes
- Horas exatas dos testes dos pais (para fechar o intervalo de limpeza).
- PIN próprio ou senha do painel para o modo teste.
- Estado de teste: chaves separadas (recomendado) ou cópia e restauro.
- Orçamento para o modelo da tutoria/conversa.
