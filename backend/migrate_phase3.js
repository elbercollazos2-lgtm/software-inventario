const db = require('./src/config/db');

async function migratePhase3() {
    console.log('🚀 Iniciando migración: Fase 3 - Unidades y Fracciones...');

    try {
        const connection = await db.getConnection();

        // 1. Agregar columnas a la tabla productos
        console.log('   - Agregando columnas unidad_medida, permite_fraccion, venta_minima, venta_maxima...');
        await connection.query(`
            ALTER TABLE productos 
            ADD COLUMN IF NOT EXISTS unidad_medida VARCHAR(20) DEFAULT 'Unidad' AFTER activo,
            ADD COLUMN IF NOT EXISTS permite_fraccion TINYINT(1) DEFAULT 0 AFTER unidad_medida,
            ADD COLUMN IF NOT EXISTS venta_minima DECIMAL(10, 3) DEFAULT 1.000 AFTER permite_fraccion,
            ADD COLUMN IF NOT EXISTS venta_maxima DECIMAL(10, 3) DEFAULT 999.000 AFTER venta_minima
        `);

        console.log('✅ Migración de Fase 3 completada con éxito.');
        connection.release();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error en la migración Phase3:', error.message);
        process.exit(1);
    }
}

migratePhase3();
