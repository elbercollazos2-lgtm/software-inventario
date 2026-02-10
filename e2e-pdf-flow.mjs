import { chromium } from 'playwright';
import path from 'path';
import axios from 'axios';

async function runPDFE2ETest() {
    console.log('🚀 Iniciando Prueba E2E: Flujo de Carga PDF -> Inventario...');
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    const pdfPath = path.resolve('fv09014117630472026000000xee4.pdf');
    const testSku = 'P204'; // AREQUIPE VASO

    try {
        // 1. Navegar a Carga de Facturas
        console.log('--- Paso 1: Navegando a Carga de Facturas ---');
        await page.goto('http://localhost:3000/upload', { waitUntil: 'networkidle' });

        // 2. Subir archivo
        console.log('--- Paso 2: Subiendo PDF de prueba ---');
        await page.setInputFiles('input[type="file"]', pdfPath);
        await page.waitForSelector('button:has-text("Procesar Ahora")');
        console.log('✅ Archivo cargado exitosamente.');

        // 3. Procesar PDF
        console.log('--- Paso 3: Procesando PDF con el Agente Python (Puerto 5001) ---');
        await page.click('button:has-text("Procesar Ahora")');

        // Esperar a que aparezca la tabla de resultados
        console.log('   - Esperando extracción OCR...');
        await page.waitForSelector('text=Extracción Completada', { timeout: 60000 });

        const content = await page.textContent('body');
        if (!content.includes(testSku)) {
            throw new Error(`El SKU ${testSku} no fue detectado por el OCR.`);
        }
        console.log(`✅ Datos extraídos correctamente (SKU ${testSku} detectado)`);

        // 4. Confirmar e Importar
        console.log('--- Paso 4: Confirmando Importación al Inventario ---');
        page.on('dialog', async dialog => {
            console.log(`   - Alerta detectada: ${dialog.message()}`);
            await dialog.accept();
        });

        await page.click('button:has-text("Confirmar e Importar")');
        await page.waitForSelector('text=Arrastra tu archivo aquí');
        console.log('✅ Importación finalizada.');

        // 5. Verificar en Inventario
        console.log('--- Paso 5: Verificando producto en el Inventario ---');
        await page.goto('http://localhost:3000/inventory', { waitUntil: 'networkidle' });

        // Usar un selector más específico para evitar ambigüedad con el buscador global
        const searchInput = page.locator('main input[placeholder*="nombre o código de barras"]').first();
        await searchInput.waitFor({ state: 'visible' });
        await searchInput.fill(testSku);

        // Esperar a que el producto aparezca en la tabla
        await page.waitForSelector(`table >> text=${testSku}`);
        console.log(`🌟 PRUEBA EXITOSA: El producto ${testSku} está presente y verificado en el inventario.`);

    } catch (error) {
        console.error('❌ ERROR DURANTE LA PRUEBA E2E PDF:', error.message);
        await page.screenshot({ path: 'e2e-pdf-final-error.png' });
        process.exit(1);
    } finally {
        await browser.close();
        console.log('🏁 Prueba finalizada.');
    }
}

runPDFE2ETest();
