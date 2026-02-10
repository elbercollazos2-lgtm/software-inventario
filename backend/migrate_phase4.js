const db = require('./src/config/db');

async function migratePhase4() {
    console.log('🚀 Iniciando migración: Fase 4 - Integridad y Auditoría...');

    try {
        const connection = await db.getConnection();

        // 1. Tabla de Historial de Precios
        console.log('   - Creando tabla historial_precios...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS historial_precios (
                id INT AUTO_INCREMENT PRIMARY KEY,
                producto_id INT NOT NULL,
                precio_compra_anterior DECIMAL(10, 2),
                precio_compra_nuevo DECIMAL(10, 2),
                precio_venta_anterior DECIMAL(10, 2),
                precio_venta_nuevo DECIMAL(10, 2),
                usuario_id INT, -- Quién hizo el cambio (si aplica)
                fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
            )
        `);

        // 2. Tabla de Ajustes de Stock (Auditoría)
        console.log('   - Creando tabla ajustes_stock...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS ajustes_stock (
                id INT AUTO_INCREMENT PRIMARY KEY,
                producto_id INT NOT NULL,
                cantidad DECIMAL(10, 3) NOT NULL, -- Positivo (entrada) o negativo (salida/merma)
                motivo VARCHAR(255) NOT NULL, -- 'Merma', 'Ajuste Inventario', 'Autoconsumo', 'Compra Extra'
                usuario_id INT, -- Responsable (debe ser admin o superuser)
                fecha_ajuste TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
            )
        `);

        // 3. Tabla de Logs de Acciones Privilegiadas
        console.log('   - Creando tabla logs_acciones...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS logs_acciones (
                id INT AUTO_INCREMENT PRIMARY KEY,
                usuario_id INT, -- Quién ejecutó la acción
                accion VARCHAR(100) NOT NULL, -- 'ELIMINAR_PRODUCTO', 'MODIFICAR_ROL', 'AJUSTE_STOCK'
                detalles TEXT, -- JSON o texto con detalles del cambio
                ip_address VARCHAR(45),
                fecha_accion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('✅ Migración de Fase 4 completada con éxito.');
        connection.release();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error en la migración Phase4:', error.message);
        process.exit(1);
    }
}

migratePhase4();
