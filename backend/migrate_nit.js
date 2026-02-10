const db = require('./src/config/db');

async function migrate() {
    try {
        console.log("Adding 'nit' column to 'proveedores'...");
        await db.query("ALTER TABLE proveedores ADD COLUMN IF NOT EXISTS nit VARCHAR(20) AFTER nombre;");
        console.log("Migration successful!");
        process.exit(0);
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
}

migrate();
