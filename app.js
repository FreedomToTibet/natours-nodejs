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

app.get('/api/v1/tours', (req, res) => {
	res.status(200).json({
		status: 'success',
		results: tours.length,
		data: {
			tours
		}
	});
});

const PORT = 8000;
app.listen(PORT, () => {
	console.log('Server is running on port 8000');
});