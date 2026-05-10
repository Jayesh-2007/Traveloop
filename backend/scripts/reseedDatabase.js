require('dotenv').config();

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const { SEEDED_TABLES } = require('../config/constants');
const logger = require('../utils/logger');
const validateEnv = require('../utils/envValidator');
const { assertSafeDatabaseName, getDatabaseConfigFromEnv } = require('../utils/devHelpers');

async function reseedDatabase() {
  validateEnv();

  const dbConfig = getDatabaseConfigFromEnv();
  assertSafeDatabaseName(dbConfig.database);

  const connection = await mysql.createConnection({
    ...dbConfig,
    multipleStatements: true
  });

  try {
    logger.warn('reseed will clear seeded tables', { database: dbConfig.database });

    await connection.beginTransaction();
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');

    for (const table of SEEDED_TABLES) {
      await connection.query(`TRUNCATE TABLE \`${table}\``);
    }

    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    const seedPath = path.join(__dirname, '..', 'seed.sql');
    await connection.query(fs.readFileSync(seedPath, 'utf8'));

    await connection.commit();

    logger.info('database reseed complete', { database: dbConfig.database });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    await connection.end();
  }
}

reseedDatabase().catch((error) => {
  logger.error('database reseed failed', { message: error.message });
  process.exit(1);
});
