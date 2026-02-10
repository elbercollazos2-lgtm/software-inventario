import React, { useState, useEffect } from 'react';
import { Plus, ShoppingBag, Search, Calendar, User, Warehouse, ChevronRight, FileText } from 'lucide-react';
import { Button, Input, Card, CardContent, CardHeader, CardTitle } from '../components/ui';
import { comprasService, productService, bodegasService, proveedoresService, categoriasService } from '../services/api';
import { formatCurrency } from '../lib/utils';

export function Compras() {
    const [compras, setCompras] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [viewingCompra, setViewingCompra] = useState(null);

    // Form States
    const [bodegas, setBodegas] = useState([]);
    const [proveedores, setProveedores] = useState([]);
    const [selectedBodega, setSelectedBodega] = useState('');
    const [selectedProveedor, setSelectedProveedor] = useState('');
    const [factura, setFactura] = useState('');
    const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
    const [cart, setCart] = useState([]);
    const [tipoPago, setTipoPago] = useState('PAGADO'); // PAGADO o PENDIENTE
    const [montoAbonado, setMontoAbonado] = useState(0);

    // Search products
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    // Quick Create States
    const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
    const [categorias, setCategorias] = useState([]);
    const [newProduct, setNewProduct] = useState({ nombre: '', sku: '', categoria_id: '' });

    useEffect(() => {
        fetchCompras();
        loadMasters();
    }, []);

    const fetchCompras = async () => {
        setLoading(true);
        try {
            const response = await comprasService.getAll();
            setCompras(response.data);
        } catch (error) {
            console.error('Error fetching compras:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetails = async (id) => {
        try {
            const response = await comprasService.getById(id);
            setViewingCompra(response.data);
            setIsDetailModalOpen(true);
        } catch (error) {
            console.error('Error fetching purchase details:', error);
            alert('No se pudo cargar el detalle de la compra.');
        }
    };

    const loadMasters = async () => {
        try {
            const [bRes, pRes, cRes] = await Promise.all([
                bodegasService.getAll(),
                proveedoresService.getAll(),
                categoriasService.getAll()
            ]);
            setBodegas(bRes.data);
            setProveedores(pRes.data);
            setCategorias(cRes.data);
        } catch (error) {
            console.error('Error loading masters:', error);
        }
    };

    const handleQuickCreate = async (e) => {
        e.preventDefault();
        try {
            const response = await productService.create({
                ...newProduct,
                precio_compra: 0,
                precio_venta: 0,
                stock: 0
            });
            const created = response.data;
            // Lo agregamos directamente al carrito
            addToCart({
                id: created.id,
                nombre: created.nombre,
                sku: created.sku,
                precio_compra: 0
            });
            setIsQuickCreateOpen(false);
            setNewProduct({ nombre: '', sku: '', categoria_id: '' });
            setSearchQuery('');
            setSearchResults([]);
        } catch (error) {
            alert('Error al crear producto: ' + error.message);
        }
    };

    const searchProducts = async (q) => {
        setSearchQuery(q);
        if (q.length < 2) {
            setSearchResults([]);
            return;
        }
        try {
            const response = await productService.search(q);
            setSearchResults(response.data);
        } catch (error) {
            console.error('Error searching products:', error);
        }
    };

    const addToCart = (product) => {
        const exists = cart.find(item => item.producto_id === product.id);
        if (exists) return;

        setCart([...cart, {
            producto_id: product.id,
            nombre: product.nombre,
            sku: product.sku,
            cantidad: 1,
            costo_unitario: product.precio_compra,
            subtotal: product.precio_compra,
            lote: '',
            fecha_vencimiento: ''
        }]);
        setSearchQuery('');
        setSearchResults([]);
    };

    const updateItem = (index, field, value) => {
        const newCart = [...cart];
        newCart[index][field] = value;
        if (field === 'cantidad' || field === 'costo_unitario') {
            newCart[index].subtotal = newCart[index].cantidad * newCart[index].costo_unitario;
        }
        setCart(newCart);
    };

    const removeItem = (index) => {
        setCart(cart.filter((_, i) => i !== index));
    };

    const total = cart.reduce((sum, item) => sum + item.subtotal, 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (cart.length === 0) return alert('El carrito está vacío');

        const userId = localStorage.getItem('user_id');
        const data = {
            numero_factura: factura,
            proveedor_id: selectedProveedor,
            bodega_id: selectedBodega,
            fecha_compra: fecha,
            total,
            items: cart,
            usuario_id: userId,
            estado_pago: tipoPago,
            monto_pagado: tipoPago === 'PAGADO' ? total : montoAbonado
        };

        try {
            await comprasService.create(data);
            setIsModalOpen(false);
            setCart([]);
            fetchCompras();
        } catch (error) {
            alert('Error al registrar la compra: ' + error.message);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Entradas de Mercancía</h1>
                    <p className="text-slate-500 mt-1">Registra compras y aumenta tu stock.</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} className="gap-2">
                    <Plus size={18} />
                    Nueva Compra
                </Button>
            </div>

            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Factura</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Proveedor</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Bodega</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Total</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Saldo</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Estado</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Fecha</th>
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {loading ? (
                                <tr><td colSpan="6" className="p-10 text-center">Cargando...</td></tr>
                            ) : compras.map(c => (
                                <tr key={c.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 font-bold text-brand-600">{c.numero_factura}</td>
                                    <td className="px-6 py-4 text-sm">{c.proveedor_nombre}</td>
                                    <td className="px-6 py-4 text-sm">
                                        <span className="bg-slate-100 px-2 py-1 rounded text-xs">{c.bodega_nombre}</span>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-emerald-600">{formatCurrency(parseFloat(c.total))}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-red-600">
                                        {formatCurrency(parseFloat(c.total) - parseFloat(c.monto_pagado))}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${c.estado_pago === 'PAGADO' ? 'bg-emerald-100 text-emerald-700' :
                                            c.estado_pago === 'PARCIAL' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                                            }`}>
                                            {c.estado_pago}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm">{new Date(c.fecha_registro).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleViewDetails(c.id)}
                                            className="hover:bg-brand-50 hover:text-brand-600 transition-colors"
                                            title="Ver detalle"
                                        >
                                            <FileText size={18} className="text-slate-400 group-hover:text-brand-600" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <Card className="w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95">
                        <CardHeader className="border-b bg-slate-50">
                            <CardTitle className="flex items-center gap-2">
                                <ShoppingBag className="text-brand-500" />
                                Nueva Entrada de Mercancía
                            </CardTitle>
                        </CardHeader>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Header Form */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-slate-400">N° Factura</label>
                                    <Input value={factura} onChange={e => setFactura(e.target.value)} placeholder="FAC-001" className="bg-slate-50" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-slate-400">Proveedor</label>
                                    <select value={selectedProveedor} onChange={e => setSelectedProveedor(e.target.value)} className="w-full h-10 px-3 bg-slate-50 border rounded-xl">
                                        <option value="">Selecciona...</option>
                                        {proveedores.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-slate-400">Bodega Destino</label>
                                    <select value={selectedBodega} onChange={e => setSelectedBodega(e.target.value)} className="w-full h-10 px-3 bg-slate-50 border rounded-xl">
                                        <option value="">Selecciona...</option>
                                        {bodegas.map(b => <option key={b.id} value={b.id}>{b.nombre}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase text-slate-400">Tipo de Pago</label>
                                    <select
                                        value={tipoPago}
                                        onChange={e => setTipoPago(e.target.value)}
                                        className="w-full h-10 px-3 bg-slate-50 border rounded-xl"
                                    >
                                        <option value="PAGADO">Contado (Pagado)</option>
                                        <option value="PENDIENTE">Crédito (A Deber)</option>
                                    </select>
                                </div>
                                {tipoPago === 'PENDIENTE' && (
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase text-slate-400">Abono Inicial</label>
                                        <Input
                                            type="number"
                                            value={montoAbonado}
                                            onChange={e => setMontoAbonado(parseFloat(e.target.value))}
                                            className="bg-slate-50"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Product Search */}
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <Input
                                    className="h-12 text-lg border-brand-200 pl-12"
                                    placeholder="Busca productos por nombre, SKU o código de barras..."
                                    value={searchQuery}
                                    onChange={e => searchProducts(e.target.value)}
                                />
                                {searchQuery.length >= 2 && (
                                    <div className="absolute top-full left-0 w-full bg-white border rounded-xl shadow-xl z-20 mt-2 max-h-60 overflow-y-auto">
                                        {searchResults.map(p => (
                                            <div key={p.id} onClick={() => addToCart(p)} className="p-3 hover:bg-slate-50 cursor-pointer flex justify-between items-center border-b last:border-0">
                                                <div>
                                                    <div className="font-bold">{p.nombre}</div>
                                                    <div className="text-xs text-slate-400">SKU: {p.sku} | Código: {p.codigo_barras}</div>
                                                </div>
                                                <div className="text-brand-600 font-bold">${p.precio_compra}</div>
                                            </div>
                                        ))}
                                        <div
                                            onClick={() => {
                                                setNewProduct({ ...newProduct, nombre: searchQuery.toUpperCase() });
                                                setIsQuickCreateOpen(true);
                                            }}
                                            className="p-4 hover:bg-brand-50 cursor-pointer flex items-center gap-3 text-brand-600 font-bold border-t"
                                        >
                                            <Plus size={18} />
                                            ¿No existe? Crear "{searchQuery.toUpperCase()}" como nuevo producto
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Cart Table */}
                            <div className="border rounded-2xl overflow-hidden">
                                <table className="w-full border-collapse">
                                    <thead className="bg-slate-100 text-[10px] font-black uppercase text-slate-500">
                                        <tr>
                                            <th className="px-4 py-3 text-left">Producto</th>
                                            <th className="px-4 py-3 text-center w-24">Cant.</th>
                                            <th className="px-4 py-3 text-right w-32">Costo U.</th>
                                            <th className="px-4 py-3 text-center w-32">Lote</th>
                                            <th className="px-4 py-3 text-center w-40">Vence</th>
                                            <th className="px-4 py-3 text-right w-32">Subtotal</th>
                                            <th className="px-4 py-3 text-right w-16"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y text-sm">
                                        {cart.length === 0 ? (
                                            <tr><td colSpan="7" className="p-10 text-center text-slate-400">Aún no has agregado productos.</td></tr>
                                        ) : cart.map((item, index) => (
                                            <tr key={item.producto_id}>
                                                <td className="px-4 py-3">
                                                    <div className="font-bold">{item.nombre}</div>
                                                    <div className="text-[10px] text-slate-400 font-mono">{item.sku}</div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Input type="number" step="any" value={item.cantidad} onChange={e => updateItem(index, 'cantidad', parseFloat(e.target.value))} className="h-8 text-center" />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Input type="number" step="any" value={item.costo_unitario} onChange={e => updateItem(index, 'costo_unitario', parseFloat(e.target.value))} className="h-8 text-right" />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Input value={item.lote} onChange={e => updateItem(index, 'lote', e.target.value)} className="h-8 text-center" placeholder="Opcional" />
                                                </td>
                                                <td className="px-4 py-3">
                                                    <Input type="date" value={item.fecha_vencimiento} onChange={e => updateItem(index, 'fecha_vencimiento', e.target.value)} className="h-8" />
                                                </td>
                                                <td className="px-4 py-3 text-right font-bold text-slate-700">
                                                    {formatCurrency(item.subtotal)}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <button onClick={() => removeItem(index)} className="text-red-400 hover:text-red-600 transition-colors">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Footer / Total */}
                        <div className="p-6 border-t bg-slate-50 flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div>
                                    <p className="text-[10px] font-black uppercase text-slate-400">Items</p>
                                    <p className="text-xl font-bold">{cart.length}</p>
                                </div>
                                <div className="w-[1px] h-10 bg-slate-200" />
                                <div>
                                    <p className="text-3xl font-black text-brand-600">{formatCurrency(total)}</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                                <Button onClick={handleSubmit} className="px-10 h-12 text-lg shadow-xl shadow-brand-500/30">
                                    Completar Entrada
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* Modal de Detalle de Compra */}
            {isDetailModalOpen && viewingCompra && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4"
                    onClick={() => setIsDetailModalOpen(false)}
                >
                    <Card
                        className="w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95"
                        onClick={e => e.stopPropagation()}
                    >
                        <CardHeader className="border-b bg-slate-50 flex flex-row items-center justify-between p-6">
                            <div>
                                <CardTitle className="text-xl font-black flex items-center gap-2 italic tracking-tight">
                                    <FileText className="text-brand-500" />
                                    DETALLE DE COMPRA: {viewingCompra.numero_factura}
                                </CardTitle>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                    Proveedor: {viewingCompra.proveedor_nombre} | Fecha: {new Date(viewingCompra.fecha_registro).toLocaleDateString()}
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsDetailModalOpen(false)}
                                className="text-slate-400 hover:text-red-500 transition-colors"
                            >
                                <Plus size={24} className="rotate-45" />
                            </Button>
                        </CardHeader>

                        <CardContent className="p-0 flex-1 overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2">
                                <div className="border-r">
                                    <p className="px-8 py-4 text-[10px] font-black uppercase text-slate-500 bg-slate-50">Ítems de Factura</p>
                                    <table className="w-full text-left bg-white">
                                        <thead className="bg-slate-100 text-[10px] font-black uppercase text-slate-500 sticky top-0 z-10">
                                            <tr>
                                                <th className="px-8 py-4">Producto</th>
                                                <th className="px-6 py-4 text-center">Cant.</th>
                                                <th className="px-6 py-4 text-right">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {viewingCompra.items?.map((item, idx) => (
                                                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-8 py-4">
                                                        <div className="font-bold text-slate-900">{item.producto_nombre}</div>
                                                        <div className="text-[10px] text-slate-400 font-mono italic">{item.sku || 'SIN SKU'}</div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center font-bold text-slate-600">
                                                        {Number.isInteger(Number(item.cantidad)) ? parseInt(item.cantidad) : parseFloat(item.cantidad).toFixed(2)}
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-black text-slate-900">
                                                        {formatCurrency(parseFloat(item.subtotal))}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="bg-white">
                                    <p className="px-8 py-4 text-[10px] font-black uppercase text-slate-500 bg-slate-50">Historial de Pagos y Abonos</p>
                                    <div className="p-8 space-y-4">
                                        {viewingCompra.pagos?.length === 0 ? (
                                            <p className="text-center py-10 text-slate-400 italic">No hay registros de pago</p>
                                        ) : (
                                            viewingCompra.pagos.map((p, i) => (
                                                <div key={i} className="flex justify-between items-center p-3 rounded-2xl bg-slate-50 border border-slate-100">
                                                    <div>
                                                        <p className="font-black text-emerald-600">{formatCurrency(p.monto)}</p>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase">{new Date(p.fecha_pago).toLocaleDateString()} - {p.metodo_pago}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[10px] text-slate-400 italic">{p.nota || 'Abono realizado'}</p>
                                                    </div>
                                                </div>
                                            ))
                                        )}

                                        {viewingCompra.estado_pago !== 'PAGADO' && (
                                            <div className="mt-8 p-6 rounded-2xl border-2 border-dashed border-slate-200">
                                                <p className="text-[10px] font-black uppercase text-brand-600 mb-2">Registrar Nuevo Abono</p>
                                                <div className="flex gap-2">
                                                    <Input
                                                        type="number"
                                                        placeholder="Monto a pagar"
                                                        className="h-10"
                                                        id="monto-abono"
                                                    />
                                                    <Button
                                                        size="sm"
                                                        onClick={async () => {
                                                            const monto = document.getElementById('monto-abono').value;
                                                            if (!monto || monto <= 0) return alert('Ingresa un monto válido');
                                                            try {
                                                                await comprasService.addPayment({
                                                                    compra_id: viewingCompra.id,
                                                                    monto: parseFloat(monto),
                                                                    metodo_pago: 'efectivo',
                                                                    nota: 'Abono manual'
                                                                });
                                                                const updated = await comprasService.getById(viewingCompra.id);
                                                                setViewingCompra(updated.data);
                                                                fetchCompras();
                                                            } catch (error) {
                                                                alert('Error al registrar pago');
                                                            }
                                                        }}
                                                    >
                                                        Abonar
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>

                        <div className="p-8 border-t bg-slate-50 flex items-center justify-between">
                            <div className="flex gap-8">
                                <div>
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Total Factura</p>
                                    <p className="text-2xl font-black text-slate-900 tracking-tighter">{formatCurrency(parseFloat(viewingCompra.total))}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-brand-600 tracking-widest">Saldo Pendiente</p>
                                    <p className="text-2xl font-black text-brand-600 tracking-tighter">
                                        {formatCurrency(parseFloat(viewingCompra.total) - parseFloat(viewingCompra.monto_pagado))}
                                    </p>
                                </div>
                            </div>
                            <Button
                                onClick={() => setIsDetailModalOpen(false)}
                                className="px-8 font-black uppercase text-xs tracking-widest shadow-lg shadow-brand-500/20"
                            >
                                Cerrar
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
            {/* Modal de Creación Rápida */}
            {isQuickCreateOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <Card className="w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95">
                        <CardHeader className="bg-brand-600 text-white rounded-t-xl">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Plus size={20} /> Crear Producto Nuevo
                            </CardTitle>
                        </CardHeader>
                        <form onSubmit={handleQuickCreate}>
                            <div className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase text-slate-400">Nombre del Producto</label>
                                    <Input
                                        required
                                        value={newProduct.nombre}
                                        onChange={e => setNewProduct({ ...newProduct, nombre: e.target.value.toUpperCase() })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase text-slate-400">SKU / Referencia</label>
                                        <Input
                                            required
                                            value={newProduct.sku}
                                            onChange={e => setNewProduct({ ...newProduct, sku: e.target.value.toUpperCase() })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase text-slate-400">Categoría</label>
                                        <select
                                            required
                                            value={newProduct.categoria_id}
                                            onChange={e => setNewProduct({ ...newProduct, categoria_id: e.target.value })}
                                            className="w-full h-10 px-3 bg-slate-50 border rounded-xl text-sm"
                                        >
                                            <option value="">Selecciona...</option>
                                            {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nombre}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 bg-slate-50 rounded-b-xl flex gap-3">
                                <Button type="button" variant="ghost" className="flex-1" onClick={() => setIsQuickCreateOpen(false)}>Cancelar</Button>
                                <Button type="submit" className="flex-1 shadow-lg shadow-brand-500/30">Crear y Agregar</Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
}

// Re-using Trash2
const Trash2 = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
);
