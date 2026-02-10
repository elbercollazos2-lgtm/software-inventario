/**
 * Servicio de Inteligencia de Precios
 * Encargado de cálculos de margen y validación de rentabilidad.
 */

const pricingService = {
    /**
     * Calcula el precio de venta sugerido basado en el costo y el margen deseado.
     * Fórmula: Venta = Costo / (1 - (Margen / 100))
     * O una más simple: Venta = Costo * (1 + (Margen / 100))
     * Usaremos la segunda por ser más común en retail pequeño.
     */
    calculateSuggestedPrice(costo, margenPorcentaje) {
        if (!costo || isNaN(costo)) return 0;
        const margen = parseFloat(margenPorcentaje) || 0;
        return parseFloat((costo * (1 + (margen / 100))).toFixed(2));
    },

    /**
     * Valida que el precio de venta no genere pérdidas.
     */
    validateProfitability(costo, venta) {
        return (parseFloat(venta) >= parseFloat(costo));
    }
};

module.exports = pricingService;
