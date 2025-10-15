import multer from 'multer';
import sharp from 'sharp';

import Tour from '../models/tourModel.js';

import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import { deleteOne, updateOne, createOne, getOne, getAll } from './handlerFactory.js';

export const createTour = createOne(Tour);
export const updateTour = updateOne(Tour);
export const deleteTour = deleteOne(Tour);

export const getTour = getOne(Tour, { path: 'reviews' });
export const getAllTours = getAll(Tour);

import User from '../models/userModel.js';

// Middleware to resolve guide emails to user IDs
export const resolveGuideEmails = catchAsync(async (req, res, next) => {
	console.log('Resolving guide emails...');
	
	// Handle case where guides is a string (not an array)
	if (typeof req.body.guides === 'string' && req.body.guides.trim() !== '') {
		console.log('Converting guides from string to array:', req.body.guides);
		req.body.guides = [req.body.guides];
		console.log('Converted guides to array:', req.body.guides);
	}
	
	if (req.body.guides && Array.isArray(req.body.guides)) {
		const resolvedGuides = [];
		
		// Process each guide entry (which could be an ID or email)
		for (const guide of req.body.guides) {
			// Skip empty entries
			if (!guide || guide.trim === undefined || guide.trim() === '') continue;
			
			// Check if the guide is an email or ID
			if (guide.includes('@')) {
				// It's an email, try to find the user
				console.log(`Looking up guide by email: ${guide}`);
				const user = await User.findOne({ email: guide });
				
				if (user) {
					console.log(`Found user with email ${guide}: ${user.id}`);
					resolvedGuides.push(user.id);
				} else {
					console.log(`No user found with email ${guide}`);
					return next(new AppError(`No user found with email ${guide}. Make sure the email is correct.`, 400));
				}
			} else {
				// Assume it's already an ID
				console.log(`Using guide ID directly: ${guide}`);
				resolvedGuides.push(guide);
			}
		}
		
		// Replace the guides array with resolved IDs
		req.body.guides = resolvedGuides;
		console.log('Resolved guides:', req.body.guides);
	}
	
	next();
});

	// Admin: Reassign the lead guide of a tour by email
	export const reassignLeadGuide = catchAsync(async (req, res, next) => {
		const { id } = req.params;
		const { email } = req.body || {};

		if (!email) {
			return next(new AppError('Please provide an email of the new lead guide.', 400));
		}

		// 1) Find tour
		const tour = await Tour.findById(id);
		if (!tour) {
			return next(new AppError('No tour found with that ID', 404));
		}

		// 2) Find user by email and validate role
		const user = await User.findOne({ email });
		if (!user) {
			return next(new AppError(`No user found with email ${email}`, 404));
		}
		if (user.role !== 'lead-guide') {
			return next(new AppError('Provided email does not belong to a lead guide.', 400));
		}

		// 3) Ensure user is at the front of guides array
		const userIdStr = user._id.toString();
		const existingIds = (tour.guides || []).map(g => g.toString());

		// Remove any existing occurrence of this user
		const filtered = existingIds.filter(gid => gid !== userIdStr);
		// Put new lead guide at the front
		const newGuides = [user._id, ...filtered];

		tour.guides = newGuides;
		await tour.save({ validateModifiedOnly: true });

		// Populate minimal guide info for response
		const updatedTour = await Tour.findById(tour._id).populate({
			path: 'guides',
			select: 'name email photo role'
		});

		res.status(200).json({
			status: 'success',
			data: {
				tour: updatedTour
			}
		});
	});
// Middleware to automatically add lead-guide as a guide when creating a tour
export const setLeadGuide = (req, res, next) => {
	console.log('Setting lead guide...');
	
	// This middleware ensures that when a lead-guide creates a tour,
	// they are automatically added as the first guide.
	if (req.user && (req.user.role === 'lead-guide' || req.user.role === 'admin')) {
		console.log('User is a lead-guide or admin, adding as first guide');
		
		// Handle string case - convert to array first
		if (typeof req.body.guides === 'string' && req.body.guides.trim() !== '') {
			console.log('Converting guides from string to array in setLeadGuide:', req.body.guides);
			req.body.guides = [req.body.guides];
		}
		
		if (!req.body.guides || !Array.isArray(req.body.guides)) {
			// If no guides or invalid guides provided, create the array with the lead-guide
			console.log('No guides or invalid guides, setting to lead guide only');
			req.body.guides = [req.user.id];
		} else if (!req.body.guides.includes(req.user.id)) {
			// If other guides are provided, add the lead-guide to the beginning of the array
			console.log('Adding lead guide to beginning of guides array');
			req.body.guides = [req.user.id, ...req.body.guides];
		}
		
		console.log('Final guides array:', req.body.guides);
	}
	next();
};

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

export const uploadTourImages = upload.fields([
	{ name: 'imageCover', maxCount: 1 },
	{ name: 'images', maxCount: 3 }
]);

export const resizeTourImages = catchAsync(async (req, res, next) => {
	console.log('Processing tour images...');
	console.log('Request files:', req.files);
	console.log('Request body before processing:', req.body);
	
	try {
		// Parse JSON strings for nested objects
		if (req.body.startLocation && typeof req.body.startLocation === 'string') {
			try {
				req.body.startLocation = JSON.parse(req.body.startLocation);
				console.log('Parsed startLocation:', req.body.startLocation);
			} catch (e) {
				console.error('Error parsing startLocation JSON:', e);
			}
		}
		
		if (req.body.locations && typeof req.body.locations === 'string') {
			try {
				req.body.locations = JSON.parse(req.body.locations);
				console.log('Parsed locations:', req.body.locations);
			} catch (e) {
				console.error('Error parsing locations JSON:', e);
			}
		}
		
		// Ensure startDates is an array
		if (req.body.startDates && !Array.isArray(req.body.startDates)) {
			console.log('Converting startDates to array:', req.body.startDates);
			req.body.startDates = [req.body.startDates];
			console.log('Converted startDates to array:', req.body.startDates);
		}
		
		const imagePath = `../frontend/public/img/tours`;

		// Process imageCover if it exists
		if (req.files && req.files.imageCover) {
			const tourId = req.params.id || 'new';
			req.body.imageCover = `tour-${tourId}-${Date.now()}.jpeg`;
			
			console.log(`Saving cover image to: ${imagePath}/${req.body.imageCover}`);
			
			await sharp(req.files.imageCover[0].buffer)
				.resize(500, 333)
				.toFormat('jpeg')
				.jpeg({ quality: 90 })
				.toFile(`${imagePath}/${req.body.imageCover}`);
				
			console.log('Cover image processed successfully');
		}

		// Process images if they exist
		if (req.files && req.files.images) {
			const tourId = req.params.id || 'new';
			req.body.images = [];
			
			await Promise.all(
				req.files.images.map(async (file, i) => {
					const filename = `tour-${tourId}-${Date.now()}-${i + 1}.jpeg`;
					console.log(`Saving tour image ${i+1} to: ${imagePath}/${filename}`);
					
					await sharp(file.buffer)
						.resize(500, 333)
						.toFormat('jpeg')
						.jpeg({ quality: 90 })
						.toFile(`${imagePath}/${filename}`);
						
					req.body.images.push(filename);
				})
			);
			
			console.log('All tour images processed successfully');
		}
		
		console.log('Request body after processing:', req.body);
		next();
	} catch (error) {
		console.error('Error processing tour images:', error);
		return next(new AppError('Error processing tour images. Please try again.', 500));
	}
});

export const aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

export const getTourStats = catchAsync(async (req, res, next) => {
  
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          _id: { $toUpper: '$difficulty' },
          numTours: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      {
        $sort: { avgPrice: 1 },
      },
      // {
      // 	$match: { _id: { $ne: 'EASY' } }
      // }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        stats,
      },
    });
});

export const getMonthlyPlan = catchAsync(async (req, res, next) => {
 
    const year = req.params.year * 1;

    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates',
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' },
          numTourStarts: { $sum: 1 },
          tours: { $push: '$name' },
        },
      },
      {
        $addFields: { month: '$_id' },
      },
      {
        $project: {
          _id: 0,
        },
      },
      {
        $sort: { numTourStarts: -1 },
      },
      {
        $limit: 12,
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        plan,
      },
    });
});

export const updateAllTourDates = catchAsync(async (req, res, next) => {
 
    const year = req.params.year;
    // First, get all tours
    const tours = await Tour.find();

    // Filter tours that have startDates containing 2021
    const toursToUpdate = tours.filter((tour) =>
      tour.startDates.some((date) => date.toString().includes(year))
    );

    // Update each matching tour
    const updatePromises = toursToUpdate.map((tour) => {
      const newDates = tour.startDates.map((date) => {
        const dateStr = date.toString();
        return dateStr.includes(year) ? dateStr.replace(year, '2024') : dateStr;
      });

      return Tour.findByIdAndUpdate(
        tour._id,
        { startDates: newDates },
        { new: true }
      );
    });

    const updatedTours = await Promise.all(updatePromises);

    res.status(200).json({
      status: 'success',
      results: updatedTours.length,
      data: {
        message: `Updated ${updatedTours.length} tours`,
      },
    });
});

export const getToursWithin = catchAsync(async (req, res, next) => {
 
		const { distance, latlng, unit } = req.params;
		const [lat, lng] = latlng.split(',');
		const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

		if (!lat || !lng) {
			return next(new AppError('Please provide latitude and longitude in the format lat,lng.', 400));
		}

		const tours = await Tour.find({
			startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
		});

		res.status(200).json({
			status: 'success',
			results: tours.length,
			data: {
				data: tours,
			},
		});
});

export const getDistances = catchAsync(async (req, res, next) => {
 
		const { latlng, unit } = req.params;
		const [lat, lng] = latlng.split(',');
		const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

		if (!lat || !lng) {
			return next(new AppError('Please provide latitude and longitude in the format lat,lng.', 400));
		}

		const distances = await Tour.aggregate([
			{
				$geoNear: {
					near: {
						type: 'Point',
						coordinates: [lng * 1, lat * 1],
					},
					distanceField: 'distance',
					distanceMultiplier: multiplier,
					spherical: true,
				},
			},
			{
				$project: {
					distance: 1,
					name: 1,
				},
			},
		]);

		res.status(200).json({
			status: 'success',
			data: {
				data: distances,
			},
		});
});

// Get tours where current user is a guide
export const getMyGuideTours = catchAsync(async (req, res, next) => {
	const tours = await Tour.find({ guides: req.user.id })
		.populate({
			path: 'guides',
			select: 'name photo role email'
		})
		.select('-__v');

	res.status(200).json({
		status: 'success',
		results: tours.length,
		data: {
			tours
		}
	});
});