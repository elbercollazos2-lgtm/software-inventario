const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

const usuariosController = {
    getAll: catchAsync(async (req, res, next) => {
        const usuarios = await Usuario.findAll();
        res.json(usuarios);
    }),

    getById: catchAsync(async (req, res, next) => {
        const usuario = await Usuario.findById(req.params.id);
        if (!usuario) {
            return next(new AppError('Usuario no encontrado', 404));
        }
        res.json(usuario);
    }),

    create: catchAsync(async (req, res, next) => {
        const { nombre, username, password, rol } = req.body;

        if (!username || !password) {
            return next(new AppError('Username y password son requeridos', 400));
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const nuevoUsuario = await Usuario.create({
            nombre,
            username,
            password_hash,
            rol
        });

        res.status(201).json(nuevoUsuario);
    }),

    update: catchAsync(async (req, res, next) => {
        const { password, ...data } = req.body;

        if (password) {
            const salt = await bcrypt.genSalt(10);
            data.password_hash = await bcrypt.hash(password, salt);
        }

        const usuario = await Usuario.update(req.params.id, data);
        if (!usuario) {
            return next(new AppError('Usuario no encontrado', 404));
        }
        res.json(usuario);
    }),

    resetPassword: catchAsync(async (req, res, next) => {
        const { password } = req.body;
        if (!password) {
            return next(new AppError('La nueva contraseña es requerida', 400));
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const result = await Usuario.updatePassword(req.params.id, password_hash);
        if (!result) {
            return next(new AppError('Usuario no encontrado', 404));
        }
        res.json({ message: 'Contraseña restablecida correctamente' });
    }),

    delete: catchAsync(async (req, res, next) => {
        // No permitir borrar al administrador principal (id 1) si es necesario
        if (req.params.id === '1') {
            return next(new AppError('No se puede eliminar al administrador principal del sistema', 403));
        }

        const result = await Usuario.delete(req.params.id);
        if (!result) {
            return next(new AppError('Usuario no encontrado', 404));
        }
        res.json({ message: 'Usuario eliminado correctamente' });
    })
};

module.exports = usuariosController;

