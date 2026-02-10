import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui';
import { HelpCircle, Package, ShoppingCart, Bell, Users, FileText, ChevronRight, BookOpen, Search } from 'lucide-react';

export function HelpCenter() {
    const [searchTerm, setSearchTerm] = useState('');

    const faqs = [
        {
            id: 'dashboard',
            title: 'Dashboard y Métricas',
            icon: BookOpen,
            items: [
                { q: '¿Qué significan los colores en las alertas?', a: 'El ROJO indica stock agotado o productos vencidos. El NARANJA indica stock crítico o vencimiento próximo. El VERDE indica estado saludable.' },
                { q: '¿Cómo se calcula la ganancia mensual?', a: 'Es la suma de la utilidad de todas las ventas del mes (Precio Venta - Costo Compra) menos los gastos operativos registrados.' }
            ]
        },
        {
            id: 'inventory',
            title: 'Inventario y Productos',
            icon: Package,
            items: [
                { q: '¿Cómo crear un producto?', a: 'Ve a la sección Inventario, haz clic en "Nuevo Producto", completa los datos obligatorios (Nombre, Precio, Stock) y guarda.' },
                { q: '¿Cómo asignar un proveedor?', a: 'Al editar o crear un producto, usa el desplegable "Proveedor Principal" para vincularlo. Esto activa las alertas de contacto inteligentes.' },
                { q: '¿Qué es el Stock Mínimo?', a: 'Es la cantidad límite para generar una alerta. Si el stock baja de este número, el sistema te avisará para reabastecer.' }
            ]
        },
        {
            id: 'pos',
            title: 'Punto de Venta (POS)',
            icon: ShoppingCart,
            items: [
                { q: '¿Cómo buscar productos en caja?', a: 'Puedes usar el lector de código de barras o escribir el nombre/SKU en la barra de búsqueda superior.' },
                { q: '¿Cómo finalizar una venta?', a: 'Después de agregar productos, haz clic en "Cobrar", selecciona el método de pago (Efectivo/Tarjeta) e ingresa el monto recibido.' }
            ]
        },
        {
            id: 'alerts',
            title: 'Alertas y Notificaciones',
            icon: Bell,
            items: [
                { q: '¿Para qué sirve el botón COMPRAR?', a: 'Te redirige automáticamente a la sección de compras para reabastecer el producto con stock bajo.' },
                { q: '¿Qué hago con productos vencidos?', a: 'Usa el botón REMATE para ir al POS y venderlos con descuento, o dales de baja en "Ajustes de Stock" si ya no son aptos.' }
            ]
        }
    ];

    const filteredFaqs = faqs.map(section => ({
        ...section,
        items: section.items.filter(item =>
            item.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.a.toLowerCase().includes(searchTerm.toLowerCase())
        )
    })).filter(section => section.items.length > 0);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <BookOpen className="text-brand-600" size={32} />
                        Centro de Ayuda
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg">Manual de usuario y preguntas frecuentes.</p>
                </div>
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar en el manual..."
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {filteredFaqs.map((section) => (
                    <Card key={section.id} className="border-slate-200 shadow-sm overflow-hidden">
                        <CardHeader className="bg-slate-50 border-b border-slate-100 py-4">
                            <CardTitle className="flex items-center gap-3 text-lg">
                                <section.icon className="text-brand-500" size={24} />
                                {section.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {section.items.map((item, index) => (
                                <div key={index} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                                    <details className="group p-6 cursor-pointer">
                                        <summary className="flex items-center justify-between font-bold text-slate-700 list-none mb-2">
                                            <span className="flex items-center gap-2">
                                                <HelpCircle size={16} className="text-brand-400" />
                                                {item.q}
                                            </span>
                                            <span className="transition group-open:rotate-180">
                                                <ChevronRight size={16} className="text-slate-400" />
                                            </span>
                                        </summary>
                                        <p className="text-slate-500 text-sm leading-relaxed pl-6 border-l-2 border-brand-200 ml-2">
                                            {item.a}
                                        </p>
                                    </details>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="bg-brand-600 rounded-2xl p-8 text-white text-center mt-8 shadow-xl shadow-brand-900/20">
                <h3 className="text-2xl font-bold mb-2">¿Necesitas soporte técnico?</h3>
                <p className="text-brand-100 mb-6">Si no encuentras lo que buscas, contacta al administrador del sistema.</p>
                <div className="flex justify-center gap-4">
                    <button className="bg-white text-brand-700 px-6 py-2 rounded-lg font-bold hover:bg-brand-50 transition-colors">
                        Contactar Soporte
                    </button>
                    <button className="bg-brand-700 text-white px-6 py-2 rounded-lg font-bold hover:bg-brand-800 transition-colors border border-brand-500">
                        Ver Video Tutoriales
                    </button>
                </div>
            </div>
        </div>
    );
}
