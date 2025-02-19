import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

import { Tour } from '../models/tourModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

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

export const getAllTours = async (req, res) => {
  try {
		const tours = await Tour.find();

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