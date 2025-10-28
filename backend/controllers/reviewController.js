import Review from "../models/reviewModel.js";
import Booking from "../models/bookingModel.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

import { deleteOne, createOne, getOne, getAll } from './handlerFactory.js';

export const createReview = createOne(Review);
export const getReview = getOne(Review);
export const getAllReviews = getAll(Review);

// Middleware to check if user owns the review
export const checkReviewOwnership = catchAsync(async (req, res, next) => {
  // Admins can manage any review
  if (req.user && req.user.role === 'admin') return next();

  const review = await Review.findById(req.params.id);
  
  if (!review) {
    return next(new AppError('No review found with that ID', 404));
  }
  
  // Check if current user owns this review
  if (review.user.id !== req.user.id) {
    return next(new AppError('You can only modify your own reviews', 403));
  }
  
  next();
});

// Use direct update to avoid middleware issues
export const updateReview = catchAsync(async (req, res, next) => {
  try {
    // Use updateOne directly on the model to avoid middleware issues
    const result = await Review.updateOne(
      { _id: req.params.id },
      { $set: req.body },
      { runValidators: true }
    );
    
    if (result.matchedCount === 0) {
      return next(new AppError('No review found with that ID', 404));
    }
    
    // Get the updated document to return
    const updatedReview = await Review.findById(req.params.id);
    
    res.status(200).json({
      status: 'success',
      data: {
        data: updatedReview,
      },
    });
  } catch (err) {
    console.error('Update review error:', err);
    return next(new AppError(`Error updating review: ${err.message}`, 500));
  }
});

// Simple deletion without middleware hooks
export const deleteReview = catchAsync(async (req, res, next) => {
  // Use deleteOne directly on the model, bypassing middleware
  const result = await Review.deleteOne({ _id: req.params.id });
  
  if (result.deletedCount === 0) {
    return next(new AppError('No review found with that ID', 404));
  }
  
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

export const setTourUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

// Get all reviews by the current user
export const getUserReviews = catchAsync(async (req, res, next) => {
  const reviews = await Review.find({ user: req.user.id }).populate({
    path: 'tour',
    select: 'name slug imageCover duration difficulty price'
  });

  res.status(200).json({
    status: 'success',
    results: reviews.length,
    data: {
      reviews
    }
  });
});

// Check if user can review a tour (must have a paid booking)
export const checkCanReview = catchAsync(async (req, res, next) => {
  // Support both nested route params and direct body payloads
  const tourId = req.params.tourId || req.body.tour;
  const userId = req.user.id;

  if (!tourId) {
    return next(new AppError('A tourId is required to create a review', 400));
  }

  // Check if user has a paid booking for this tour
  const booking = await Booking.findOne({
    user: userId,
    tour: tourId,
    paid: true
  });

  if (!booking) {
    return next(new AppError('You can only review tours that you have booked and paid for', 403));
  }

  // Check if user already reviewed this tour
  const existingReview = await Review.findOne({
    user: userId,
    tour: tourId
  });

  if (existingReview) {
    return next(new AppError('You have already reviewed this tour', 400));
  }

  // Normalize request body
  req.body.tour = tourId;
  req.body.user = userId;
  next();
});