import { User } from "../models/userModel.js";
import catchAsync from "../utils/catchAsync.js";

export const signup = catchAsync(async (req, res) => {
	const newUser = await User.create(req.body);

	res.status(201).json({
		status: "success",
		data: {
			user: newUser,
		},
	});
});