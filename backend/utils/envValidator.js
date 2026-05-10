const { LOG_LEVELS, REQUIRED_ENV_KEYS } = require('../config/constants');

function validateEnv() {
  const missingKeys = REQUIRED_ENV_KEYS.filter((key) => (
    !Object.prototype.hasOwnProperty.call(process.env, key)
  ));

  if (missingKeys.length > 0) {
    throw new Error(`Missing required environment variables: ${missingKeys.join(', ')}`);
  }

  const port = Number(process.env.PORT || 5000);
  const dbPort = Number(process.env.DB_PORT);
  const logLevel = process.env.LOG_LEVEL || 'info';

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error('PORT must be a positive number');
  }

  if (!Number.isInteger(dbPort) || dbPort <= 0) {
    throw new Error('DB_PORT must be a positive number');
  }

  if (process.env.JWT_SECRET.length < 16) {
    throw new Error('JWT_SECRET must be at least 16 characters long');
  }

  if (!LOG_LEVELS.includes(logLevel)) {
    throw new Error(`LOG_LEVEL must be one of: ${LOG_LEVELS.join(', ')}`);
  }
}

module.exports = validateEnv;
