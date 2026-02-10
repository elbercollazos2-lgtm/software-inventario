const db = require('../config/db');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

const dashboardController = {
    getStats: catchAsync(async (req, res, next) => {
        // 1. Total Productos
        const [[{ totalProducts }]] = await db.query('SELECT COUNT(*) as totalProducts FROM productos');

        // 2. Ventas del mes
        const [[{ monthlySales }]] = await db.query(`
            SELECT COALESCE(SUM(total), 0) as monthlySales 
            FROM ventas 
            WHERE MONTH(fecha) = MONTH(CURRENT_DATE()) 
            AND YEAR(fecha) = YEAR(CURRENT_DATE())
        `);

        // 3. Bajo Stock y Stock Crítico (Cero)
        const [[{ lowStockCount }]] = await db.query('SELECT COUNT(*) as lowStockCount FROM productos WHERE stock <= stock_minimo AND stock > 0');
        const [[{ outOfStockCount }]] = await db.query('SELECT COUNT(*) as outOfStockCount FROM productos WHERE stock <= 0');

        const [lowStockList] = await db.query(`
            SELECT p.nombre, p.stock, p.stock_minimo, p.unidad_medida, 
                   pr.nombre as proveedor_nombre, pr.contacto as proveedor_contacto, pr.telefono as proveedor_telefono
            FROM productos p
            LEFT JOIN proveedores pr ON p.proveedor_id = pr.id
            WHERE p.stock <= p.stock_minimo 
            ORDER BY p.stock ASC
            LIMIT 10
        `);

        // 4. Vencimientos (Perecederos)
        const [[{ expiredCount }]] = await db.query(`
            SELECT COUNT(*) as expiredCount 
            FROM productos 
            WHERE perecedero = 1 AND fecha_vencimiento < CURRENT_DATE() AND activo = 1
        `);

        const [[{ nearExpirationCount }]] = await db.query(`
            SELECT COUNT(*) as nearExpirationCount 
            FROM productos 
            WHERE perecedero = 1 
            AND fecha_vencimiento BETWEEN CURRENT_DATE() AND DATE_ADD(CURRENT_DATE(), INTERVAL 30 DAY)
            AND activo = 1
        `);

        const [expiringSoonList] = await db.query(`
            SELECT nombre, fecha_vencimiento, DATEDIFF(fecha_vencimiento, CURRENT_DATE()) as dias_restantes
            FROM productos
            WHERE perecedero = 1 
            AND fecha_vencimiento >= CURRENT_DATE()
            AND activo = 1
            ORDER BY fecha_vencimiento ASC
            LIMIT 5
        `);

        // 5. Actividad Reciente (Últimas ventas)
        const [recentSales] = await db.query(`
            SELECT v.id, v.total, v.fecha, u.nombre as usuario
            FROM ventas v
            LEFT JOIN usuarios u ON v.usuario_id = u.id
            ORDER BY v.fecha DESC
            LIMIT 5
        `);

        // 6. Inversión y Ganancias
        // Inversión por categoría
        const [investmentByCategory] = await db.query(`
            SELECT c.nombre as categoria, SUM(p.stock * p.precio_compra) as inversion
            FROM productos p
            JOIN categorias c ON p.categoria_id = c.id
            WHERE p.activo = 1
            GROUP BY c.id
            ORDER BY inversion DESC
        `);

        // Inversión Total y Ganancia Potencial
        const [[{ totalInvestment, potentialProfit }]] = await db.query(`
            SELECT 
                SUM(stock * precio_compra) as totalInvestment,
                SUM(stock * (precio_venta - precio_compra)) as potentialProfit
            FROM productos 
            WHERE activo = 1
        `);

        // Ganancia Real del Mes (usando costo_unitario histórico si existe, si no fallback a precio_compra actual)
        const [[{ monthlyProfit }]] = await db.query(`
            SELECT COALESCE(SUM(dv.cantidad * (dv.precio_unitario - COALESCE(dv.costo_unitario, p.precio_compra))), 0) as monthlyProfit
            FROM detalle_ventas dv
            JOIN ventas v ON dv.venta_id = v.id
            JOIN productos p ON dv.producto_id = p.id
            WHERE MONTH(v.fecha) = MONTH(CURRENT_DATE()) 
            AND YEAR(v.fecha) = YEAR(CURRENT_DATE())
        `);

        res.json({
            stats: {
                totalProducts,
                monthlySales,
                monthlyProfit,
                totalInvestment,
                potentialProfit,
                lowStockCount,
                outOfStockCount,
                expiredCount,
                nearExpirationCount,
                growth: '+12.5%'
            },
            alerts: {
                lowStock: lowStockList,
                expiringSoon: expiringSoonList
            },
            investmentByCategory,
            recentSales
        });
    }),

    getProductPerformance: catchAsync(async (req, res, next) => {
        const [rows] = await db.query(`
            SELECT 
                p.id,
                p.nombre,
                p.sku,
                p.stock,
                p.precio_compra,
                p.precio_venta,
                p.iva,
                p.unidad_medida,
                c.nombre as categoria_nombre,
                (p.precio_venta - (p.precio_compra * (1 + p.iva/100))) as ganancia_unitaria,
                CASE 
                    WHEN p.precio_compra > 0 THEN ((p.precio_venta - (p.precio_compra * (1 + p.iva/100))) / (p.precio_compra * (1 + p.iva/100))) * 100 
                    ELSE 0 
                END as margen_porcentaje,
                COALESCE(SUM(dv.cantidad), 0) as unidades_vendidas,
                COALESCE(SUM(dv.subtotal), 0) as ingresos_totales,
                COALESCE(SUM(dv.cantidad * (dv.precio_unitario - (COALESCE(dv.costo_unitario, p.precio_compra) * (1 + p.iva/100)))), 0) as ganancia_total,
                (p.stock * p.precio_venta) as stock_valor_venta,
                (p.stock * p.precio_compra * (1 + p.iva/100)) as stock_valor_inversion,
                (p.stock * (p.precio_venta - (p.precio_compra * (1 + p.iva/100)))) as stock_ganancia_potencial
            FROM productos p
            LEFT JOIN categorias c ON p.categoria_id = c.id
            LEFT JOIN detalle_ventas dv ON p.id = dv.producto_id
            WHERE p.activo = 1
            GROUP BY p.id
            ORDER BY stock_valor_venta DESC, unidades_vendidas DESC
        `);

        res.json(rows);
    })
};

module.exports = dashboardController;

