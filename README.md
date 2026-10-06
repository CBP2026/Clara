# Clara

App web para celular. Missões de 5 passos: números concretos, tempo, inglês e situações sociais.

## O que é guardado

- **No celular:** estrelas, dias de uso, preferência de som e um ID anônimo do aparelho (`localStorage`).
- **No servidor:** um registro mínimo de uso: ID anônimo, hora, tema, se acertou de primeira e o texto da pergunta. Nenhum nome ou dado pessoal. Fica em `log.jsonl` na pasta de dados.

## Painel dos pais

`/pais` mostra último uso, calendário dos últimos 28 dias, acerto por tema e onde mais erra. `/pais/log.csv` baixa o histórico completo. O acesso é por senha (qualquer usuário, senha = `PAIS_SENHA`). Sem `PAIS_SENHA` definida, o painel fica desligado.

## Rodar local

```bash
PAIS_SENHA=minhasenha node server.js
```

Abre `http://localhost:8080`. Sem volume em `/data`, o histórico vai para `./data` (ignorado pelo git).

## Railway

O serviço lê `railway.toml` e roda `node server.js`. A variável `PORT` é injetada pelo Railway. Para ter painel e histórico:

1. Crie um **Volume** no serviço, com ponto de montagem `/data`. Sem ele, o histórico some a cada deploy.
2. Defina a variável de ambiente `PAIS_SENHA` com uma senha longa.
3. Opcional: `PAIS_TZ` (padrão `America/Sao_Paulo`) e `DATA_DIR` (padrão `/data`).
4. Abra `https://SEU-APP.up.railway.app/pais`.

Se o celular estiver sem internet, os registros ficam numa fila no aparelho e são enviados na próxima abertura (a hora do aparelho também é gravada).
