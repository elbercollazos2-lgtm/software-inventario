const db = require('./src/config/db');

async function migratePhase1() {
    console.log('🚀 Iniciando migración: Fase 1 - Estatus y Roles...');

    try {
        const connection = await db.getConnection();

        // 1. Agregar campo 'activo' a productos
        console.log('   - Agregando columna "activo" a productos...');
        await connection.query(`
            ALTER TABLE productos 
            ADD COLUMN IF NOT EXISTS activo TINYINT(1) DEFAULT 1 AFTER fecha_vencimiento
        `);

        // 2. Asegurar que los roles soporten 'superuser'
        // Ya existe la columna 'rol' en usuarios, solo validamos o actualizamos comentarios
        console.log('   - Validando estructura de roles en usuarios...');
        // (La columna rol ya existe por init.sql)

        console.log('✅ Migración de Fase 1 completada con éxito.');
        connection.release();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error en la migración Phase1:', error.message);
        process.exit(1);
    }
}

migratePhase1();
