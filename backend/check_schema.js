const db = require('./src/config/db');

async function checkSchema() {
    try {
        console.log('Checking "productos" table columns...');
        const [columns] = await db.query('SHOW COLUMNS FROM productos');
        console.log(columns.map(c => c.Field).join(', '));
        process.exit(0);
    } catch (error) {
        console.error('Error checking schema:', error);
        process.exit(1);
    }
}

checkSchema();
