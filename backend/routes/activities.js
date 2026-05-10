const express = require('express');
const { query } = require('express-validator');
const activityController = require('../controllers/activityController');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get(
  '/search',
  [
    query('search').optional().trim().isLength({ max: 100 }).withMessage('Search must be 100 characters or less'),
    query('category').optional().trim().isLength({ max: 80 }).withMessage('Category must be 80 characters or less'),
    query('city_id').optional().isInt({ min: 1 }).withMessage('City id must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
  ],
  validate,
  asyncHandler(activityController.searchActivitiesGlobally)
);

module.exports = router;
