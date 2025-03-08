import crypto from "crypto";
import jwt from "jsonwebtoken";
import { promisify } from "util";

import { User } from "../models/userModel.js";
import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";

const signToken = (id) => {
	return jwt.sign({ id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES_IN || '90d',
	});
};

const createSendToken = (user, statusCode, res) => {
	const token = signToken(user._id);
	const cookieExpiresIn = parseInt(process.env.JWT_COOKIE_EXPIRES_IN) || 90; 
	const cookieOptions = {
		expires: new Date(Date.now() + cookieExpiresIn * 24 * 60 * 60 * 1000),
		httpOnly: true,
	};
	if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

	res.cookie("jwt", token, cookieOptions);

	// Remove password from output
	user.password = undefined;

	res.status(statusCode).json({
		status: "success",
		token,
		data: {
			user,
		},
	});
};

export const signup = catchAsync(async (req, res) => {
	const newUser = await User.create({
		name: req.body.name,
		email: req.body.email,
		password: req.body.password,
		passwordConfirm: req.body.passwordConfirm,
		role: req.body.role,
	});

	createSendToken(newUser, 201, res);
});

export const login = catchAsync(async (req, res, next) => {
	const { email, password } = req.body;

	// if email and password exist
	if (!email || !password) {
		return next(new AppError("Please provide email and password!", 400));
	}
	// if user exists && password is correct
	const user = await User.findOne({ email }).select("+password");

	if (!user || !(await user.correctPassword(password, user.password))) {
		return next(new AppError("Incorrect email or password", 401));
	}

	// if everything is ok, send token to client
	createSendToken(user, 200, res);
});

export const protect = catchAsync(async (req, res, next) => {
	// 1) Getting token and check if it's there
	let token;
	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith("Bearer")
	) {
		token = req.headers.authorization.split(" ")[1];
	}
	if (!token) {
		return next(
			new AppError("You are not logged in! Please log in to get access.", 401)
		);
	}

	// 2) Verification token
	const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

	// 3) Check if user still exists
	const currentUser = await User.findById(decoded.id);
	if (!currentUser) {
		return next(
			new AppError(
				"The user belonging to this token does no longer exist.",
				401
			)
		);
	}

	// 4) Check if user changed password after the token was issued
	if (currentUser.changedPasswordAfter(decoded.iat)) {
		return next(
			new AppError("User recently changed password! Please log in again.", 401)
		);
	}

	// Grant access to protected route
	req.user = currentUser;
	next();
});

export const restrictTo = (...roles) => {
	return (req, res, next) => {
		// roles ['admin', 'lead-guide']. role='user'
		if (!roles.includes(req.user.role)) {
			return next(
				new AppError("You do not have permission to perform this action", 403)
			);
		}

		next();
	};
};