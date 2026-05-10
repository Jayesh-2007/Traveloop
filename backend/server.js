require('dotenv').config();

const cors = require('cors');
const express = require('express');
const activityRoutes = require('./routes/activities');
const authRoutes = require('./routes/auth');
const cityRoutes = require('./routes/cities');
const tripRoutes = require('./routes/trips');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/cities', cityRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/trips', tripRoutes);

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.use((error, req, res, next) => {
  return res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

app.listen(PORT, () => {
  console.log(`Traveloop backend running on port ${PORT}`);
});
