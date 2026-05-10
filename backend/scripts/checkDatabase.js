require('dotenv').config();

const mysql = require('mysql2/promise');
const logger = require('../utils/logger');
const validateEnv = require('../utils/envValidator');
const { getDatabaseConfigFromEnv } = require('../utils/devHelpers');

const DEMO_TABLES = ['users', 'cities', 'activities', 'trips', 'stops'];

async function countRows(connection, table) {
  const [rows] = await connection.query(`SELECT COUNT(*) AS count FROM \`${table}\``);
  return Number(rows[0].count);
}

async function checkDatabase() {
  validateEnv();

  const dbConfig = getDatabaseConfigFromEnv();
  const connection = await mysql.createConnection(dbConfig);

  try {
    await connection.ping();

    const counts = {};

    for (const table of DEMO_TABLES) {
      counts[table] = await countRows(connection, table);
    }

    logger.info('database connection ok', {
      database: dbConfig.database,
      host: dbConfig.host,
      port: dbConfig.port,
      counts
    });

    if (counts.users === 0 || counts.cities === 0 || counts.activities === 0) {
      logger.warn('database is reachable but demo data looks incomplete', {
        fix: 'Run npm.cmd run db:reset from backend/'
      });
    }
  } finally {
    await connection.end();
  }
}

checkDatabase().catch((error) => {
  logger.error('database check failed', {
    message: error.message,
    fix: 'Confirm MySQL is running, check backend/.env, then run npm.cmd run db:reset'
  });
  process.exit(1);
});
