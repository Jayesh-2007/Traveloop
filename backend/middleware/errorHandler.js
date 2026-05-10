const { HTTP_STATUS } = require('../config/constants');
const { sendError } = require('../utils/apiResponse');
const logger = require('../utils/logger');

function notFound(req, res) {
  return sendError(res, HTTP_STATUS.NOT_FOUND, 'Route not found');
}

function errorHandler(error, req, res, next) {
  const isJsonSyntaxError = error instanceof SyntaxError && error.status === HTTP_STATUS.BAD_REQUEST && 'body' in error;
  const isDatabaseError = typeof error.code === 'string' && error.code.startsWith('ER_');
  const statusCode = isJsonSyntaxError
    ? HTTP_STATUS.BAD_REQUEST
    : error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message = statusCode === HTTP_STATUS.INTERNAL_SERVER_ERROR
    ? isDatabaseError
      ? 'Database operation failed'
      : 'Internal server error'
    : isJsonSyntaxError
      ? 'Malformed JSON request body'
      : error.message;

  if (statusCode === HTTP_STATUS.INTERNAL_SERVER_ERROR) {
    logger.error('unhandled request error', {
      requestId: req.requestId,
      method: req.method,
      path: req.originalUrl,
      errorCode: error.code,
      message: error.message
    });
  }

  return sendError(res, statusCode, message, error.errors || []);
}

module.exports = {
  notFound,
  errorHandler
};
