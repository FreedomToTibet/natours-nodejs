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

router
	.route('/tour-stats')
	.get(tourController.getTourStats);

router
	.route('/monthly-plan/:year')
	.get(tourController.getMonthlyPlan);

router
	.route('/update-dates/:year')
	.put(tourController.updateAllTourDates);

router
	.route('/')
	.get(authController.protect, tourController.getAllTours)
	.post(tourController.createTour);

router
	.route('/:id')
	.get(tourController.getTour)
	.patch(tourController.updateTour)
	.delete(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.deleteTour);


// router
//   .route('/:tourId/reviews')
//   .post(
//     authController.protect,
//     authController.restrictTo('user'),
//     reviewController.createReview
//   );


export default router;