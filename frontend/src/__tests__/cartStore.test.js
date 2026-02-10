import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from '../store/useCartStore';

describe('useCartStore', () => {
    beforeEach(() => {
        useCartStore.getState().clearCart();
    });

    it('debería iniciar con un carrito vacío', () => {
        expect(useCartStore.getState().cart).toEqual([]);
    });

    it('debería agregar un producto nuevo al carrito', () => {
        const product = { id: 1, nombre: 'Test Product', precio: 100 };
        useCartStore.getState().addItem(product);

        const cart = useCartStore.getState().cart;
        expect(cart.length).toBe(1);
        expect(cart[0]).toEqual({ ...product, quantity: 1 });
    });

    it('debería incrementar la cantidad si el producto ya existe', () => {
        const product = { id: 1, nombre: 'Test Product', precio: 100 };
        useCartStore.getState().addItem(product);
        useCartStore.getState().addItem(product);

        const cart = useCartStore.getState().cart;
        expect(cart.length).toBe(1);
        expect(cart[0].quantity).toBe(2);
    });

    it('debería calcular el total correctamente', () => {
        useCartStore.getState().addItem({ id: 1, nombre: 'P1', precio: 100 });
        useCartStore.getState().addItem({ id: 2, nombre: 'P2', precio: 50 });
        useCartStore.getState().updateQuantity(1, 2); // 2 * 100 = 200

        expect(useCartStore.getState().getTotal()).toBe(250);
    });

    it('debería eliminar un producto si la cantidad llega a 0', () => {
        const product = { id: 1, nombre: 'P1', precio: 100 };
        useCartStore.getState().addItem(product);
        useCartStore.getState().updateQuantity(1, 0);

        expect(useCartStore.getState().cart.length).toBe(0);
    });

    it('debería limpiar el carrito', () => {
        useCartStore.getState().addItem({ id: 1, nombre: 'P1', precio: 100 });
        useCartStore.getState().clearCart();
        expect(useCartStore.getState().cart.length).toBe(0);
    });
});
