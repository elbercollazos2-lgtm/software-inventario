const request = require('supertest');
const app = require('../app');
const db = require('../config/db');

describe('API Integración - MariaDB', () => {

    // Generar un código único para evitar conflictos con datos existentes
    const testBarcode = `INT-TEST-${Date.now()}`;
    let testProductId;

    it('GET /api/health debería confirmar conexión a BD', async () => {
        const res = await request(app).get('/api/health');
        expect(res.statusCode).toBe(200);
        expect(res.body.database).toBe('CONNECTED');
    });

    it('POST /api/productos debería persistir un producto en MariaDB', async () => {
        const newProduct = {
            nombre: 'Producto Integración Test',
            codigo_barras: testBarcode,
            precio_compra: 1000,
            precio_venta: 1500,
            stock: 50,
            categoria_id: 1
        };

        const res = await request(app)
            .post('/api/productos')
            .send(newProduct);

        expect(res.statusCode).toBe(201);
        expect(res.body.nombre).toBe(newProduct.nombre);
        testProductId = res.body.id;

        // Verificar directamente en la base de datos
        const [rows] = await db.query('SELECT * FROM productos WHERE id = ?', [testProductId]);
        expect(rows.length).toBe(1);
        expect(rows[0].codigo_barras).toBe(testBarcode);
    });

    it('GET /api/productos debería incluir el producto creado', async () => {
        const res = await request(app).get('/api/productos');
        expect(res.statusCode).toBe(200);
        const product = res.body.find(p => p.id === testProductId);
        expect(product).toBeDefined();
        expect(product.codigo_barras).toBe(testBarcode);
    });

    it('DELETE /api/productos/:id debería eliminar el producto de prueba', async () => {
        const res = await request(app).delete(`/api/productos/${testProductId}`);
        expect(res.statusCode).toBe(200);

        // Verificar que ya no existe en la base de datos
        const [rows] = await db.query('SELECT * FROM productos WHERE id = ?', [testProductId]);
        expect(rows.length).toBe(0);
    });

    afterAll(async () => {
        // No cerramos la conexión aquí porque el pool es compartido 
        // y otros tests podrían estar corriendo, pero en Jest serial esto es seguro.
        // await db.end(); 
    });
});
