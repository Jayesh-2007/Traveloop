const express = require('express');
const { param } = require('express-validator');
const shareController = require('../controllers/shareController');
const requireAuth = require('../middleware/auth');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

const tokenValidation = [
  param('token')
    .trim()
    .isLength({ min: 20, max: 128 })
    .withMessage('Share token is invalid')
];

router.get('/:token', tokenValidation, validate, asyncHandler(shareController.getPublicItinerary));

router.post(
  '/:token/copy',
  tokenValidation,
  validate,
  requireAuth,
  asyncHandler(shareController.copyPublicTrip)
);

module.exports = router;
