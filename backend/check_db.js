const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

async function check() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'root',
        database: process.env.DB_NAME || 'supermercado_db',
        port: parseInt(process.env.DB_PORT) || 3306
    });
    try {
        const [rows] = await connection.query('DESCRIBE proveedores');
        rows.forEach(row => console.log(row.Field));
    } catch (e) {
        console.error('Error DESCRIBE proveedores:', e.message);
    }
    await connection.end();
}
check().catch(console.error);
