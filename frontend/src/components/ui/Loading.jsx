import React from 'react';
import { Loader2 } from 'lucide-react';

export function Loading() {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-10 w-10 animate-spin text-brand-600" />
                <p className="text-sm font-medium text-slate-500 animate-pulse">Cargando...</p>
            </div>
        </div>
    );
}
