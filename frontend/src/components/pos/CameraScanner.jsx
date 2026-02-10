import React, { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X, Camera } from 'lucide-react';

export function CameraScanner({ onScan, onClose }) {
    useEffect(() => {
        const scanner = new Html5QrcodeScanner('reader', {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            // Configuraciones específicas para mejorar lectura en superficies curvas/pequeñas
            experimentalFeatures: {
                useBarCodeDetectorIfSupported: true
            },
            rememberLastUsedCamera: true,
            aspectRatio: 1.0
        });

        scanner.render((decodedText) => {
            onScan(decodedText);
            scanner.clear();
            onClose();
        }, (error) => {
            // No loguear errores de escaneo continuo para no saturar
        });

        return () => {
            scanner.clear().catch(err => console.error("Error clearing scanner", err));
        };
    }, []);

    return (
        <div className="fixed inset-0 z-[300] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] w-full max-w-md overflow-hidden shadow-2xl">
                <div className="p-6 border-b flex justify-between items-center bg-slate-50">
                    <div className="flex items-center gap-2">
                        <Camera size={20} className="text-brand-600" />
                        <h2 className="font-black text-slate-900 tracking-tight">Escáner de Cámara</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                <div className="p-6">
                    <div id="reader" className="overflow-hidden rounded-2xl border-4 border-slate-100" />
                    <p className="text-center text-xs text-slate-400 mt-6 font-medium italic">
                        Centra el código de barras en el recuadro.<br />
                        Para productos curvos, inclina ligeramente la cámara.
                    </p>
                </div>
            </div>
        </div>
    );
}
