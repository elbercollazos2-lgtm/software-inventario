import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { authService } from '../services/api';
import { Lock, User, ArrowRight, Sparkles } from 'lucide-react';

export function Login() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await authService.login({ username, password });
            const { token, user } = response.data.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user_role', user.rol);
            localStorage.setItem('user_id', user.id);

            navigate(user.rol === 'admin' || user.rol === 'superuser' ? '/' : '/pos');
        } catch (err) {
            console.error('Login error:', err);
            setError(err.formattedMessage || 'Error al conectar con el servidor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex w-full">
            {/* Left Side - Visual */}
            <div className="hidden lg:flex w-1/2 bg-slate-900 relative overflow-hidden items-center justify-center p-12">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-600/20 to-brand-900/40 z-10" />
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-500/30 rounded-full blur-3xl" />
                <div className="absolute top-1/2 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />

                <div className="relative z-20 text-white max-w-lg space-y-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center mb-8 shadow-2xl">
                        <Sparkles size={32} className="text-brand-300" />
                    </div>
                    <h1 className="text-5xl font-bold tracking-tight leading-tight">
                        Gestión inteligente para tu negocio
                    </h1>
                    <p className="text-lg text-slate-400 leading-relaxed">
                        Controla tu inventario, ventas y rentabilidad en tiempo real con nuestra plataforma de última generación.
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 bg-white flex items-center justify-center p-8">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Bienvenido de nuevo</h2>
                        <p className="text-slate-500 mt-2">Ingresa tus credenciales para acceder al sistema.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 ml-1">Usuario</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-brand-500" size={18} />
                                    <Input
                                        placeholder="Ej. admin"
                                        className="pl-11 h-12 bg-slate-50 border-slate-200 focus:bg-white transition-all"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        data-testid="username-input"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700 ml-1">Contraseña</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-brand-500" size={18} />
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        className="pl-11 h-12 bg-slate-50 border-slate-200 focus:bg-white transition-all"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        data-testid="password-input"
                                    />
                                </div>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 text-base font-bold shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:-translate-y-0.5 transition-all duration-300"
                            disabled={loading}
                            data-testid="login-button"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Conectando...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    Iniciar Sesión <ArrowRight size={18} />
                                </span>
                            )}
                        </Button>
                    </form>

                    <div className="pt-6 border-t border-slate-100">
                        <div className="text-center text-xs text-slate-400 space-y-1 bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <p className="font-bold text-slate-500 uppercase tracking-wider mb-2">Credenciales Demo</p>
                            <div className="grid grid-cols-2 gap-2 text-left">
                                <div className="p-2 bg-white rounded border border-slate-200">
                                    <span className="font-mono text-brand-600">admin</span> / <span className="font-mono">admin123</span>
                                </div>
                                <div className="p-2 bg-white rounded border border-slate-200">
                                    <span className="font-mono text-brand-600">cajero</span> / <span className="font-mono">cajero123</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
