import User from '../models/userModel.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

import multer from 'multer';
import sharp from 'sharp';

import { deleteOne, updateOne, getOne, getAll } from './handlerFactory.js';

export const updateUser = updateOne(User); // doesn't update password
export const deleteUser = deleteOne(User);

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

export const getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

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
	await User.findByIdAndUpdate(req.user.id, { active: false });

	res.status(204).json({
		status: 'success',
		data: null
	});
});