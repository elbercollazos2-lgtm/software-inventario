import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, Tag, Percent, Info } from 'lucide-react';
import { Button, Input, Card, CardContent, CardHeader, CardTitle } from '../components/ui';
import { categoriasService } from '../services/api';

export function Categories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCategory, setCurrentCategory] = useState(null);

    const API_URL = 'http://localhost:4000/api/categorias';

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await categoriasService.getAll();
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        try {
            const categoryData = {
                nombre: data.nombre,
                descripcion: data.descripcion || '',
                margen_utilidad: parseFloat(data.margen_utilidad) || 20.00
            };

            if (currentCategory) {
                await categoriasService.update(currentCategory.id, categoryData);
            } else {
                await categoriasService.create(categoryData);
            }
            setIsModalOpen(false);
            setCurrentCategory(null);
            fetchCategories();
        } catch (error) {
            console.error('Error saving category:', error);
            alert('Error al guardar categoría');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Seguro que deseas eliminar esta categoría?')) return;
        try {
            await categoriasService.delete(id);
            fetchCategories();
        } catch (error) {
            console.error('Error deleting category:', error);
            alert('Error al eliminar categoría');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Categorías</h1>
                    <p className="text-slate-500 mt-1">Define los márgenes de utilidad por tipo de producto.</p>
                </div>
                <Button onClick={() => { setCurrentCategory(null); setIsModalOpen(true); }} className="gap-2">
                    <Plus size={18} />
                    Nueva Categoría
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <p className="col-span-full text-center py-10 text-slate-400">Cargando categorías...</p>
                ) : categories.length === 0 ? (
                    <p className="col-span-full text-center py-10 text-slate-400">No hay categorías registradas.</p>
                ) : (
                    categories.map((cat) => (
                        <Card key={cat.id} className="hover:shadow-md transition-shadow group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 flex gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-11 w-11 p-0 bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200 rounded-xl shadow-sm flex items-center justify-center"
                                    onClick={() => { setCurrentCategory(cat); setIsModalOpen(true); }}
                                    title="Editar"
                                >
                                    <Edit2 size={28} strokeWidth={2.5} />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-11 w-11 p-0 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-xl shadow-sm flex items-center justify-center"
                                    onClick={() => handleDelete(cat.id)}
                                    title="Eliminar"
                                >
                                    <Trash2 size={28} strokeWidth={2.5} />
                                </Button>
                            </div>
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600">
                                        <Tag size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-slate-900 text-lg">{cat.nombre}</h3>
                                        <p className="text-sm text-slate-500 line-clamp-2 mt-1">{cat.descripcion || 'Sin descripción'}</p>

                                        <div className="mt-4 flex items-center gap-2 p-2 bg-emerald-50 rounded-xl border border-emerald-100 w-fit">
                                            <Percent size={14} className="text-emerald-600" />
                                            <span className="text-emerald-700 font-black text-sm">{cat.margen_utilidad}%</span>
                                            <span className="text-[10px] text-emerald-600/70 font-bold uppercase tracking-tighter">Margen sugerido</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300">
                        <CardHeader className="border-b bg-slate-50/50 p-6">
                            <CardTitle>{currentCategory ? 'Editar Categoría' : 'Nueva Categoría'}</CardTitle>
                        </CardHeader>
                        <form onSubmit={handleSubmit}>
                            <CardContent className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Nombre</label>
                                    <Input name="nombre" defaultValue={currentCategory?.nombre} placeholder="Ej. Lácteos" required />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700">Descripción</label>
                                    <Input name="descripcion" defaultValue={currentCategory?.descripcion} placeholder="Opcional..." />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                        Margen de Utilidad Sugerido (%) <Info size={14} className="text-slate-400" />
                                    </label>
                                    <div className="relative">
                                        <Percent className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <Input name="margen_utilidad" type="number" step="0.01" defaultValue={currentCategory?.margen_utilidad || 20.00} required className="pr-10" />
                                    </div>
                                    <p className="text-[10px] text-slate-400 italic">Se usará para autocalcular los precios de venta en el inventario.</p>
                                </div>
                            </CardContent>
                            <div className="bg-slate-50 p-6 flex justify-end gap-3 border-t">
                                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                                <Button type="submit">Guardar Categoría</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
