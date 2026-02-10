const fs = require('fs');
const path = require('path');
const db = require('../config/db');

async function runInit() {
    try {
        const sqlPath = path.join(__dirname, 'init.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        // Split queries by semicolon, filtering out empty ones
        const queries = sql.split(';').filter(query => query.trim().length > 0);

        console.log(`➡️ Ejecutando ${queries.length} sentencias SQL...`);

        // Get a connection to ensure we can execute multiple statements if needed, 
        // though pool.query does one at a time usually.
        // We iterate carefully.
        for (const query of queries) {
            const trimmedQuery = query.trim();
            if (trimmedQuery) {
                await db.query(trimmedQuery);
            }
        }

        console.log('✅ Base de datos inicializada correctamente.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error inicializando la base de datos:', error);
        process.exit(1);
    }
}

runInit();
