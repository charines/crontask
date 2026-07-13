import { test, expect } from '@playwright/test';

test.describe('CronTask E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app (assuming it's running on dev server)
    await page.goto('http://localhost:5173/');
    // App now opens on LandingPage; navigate to ConfigPage first.
    await page.click('button:has-text("Começar Agora")');
    // Disable the automatic rest-interval feature so activity counts
    // in this suite match one activity added = one entry in the list.
    await page.click('text=Adicionar intervalo');
  });

  test('should create a sequence and run it', async ({ page }) => {
    // 1. Add first task
    await page.fill('input[placeholder="Ex: Alongamento Matinal"]', 'Atividade 1');
    await page.fill('input[placeholder="30"]', '6'); // 6 seconds
    await page.click('button:has-text("Adicionar Etapa")');

    // 2. Add second task
    await page.fill('input[placeholder="Ex: Alongamento Matinal"]', 'Atividade 2');
    await page.fill('input[placeholder="30"]', '6'); // 6 seconds
    await page.click('button:has-text("Adicionar Etapa")');

    // Verify tasks added
    await expect(page.locator('text=Atividade 1')).toBeVisible();
    await expect(page.locator('text=Atividade 2')).toBeVisible();
    await expect(page.locator('text=2 Etapas')).toBeVisible();

    // 3. Start sequence
    await page.click('button:has-text("Iniciar Sequência")');

    // 4. Verify 5s countdown
    await expect(page.locator('text=Sessão Iniciando')).toBeVisible();
    // Wait for activity to start (5s prep)
    await page.waitForTimeout(6000);

    // 5. Verify first activity is running
    await expect(page.locator('text=PROCESSO ATUAL')).toBeVisible();
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
    // The sequence completion shows an alert in current implementation
    // Adding listener before skip/timeout
    page.on('dialog', dialog => dialog.accept());
    await page.waitForTimeout(7000);
    
    // 10. Verify back to config screen
    await expect(page.locator('text=Configurar Sequência')).toBeVisible();
  });

  test('should persist data in localStorage', async ({ page }) => {
    await page.fill('input[placeholder="Ex: Alongamento Matinal"]', 'Tarefa Persistente');
    await page.fill('input[placeholder="30"]', '10');
    await page.click('button:has-text("Adicionar Etapa")');

    // Reload page
    await page.reload();
    // Reload resets the view state to LandingPage; navigate back to
    // ConfigPage (activities persisted, so the button reads "Configurar Nova").
    await page.click('button:has-text("Configurar Nova")');

    // Verify it's still there
    await expect(page.locator('text=Tarefa Persistente')).toBeVisible();
    // "10 segundos" also appears in the footer's total-duration summary,
    // so scope the check to the activity row specifically.
    await expect(page.locator('text=Tarefa Persistente').locator('..').locator('text=10 segundos')).toBeVisible();
  });

  test('should clear all activities', async ({ page }) => {
    await page.fill('input[placeholder="Ex: Alongamento Matinal"]', 'Tarefa a Limpar');
    await page.fill('input[placeholder="30"]', '5');
    await page.click('button:has-text("Adicionar Etapa")');

    // Mock confirm dialog
    page.on('dialog', dialog => dialog.accept());
    
    // The clear-all control is an icon-only button (Trash2), no text label.
    await page.click('button:has(svg.lucide-trash-2)');

    await expect(page.locator('text=Nenhuma atividade adicionada ainda')).toBeVisible();
  });
});
