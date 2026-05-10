require('dotenv').config();

const cors = require('cors');
const express = require('express');
const activityRoutes = require('./routes/activities');
const authRoutes = require('./routes/auth');
const cityRoutes = require('./routes/cities');
const shareRoutes = require('./routes/share');
const tripRoutes = require('./routes/trips');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const requestLogger = require('./middleware/requestLogger');
const { attachApiResponse } = require('./utils/apiResponse');
const validateEnv = require('./utils/envValidator');

const app = express();
const PORT = process.env.PORT || 5000;

validateEnv();

app.use(cors());
app.use(express.json());
app.use(attachApiResponse);
app.use(requestLogger);

app.use('/api/auth', authRoutes);
app.use('/api/cities', cityRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/share', shareRoutes);

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Traveloop backend running on port ${PORT}`);
});
