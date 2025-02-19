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

export const getAllTours = (req, res) => {
  console.log(req.requestTime);

  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length,
    data: {
      tours
    }
  });
};

export const getTour = (req, res) => {
  const id = req.params.id * 1;

  const tour = tours.find(el => el.id === id);

  res.status(200).json({
    status: 'success',
    data: {
      tour
    }
  });
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

export const updateTour = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      tour: '<Updated tour here...>'
    }
  });
};

export const deleteTour = (req, res) => {
  res.status(204).json({
    status: 'success',
    data: null
  });
};