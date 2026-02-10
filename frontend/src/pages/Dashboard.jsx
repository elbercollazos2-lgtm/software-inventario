import React, { useState, useEffect } from 'react';
import {
    Package, DollarSign, Users, TrendingUp, ArrowUpRight, ArrowDownRight,
    Clock, PieChart as PieChartIcon, BarChart3, Wallet, BrainCircuit, TrendingDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { dashboardService } from '../services/api';
import { formatCurrency } from '../lib/utils';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Cell, PieChart, Pie, Legend
} from 'recharts';

export function Dashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        fetchStats();
    }, []);

    // Esperar a que los datos carguen Y el layout esté listo antes de renderizar gráficos
    useEffect(() => {
        if (!loading && stats) {
            const timer = setTimeout(() => {
                setIsMounted(true);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [loading, stats]);

    const fetchStats = async () => {
        try {
            const response = await dashboardService.getStats();
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse p-6">
                <div className="h-10 w-48 bg-slate-200 rounded-xl mb-8"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-40 bg-slate-100 rounded-2xl"></div>
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="col-span-2 h-96 bg-slate-100 rounded-3xl"></div>
                    <div className="h-96 bg-slate-100 rounded-3xl"></div>
                </div>
            </div>
        );
    }

    const financialCards = [
        {
            title: 'Ventas del Mes',
            value: formatCurrency(stats?.stats?.monthlySales || 0),
            description: 'Ingresos brutos actuales',
            icon: DollarSign,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            trend: stats?.stats?.growth || '+0%',
            trendUp: true
        },
        {
            title: 'Ganancia del Mes',
            value: formatCurrency(stats?.stats?.monthlyProfit || 0),
            description: 'Utilidad neta (Inc. IVA)',
            icon: TrendingUp,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
            trend: 'Recurrente',
            trendUp: true
        },
        {
            title: 'Inversión Total',
            value: formatCurrency(stats?.stats?.totalInvestment || 0),
            description: 'Valor inventario (Costo + IVA)',
            icon: Wallet,
            color: 'text-brand-600',
            bg: 'bg-brand-50',
            trend: 'Activo Fijo',
            trendUp: true
        },
        {
            title: 'Uti. Proyectada',
            value: formatCurrency(stats?.stats?.potentialProfit || 0),
            description: 'Utilidad estimada (Inc. IVA)',
            icon: BrainCircuit,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
            trend: 'Potencial',
            trendUp: true
        }
    ];

    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    return (
        <div className="p-2 space-y-8">
            {/* Encabezado */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/50 backdrop-blur-md p-8 rounded-3xl border border-white/40 shadow-sm">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">CENTRAL DE INTELIGENCIA</h1>
                    <p className="text-slate-500 font-medium mt-1">Análisis profundo de rentabilidad e inventario</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right hidden md:block">
                        <p className="text-xs font-black uppercase text-slate-400 tracking-widest">Estatus Sistema</p>
                        <p className="text-emerald-600 font-bold flex items-center justify-end gap-2">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                            </span>
                            OPERATIVO
                        </p>
                    </div>
                </div>
            </div>

            {/* Tarjetas Financieras */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {financialCards.map((card, idx) => (
                    <Card key={idx} className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                        <CardContent className="p-0">
                            <div className={`p-6 ${card.bg} transition-colors duration-300 h-full`}>
                                <div className="flex items-center justify-between mb-6">
                                    <div className={`p-3.5 rounded-2xl bg-white shadow-sm ${card.color}`}>
                                        <card.icon size={24} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest bg-white/60 px-2 py-1 rounded-full text-slate-500 border border-white/50">
                                        {card.trend}
                                    </span>
                                </div>
                                <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-1">{card.title}</h3>
                                <p className={`text-2xl lg:text-3xl font-black ${card.color} tracking-tight`}>{card.value}</p>
                                <p className="text-[11px] text-slate-500 font-medium mt-2 opacity-80">{card.description}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Gráficos y Análisis */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Gráfico de Inversión por Categoría */}
                <Card className="lg:col-span-2 border-none shadow-xl shadow-slate-200/40 rounded-3xl overflow-hidden bg-white/80 backdrop-blur">
                    <CardHeader className="p-8 border-b border-slate-50">
                        <CardTitle className="text-xl font-bold flex items-center gap-3 text-slate-800">
                            <BarChart3 className="text-brand-600" />
                            Distribución de Inversión
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        {isMounted && (
                            <div className="w-full h-[400px] min-h-[400px]" style={{ width: '100%', height: 400 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats?.investmentByCategory || []} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis
                                            dataKey="categoria"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 600 }}
                                            tickFormatter={(value) => `$${value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value}`}
                                        />
                                        <Tooltip
                                            cursor={{ fill: '#f8fafc' }}
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 600 }}
                                            formatter={(value) => formatCurrency(value)}
                                        />
                                        <Bar dataKey="inversion" radius={[8, 8, 0, 0]} maxBarSize={60}>
                                            {(stats?.investmentByCategory || []).map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Resumen de Eficiencia / Profit Pie Chart */}
                <Card className="border-none shadow-xl shadow-slate-200/40 rounded-3xl overflow-hidden bg-white/80 backdrop-blur">
                    <CardHeader className="p-8 border-b border-slate-50">
                        <CardTitle className="text-xl font-bold flex items-center gap-3 text-slate-800">
                            <BrainCircuit className="text-purple-600" />
                            Estructura de Valor
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        {isMounted && (
                            <div className="w-full h-[250px] min-h-[250px]" style={{ width: '100%', height: 250 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: 'Inversión', value: stats?.stats?.totalInvestment || 0 },
                                                { name: 'Utilidad Esperada', value: stats?.stats?.potentialProfit || 0 }
                                            ]}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={8}
                                            dataKey="value"
                                        >
                                            <Cell fill="#a5b4fc" /> {/* Indigo-300 */}
                                            <Cell fill="#10b981" />
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                            formatter={(value) => formatCurrency(value)}
                                        />
                                        <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        )}

                        <div className="mt-8">
                            <div className="flex items-center justify-between p-5 bg-gradient-to-r from-slate-50 to-white rounded-2xl border border-slate-100">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">ROI Proyectado</span>
                                <span className="text-2xl font-black text-brand-600">
                                    {stats?.stats?.totalInvestment > 0
                                        ? ((stats?.stats?.potentialProfit / stats?.stats?.totalInvestment) * 100).toFixed(1)
                                        : 0}%
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Actividad Reciente */}
                <Card className="border-none shadow-xl shadow-slate-200/40 rounded-3xl overflow-hidden bg-white/80 backdrop-blur">
                    <CardHeader className="p-8 border-b border-slate-50">
                        <CardTitle className="text-xl font-bold flex items-center gap-3 text-slate-800">
                            <Clock className="text-brand-500" />
                            Últimas Transacciones
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                        <div className="space-y-4">
                            {stats?.recentSales.length === 0 ? (
                                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                    <p className="text-slate-400 font-medium">Sin movimientos recientes</p>
                                </div>
                            ) : (
                                stats?.recentSales.map((sale) => (
                                    <div key={sale.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-100 hover:border-brand-200 hover:shadow-md transition-all group">
                                        <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 group-hover:bg-brand-600 group-hover:text-white transition-all">
                                            <DollarSign size={20} />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-slate-900 leading-tight">Venta #{sale.id}</p>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mt-1">
                                                {new Date(sale.fecha).toLocaleDateString()} · {new Date(sale.fecha).toLocaleTimeString()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-emerald-600 text-lg tracking-tight">{formatCurrency(sale.total)}</p>
                                            <div className="flex items-center justify-end gap-1 mt-0.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">Confirmado</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Control de Riesgos */}
                <Card className="border-none shadow-xl shadow-slate-200/40 rounded-3xl overflow-hidden bg-white/80 backdrop-blur">
                    <CardHeader className="p-8 border-b border-slate-50 bg-gradient-to-r from-orange-50 to-white">
                        <CardTitle className="text-xl font-bold flex items-center gap-3 text-orange-800">
                            <BrainCircuit className="text-orange-600" />
                            Control de Stock
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 h-full">
                            <div className="p-8 space-y-6">
                                <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2 mb-2">
                                    <TrendingDown size={14} className="text-red-500" /> NIVEL CRÍTICO
                                </h3>
                                {stats?.alerts?.lowStock.length === 0 ? (
                                    <div className="p-6 text-center bg-emerald-50 rounded-2xl border border-emerald-100">
                                        <p className="text-xs font-bold text-emerald-700 uppercase">Inventario Saludable</p>
                                    </div>
                                ) : (
                                    stats?.alerts?.lowStock.map((item, i) => (
                                        <div key={i} className="space-y-1.5">
                                            <div className="flex justify-between text-xs font-bold">
                                                <span className="truncate w-32 text-slate-700">{item.nombre}</span>
                                                <span className="text-red-600 bg-red-50 px-1.5 py-0.5 rounded ml-2 whitespace-nowrap">{item.stock} {item.unidad_medida}</span>
                                            </div>
                                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-red-500 rounded-full transition-all duration-500"
                                                    style={{ width: `${Math.max(10, (item.stock / item.stock_minimo) * 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="p-8 space-y-6">
                                <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] flex items-center gap-2 mb-2">
                                    <Clock size={14} className="text-orange-500" /> CADUCIDAD PRÓXIMA
                                </h3>
                                {stats?.alerts?.expiringSoon.length === 0 ? (
                                    <div className="p-6 text-center bg-emerald-50 rounded-2xl border border-emerald-100">
                                        <p className="text-xs font-bold text-emerald-700 uppercase">Sin Vencimientos</p>
                                    </div>
                                ) : (
                                    stats?.alerts?.expiringSoon.map((item, i) => (
                                        <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-orange-50 border border-orange-100/50 hover:bg-orange-50/80 transition-colors">
                                            <div className="w-9 h-9 shrink-0 rounded-xl bg-white flex items-center justify-center text-orange-600 font-black text-xs shadow-sm">
                                                {item.dias_restantes}d
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-slate-800 truncate leading-tight">{item.nombre}</p>
                                                <p className="text-[10px] text-orange-600 font-bold uppercase mt-0.5">Exp: {new Date(item.fecha_vencimiento).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
