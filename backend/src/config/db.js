const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'supermercado_db',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Verificación de conexión
pool.getConnection()
    .then(connection => {
        console.log('✅ Conectado a la Base de Datos MariaDB:', process.env.DB_NAME);
        connection.release();
    })
    .catch(error => {
        console.error('❌ Error conectando a la Base de Datos:', error.message);
    });

module.exports = pool;
