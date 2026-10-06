# Missões Curtas

App web para telemóvel. Missões de 5 passos: números concretos, tempo, inglês e situações sociais.

Não guarda dados num servidor. As estrelas ficam no browser do telemóvel (`localStorage`).

## Correr em local

```bash
node server.js
```

Abre `http://localhost:8080`.

## Railway

1. Novo projeto → Deploy from GitHub repo.
2. Escolhe este repositório. O Railway lê `railway.toml` e corre `node server.js`.
3. Em Settings → Networking → Generate Domain.
4. Abre o link no telemóvel e usa “Adicionar ao ecrã inicial”.

A variável `PORT` é injectada pelo Railway. Não é preciso configurar.

## GitHub Pages

Também funciona como site estático: publica a pasta e abre `index.html`. No Railway o `server.js` só existe para o serviço ter um processo sempre ligado.
