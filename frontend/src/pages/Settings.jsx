import React, { useState, useEffect } from 'react';
import { Save, Globe, Landmark, Building2, CreditCard } from 'lucide-react';
import { Button, Input, Card, CardContent, CardHeader, CardTitle } from '../components/ui';
import { configService } from '../services/api';

export function Settings() {
    const [config, setConfig] = useState({
        moneda_nombre: '',
        moneda_codigo: '',
        moneda_simbolo: '',
        empresa_nombre: '',
        empresa_nit: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        setLoading(true);
        try {
            const response = await configService.getAll();
            setConfig(prev => ({ ...prev, ...response.data }));
        } catch (error) {
            console.error('Error fetching config:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setConfig(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);
        try {
            await configService.update(config);
            setMessage({ type: 'success', text: 'Configuración guardada correctamente' });
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: 'Error al guardar la configuración' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10 text-center">Cargando configuración...</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Configuración Global</h1>
                    <p className="text-slate-500 mt-1 text-lg">Personaliza la identidad visual y financiera de tu sistema.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-brand-50 rounded-2xl border border-brand-100 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                        <span className="text-xs font-bold text-brand-700 uppercase tracking-wider">Sistema Activo</span>
                    </div>
                </div>
            </div>

            {message && (
                <div className={`p-4 rounded-3xl flex items-center gap-3 animate-in slide-in-from-top-2 duration-300 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${message.type === 'success' ? 'bg-emerald-100' : 'bg-red-100'}`}>
                        <Save size={16} />
                    </div>
                    <span className="font-bold">{message.text}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Moneda */}
                    <Card className="border-none shadow-2xl shadow-slate-200/50 bg-white rounded-[2.5rem] overflow-hidden">
                        <div className="h-2 bg-gradient-to-r from-brand-400 to-brand-600" />
                        <CardHeader className="pb-4 pt-8 px-8">
                            <CardTitle className="text-xl flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600">
                                    <Landmark size={24} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-lg font-black text-slate-900">Moneda de Pago</span>
                                    <span className="text-xs text-slate-400 font-medium">Configura el símbolo y nombre local</span>
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 px-8 pb-10">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nombre de la Moneda</label>
                                <Input name="moneda_nombre" value={config.moneda_nombre} onChange={handleChange} placeholder="Ej. Peso Colombiano" className="h-12 rounded-2xl bg-slate-50 border-slate-100 focus:bg-white transition-all text-lg font-medium" />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Código ISO</label>
                                    <Input name="moneda_codigo" value={config.moneda_codigo} onChange={handleChange} placeholder="Ej. COP" className="h-12 rounded-2xl bg-slate-50 border-slate-100 focus:bg-white transition-all text-center font-black tracking-widest uppercase" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Símbolo</label>
                                    <Input name="moneda_simbolo" value={config.moneda_simbolo} onChange={handleChange} placeholder="Ej. $" className="h-12 rounded-2xl bg-emerald-50 border-emerald-100 focus:bg-white transition-all text-center font-black text-emerald-600 text-xl" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Empresa */}
                    <Card className="border-none shadow-2xl shadow-slate-200/50 bg-white rounded-[2.5rem] overflow-hidden">
                        <div className="h-2 bg-gradient-to-r from-blue-400 to-indigo-600" />
                        <CardHeader className="pb-4 pt-8 px-8">
                            <CardTitle className="text-xl flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                                    <Building2 size={24} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-lg font-black text-slate-900">Información Legal</span>
                                    <span className="text-xs text-slate-400 font-medium">Datos del establecimiento</span>
                                </div>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 px-8 pb-10">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nombre Comercial</label>
                                <Input name="empresa_nombre" value={config.empresa_nombre} onChange={handleChange} placeholder="Ej. Mi Tienda S.A.S." className="h-12 rounded-2xl bg-slate-50 border-slate-100 focus:bg-white transition-all text-lg font-medium" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">NIT / Identificación Fiscal</label>
                                <Input name="empresa_nit" value={config.empresa_nit} onChange={handleChange} placeholder="Ej. 900.123.456-7" className="h-12 rounded-2xl bg-slate-50 border-slate-100 focus:bg-white transition-all font-mono" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={saving} className="bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white min-w-[240px] h-14 rounded-[1.5rem] shadow-2xl shadow-brand-500/40 gap-3 text-lg font-bold transition-all hover:scale-105 active:scale-95 group">
                        <Save className={`transition-transform duration-300 ${saving ? 'animate-spin' : 'group-hover:rotate-12'}`} size={22} />
                        {saving ? 'Guardando cambios...' : 'Guardar Todo'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
