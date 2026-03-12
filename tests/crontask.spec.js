import { test, expect } from '@playwright/test';

test.describe('CronTask E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app (assuming it's running on dev server)
    await page.goto('http://localhost:5173/');
  });

  test('should create a sequence and run it', async ({ page }) => {
    // 1. Add first task
    await page.fill('input[placeholder="Ex: Alongamento Matinal"]', 'Atividade 1');
    await page.fill('input[placeholder="5"]', '0.1'); // 6 seconds
    await page.click('button:has-text("Adicionar Etapa")');

    // 2. Add second task
    await page.fill('input[placeholder="Ex: Alongamento Matinal"]', 'Atividade 2');
    await page.fill('input[placeholder="5"]', '0.1'); // 6 seconds
    await page.click('button:has-text("Adicionar Etapa")');

    // Verify tasks added
    await expect(page.locator('text=Atividade 1')).toBeVisible();
    await expect(page.locator('text=Atividade 2')).toBeVisible();
    await expect(page.locator('text=2 Etapas')).toBeVisible();

    // 3. Start sequence
    await page.click('button:has-text("Iniciar Sequência")');

    // 4. Verify 5s countdown
    await expect(page.locator('text=Iniciando em')).toBeVisible();
    // Wait for activity to start (5s prep)
    await page.waitForTimeout(6000);

    // 5. Verify first activity is running
    await expect(page.locator('text=Atividade Atual')).toBeVisible();
    await expect(page.locator('text=Atividade 1')).toBeVisible();
    
    // 6. Check for next activity preview
    await expect(page.locator('text=Próxima Etapa')).toBeVisible();
    await expect(page.locator('text=Atividade 2')).toBeVisible();

    // 7. Wait for first activity to finish (6s) and check for flashing/transition
    // We wait 7s to ensure transition happened
    await page.waitForTimeout(7000);
    
    // 8. Verify second activity is running
    await expect(page.locator('text=Atividade 2')).toBeVisible();

    // 9. Wait for completion
    await page.waitForTimeout(7000);
    await expect(page.locator('text=Pronto!')).toBeVisible();
    await expect(page.locator('text=Você completou toda a sequência')).toBeVisible();

    // 10. Back to start
    await page.click('button:has-text("Voltar ao Início")');
    await expect(page.locator('text=Configurar Sequência')).toBeVisible();
  });

  test('should persist data in localStorage', async ({ page }) => {
    await page.fill('input[placeholder="Ex: Alongamento Matinal"]', 'Tarefa Persistente');
    await page.fill('input[placeholder="5"]', '10');
    await page.click('button:has-text("Adicionar Etapa")');

    // Reload page
    await page.reload();

    // Verify it's still there
    await expect(page.locator('text=Tarefa Persistente')).toBeVisible();
    await expect(page.locator('text=10 minutos')).toBeVisible();
  });

  test('should clear all activities', async ({ page }) => {
    await page.fill('input[placeholder="Ex: Alongamento Matinal"]', 'Tarefa a Limpar');
    await page.fill('input[placeholder="5"]', '5');
    await page.click('button:has-text("Adicionar Etapa")');

    // Mock confirm dialog
    page.on('dialog', dialog => dialog.accept());
    
    await page.click('button:has-text("Limpar")');

    await expect(page.locator('text=Nenhuma atividade adicionada ainda')).toBeVisible();
  });
});
