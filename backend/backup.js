const mysqldump = require('mysqldump');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config();

const backupDir = path.join(__dirname, 'backups');
if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir);
}

const filename = `backup-${new Date().toISOString().replace(/[:.]/g, '-')}.sql`;
const dumpPath = path.join(backupDir, filename);

async function runBackup() {
    console.log('🚀 Iniciando respaldo de base de datos...');

    try {
        await mysqldump({
            connection: {
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
                port: parseInt(process.env.DB_PORT) || 3306
            },
            dumpToFile: dumpPath,
        });

        console.log(`✅ Respaldo completado con éxito: ${filename}`);
        console.log(`📂 Ubicación: ${dumpPath}`);
    } catch (error) {
        console.error('❌ Error durante el respaldo:', error.message);
    }
}

runBackup();
