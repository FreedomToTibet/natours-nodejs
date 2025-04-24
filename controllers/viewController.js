import Tour from "../models/tourModel.js";
import User from "../models/userModel.js";

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

export const getLoginForm = (req, res) => {
	res.status(200).render('login', {
		title: 'Log into your account',
	});
};

export const getAccount = (req, res) => {
	res.status(200).render('account', {
		title: 'Your account',
		user: req.user,
	});
};

export const updateUserData = catchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email
    },
    {
      new: true,
      runValidators: true
    }
  );

  res.status(200).render('account', {
    title: 'Your account',
    user: updatedUser
  });
});

