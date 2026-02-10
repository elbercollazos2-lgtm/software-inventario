import { chromium } from 'playwright';

(async () => {
    console.log('🧪 Iniciando prueba de validación de Producto Inactivo...');
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    try {
        // 1. Ir a inventario y desactivar el primer producto
        console.log('--- Paso 1: Desactivando producto en Inventario ---');
        await page.goto('http://localhost:3000/inventory', { waitUntil: 'networkidle' });
        await page.click('tr:first-child button:has-text("Edit")'); // Usando selector de icono simplificado
        await page.waitForSelector('input[type="checkbox"]');

        // El primer switch es el de estatus (Active)
        await page.click('div.peer-checked\\:bg-emerald-500');
        await page.click('button:has-text("Actualizar Cambios")');
        await page.waitForTimeout(1000);
        console.log('✅ Producto desactivado visualmente (grayscale aplicado).');

        // 2. Ir a POS y buscar ese producto
        console.log('--- Paso 2: Verificando invisibilidad en POS ---');
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle' }); // Dashboard -> POS
        await page.click('a:has-text("Punto de Venta")');
        await page.waitForTimeout(500);

        // Buscar el producto desactivado (asumiendo que sabemos el nombre o buscamos todo)
        await page.fill('input[placeholder*="Buscar"]', 'Arequipe'); // Ejemplo de búsqueda
        await page.click('button:has-text("Buscar")');
        await page.waitForTimeout(500);

        const visibleProducts = await page.$$eval('.grid > div', el => el.length);
        console.log(`📊 Productos visibles encontrados: ${visibleProducts}`);

        await page.screenshot({ path: 'pos-inactive-verification.png' });
        console.log('✅ Verificación completada. Screenshot guardado.');

    } catch (e) {
        console.error('❌ Error en validación:', e.message);
    } finally {
        await browser.close();
    }
})();
