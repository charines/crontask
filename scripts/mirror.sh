#!/usr/bin/env bash
# scripts/mirror.sh — sincroniza a documentação do projeto para o
# espelho local no Obsidian. O espelho nunca vai para o git.
set -euo pipefail

PROJETO="$(basename "$(pwd)")"

DOCS_DIR="docs/"

DESTINO="${HOME}/Obsidian/Memorias/${PROJETO}/"

mkdir -p "$DESTINO"

rsync -av --delete "$DOCS_DIR" "$DESTINO"

echo
echo "Espelho sincronizado: ${DOCS_DIR} -> ${DESTINO}"
