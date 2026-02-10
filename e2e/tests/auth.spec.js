const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');

test.describe('Authentication Flow', () => {
    let loginPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        await loginPage.goto();
    });

    test('should login successfully with admin credentials', async ({ page }) => {
        await loginPage.login('admin', 'admin123');
        await expect(page).toHaveURL('/');

        // Verificar que estamos en el dashboard (buscando algún elemento característico)
        await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible();
    });

    test('should prevent access to protected routes without login', async ({ page }) => {
        // Intentar ir directo al inventario
        await page.goto('/inventory');
        await expect(page).toHaveURL('/login');
    });

    test('should show error with invalid credentials', async ({ page }) => {
        await loginPage.login('wrong', 'pass');
        await loginPage.expectError('Credenciales inválidas');
    });

    test('should login as cashier and redirect to POS', async ({ page }) => {
        await loginPage.login('cajero', 'cajero123');
        // El login del cajero redirige a /pos según Login.jsx
        await expect(page).toHaveURL('/pos');
    });
});
