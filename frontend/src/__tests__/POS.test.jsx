import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { POS } from '../pages/POS';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';

// Mock de servicios
vi.mock('../services/api', () => ({
    productService: {
        search: vi.fn(),
        getByBarcode: vi.fn(),
    },
    saleService: {
        create: vi.fn(),
    }
}));

// Mock del Hook de escáner
vi.mock('../hooks/useBarcodeScanner', () => ({
    useBarcodeScanner: vi.fn(),
}));

describe('Componente POS', () => {
    it('debería renderizar el mensaje de carrito vacío al inicio', () => {
        render(
            <BrowserRouter>
                <POS />
            </BrowserRouter>
        );

        expect(screen.getByText(/El carrito está vacío/i)).toBeDefined();
        expect(screen.getByText(/Ticket de Venta/i)).toBeDefined();
    });

    it('debería mostrar el buscador de productos', () => {
        render(
            <BrowserRouter>
                <POS />
            </BrowserRouter>
        );

        expect(screen.getByPlaceholderText(/Buscar por nombre o código/i)).toBeDefined();
        expect(screen.getByRole('button', { name: /Buscar/i })).toBeDefined();
    });
});
