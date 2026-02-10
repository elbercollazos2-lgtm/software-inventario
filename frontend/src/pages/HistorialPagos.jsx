import React, { useState, useEffect } from 'react';
import { History, Search, Calendar, User, FileText, ArrowDownRight, MoreHorizontal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Input, Button } from '../components/ui';
import { comprasService } from '../services/api';
import { formatCurrency } from '../lib/utils';

export function HistorialPagos() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const response = await comprasService.getAllPayments();
            setPayments(response.data);
        } catch (error) {
            console.error('Error fetching payments:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredPayments = payments.filter(p =>
        p.proveedor_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.numero_factura.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Historial de Pagos y Abonos</h1>
                    <p className="text-slate-500 mt-1 text-sm">Registro cronológico de todas las salidas de dinero a proveedores.</p>
                </div>
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <Input
                        placeholder="Buscar por proveedor o factura..."
                        className="pl-12"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2rem] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b">
                                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Fecha</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Proveedor</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Factura</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Responsable</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Método</th>
                                <th className="px-6 py-4 text-right text-[10px] font-black uppercase text-slate-500 tracking-widest">Monto Pagado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr><td colSpan="6" className="p-10 text-center text-slate-400">Cargando historial...</td></tr>
                            ) : filteredPayments.length === 0 ? (
                                <tr><td colSpan="6" className="p-10 text-center text-slate-400 font-medium">No se encontraron registros de pago.</td></tr>
                            ) : filteredPayments.map((p) => (
                                <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-700">{new Date(p.fecha_pago).toLocaleDateString()}</span>
                                            <span className="text-[10px] text-slate-400 font-mono italic">{new Date(p.fecha_pago).toLocaleTimeString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-black text-slate-900 italic tracking-tight uppercase">{p.proveedor_nombre}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-brand-600 font-mono tracking-tighter">
                                        #{p.numero_factura}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold">
                                                {p.usuario_nombre ? p.usuario_nombre[0].toUpperCase() : 'U'}
                                            </div>
                                            <span className="text-sm font-medium text-slate-600">{p.usuario_nombre || 'Sistema'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                            {p.metodo_pago}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex flex-col items-end">
                                            <span className="text-lg font-black text-emerald-600 tracking-tight">{formatCurrency(p.monto)}</span>
                                            <span className="text-[10px] text-slate-400 italic">{p.nota || 'Abono realizado'}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <div className="flex items-center justify-center gap-4 bg-slate-900 p-8 rounded-[3rem] text-white shadow-2xl">
                <div className="bg-emerald-500/20 p-4 rounded-full">
                    <ArrowDownRight className="text-emerald-400" size={32} />
                </div>
                <div>
                    <h3 className="text-lg font-black tracking-tight italic uppercase">Total Egresado por Pagos</h3>
                    <p className="text-3xl font-black text-emerald-400 tracking-tighter">
                        {formatCurrency(filteredPayments.reduce((sum, p) => sum + parseFloat(p.monto), 0))}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Calculado sobre los resultados filtrados</p>
                </div>
            </div>
        </div>
    );
}
