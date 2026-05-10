const pool = require('../config/db');
const { HTTP_STATUS } = require('../config/constants');
const { sendError } = require('../utils/apiResponse');
const { verifyToken } = require('../utils/token');

async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, HTTP_STATUS.UNAUTHORIZED, 'Authentication token is required');
  }

  const token = authHeader.split(' ')[1];
  let decoded;

  try {
    decoded = verifyToken(token);
  } catch (error) {
    return sendError(res, HTTP_STATUS.UNAUTHORIZED, 'Invalid or expired authentication token');
  }

  try {
    const [users] = await pool.query(
      'SELECT id, name, email, created_at FROM users WHERE id = ? LIMIT 1',
      [decoded.id]
    );

    if (users.length === 0) {
      return sendError(res, HTTP_STATUS.UNAUTHORIZED, 'User not found');
    }

    req.user = users[0];
    return next();
  } catch (error) {
    return sendError(res, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Server error during authentication');
  }
}

module.exports = requireAuth;
