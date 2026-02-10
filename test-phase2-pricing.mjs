import { chromium } from 'playwright';

(async () => {
    console.log('🧪 Iniciando prueba de Inteligencia de Precios...');
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    try {
        // 1. Crear una categoría con 50% de margen
        console.log('--- Paso 1: Creando categoría con margen elevado ---');
        await page.goto('http://localhost:3000/inventory', { waitUntil: 'networkidle' }); // Temporalmente navegamos via URL si no hay link
        await page.goto('http://localhost:3000/categories', { waitUntil: 'networkidle' });
        await page.click('button:has-text("Nueva Categoría")');
        await page.fill('input[name="nombre"]', 'Pruebas Premium');
        await page.fill('input[name="margen_utilidad"]', '50');
        await page.click('button:has-text("Guardar Categoría")');
        await page.waitForTimeout(500);

        // 2. Ir a Inventario y probar autocalculo
        console.log('--- Paso 2: Verificando autocalculo en Inventario ---');
        await page.goto('http://localhost:3000/inventory', { waitUntil: 'networkidle' });
        await page.click('button:has-text("Nuevo Producto")');

        // Seleccionar categoría
        await page.selectOption('select', { label: /Pruebas Premium/ });

        // Ingresar costo $10.000
        await page.fill('input[placeholder="0.00"]:not(.bg-emerald-50)', '10000');
        await page.waitForTimeout(500);

        // El precio de venta debería ser $15.000 ($10.000 + 50%)
        const suggestedPrice = await page.$eval('input.bg-emerald-50', el => el.value);
        console.log(`💰 Precio de venta autocalculado: $${suggestedPrice}`);

        if (suggestedPrice === '15000') {
            console.log('✅ Autocalculo exitoso!');
        } else {
            console.error('❌ Error en el cálculo:', suggestedPrice);
        }

        await page.screenshot({ path: 'pricing-autocalc-success.png' });

    } catch (e) {
        console.error('❌ Error en validación:', e.message);
    } finally {
        await browser.close();
    }
})();
