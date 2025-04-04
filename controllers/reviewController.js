import Review from "../models/reviewModel.js";
import catchAsync from "../utils/catchAsync.js";

import { deleteOne, updateOne, createOne } from './handlerFactory.js';

export const getAllReviews = catchAsync(async (req, res, next) => {
	// Allow for nested GET reviews on tour (hack)
	let filter = {};
	if (req.params.tourId) filter = { tour: req.params.tourId };

	const reviews = await Review.find(filter);

	res.status(200).json({
		status: "success",
		results: reviews.length,
		data: {
			reviews,
		},
	});
});

export const setTourUserIds = (req, res, next) => {
  // Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

export const createReview = createOne(Review);
export const updateReview = updateOne(Review);
export const deleteReview = deleteOne(Review);