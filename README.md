# Clara

App web para celular. Missões de 5 passos: números concretos, tempo, inglês e situações sociais.

## O que é guardado

- **No celular:** estrelas, dias de uso, preferência de som e um ID anônimo do aparelho (`localStorage`).
- **No servidor:** um registro mínimo de uso: ID anônimo, hora, tema, se acertou de primeira e o texto da pergunta. Cada erro também guarda o enunciado, o que ela respondeu, a resposta certa e a explicação. Nenhum nome ou dado pessoal. Fica em `log.jsonl` na pasta de dados.

## Painel dos pais

`/pais` mostra último uso, calendário dos últimos 28 dias, acerto por tema e a lista de **tudo que ela errou** (com o que respondeu, a resposta certa e se já acertou depois). `/pais/log.csv` baixa o histórico completo. O acesso é por senha (qualquer usuário, senha = `PAIS_SENHA`). Sem `PAIS_SENHA` definida, o painel fica desligado.

### Modo teste e limpeza

- **Modo teste:** na home, “🧪 Modo teste (pais)” pede a senha do painel. Enquanto ligado, estrelas, níveis e erros ficam em chaves `mt-` do aparelho e tudo o que é enviado vai marcado como `teste`: o painel, os alertas e o humor da Lua ignoram esses registros (o CSV os mostra, coluna `teste`).
- **Limpar registros:** no painel, “Limpar registros de teste” recebe um intervalo “De/Até” (hora de `PAIS_TZ`, com horário de verão), mostra quantas linhas serão apagadas (por tipo e por aparelho) e só apaga depois de confirmar. Pode apagar também tudo o que está marcado como teste, fora do intervalo. Antes de apagar cria `log.jsonl.bak-<data>` e/ou `conversas.jsonl.bak-<data>` na pasta de dados; as cópias não são apagadas sozinhas. Linhas quebradas são mantidas. Evite limpar enquanto ela usa a app: uma gravação no mesmo instante da limpeza pode perder-se.
- Testes automáticos: `npm test`.

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
