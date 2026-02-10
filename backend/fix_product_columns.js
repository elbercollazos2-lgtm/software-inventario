const db = require('./src/config/db');

async function fixProductColumns() {
    console.log('🚀 Iniciando corrección de columnas en tabla productos...');

    try {
        const connection = await db.getConnection();

        console.log('   - Agregando columna activo...');
        await connection.query(`
            ALTER TABLE productos 
            ADD COLUMN IF NOT EXISTS activo TINYINT(1) DEFAULT 1 AFTER fecha_vencimiento
        `);

        // Por si acaso algunas de las otras faltan por migraciones previas no ejecutadas
        console.log('   - Verificando otras columnas...');
        await connection.query(`
            ALTER TABLE productos 
            ADD COLUMN IF NOT EXISTS sku VARCHAR(50) UNIQUE AFTER id,
            ADD COLUMN IF NOT EXISTS grupo_id INT AFTER categoria_id,
            ADD COLUMN IF NOT EXISTS unidad_medida VARCHAR(20) DEFAULT 'Unidad' AFTER activo,
            ADD COLUMN IF NOT EXISTS permite_fraccion TINYINT(1) DEFAULT 0 AFTER unidad_medida,
            ADD COLUMN IF NOT EXISTS venta_minima DECIMAL(10, 3) DEFAULT 1.000 AFTER permite_fraccion,
            ADD COLUMN IF NOT EXISTS venta_maxima DECIMAL(10, 3) DEFAULT 999.000 AFTER venta_minima,
            ADD COLUMN IF NOT EXISTS perecedero TINYINT(1) DEFAULT 0 AFTER stock_minimo,
            ADD COLUMN IF NOT EXISTS fecha_fabricacion DATE DEFAULT NULL AFTER perecedero,
            ADD COLUMN IF NOT EXISTS fecha_vencimiento DATE DEFAULT NULL AFTER fecha_fabricacion,
            ADD COLUMN IF NOT EXISTS iva DECIMAL(5, 2) DEFAULT 0,
            ADD COLUMN IF NOT EXISTS margen_ganancia DECIMAL(5, 2) DEFAULT 0
        `);

        console.log('✅ Corrección de tabla productos completada.');
        connection.release();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error corrigiendo columnas:', error.message);
        process.exit(1);
    }
}

fixProductColumns();
