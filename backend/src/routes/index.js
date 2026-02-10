const express = require('express');
const router = express.Router();

// Importar todas las rutas
const authRoutes = require('./auth');
const productosRoutes = require('./productos');
const categoriasRoutes = require('./categorias');
const proveedoresRoutes = require('./proveedores');
const usuariosRoutes = require('./usuarios');
const inventarioRoutes = require('./inventario');
const salesRoutes = require('./sales');
const dashboardRoutes = require('./dashboard');
const bodegasRoutes = require('./bodegas');
const gruposRoutes = require('./grupos_inv');
const comprasRoutes = require('./compras');
const trasladosRoutes = require('./traslados');
const ajustesRoutes = require('./ajustes');
const kardexRoutes = require('./kardex');
const configRoutes = require('./config');

// Montar rutas
router.use('/auth', authRoutes);
router.use('/productos', productosRoutes);
router.use('/categorias', categoriasRoutes);
router.use('/proveedores', proveedoresRoutes);
router.use('/usuarios', usuariosRoutes);
router.use('/inventory', inventarioRoutes);
router.use('/sales', salesRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/bodegas', bodegasRoutes);
router.use('/grupos-inv', gruposRoutes);
router.use('/compras', comprasRoutes);
router.use('/traslados', trasladosRoutes);
router.use('/ajustes', ajustesRoutes);
router.use('/kardex', kardexRoutes);
router.use('/config', configRoutes);

module.exports = router;
