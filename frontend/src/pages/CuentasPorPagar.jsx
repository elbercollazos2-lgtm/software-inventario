import React, { useState, useEffect } from 'react';
import { Wallet, Users, AlertCircle, ArrowUpRight, FileText, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '../components/ui';
import { comprasService } from '../services/api';
import { formatCurrency } from '../lib/utils';

export function CuentasPorPagar() {
    const [stats, setStats] = useState({ proveedores: [], deuda_global: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDebts();
    }, []);

    const fetchDebts = async () => {
        setLoading(true);
        try {
            const response = await comprasService.getDebts();
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching debts:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-10 text-center text-slate-400">Cargando estado de cuenta...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Encabezado */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight italic uppercase">Cuentas por Pagar</h1>
                    <p className="text-slate-500 font-medium mt-1 text-sm">Control de deudas y compromisos con proveedores</p>
                </div>
                <div className="bg-red-50 px-8 py-4 rounded-[2rem] border border-red-100 flex items-center gap-4">
                    <div className="bg-red-500 p-3 rounded-2xl text-white shadow-lg shadow-red-200">
                        <TrendingDown size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-red-400 tracking-widest">Deuda Total Global</p>
                        <p className="text-3xl font-black text-red-600 tracking-tighter">{formatCurrency(stats.deuda_global)}</p>
                    </div>
                </div>
            </div>

            {/* Grid de Proveedores */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {stats.proveedores.length === 0 ? (
                    <Card className="col-span-2 p-20 text-center border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem]">
                        <div className="flex flex-col items-center">
                            <div className="bg-emerald-50 p-6 rounded-full text-emerald-500 mb-4 text-4xl">🎉</div>
                            <h2 className="text-xl font-bold text-slate-800">¡Sin Deudas Pendientes!</h2>
                            <p className="text-slate-400 text-sm mt-2">No tienes facturas con saldo pendiente actualmente.</p>
                        </div>
                    </Card>
                ) : (
                    stats.proveedores.map((p) => (
                        <Card key={p.proveedor_id} className="border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden group hover:-translate-y-1 transition-all duration-300">
                            <CardHeader className="bg-slate-50/50 p-8 border-b border-slate-50">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-brand-600">
                                            <Users size={24} />
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl font-black text-slate-900 tracking-tight">{p.proveedor_nombre}</CardTitle>
                                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{p.facturas_pendientes} Facturas Pendientes</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black uppercase text-red-400 tracking-widest">Saldo Pendiente</p>
                                        <p className="text-2xl font-black text-red-600 tracking-tight">{formatCurrency(p.saldo_pendiente)}</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-8">
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="p-4 rounded-3xl bg-slate-50 border border-slate-100">
                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Total Compras</p>
                                        <p className="text-lg font-bold text-slate-700">{formatCurrency(p.total_compras)}</p>
                                    </div>
                                    <div className="p-4 rounded-3xl bg-emerald-50 border border-emerald-100">
                                        <p className="text-[10px] font-black uppercase text-emerald-400 tracking-widest">Total Pagado</p>
                                        <p className="text-lg font-bold text-emerald-600">{formatCurrency(p.total_pagado)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between group-hover:bg-slate-50 transition-colors p-4 rounded-3xl border border-transparent hover:border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="h-2 w-2 rounded-full bg-red-400 animate-pulse"></div>
                                        <span className="text-xs font-bold text-slate-500 uppercase">Requiere gestión</span>
                                    </div>
                                    <Button variant="ghost" className="gap-2 font-black uppercase text-[10px] tracking-widest text-brand-600 group-hover:bg-white shadow-none">
                                        Ver Facturas <ArrowUpRight size={14} />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Consejos de Liquidez */}
            <Card className="bg-brand-600 border-none shadow-2xl rounded-[3rem] p-10 text-white relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="bg-white/20 p-6 rounded-full backdrop-blur-md">
                        <AlertCircle size={48} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black tracking-tight italic italic">CONSEJO DE LIQUIDEZ</h2>
                        <p className="text-brand-100 font-medium max-w-2xl mt-2 leading-relaxed">
                            Mantener un buen historial con tus proveedores te permite acceder a mejores plazos de pago.
                            Actualmente tu deuda representa el <span className="text-white font-black underline">
                                {stats.deuda_global > 0 ? ((stats.deuda_global / 1000000) * 100).toFixed(1) : 0}%
                            </span> de tu flujo proyectado.
                        </p>
                    </div>
                </div>
                {/* Decoración Fondo */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-400/20 rounded-full -ml-10 -mb-10 blur-2xl text-6xl flex items-center justify-center p-10 opacity-20">💰</div>
            </Card>
        </div>
    );
}
