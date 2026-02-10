import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Factory, Phone, Mail, MapPin } from 'lucide-react';
import { Button, Input, Card, CardContent, CardHeader, CardTitle } from '../components/ui';
import { proveedoresService } from '../services/api';

export function Providers() {
    const [proveedores, setProveedores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentProveedor, setCurrentProveedor] = useState(null);

    useEffect(() => {
        fetchProveedores();
    }, []);

    const fetchProveedores = async () => {
        setLoading(true);
        try {
            const response = await proveedoresService.getAll();
            setProveedores(response.data || []);
        } catch (error) {
            console.error('Error fetching proveedores:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (proveedor = null) => {
        setCurrentProveedor(proveedor);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentProveedor(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        try {
            if (currentProveedor) {
                await proveedoresService.update(currentProveedor.id, data);
            } else {
                await proveedoresService.create(data);
            }
            fetchProveedores();
            handleCloseModal();
        } catch (error) {
            console.error('Error saving proveedor:', error);
            alert('Error al guardar proveedor: ' + (error.response?.data?.details || error.response?.data?.error || error.message));
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este proveedor?')) return;
        try {
            await proveedoresService.delete(id);
            fetchProveedores();
        } catch (error) {
            alert('Error al eliminar proveedor');
        }
    };

    const filtered = proveedores.filter(p =>
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.contacto?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Gestión de Proveedores</h1>
                    <p className="text-slate-500 mt-1">Administra tus proveedores y contactos comerciales.</p>
                </div>
                <Button onClick={() => handleOpenModal()} className="gap-2 bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-900/20">
                    <Plus size={18} />
                    Nuevo Proveedor
                </Button>
            </div>

            <Card className="p-4 bg-slate-50 border-slate-200">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <Input
                        placeholder="Buscar por nombre o contacto..."
                        className="pl-12"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full text-center py-10">Cargando proveedores...</div>
                ) : filtered.length === 0 ? (
                    <div className="col-span-full text-center py-10 text-slate-400">No se encontraron proveedores.</div>
                ) : filtered.map(p => (
                    <Card key={p.id} className="hover:shadow-md transition-shadow duration-200 group border-slate-200">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
                                    <Factory size={20} />
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleOpenModal(p)}
                                        className="h-11 w-11 p-0 bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200 rounded-xl shadow-sm flex items-center justify-center"
                                        title="Editar"
                                    >
                                        <Edit2 size={28} strokeWidth={2.5} />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(p.id)}
                                        className="h-11 w-11 p-0 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-xl shadow-sm flex items-center justify-center"
                                        title="Eliminar"
                                    >
                                        <Trash2 size={28} strokeWidth={2.5} />
                                    </Button>
                                </div>
                            </div>
                            <CardTitle className="mt-4 text-lg">{p.nombre}</CardTitle>
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-slate-500 font-medium">{p.contacto || 'Sin contacto'}</p>
                                {p.nit && <span className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-500 uppercase italic">NIT: {p.nit}</span>}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3 pt-2">
                            {p.telefono && (
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Phone size={14} className="text-slate-400" />
                                    {p.telefono}
                                </div>
                            )}
                            {p.email && (
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <Mail size={14} className="text-slate-400" />
                                    {p.email}
                                </div>
                            )}
                            {p.direccion && (
                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                    <MapPin size={14} className="text-slate-400" />
                                    {p.direccion}
                                </div>
                            )}
                            {p.notas && (
                                <div className="mt-3 pt-3 border-t border-slate-100">
                                    <p className="text-[10px] font-black uppercase text-slate-400 mb-1 tracking-widest">Contactos / Notas</p>
                                    <p className="text-xs text-slate-600 whitespace-pre-line bg-slate-50 p-2 rounded-lg italic">
                                        {p.notas}
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
                        <CardHeader>
                            <CardTitle>{currentProveedor ? 'Editar Proveedor' : 'Nuevo Proveedor'}</CardTitle>
                        </CardHeader>
                        <form onSubmit={handleSubmit} key={currentProveedor?.id || 'new'}>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Nombre de la Empresa</label>
                                        <Input name="nombre" defaultValue={currentProveedor?.nombre} required placeholder="Ej. Alquería S.A." />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">NIT</label>
                                        <Input name="nit" defaultValue={currentProveedor?.nit} placeholder="Ej. 123456789-0" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Persona de Contacto</label>
                                    <Input name="contacto" defaultValue={currentProveedor?.contacto} placeholder="Ej. Juan Pérez" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Teléfono</label>
                                        <Input name="telefono" defaultValue={currentProveedor?.telefono} placeholder="Ej. 300 123 4567" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700">Email</label>
                                        <Input name="email" type="email" defaultValue={currentProveedor?.email} placeholder="ejemplo@correo.com" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Dirección</label>
                                    <Input name="direccion" defaultValue={currentProveedor?.direccion} placeholder="Calle 123 #45-67" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Notas / Otros Contactos</label>
                                    <textarea
                                        name="notas"
                                        defaultValue={currentProveedor?.notas}
                                        placeholder="Ej. Vendedor: Carlos (312...), Cobrador: Maria..."
                                        className="w-full min-h-[80px] rounded-xl bg-slate-50 border-none p-4 text-sm focus:ring-2 focus:ring-brand-500 shadow-inner"
                                    ></textarea>
                                </div>
                            </CardContent>
                            <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
                                <Button type="button" variant="outline" onClick={handleCloseModal}>Cancelar</Button>
                                <Button type="submit" className="bg-brand-600 hover:bg-brand-700">
                                    {currentProveedor ? 'Actualizar' : 'Guardar'} Proveedor
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
}
