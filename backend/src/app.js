const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./config/db');
const helmet = require('helmet');
const apiRoutes = require('./routes');

dotenv.config();

const app = express();

// Logger ultra-simple al inicio
app.use((req, res, next) => {
    console.log(`>>> REQ: ${req.method} ${req.url}`);
    next();
});

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', apiRoutes);
app.get('/', (req, res) => {
    res.json({
        message: 'API del Sistema Contable de Supermercado',
        status: 'Online',
        timestamp: new Date()
    });
});

const AppError = require('./utils/AppError');
const globalErrorHandler = require('./controllers/errorController');

app.get('/api/health', async (req, res, next) => {
    try {
        const [rows] = await db.query('SELECT 1 as val');
        res.json({
            server: 'UP',
            database: rows[0].val === 1 ? 'CONNECTED' : 'ERROR'
        });
    } catch (error) {
        return next(new AppError(`Database connection failed: ${error.message}`, 500));
    }
});

// Handle unhandled routes
app.all(/(.*)/, (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
app.use(globalErrorHandler);

module.exports = app;
