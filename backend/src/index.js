const app = require('./app');
const db = require('./config/db');

const PORT = process.env.PORT || 4000;

// Iniciar servidor
const server = app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    console.log(`   - Entorno: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   - Base de Datos: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
    console.log(`   - Estado: Esperando conexión a BD...`);
});

// Manejo de errores del servidor
server.on('error', (error) => {
    console.error('❌ Error fatal en el servidor:', error.message);
});
