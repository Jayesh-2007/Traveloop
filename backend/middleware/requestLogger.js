const crypto = require('crypto');
const logger = require('../utils/logger');

function requestLogger(req, res, next) {
  const startedAt = Date.now();
  const requestId = req.headers['x-request-id'] || crypto.randomUUID();

  req.requestId = requestId;
  res.setHeader('X-Request-Id', requestId);

  res.on('finish', () => {
    const durationMs = Date.now() - startedAt;

    logger.info('request completed', {
      requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs
    });
  });

  return next();
}

module.exports = requestLogger;
