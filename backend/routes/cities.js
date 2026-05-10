const express = require('express');
const { param, query } = require('express-validator');
const activityController = require('../controllers/activityController');
const cityController = require('../controllers/cityController');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

const limitValidation = query('limit')
  .optional()
  .isInt({ min: 1, max: 50 })
  .withMessage('Limit must be between 1 and 50');

router.get(
  '/',
  [
    query('search').optional().trim().isLength({ max: 100 }).withMessage('Search must be 100 characters or less'),
    query('country').optional().trim().isLength({ max: 120 }).withMessage('Country must be 120 characters or less'),
    query('region').optional().trim().isLength({ max: 50 }).withMessage('Region must be 50 characters or less'),
    query('sort').optional().isIn(['name', 'country', 'activities']).withMessage('Sort must be name, country, or activities'),
    limitValidation
  ],
  validate,
  asyncHandler(cityController.getCities)
);

router.get(
  '/:id/activities',
  [
    param('id').isInt({ min: 1 }).withMessage('City id must be a positive integer'),
    query('category').optional().trim().isLength({ max: 80 }).withMessage('Category must be 80 characters or less'),
    query('search').optional().trim().isLength({ max: 100 }).withMessage('Search must be 100 characters or less'),
    limitValidation
  ],
  validate,
  asyncHandler(activityController.getCityActivities)
);

router.get(
  '/:id',
  [param('id').isInt({ min: 1 }).withMessage('City id must be a positive integer')],
  validate,
  asyncHandler(cityController.getCityById)
);

module.exports = router;
