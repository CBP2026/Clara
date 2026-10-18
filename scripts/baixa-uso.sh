#!/bin/sh
# Baixa log, conversas e perfis do painel dos pais para uso/ (ignorado pelo git).
# Senha: variavel PAIS_SENHA ou ficheiro ~/.clara_pais (uma linha, chmod 600).
set -e
URL="${CLARA_URL:-https://clarap.up.railway.app}"
SENHA="${PAIS_SENHA:-$(cat "$HOME/.clara_pais" 2>/dev/null || true)}"
[ -n "$SENHA" ] || { echo "Falta a senha: crie ~/.clara_pais com a PAIS_SENHA" >&2; exit 1; }
DIR="$(dirname "$0")/../uso"
mkdir -p "$DIR"
for f in log conversas perfis; do
  curl -fsS -u "pais:$SENHA" "$URL/pais/$f.csv" -o "$DIR/$f.csv"
  echo "$f.csv: $(wc -l < "$DIR/$f.csv") linhas"
done
