import express from 'express';
import fs from 'fs';
import morgan from 'morgan';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.json());
app.use(morgan('dev'));
const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`, 'utf-8'));

// Tours handlers
const getAllTours = (req, res) => {
	res.status(200).json({
		status: 'success',
		results: tours.length,
		data: {
			tours
		}
	});
};

const getTour = (req, res) => {
	const id = Number(req.params.id);
	const tour = tours.find(el => el.id === id);

	if (!tour) {
		return res.status(404).json({
			status: 'fail',
			message: 'Invalid ID'
		});
	}

	res.status(200).json({
		status: 'success',
		data: {
			tour
		}
	});
};

const createTour = (req, res) => {
	const newId = tours[tours.length - 1].id + 1;
	const newTour = Object.assign({ id: newId }, req.body);

	tours.push(newTour);

	fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), (err) => {
		res.status(201).json({
			status: 'success',
			data: {
				tour: newTour
			}
		});
	});
};

const updateTour = (req, res) => {
	const id = Number(req.params.id);
	const tour = tours.find(el => el.id === id);

	if (!tour) {
		return res.status(404).json({
			status: 'fail',
			message: 'Invalid ID'
		});
	}

	res.status(200).json({
		status: 'success',
		data: {
			tour: '<Updated tour here...>'
		}
	});
};

const deleteTour = (req, res) => {
	const id = Number(req.params.id);
	const tour = tours.find(el => el.id === id);

	if (!tour) {
		return res.status(404).json({
			status: 'fail',
			message: 'Invalid ID'
		});
	}

	res.status(204).json({
		status: 'success',
		data: null
	});
};

// Users handlers
const getAllUsers = (req, res) => {
	res.status(500).json({
		status: 'error',
		message: 'This route is not yet defined'
	});
};

const getUser = (req, res) => {
	res.status(500).json({
		status: 'error',
		message: 'This route is not yet defined'
	});
};

const createUser = (req, res) => {
	res.status(500).json({
		status: 'error',
		message: 'This route is not yet defined'
	});
};

const updateUser = (req, res) => {
	res.status(500).json({
		status: 'error',
		message: 'This route is not yet defined'
	});
};

const deleteUser = (req, res) => {
	res.status(500).json({
		status: 'error',
		message: 'This route is not yet defined'
	});
};

// Routes

const tourRouter = express.Router();
const userRouter = express.Router();

tourRouter
	.route('/')
	.get(getAllTours)
	.post(createTour);

tourRouter
  .route('/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);

userRouter
	.route('/')
	.get(getAllUsers)
	.post(createUser);

userRouter
  .route('/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(deleteUser);

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);


const PORT = 8000;
app.listen(PORT, () => {
	console.log('Server is running on port 8000');
});