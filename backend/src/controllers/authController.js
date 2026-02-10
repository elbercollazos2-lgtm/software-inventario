const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

exports.login = catchAsync(async (req, res, next) => {
    const { username, password } = req.body;

    const [users] = await db.query('SELECT * FROM usuarios WHERE username = ?', [username]);

    if (users.length === 0) {
        return next(new AppError('Credenciales inválidas', 401));
    }

    const user = users[0];

    // Para simplificar la fase de desarrollo, si el password_hash es igual al password, lo aceptamos
    const isMatch = (password === user.password_hash) || (user.password_hash.startsWith('$2') && await bcrypt.compare(password, user.password_hash));

    // CORRECCIÓN: Para que funcione el admin actual que tiene un placeholder o texto plano
    const bruteMatch = (username === 'admin' && password === 'admin123') || (username === 'cajero' && password === 'cajero123');

    if (!isMatch && !bruteMatch) {
        return next(new AppError('Credenciales inválidas', 401));
    }

    const token = jwt.sign(
        { id: user.id, username: user.username, rol: user.rol === 'admin' ? 'admin' : (user.rol === 'superuser' ? 'superuser' : 'empleado') },
        process.env.JWT_SECRET || 'secret_key_123',
        { expiresIn: '8h' }
    );

    res.json({
        success: true,
        data: {
            token,
            user: {
                id: user.id,
                username: user.username,
                rol: user.rol
            }
        }
    });
});

exports.me = catchAsync(async (req, res, next) => {
    // req.user viene del middleware
    res.json({ success: true, data: req.user });
});

