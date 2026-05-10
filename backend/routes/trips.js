const express = require('express');
const { body, param } = require('express-validator');
const budgetController = require('../controllers/budgetController');
const itineraryController = require('../controllers/itineraryController');
const shareController = require('../controllers/shareController');
const stopController = require('../controllers/stopController');
const tripController = require('../controllers/tripController');
const requireAuth = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

const tripIdValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Trip id must be a positive integer')
];

const stopIdValidation = [
  param('stopId')
    .isInt({ min: 1 })
    .withMessage('Stop id must be a positive integer')
];

const stopBodyValidation = [
  body('city_id')
    .notEmpty()
    .withMessage('City id is required')
    .isInt({ min: 1 })
    .withMessage('City id must be a positive integer'),
  body('start_date')
    .notEmpty()
    .withMessage('Start date is required')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Start date must use YYYY-MM-DD format')
    .isISO8601({ strict: true })
    .withMessage('Start date must be a valid YYYY-MM-DD date'),
  body('end_date')
    .notEmpty()
    .withMessage('End date is required')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('End date must use YYYY-MM-DD format')
    .isISO8601({ strict: true })
    .withMessage('End date must be a valid YYYY-MM-DD date')
    .custom((endDate, { req }) => {
      if (!req.body.start_date) {
        return true;
      }

      if (new Date(endDate) <= new Date(req.body.start_date)) {
        throw new Error('End date must be after start date');
      }

      return true;
    }),
  body('stop_order')
    .notEmpty()
    .withMessage('Stop order is required')
    .isInt({ min: 1 })
    .withMessage('Stop order must be a positive integer')
    .toInt()
];

const reorderStopsValidation = [
  body('stop_ids')
    .isArray({ min: 1 })
    .withMessage('Stop ids must be a non-empty array'),
  body('stop_ids.*')
    .isInt({ min: 1 })
    .withMessage('Each stop id must be a positive integer')
    .toInt()
];

const assignActivityValidation = [
  body('activity_id')
    .notEmpty()
    .withMessage('Activity id is required')
    .isInt({ min: 1 })
    .withMessage('Activity id must be a positive integer'),
  body('activity_order')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Activity order must be a positive integer')
    .toInt(),
  body('scheduled_date')
    .optional({ nullable: true, checkFalsy: true })
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Scheduled date must use YYYY-MM-DD format')
    .isISO8601({ strict: true })
    .withMessage('Scheduled date must be a valid YYYY-MM-DD date'),
  body('start_time')
    .optional({ nullable: true, checkFalsy: true })
    .matches(/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/)
    .withMessage('Start time must use HH:mm or HH:mm:ss format')
];

const tripBodyValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 3, max: 150 })
    .withMessage('Name must be between 3 and 150 characters'),
  body('start_date')
    .notEmpty()
    .withMessage('Start date is required')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Start date must use YYYY-MM-DD format')
    .isISO8601({ strict: true })
    .withMessage('Start date must be a valid YYYY-MM-DD date'),
  body('end_date')
    .notEmpty()
    .withMessage('End date is required')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('End date must use YYYY-MM-DD format')
    .isISO8601({ strict: true })
    .withMessage('End date must be a valid YYYY-MM-DD date')
    .custom((endDate, { req }) => {
      if (!req.body.start_date) {
        return true;
      }

      if (new Date(endDate) <= new Date(req.body.start_date)) {
        throw new Error('End date must be after start date');
      }

      return true;
    }),
  body('description')
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must be 1000 characters or less'),
  body('is_public')
    .optional()
    .isBoolean()
    .withMessage('Is public must be a boolean')
    .toBoolean()
];

router.use(requireAuth);

router.post('/', tripBodyValidation, validate, tripController.createTrip);

router.get('/', tripController.getTrips);

router.post(
  '/:id/stops',
  [...tripIdValidation, ...stopBodyValidation],
  validate,
  stopController.addStop
);

router.get('/:id/stops', tripIdValidation, validate, stopController.getStops);

router.put(
  '/:id/stops/reorder',
  [...tripIdValidation, ...reorderStopsValidation],
  validate,
  stopController.reorderStops
);

router.post(
  '/:id/stops/:stopId/activities',
  [...tripIdValidation, ...stopIdValidation, ...assignActivityValidation],
  validate,
  stopController.assignActivityToStop
);

router.put(
  '/:id/stops/:stopId',
  [...tripIdValidation, ...stopIdValidation, ...stopBodyValidation],
  validate,
  stopController.updateStop
);

router.delete(
  '/:id/stops/:stopId',
  [...tripIdValidation, ...stopIdValidation],
  validate,
  stopController.deleteStop
);

router.get('/:id/itinerary', tripIdValidation, validate, itineraryController.getItinerary);

router.get('/:id/export', tripIdValidation, validate, tripController.exportTrip);

router.post('/:id/share', tripIdValidation, validate, shareController.enableSharing);

router.delete('/:id/share', tripIdValidation, validate, shareController.disableSharing);

router.get('/:id/budget', tripIdValidation, validate, budgetController.getTripBudget);

router.post(
  '/:id/budget-cap',
  [
    ...tripIdValidation,
    body('amount')
      .notEmpty()
      .withMessage('Budget amount is required')
      .isFloat({ min: 0 })
      .withMessage('Budget amount must be 0 or greater'),
    body('currency_code')
      .optional()
      .trim()
      .isLength({ min: 3, max: 3 })
      .withMessage('Currency code must be 3 characters')
      .isAlpha()
      .withMessage('Currency code must contain only letters')
  ],
  validate,
  budgetController.setBudgetCap
);

router.get(
  '/:id/budget-status',
  tripIdValidation,
  validate,
  budgetController.getBudgetStatus
);

router.get('/:id', tripIdValidation, validate, tripController.getTripById);

router.put(
  '/:id',
  [...tripIdValidation, ...tripBodyValidation],
  validate,
  tripController.updateTrip
);

router.delete('/:id', tripIdValidation, validate, tripController.deleteTrip);

module.exports = router;
