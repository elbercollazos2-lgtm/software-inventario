import React, { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, ArrowRight, Loader2, Save, Trash2, User, Search, Plus } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, CardFooter, Input } from '../components/ui';
import axios from 'axios';
import { formatCurrency } from '../lib/utils';
import { inventarioService, proveedoresService } from '../services/api';

export function InvoiceUpload() {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [extractedData, setExtractedData] = useState([]);
    const [providerData, setProviderData] = useState({ name: '', id: null });
    const [allProviders, setAllProviders] = useState([]);
    const [status, setStatus] = useState('idle'); // idle, processing, verifying, success, error
    const [newProvider, setNewProvider] = useState({ nombre: '', nit: '' });
    const [showNewProviderModal, setShowNewProviderModal] = useState(false);

    const fetchProviders = async () => {
        try {
            const response = await proveedoresService.getAll();
            setAllProviders(response.data);
        } catch (error) {
            console.error('Error loading providers:', error);
        }
    };

    useEffect(() => {
        fetchProviders();
    }, []);

    const handleCreateProvider = async () => {
        try {
            const response = await proveedoresService.create(newProvider);
            const created = response.data;
            setAllProviders([...allProviders, created]);
            setProviderData({ name: created.nombre, id: created.id });
            setShowNewProviderModal(false);
            setNewProvider({ nombre: '', nit: '' });
        } catch (error) {
            alert("Error creando proveedor");
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setFile(e.target.files[0]);
            setStatus('idle');
            setExtractedData([]);
            setProviderData({ name: '', id: null });
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);
        setStatus('processing');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('http://localhost:5001/process', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const rawItems = response.data.items || [];

            // Try to match provider by NIT first, then by name
            const extractedProviderName = response.data.provider || '';
            const extractedNit = response.data.provider_nit || '';

            setNewProvider({ nombre: extractedProviderName, nit: extractedNit });

            const matchedProvider = allProviders.find(p => {
                const nitDB = (p.nit || '').replace(/[^0-9]/g, '');
                const nitExtracted = extractedNit.replace(/[^0-9]/g, '');
                if (nitExtracted && nitDB === nitExtracted) return true;

                return p.nombre.toLowerCase().includes(extractedProviderName.toLowerCase().trim());
            });

            setProviderData({
                name: extractedProviderName || 'Proveedor no identificado',
                id: matchedProvider ? matchedProvider.id : null
            });

            // Validate batch against backend
            const validationResponse = await inventarioService.validateBatch(rawItems.map(item => ({ ...item, iva: 19 })));
            setExtractedData(validationResponse.data);
            setStatus('verifying');
        } catch (error) {
            console.error('Error processing PDF:', error.response?.data || error.message);
            setStatus('error');
        } finally {
            setLoading(false);
        }
    };

    const handleItemChange = (index, field, value) => {
        const newData = [...extractedData];
        newData[index] = { ...newData[index], [field]: value };
        setExtractedData(newData);
    };

    const removeItem = (index) => {
        setExtractedData(extractedData.filter((_, i) => i !== index));
    };

    const addNewItem = () => {
        const newItem = {
            sku: `MANUAL-${Date.now().toString().slice(-4)}`,
            description: '',
            qty: 1,
            cost: 0,
            iva: 19,
            status: 'new',
            exists: false
        };
        setExtractedData([...extractedData, newItem]);
    };

    const handleConfirm = async () => {
        if (extractedData.length === 0) return;
        setLoading(true);
        try {
            const mappedData = extractedData.map(item => ({
                codigo_barras: item.sku,
                nombre: item.description,
                cantidad: parseFloat(item.qty),
                precio_compra: parseFloat(item.cost),
                iva: parseFloat(item.iva || 0),
                proveedor_id: providerData.id
            }));

            await inventarioService.batchUpload(mappedData);
            alert('Inventario actualizado con éxito');
            setExtractedData([]);
            setStatus('idle');
            setFile(null);
            setProviderData({ name: '', id: null });
        } catch (error) {
            console.error('Error importing data:', error);
            alert('Error al importar productos al inventario');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Gestión de Stock - Importación</h1>
                <p className="text-slate-500">Verifica y corrige los datos de la factura antes de procesar el inventario.</p>
            </div>

            {status !== 'verifying' && (
                <Card className={`border-2 border-dashed transition-colors ${file ? 'border-brand-500 bg-brand-50/30' : 'border-slate-300'}`}>
                    <CardContent className="p-12">
                        <div className="flex flex-col items-center justify-center text-center">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${file ? 'bg-brand-100 text-brand-600' : 'bg-slate-100 text-slate-400'}`}>
                                {status === 'processing' ? <Loader2 className="animate-spin" size={32} /> : <Upload size={32} />}
                            </div>

                            {!file ? (
                                <>
                                    <p className="text-lg font-medium text-slate-900">Suelta aquí la factura PDF</p>
                                    <p className="text-sm text-slate-500 mt-1">Soporta facturas estándar de proveedores</p>
                                    <input type="file" className="hidden" id="file-upload" accept=".pdf" onChange={handleFileChange} />
                                    <Button variant="secondary" className="mt-6" onClick={() => document.getElementById('file-upload').click()}>
                                        Seleccionar Archivo
                                    </Button>
                                </>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 bg-white p-3 rounded-lg border shadow-sm">
                                        <FileText className="text-brand-500" />
                                        <div className="text-left pr-8">
                                            <p className="font-semibold text-slate-900">{file.name}</p>
                                            <p className="text-xs text-slate-500">Totalmente cargado</p>
                                        </div>
                                    </div>
                                    {status === 'idle' && (
                                        <div className="flex gap-2 justify-center">
                                            <Button onClick={handleUpload} className="gap-2" disabled={loading}>
                                                {loading ? 'Procesando...' : 'Iniciar Extracción'}
                                                <ArrowRight size={18} />
                                            </Button>
                                            <Button variant="ghost" onClick={() => setFile(null)}>Cancelar</Button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {status === 'verifying' && (
                <div className="space-y-6 animate-in fade-in duration-500">
                    {/* Header de Verificación del Proveedor */}
                    <Card className="border-brand-100 bg-brand-50/30">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2 text-brand-700">
                                <User size={20} />
                                <CardTitle className="text-lg">Información del Proveedor</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Nombre extraído</label>
                                    <Input
                                        value={providerData.name}
                                        onChange={(e) => setProviderData({ ...providerData, name: e.target.value })}
                                        className="bg-white"
                                    />
                                </div>
                                <div className="space-y-1.5 flex flex-col">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Vincular a Proveedor Registrado</label>
                                    <div className="flex gap-2">
                                        <select
                                            className="flex-1 h-10 px-3 py-2 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                                            value={providerData.id || ''}
                                            onChange={(e) => setProviderData({ ...providerData, id: e.target.value })}
                                        >
                                            <option value="">-- Seleccionar Proveedor --</option>
                                            {allProviders.map(p => (
                                                <option key={p.id} value={p.id}>{p.nombre} ({p.nit || 'Sin NIT'})</option>
                                            ))}
                                        </select>
                                        <Button variant="outline" size="sm" onClick={() => setShowNewProviderModal(true)}>
                                            <Plus size={16} className="mr-1" /> Nuevo
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tabla de Productos Editable */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between border-b">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 text-emerald-700">
                                    <CheckCircle size={20} />
                                    <CardTitle>Validación de Productos</CardTitle>
                                </div>
                                <Button variant="outline" size="sm" onClick={addNewItem} className="text-emerald-700 border-emerald-200 hover:bg-emerald-50">
                                    <Plus size={16} className="mr-1" /> Añadir Fila
                                </Button>
                            </div>
                            <p className="text-sm text-slate-500">Total items: {extractedData.length}</p>
                        </CardHeader>
                        <CardContent className="p-0 overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-semibold">
                                    <tr>
                                        <th className="px-5 py-4 text-left font-bold">ESTADO</th>
                                        <th className="px-5 py-4 text-left font-bold">SKU / PRODUCTO</th>
                                        <th className="px-5 py-4 text-center font-bold w-24">CANT.</th>
                                        <th className="px-5 py-4 text-right font-bold w-36">COSTO UNIT.</th>
                                        <th className="px-5 py-4 text-center font-bold w-24">IVA %</th>
                                        <th className="px-5 py-4 text-right font-bold w-36">TOTAL</th>
                                        <th className="px-5 py-4 text-center font-bold w-16">ACCIONES</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {extractedData.map((item, idx) => (
                                        <tr key={idx} className={`hover:bg-slate-50/50 ${item.status === 'new' ? 'bg-amber-50/20' : ''}`}>
                                            <td className="px-5 py-4">
                                                {item.status === 'new' ? (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
                                                        Nuevo
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                        Existente
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex flex-col gap-0.5">
                                                    <input
                                                        value={item.description}
                                                        onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                                                        className="w-full text-sm font-semibold text-slate-700 bg-transparent border-none p-0 focus:ring-0 focus:outline-none hover:text-brand-600 transition-colors uppercase cursor-edit"
                                                        placeholder="Descripción del producto"
                                                    />
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">SKU:</span>
                                                        <input
                                                            value={item.sku}
                                                            onChange={(e) => handleItemChange(idx, 'sku', e.target.value)}
                                                            className="text-[10px] text-slate-400 font-mono bg-transparent border-none p-0 focus:ring-0 focus:outline-none h-4 w-full"
                                                            placeholder="Código de barras"
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex justify-center">
                                                    <input
                                                        type="number"
                                                        value={item.qty}
                                                        onChange={(e) => handleItemChange(idx, 'qty', e.target.value)}
                                                        className="w-16 h-10 text-center border rounded-md focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center justify-end gap-1.5 bg-slate-50 border rounded-md px-3 h-10 w-32 ml-auto">
                                                    <span className="text-slate-400 font-medium">$</span>
                                                    <input
                                                        type="number"
                                                        value={item.cost}
                                                        onChange={(e) => handleItemChange(idx, 'cost', e.target.value)}
                                                        className="w-full text-right bg-transparent border-none outline-none focus:ring-0 p-0 text-slate-700 font-semibold"
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex justify-center">
                                                    <input
                                                        type="number"
                                                        value={item.iva}
                                                        onChange={(e) => handleItemChange(idx, 'iva', e.target.value)}
                                                        className="w-16 h-10 text-center border rounded-md focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <span className="text-lg font-bold text-slate-900 tabular-nums">
                                                    {formatCurrency(parseFloat(item.qty || 0) * parseFloat(item.cost || 0) * (1 + (parseFloat(item.iva || 0) / 100)))}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-center">
                                                <button
                                                    onClick={() => removeItem(idx)}
                                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </CardContent>
                        <CardFooter className="p-8 bg-slate-50 justify-between items-center border-t">
                            <div className="flex gap-12">
                                <div className="flex flex-col">
                                    <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1">Total Factura (Sin IVA)</span>
                                    <span className="text-xl font-bold text-slate-700 tabular-nums">
                                        {formatCurrency(extractedData.reduce((acc, curr) => acc + (parseFloat(curr.qty || 0) * parseFloat(curr.cost || 0)), 0))}
                                    </span>
                                </div>
                                <div className="flex flex-col border-l pl-12 border-slate-200">
                                    <span className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1">Total IVA</span>
                                    <span className="text-xl font-bold text-slate-700 tabular-nums">
                                        {formatCurrency(extractedData.reduce((acc, curr) => {
                                            const sub = parseFloat(curr.qty || 0) * parseFloat(curr.cost || 0);
                                            const iva = sub * (parseFloat(curr.iva || 0) / 100);
                                            return acc + iva;
                                        }, 0))}
                                    </span>
                                </div>
                                <div className="flex flex-col border-l pl-12 border-slate-200">
                                    <span className="text-brand-600 text-[10px] uppercase font-bold tracking-widest mb-1">Total Factura (Con IVA)</span>
                                    <span className="text-3xl font-black text-slate-900 tabular-nums">
                                        {formatCurrency(extractedData.reduce((acc, curr) => {
                                            const sub = parseFloat(curr.qty || 0) * parseFloat(curr.cost || 0);
                                            return acc + (sub * (1 + (parseFloat(curr.iva || 0) / 100)));
                                        }, 0))}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <Button variant="outline" onClick={() => setStatus('idle')}>Descartar</Button>
                                <Button
                                    className="bg-emerald-600 hover:bg-emerald-700 gap-2 h-11 px-8 shadow-lg shadow-emerald-500/20"
                                    onClick={handleConfirm}
                                    disabled={loading || !providerData.id}
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                                    Finalizar y Cargar Stock
                                </Button>
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            )}

            {status === 'error' && (
                <Card className="border-red-200 bg-red-50">
                    <CardContent className="p-6 text-center">
                        <AlertCircle className="text-red-500 mx-auto mb-2" size={32} />
                        <h3 className="text-red-800 font-bold text-lg">Error en el flujo de trabajo</h3>
                        <p className="text-red-700">No pudimos completar la validación. Por favor intenta cargar el archivo nuevamente.</p>
                        <Button variant="danger" className="mt-4" onClick={() => setStatus('idle')}>Reintentar</Button>
                    </CardContent>
                </Card>
            )}

            {showNewProviderModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <Card className="w-full max-w-md p-6">
                        <h2 className="text-xl font-bold mb-4">Registrar Nuevo Proveedor</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1 text-slate-500 uppercase text-[10px]">Nombre del Proveedor</label>
                                <Input
                                    value={newProvider.nombre}
                                    onChange={(e) => setNewProvider({ ...newProvider, nombre: e.target.value })}
                                    placeholder="Ej: HYN DISTRIBUIDORA SAS"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1 text-slate-500 uppercase text-[10px]">NIT</label>
                                <Input
                                    value={newProvider.nit}
                                    onChange={(e) => setNewProvider({ ...newProvider, nit: e.target.value })}
                                    placeholder="Ej: 901411763-3"
                                />
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <Button variant="ghost" onClick={() => setShowNewProviderModal(false)}>Cancelar</Button>
                                <Button className="bg-brand-600 hover:bg-brand-700 text-white" onClick={handleCreateProvider}>Guardar Proveedor</Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}

