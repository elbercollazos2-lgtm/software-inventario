const Config = require('../models/Config');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

const configController = {
    getAll: catchAsync(async (req, res, next) => {
        const configs = await Config.getAll();
        res.json(configs);
    }),

    update: catchAsync(async (req, res, next) => {
        const updatedConfigs = await Config.update(req.body);
        res.json(updatedConfigs);
    })
};

module.exports = configController;

