import React, { useEffect } from 'react';
import {
    LayoutDashboard, Package, ShoppingCart, Users, Settings, LogOut,
    FileText, Warehouse, Factory, Tags, ShoppingBag, ArrowRightLeft, Sliders, Boxes, Bell, BarChart3, BookOpen, History
} from 'lucide-react';
import { cn } from '../lib/utils';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAlertStore } from '../store/useAlertStore';

const navSections = [
    {
        title: null, // Sin título para el dashboard
        items: [
            { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
        ]
    },
    {
        title: 'Operaciones',
        items: [
            { icon: ShoppingCart, label: 'Punto de Venta', href: '/pos' },
            { icon: Package, label: 'Inventario', href: '/inventory' },
            { icon: Bell, label: 'Alertas', href: '/alerts', badge: true },
            { icon: BarChart3, label: 'Rentabilidad', href: '/performance' },
        ]
    },
    {
        title: 'Gestión de Stock',
        items: [
            { icon: Boxes, label: 'Kardex/Movimientos', href: '/kardex' },
            { icon: ShoppingBag, label: 'Entradas/Compras', href: '/compras' },
            { icon: BookOpen, label: 'Cuentas por Pagar', href: '/debts' },
            { icon: History, label: 'Historial de Pagos', href: '/payment-history' },
            { icon: ArrowRightLeft, label: 'Traslados', href: '/traslados' },
            { icon: Sliders, label: 'Ajustes Stock', href: '/ajustes' },
            { icon: FileText, label: 'Cargar Facturas', href: '/upload' },
        ]
    },
    {
        title: 'Catálogo',
        items: [
            { icon: Tags, label: 'Categorías', href: '/categories' },
            { icon: Factory, label: 'Grupos Contables', href: '/grupos' },
            { icon: Warehouse, label: 'Bodegas', href: '/bodegas' },
            { icon: Factory, label: 'Proveedores', href: '/providers' },
        ]
    },
    {
        title: 'Sistema',
        items: [
            { icon: Users, label: 'Usuarios', href: '/users' },
            { icon: Settings, label: 'Configuración', href: '/settings' },
            { icon: BookOpen, label: 'Ayuda / Manual', href: '/help' },
        ]
    },
];

export function Sidebar({ className, isCollapsed }) {
    const navigate = useNavigate();
    const { alertCount, startPolling } = useAlertStore();

    useEffect(() => {
        // Start polling when sidebar mounts (once for the app lifetime essentially)
        const cleanup = startPolling();
        return cleanup;
    }, [startPolling]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user_role');
        localStorage.removeItem('user_id');
        navigate('/login');
    };

    return (
        <aside className={cn(
            "hidden md:flex flex-col h-screen fixed left-0 top-0 transition-all duration-300 z-50 bg-slate-900 border-r border-slate-800",
            isCollapsed ? "w-20" : "w-64",
            className
        )}>
            <div className={cn("shrink-0 flex items-center justify-center transition-all duration-300", isCollapsed ? "p-4" : "p-6")}>
                <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-3 overflow-hidden">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shrink-0 shadow-lg shadow-brand-500/30">
                        <span className="text-white text-xl font-bold">I</span>
                    </div>
                    {!isCollapsed && <span className="transition-opacity duration-300 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Inventario</span>}
                </h1>
            </div>

            <nav className="flex-1 px-3 space-y-6 mt-2 overflow-y-auto overflow-x-hidden custom-scrollbar pb-6">
                {navSections.map((section, sectionIndex) => (
                    <div key={sectionIndex} className="space-y-2">
                        {section.title && !isCollapsed && (
                            <div className="px-4 text-[10px] font-bold uppercase text-slate-500 tracking-widest whitespace-nowrap transition-opacity duration-300">
                                {section.title}
                            </div>
                        )}
                        <div className="space-y-1">
                            {section.items.map((item) => (
                                <NavLink
                                    key={item.href}
                                    to={item.href}
                                    title={isCollapsed ? item.label : ''}
                                    className={({ isActive }) =>
                                        cn(
                                            "flex items-center px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-medium relative overflow-hidden",
                                            isActive
                                                ? "bg-brand-600 text-white shadow-lg shadow-brand-500/20"
                                                : "text-slate-400 hover:bg-white/5 hover:text-white",
                                            isCollapsed ? "justify-center px-2" : "justify-between"
                                        )
                                    }
                                >
                                    <div className="flex items-center gap-3 relative z-10">
                                        <item.icon size={20} className={cn("shrink-0 transition-transform duration-300", !isCollapsed && "group-hover:scale-110")} />
                                        {!isCollapsed && <span className="transition-opacity duration-300">{item.label}</span>}
                                    </div>

                                    {!isCollapsed && item.badge && alertCount > 0 && (
                                        <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center animate-pulse shadow-lg shadow-red-500/40">
                                            {alertCount}
                                        </span>
                                    )}
                                    {isCollapsed && item.badge && alertCount > 0 && (
                                        <div className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-slate-900 animate-pulse" />
                                    )}
                                </NavLink>
                            ))}
                        </div>
                    </div>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-800 shrink-0 bg-slate-900">
                <button
                    onClick={handleLogout}
                    className={cn(
                        "flex items-center gap-3 px-4 py-3 w-full rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-all text-sm font-medium",
                        isCollapsed && "justify-center px-2"
                    )}
                    title={isCollapsed ? "Cerrar Sesión" : ""}
                >
                    <LogOut size={20} />
                    {!isCollapsed && <span>Cerrar Sesión</span>}
                </button>
            </div>
        </aside>
    );
}
