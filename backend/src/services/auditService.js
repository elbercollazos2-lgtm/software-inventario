const db = require('../config/db');

const auditService = {
    /**
     * Registra un cambio en el precio de un producto.
     */
    async logPriceChange(productId, oldPrices, newPrices, userId) {
        if (oldPrices.compra === newPrices.compra && oldPrices.venta === newPrices.venta) return;

        try {
            await db.query(`
                INSERT INTO historial_precios 
                (producto_id, precio_compra_anterior, precio_compra_nuevo, precio_venta_anterior, precio_venta_nuevo, usuario_id)
                VALUES (?, ?, ?, ?, ?, ?)
            `, [productId, oldPrices.compra, newPrices.compra, oldPrices.venta, newPrices.venta, userId || null]);
        } catch (error) {
            console.error('Error logging price change:', error);
        }
    },

    /**
     * Registra un ajuste de stock manual.
     */
    async logStockAdjustment(productId, quantity, reason, userId) {
        try {
            await db.query(`
                INSERT INTO ajustes_stock (producto_id, cantidad, motivo, usuario_id)
                VALUES (?, ?, ?, ?)
            `, [productId, quantity, reason, userId || null]);
        } catch (error) {
            console.error('Error logging stock adjustment:', error);
        }
    },

    /**
     * Registra una acción administrativa genérica.
     */
    async logAction(action, details, userId, ip) {
        try {
            await db.query(`
                INSERT INTO logs_acciones (accion, detalles, usuario_id, ip_address)
                VALUES (?, ?, ?, ?)
            `, [action, JSON.stringify(details), userId || null, ip || null]);
        } catch (error) {
            console.error('Error logging action:', error);
        }
    }
};

module.exports = auditService;
