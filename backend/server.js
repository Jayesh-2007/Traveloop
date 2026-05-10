require('dotenv').config();

const cors = require('cors');
const express = require('express');
const activityRoutes = require('./routes/activities');
const authRoutes = require('./routes/auth');
const cityRoutes = require('./routes/cities');
const pool = require('./config/db');
const shareRoutes = require('./routes/share');
const tripRoutes = require('./routes/trips');
const { HTTP_STATUS } = require('./config/constants');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const requestLogger = require('./middleware/requestLogger');
const { attachApiResponse } = require('./utils/apiResponse');
const validateEnv = require('./utils/envValidator');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 5000;

validateEnv();

const corsOptions = process.env.FRONTEND_URL
  ? { origin: process.env.FRONTEND_URL.split(',').map((origin) => origin.trim()) }
  : {};

app.use(cors(corsOptions));
app.use(express.json());
app.use(attachApiResponse);
app.use(requestLogger);

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');

    return res.success(HTTP_STATUS.OK, 'Traveloop API is healthy', {
      status: 'ok',
      database: 'connected',
      uptime_seconds: Math.round(process.uptime()),
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    return res.error(HTTP_STATUS.SERVICE_UNAVAILABLE, 'Traveloop API is running, but database is unavailable', [
      {
        field: 'database',
        message: 'Check MySQL service and backend .env credentials'
      }
    ]);
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/cities', cityRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/share', shareRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  logger.info('Traveloop backend started', {
    port: Number(PORT),
    baseUrl: `http://localhost:${PORT}`,
    apiBaseUrl: `http://localhost:${PORT}/api`,
    frontendUrl: process.env.FRONTEND_URL || 'any origin allowed in local development'
  });
});
