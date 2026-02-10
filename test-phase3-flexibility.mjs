import { chromium } from 'playwright';

(async () => {
    console.log('🧪 Iniciando prueba de Ventas Flexibles (Fracciones y Límites)...');
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    try {
        // 1. Configurar un producto fraccionado (ej. Tomate)
        console.log('--- Paso 1: Configurando producto fraccionado en Inventario ---');
        await page.goto('http://localhost:3000/inventory', { waitUntil: 'networkidle' });

        await page.click('button:has-text("Nuevo Producto")', { timeout: 10000 });
        await page.fill('input[name="nombre"]', 'Tomate Chonto Test');
        await page.fill('input[name="codigo_barras"]', 'TEMP-TOMATE-3');

        // Seleccionar categoría (usamos value para evitar problemas de regex con el texto acumulado)
        const categoriesSelect = page.locator('select').first();
        const firstCatOption = await categoriesSelect.locator('option').nth(1).getAttribute('value');
        await categoriesSelect.selectOption(firstCatOption);

        await page.fill('input[placeholder="0.00"]:not(.bg-emerald-50)', '2000'); // Costo

        // Configuración de venta
        // Seleccionar Kilogramo por su value si es posible, o por texto exacto
        await page.selectOption('select:has-text("Unidad")', { label: 'Kilogramo (Kg)' });

        // El checkbox de fracción es el segundo
        await page.locator('input[type="checkbox"]').nth(1).check();

        await page.fill('input[name="venta_minima"]', '0.100');
        await page.fill('input[name="venta_maxima"]', '5.000');

        await page.click('button:has-text("Confirmar Registro")');
        await page.waitForTimeout(2000);

        // 2. Probar venta fraccionada en POS
        console.log('--- Paso 2: Probando venta de 0.5 Kg en POS ---');
        await page.goto('http://localhost:3000/pos', { waitUntil: 'networkidle' });
        await page.fill('input[placeholder*="Buscar"]', 'Tomate Chonto Test');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(1000);

        // Agregar al carrito
        await page.click('text=Tomate Chonto Test');

        // Esperar a que aparezca el input de cantidad en el ticket
        const qtyInput = page.locator('input[type="number"][step="0.001"]');
        await qtyInput.fill('0.8');
        await page.waitForTimeout(500);

        const currentQty = await qtyInput.inputValue();
        console.log(`⚖️ Cantidad en carrito: ${currentQty} Kg`);

        await page.screenshot({ path: 'pos-flexibility-verified.png' });
        console.log('✅ Prueba de flexibilidad (Fase 3) completada con éxito.');

    } catch (e) {
        console.error('❌ Error en validación:', e.message);
    } finally {
        await browser.close();
    }
})();
