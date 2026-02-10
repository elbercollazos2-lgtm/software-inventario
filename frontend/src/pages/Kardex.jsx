import React, { useState, useEffect } from 'react';
import { Search, Filter, ArrowUpRight, ArrowDownLeft, RefreshCcw, Boxes, Warehouse } from 'lucide-react';
import { Button, Input, Card, CardContent, CardHeader, CardTitle } from '../components/ui';
import api from '../services/api';

export function Kardex() {
    const [movimientos, setMovimientos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchKardex();
    }, []);

    const fetchKardex = async () => {
        setLoading(true);
        try {
            // No hay servicio específico aún, usamos api.get directo
            const response = await api.get('/kardex');
            setMovimientos(response.data);
        } catch (error) {
            console.error('Error fetching kardex:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filtro local
    const filtered = movimientos.filter(m =>
        m.producto_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.bodega_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.tipo_movimiento?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Kardex de Inventario</h1>
                    <p className="text-slate-500 mt-1">Historial detallado de todos los movimientos de mercancía.</p>
                </div>
                <Button variant="outline" onClick={fetchKardex} className="gap-2">
                    <RefreshCcw size={18} />
                    Actualizar
                </Button>
            </div>

            <Card className="p-4 bg-slate-50 border-slate-200">
                <div className="flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <Input
                            placeholder="Filtrar por producto, bodega o tipo..."
                            className="pl-12"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button variant="secondary" className="gap-2">
                        <Filter size={18} />
                        Filtros Avanzados
                    </Button>
                </div>
            </Card>

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Fecha / Hora</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Producto</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Bodega</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Tipo</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">Cantidad</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Saldo</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan="6" className="p-10 text-center">Cargando movimientos...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan="6" className="p-10 text-center text-slate-400">No hay movimientos registrados.</td></tr>
                            ) : filtered.map(m => (
                                <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 text-xs text-slate-500">
                                        {new Date(m.fecha).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-slate-800">{m.producto_nombre}</div>
                                        <div className="text-[10px] text-slate-400 font-mono">{m.sku}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-sm text-slate-600">
                                            <Warehouse size={12} className="text-slate-400" />
                                            {m.bodega_nombre}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${m.tipo_movimiento.includes('COMPRA') || m.tipo_movimiento.includes('IN') ? 'bg-emerald-100 text-emerald-700' :
                                            m.tipo_movimiento.includes('VENTA') || m.tipo_movimiento.includes('OUT') ? 'bg-orange-100 text-orange-700' :
                                                'bg-blue-100 text-blue-700'
                                            }`}>
                                            {m.tipo_movimiento.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            {m.cantidad > 0 ? <ArrowUpRight size={14} className="text-emerald-500" /> : <ArrowDownLeft size={14} className="text-orange-500" />}
                                            <span className={`font-bold ${m.cantidad > 0 ? 'text-emerald-600' : 'text-orange-600'}`}>
                                                {Number.isInteger(Number(m.cantidad)) ? parseInt(m.cantidad) : parseFloat(m.cantidad).toFixed(2)}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="font-black text-slate-900">
                                            {Number.isInteger(Number(m.saldo_nuevo)) ? parseInt(m.saldo_nuevo) : parseFloat(m.saldo_nuevo).toFixed(2)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
