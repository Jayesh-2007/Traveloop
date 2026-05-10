function assertSafeDatabaseName(databaseName) {
  if (!/^[A-Za-z0-9_]+$/.test(databaseName)) {
    throw new Error('DB_NAME may only contain letters, numbers, and underscores');
  }
}

function maskSecret(value) {
  if (!value) {
    return '';
  }

  if (value.length <= 4) {
    return '****';
  }

  return `${value.slice(0, 2)}****${value.slice(-2)}`;
}

function getDatabaseConfigFromEnv() {
  return {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT || 3306)
  };
}

module.exports = {
  assertSafeDatabaseName,
  getDatabaseConfigFromEnv,
  maskSecret
};
