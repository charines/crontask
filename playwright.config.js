import { defineConfig } from '@playwright/test';

// Ubuntu 26.04 não é oficialmente suportado pelo Chromium bundled do
// Playwright (falha ao baixar/instalar). Usamos o Google Chrome já
// instalado no sistema via `channel`.
export default defineConfig({
  testDir: './tests',
  use: {
    channel: 'chrome',
  },
});
