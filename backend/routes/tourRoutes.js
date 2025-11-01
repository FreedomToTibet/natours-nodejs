import express from 'express';
import * as tourController from './../controllers/tourController.js';
import * as authController from './../controllers/authController.js';
import reviewRouter from './reviewRoutes.js';

const router = express.Router();

// router.param('id', tourController.checkID);

router.use('/:tourId/reviews', reviewRouter);

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);

router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan
  );

// Get tours assigned to current guide
router
  .route('/my-guide-tours')
  .get(
    authController.protect,
    authController.restrictTo('guide', 'lead-guide', 'admin'),
    tourController.getMyGuideTours
  );

router
	.route('/tours-within/:distance/center/:latlng/unit/:unit')
	.get(tourController.getToursWithin);

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

// Admin or lead-guide only: bulk update tour dates for a given year
router
  .route('/update-dates/:year')
  .put(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.updateAllTourDates
  );

router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.resolveGuideEmails,
    tourController.setLeadGuide,
    tourController.createTour
  );

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
		tourController.uploadTourImages,
		tourController.resizeTourImages,
    tourController.resolveGuideEmails,
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

// Lead-guide and admin: manage tour capacity
router.patch(
  '/:id/capacity',
  authController.protect,
  authController.restrictTo('lead-guide', 'admin'),
  tourController.updateTourCapacity
);

// Lead-guide and admin: assign guide to tour
router.post(
  '/:id/assign-guide',
  authController.protect,
  authController.restrictTo('lead-guide', 'admin'),
  tourController.assignGuideToTour
);

// Lead-guide and admin: unassign guide from tour
router.delete(
  '/:id/guides/:guideId',
  authController.protect,
  authController.restrictTo('lead-guide', 'admin'),
  tourController.unassignGuideFromTour
);

// Admin-only: reassign lead guide of a tour by email
router.post(
  '/:id/reassign-lead-guide',
  authController.protect,
  authController.restrictTo('admin'),
  tourController.reassignLeadGuide
);

export default router;
