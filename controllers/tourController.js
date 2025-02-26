// import { fileURLToPath } from 'url';
// import { dirname } from 'path';
// import fs from 'fs';

import { Tour } from '../models/tourModel.js';
import APIFeatures from '../utils/apiFeatures.js';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

// export const checkID = (req, res, next, val) => {
//   console.log(`Tour id is: ${val}`);

//   if (req.params.id * 1 > tours.length) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid ID'
//     });
//   }
//   next();
// };

// export const checkBody = (req, res, next) => {
//   if (!req.body.name) {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'Missing name'
//     });
//   }
// 	if (!req.body.price) {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'Missing price'
//     });
//   }
//   next();
// };

export const aliasTopTours = (req, res, next) => {
	req.query.limit = '5';
	req.query.sort = '-ratingsAverage,price';
	req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
	next();
};

export const getAllTours = async (req, res) => {
  try {
		const features = new APIFeatures(Tour.find(), req.query)
			.filter()
			.sort()
			.limitFields()
			.paginate();
		const tours = await features.query;

		res.status(200).json({
			status: 'success',
			requestedAt: req.requestTime,
			results: tours.length,
			data: {
				tours
			}
		});
	}
	catch(error) {
		res.status(404).json({
			status: 'fail',
			message: error
		});
	}
};

export const getTour = async (req, res) => {
	try{
		const tour = await Tour.findById(req.params.id);
		res.status(200).json({
			status: 'success',
			data: {
				tour
			}
		});
	}
	catch(error) {
		res.status(404).json({
			status: 'fail',
			message: error
		});
	}
};

export const createTour = async (req, res) => {
	// const newTour = new Tour({});
	// newTour.save();
	try {
		const newTour = await Tour.create(req.body);

		res.status(201).json({
			status: 'success',
			data: {
				tour: newTour
			}
		});
	}
	catch(error) {
		res.status(400).json({
			status: 'fail',
			message: error
		});
	}
};

export const updateTour = async (req, res) => {
	try {
		const tour = await Tour.findByIdAndUpdate
		(
			req.params.id,
			req.body,
			{
				new: true,
				runValidators: true
			}
		);

		res.status(200).json({
			status: 'success',
			data: {
				tour
			}
		});
	}
	catch(error) {
		res.status(404).json({
			status: 'fail',
			message: error
		});
	}
};

export const deleteTour = async (req, res) => {
	try {
		await Tour.findByIdAndDelete(req.params.id);

		res.status(204).json({
			status: 'success',
			data: null
		});
	}
	catch(error) {
		res.status(404).json({
			status: 'fail',
			message: error
		});
	}
};

export const getTourStats = async (req, res) => {
	try {
		const stats = await Tour.aggregate([
			{
				$match: { ratingsAverage: { $gte: 4.5 } }
			},
			{
				$group: {
					_id: { $toUpper: '$difficulty' },
					numTours: { $sum: 1 },
					numRatings: { $sum: '$ratingsQuantity' },
					avgRating: { $avg: '$ratingsAverage' },
					avgPrice: { $avg: '$price' },
					minPrice: { $min: '$price' },
					maxPrice: { $max: '$price' }
				}
			},
			{
				$sort: { avgPrice: 1 }
			}
			// {
			// 	$match: { _id: { $ne: 'EASY' } }
			// }
		]);

		res.status(200).json({
			status: 'success',
			data: {
				stats
			}
		});
	}
	catch(error) {
		res.status(404).json({
			status: 'fail',
			message: error
		});
	}
};

export const getMonthlyPlan = async (req, res) => {
	try {
		const year = req.params.year * 1;

		const plan = await Tour.aggregate([
			{
				$unwind: '$startDates'
			},
			{
				$match: {
					startDates: {
						$gte: new Date(`${year}-01-01`),
						$lte: new Date(`${year}-12-31`)
					}
				}
			},
			{
				$group: {
					_id: { $month: '$startDates' },
					numTourStarts: { $sum: 1 },
					tours: { $push: '$name' }
				}
			},
			{
				$addFields: { month: '$_id' }
			},
			{
				$project: {
					_id: 0
				}
			},
			{
				$sort: { numTourStarts: -1 }
			},
			{
				$limit: 12
			}
		]);

		res.status(200).json({
			status: 'success',
			data: {
				plan
			}
		});
	}
	catch(error) {
		res.status(404).json({
			status: 'fail',
			message: error
		});
	}
};

export const updateAllTourDates = async (req, res) => {
  try {
    // First, get all tours
    const tours = await Tour.find();
    
    // Filter tours that have startDates containing 2021
    const toursToUpdate = tours.filter(tour => 
      tour.startDates.some(date => 
        date.toString().includes('2021')
      )
    );
    
    // Update each matching tour
    const updatePromises = toursToUpdate.map(tour => {
      const newDates = tour.startDates.map(date => {
        const dateStr = date.toString();
        return dateStr.includes('2021') 
          ? dateStr.replace('2021', '2024') 
          : dateStr;
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
        message: `Updated ${updatedTours.length} tours`
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message
    });
  }
};