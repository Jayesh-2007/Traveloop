function notFound(req, res) {
  return res.status(404).json({
    success: false,
    message: 'Route not found'
  });
}

function errorHandler(error, req, res, next) {
  const statusCode = error.statusCode || 500;

  return res.status(statusCode).json({
    success: false,
    message: statusCode === 500 ? 'Internal server error' : error.message
  });
}

module.exports = {
  notFound,
  errorHandler
};
