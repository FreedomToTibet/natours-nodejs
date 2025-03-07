import jwt from "jsonwebtoken";

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