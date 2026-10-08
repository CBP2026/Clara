# Clara

App web para celular. Missões de 5 passos: números concretos, tempo, inglês e situações sociais.

## O que é guardado

- **No celular:** estrelas, dias de uso, preferência de som e um ID anônimo do aparelho (`localStorage`).
- **No servidor:** um registro mínimo de uso: ID anônimo, hora, tema, se acertou de primeira e o texto da pergunta. Cada erro também guarda o enunciado, o que ela respondeu, a resposta certa e a explicação. Nenhum nome ou dado pessoal. Fica em `log.jsonl` na pasta de dados.

## Painel dos pais

`/pais` mostra último uso, calendário dos últimos 28 dias, acerto por tema e a lista de **tudo que ela errou** (com o que respondeu, a resposta certa e se já acertou depois). `/pais/log.csv` baixa o histórico completo; `/pais/conversas.csv` baixa as conversas com a Lua (incluindo as bloqueadas e o motivo, e as de modo teste marcadas); `/pais/perfis.csv` baixa os perfis. O acesso é por senha (qualquer usuário, senha = `PAIS_SENHA`). Sem `PAIS_SENHA` definida, o painel fica desligado.

### Modo teste e limpeza

- **Modo teste:** na home, “🧪 Modo teste (pais)” pede a senha do painel. Enquanto ligado, estrelas, níveis e erros ficam em chaves `mt-` do aparelho e tudo o que é enviado vai marcado como `teste`: o painel, os alertas e o humor da Lua ignoram esses registros (o CSV os mostra, coluna `teste`).
- **Limpar registros:** no painel, “Limpar registros de teste” recebe um intervalo “De/Até” (hora de `PAIS_TZ`, com horário de verão), mostra quantas linhas serão apagadas (por tipo e por aparelho) e só apaga depois de confirmar. Pode apagar também tudo o que está marcado como teste, fora do intervalo. Antes de apagar cria `log.jsonl.bak-<data>` e/ou `conversas.jsonl.bak-<data>` na pasta de dados; as cópias não são apagadas sozinhas. Linhas quebradas são mantidas. Evite limpar enquanto ela usa a app: uma gravação no mesmo instante da limpeza pode perder-se.
- Testes automáticos: `npm test`.

### Conversa com a Lua

- Pedidos sobre a app (mudar novela, tirar missão, suporte, e-mail) têm **resposta fixa**, sem modelo, e aparecem no painel em “Pedidos dela sobre a app”. Para mudar gostos, a resposta traz um botão que abre o ⚙️.
- Se o filtro de palavras ou o moderador bloquear uma resposta, a Lua tenta **mais uma vez** com instrução mais rígida antes de usar a frase genérica. O painel e o CSV de conversas guardam o motivo exato, o que o moderador respondeu e as tentativas anteriores.
- **Modelo por papel:** `LUA_MODELO` (conversa) e `LUA_MODERADOR` (segurança). Se o nome começar por `claude-` usa a API da Anthropic (precisa de `ANTHROPIC_API_KEY`); caso contrário, Venice. Se a chamada falhar, cai nos modelos Venice (`VENICE_MODELO`, `VENICE_MODERADOR`).
- **Avaliar modelos:** `node scripts/avalia-modelos.js venice:venice-uncensored-1-2 claude-haiku-5-5 claude-sonnet-5-5` corre os 30 casos de `test/casos-lua.json` e imprime um relatório para leitura humana. Só depois de ler o relatório vale trocar `LUA_MODELO`.

### Tutor (Números, Tempo, English, Amigos)

- Um toque fecha a pergunta: já não dá para acertar por eliminação. **“Não sei”** está sempre disponível e não penaliza.
- **Toque muito rápido e errado** (menos de 2 s) não conta como erro: a Lua pede para ler com calma e as opções voltam. Se a maioria dos toques de uma missão for rápida, o nível não sobe nem desce.
- **Errou ou “Não sei”:** mini-aula em 3 passos (o que escolheu e porquê, apoio visual — tocar para contar objetos ou pedaços de 5 minutos, relógio —, resposta resolvida) e depois **uma pergunta parecida do mesmo conceito**.
- **Conceitos:** cada pergunta tem um conceito (`tempo.diferenca_minutos`, `num.contar`, `social.sinais_corpo`…). Dominado = acertou de primeira em 2 dias diferentes depois do último erro. Conceito errado volta para revisão no dia seguinte e 3 dias depois (guardado no aparelho em `mc-conceitos`).
- **Estrelas por esforço:** 1 por acerto de primeira lido com calma, 1 por acertar a variante depois da aula, 2 por dominar um conceito. Acerto em menos de 2 s não dá estrela.
- O log guarda `ms_ate_toque`, `posicao` da opção, `conceito` e `extra` (variante); eventos `rapido` e `naosei` não entram nas estatísticas nem nos erros do painel.

### Novelas

- **Turma do Girassol:** 7 capítulos (novos: “Ninguém me chamou”, “Outras amigas”, “O grupo”), liberados por estrelas (0/10/25/45/70/100/130). Cada pergunta tem um conceito e entra na revisão do tutor; as opções erradas são reações reais (ficar calada, mensagens com raiva), nem sempre a certa é a mais “educada” (por exemplo contar a um adulto). A cena da mochila saiu para não repetir a de Amigos.
- **Minha novela:** a estrela do capítulo só vale com pelo menos 12 palavras escritas. Depois do capítulo, a Lua faz **um comentário específico e uma pergunta** sobre o que ela escreveu (modo `novela` da conversa, com os mesmos filtros; frases de risco geram alerta no painel).

### Resumo da semana e proatividade

- **Painel:** o topo tem “Resumo da semana” (tudo calculado em código a partir do log, sem modelo): tempo até tocar e % de respostas muito rápidas, assuntos que dominou (2 dias de acerto de primeira depois do último erro) e assuntos em dificuldade, sinais (mensagens de risco nas últimas 48 h, humor difícil, pedidos sobre a app, registros de teste ignorados) e uma atividade de 3 minutos para fazer em casa (`C.conceitos[...].casa` em `conteudo.js`).
- **Lembrete por pendência:** no máximo 1 por dia, entre 8h e 20h (`CLARA_TZ`), na hora em que ela mais usa a app (últimos 14 dias), a pelo menos 1 h de qualquer mensagem fixa, só se ainda não usou hoje e há um assunto errado há mais de 20 h por rever. Os pais ligam ou desligam isto, e a mensagem de boa noite das 21:00, na secção “Lembretes” do painel.
- **Na app:** a home mostra “Hoje: 🔁 rever … · ✨ missão … · 🎵 quiz”; se ontem ela disse que foi um dia difícil, a Lua pergunta como está hoje; depois de 3 toques rápidos seguidos, a Lua sugere ir mais devagar ou tocar em “Não sei”.
- Alertas aos pais: ficam no painel (“Atenção” e a faixa vermelha do resumo); não há push para os pais, porque o push da app está ligado ao aparelho da Clara.

## Perguntas

Tempo e Amigos têm 23 perguntas cada; English tem 30 palavras em 2 formatos; Números gera combinações. Cada missão tem 5 perguntas **sem repetição**, e até 2 delas são perguntas que ela errou antes e ainda não acertou de primeira (guardado no próprio aparelho).

## Companheira, níveis e Novelinha

- Perfil e onboarding (⚙️), níveis adaptativos com teste de colocação, missão do dia, Novelinha (capítulos liberados por estrelas), álbum de figurinhas e humor do dia.
- Conteúdo em `conteudo.js` (carregado pelo navegador e pelo servidor).
- Conversa: `/api/conversa` usa a Venice com filtro de entrada, filtro de saída e moderador. Os pais ligam/desligam no painel.
- Notificações push (`web-push`): lembretes às 07h, 19h e 21h (`CLARA_TZ`). No iPhone, só funcionam com a app na tela inicial. O painel tem botão de teste.
- Painel dos pais também mostra alertas, humor, evolução e conversas.

## Rodar local

```bash
PAIS_SENHA=minhasenha node server.js
```

Abre `http://localhost:8080`. Sem volume em `/data`, o histórico vai para `./data` (ignorado pelo git).

## Railway

O serviço lê `railway.toml` e roda `node server.js`. A variável `PORT` é injetada pelo Railway. Para ter painel e histórico:

1. Crie um **Volume** no serviço, com ponto de montagem `/data`. Sem ele, o histórico some a cada deploy.
2. Defina a variável de ambiente `PAIS_SENHA` com uma senha longa.
3. `VENICE_API_KEY`: chave da Venice. Sem ela a conversa com a companheira fica desligada (o resto funciona).
4. Opcionais:
   - `PAIS_TZ` (padrão `Europe/Lisbon`): fuso do painel dos pais.
   - `CLARA_TZ` (padrão `Europe/Lisbon`): fuso dos lembretes (07h, 19h, 21h).
   - `DATA_DIR` (padrão `/data`).
   - `VENICE_MODELO` (padrão `venice-uncensored-1-2`) e `VENICE_MODERADOR` (padrão `qwen3-5-9b`).
   - `VAPID_PUBLIC`, `VAPID_PRIVATE`, `VAPID_CONTATO`: chaves das notificações push. Se ausentes, são geradas e guardadas em `/data` (precisa de Volume para não mudarem a cada deploy).
5. Abra `https://SEU-APP.up.railway.app/pais`.

Se o celular estiver sem internet, os registros ficam numa fila no aparelho e são enviados na próxima abertura (a hora do aparelho também é gravada).
