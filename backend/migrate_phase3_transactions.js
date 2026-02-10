const db = require('./src/config/db');

async function migratePhase3Transactions() {
    console.log('🚀 Iniciando migración: Fase 3 - Tablas Transaccionales...');

    try {
        const connection = await db.getConnection();

        // 1. Tabla de Compras (Entradas de Mercancía)
        console.log('   - Creando tabla compras...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS compras (
                id INT AUTO_INCREMENT PRIMARY KEY,
                numero_factura VARCHAR(50),
                proveedor_id INT,
                bodega_id INT NOT NULL,
                fecha_compra DATE NOT NULL,
                total DECIMAL(15, 2) DEFAULT 0,
                estado VARCHAR(20) DEFAULT 'completado', -- completado, borrador, anulado
                usuario_id INT,
                fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (proveedor_id) REFERENCES proveedores(id) ON DELETE SET NULL,
                FOREIGN KEY (bodega_id) REFERENCES bodegas(id),
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
            )
        `);

        // 2. Detalle de Compras (Ítems de la factura)
        console.log('   - Creando tabla detalle_compras...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS detalle_compras (
                id INT AUTO_INCREMENT PRIMARY KEY,
                compra_id INT NOT NULL,
                producto_id INT NOT NULL,
                cantidad DECIMAL(12, 3) NOT NULL,
                costo_unitario DECIMAL(12, 2) NOT NULL,
                subtotal DECIMAL(15, 2) NOT NULL,
                lote VARCHAR(50),
                fecha_vencimiento DATE,
                FOREIGN KEY (compra_id) REFERENCES compras(id) ON DELETE CASCADE,
                FOREIGN KEY (producto_id) REFERENCES productos(id)
            )
        `);

        // 3. Tabla de Traslados entre Bodegas
        console.log('   - Creando tabla traslados...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS traslados (
                id INT AUTO_INCREMENT PRIMARY KEY,
                bodega_origen_id INT NOT NULL,
                bodega_destino_id INT NOT NULL,
                estado VARCHAR(20) DEFAULT 'completado', -- preparado, en_transito, completado, anulado
                usuario_id INT,
                observaciones TEXT,
                fecha_traslado TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (bodega_origen_id) REFERENCES bodegas(id),
                FOREIGN KEY (bodega_destino_id) REFERENCES bodegas(id),
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
            )
        `);

        // 4. Detalle de Traslados
        console.log('   - Creando tabla detalle_traslados...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS detalle_traslados (
                id INT AUTO_INCREMENT PRIMARY KEY,
                traslado_id INT NOT NULL,
                producto_id INT NOT NULL,
                cantidad DECIMAL(12, 3) NOT NULL,
                FOREIGN KEY (traslado_id) REFERENCES traslados(id) ON DELETE CASCADE,
                FOREIGN KEY (producto_id) REFERENCES productos(id)
            )
        `);

        // 5. Tabla de Kardex Unificado (Para trazabilidad total)
        console.log('   - Creando tabla kardex para trazabilidad histórica...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS kardex (
                id INT AUTO_INCREMENT PRIMARY KEY,
                producto_id INT NOT NULL,
                bodega_id INT NOT NULL,
                tipo_movimiento VARCHAR(20) NOT NULL, -- COMPRA, VENTA, TRASLADO_IN, TRASLADO_OUT, AJUSTE, DEVOLUCION
                referencia_id INT, -- ID de la compra, venta, traslado o ajuste
                cantidad DECIMAL(12, 3) NOT NULL,
                saldo_anterior DECIMAL(12, 3) NOT NULL,
                saldo_nuevo DECIMAL(12, 3) NOT NULL,
                costo_unitario DECIMAL(12, 2),
                usuario_id INT,
                fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (producto_id) REFERENCES productos(id),
                FOREIGN KEY (bodega_id) REFERENCES bodegas(id),
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
            )
        `);

        console.log('✅ Migración de Fase 3 completada con éxito.');
        connection.release();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error en la migración Fase 3:', error.message);
        process.exit(1);
    }
}

migratePhase3Transactions();
