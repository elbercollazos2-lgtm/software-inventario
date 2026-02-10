import { chromium } from 'playwright';

async function runTest() {
    console.log('🚀 Iniciando Prueba de Humo con Playwright...');
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        // 1. Verificar Frontend
        console.log('--- Pasos 1: Verificando carga del Frontend ---');
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
        const title = await page.title();
        console.log(`✅ Frontend cargado. Título: ${title}`);

        // 2. Verificar Dashboard
        console.log('--- Paso 2: Verificando Dashboard ---');
        const dashboardText = await page.textContent('h1');
        console.log(`✅ Encabezado detectado: ${dashboardText}`);

        // 3. Navegar a Inventario
        console.log('--- Paso 3: Navegando a Inventario ---');
        await page.click('a[href="/inventory"]');
        await page.waitForURL('**/inventory');
        console.log('✅ Navegación a Inventario exitosa');

        // 4. Intentar crear un producto
        console.log('--- Paso 4: Creando Producto de Prueba ---');
        await page.click('button:has-text("Nuevo Producto")');

        // Esperar a que el modal se abra
        await page.waitForSelector('form');

        await page.fill('input[name="nombre"]', 'Producto Playwright Test');
        await page.fill('input[name="codigo_barras"]', 'PW-TEST-001');
        await page.fill('input[name="precio_compra"]', '100');
        await page.fill('input[name="precio_venta"]', '150');
        await page.fill('input[name="stock"]', '50');

        await page.click('button[type="submit"]');

        console.log('✅ Datos de producto enviados');

        // 5. Verificar si aparece en la lista
        await page.waitForTimeout(2000); // Esperar a que el backend procese
        const content = await page.content();
        if (content.includes('Producto Playwright Test')) {
            console.log('🌟 PRUEBA EXITOSA: El producto aparece en el inventario.');
        } else {
            console.log('⚠️ ADVERTENCIA: El producto no se visualiza de inmediato o falló el guardado.');
        }

    } catch (error) {
        console.error('❌ ERROR DURANTE LA PRUEBA:', error.message);
    } finally {
        await browser.close();
        console.log('🏁 Prueba finalizada.');
    }
}

runTest();
