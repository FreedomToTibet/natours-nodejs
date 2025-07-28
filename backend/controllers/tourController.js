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

// Middleware to automatically add lead-guide as a guide when creating a tour
export const setLeadGuide = (req, res, next) => {
	// This middleware ensures that when a lead-guide creates a tour,
	// they are automatically added as the first guide.
	if (req.user && req.user.role === 'lead-guide') {
		if (!req.body.guides) {
			// If no guides are provided, create the array with the lead-guide.
			req.body.guides = [req.user.id];
		} else if (!req.body.guides.includes(req.user.id)) {
			// If other guides are provided, add the lead-guide to the beginning of the array.
			req.body.guides.unshift(req.user.id);
		}
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