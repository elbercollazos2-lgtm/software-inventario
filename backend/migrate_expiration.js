const db = require('./src/config/db');

async function migrateDates() {
    console.log('🚀 Iniciando migración: Gestión de Caducidad...');

    try {
        const connection = await db.getConnection();

        // 1. Agregar campo perecedero
        console.log('   - Agregando columna perecedero...');
        await connection.query(`
            ALTER TABLE productos 
            ADD COLUMN IF NOT EXISTS perecedero TINYINT(1) DEFAULT 0 AFTER stock_minimo
        `);

        // 2. Agregar fecha_fabricacion
        console.log('   - Agregando columna fecha_fabricacion...');
        await connection.query(`
            ALTER TABLE productos 
            ADD COLUMN IF NOT EXISTS fecha_fabricacion DATE DEFAULT NULL AFTER perecedero
        `);

        // 3. Agregar fecha_vencimiento
        console.log('   - Agregando columna fecha_vencimiento...');
        await connection.query(`
            ALTER TABLE productos 
            ADD COLUMN IF NOT EXISTS fecha_vencimiento DATE DEFAULT NULL AFTER fecha_fabricacion
        `);

        console.log('✅ Migración completada con éxito.');
        connection.release();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error en la migración:', error.message);
        process.exit(1);
    }
}

migrateDates();
