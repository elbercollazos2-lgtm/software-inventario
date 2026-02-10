const { expect } = require('@playwright/test');

exports.InventoryPage = class InventoryPage {
    /**
     * @param {import('@playwright/test').Page} page
     */
    constructor(page) {
        this.page = page;
        // Selector más robusto para el botón
        this.createButton = page.locator('button').filter({ hasText: 'Nuevo Producto' });
        this.searchInput = page.getByPlaceholder('Buscar por nombre o código de barras...');
        this.modal = page.locator('form').filter({ hasText: 'Confirmar Registro' }); // Buscamos el form del modal

        // Form Inputs
        this.nameInput = page.locator('input[name="nombre"]');
        this.barcodeInput = page.locator('input[name="codigo_barras"]');
        this.stockInput = page.locator('input[name="stock"]');
        this.costInput = page.locator('input[type="number"]').first();

        this.categorySelect = page.getByRole('combobox');
        this.submitButton = page.getByRole('button', { name: 'Confirmar Registro' });
    }

    async goto() {
        await this.page.goto('/inventory');
        // Esperar a que cargue la tabla para asegurar hidratación
        await this.page.waitForSelector('table');
    }

    async createProduct({ name, barcode, stock, cost, price, category }) {
        // Espera breve por si acaso
        await this.page.waitForTimeout(1000);

        await this.createButton.click();

        // Esperar a que el modal (form) sea visible
        await this.modal.waitFor({ state: 'visible', timeout: 5000 });

        await this.nameInput.fill(name);
        await this.barcodeInput.fill(barcode);
        await this.stockInput.fill(stock.toString());

        // Select category
        await this.categorySelect.selectOption({ index: 1 });

        // Costo - Usamos selectores CSS puros para evitar ambigüedad
        await this.page.locator('input[type="number"][step="0.01"]').first().fill(cost.toString());

        if (price) {
            await this.page.locator('input[type="number"][step="0.01"]').nth(1).fill(price.toString());
        }

        await this.submitButton.click();

        await this.modal.waitFor({ state: 'hidden' });
    }

    async searchProduct(term) {
        await this.searchInput.fill(term);
        await this.page.waitForTimeout(1000); // 1s debounce
    }

    async deleteProduct(name) {
        const row = this.page.getByRole('row').filter({ hasText: name });
        await row.waitFor({ state: 'visible' });
        await row.hover();

        this.page.once('dialog', dialog => dialog.accept());

        await row.getByRole('button').nth(1).click();
    }

    async expectProductVisible(name) {
        await expect(this.page.getByRole('row').filter({ hasText: name })).toBeVisible();
    }

    async expectProductHidden(name) {
        await expect(this.page.getByRole('row').filter({ hasText: name })).toBeHidden();
    }
};
