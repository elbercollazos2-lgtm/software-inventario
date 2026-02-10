import React, { useState, useEffect } from 'react';
import {
    UserPlus, Shield, Mail, Search, ShieldCheck, ShieldAlert,
    Edit, Trash2, User, Key, X, CheckCircle2, AlertCircle
} from 'lucide-react';
import { Button, Input, Card, CardContent, CardHeader, CardTitle } from '../components/ui';
import { userService } from '../services/api';
import { cn } from '../lib/utils';

// Subcomponente Modal para Usuarios
const UserModal = ({ isOpen, onClose, user, onSave, isResetPassword = false }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        username: '',
        password: '',
        rol: 'empleado'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user) {
            setFormData({
                nombre: user.nombre || '',
                username: user.username || '',
                password: '',
                rol: user.rol || 'empleado'
            });
        } else {
            setFormData({ nombre: '', username: '', password: '', rol: 'empleado' });
        }
        setError('');
    }, [user, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await onSave(formData, user?.id);
            onClose();
        } catch (err) {
            setError(err.response?.data?.error || 'Error al procesar la solicitud');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden border border-white">
                <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                    <h2 className="text-xl font-black italic tracking-tight text-slate-900">
                        {isResetPassword ? 'RESTABLECER CONTRASEÑA' : (user ? 'EDITAR USUARIO' : 'NUEVO USUARIO')}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-colors text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-5">
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    {!isResetPassword && (
                        <>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">Nombre Completo</label>
                                <Input
                                    required
                                    placeholder="Ej: Juan Pérez"
                                    className="h-12 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:ring-brand-500 transition-all font-medium"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">Nombre de Usuario</label>
                                <Input
                                    required
                                    placeholder="Ej: jperez"
                                    className="h-12 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:ring-brand-500 transition-all font-medium"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">Rol en el Sistema</label>
                                <select
                                    className="w-full h-12 px-4 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-brand-500 transition-all font-medium outline-none appearance-none cursor-pointer"
                                    value={formData.rol}
                                    onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
                                >
                                    <option value="empleado">Cajero / Empleado</option>
                                    <option value="admin">Administrador</option>
                                </select>
                            </div>
                        </>
                    )}

                    {(isResetPassword || !user) && (
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">
                                {isResetPassword ? 'Nueva Contraseña' : 'Contraseña'}
                            </label>
                            <Input
                                required
                                type="password"
                                placeholder="••••••••"
                                className="h-12 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:ring-brand-500 transition-all font-medium"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                    )}

                    <div className="pt-4 flex gap-3">
                        <Button type="button" variant="ghost" className="flex-1 h-12 rounded-2xl font-bold" onClick={onClose}>
                            CANCELAR
                        </Button>
                        <Button disabled={loading} className="flex-1 h-12 rounded-2xl bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-500/20 font-black italic">
                            {loading ? 'GUARDANDO...' : 'GUARDAR CAMBIOS'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export function Users() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isResetPasswordMode, setIsResetPasswordMode] = useState(false);
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await userService.getAll();
            setUsers(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            showNotification('Error al cargar usuarios', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showNotification = (msg, type = 'success') => {
        setNotification({ msg, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleSave = async (data, id) => {
        try {
            if (isResetPasswordMode) {
                await userService.resetPassword(id, data.password);
                showNotification('Contraseña restablecida con éxito');
            } else if (id) {
                await userService.update(id, data);
                showNotification('Usuario actualizado con éxito');
            } else {
                await userService.create(data);
                showNotification('Usuario creado con éxito');
            }
            fetchUsers();
            setIsModalOpen(false);
        } catch (error) {
            throw error;
        }
    };

    const handleDelete = async (id) => {
        if (id === 1) {
            showNotification('No se puede eliminar al administrador principal', 'error');
            return;
        }

        if (!window.confirm('¿Realmente deseas eliminar este usuario? Esta acción no se puede deshacer.')) return;

        try {
            await userService.delete(id);
            showNotification('Usuario eliminado correctamente');
            fetchUsers();
        } catch (error) {
            showNotification(error.response?.data?.error || 'Error al eliminar usuario', 'error');
        }
    };

    const openCreateModal = () => {
        setSelectedUser(null);
        setIsResetPasswordMode(false);
        setIsModalOpen(true);
    };

    const openEditModal = (user) => {
        setSelectedUser(user);
        setIsResetPasswordMode(false);
        setIsModalOpen(true);
    };

    const openResetPasswordModal = (user) => {
        setSelectedUser(user);
        setIsResetPasswordMode(true);
        setIsModalOpen(true);
    };

    const filteredUsers = users.filter(user =>
        user.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        admins: users.filter(u => u.rol?.toLowerCase() === 'admin' || u.rol?.toLowerCase() === 'administrador').length,
        total: users.length
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 relative">
            {/* Notificaciones flotantes */}
            {notification && (
                <div className={cn(
                    "fixed top-24 right-8 z-[100] p-4 rounded-[2rem] shadow-2xl border flex items-center gap-3 animate-in slide-in-from-right duration-300",
                    notification.type === 'success' ? "bg-emerald-500 text-white border-emerald-400" : "bg-red-500 text-white border-red-400"
                )}>
                    {notification.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                    <span className="font-black italic uppercase tracking-tighter">{notification.msg}</span>
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/50 p-6 rounded-[2rem] border border-white shadow-sm backdrop-blur-sm">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight italic">USUARIOS</h1>
                    <p className="text-slate-500 font-medium tracking-tight">Gestiona el acceso, roles y seguridad de tu equipo de trabajo.</p>
                </div>
                <Button
                    onClick={openCreateModal}
                    className="h-12 px-6 rounded-2xl bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-500/20 gap-2 font-black italic transition-all active:scale-95"
                >
                    <UserPlus size={20} />
                    NUEVO USUARIO
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-slate-900 text-white border-none shadow-xl overflow-hidden relative group">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                        <ShieldCheck size={80} />
                    </div>
                    <CardContent className="p-8 relative z-10">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center shadow-inner">
                                <ShieldCheck size={28} className="text-brand-400" />
                            </div>
                            <div>
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Administradores</p>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-4xl font-black italic">{stats.admins}</p>
                                    <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">de {stats.total}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden relative group transition-all hover:-translate-y-1">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                        <User size={80} />
                    </div>
                    <CardContent className="p-8 relative z-10">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center border border-brand-100">
                                <User size={28} className="text-brand-600" />
                            </div>
                            <div>
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Personal Total</p>
                                <p className="text-4xl font-black text-slate-900 italic tracking-tighter">{stats.total}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden relative group transition-all hover:-translate-y-1">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                        <Key size={80} />
                    </div>
                    <CardContent className="p-8 relative z-10">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center border border-amber-100">
                                <Key size={28} className="text-amber-600" />
                            </div>
                            <div>
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Seguridad</p>
                                <p className="text-xl font-black text-slate-900 uppercase italic">Control Total</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card className="border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden">
                <CardHeader className="p-10 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <CardTitle className="text-xl font-black tracking-tight italic flex items-center gap-4">
                        <div className="w-2.5 h-10 bg-brand-500 rounded-full" />
                        GESTIÓN DE PERSONAL
                    </CardTitle>
                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
                        <Input
                            placeholder="Buscar por nombre, usuario..."
                            className="h-14 pl-12 rounded-[1.5rem] bg-slate-50 border-transparent focus:bg-white focus:ring-brand-500 transition-all shadow-sm font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 text-slate-400 text-[11px] font-black uppercase tracking-[0.25em] border-b border-slate-100">
                                <tr>
                                    <th className="px-10 py-6">IDENTIDAD DEL USUARIO</th>
                                    <th className="px-10 py-6">ROL / NIVEL</th>
                                    <th className="px-10 py-6 text-center">ESTADO</th>
                                    <th className="px-10 py-6 text-right">OPERACIONES</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" className="p-20 text-center text-slate-400 font-bold italic animate-pulse tracking-widest">SINCRONIZANDO PERSONAL...</td>
                                    </tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="p-20 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-20 h-20 bg-slate-50 rounded-[2rem] flex items-center justify-center border border-slate-100 italic font-black text-slate-200">?</div>
                                                <div>
                                                    <p className="text-slate-900 font-black italic tracking-tighter text-xl uppercase">No hay resultados</p>
                                                    <p className="text-slate-400 font-medium">Revisa el término de búsqueda.</p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredUsers.map((user) => (
                                    <tr key={user.id} className="group hover:bg-slate-50/80 transition-all duration-300">
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-14 rounded-[1.2rem] bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600 font-black text-xl border-2 border-white shadow-sm group-hover:scale-110 group-hover:-rotate-2 transition-all">
                                                    {(user.nombre || 'U')[0].toUpperCase()}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-extrabold text-slate-900 group-hover:text-brand-600 transition-colors text-lg tracking-tight uppercase italic">{user.nombre}</span>
                                                    <div className="flex items-center gap-2 text-xs text-slate-400 font-bold tracking-widest">
                                                        <User size={12} className="opacity-50" />
                                                        @{user.username.toUpperCase()}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110",
                                                    (user.rol?.toLowerCase() === 'admin' || user.rol?.toLowerCase() === 'administrador') ? "bg-slate-900 text-white shadow-slate-900/10" : "bg-slate-100 text-slate-500 shadow-slate-100/50"
                                                )}>
                                                    {(user.rol?.toLowerCase() === 'admin' || user.rol?.toLowerCase() === 'administrador') ? <Shield size={18} /> : <User size={18} />}
                                                </div>
                                                <span className="font-black text-slate-700 text-xs uppercase tracking-[0.1em]">{user.rol}</span>
                                            </div>
                                        </td>
                                        <td className="px-10 py-6 text-center">
                                            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm bg-emerald-500 text-white border border-emerald-400">
                                                ACTIVO
                                            </span>
                                        </td>
                                        <td className="px-10 py-6">
                                            <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                                <Button
                                                    title="Editar Información"
                                                    onClick={() => openEditModal(user)}
                                                    variant="ghost"
                                                    size="icon"
                                                    className="w-11 h-11 rounded-[1.1rem] hover:bg-white hover:text-brand-600 hover:shadow-xl transition-all"
                                                >
                                                    <Edit size={20} />
                                                </Button>
                                                <Button
                                                    title="Restablecer Contraseña"
                                                    onClick={() => openResetPasswordModal(user)}
                                                    variant="ghost"
                                                    size="icon"
                                                    className="w-11 h-11 rounded-[1.1rem] hover:bg-white hover:text-amber-500 hover:shadow-xl transition-all"
                                                >
                                                    <Key size={20} />
                                                </Button>
                                                <Button
                                                    title="Eliminar Usuario"
                                                    disabled={user.id === 1}
                                                    variant="ghost"
                                                    size="icon"
                                                    className={cn(
                                                        "w-11 h-11 rounded-[1.1rem] hover:bg-white transition-all",
                                                        user.id === 1 ? "opacity-20 cursor-not-allowed" : "hover:text-red-500 hover:shadow-xl"
                                                    )}
                                                    onClick={() => handleDelete(user.id)}
                                                >
                                                    <Trash2 size={20} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <UserModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                user={selectedUser}
                onSave={handleSave}
                isResetPassword={isResetPasswordMode}
            />
        </div>
    );
}
