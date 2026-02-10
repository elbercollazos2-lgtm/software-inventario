import React from 'react';
import { formatCurrency } from '../../lib/utils';

export const Ticket = React.forwardRef(({ sale, businessInfo }, ref) => {
    if (!sale) return null;

    const total = sale.items.reduce((acc, item) => acc + (item.precio_venta * item.quantity), 0);

    return (
        <div ref={ref} className="p-4 bg-white text-black font-mono text-xs w-[80mm] mx-auto print:m-0">
            <div className="text-center mb-4">
                <h2 className="text-sm font-bold uppercase">{businessInfo?.empresa_nombre || 'SUPERMERCADO'}</h2>
                <p>NIT: {businessInfo?.empresa_nit || '000000000-0'}</p>
                <p>FECHA: {new Date().toLocaleString()}</p>
                <div className="border-b border-dashed my-2" />
                <p className="font-bold">RECIBO DE VENTA # {sale.id}</p>
            </div>

            <div className="space-y-1 mb-4">
                <div className="flex justify-between font-bold border-b border-dashed pb-1 mb-1">
                    <span className="w-1/2">PRODUCTO</span>
                    <span className="w-1/6 text-center">CANT</span>
                    <span className="w-1/3 text-right">TOTAL</span>
                </div>
                {sale.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between">
                        <div className="w-1/2 overflow-hidden truncate">{item.nombre}</div>
                        <div className="w-1/6 text-center">{item.quantity}</div>
                        <div className="w-1/3 text-right">{formatCurrency(item.precio_venta * item.quantity)}</div>
                    </div>
                ))}
            </div>

            <div className="border-t border-dashed pt-2 space-y-1">
                <div className="flex justify-between font-bold text-sm">
                    <span>TOTAL</span>
                    <span>{formatCurrency(total)}</span>
                </div>
                <div className="flex justify-between">
                    <span>MÉTODO:</span>
                    <span className="uppercase">{sale.metodo_pago || 'EFECTIVO'}</span>
                </div>
                {sale.recibido && (
                    <>
                        <div className="flex justify-between">
                            <span>RECIBIDO:</span>
                            <span>{formatCurrency(parseFloat(sale.recibido))}</span>
                        </div>
                        <div className="flex justify-between font-bold border-t border-slate-200 mt-1 pt-1">
                            <span>CAMBIO:</span>
                            <span>{formatCurrency(parseFloat(sale.recibido) - total)}</span>
                        </div>
                    </>
                )}
            </div>

            <div className="text-center mt-8 space-y-1">
                <p className="font-bold">¡GRACIAS POR SU COMPRA!</p>
                <p className="text-[10px]">Vuelva pronto</p>
                <div className="border-b border-dashed my-4" />
            </div>
        </div>
    );
});
