const request = require('supertest');

// Mock mysql2/promise BEFORE requiring app
jest.mock('mysql2/promise', () => {
    const mockPool = {
        getConnection: jest.fn().mockResolvedValue({
            release: jest.fn(),
        }),
        query: jest.fn(),
        end: jest.fn(),
    };
    return {
        createPool: jest.fn(() => mockPool),
    };
});

// Now require app and db
const app = require('../src/app');
const db = require('../src/config/db'); // This will use the mocked mysql2

describe('Error Handling Middleware', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Test 404 Not Found
    it('should return 404 for unhandled routes', async () => {
        const res = await request(app).get('/api/unhandled-route');
        expect(res.statusCode).toEqual(404);
        expect(res.body.status).toEqual('fail');
        expect(res.body.message).toContain("Can't find /api/unhandled-route on this server!");
    });

    // Test 500 Internal Server Error (Database Error in Health Check)
    it('should return 500 for database errors', async () => {
        // Mock db.query to throw error
        db.query.mockRejectedValueOnce(new Error('Connection failed'));

        const res = await request(app).get('/api/health');
        expect(res.statusCode).toEqual(500);
        expect(res.body.status).toEqual('error');
        expect(res.body.message).toContain('Database connection failed: Connection failed');
    });

    // Test 400 Bad Request (Profitability Validation)
    // This route is managed by productosController which uses catchAsync
    it('should return 400 for profitability rule violation', async () => {
        // Mocking Route existence implicitly by hitting the API
        // Need to bypass auth middleware using x-user-role

        // We assume backend has /api/productos route mapped.
        // If route doesn't exist (e.g. not imported in app.js yet), this will 404.
        // Assuming implementation plan didn't say we need to register routes, but app.js has app.use('/api', apiRoutes).

        const res = await request(app)
            .post('/api/productos')
            .set('x-user-role', 'admin') // Bypass auth
            .send({
                nombre: 'Test Product',
                precio_compra: 100,
                precio_venta: 50, // Invalid: sale < purchase
                stock: 10
            });

        // If route exists and controller logic works:
        expect(res.statusCode).toEqual(400);
        expect(res.body.status).toEqual('fail');
        expect(res.body.message).toContain('Violación de Rentabilidad');
    });

});
