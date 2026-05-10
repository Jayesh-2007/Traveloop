const crypto = require('crypto');
const logger = require('../utils/logger');

function requestLogger(req, res, next) {
  const startedAt = Date.now();
  const requestId = req.headers['x-request-id'] || crypto.randomUUID();
  const shouldSkipHealthLog = req.originalUrl === '/api/health' && process.env.LOG_HEALTH_CHECKS !== 'true';

  req.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);

  res.on('finish', () => {
    if (shouldSkipHealthLog) {
      return;
    }

    const durationMs = Date.now() - startedAt;
    const logMethod = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';

    logger[logMethod]('request completed', {
      requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs,
      userId: req.user ? req.user.id : null
    });
  });

  return next();
}

module.exports = requestLogger;
