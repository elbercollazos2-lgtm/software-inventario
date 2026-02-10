const db = require('./src/config/db');

async function checkProveedoresSchema() {
    try {
        console.log('Checking "proveedores" table columns...');
        const [columns] = await db.query('SHOW COLUMNS FROM proveedores');
        console.log(columns.map(c => c.Field).join(', '));
        process.exit(0);
    } catch (error) {
        console.error('Error checking schema:', error);
        process.exit(1);
    }
}

checkProveedoresSchema();
