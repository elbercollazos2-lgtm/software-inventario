import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';

import { Plus, Edit2, Trash2, Search, Filter, Package, AlertTriangle, Calendar, Info, Eye, EyeOff, Calculator, Weight, ArrowDownUp, ScanBarcode, Check, Camera, Star } from 'lucide-react';
import { Button, Input, Card, CardContent, CardHeader, CardTitle } from '../components/ui';
import { productService, gruposService, bodegasService, categoriasService, proveedoresService } from '../services/api';
import { cn, formatCurrency } from '../lib/utils';
import { CameraScanner } from '../components/pos/CameraScanner';

export function Inventory() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [grupos, setGrupos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [isPerecedero, setIsPerecedero] = useState(false);
    const [isActive, setIsActive] = useState(true);
    const [isService, setIsService] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);

    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [selectedGrupoId, setSelectedGrupoId] = useState('');
    const [costo, setCosto] = useState(0);
    const [precioVenta, setPrecioVenta] = useState(0);
    const [unit, setUnit] = useState('Unidad');
    const [allowFraction, setAllowFraction] = useState(false);
    const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
    const [barcodeInput, setBarcodeInput] = useState('');
    const [iva, setIva] = useState(0);
    const [margen, setMargen] = useState(0);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [proveedores, setProveedores] = useState([]);
    const [selectedProveedorId, setSelectedProveedorId] = useState('');

    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            try {
                await Promise.all([
                    fetchProducts(true),
                    fetchCategories(),
                    fetchGrupos(),
                    fetchProveedores()
                ]);
            } catch (err) {
                console.error('Error loading initial data:', err);
                setError('Error al cargar datos iniciales.');
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, []);

    const fetchProveedores = async () => {
        try {
            const response = await proveedoresService.getAll();
            setProveedores(response.data || []);
        } catch (error) {
            console.error('Error fetching proveedores:', error);
        }
    };

    const handleCameraScan = (code) => {
        const existing = products.find(p => p.codigo_barras === code);
        if (existing) {
            handleOpenModal(existing);
        } else {
            handleOpenModal(null, code);
        }
        setIsCameraOpen(false);
    };

    const fetchProducts = async (skipLoading = false) => {
        if (!skipLoading) setLoading(true);
        setError(null);
        try {
            const response = await productService.getAll();
            setProducts(response.data || []);
        } catch (err) {
            console.error('Error fetching products:', err);
            setError(err.formattedMessage || 'Error al cargar productos.');
            setProducts([]);

        } finally {
            if (!skipLoading) setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await categoriasService.getAll();
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchGrupos = async () => {
        try {
            const response = await gruposService.getAll();
            setGrupos(response.data);
        } catch (error) {
            console.error('Error fetching grupos:', error);
        }
    };

    const handleOpenModal = (product = null, prefilledBarcode = '') => {
        setCurrentProduct(product);
        setIsPerecedero(product?.perecedero === 1);
        setIsActive(product ? product.activo === 1 : true);
        setSelectedCategoryId(product?.categoria_id || '');
        setSelectedGrupoId(product?.grupo_id || '');
        setSelectedProveedorId(product?.proveedor_id || '');
        setCosto(product?.precio_compra || 0);
        setPrecioVenta(product?.precio_venta || 0);
        setUnit(product?.unidad_medida || 'Unidad');
        setAllowFraction(product?.permite_fraccion === 1);
        const productIva = parseFloat(product?.iva || 0);
        setIva(productIva.toString());
        setMargen(product?.margen_ganancia || 0);
        setIsService(product?.es_servicio === 1);
        setIsFavorite(product?.es_favorito === 1);
        setIsModalOpen(true);

        if (!product && prefilledBarcode) {
            setTimeout(() => {
                const input = document.querySelector('input[name="codigo_barras"]');
                if (input) {
                    input.value = prefilledBarcode;
                }
            }, 100);
        }
    };

    const handleQuickScan = (e) => {
        if (e.key === 'Enter' && barcodeInput.trim()) {
            const code = barcodeInput.trim();
            const existing = products.find(p => p.codigo_barras === code);
            if (existing) {
                handleOpenModal(existing);
            } else {
                handleOpenModal(null, code);
            }
            setIsScannerModalOpen(false);
            setBarcodeInput('');
        }
    };

    // Helper to calculate price
    const calculatePrice = (c, m, i) => {
        const nCosto = parseFloat(c) || 0;
        const nMargen = parseFloat(m) || 0;
        const nIva = parseFloat(i) || 0;
        if (nCosto >= 0) {
            const baseConMargen = nCosto * (1 + nMargen / 100);
            const totalConIva = baseConMargen * (1 + nIva / 100);
            return Math.round(totalConIva);
        }
        return 0;
    };

    const handleCostChange = (e) => {
        const newCost = e.target.value;
        setCosto(newCost);
        const newPrice = calculatePrice(newCost, margen, iva);
        setPrecioVenta(newPrice);
    };

    const handleMarginChange = (e) => {
        const newMargin = e.target.value;
        setMargen(newMargin);
        const newPrice = calculatePrice(costo, newMargin, iva);
        setPrecioVenta(newPrice);
    };

    const handleIvaChange = (e) => {
        const newIva = e.target.value;
        setIva(newIva);
        const newPrice = calculatePrice(costo, margen, newIva);
        setPrecioVenta(newPrice);
    };

    // Update margin when category changes
    useEffect(() => {
        if (!isModalOpen || currentProduct) return;
        const category = categories.find(c => c.id === parseInt(selectedCategoryId));
        if (category) {
            const newMargin = parseFloat(category.margen_utilidad || 0);
            setMargen(newMargin);
            const newPrice = calculatePrice(costo, newMargin, iva);
            setPrecioVenta(newPrice);
        }
    }, [selectedCategoryId, categories, isModalOpen, currentProduct]);

    // ... (imports remain)

    // ... inside component ...

    const handleDelete = async (id) => {
        if (!window.confirm('¿Seguro que deseas eliminar este producto?')) return;
        try {
            await productService.delete(id);
            toast.success('Producto eliminado correctamente');
            fetchProducts();
        } catch (error) {
            console.error('Error deleting product:', error);
            // Error is already handled by interceptor toast, but if we want to be specific:
            // toast.error(error.formattedMessage || 'Error al eliminar producto');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        try {
            // ... (data processing remains same) ...
            const productData = {
                sku: data.sku || null,
                nombre: data.nombre,
                codigo_barras: data.codigo_barras,
                descripcion: data.descripcion || '',
                precio_compra: parseFloat(costo),
                precio_venta: parseFloat(precioVenta),
                stock: parseFloat(data.stock) || 0,
                stock_minimo: 5,
                categoria_id: parseInt(selectedCategoryId),
                grupo_id: parseInt(selectedGrupoId) || null,
                proveedor_id: parseInt(selectedProveedorId) || null,
                perecedero: isPerecedero ? 1 : 0,
                fecha_fabricacion: (isPerecedero && data.fecha_fabricacion) ? data.fecha_fabricacion : null,
                fecha_vencimiento: (isPerecedero && data.fecha_vencimiento) ? data.fecha_vencimiento : null,
                activo: isActive ? 1 : 0,
                unidad_medida: unit,
                permite_fraccion: allowFraction ? 1 : 0,
                venta_minima: parseFloat(data.venta_minima) || 1.000,
                venta_maxima: parseFloat(data.venta_maxima) || 999.000,
                iva: parseFloat(iva) || 0,
                margen_ganancia: parseFloat(margen) || 0,
                es_servicio: isService ? 1 : 0,
                es_favorito: isFavorite ? 1 : 0
            };
            const headers = { 'x-user-role': 'superuser' };
            if (currentProduct) {
                await productService.update(currentProduct.id, productData, { headers });
                toast.success('Producto actualizado correctamente');
            } else {
                await productService.create(productData, { headers });
                toast.success('Producto creado correctamente');
            }
            setIsModalOpen(false);
            fetchProducts();
        } catch (error) {
            console.error('Error saving product:', error);
            // Interceptor handles the toast, no need to alert
        }
    };


    const filteredProducts = products.filter(p =>
        (p.nombre?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (p.codigo_barras?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Inventario</h1>
                    <p className="text-slate-500 mt-1">Gestiona tus productos, stock y precios.</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => setIsCameraOpen(true)} variant="secondary" className="gap-2 border-brand-200 text-brand-700 bg-brand-50">
                        <Camera size={18} /> Cámara
                    </Button>
                    <Button onClick={() => setIsScannerModalOpen(true)} variant="secondary" className="gap-2 border-slate-200 text-slate-700 bg-white">
                        <ScanBarcode size={18} /> Pistola
                    </Button>
                    <Button onClick={() => handleOpenModal()} className="gap-2">
                        <Plus size={18} /> Nuevo Producto
                    </Button>
                </div>
            </div>

            <Card>
                <CardContent className="p-4">
                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={18} />
                            <Input
                                placeholder="Buscar por nombre o código de barras..."
                                className="pl-12"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button variant="secondary" className="gap-2">
                            <Filter size={18} /> Filtros
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">SKU</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Producto</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Categoría / Grupo</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Costo</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-brand-600 uppercase tracking-wider">Venta</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider w-16">IVA %</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-emerald-600 uppercase tracking-wider">Gana.</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Stock</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan="10" className="px-6 py-12 text-center text-slate-400">Cargando productos...</td></tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan="10" className="px-6 py-12 text-center text-red-500 font-medium">
                                        <div className="flex flex-col items-center gap-2">
                                            <AlertTriangle size={24} className="text-red-400" />
                                            {error}
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredProducts.length === 0 ? (
                                <tr><td colSpan="10" className="px-6 py-12 text-center text-slate-400">No se encontraron productos.</td></tr>
                            ) : (
                                filteredProducts.map((product) => (
                                    <tr key={product.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-xs text-brand-600 bg-brand-50 px-2 py-1 rounded">{product.sku || 'N/A'}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-sm font-bold text-slate-800">{product.nombre}</span>
                                                    {product.es_favorito === 1 && <Star size={12} className="text-amber-400 fill-amber-400" />}
                                                    {product.es_servicio === 1 && <span className="text-[9px] bg-blue-50 text-blue-600 px-1 rounded font-bold uppercase">Servicio</span>}
                                                </div>
                                                <span className="text-[10px] text-slate-400 font-mono">{product.codigo_barras}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-medium text-slate-600">{product.categoria_nombre || 'Sin Cat.'}</span>
                                                <span className="text-[10px] text-slate-400 italic">{product.grupo_nombre || 'Sin Grupo'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-slate-400">{formatCurrency(parseFloat(product.precio_compra))}</td>
                                        <td className="px-6 py-4 text-sm font-black text-brand-600">{formatCurrency(parseFloat(product.precio_venta))}</td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600">{product.iva}%</span>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-black text-emerald-600">
                                            +{formatCurrency(parseFloat(product.precio_venta) - parseFloat(product.precio_compra))}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn("px-2.5 py-1 rounded-lg text-xs font-bold", product.stock <= product.stock_minimo ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700")}>
                                                {product.stock} <span className="text-[10px] text-slate-400 font-normal">{product.unidad_medida}</span>
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase", product.activo ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-500")}>
                                                {product.activo ? "Activo" : "Inactivo"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="sm" onClick={() => handleOpenModal(product)} className="text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
                                                    <Edit2 size={16} />
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => handleDelete(product.id)} className="text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-white/20">
                        <form onSubmit={handleSubmit}>
                            <CardHeader className="border-b bg-slate-50/50 p-6">
                                <CardTitle className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-white">
                                        {currentProduct ? <Edit2 size={18} /> : <Plus size={18} />}
                                    </div>
                                    {currentProduct ? 'Editar Producto' : 'Registrar Nuevo Producto'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="flex items-center justify-between p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100">
                                        <div className="flex items-center gap-2">
                                            {isActive ? <Eye className="text-emerald-500" size={20} /> : <EyeOff className="text-slate-400" size={20} />}
                                            <p className="text-sm font-bold text-slate-900">Activo</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                                            <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                                        </label>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-amber-50/50 rounded-2xl border border-amber-100">
                                        <div className="flex items-center gap-2">
                                            <Star className={isFavorite ? "text-amber-500 fill-amber-500" : "text-slate-400"} size={20} />
                                            <p className="text-sm font-bold text-slate-900">Favorito</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" checked={isFavorite} onChange={(e) => setIsFavorite(e.target.checked)} />
                                            <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-amber-400 after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                                        </label>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                                        <div className="flex items-center gap-2">
                                            <Package className={isService ? "text-blue-500" : "text-slate-400"} size={20} />
                                            <p className="text-sm font-bold text-slate-900">Servicio</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" checked={isService} onChange={(e) => setIsService(e.target.checked)} />
                                            <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-500 after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                                        </label>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Categoría</label>
                                        <select value={selectedCategoryId} onChange={(e) => setSelectedCategoryId(e.target.value)} className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 text-sm" required>
                                            <option value="">Selecciona...</option>
                                            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.nombre} ({cat.margen_utilidad}%)</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Grupo Contable</label>
                                        <select value={selectedGrupoId} onChange={(e) => setSelectedGrupoId(e.target.value)} className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 text-sm" required>
                                            <option value="">Selecciona...</option>
                                            {grupos.map(g => <option key={g.id} value={g.id}>{g.nombre}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Proveedor</label>
                                        <select value={selectedProveedorId} onChange={(e) => setSelectedProveedorId(e.target.value)} className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 text-sm">
                                            <option value="">Selecciona...</option>
                                            {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-100">
                                    <div className="space-y-2"><label className="text-sm font-bold text-slate-700">SKU</label><Input name="sku" defaultValue={currentProduct?.sku} placeholder="Ej. INV-001" className="bg-slate-50" /></div>
                                    <div className="space-y-2"><label className="text-sm font-bold text-slate-700">Nombre</label><Input name="nombre" defaultValue={currentProduct?.nombre} placeholder="Nombre del producto" required className="bg-slate-50" /></div>
                                    <div className="space-y-2"><label className="text-sm font-bold text-slate-700">Código de Barras</label><Input name="codigo_barras" defaultValue={currentProduct?.codigo_barras} placeholder="EAN13" required className="bg-slate-50" /></div>
                                    <div className="space-y-2"><label className="text-sm font-bold text-slate-700">Stock Actual</label><Input name="stock" type="number" step="0.001" defaultValue={currentProduct?.stock || 0} required className="bg-slate-50 font-bold" /></div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Calculator size={14} /> Precios</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                        <div className="space-y-2"><label className="text-sm font-bold text-slate-700">Costo</label><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">$</span><Input value={costo} onChange={handleCostChange} type="number" className="pl-8 bg-white" /></div></div>
                                        <div className="space-y-2"><label className="text-sm font-bold text-slate-700">Margen (%)</label><Input value={margen} onChange={handleMarginChange} type="number" className="bg-white text-center" /></div>
                                        <div className="space-y-2"><label className="text-sm font-bold text-slate-700">IVA (%)</label><select value={iva} onChange={handleIvaChange} className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-sm font-bold font-mono"><option value="0">0%</option><option value="5">5%</option><option value="19">19%</option></select></div>
                                        <div className="space-y-2"><label className="text-sm font-bold text-slate-700">Venta</label><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500">$</span><Input value={precioVenta} onChange={(e) => setPrecioVenta(e.target.value)} type="number" className="pl-8 bg-emerald-50 text-emerald-700 font-black" /></div></div>
                                    </div>
                                </div>

                                <div className="p-4 rounded-2xl bg-orange-50/30 border border-orange-100 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2"><Calendar className="text-orange-500" size={20} /><p className="text-sm font-bold text-slate-900">Perecedero</p></div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" checked={isPerecedero} onChange={(e) => setIsPerecedero(e.target.checked)} />
                                            <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-orange-500 after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                                        </label>
                                    </div>
                                    {isPerecedero && (
                                        <div className="grid grid-cols-2 gap-4 pt-2">
                                            <div className="space-y-1"><label className="text-[10px] font-bold text-slate-500 uppercase">Vencimiento</label><Input name="fecha_vencimiento" type="date" defaultValue={currentProduct?.fecha_vencimiento?.split('T')[0]} required={isPerecedero} className="bg-white" /></div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                            <div className="bg-slate-50 p-6 flex justify-end gap-3 border-t">
                                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                                <Button type="submit" className="px-8 shadow-lg shadow-brand-500/20 font-bold">{currentProduct ? 'Actualizar' : 'Registrar'}</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isScannerModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 text-center space-y-6">
                        <div className="w-20 h-20 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mx-auto animate-bounce"><ScanBarcode size={40} /></div>
                        <h2 className="text-2xl font-black text-slate-900">Modo Escaneo</h2>
                        <Input autoFocus placeholder="Lee el código de barras..." className="h-16 text-center text-2xl font-mono border-2 border-brand-200" value={barcodeInput} onChange={(e) => setBarcodeInput(e.target.value)} onKeyDown={handleQuickScan} />
                        <Button variant="ghost" className="w-full text-slate-500" onClick={() => setIsScannerModalOpen(false)}>Cerrar</Button>
                    </div>
                </div>
            )}

            {isCameraOpen && <CameraScanner onScan={handleCameraScan} onClose={() => setIsCameraOpen(false)} />}
        </div>
    );
}
