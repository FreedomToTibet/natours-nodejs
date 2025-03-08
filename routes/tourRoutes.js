import express from 'express';
import * as tourController from './../controllers/tourController.js';
import * as authController from './../controllers/authController.js';

const router = express.Router();

// router.param('id', tourController.checkID);

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

export default router;