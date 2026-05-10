function normalizeResponse(body) {
  if (!body || typeof body !== 'object' || typeof body.success !== 'boolean') {
    return body;
  }

  if (body.success && !Object.prototype.hasOwnProperty.call(body, 'data')) {
    return {
      ...body,
      data: null
    };
  }

  if (!body.success && !Object.prototype.hasOwnProperty.call(body, 'errors')) {
    return {
      ...body,
      errors: []
    };
  }

  return body;
}

function sendSuccess(res, statusCode, message, data = null) {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
}

function sendError(res, statusCode, message, errors = []) {
  return res.status(statusCode).json({
    success: false,
    message,
    errors
  });
}

function attachApiResponse(req, res, next) {
  const originalJson = res.json.bind(res);

  res.success = (statusCode, message, data = null) => sendSuccess(res, statusCode, message, data);
  res.error = (statusCode, message, errors = []) => sendError(res, statusCode, message, errors);
  res.json = (body) => originalJson(normalizeResponse(body));

  return next();
}

module.exports = {
  attachApiResponse,
  normalizeResponse,
  sendSuccess,
  sendError
};
