const { expect } = require('@playwright/test');

exports.POSPage = class POSPage {
    /**
     * @param {import('@playwright/test').Page} page
     */
    constructor(page) {
        this.page = page;
        this.searchInput = page.getByPlaceholder('Buscar por nombre o código...');
        this.searchButton = page.getByRole('button', { name: 'Buscar' });
        this.productsGrid = page.locator('.grid-cols-1'); // Ajustar selector
        this.cartPanel = page.locator('.border-t-brand-600');
        this.checkoutButton = page.getByRole('button', { name: 'Procesar Pago' });
    }

    async goto() {
        await this.page.goto('/pos');
        await this.page.waitForSelector('.grid-cols-1'); // Esperar a que cargue el grid
    }

    async searchProduct(term) {
        await this.searchInput.fill(term);
        await this.searchButton.click();
        // Esperar a que se filtren (debounce o fetch)
        await this.page.waitForTimeout(1000);
    }

    async addProductToCart(productName) {
        // Buscar la tarjeta con el nombre y hacer click
        const productCard = this.page.locator('.grid').getByText(productName).first();
        await productCard.click();
    }

    async verifyCartTotal(expectedTotal) {
        // Buscar el total en el footer del carrito
        const totalElement = this.page.locator('span.text-brand-600').last();
        await expect(totalElement).toContainText(expectedTotal);
    }

    async checkout() {
        await this.checkoutButton.click();
        // Manejar alert/confirm si existen (POS.jsx usa alert 'Venta procesada con éxito')
        // Playwright maneja diálogos automáticamente si configuramos el listener
    }
};
