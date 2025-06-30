import Review from "../models/reviewModel.js";
import Booking from "../models/bookingModel.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

import { deleteOne, updateOne, createOne, getOne, getAll } from './handlerFactory.js';

export const createReview = createOne(Review);
export const updateReview = updateOne(Review);
export const deleteReview = deleteOne(Review);

export const getReview = getOne(Review);
export const getAllReviews = getAll(Review);

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
  const { tourId } = req.params;
  const userId = req.user.id;

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

  req.body.tour = tourId;
  req.body.user = userId;
  next();
});