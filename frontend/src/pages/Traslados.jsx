import React, { useState, useEffect } from 'react';
import { Plus, ArrowRightLeft, Search, Warehouse, AlertCircle, FileText, Trash2 } from 'lucide-react';
import { Button, Input, Card, CardContent, CardHeader, CardTitle } from '../components/ui';
import { trasladosService, productService, bodegasService, authService } from '../services/api';

export function Traslados() {
    const [traslados, setTraslados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form States
    const [bodegas, setBodegas] = useState([]);
    const [bodegaOrigen, setBodegaOrigen] = useState('');
    const [bodegaDestino, setBodegaDestino] = useState('');
    const [observaciones, setObservaciones] = useState('');
    const [cart, setCart] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    useEffect(() => {
        fetchTraslados();
        loadBodegas();
    }, []);

    const fetchTraslados = async () => {
        setLoading(true);
        try {
            const response = await trasladosService.getAll();
            setTraslados(response.data);
        } catch (error) {
            console.error('Error fetching traslados:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadBodegas = async () => {
        try {
            const response = await bodegasService.getAll();
            setBodegas(response.data);
        } catch (error) {
            console.error('Error loading bodegas:', error);
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
            disponible: product.stock // Esto debería ser por bodega origen en el futuro
        }]);
        setSearchQuery('');
        setSearchResults([]);
    };

    const updateItem = (index, value) => {
        const newCart = [...cart];
        newCart[index].cantidad = parseFloat(value) || 0;
        setCart(newCart);
    };

    const removeItem = (index) => {
        setCart(cart.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (bodegaOrigen === bodegaDestino) return alert('La bodega origen y destino no pueden ser la misma');
        if (cart.length === 0) return alert('El traslado no tiene ítems');

        const userId = localStorage.getItem('user_id');
        const data = {
            bodega_origen_id: bodegaOrigen,
            bodega_destino_id: bodegaDestino,
            observaciones,
            items: cart,
            usuario_id: userId
        };

        try {
            await trasladosService.create(data);
            setIsModalOpen(false);
            setCart([]);
            fetchTraslados();
        } catch (error) {
            alert('Error al realizar traslado: ' + error.response?.data?.error || error.message);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Traslados entre Bodegas</h1>
                    <p className="text-slate-500 mt-1">Mueve mercancía de forma controlada.</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200">
                    <ArrowRightLeft size={18} />
                    Nuevo Traslado
                </Button>
            </div>

            <Card className="overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="bg-slate-50 border-b">
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Folio</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Origen / Destino</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Estado</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">Fecha</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Responsable</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {loading ? (
                            <tr><td colSpan="5" className="p-10 text-center">Cargando...</td></tr>
                        ) : traslados.map(t => (
                            <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-mono font-bold text-slate-400">TR-{t.id.toString().padStart(4, '0')}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-slate-700">{t.bodega_origen_nombre}</span>
                                        <ArrowRightLeft size={14} className="text-slate-300" />
                                        <span className="font-bold text-brand-600">{t.bodega_destino_nombre}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] uppercase font-bold tracking-wider">
                                        Completado
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center text-sm text-slate-500">
                                    {new Date(t.fecha_traslado).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 text-right text-sm font-medium">
                                    {t.usuario_nombre}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <Card className="w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <CardHeader className="border-b bg-indigo-50">
                            <CardTitle className="flex items-center gap-2 text-indigo-900">
                                <ArrowRightLeft className="text-indigo-600" />
                                Nuevo Traslado de Inventario
                            </CardTitle>
                        </CardHeader>

                        <div className="flex-1 overflow-y-auto p-8 space-y-8">
                            <div className="grid grid-cols-2 gap-8 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                <div className="space-y-3">
                                    <label className="text-xs font-black uppercase text-slate-400 flex items-center gap-2">
                                        <Warehouse size={14} /> Bodega de Salida (Origen)
                                    </label>
                                    <select value={bodegaOrigen} onChange={e => setBodegaOrigen(e.target.value)} className="w-full h-12 px-4 bg-white border-2 border-slate-200 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none">
                                        <option value="">Selecciona origen...</option>
                                        {bodegas.map(b => <option key={b.id} value={b.id}>{b.nombre}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-black uppercase text-slate-400 flex items-center gap-2">
                                        <Warehouse size={14} className="text-indigo-500" /> Bodega de Entrada (Destino)
                                    </label>
                                    <select value={bodegaDestino} onChange={e => setBodegaDestino(e.target.value)} className="w-full h-12 px-4 bg-white border-2 border-indigo-100 rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none">
                                        <option value="">Selecciona destino...</option>
                                        {bodegas.map(b => <option key={b.id} value={b.id}>{b.nombre}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="relative">
                                <label className="text-xs font-black uppercase text-slate-400 block mb-2">Añadir Productos al Traslado</label>
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <Input
                                        className="pl-12 h-14 text-lg border-2 border-slate-100 bg-white shadow-sm"
                                        placeholder="Escanea o busca productos..."
                                        value={searchQuery}
                                        onChange={e => searchProducts(e.target.value)}
                                        disabled={!bodegaOrigen || !bodegaDestino}
                                    />
                                    {!bodegaOrigen && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-amber-500 text-xs font-bold">
                                            <AlertCircle size={14} /> Selecciona bodegas primero
                                        </div>
                                    )}
                                </div>
                                {searchResults.length > 0 && (
                                    <div className="absolute top-full left-0 w-full bg-white border rounded-2xl shadow-2xl z-20 mt-3 p-2 animate-in slide-in-from-top-2">
                                        {searchResults.map(p => (
                                            <div key={p.id} onClick={() => addToCart(p)} className="p-4 hover:bg-slate-50 cursor-pointer flex justify-between items-center rounded-xl transition-colors">
                                                <div>
                                                    <div className="font-bold text-slate-800">{p.nombre}</div>
                                                    <div className="text-xs text-slate-400">SKU: {p.sku} | Stock Total: {p.stock}</div>
                                                </div>
                                                <Button size="sm" variant="outline" className="h-8">Añadir</Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <label className="text-xs font-black uppercase text-slate-400">Lista de Productos a Trasladar</label>
                                <div className="border border-slate-100 rounded-3xl overflow-hidden">
                                    <table className="w-full">
                                        <thead className="bg-slate-50 text-[10px] text-slate-500 font-black uppercase">
                                            <tr>
                                                <th className="px-6 py-4 text-left">Producto</th>
                                                <th className="px-6 py-4 text-center w-32">Cant. a Mover</th>
                                                <th className="px-6 py-4 text-right w-20"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {cart.length === 0 ? (
                                                <tr><td colSpan="3" className="p-12 text-center text-slate-400 italic">No hay productos en la lista.</td></tr>
                                            ) : cart.map((item, index) => (
                                                <tr key={item.producto_id}>
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-slate-800">{item.nombre}</div>
                                                        <div className="text-[10px] font-mono text-indigo-400">{item.sku}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <Input
                                                            type="number"
                                                            value={item.cantidad}
                                                            onChange={e => updateItem(index, e.target.value)}
                                                            className="h-10 text-center font-bold text-indigo-600 border-indigo-100 focus:border-indigo-400"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => removeItem(index)}
                                                            className="h-10 w-10 p-0 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl"
                                                        >
                                                            <Trash2 size={24} />
                                                        </Button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-black uppercase text-slate-400">Observaciones del Traslado</label>
                                <textarea
                                    value={observaciones}
                                    onChange={e => setObservaciones(e.target.value)}
                                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-200 outline-none h-24 transition-all"
                                    placeholder="Motivo del traslado, conductor, etc."
                                />
                            </div>
                        </div>

                        <div className="p-8 border-t bg-slate-50 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                    {cart.length}
                                </div>
                                <span className="text-sm font-bold text-slate-500 uppercase">Items en lista</span>
                            </div>
                            <div className="flex gap-4">
                                <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                                <Button onClick={handleSubmit} className="px-10 h-14 text-lg font-bold bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-600/20">
                                    Procesar Traslado
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
