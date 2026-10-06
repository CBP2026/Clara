# Clara

App web para celular. Missões de 5 passos: números concretos, tempo, inglês e situações sociais.

Não guarda dados no servidor. As estrelas ficam no navegador do celular (`localStorage`).

## Rodar local

```bash
node server.js
```

Abre `http://localhost:8080`.

## Railway

O serviço lê `railway.toml` e roda `node server.js`. A variável `PORT` é injetada pelo Railway.
