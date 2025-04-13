import Tour from "../models/tourModel.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

export const getOverview = catchAsync (async (req, res, next) => {
	const tours = await Tour.find();

	res.status(200).render('overview', {
		title: 'All Tours',
		tours,
	});
});

export const getTour = catchAsync (async (req, res, next) => {
	const tour = await Tour.findOne({ slug: req.params.slug }).populate({
		path: 'reviews',
		fields: 'review rating user',
	});
	if (!tour) {
		return next(new AppError('No tour found with that name', 404));
	}
	
	res.status(200).render('tour', {
		title: tour.name,
		tour,
		reviews: tour.reviews,
	});
});