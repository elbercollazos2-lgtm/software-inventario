const { test, expect } = require('@playwright/test');
const { POSPage } = require('../pages/POSPage');
const { InventoryPage } = require('../pages/InventoryPage');
const { LoginPage } = require('../pages/LoginPage');

test.describe('Point of Sale (POS)', () => {
    let posPage;
    let inventoryPage;
    let loginPage;
    let testProductName;

    test.beforeEach(async ({ page }) => {
        // 1. Crear producto como Admin
        const adminLogin = new LoginPage(page);
        await adminLogin.goto();
        await adminLogin.login('admin', 'admin123');
        await expect(page).toHaveURL('/');

        const inventory = new InventoryPage(page);
        await inventory.goto();

        testProductName = `POS Item ${Date.now()}`;

        try {
            await inventory.createProduct({
                name: testProductName,
                barcode: `POS-${Date.now()}`,
                stock: 100,
                cost: 10,
                price: 20,
                category: 'General'
            });
            console.log(`Product ${testProductName} created.`);
        } catch (e) {
            console.log('Product creation failed, continuing to see if it exists...');
        }

        // Logout (simulado yendo a login)
        await page.goto('/login');

        // 2. Login como Cajero
        loginPage = new LoginPage(page);
        await loginPage.login('cajero', 'cajero123');
        await expect(page).toHaveURL('/pos');

        posPage = new POSPage(page);
    });

    test('should complete a sale successfully', async ({ page }) => {
        // Buscar el producto creado
        await posPage.searchProduct(testProductName);

        // Agregar producto
        // Si falló la creación, esto fallará.
        await posPage.addProductToCart(testProductName);

        // Verificar total
        // El precio es 20
        await posPage.verifyCartTotal('$20');

        // Checkout
        await expect(posPage.checkoutButton).toBeEnabled();

        page.on('dialog', async dialog => {
            console.log(`Alert: ${dialog.message()}`);
            await dialog.accept();
        });

        await posPage.checkout();
    });
});
