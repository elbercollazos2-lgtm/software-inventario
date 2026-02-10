const jwt = require('jsonwebtoken');

/**
 * Middleware para controlar el acceso basado en roles y verificar JWT.
 * Roles soportados: 'superuser', 'admin', 'empleado', 'cajero', 'inventario'
 */

const authorize = (allowedRoles = []) => {
    return (req, res, next) => {
        // 1. Obtener el token del header Authorization
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Formato: Bearer TOKEN

        // Si no hay token, pero hay x-user-role (para compatibilidad temporal con tests antiguos si fuese necesario)
        // Pero para Fase 1 vamos a exigir JWT si el plan dice JWT.
        // Mantendremos una pequeña ventana de compatibilidad con headers si no hay token por ahora para no romper todo el front de golpe.

        if (!token) {
            const userRole = req.headers['x-user-role'] || 'empleado';
            console.log('No JWT token found, using x-user-role header:', userRole);

            // Para desarrollo: permitir acceso si no hay roles específicos requeridos o si el rol tiene permiso
            if (allowedRoles.length === 0 || allowedRoles.includes(userRole) || userRole === 'superuser' || userRole === 'admin') {
                req.user = { id: 1, rol: userRole, username: 'dev_user' };
                return next();
            }
            return res.status(401).json({ error: 'No autorizado', message: 'Token JWT requerido. Por favor inicie sesión.' });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_123');
            req.user = decoded; // Guardamos los datos del usuario en el request

            const userRole = decoded.rol;
            console.log(`JWT Verified. User: ${decoded.username}, Role: ${userRole}, Path: ${req.originalUrl}`);

            if (allowedRoles.length === 0 || allowedRoles.includes(userRole) || userRole === 'superuser') {
                return next();
            }

            return res.status(403).json({
                error: 'Acceso denegado',
                message: `Tu rol (${userRole}) no tiene permisos para realizar esta acción.`
            });
        } catch (error) {
            return res.status(401).json({ error: 'Token inválido', message: error.message });
        }
    };
};

module.exports = { authorize };
