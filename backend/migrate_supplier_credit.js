const db = require('./src/config/db');

async function migrateSupplierCrerdit() {
    console.log('🚀 Iniciando migración: Cuentas por Pagar (Crédito Proveedores)...');

    try {
        const connection = await db.getConnection();

        // 1. Modificar tabla compras para soportar estados de pago
        console.log('   - Actualizando tabla compras...');
        await connection.query(`
            ALTER TABLE compras 
            ADD COLUMN IF NOT EXISTS monto_pagado DECIMAL(15, 2) DEFAULT 0 AFTER total,
            ADD COLUMN IF NOT EXISTS estado_pago VARCHAR(20) DEFAULT 'PAGADO' AFTER monto_pagado,
            ADD COLUMN IF NOT EXISTS fecha_vencimiento_pago DATE AFTER fecha_compra
        `);

        // 2. Crear tabla de historial de pagos (Abonos)
        console.log('   - Creando tabla pagos_compras...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS pagos_compras (
                id INT AUTO_INCREMENT PRIMARY KEY,
                compra_id INT NOT NULL,
                monto DECIMAL(15, 2) NOT NULL,
                metodo_pago VARCHAR(50) DEFAULT 'efectivo',
                nota TEXT,
                fecha_pago TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                usuario_id INT,
                FOREIGN KEY (compra_id) REFERENCES compras(id) ON DELETE CASCADE,
                FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
            )
        `);

        console.log('✅ Migración de Cuentas por Pagar completada con éxito.');
        connection.release();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error en la migración:', error.message);
        process.exit(1);
    }
}

migrateSupplierCrerdit();
