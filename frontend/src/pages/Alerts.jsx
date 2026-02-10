import React, { useState, useEffect } from 'react';
import { AlertCircle, Clock, Package, Filter, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from '../components/ui';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export function Alerts() {
    const navigate = useNavigate();
    const [alerts, setAlerts] = useState({ expired: [], near: [], lowStock: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAlerts();
    }, []);

    const fetchAlerts = async () => {
        setLoading(true);
        try {
            const response = await api.get('/dashboard/stats'); // Re-using this since it has all lists
            const data = response.data;

            // For now extracting from dashboard stats
            setAlerts({
                expired: [], // Need separate endpoint for full list if dashboard is limited
                near: data.alerts.expiringSoon,
                lowStock: data.alerts.lowStock
            });
        } catch (error) {
            console.error('Error fetching alerts:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Centro de Alertas</h1>
                    <p className="text-slate-500 mt-1">Gestión de productos vencidos, por vencer y stock crítico.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2">
                        <Download size={18} />
                        Exportar Alertas
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-red-50 border-red-100 shadow-sm overflow-hidden">
                    <div className="p-4 bg-red-500 text-white flex justify-between items-center">
                        <span className="text-xs font-black uppercase tracking-widest">Stock Agotado</span>
                        <AlertCircle size={20} />
                    </div>
                    <CardContent className="p-4">
                        <p className="text-4xl font-black text-red-600">0</p>
                        <p className="text-xs text-red-400 font-bold mt-1 uppercase">Sugerencia: Revisar compras</p>
                    </CardContent>
                </Card>

                <Card className="bg-orange-50 border-orange-100 shadow-sm overflow-hidden">
                    <div className="p-4 bg-orange-500 text-white flex justify-between items-center">
                        <span className="text-xs font-black uppercase tracking-widest">Próximos a Vencer</span>
                        <Clock size={20} />
                    </div>
                    <CardContent className="p-4">
                        <p className="text-4xl font-black text-orange-600">{alerts.near.length}</p>
                        <p className="text-xs text-orange-400 font-bold mt-1 uppercase">Sugerencia: Ofertas relámpago</p>
                    </CardContent>
                </Card>

                <Card className="bg-amber-50 border-amber-100 shadow-sm overflow-hidden">
                    <div className="p-4 bg-amber-500 text-white flex justify-between items-center">
                        <span className="text-xs font-black uppercase tracking-widest">Bajo Stock</span>
                        <Package size={20} />
                    </div>
                    <CardContent className="p-4">
                        <p className="text-4xl font-black text-amber-600">{alerts.lowStock.length}</p>
                        <p className="text-xs text-amber-400 font-bold mt-1 uppercase">Sugerencia: Reposición inmediata</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <Card className="border-slate-100 shadow-xl rounded-3xl overflow-hidden">
                    <CardHeader className="bg-slate-50 p-6 flex flex-row justify-between items-center border-b">
                        <CardTitle className="text-xl">Detalle de Alertas Prioritarias</CardTitle>
                        <div className="bg-white p-1 rounded-xl shadow-inner flex">
                            <button className="px-4 py-1.5 rounded-lg text-xs font-bold bg-slate-900 text-white shadow-sm">Todo</button>
                            <button className="px-4 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:text-slate-600">Vencimientos</button>
                            <button className="px-4 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:text-slate-600">Stock</button>
                        </div>
                    </CardHeader>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50">
                                <tr className="border-b">
                                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Prioridad</th>
                                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Producto</th>
                                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Tipo Alerta</th>
                                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Detalle</th>
                                    <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {alerts.near.map((item, i) => (
                                    <tr key={`near-${i}`} className="hover:bg-orange-50/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center font-bold text-orange-600 text-xs shadow-inner">
                                                {i + 1}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-800">{item.nombre}</div>
                                            <div className="text-[10px] text-slate-400 font-mono tracking-tighter">SKU: PROD-{i}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Por Vencer</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-xs font-bold text-orange-600">Quedan {item.dias_restantes} días</p>
                                            <p className="text-[10px] text-slate-400 italic">Vence el {new Date(item.fecha_vencimiento).toLocaleDateString()}</p>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button
                                                size="sm"
                                                className="bg-orange-500 hover:bg-orange-600 text-[10px] font-bold h-8 shadow-lg shadow-orange-200"
                                                onClick={() => navigate('/pos')}
                                            >
                                                REMATE
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                {alerts.lowStock.map((item, i) => (
                                    <tr key={`stock-${i}`} className="hover:bg-amber-50/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center font-bold text-amber-600 text-xs">
                                                {alerts.near.length + i + 1}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-800">{item.nombre}</div>
                                            {item.proveedor_nombre && (
                                                <div className="text-[10px] text-slate-500 font-bold uppercase mt-0.5 flex items-center gap-1">
                                                    <span className="text-brand-500 truncate max-w-[150px]">{item.proveedor_nombre}</span>
                                                    {item.proveedor_telefono && (
                                                        <span className="text-slate-400">· {item.proveedor_telefono}</span>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-[10px] font-black uppercase">Stock Bajo</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <p className="text-xs font-black text-amber-600">Actual: {item.stock} {item.unidad_medida}</p>
                                                <p className="text-[10px] text-slate-400 italic">Mínimo: {item.stock_minimo}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="border-amber-200 text-amber-700 text-[10px] font-bold h-8 hover:bg-amber-500 hover:text-white transition-all"
                                                onClick={() => navigate('/compras')}
                                            >
                                                COMPRAR
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    );
}
