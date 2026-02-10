const db = require('./src/config/db');

async function migrate() {
    try {
        await db.query('ALTER TABLE proveedores ADD COLUMN IF NOT EXISTS notas TEXT AFTER direccion');
        console.log('Migration successful: Added notas column to proveedores');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
