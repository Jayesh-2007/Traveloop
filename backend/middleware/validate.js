const { validationResult } = require('express-validator');
const { HTTP_STATUS } = require('../config/constants');
const { sendError } = require('../utils/apiResponse');

function validate(req, res, next) {
  const result = validationResult(req);

  if (result.isEmpty()) {
    return next();
  }

  return sendError(
    res,
    HTTP_STATUS.BAD_REQUEST,
    'Validation failed',
    result.array().map((error) => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }))
  );
}

module.exports = validate;
