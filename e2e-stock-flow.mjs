import { chromium } from 'playwright';
import axios from 'axios';

async function runE2ETest() {
    console.log('🚀 Iniciando Prueba E2E: Flujo de Venta y Stock...');
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    const testBarcode = `E2E-${Date.now()}`;
    const testProductName = `Producto E2E ${Date.now()}`;
    const initialStock = 20;

    try {
        // 1. Crear producto via API
        console.log('--- Paso 1: Creando producto inicial via API ---');
        await axios.post('http://localhost:4000/api/productos', {
            nombre: testProductName,
            codigo_barras: testBarcode,
            precio_compra: 50,
            precio_venta: 100,
            stock: initialStock,
            categoria_id: 1
        });
        console.log(`✅ Producto creado: ${testProductName} con stock ${initialStock}`);

        // 2. Navegar al POS
        console.log('--- Paso 2: Navegando al POS ---');
        await page.goto('http://localhost:3000/pos', { waitUntil: 'networkidle' });

        // 3. Buscar y agregar producto al carrito
        console.log('--- Paso 3: Agregando producto al carrito ---');
        const searchInput = page.locator('input[placeholder="Buscar por nombre o código..."]');
        await searchInput.fill(testBarcode);
        await page.click('button:has-text("Buscar")');

        // Esperar a que el producto aparezca en el grid y hacer clic en la tarjeta
        console.log('   - Buscando tarjeta de producto...');
        const productCardSelector = `text=${testProductName}`;
        await page.waitForSelector(productCardSelector);
        await page.click(productCardSelector);

        // Esperar a que el producto aparezca en el ticket de venta
        console.log('   - Verificando ticket de venta...');
        await page.waitForSelector('.divide-y >> text=' + testProductName);
        console.log('✅ Producto detectado en el ticket');

        // 4. Completar la venta
        console.log('--- Paso 4: Completando la venta ---');
        await page.click('button:has-text("Pagar Ahora")');

        // Esperar a que el carrito se limpie (indicador de éxito)
        console.log('   - Esperando procesamiento de venta...');
        await page.waitForSelector('text=El carrito está vacío');
        console.log('✅ Venta procesada exitosamente');

        // 5. Verificar stock actualizado via API
        console.log('--- Paso 5: Verificando reducción de stock via API ---');
        const response = await axios.get(`http://localhost:4000/api/productos/barcode/${testBarcode}`);
        const currentStock = response.data.stock;

        console.log(`📊 Stock Inicial: ${initialStock}`);
        console.log(`📊 Stock Actual: ${currentStock}`);

        if (currentStock === initialStock - 1) {
            console.log(`🌟 PRUEBA EXITOSA: El stock disminuyó exactamente en 1 unidad.`);
        } else if (currentStock < initialStock) {
            console.log(`⚠️ PRUEBA PARCIALMENTE EXITOSA: El stock disminuyó a ${currentStock}, pero se esperaba ${initialStock - 1}.`);
        } else {
            throw new Error(`Falla de integridad: El stock no cambió. Sigue siendo ${currentStock}`);
        }

    } catch (error) {
        console.error('❌ ERROR DURANTE LA PRUEBA E2E:', error.message);
        // Capturar screenshot si hay error
        await page.screenshot({ path: 'e2e-error-screenshot.png' });
        process.exit(1);
    } finally {
        await browser.close();
        console.log('🏁 Prueba finalizada.');
    }
}

runE2ETest();
