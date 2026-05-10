const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
};

const REQUIRED_ENV_KEYS = [
  'DB_HOST',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME',
  'DB_PORT',
  'JWT_SECRET',
  'JWT_EXPIRES_IN'
];

const SEEDED_TABLES = [
  'budget_caps',
  'notes',
  'packing_items',
  'stop_activities',
  'activities',
  'stops',
  'trips',
  'cities',
  'users'
];

module.exports = {
  HTTP_STATUS,
  REQUIRED_ENV_KEYS,
  SEEDED_TABLES
};
