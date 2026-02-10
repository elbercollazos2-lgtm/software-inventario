const db = require('../config/db');
const auditService = require('../services/auditService');

class Producto {
    static async findAll(search = '', showInactive = true) {
        let query = `
            SELECT p.*, c.nombre AS categoria_nombre, g.nombre AS grupo_nombre, pr.nombre AS proveedor_nombre
            FROM productos p
            LEFT JOIN categorias c ON p.categoria_id = c.id
            LEFT JOIN grupos_inventario g ON p.grupo_id = g.id
            LEFT JOIN proveedores pr ON p.proveedor_id = pr.id
            WHERE 1=1
        `;
        let params = [];

        if (search) {
            query += ` AND (p.nombre LIKE ? OR p.codigo_barras LIKE ?)`;
            params.push(`%${search}%`, `%${search}%`);
        }

        if (!showInactive) {
            query += ` AND p.activo = 1`;
        }

        query += ` ORDER BY p.nombre`;

        const [rows] = await db.query(query, params);
        return rows;
    }

    static async findById(id) {
        const [rows] = await db.query('SELECT * FROM productos WHERE id = ?', [id]);
        return rows[0];
    }

    static async findFavorites() {
        const query = `
            SELECT p.*, c.nombre AS categoria_nombre
            FROM productos p
            LEFT JOIN categorias c ON p.categoria_id = c.id
            WHERE p.es_favorito = 1 AND p.activo = 1
            ORDER BY p.nombre
        `;
        const [rows] = await db.query(query);
        return rows;
    }

    static async findByBarcode(codigo_barras) {
        const [rows] = await db.query('SELECT * FROM productos WHERE codigo_barras = ? AND activo = 1', [codigo_barras]);
        return rows[0];
    }

    static async create(data, userId = null) {
        const {
            sku, codigo_barras, nombre, descripcion, precio_compra, precio_venta,
            stock, stock_minimo, categoria_id, grupo_id, proveedor_id,
            perecedero, fecha_fabricacion, fecha_vencimiento, activo,
            unidad_medida, permite_fraccion, venta_minima, venta_maxima,
            iva, margen_ganancia, es_servicio, es_favorito
        } = data;

        if (!nombre || precio_compra === undefined || precio_venta === undefined) {
            throw new Error('Nombre, precio de compra y precio de venta son obligatorios');
        }

        const [result] = await db.query(
            `INSERT INTO productos (
                sku, codigo_barras, nombre, descripcion, precio_compra, precio_venta, 
                stock, stock_minimo, categoria_id, grupo_id, proveedor_id,
                perecedero, fecha_fabricacion, fecha_vencimiento, activo,
                unidad_medida, permite_fraccion, venta_minima, venta_maxima,
                iva, margen_ganancia, es_servicio, es_favorito
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                sku || null, codigo_barras, nombre, descripcion, precio_compra, precio_venta,
                stock || 0, stock_minimo || 5, categoria_id, grupo_id, proveedor_id,
                perecedero || 0, fecha_fabricacion || null, fecha_vencimiento || null,
                activo !== undefined ? activo : 1,
                unidad_medida || 'Unidad',
                permite_fraccion || 0,
                venta_minima || 1.000,
                venta_maxima || 999.000,
                iva || 0,
                margen_ganancia || 0,
                es_servicio || 0,
                es_favorito || 0
            ]
        );

        const productoId = result.insertId;

        // Inicializar stock en Bodega Principal (ID 1) si no es servicio
        if (!es_servicio) {
            await db.query(
                'INSERT INTO producto_bodega (producto_id, bodega_id, stock, costo_promedio) VALUES (?, ?, ?, ?)',
                [productoId, 1, stock || 0, precio_compra]
            );

            // Registro Inicial en Kardex (Saldo Inicial)
            if ((stock || 0) > 0) {
                await db.query(
                    `INSERT INTO kardex (producto_id, bodega_id, tipo_movimiento, referencia_id, cantidad, saldo_anterior, saldo_nuevo, costo_unitario, usuario_id) 
                     VALUES (?, ?, 'SALDO_INICIAL', ?, ?, ?, ?, ?, ?)`,
                    [productoId, 1, productoId, stock, 0, stock, precio_compra, userId]
                );
            }
        }

        // Registro Inicial en Auditoría
        await auditService.logPriceChange(productoId, { compra: 0, venta: 0 }, { compra: precio_compra, venta: precio_venta }, userId);

        return { id: productoId, ...data };
    }

    static async update(id, data, userId = null) {
        const currentProduct = await this.findById(id);
        if (!currentProduct) return null;

        const {
            sku, codigo_barras, nombre, descripcion, precio_compra, precio_venta,
            stock, stock_minimo, categoria_id, grupo_id, proveedor_id,
            perecedero, fecha_fabricacion, fecha_vencimiento, activo,
            unidad_medida, permite_fraccion, venta_minima, venta_maxima,
            iva, margen_ganancia, es_servicio, es_favorito
        } = data;

        // Auditoría de Precios
        if (precio_compra !== undefined && precio_venta !== undefined) {
            await auditService.logPriceChange(
                id,
                { compra: currentProduct.precio_compra, venta: currentProduct.precio_venta },
                { compra: precio_compra, venta: precio_venta },
                userId
            );
        }

        // Auditoría de Stock (Kardex) si cambió el stock directamente
        if (!currentProduct.es_servicio && stock !== undefined && stock !== currentProduct.stock) {
            const diferencia = parseFloat(stock) - parseFloat(currentProduct.stock);
            await db.query(
                `INSERT INTO kardex (producto_id, bodega_id, tipo_movimiento, referencia_id, cantidad, saldo_anterior, saldo_nuevo, costo_unitario, usuario_id) 
                 VALUES (?, ?, 'AJUSTE_MANUAL', ?, ?, ?, ?, ?, ?)`,
                [id, 1, id, diferencia, currentProduct.stock, stock, currentProduct.precio_compra, userId]
            );

            await db.query(
                'UPDATE producto_bodega SET stock = ? WHERE producto_id = ? AND bodega_id = 1',
                [stock, id]
            );
        }

        await db.query(
            `UPDATE productos SET 
                sku = ?, codigo_barras = ?, nombre = ?, descripcion = ?, precio_compra = ?, precio_venta = ?, 
                stock = ?, stock_minimo = ?, categoria_id = ?, grupo_id = ?, proveedor_id = ?,
                perecedero = ?, fecha_fabricacion = ?, fecha_vencimiento = ?, activo = ?,
                unidad_medida = ?, permite_fraccion = ?, venta_minima = ?, venta_maxima = ?,
                iva = ?, margen_ganancia = ?, es_servicio = ?, es_favorito = ?
             WHERE id = ?`,
            [
                sku, codigo_barras, nombre, descripcion, precio_compra, precio_venta,
                stock, stock_minimo, categoria_id, grupo_id, proveedor_id,
                perecedero, fecha_fabricacion, fecha_vencimiento, activo,
                unidad_medida, permite_fraccion, venta_minima, venta_maxima,
                iva, margen_ganancia,
                es_servicio !== undefined ? es_servicio : currentProduct.es_servicio,
                es_favorito !== undefined ? es_favorito : currentProduct.es_favorito,
                id
            ]
        );
        return this.findById(id);
    }

    static async delete(id, userId = null) {
        const product = await this.findById(id);
        if (product) {
            await auditService.logAction('ELIMINAR_PRODUCTO', { product_name: product.nombre, id: id }, userId);
        }
        const [result] = await db.query('DELETE FROM productos WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    static async updateStock(id, cantidad, tipo = 'AJUSTE', usuario_id = null) {
        const product = await this.findById(id);
        if (!product) return null;

        // Si es servicio, no actualizar stock ni registrar en kardex
        if (product.es_servicio) return product;

        const saldoAnterior = product.stock;
        const saldoNuevo = parseFloat(saldoAnterior) + parseFloat(cantidad);

        // Actualizar tabla productos
        await db.query('UPDATE productos SET stock = ? WHERE id = ?', [saldoNuevo, id]);

        // Actualizar bodega principal
        await db.query('UPDATE producto_bodega SET stock = stock + ? WHERE producto_id = ? AND bodega_id = 1', [cantidad, id]);

        // Registrar en Kardex
        await db.query(
            `INSERT INTO kardex (producto_id, bodega_id, tipo_movimiento, referencia_id, cantidad, saldo_anterior, saldo_nuevo, costo_unitario, usuario_id) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, 1, tipo, id, cantidad, saldoAnterior, saldoNuevo, product.precio_compra, usuario_id]
        );

        return this.findById(id);
    }

    static async adjustStock(id, cantidad, motivo, userId) {
        await auditService.logStockAdjustment(id, cantidad, motivo, userId);
        return this.updateStock(id, cantidad, cantidad > 0 ? 'AJUSTE_POS' : 'AJUSTE_NEG', userId);
    }

    static async getLowStock() {
        const [rows] = await db.query('SELECT * FROM productos WHERE stock <= stock_minimo AND activo = 1 AND es_servicio = 0');
        return rows;
    }
}

module.exports = Producto;
