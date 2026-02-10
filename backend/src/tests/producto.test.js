const Producto = require('../models/Producto');
const db = require('../config/db');

// Mock del objeto de base de datos
jest.mock('../config/db', () => ({
    query: jest.fn(),
}));

describe('Modelo Producto - Pruebas Unitarias', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('debería ejecutar la consulta SQL correcta al crear un producto', async () => {
            const mockData = {
                codigo_barras: '123456',
                nombre: 'Producto de prueba',
                descripcion: 'Descripción de prueba',
                precio_compra: 10.5,
                precio_venta: 15.0,
                stock: 100,
                stock_minimo: 10,
                categoria_id: 1,
                proveedor_id: 1
            };

            db.query.mockResolvedValueOnce([{ insertId: 1 }]);

            const result = await Producto.create(mockData);

            expect(db.query).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO productos'),
                expect.arrayContaining([
                    '123456',
                    'Producto de prueba',
                    'Descripción de prueba',
                    10.5,
                    15.0,
                    100,
                    10,
                    1,
                    1
                ])
            );
            expect(result).toEqual({ id: 1, ...mockData });
        });

        it('debería asignar valores por defecto para stock y stock_minimo if not provided', async () => {
            const mockData = {
                codigo_barras: '123456',
                nombre: 'Producto sin stock',
                precio_compra: 10.0,
                precio_venta: 20.0
            };

            db.query.mockResolvedValueOnce([{ insertId: 2 }]);

            await Producto.create(mockData);

            expect(db.query).toHaveBeenCalledWith(
                expect.any(String),
                expect.arrayContaining([undefined, 'Producto sin stock', undefined, 10.0, 20.0, 0, 5, undefined, undefined])
            );
        });

        it('debería lanzar un error si faltan campos obligatorios', async () => {
            const incompleteData = { nombre: 'Incompleto' };
            await expect(Producto.create(incompleteData)).rejects.toThrow('Nombre, precio de compra y precio de venta son obligatorios');
        });
    });

    describe('getLowStock', () => {
        it('debería retornar productos con stock bajo la cuota mínima', async () => {
            const mockRows = [
                { id: 1, nombre: 'P1', stock: 2, stock_minimo: 5 },
                { id: 2, nombre: 'P2', stock: 5, stock_minimo: 5 }
            ];
            db.query.mockResolvedValueOnce([mockRows]);

            const result = await Producto.getLowStock();

            expect(db.query).toHaveBeenCalledWith(expect.stringContaining('WHERE stock <= stock_minimo'));
            expect(result).toEqual(mockRows);
        });
    });
});
