import User from '../models/userModel.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

import multer from 'multer';
import sharp from 'sharp';

import { deleteOne, updateOne, getOne, getAll } from './handlerFactory.js';

// Helper to count active admins
const countActiveAdmins = async () => {
	return User.countDocuments({ role: 'admin', active: { $ne: false } });
};

// Prevent demoting the last remaining admin
export const updateUser = catchAsync(async (req, res, next) => {
	const targetUserId = req.params.id;

	// If role is being changed and target is admin, ensure not last admin
	if (Object.prototype.hasOwnProperty.call(req.body, 'role')) {
		const userBefore = await User.findById(targetUserId).select('role active');
		if (userBefore && userBefore.role === 'admin' && req.body.role !== 'admin') {
			const adminCount = await countActiveAdmins();
			if (adminCount <= 1) {
				return next(new AppError('Operation blocked: cannot demote the last remaining admin.', 400));
			}
		}
	}

	const updated = await User.findByIdAndUpdate(targetUserId, req.body, {
		new: true,
		runValidators: true,
	});

	if (!updated) {
		return next(new AppError('No document found with that ID', 404));
	}

	res.status(200).json({
		status: 'success',
		data: { data: updated },
	});
});

// Prevent deleting the last remaining admin
export const deleteUser = catchAsync(async (req, res, next) => {
	const target = await User.findById(req.params.id).select('role active');
	if (target && target.role === 'admin') {
		const adminCount = await countActiveAdmins();
		if (adminCount <= 1) {
			return next(new AppError('Operation blocked: cannot delete the last remaining admin.', 400));
		}
	}

	const doc = await User.findByIdAndDelete(req.params.id);
	if (!doc) {
		return next(new AppError('No document found with that ID', 404));
	}
	res.status(204).json({ status: 'success', data: null });
});

export const getUser = getOne(User);
export const getAllUsers = getAll(User);

// Verify if an email belongs to a lead guide
export const verifyLeadGuide = catchAsync(async (req, res, next) => {
  try {
    console.log('Verify lead guide request received:', req.body);
    
    // Check if email was provided
    const { email } = req.body;
    
    if (!email) {
      console.log('No email provided');
      return next(new AppError('Please provide an email address', 400));
    }
    
    console.log(`Looking up user with email: ${email}`);
    
    // Find the user by email
    const user = await User.findOne({ email });
    
    console.log('User found:', user ? `${user.name} (${user.role})` : 'No user found');
    
    // Return the result
    res.status(200).json({
      status: 'success',
      data: {
        isLeadGuide: user && user.role === 'lead-guide',
        name: user ? user.name : null,
        email: user ? user.email : null,
        photo: user ? user.photo : null
      }
    });
  } catch (error) {
    console.error('Error in verifyLeadGuide:', error);
    next(error);
  }
});

// const multerStorage = multer.diskStorage({
// 	destination: (req, file, cb) => {
// 		cb(null, 'public/img/users');
// 	},
// 	filename: (req, file, cb) => {
// 		const ext = file.mimetype.split('/')[1];
// 		cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
// 	}
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
	if (file.mimetype.startsWith('image')) {
		cb(null, true);
	} else {
		cb(new AppError('Not an image! Please upload only images.', 400), false);
	}
}

const upload = multer({
	storage: multerStorage,
	fileFilter: multerFilter
});

export const uploadUserPhoto = upload.single('photo');

export const resizeUserPhoto = catchAsync(async (req, res, next) => {
	if (!req.file) return next();

	// 1) Create filename
	req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

	// 2) Process the image
	const processedImage = sharp(req.file.buffer)
		.resize(500, 500)
		.toFormat('jpeg')
		.jpeg({ quality: 90 });

	// 3) Save to both backend and frontend directories
	await Promise.all([
		processedImage.clone().toFile(`public/img/users/${req.file.filename}`),
		processedImage.clone().toFile(`../frontend/public/img/users/${req.file.filename}`)
	]);

	next();
});

const filterObj = (obj, ...allowedFields) => {
	const newObj = {};
	Object.keys(obj).forEach((el) => {
		if (allowedFields.includes(el)) newObj[el] = obj[el];
	});
	return newObj;
};

export const createUser = (res, req) => {
	res.status(500).json({
		status: 'error',
		message: 'This route is not yet defined! Please use /signup instead!'
	});
};

export const getMe = catchAsync(async (req, res, next) => {
  let selectFields = '';
  
  // Include availability fields for guides
  if (['guide', 'lead-guide', 'admin'].includes(req.user.role)) {
    selectFields = '+available +availabilityNote +unavailableDates';
  }
  
  const user = await User.findById(req.user.id).select(selectFields);
  
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      data: user
    }
  });
});

export const updateMe = catchAsync(async (req, res, next) => {
	// 1) Create error if user POSTs password data
	if (req.body.password || req.body.passwordConfirm) {
		return next(
			new AppError(
				'This route is not for password updates. Please use /updateMyPassword.',
				400
			)
		);
	}

	// 2) Filtered out unwanted fields names that are not allowed to be updated
	const filteredBody = filterObj(req.body, 'name', 'email');
	if (req.file) filteredBody.photo = req.file.filename;

	// 3) Update user document
	const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
		new: true,
		runValidators: true
	});

	res.status(200).json({
		status: 'success',
		data: {
			user: updatedUser
		}
	});
});

export const deleteMe = catchAsync(async (req, res, next) => {
		// Prevent deactivating the last remaining admin
		const me = await User.findById(req.user.id).select('role active');
		if (me && me.role === 'admin') {
			const adminCount = await countActiveAdmins();
			if (adminCount <= 1) {
				return next(new AppError('Operation blocked: cannot deactivate the last remaining admin.', 400));
			}
		}

		await User.findByIdAndUpdate(req.user.id, { active: false });

	res.status(204).json({
		status: 'success',
		data: null
	});
});

// Update guide availability status
export const updateAvailability = catchAsync(async (req, res, next) => {
	// Only guides, lead-guides, and admins can update availability
	if (!['guide', 'lead-guide', 'admin'].includes(req.user.role)) {
		return next(new AppError('Only guides can update availability status', 403));
	}

	const { available, availabilityNote } = req.body;

	// Validate input
	if (typeof available !== 'boolean') {
		return next(new AppError('Available status must be true or false', 400));
	}

	const updatedUser = await User.findByIdAndUpdate(
		req.user.id,
		{ 
			available,
			availabilityNote: availabilityNote || ''
		},
		{
			new: true,
			runValidators: true,
			select: '+available +availabilityNote'
		}
	);

	res.status(200).json({
		status: 'success',
		data: {
			user: {
				id: updatedUser._id,
				name: updatedUser.name,
				available: updatedUser.available,
				availabilityNote: updatedUser.availabilityNote
			}
		}
	});
});

// Add unavailable date range
export const addUnavailableDate = catchAsync(async (req, res, next) => {
	// Only guides, lead-guides, and admins can add unavailable dates
	if (!['guide', 'lead-guide', 'admin'].includes(req.user.role)) {
		return next(new AppError('Only guides can manage unavailable dates', 403));
	}

	const { startDate, endDate, reason } = req.body;

	// Validate dates
	if (!startDate || !endDate) {
		return next(new AppError('Start date and end date are required', 400));
	}

	const start = new Date(startDate);
	const end = new Date(endDate);

	if (start >= end) {
		return next(new AppError('End date must be after start date', 400));
	}

	if (start < new Date()) {
		return next(new AppError('Start date cannot be in the past', 400));
	}

	const user = await User.findById(req.user.id);
	
	// Check for overlapping dates
	const hasOverlap = user.unavailableDates.some(dateRange => {
		const existingStart = new Date(dateRange.startDate);
		const existingEnd = new Date(dateRange.endDate);
		
		return (start <= existingEnd && end >= existingStart);
	});

	if (hasOverlap) {
		return next(new AppError('Date range overlaps with existing unavailable dates', 400));
	}

	user.unavailableDates.push({
		startDate: start,
		endDate: end,
		reason: reason || ''
	});

	await user.save();

	res.status(200).json({
		status: 'success',
		data: {
			unavailableDates: user.unavailableDates
		}
	});
});

// Remove unavailable date range
export const removeUnavailableDate = catchAsync(async (req, res, next) => {
	// Only guides, lead-guides, and admins can remove unavailable dates
	if (!['guide', 'lead-guide', 'admin'].includes(req.user.role)) {
		return next(new AppError('Only guides can manage unavailable dates', 403));
	}

	const { dateId } = req.params;

	const user = await User.findById(req.user.id);
	
	const dateIndex = user.unavailableDates.findIndex(
		dateRange => dateRange._id.toString() === dateId
	);

	if (dateIndex === -1) {
		return next(new AppError('Unavailable date not found', 404));
	}

	user.unavailableDates.splice(dateIndex, 1);
	await user.save();

	res.status(200).json({
		status: 'success',
		data: {
			unavailableDates: user.unavailableDates
		}
	});
});

// Get guide availability info
export const getMyAvailability = catchAsync(async (req, res, next) => {
	// Only guides, lead-guides, and admins can view availability
	if (!['guide', 'lead-guide', 'admin'].includes(req.user.role)) {
		return next(new AppError('Only guides can view availability status', 403));
	}

	const user = await User.findById(req.user.id).select('+available +availabilityNote +unavailableDates');

	res.status(200).json({
		status: 'success',
		data: {
			available: user.available,
			availabilityNote: user.availabilityNote,
			unavailableDates: user.unavailableDates
		}
	});
});