const db = require('./src/config/db');

async function migratePhase2Masters() {
    console.log('🚀 Iniciando migración: Fase 2 - Maestros Avanzados...');

    try {
        const connection = await db.getConnection();

        // 1. Tabla de Bodegas
        console.log('   - Creando tabla bodegas...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS bodegas (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(100) NOT NULL UNIQUE,
                ubicacion VARCHAR(255),
                es_virtual TINYINT(1) DEFAULT 0,
                activo TINYINT(1) DEFAULT 1,
                fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 2. Insertar Bodega Principal por defecto
        await connection.query(`
            INSERT IGNORE INTO bodegas (nombre, ubicacion) VALUES ('Bodega Principal', 'Sede Central')
        `);

        // 3. Tabla Relacional Producto-Bodega (Saldos y costos por ubicación)
        console.log('   - Creando tabla producto_bodega para saldos independientes...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS producto_bodega (
                id INT AUTO_INCREMENT PRIMARY KEY,
                producto_id INT NOT NULL,
                bodega_id INT NOT NULL,
                stock DECIMAL(10, 3) DEFAULT 0,
                costo_promedio DECIMAL(10, 2) DEFAULT 0,
                FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE,
                FOREIGN KEY (bodega_id) REFERENCES bodegas(id) ON DELETE CASCADE,
                UNIQUE KEY producto_bodega_idx (producto_id, bodega_id)
            )
        `);

        // 4. Tabla de Grupos de Inventario (Manejo Contable)
        console.log('   - Creando tabla grupos_inventario...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS grupos_inventario (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(100) NOT NULL UNIQUE,
                codigo_contable VARCHAR(20),
                descripcion TEXT
            )
        `);

        // 5. Insertar grupos por defecto
        await connection.query(`
            INSERT IGNORE INTO grupos_inventario (nombre, codigo_contable) VALUES 
            ('Mercancía para la venta', '1435'),
            ('Materia Prima', '1405'),
            ('Suministros y Repuestos', '1455')
        `);

        // 6. Agregar columnas SKU y grupo_id a productos
        console.log('   - Agregando SKU y grupo_id a productos...');
        await connection.query(`
            ALTER TABLE productos 
            ADD COLUMN IF NOT EXISTS sku VARCHAR(50) UNIQUE AFTER id,
            ADD COLUMN IF NOT EXISTS grupo_id INT AFTER categoria_id,
            ADD CONSTRAINT fk_producto_grupo FOREIGN KEY IF NOT EXISTS (grupo_id) REFERENCES grupos_inventario(id) ON DELETE SET NULL
        `);

        console.log('✅ Migración de Maestros Fase 2 completada con éxito.');
        connection.release();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error en la migración Fase 2 Masters:', error.message);
        process.exit(1);
    }
}

migratePhase2Masters();
