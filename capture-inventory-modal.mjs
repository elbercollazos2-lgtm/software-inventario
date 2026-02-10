import { chromium } from 'playwright';

(async () => {
    console.log('📸 Capturando formulario de inventario con fechas...');
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    try {
        await page.goto('http://localhost:3000/inventory', { waitUntil: 'networkidle' });
        // Abrir el modal del primer producto (o nuevo)
        await page.click('button:has-text("Nuevo Producto")');
        // Activar el switch de perecedero
        await page.click('div.peer-checked\\:bg-orange-500');
        await page.waitForTimeout(500);
        await page.screenshot({ path: 'inventory-date-modal.png' });
        console.log('✅ Screenshot guardado como inventory-date-modal.png');
    } catch (e) {
        console.error('❌ Error capturando:', e.message);
    } finally {
        await browser.close();
    }
})();
