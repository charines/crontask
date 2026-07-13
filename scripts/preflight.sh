#!/usr/bin/env bash
# scripts/preflight.sh — roda testes, lint e build antes de qualquer
# entrega. Qualquer falha interrompe com exit code != 0.
set -euo pipefail

PROJETO="$(basename "$(pwd)")"

echo "=== Preflight: ${PROJETO} ==="

# ─── TESTES (Playwright E2E) ────────────────────────────────────────────
# Não há playwright.config.js com webServer configurado — os specs
# assumem http://localhost:5173 já rodando. Por isso o preflight sobe o
# dev server, aguarda responder e sempre o derruba ao final (trap).
echo
echo "--- Testes ---"

DEV_PID=""
cleanup() {
  if [ -n "$DEV_PID" ] && kill -0 "$DEV_PID" 2>/dev/null; then
    kill "$DEV_PID" 2>/dev/null || true
    wait "$DEV_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT

npm run dev -- --port 5173 --strictPort > /tmp/crontask-dev-server.log 2>&1 &
DEV_PID=$!

echo "Aguardando dev server em http://localhost:5173 ..."
for i in $(seq 1 30); do
  if curl -s -o /dev/null "http://localhost:5173"; then
    break
  fi
  if [ "$i" -eq 30 ]; then
    echo "ERRO: dev server não respondeu a tempo. Log:" >&2
    cat /tmp/crontask-dev-server.log >&2
    exit 1
  fi
  sleep 1
done

if ! npx playwright test; then
  echo "ERRO: testes falharam." >&2
  exit 1
fi
echo "Testes OK."

# ─── LINT ────────────────────────────────────────────────────────────────
echo
echo "--- Lint ---"
if ! npm run lint; then
  echo "ERRO: lint falhou." >&2
  exit 1
fi
echo "Lint OK."

# ─── BUILD ───────────────────────────────────────────────────────────────
echo
echo "--- Build ---"
if ! npm run build; then
  echo "ERRO: build falhou." >&2
  exit 1
fi
echo "Build OK."

# ─── Espelhamento ────────────────────────────────────────────────────────
echo
echo "--- Sincronizando espelho ---"
./scripts/mirror.sh

echo
echo "=== Preflight concluído com sucesso: ${PROJETO} ==="
