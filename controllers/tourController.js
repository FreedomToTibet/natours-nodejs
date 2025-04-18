import Tour from '../models/tourModel.js';

import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import APIFeatures from '../utils/apiFeatures.js';

import { deleteOne, updateOne, createOne, getOne, getAll } from './handlerFactory.js';

export const createTour = createOne(Tour);
export const updateTour = updateOne(Tour);
export const deleteTour = deleteOne(Tour);

export const getTour = getOne(Tour, { path: 'reviews' });
export const getAllTours = getAll(Tour);

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