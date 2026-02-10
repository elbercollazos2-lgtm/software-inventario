import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Warehouse, MapPin, Activity } from 'lucide-react';
import { Button, Input, Card, CardContent, CardHeader, CardTitle } from '../components/ui';
import { bodegasService } from '../services/api';

export function Bodegas() {
    const [bodegas, setBodegas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentBodega, setCurrentBodega] = useState(null);

    useEffect(() => {
        fetchBodegas();
    }, []);

    const fetchBodegas = async () => {
        setLoading(true);
        try {
            const response = await bodegasService.getAll();
            setBodegas(response.data);
        } catch (error) {
            console.error('Error fetching bodegas:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (bodega = null) => {
        setCurrentBodega(bodega);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        try {
            if (currentBodega) {
                await bodegasService.update(currentBodega.id, data);
            } else {
                await bodegasService.create(data);
            }
            setIsModalOpen(false);
            setCurrentBodega(null);
            fetchBodegas();
        } catch (error) {
            console.error('Error saving bodega:', error);
            alert('Error al guardar bodega');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar esta bodega?')) return;
        try {
            await bodegasService.delete(id);
            fetchBodegas();
        } catch (error) {
            console.error('Error deleting bodega:', error);
            alert('Error al eliminar bodega');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Gestión de Bodegas</h1>
                    <p className="text-slate-500 mt-1">Organiza tus ubicaciones físicas y virtuales.</p>
                </div>
                <Button onClick={() => handleOpenModal()} className="gap-2">
                    <Plus size={18} />
                    Nueva Bodega
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <p>Cargando bodegas...</p>
                ) : (
                    bodegas.map((bodega) => (
                        <Card key={bodega.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    <Warehouse size={20} className="text-brand-500" />
                                    {bodega.nombre}
                                </CardTitle>
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleOpenModal(bodega)}
                                        className="h-11 w-11 p-0 bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200 rounded-xl shadow-sm flex items-center justify-center"
                                        title="Editar"
                                    >
                                        <Edit2 size={28} strokeWidth={2.5} />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(bodega.id)}
                                        className="h-11 w-11 p-0 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-xl shadow-sm flex items-center justify-center"
                                        title="Eliminar"
                                    >
                                        <Trash2 size={28} strokeWidth={2.5} />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-sm text-slate-500">
                                        <MapPin size={14} />
                                        {bodega.ubicacion || 'Sin ubicación'}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Activity size={14} className={bodega.activo ? 'text-emerald-500' : 'text-slate-400'} />
                                        <span className={bodega.activo ? 'text-emerald-700 font-medium' : 'text-slate-400'}>
                                            {bodega.activo ? 'Operativa' : 'Inactiva'}
                                        </span>
                                        {bodega.es_virtual === 1 && (
                                            <span className="ml-auto px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] rounded-full uppercase font-bold">
                                                Virtual
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <Card className="w-full max-w-md animate-in zoom-in-95 duration-200">
                        <CardHeader>
                            <CardTitle>{currentBodega ? 'Editar Bodega' : 'Nueva Bodega'}</CardTitle>
                        </CardHeader>
                        <form onSubmit={handleSubmit}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold">Nombre</label>
                                    <Input name="nombre" defaultValue={currentBodega?.nombre} required placeholder="Ej. Bodega Norte" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold">Ubicación</label>
                                    <Input name="ubicacion" defaultValue={currentBodega?.ubicacion} placeholder="Dirección o referencia" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <input type="checkbox" name="es_virtual" defaultChecked={currentBodega?.es_virtual === 1} id="is_virtual" />
                                    <label htmlFor="is_virtual" className="text-sm">¿Es una bodega virtual?</label>
                                </div>
                            </CardContent>
                            <div className="p-4 border-t flex justify-end gap-2 text-slate-700">
                                <Button type="button" variant="ghost" onClick={() => { setIsModalOpen(false); setCurrentBodega(null); }}>Cancelar</Button>
                                <Button type="submit" className="bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-200">
                                    {currentBodega ? 'Actualizar' : 'Guardar'} Bodega
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
}
