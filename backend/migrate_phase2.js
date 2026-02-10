const db = require('./src/config/db');

async function migratePhase2() {
    console.log('🚀 Iniciando migración: Fase 2 - Márgenes y Precios...');

    try {
        const connection = await db.getConnection();

        // 1. Agregar margen_utilidad a categorías
        console.log('   - Agregando columna "margen_utilidad" a categorias...');
        await connection.query(`
            ALTER TABLE categorias 
            ADD COLUMN IF NOT EXISTS margen_utilidad DECIMAL(5, 2) DEFAULT 20.00
        `);

        console.log('✅ Migración de Fase 2 completada con éxito.');
        connection.release();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error en la migración Phase2:', error.message);
        process.exit(1);
    }
}

migratePhase2();
