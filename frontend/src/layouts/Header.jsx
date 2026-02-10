import React from 'react';
import { Bell, Search, User, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAlertStore } from '../store/useAlertStore';

export function Header({ onMenuClick }) {
    const { alertCount } = useAlertStore();
    const navigate = useNavigate();

    return (
        <header className="h-16 glass border-b border-white/20 flex items-center justify-between px-6 sticky top-0 z-30 transition-all">
            <div className="flex items-center gap-4 flex-1">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onMenuClick}
                    className="hidden md:flex text-slate-500 hover:bg-slate-100 rounded-xl p-2 md:hidden"
                >
                    <Menu size={20} />
                </Button>
                <div className="relative w-full max-w-md hidden md:block">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                    <Input
                        type="text"
                        placeholder="Buscar..."
                        className="bg-slate-100/50 border-transparent focus:bg-white focus:border-brand-300 focus:ring-4 focus:ring-brand-500/10 pl-11 rounded-xl h-10 transition-all"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/alerts')}
                    className="relative p-2.5 rounded-xl hover:bg-slate-100/80 transition-all group"
                >
                    <Bell size={20} className="text-slate-600 group-hover:text-brand-600 transition-colors" />
                    {alertCount > 0 && (
                        <span className="absolute top-2 right-2 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-white"></span>
                        </span>
                    )}
                </button>

                <div className="flex items-center gap-3 pl-4 border-l border-slate-200/60">
                    <div className="text-right hidden lg:block">
                        <p className="text-sm font-bold text-slate-900 leading-tight">Admin</p>
                        <p className="text-[10px] font-medium text-slate-500">Administrador</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/20 ring-4 ring-white">
                        <User size={18} className="text-white" />
                    </div>
                </div>
            </div>
        </header>
    );
}
