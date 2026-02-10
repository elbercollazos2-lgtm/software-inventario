import React, { useState, useEffect } from 'react';
import { Plus, Sliders, Search, AlertTriangle, User, Warehouse, History, CheckCircle2 } from 'lucide-react';
import { Button, Input, Card, CardContent, CardHeader, CardTitle } from '../components/ui';
import { ajustesService, productService, bodegasService } from '../services/api';

export function Ajustes() {
    const [ajustes, setAjustes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form States
    const [bodegas, setBodegas] = useState([]);
    const [selectedBodega, setSelectedBodega] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [cantidad, setCantidad] = useState(0);
    const [motivo, setMotivo] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    useEffect(() => {
        fetchAjustes();
        loadBodegas();
    }, []);

    const fetchAjustes = async () => {
        setLoading(true);
        try {
            const response = await ajustesService.getAll();
            setAjustes(response.data);
        } catch (error) {
            console.error('Error fetching ajustes:', error);
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

    const selectProduct = (p) => {
        setSelectedProduct(p);
        setSearchQuery('');
        setSearchResults([]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedProduct || !selectedBodega || !cantidad || !motivo) {
            return alert('Por favor completa todos los campos');
        }

        const userId = localStorage.getItem('user_id');
        const data = {
            producto_id: selectedProduct.id,
            bodega_id: selectedBodega,
            cantidad: parseFloat(cantidad),
            motivo,
            usuario_id: userId
        };

        try {
            await ajustesService.create(data);
            setIsModalOpen(false);
            resetForm();
            fetchAjustes();
        } catch (error) {
            alert('Error al realizar ajuste: ' + error.message);
        }
    };

    const resetForm = () => {
        setSelectedProduct(null);
        setSelectedBodega('');
        setCantidad(0);
        setMotivo('');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Ajustes de Inventario</h1>
                    <p className="text-slate-500 mt-1">Corrige descuadres, mermas o errores físicos.</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)} className="gap-2 bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-200">
                    <Sliders size={18} />
                    Nuevo Ajuste
                </Button>
            </div>

            <Card className="overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="bg-slate-50 border-b">
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-left">Fecha</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-left">Producto</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">Cantidad</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-left">Motivo</th>
                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Responsable</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {loading ? (
                            <tr><td colSpan="5" className="p-10 text-center">Cargando...</td></tr>
                        ) : ajustes.map(a => (
                            <tr key={a.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 text-sm text-slate-500">
                                    {new Date(a.fecha_ajuste).toLocaleString()}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="font-bold text-slate-800">{a.producto_nombre}</div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`px-2 py-1 rounded-lg font-bold ${a.cantidad >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                        {a.cantidad >= 0 ? '+' : ''}{a.cantidad}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-600 italic">
                                    "{a.motivo}"
                                </td>
                                <td className="px-6 py-4 text-right text-sm font-medium">
                                    {a.usuario_nombre}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <Card className="w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                        <CardHeader className="border-b bg-amber-50 rounded-t-3xl">
                            <CardTitle className="flex items-center gap-2 text-amber-900">
                                <AlertTriangle className="text-amber-500" />
                                Formulario de Ajuste de Stock
                            </CardTitle>
                        </CardHeader>
                        <form onSubmit={handleSubmit}>
                            <CardContent className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase text-slate-400">Bodega a Afectar</label>
                                    <select value={selectedBodega} onChange={e => setSelectedBodega(e.target.value)} className="w-full h-12 px-4 border-2 rounded-2xl outline-none focus:border-amber-500 transition-all bg-slate-50">
                                        <option value="">Selecciona bodega...</option>
                                        {bodegas.map(b => <option key={b.id} value={b.id}>{b.nombre}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-2 relative">
                                    <label className="text-xs font-black uppercase text-slate-400">Producto</label>
                                    {selectedProduct ? (
                                        <div className="flex items-center justify-between p-4 bg-brand-50 border-2 border-brand-200 rounded-2xl">
                                            <div>
                                                <div className="font-bold text-brand-900">{selectedProduct.nombre}</div>
                                                <div className="text-xs text-brand-500">SKU: {selectedProduct.sku}</div>
                                            </div>
                                            <button type="button" onClick={() => setSelectedProduct(null)} className="text-brand-400 hover:text-brand-600 font-bold text-xs uppercase">Cambiar</button>
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                            <Input
                                                className="h-12 bg-slate-50 border-2 pl-12"
                                                placeholder="Busca el producto..."
                                                value={searchQuery}
                                                onChange={e => searchProducts(e.target.value)}
                                            />
                                            {searchResults.length > 0 && (
                                                <div className="absolute top-full left-0 w-full bg-white border rounded-2xl shadow-xl z-20 mt-2 p-2">
                                                    {searchResults.map(p => (
                                                        <div key={p.id} onClick={() => selectProduct(p)} className="p-3 hover:bg-slate-50 cursor-pointer rounded-xl flex justify-between">
                                                            <span className="font-bold">{p.nombre}</span>
                                                            <span className="text-xs text-slate-400">Stock: {p.stock}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase text-slate-400">Cantidad (+ ó -)</label>
                                        <Input type="number" step="any" value={cantidad} onChange={e => setCantidad(e.target.value)} className="h-12 border-2 text-center text-xl font-bold" placeholder="Eje: -2" />
                                        <p className="text-[10px] text-slate-400 text-center">Usa números negativos para dar de baja</p>
                                    </div>
                                    <div className="flex items-center justify-center">
                                        <div className={`text-center p-3 rounded-2xl w-full ${parseFloat(cantidad) >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                            <p className="text-[10px] font-black uppercase">Efecto Final</p>
                                            <p className="text-lg font-black">{parseFloat(cantidad) >= 0 ? 'ENTRADA' : 'SALIDA'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase text-slate-400">Motivo del Ajuste</label>
                                    <textarea
                                        value={motivo}
                                        onChange={e => setMotivo(e.target.value)}
                                        className="w-full h-24 p-4 border-2 rounded-2xl outline-none focus:border-amber-500 bg-slate-50"
                                        placeholder="Ej. Producto vencido, Error en conteo físico, etc."
                                        required
                                    />
                                </div>
                            </CardContent>
                            <div className="p-6 border-t bg-slate-50 rounded-b-3xl flex gap-3">
                                <Button type="button" variant="ghost" className="flex-1" onClick={() => { setIsModalOpen(false); resetForm(); }}>Cancelar</Button>
                                <Button type="submit" className="flex-[2] bg-amber-500 hover:bg-amber-600 h-12 text-lg font-bold shadow-lg shadow-amber-500/20">
                                    Aplicar Ajuste
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
}
