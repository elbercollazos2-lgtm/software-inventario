import React, { useState, useEffect } from 'react';
import { Plus, Factory, Hash, FileText, Edit2, Trash2 } from 'lucide-react';
import { Button, Input, Card, CardContent, CardHeader, CardTitle } from '../components/ui';
import { gruposService } from '../services/api';

export function Grupos() {
    const [grupos, setGrupos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentGrupo, setCurrentGrupo] = useState(null);

    useEffect(() => {
        fetchGrupos();
    }, []);

    const fetchGrupos = async () => {
        setLoading(true);
        try {
            const response = await gruposService.getAll();
            setGrupos(response.data);
        } catch (error) {
            console.error('Error fetching grupos:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (grupo = null) => {
        setCurrentGrupo(grupo);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        try {
            if (currentGrupo) {
                await gruposService.update(currentGrupo.id, data);
            } else {
                await gruposService.create(data);
            }
            setIsModalOpen(false);
            setCurrentGrupo(null);
            fetchGrupos();
        } catch (error) {
            console.error('Error saving grupo:', error);
            alert('Error al guardar grupo');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Seguro que deseas eliminar este grupo?')) return;
        try {
            await gruposService.delete(id);
            fetchGrupos();
        } catch (error) {
            console.error('Error deleting grupo:', error);
            alert('Error al eliminar grupo');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Grupos de Inventario</h1>
                    <p className="text-slate-500 mt-1">Clasificación contable para el manejo de existencias.</p>
                </div>
                <Button onClick={() => handleOpenModal()} className="gap-2 bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-200">
                    <Plus size={18} />
                    Nuevo Grupo
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <p>Cargando grupos...</p>
                ) : (
                    grupos.map((grupo) => (
                        <Card key={grupo.id} className="border-l-4 border-l-brand-500 relative">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                                        <Factory size={20} className="text-slate-400" />
                                        {grupo.nombre}
                                    </CardTitle>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleOpenModal(grupo)}
                                            className="h-11 w-11 p-0 bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200 rounded-xl shadow-sm flex items-center justify-center"
                                            title="Editar"
                                        >
                                            <Edit2 size={28} strokeWidth={2.5} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(grupo.id)}
                                            className="h-11 w-11 p-0 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-xl shadow-sm flex items-center justify-center"
                                            title="Eliminar"
                                        >
                                            <Trash2 size={28} strokeWidth={2.5} />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-2 text-sm">
                                    <Hash size={14} className="text-brand-600" />
                                    <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                                        Cta: {grupo.codigo_contable || '---'}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-500 line-clamp-2">
                                    {grupo.descripcion || 'Sin descripción detallada.'}
                                </p>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <Card className="w-full max-w-md animate-in zoom-in-95 duration-200">
                        <CardHeader>
                            <CardTitle>{currentGrupo ? 'Editar Grupo Contable' : 'Nuevo Grupo Contable'}</CardTitle>
                        </CardHeader>
                        <form onSubmit={handleSubmit}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold">Nombre del Grupo</label>
                                    <Input name="nombre" defaultValue={currentGrupo?.nombre} required placeholder="Ej. Materia Prima" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold">Código Contable (PUC)</label>
                                    <Input name="codigo_contable" defaultValue={currentGrupo?.codigo_contable} placeholder="Ej. 1435" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold">Descripción</label>
                                    <Input name="descripcion" defaultValue={currentGrupo?.descripcion} placeholder="Explica el uso de este grupo" />
                                </div>
                            </CardContent>
                            <div className="p-4 border-t flex justify-end gap-2">
                                <Button type="button" variant="ghost" onClick={() => { setIsModalOpen(false); setCurrentGrupo(null); }}>Cancelar</Button>
                                <Button type="submit" className="bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-200">
                                    {currentGrupo ? 'Actualizar' : 'Crear'} Grupo
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
}
