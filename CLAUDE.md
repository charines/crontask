# CronTask

## Stack

- React 19 + Vite 7, JavaScript puro (sem TypeScript).
- Tailwind CSS 4 via `@tailwindcss/vite`, combinado com CSS vanilla em
  `src/index.css` (variáveis, animações, glassmorphism).
- Framer Motion para animações, Lucide React para ícones.
- ESLint 9 (flat config, `eslint.config.js`): `no-unused-vars` ignora
  identificadores em `PascalCase` (ex.: componentes importados e não
  usados diretamente no JSX via spread).
- Testes E2E com Playwright (`tests/crontask.spec.js`) — **sem
  `playwright.config.js`**; os specs assumem `http://localhost:5173`
  já rodando. Ver [[docs/README.md]] e `scripts/preflight.sh` para como
  isso é tratado.

## Arquitetura

- `src/App.jsx` — motor central: estado da aplicação e alternância
  entre as três views.
- `src/pages/LandingPage.jsx`, `ConfigPage.jsx`, `TimerPage.jsx` —
  views extraídas do `App.jsx` (refactor em `0564bc6`).
- `public/treino_alongamento.json` — rotina padrão de alongamento,
  usada como import/export de exemplo.
- `design_backup/` — propostas visuais originais (HTML/PNG), não faz
  parte do app rodando.

## Convenções

- Import/export de listas de atividades é feito em JSON — manter
  compatibilidade com o formato de `public/treino_alongamento.json` ao
  alterar a estrutura de dados de uma atividade.
- Persistência é só `localStorage` — não há backend.
