import express from 'express';
import * as reviewController from '../controllers/reviewController.js';
import * as authController from '../controllers/authController.js';

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
		authController.protect,
		authController.restrictTo('user'),
		reviewController.setTourUserIds,
		reviewController.createReview);

export default router;
