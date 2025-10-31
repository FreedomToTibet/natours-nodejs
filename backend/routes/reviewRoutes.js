import express from 'express';
import * as reviewController from '../controllers/reviewController.js';
import * as authController from '../controllers/authController.js';

const router = express.Router({ mergeParams: true });
router.use(authController.protect);

// Get all reviews by current user
router.get('/my-reviews', reviewController.getUserReviews);

// Test endpoint to check if reviews exist (temporary)
router.get('/test-count', async (req, res) => {
  try {
    const Review = (await import('../models/reviewModel.js')).default;
    const count = await Review.countDocuments();
    const reviews = await Review.find().limit(5);
    res.json({ 
      status: 'success', 
      count, 
      sampleReviews: reviews 
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error', 
      message: error.message 
    });
  }
});

router
  .route('/')
  .get(
    authController.restrictTo('user', 'guide', 'lead-guide', 'admin'),
    reviewController.getAllReviews
  )
  .post(
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    // Enforce that users can only review tours they've paid for,
    // including via nested route /tours/:tourId/reviews
    reviewController.checkCanReview,
    reviewController.createReview
  );

// Special route for creating review with tour validation
router.post(
  '/tour/:tourId',
  authController.restrictTo('user'),
  reviewController.checkCanReview,
  reviewController.createReview
);

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.checkReviewOwnership,
    reviewController.updateReview
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.checkReviewOwnership,
    reviewController.deleteReview
  );

export default router;
