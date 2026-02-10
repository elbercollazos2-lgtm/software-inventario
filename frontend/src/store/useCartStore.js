import { create } from 'zustand';

export const useCartStore = create((set, get) => ({
    cart: [],
    addItem: (product) => {
        const { cart } = get();
        const existingItem = cart.find((item) => item.id === product.id);

        if (existingItem) {
            set({
                cart: cart.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                ),
            });
        } else {
            set({ cart: [...cart, { ...product, quantity: 1 }] });
        }
    },
    removeItem: (productId) => {
        set({ cart: get().cart.filter((item) => item.id !== productId) });
    },
    updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
            get().removeItem(productId);
            return;
        }
        set({
            cart: get().cart.map((item) =>
                item.id === productId ? { ...item, quantity } : item
            ),
        });
    },
    clearCart: () => set({ cart: [] }),
    getTotal: () => {
        return get().cart.reduce((total, item) => total + (item.precio_venta || item.precio || 0) * item.quantity, 0);
    },
}));
