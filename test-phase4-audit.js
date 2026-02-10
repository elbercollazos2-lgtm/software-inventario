const axios = require('axios');
const db = require('./backend/src/config/db');

async function testAuditFlow() {
    console.log('🕵️ Iniciando prueba de Auditoría y Trazabilidad...');

    try {
        const headers = {
            'x-user-id': '99',
            'x-user-role': 'superuser'
        };

        // 1. Crear un producto (debería registrar precio inicial)
        console.log('--- Paso 1: Creando producto auditado ---');
        const productRes = await axios.post('http://localhost:4000/api/productos', {
            nombre: 'Producto Auditado',
            codigo_barras: `AUDIT-${Date.now()}`, // Unique barcode
            precio_compra: 1000,
            precio_venta: 1500,
            stock: 10,
            activo: 1
        }, { headers });

        const productId = productRes.data.id;
        console.log(`✅ Producto creado ID: ${productId}`);

        // 2. Modificar Precio (debería crear log en historial_precios)
        console.log('--- Paso 2: Modificando precio para generar historial ---');
        await axios.put(`http://localhost:4000/api/productos/${productId}`, {
            nombre: 'Producto Auditado',
            precio_compra: 1200, // Cambio de costo
            precio_venta: 1800   // Cambio de venta
        }, { headers });
        console.log('✅ Precio modificado.');

        // 3. Ajuste de Stock Manual (debería crear log en ajustes_stock)
        console.log('--- Paso 3: Realizando ajuste de stock por Merma ---');
        await axios.patch(`http://localhost:4000/api/productos/${productId}/stock`, {
            cantidad: -2,
            motivo: 'Merma por daño en transporte'
        }, { headers });
        console.log('✅ Stock ajustado.');

        // 4. Verificar Base de Datos
        console.log('--- Paso 4: Verificando registros en DB ---');
        const conn = await db.getConnection();

        await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar escritura asíncrona

        const [priceLogs] = await conn.query('SELECT * FROM historial_precios WHERE producto_id = ? ORDER BY id DESC', [productId]);
        console.log(`📜 Logs de Precio encontrados: ${priceLogs.length}`);
        if (priceLogs.length > 0) {
            console.log(`   - Último Cambio: ${priceLogs[0].precio_venta_anterior} -> ${priceLogs[0].precio_venta_nuevo} (Usuario: ${priceLogs[0].usuario_id})`);
        }

        const [stockLogs] = await conn.query('SELECT * FROM ajustes_stock WHERE producto_id = ? ORDER BY id DESC', [productId]);
        console.log(`📦 Logs de Stock encontrados: ${stockLogs.length}`);
        if (stockLogs.length > 0) {
            console.log(`   - Motivo: ${stockLogs[0].motivo} (${stockLogs[0].cantidad})`);
        }

        conn.release();

        if (priceLogs.length > 0 && stockLogs.length > 0) {
            console.log('🎉 PRUEBA DE AUDITORÍA EXITOSA');
        } else {
            console.error('❌ FALLO: No se encontraron los logs esperados.');
        }

    } catch (error) {
        console.error('❌ Error en prueba:', error.response?.data || error.message);
    } finally {
        process.exit();
    }
}

testAuditFlow();
