import React, { useState, useEffect, useRef } from 'react';
import { Search, ShoppingCart, Trash2, Plus, Minus, CreditCard, Barcode, EyeOff, Calculator, AlertCircle, X, CheckCircle2, Printer, Banknote, Camera, Star } from 'lucide-react';
import { useCartStore } from '../store/useCartStore';
import { useBarcodeScanner } from '../hooks/useBarcodeScanner';
import { productService, saleService, configService } from '../services/api';
import { Button, Input, Card, CardContent, CardHeader, CardTitle, CardFooter } from '../components/ui';
import { Ticket } from '../components/pos/Ticket';
import { CameraScanner } from '../components/pos/CameraScanner';
import { cn, formatCurrency } from '../lib/utils';

export function POS() {
    const [search, setSearch] = useState('');
    const [products, setProducts] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('efectivo');
    const [amountReceived, setAmountReceived] = useState('');
    const [lastSale, setLastSale] = useState(null);
    const [businessInfo, setBusinessInfo] = useState(null);
    const { cart, addItem, removeItem, updateQuantity, clearCart, getTotal } = useCartStore();

    const ticketRef = useRef();

    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            try {
                await Promise.all([
                    fetchBusinessInfo(),
                    fetchFavorites()
                ]);
            } catch (error) {
                console.error('Error loading initial data:', error);
            } finally {
                setLoading(false);
            }
        };
        loadInitialData();
    }, []);

    const fetchFavorites = async () => {
        try {
            const response = await productService.getFavorites();
            setFavorites(response.data || []);
        } catch (error) {
            console.error('Error fetching favorites:', error);
        }
    };

    const fetchBusinessInfo = async () => {
        try {
            const response = await configService.getAll();
            setBusinessInfo(response.data);
        } catch (error) {
            console.error('Error fetching business info:', error);
        }
    };

    const handleSearch = async (searchTerm) => {
        if (!searchTerm) {
            setProducts([]);
            return;
        }
        setLoading(true);
        try {
            const response = await productService.search(searchTerm);
            const activeOnly = Array.isArray(response.data) ? response.data.filter(p => p.activo === 1) : [];
            setProducts(activeOnly);
        } catch (error) {
            console.error('Error searching products:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (search) {
                handleSearch(search);
            } else {
                setProducts([]);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [search]);

    const validateAndAdd = (product) => {
        const initialQty = product.permite_fraccion ? parseFloat(product.venta_minima) : 1;
        const existingItem = cart.find(i => i.id === product.id);
        const currentCartQty = existingItem ? existingItem.quantity : 0;
        const totalNeeded = currentCartQty + initialQty;

        if (product.es_servicio !== 1) {
            if (totalNeeded > product.stock) {
                alert(`⚠️ Error: No hay suficiente stock de "${product.nombre}". Disponible: ${product.stock}`);
                return;
            }
        }

        if (initialQty > product.venta_maxima) {
            alert(`⚠️ Error: La venta mínima supera el límite permitido.`);
            return;
        }

        if (parseFloat(product.precio_venta || 0) === 0) {
            const customPrice = prompt(`Ingrese el precio para "${product.nombre}":`, "");
            if (customPrice === null || isNaN(parseFloat(customPrice))) return;
            addItem({ ...product, precio_venta: parseFloat(customPrice), quantity: initialQty });
        } else {
            addItem({ ...product, quantity: initialQty });
        }
    };

    const handleQuantityChange = (item, newQty) => {
        const qty = parseFloat(newQty);
        if (isNaN(qty) || qty <= 0) return;

        if (item.es_servicio !== 1 && qty > item.stock) {
            alert(`⚠️ No puedes vender más de lo que hay en stock (${item.stock} ${item.unidad_medida}).`);
            return;
        }

        if (!item.permite_fraccion && !Number.isInteger(qty)) return;
        updateQuantity(item.id, qty);
    };

    const onBarcodeScan = async (barcode) => {
        try {
            const response = await productService.getByBarcode(barcode);
            if (response.data && response.data.activo === 1) {
                validateAndAdd(response.data);
            }
        } catch (error) {
            console.error('Error scanning barcode:', error);
        }
    };

    useBarcodeScanner(onBarcodeScan);

    const handlePrepareCheckout = () => {
        if (cart.length === 0) return;
        setAmountReceived(getTotal().toString());
        setIsPaymentModalOpen(true);
    };

    const handleFinalizeSale = async () => {
        setLoading(true);
        try {
            const saleData = {
                items: cart,
                total: getTotal(),
                metodo_pago: paymentMethod,
                recibido: amountReceived,
                usuario_id: 1 // Admin por defecto por ahora
            };

            const response = await saleService.create(saleData);
            setLastSale({ ...response.data, items: cart, metodo_pago: paymentMethod, recibido: amountReceived });
            setIsPaymentModalOpen(false);
            clearCart();
            setProducts([]);
            setSearch('');
        } catch (error) {
            alert('Error al procesar la venta. Revisa el stock disponible.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const total = getTotal();
    const change = parseFloat(amountReceived || 0) - total;

    return (
        <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-100px)] print:hidden">
            {/* Panel Izquierdo: Buscador y Grid */}
            <div className="flex-1 flex flex-col gap-3 overflow-hidden">
                <Card className="flex-shrink-0 border-slate-100 shadow-sm bg-white/80 backdrop-blur-md rounded-xl">
                    <CardContent className="p-2">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <div className="relative flex-1 group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-brand-500" size={16} />
                                <Input
                                    placeholder="Buscar producto..."
                                    className="pl-10 h-9 bg-white border-slate-200 rounded-lg text-sm focus:ring-brand-500"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsCameraOpen(true);
                                        setSearch(''); // Limpiar búsqueda al abrir cámara
                                    }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-brand-500 hover:text-brand-700 p-1 rounded-md hover:bg-brand-50 transition-colors"
                                    title="Escanear con cámara"
                                >
                                    <Camera size={18} />
                                </button>
                            </div>
                            <Button type="submit" disabled={loading} className="h-9 px-4 rounded-lg bg-brand-600 hover:bg-brand-700 text-xs font-bold">
                                {loading ? '...' : 'BUSCAR'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {isCameraOpen && (
                    <CameraScanner
                        onScan={onBarcodeScan}
                        onClose={() => setIsCameraOpen(false)}
                    />
                )}

                <div className="flex-1 overflow-y-auto pr-2">
                    {search ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2">
                            {products.length === 0 && !loading && (
                                <div className="col-span-full flex flex-col items-center justify-center py-16 text-slate-400 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                                    <Barcode size={48} className="mb-3 opacity-20" />
                                    <p className="text-md font-semibold text-slate-500">Sin resultados</p>
                                    <p className="text-xs opacity-60 text-center max-w-xs mt-1">No se encontraron productos para "{search}"</p>
                                </div>
                            )}
                            {products.map((product) => (
                                <ProductCard key={product.id} product={product} onClick={() => validateAndAdd(product)} />
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 mb-2">
                                <Star className="text-amber-400 fill-amber-400" size={16} />
                                <h2 className="text-sm font-black text-slate-800 italic uppercase tracking-tight">Acciones Rápidas</h2>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2">
                                {favorites.length === 0 && !loading && (
                                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-slate-300 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                                        <Star size={32} className="mb-2 opacity-10" />
                                        <p className="text-sm font-medium">No hay productos favoritos configurados</p>
                                    </div>
                                )}
                                {favorites.map((product) => (
                                    <ProductCard key={product.id} product={product} onClick={() => validateAndAdd(product)} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Panel Derecho: Carrito */}
            <Card className="w-full lg:w-[320px] flex flex-col shadow-xl border-slate-100 bg-white rounded-2xl overflow-hidden shrink-0">
                <CardHeader className="p-3 bg-slate-900 text-white flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-sm font-bold">
                            <ShoppingCart size={16} className="text-brand-400" />
                            RESUMEN
                        </CardTitle>
                        <Button variant="ghost" size="sm" onClick={clearCart} className="text-white/60 hover:text-white hover:bg-white/10 rounded-lg h-7 px-1.5">
                            <Trash2 size={16} />
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="flex-1 overflow-y-auto p-0 custom-scrollbar">
                    {cart.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-300 p-12">
                            <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center mb-6">
                                <ShoppingCart size={40} className="opacity-20" />
                            </div>
                            <p className="text-center font-bold text-slate-400">Carrito Vacío</p>
                            <p className="text-center text-xs opacity-60 max-w-[200px] mt-2 italic">Agrega productos para generar una nueva venta</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {cart.map((item) => (
                                <div key={item.id} className="p-2.5 flex flex-col gap-2 group hover:bg-slate-50 transition-all border-l-4 border-l-transparent hover:border-l-brand-500">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-slate-800 text-[11px] leading-tight mb-0.5 line-clamp-1">{item.nombre}</p>
                                            <p className="text-[10px] text-slate-500 font-semibold">{formatCurrency(item.precio_venta || 0)}</p>
                                        </div>
                                        <div className="text-right flex flex-col items-end gap-1">
                                            <p className="font-black text-brand-600 text-xs">{formatCurrency((item.precio_venta || 0) * item.quantity)}</p>
                                            <button onClick={() => removeItem(item.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
                                            <button
                                                onClick={() => handleQuantityChange(item, item.quantity - (item.permite_fraccion ? 0.1 : 1))}
                                                className="w-6 h-6 flex items-center justify-center rounded bg-white shadow-sm hover:bg-slate-50 text-slate-600 transition-all"
                                            >
                                                <Minus size={12} />
                                            </button>
                                            <input
                                                type="number"
                                                step={item.permite_fraccion ? "0.001" : "1"}
                                                value={item.quantity}
                                                onChange={(e) => handleQuantityChange(item, e.target.value)}
                                                className="w-10 text-center text-[10px] font-bold text-slate-800 bg-transparent focus:outline-none"
                                            />
                                            <button
                                                onClick={() => handleQuantityChange(item, item.quantity + (item.permite_fraccion ? 0.1 : 1))}
                                                className="w-6 h-6 flex items-center justify-center rounded bg-brand-600 text-white shadow-sm hover:bg-brand-700 transition-all"
                                            >
                                                <Plus size={12} />
                                            </button>
                                        </div>
                                        <span className="text-[9px] font-bold text-slate-400 tracking-wider mr-1 uppercase">{item.unidad_medida}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>

                <CardFooter className="flex-col border-t bg-slate-50 p-4 space-y-3 flex-shrink-0">
                    <div className="w-full space-y-1">
                        <div className="flex justify-between text-slate-500 font-semibold uppercase text-[9px] tracking-widest">
                            <span>Subtotal</span>
                            <span>{formatCurrency(total)}</span>
                        </div>
                        <div className="flex justify-between text-xl font-black text-slate-900 pt-2 border-t border-dashed border-slate-200">
                            <span className="tracking-tighter italic text-sm">TOTAL</span>
                            <span className="text-brand-600 tracking-tighter">{formatCurrency(total)}</span>
                        </div>
                    </div>
                    <Button
                        className="w-full h-11 text-sm font-bold rounded-xl gap-2 shadow-lg shadow-brand-500/10 active:scale-95 transition-all bg-brand-600 hover:bg-brand-700 font-mono tracking-tight"
                        disabled={cart.length === 0}
                        onClick={handlePrepareCheckout}
                    >
                        <Banknote size={16} />
                        COBRAR TICKET
                    </Button>
                </CardFooter>
            </Card>

            {/* MODAL DE PAGO */}
            {isPaymentModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <Card className="w-full max-w-lg shadow-[0_32px_64px_rgba(0,0,0,0.3)] border-none rounded-[3rem] overflow-hidden animate-in fade-in zoom-in duration-300">
                        <CardHeader className="bg-slate-900 text-white p-6">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-xl font-bold tracking-tight">Finalizar Venta</CardTitle>
                                <button onClick={() => setIsPaymentModalOpen(false)} className="text-white/40 hover:text-white transition-colors">
                                    <X size={20} />
                                </button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-6">
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setPaymentMethod('efectivo')}
                                    className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${paymentMethod === 'efectivo' ? 'bg-brand-50 border-brand-500 text-brand-600 shadow-md' : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100'}`}
                                >
                                    <Banknote size={24} />
                                    <span className="font-bold uppercase text-[10px] tracking-wider">Efectivo</span>
                                </button>
                                <button
                                    onClick={() => setPaymentMethod('tarjeta')}
                                    className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${paymentMethod === 'tarjeta' ? 'bg-blue-50 border-blue-500 text-blue-600 shadow-md' : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100'}`}
                                >
                                    <CreditCard size={24} />
                                    <span className="font-bold uppercase text-[10px] tracking-wider">Tarjeta</span>
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center text-3xl font-black bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                    <span className="text-slate-400 italic text-xl">TOTAL:</span>
                                    <span className="text-brand-600">{formatCurrency(total)}</span>
                                </div>

                                {paymentMethod === 'efectivo' && (
                                    <div className="space-y-3">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Monto Recibido</label>
                                            <Input
                                                type="number"
                                                value={amountReceived}
                                                onChange={(e) => setAmountReceived(e.target.value)}
                                                autoFocus
                                                className="h-14 text-3xl font-black text-center rounded-xl border-slate-200"
                                            />
                                        </div>
                                        <div className={`p-4 rounded-2xl flex justify-between items-center transition-all ${change >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                                            <span className="font-bold text-sm">Su Cambio:</span>
                                            <span className="text-2xl font-black">
                                                {formatCurrency(change >= 0 ? change : 0)}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                        <CardFooter className="p-6 bg-slate-50 flex gap-3">
                            <Button variant="outline" onClick={() => setIsPaymentModalOpen(false)} className="h-12 flex-1 rounded-xl font-bold">Cancelar</Button>
                            <Button
                                disabled={loading || (paymentMethod === 'efectivo' && change < 0)}
                                onClick={handleFinalizeSale}
                                className="h-12 flex-[2] rounded-xl font-bold bg-brand-600 hover:bg-brand-700 shadow-md"
                            >
                                {loading ? '...' : 'FINALIZAR VENTA'}
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            )}

            {lastSale && (
                <div className="fixed inset-0 bg-brand-900/90 backdrop-blur-xl z-[200] flex items-center justify-center p-4">
                    <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
                        <div className="flex flex-col items-center justify-center text-white text-center p-8">
                            <div className="w-24 h-24 rounded-full bg-emerald-500 flex items-center justify-center mb-8 shadow-2xl shadow-emerald-500/50">
                                <CheckCircle2 size={56} />
                            </div>
                            <h2 className="text-5xl font-black tracking-tight mb-4 italic">¡VENTA EXITOSA!</h2>
                            <p className="text-emerald-100 text-lg opacity-80 mb-8 max-w-xs">El inventario se ha actualizado y el registro ha sido guardado en el Kardex.</p>
                            <div className="flex flex-col w-full gap-3">
                                <Button onClick={handlePrint} className="h-14 bg-white text-brand-900 hover:bg-brand-50 rounded-2xl font-bold text-lg gap-2 shadow-lg">
                                    <Printer size={20} />
                                    IMPRIMIR RECIBO
                                </Button>
                                <Button variant="ghost" onClick={() => setLastSale(null)} className="h-14 text-white hover:bg-white/10 rounded-2xl font-bold text-md border border-white/20">
                                    NUEVA VENTA
                                </Button>
                            </div>
                        </div>

                        <div className="bg-white rounded-[3rem] p-4 shadow-2xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-slate-900 opacity-0 group-hover:opacity-5 transition-opacity" />
                            <div className="border-[1.5rem] border-slate-50 h-full rounded-[2rem] flex items-center justify-center overflow-auto p-4 custom-scrollbar">
                                <Ticket sale={lastSale} businessInfo={businessInfo} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="hidden print:block fixed inset-0 bg-white z-[999]">
                <Ticket sale={lastSale} businessInfo={businessInfo} />
            </div>
        </div>
    );
}

const ProductCard = React.memo(({ product, onClick }) => {
    const isOutOfStock = product.es_servicio !== 1 && product.stock <= 0;

    return (
        <div
            onClick={() => !isOutOfStock && onClick()}
            className={cn(
                "relative group flex flex-col p-2.5 rounded-xl border border-slate-200 bg-white transition-all duration-200 select-none",
                isOutOfStock ? "opacity-50 grayscale cursor-not-allowed" : "hover:border-brand-500 hover:shadow-md active:scale-95 cursor-pointer"
            )}
        >
            <div className="flex items-start justify-between gap-1 mb-1.5">
                <h3 className="font-bold text-slate-900 group-hover:text-brand-600 transition-colors text-[10px] leading-tight line-clamp-2 h-7 flex-1">
                    {product.nombre}
                </h3>
                {product.es_favorito === 1 && (
                    <Star size={10} className="text-amber-400 fill-amber-400 shrink-0" />
                )}
            </div>

            <div className="flex items-end justify-between mt-auto">
                <div className="flex flex-col">
                    <span className="text-[11px] font-black text-brand-600 leading-none">
                        {product.precio_venta > 0 ? formatCurrency(product.precio_venta) : 'Var.'}
                    </span>
                </div>
                {product.es_servicio !== 1 && (
                    <span className={cn(
                        "text-[9px] font-bold px-1 rounded flex items-center gap-0.5",
                        product.stock <= 0 ? "text-red-500 bg-red-50" : "text-slate-400 bg-slate-50"
                    )}>
                        {product.stock}
                    </span>
                )}
            </div>

            {/* Badges especiales */}
            <div className="absolute top-0 right-0 p-1 flex gap-1">
                {product.es_servicio === 1 && (
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" title="Servicio" />
                )}
            </div>
        </div>
    );
});
