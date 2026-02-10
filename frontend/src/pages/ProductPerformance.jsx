import React, { useState, useEffect } from 'react';
import {
    TrendingUp, TrendingDown, Package, DollarSign, Search,
    ArrowUpDown, Filter, BarChart3, Info, Eye, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Button, Input, Card, CardContent, CardHeader, CardTitle } from '../components/ui';
import { dashboardService } from '../services/api';
import { formatCurrency, cn } from '../lib/utils';

export function ProductPerformance() {
    const [performanceData, setPerformanceData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'unidades_vendidas', direction: 'desc' });

    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        fetchPerformance();
    }, []);

    const fetchPerformance = async () => {
        try {
            const response = await dashboardService.getPerformance();
            setPerformanceData(response.data);
        } catch (error) {
            console.error('Error fetching performance:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSort = (key) => {
        let direction = 'desc';
        if (sortConfig.key === key && sortConfig.direction === 'desc') {
            direction = 'asc';
        }
        setSortConfig({ key, direction });
    };

    const sortedData = [...performanceData].sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (sortConfig.direction === 'asc') {
            return aValue > bValue ? 1 : -1;
        }
        return aValue < bValue ? 1 : -1;
    });

    const filteredData = sortedData.filter(item =>
        item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Cálculos de Paginación
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

    const goToPage = (page) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    };

    if (loading) {
        return <div className="p-10 text-center animate-pulse text-slate-400">Analizando rentabilidad del inventario...</div>;
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 italic tracking-tight uppercase">Análisis de Rentabilidad</h1>
                    <p className="text-slate-500 text-sm">Rendimiento detallado, costos y ganancias por producto.</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={fetchPerformance} variant="outline" className="gap-2 border-2 rounded-xl">
                        <BarChart3 size={18} /> Actualizar Datos
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-emerald-50 border-emerald-100 border-2 rounded-[2rem]">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="bg-emerald-500 p-3 rounded-2xl text-white shadow-lg shadow-emerald-200">
                                <TrendingUp size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Mayor Rentabilidad</p>
                                <p className="text-lg font-black text-slate-900 truncate w-40">
                                    {filteredData.length > 0 ? filteredData.sort((a, b) => b.ganancia_total - a.ganancia_total)[0].nombre : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-blue-50 border-blue-100 border-2 rounded-[2rem]">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="bg-blue-500 p-3 rounded-2xl text-white shadow-lg shadow-blue-200">
                                <Package size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-blue-600 tracking-widest">Más Vendido (Volumen)</p>
                                <p className="text-lg font-black text-slate-900 truncate w-40">
                                    {filteredData.length > 0 ? filteredData.sort((a, b) => b.unidades_vendidas - a.unidades_vendidas)[0].nombre : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-purple-50 border-purple-100 border-2 rounded-[2rem]">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="bg-purple-500 p-3 rounded-2xl text-white shadow-lg shadow-purple-200">
                                <DollarSign size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase text-purple-600 tracking-widest">Mayor Margen %</p>
                                <p className="text-lg font-black text-slate-900 truncate w-40">
                                    {filteredData.length > 0 ? filteredData.sort((a, b) => b.margen_porcentaje - a.margen_porcentaje)[0].nombre : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden">
                <CardHeader className="p-8 border-b border-slate-50 flex flex-row items-center justify-between gap-4 flex-wrap">
                    <div className="relative flex-1 min-w-[300px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <Input
                            placeholder="Buscar producto por nombre o SKU..."
                            className="bg-slate-50 border-none h-12 rounded-2xl shadow-inner italic pl-12"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50/50 border-b border-slate-100">
                                    <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Producto</th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] cursor-pointer hover:text-brand-600" onClick={() => handleSort('stock')}>
                                        Stock {sortConfig.key === 'stock' && (sortConfig.direction === 'desc' ? '↓' : '↑')}
                                    </th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] cursor-pointer hover:text-brand-600" onClick={() => handleSort('stock_valor_venta')}>
                                        Valor Venta Stock
                                    </th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] cursor-pointer hover:text-brand-600" onClick={() => handleSort('stock_ganancia_potencial')}>
                                        Ganancia Potencial Stock
                                    </th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] cursor-pointer hover:text-brand-600" onClick={() => handleSort('unidades_vendidas')}>
                                        Vendidos
                                    </th>
                                    <th className="px-6 py-5 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] cursor-pointer hover:text-brand-600" onClick={() => handleSort('margen_porcentaje')}>
                                        Margen %
                                    </th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] text-right cursor-pointer hover:text-brand-600" onClick={() => handleSort('ganancia_total')}>
                                        Ganancia Histórica
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {paginatedData.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50/80 transition-all group">
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col">
                                                <span className="font-black text-slate-900 group-hover:text-brand-600 transition-colors uppercase tracking-tight">{item.nombre}</span>
                                                <span className="text-[10px] text-slate-400 font-bold">{item.sku || 'SIN SKU'} · {item.categoria_nombre}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={cn(
                                                "text-sm font-black px-3 py-1 rounded-full",
                                                item.stock <= 5 ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-700"
                                            )}>
                                                {item.stock} <span className="text-[10px] opacity-70 font-bold uppercase">{item.unidad_medida}</span>
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-sm font-black text-brand-600 tracking-tighter">
                                            {formatCurrency(item.stock_valor_venta)}
                                            <div className="text-[9px] text-slate-400 font-normal">Inv: {formatCurrency(item.stock_valor_inversion)}</div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-sm font-bold text-emerald-600">{formatCurrency(item.stock_ganancia_potencial)}</span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className="text-sm font-bold text-slate-600">
                                                {item.unidades_vendidas}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <span className={cn(
                                                "text-[10px] font-black px-2 py-1 rounded border",
                                                (Number(item.margen_porcentaje) || 0) > 30 ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                                                    (Number(item.margen_porcentaje) || 0) > 15 ? "bg-blue-50 text-blue-700 border-blue-100" :
                                                        "bg-orange-50 text-orange-700 border-orange-100"
                                            )}>
                                                {(Number(item.margen_porcentaje) || 0).toFixed(1)}%
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className="text-lg font-black text-slate-900 tracking-tighter italic">
                                                    {formatCurrency(item.ganancia_total)}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Controles de Paginación */}
                    <div className="p-8 border-t border-slate-50 flex items-center justify-between bg-slate-50/30">
                        <div className="text-xs font-black text-slate-400 uppercase tracking-widest">
                            Mostrando <span className="text-brand-600">{startIndex + 1}</span> a <span className="text-brand-600">{Math.min(startIndex + itemsPerPage, filteredData.length)}</span> de <span className="text-brand-600">{filteredData.length}</span> productos
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="border-2 rounded-xl h-10 w-10 p-0 flex items-center justify-center hover:bg-brand-50 hover:text-brand-600 transition-all disabled:opacity-30"
                            >
                                <ChevronLeft size={20} />
                            </Button>

                            <div className="flex items-center gap-1">
                                {[...Array(totalPages)].map((_, i) => {
                                    const pageNum = i + 1;
                                    // Solo mostrar algunas páginas si hay muchas
                                    if (totalPages > 5) {
                                        if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                                            return (
                                                <Button
                                                    key={pageNum}
                                                    variant={currentPage === pageNum ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => goToPage(pageNum)}
                                                    className={cn(
                                                        "h-10 w-10 p-0 rounded-xl font-black text-xs transition-all",
                                                        currentPage === pageNum
                                                            ? "bg-brand-600 text-white shadow-lg shadow-brand-200 border-none"
                                                            : "border-2 hover:bg-brand-50 hover:text-brand-600"
                                                    )}
                                                >
                                                    {pageNum}
                                                </Button>
                                            );
                                        } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                                            return <span key={pageNum} className="px-1 text-slate-400 font-bold">...</span>;
                                        }
                                        return null;
                                    }
                                    return (
                                        <Button
                                            key={pageNum}
                                            variant={currentPage === pageNum ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => goToPage(pageNum)}
                                            className={cn(
                                                "h-10 w-10 p-0 rounded-xl font-black text-xs transition-all",
                                                currentPage === pageNum
                                                    ? "bg-brand-600 text-white shadow-lg shadow-brand-200 border-none"
                                                    : "border-2 hover:bg-brand-50 hover:text-brand-600"
                                            )}
                                        >
                                            {pageNum}
                                        </Button>
                                    );
                                })}
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="border-2 rounded-xl h-10 w-10 p-0 flex items-center justify-center hover:bg-brand-50 hover:text-brand-600 transition-all disabled:opacity-30"
                            >
                                <ChevronRight size={20} />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
