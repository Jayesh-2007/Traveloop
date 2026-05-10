const { REQUIRED_ENV_KEYS } = require('../config/constants');

function validateEnv() {
  const missingKeys = REQUIRED_ENV_KEYS.filter((key) => (
    !Object.prototype.hasOwnProperty.call(process.env, key)
  ));

  if (missingKeys.length > 0) {
    throw new Error(`Missing required environment variables: ${missingKeys.join(', ')}`);
  }

  const dbPort = Number(process.env.DB_PORT);

  if (!Number.isInteger(dbPort) || dbPort <= 0) {
    throw new Error('DB_PORT must be a positive number');
  }

  if (process.env.JWT_SECRET.length < 16) {
    throw new Error('JWT_SECRET must be at least 16 characters long');
  }
}

module.exports = validateEnv;
