import { useEffect, useRef } from 'react';

export const useBarcodeScanner = (onScan) => {
    const buffer = useRef('');
    const lastKeyTime = useRef(Date.now());

    useEffect(() => {
        const handleKeyDown = (e) => {
            // Ignorar eventos si el foco está en un input o textarea (opcional, pero ayuda a evitar duplicación)
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                // Solo permitimos el scanner si no estamos escribiendo en un campo,
                // a menos que sea un scanner que "limpia" el buffer con Enter.
                // Lo dejaremos pasar pero con un buffer más robusto.
            }

            const currentTime = Date.now();

            // Aumentamos el gap a 100ms para scanners que sufren con curvas o códigos pequeños
            if (currentTime - lastKeyTime.current > 100) {
                buffer.current = '';
            }

            lastKeyTime.current = currentTime;

            if (e.key === 'Enter') {
                if (buffer.current.length > 2) {
                    onScan(buffer.current);
                    buffer.current = '';
                    e.preventDefault(); // Evitar envíos de formularios accidentales
                }
            } else if (e.key.length === 1) {
                buffer.current += e.key;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onScan]);
};
