import axios from 'axios';
// Axios instance configuration
const api = axios.create({
    baseURL: 'http://localhost:4000/api',
});

// Interceptor para añadir el token JWT a todas las peticiones
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Interceptor para manejar errores (ej. 401 Unauthorized)
import { toast } from 'sonner';

// Interceptor para manejar errores (ej. 401 Unauthorized, 400 Bad Request, 500 Server Error)
api.interceptors.response.use((response) => {
    return response;
}, (error) => {
    const { response } = error;

    // Default error message
    let message = 'Ocurrió un error inesperado';

    if (response) {
        // Handle 401 Unauthorized
        if (response.status === 401) {
            console.warn('Sesión expirada o no autorizada. Redirigiendo a login...');
            localStorage.clear();
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
            // For 401, we might not want to show a toast if we are redirecting, or maybe a subtle one. 
            // constant redirects might cause toast spam. Let's show it only if not already on login
            if (!window.location.pathname.includes('/login')) {
                toast.error('Sesión expirada. Por favor inicie sesión nuevamente.');
            }
            return Promise.reject(error);
        }

        // Extract message from new backend error format (AppError)
        // Expected format: { status: 'error'/'fail', message: '...', ... }
        if (response.data && response.data.message) {
            message = response.data.message;
        } else if (response.statusText) {
            message = response.statusText;
        }
    } else if (error.request) {
        // The request was made but no response was received
        message = 'No se pudo contactar con el servidor. Verifique su conexión.';
    } else if (error.message) {
        // Something happened in setting up the request that triggered an Error
        message = error.message;
    }

    // Display toast notification for non-401 errors or all errors
    // We already handled 401 above.
    if (!response || response.status !== 401) {
        toast.error(message);
    }

    console.error('API Error:', message);

    // Attach the formatted message to the error object so components can display it easily
    error.formattedMessage = message;

    return Promise.reject(error);
});


export const productService = {
    getAll: (config = {}) => api.get('/productos', config),
    getFavorites: (config = {}) => api.get('/productos/favoritos', config),
    search: (query, config = {}) => api.get(`/productos?search=${query}`, config),
    getByBarcode: (barcode, config = {}) => api.get(`/productos/barcode/${barcode}`, config),
    create: (data, config = {}) => api.post('/productos', data, config),
    update: (id, data, config = {}) => api.put(`/productos/${id}`, data, config),
    delete: (id, config = {}) => api.delete(`/productos/${id}`, config),
};

export const categoriasService = {
    getAll: (config = {}) => api.get('/categorias', config),
    create: (data, config = {}) => api.post('/categorias', data, config),
    update: (id, data, config = {}) => api.put(`/categorias/${id}`, data, config),
    delete: (id, config = {}) => api.delete(`/categorias/${id}`, config),
};

export const proveedoresService = {
    getAll: (config = {}) => api.get('/proveedores', config),
    create: (data, config = {}) => api.post('/proveedores', data, config),
    update: (id, data, config = {}) => api.put(`/proveedores/${id}`, data, config),
    delete: (id, config = {}) => api.delete(`/proveedores/${id}`, config),
};

export const saleService = {
    create: (saleData, config = {}) => api.post('/sales', saleData, config),
};

export const authService = {
    login: (credentials) => api.post('/auth/login', credentials),
};

export const bodegasService = {
    getAll: (config = {}) => api.get('/bodegas', config),
    create: (data, config = {}) => api.post('/bodegas', data, config),
    update: (id, data, config = {}) => api.put(`/bodegas/${id}`, data, config),
    delete: (id, config = {}) => api.delete(`/bodegas/${id}`, config),
};

export const gruposService = {
    getAll: (config = {}) => api.get('/grupos-inv', config),
    create: (data, config = {}) => api.post('/grupos-inv', data, config),
    update: (id, data, config = {}) => api.put(`/grupos-inv/${id}`, data, config),
    delete: (id, config = {}) => api.delete(`/grupos-inv/${id}`, config),
};

export const comprasService = {
    getAll: (config = {}) => api.get('/compras', config),
    create: (data, config = {}) => api.post('/compras', data, config),
    getById: (id, config = {}) => api.get(`/compras/${id}`, config),
    getDebts: (config = {}) => api.get('/compras/deudas', config),
    getAllPayments: (config = {}) => api.get('/compras/pagos', config),
    addPayment: (data, config = {}) => api.post('/compras/pagos', data, config),
};

export const trasladosService = {
    getAll: (config = {}) => api.get('/traslados', config),
    create: (data, config = {}) => api.post('/traslados', data, config),
};

export const ajustesService = {
    getAll: (config = {}) => api.get('/ajustes', config),
    create: (data, config = {}) => api.post('/ajustes', data, config),
};

export const dashboardService = {
    getStats: (config = {}) => api.get('/dashboard/stats', config),
    getPerformance: (config = {}) => api.get('/dashboard/performance', config),
};

export const inventarioService = {
    registerMovement: (data) => api.post('/inventory/movement', data),
    batchUpload: (data) => api.post('/inventory/batch-upload', data),
    validateBatch: (data) => api.post('/inventory/validate-batch', data),
    getHistory: () => api.get('/inventory/history'),
};

export const configService = {
    getAll: (config = {}) => api.get('/config', config),
    update: (data, config = {}) => api.post('/config', data, config),
};

export const userService = {
    getAll: (config = {}) => api.get('/usuarios', config),
    create: (data, config = {}) => api.post('/usuarios', data, config),
    update: (id, data, config = {}) => api.put(`/usuarios/${id}`, data, config),
    delete: (id, config = {}) => api.delete(`/usuarios/${id}`, config),
    resetPassword: (id, password, config = {}) => api.post(`/usuarios/${id}/reset-password`, { password }, config),
};

export default api;
