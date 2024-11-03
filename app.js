const express = require('express');
const fs = require('fs');

const app = express();

// app.get('/', (req, res) => {
// 	res.status(200).send('Hello World');
// });

// app.post('/', (req, res) => {
// 	res.status(201).send('You can post to this endpoint');
// });

const tours = JSON.parse(fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`, 'utf-8'));

app.get("/api/v1/tours", (req, res) => {
	res.status(200).json({
		status: 'success',
		results: tours.length,
		data: {
			tours
		}
	});
});

app.get("/api/v1/tours/:id", (req, res) => {
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
});

app.patch("/api/v1/tours/:id", (req, res) => {
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
});

app.post("/api/v1/tours", (req, res) => {
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
});

const PORT = 8000;
app.listen(PORT, () => {
	console.log('Server is running on port 8000');
});