const db = require('./src/config/db');
const fs = require('fs');
const path = require('path');

async function migrate() {
    console.log('🚀 Iniciando migración de base de datos...');
    const sqlPath = path.join(__dirname, 'src', 'database', 'init.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Dividir el SQL en sentencias individuales (aproximado)
    const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);

    for (let statement of statements) {
        try {
            // Ignorar USE y CREATE DATABASE si ya estamos conectados
            if (statement.toUpperCase().startsWith('USE') || statement.toUpperCase().startsWith('CREATE DATABASE')) {
                continue;
            }
            await db.query(statement);
            // console.log('✅ Ejecutado:', statement.substring(0, 50) + '...');
        } catch (error) {
            if (error.code === 'ER_TABLE_EXISTS_ERROR' || error.code === 'ER_DUP_ENTRY') {
                // Ignorar errores de tablas ya existentes
                continue;
            }
            console.error('❌ Error ejecutando:', statement.substring(0, 50));
            console.error(error.message);
        }
    }

    console.log('🎉 Migración completada con éxito.');
    process.exit(0);
}

migrate();
