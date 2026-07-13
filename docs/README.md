# CronTask — Documentação

## Visão geral

CronTask é um cronômetro de sequência de atividades (React 19 + Vite),
com estética glassmorphism dark. O fluxo principal:

1. **LandingPage** — apresentação inicial.
2. **ConfigPage** — montagem da lista de atividades (nome, duração,
   intervalo entre etapas, opção "ambos os lados" para gerar duas
   atividades espelhadas), com import/export da lista em JSON.
3. **TimerPage** — execução da sequência: countdown de preparação,
   transição automática entre atividades, alerta visual nos últimos
   segundos, preview da próxima etapa, tela de conclusão.

A configuração é persistida em `localStorage`, funcionando offline
após o primeiro carregamento.

## Arquitetura

- `src/App.jsx` — estado central e orquestração entre as views.
- `src/pages/LandingPage.jsx`, `ConfigPage.jsx`, `TimerPage.jsx` —
  views extraídas do `App.jsx` (ver commit `0564bc6`).
- `src/index.css` — sistema de design (variáveis CSS, animações,
  glassmorphism).
- `public/treino_alongamento.json` — rotina de alongamento padrão,
  usada como exemplo/import inicial.
- `tests/crontask.spec.js` — teste E2E Playwright do fluxo completo
  (criar sequência → rodar → validar countdown e transições).

## Testes

Os testes Playwright **não têm `playwright.config.js` com
`webServer`** — eles assumem `http://localhost:5173` já respondendo.
`scripts/preflight.sh` cuida de subir e derrubar o dev server em volta
da execução dos testes; para rodar manualmente:

```bash
npm run dev            # terminal 1
npx playwright test    # terminal 2
```

## Scripts (`scripts/`)

- `preflight.sh` — testes → lint → build → mirror. Qualquer falha
  interrompe com exit code != 0.
- `mirror.sh` — sincroniza esta pasta (`docs/`) para
  `~/Obsidian/Memorias/crontask/`.
- `snapshot.sh` — gera snapshot do código em `/tmp/` para análise
  externa.
