const { test, expect } = require('@playwright/test');
const { InventoryPage } = require('../pages/InventoryPage');
const { LoginPage } = require('../pages/LoginPage');

test.describe('Inventory Management', () => {
    let inventoryPage;
    let loginPage;

    test.beforeEach(async ({ page }) => {
        // Autenticarse primero
        loginPage = new LoginPage(page);
        await loginPage.goto();
        await loginPage.login('admin', 'admin123'); // Asumimos admin tiene permisos
        await expect(page).toHaveURL('/');

        inventoryPage = new InventoryPage(page);
        await inventoryPage.goto();
    });

    test('should create a new product successfully', async ({ page }) => {
        const timestamp = Date.now();
        const newProduct = {
            name: `Producto Test ${timestamp}`,
            barcode: `TEST-${timestamp}`,
            stock: 50,
            cost: 100,
            category: 'General' // Asumiendo que 'General' existe o seleccionaremos el primero disponible en el test real si falla
        };

        // Ajuste dinámico: Si no hay categoría 'General', seleccionar la primera
        // Esto es difícil de hacer en la abstracción sin lógica extra, simplifiquemos asumiendo seed data o seleccionando index

        await inventoryPage.createButton.click();
        await inventoryPage.nameInput.fill(newProduct.name);
        await inventoryPage.barcodeInput.fill(newProduct.barcode);
        await inventoryPage.stockInput.fill('50');

        // Seleccionar primera opción del select
        await inventoryPage.categorySelect.selectOption({ index: 1 }); // Index 0 suele ser "Seleccionar..."

        // Costo
        await page.locator('input[type="number"][step="0.01"]').first().fill('100');

        // Verificar autocalculo (opcional, pero buena validación de negocio)
        // await expect(page.locator('input[type="number"][step="0.01"]').nth(1)).not.toHaveValue('0');

        await inventoryPage.submitButton.click();

        // Validar creación
        await inventoryPage.searchProduct(newProduct.barcode);
        await inventoryPage.expectProductVisible(newProduct.name);
    });

    test('should delete a product', async ({ page }) => {
        // Primero creamos uno para borrar (aislamiento)
        const timestamp = Date.now();
        const productToDelete = `Delete Me ${timestamp}`;

        await inventoryPage.createButton.click();
        await inventoryPage.nameInput.fill(productToDelete);
        await inventoryPage.barcodeInput.fill(`DEL-${timestamp}`);
        await inventoryPage.stockInput.fill('10');
        await inventoryPage.categorySelect.selectOption({ index: 1 });
        await page.locator('input[type="number"][step="0.01"]').first().fill('50');
        await inventoryPage.submitButton.click();

        // Verificar que existe
        await inventoryPage.searchProduct(productToDelete);
        await inventoryPage.expectProductVisible(productToDelete);

        // Eliminar
        await inventoryPage.deleteProduct(productToDelete);

        // Verificar que desapareció
        // await inventoryPage.expectProductHidden(productToDelete); 
        // Nota: A veces la búsqueda persiste, hay que limpiar o asegurar refresh
        await page.reload();
        await inventoryPage.searchProduct(productToDelete);
        await expect(page.getByText('No se encontraron productos')).toBeVisible();
    });
});
