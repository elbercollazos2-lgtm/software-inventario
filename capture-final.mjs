import { chromium } from 'playwright';

(async () => {
    console.log('📸 Capturando dashboard final...');
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();
    try {
        await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
        await page.waitForTimeout(1000); // Dar tiempo a que los skeletons desaparezcan
        await page.screenshot({ path: 'dashboard-final.png', fullPage: true });
        console.log('✅ Screenshot guardado como dashboard-final.png');
    } catch (e) {
        console.error('❌ Error capturando:', e.message);
    } finally {
        await browser.close();
    }
})();
