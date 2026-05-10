require('dotenv').config();

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const logger = require('../utils/logger');
const validateEnv = require('../utils/envValidator');
const { assertSafeDatabaseName, getDatabaseConfigFromEnv } = require('../utils/devHelpers');

async function runSqlFile(connection, fileName) {
  const filePath = path.join(__dirname, '..', fileName);
  const sql = fs.readFileSync(filePath, 'utf8');
  await connection.query(sql);
}

async function resetDatabase() {
  validateEnv();

  const dbConfig = getDatabaseConfigFromEnv();
  assertSafeDatabaseName(dbConfig.database);

  const connection = await mysql.createConnection({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
    port: dbConfig.port,
    multipleStatements: true
  });

  try {
    logger.warn('resetting database', { database: dbConfig.database });

    await connection.query(`DROP DATABASE IF EXISTS \`${dbConfig.database}\``);
    await runSqlFile(connection, 'schema.sql');
    await runSqlFile(connection, 'seed.sql');

    logger.info('database reset complete', { database: dbConfig.database });
  } finally {
    await connection.end();
  }
}

resetDatabase().catch((error) => {
  logger.error('database reset failed', { message: error.message });
  process.exit(1);
});
