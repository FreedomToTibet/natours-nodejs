import mongoose from 'mongoose';
import slugify from 'slugify';

const tourSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, 'A tour must have a name'],
		unique: true,
	},
	rating: {
		type: Number,
		default: 4.5,
	},
	price: {
		type: Number,
		required: [true, 'A tour must have a price'],
	},
	duration: {
		type: Number,
		required: [true, 'A tour must have a duration'],
	},
	difficulty: {
		type: String,
		required: [true, 'A tour must have a difficulty'],
		enum: {
			values: ['easy', 'medium', 'difficult'],
			message: 'Difficulty is either: easy, medium, difficult'
		},
	},
});

export const Tour = mongoose.model('Tour', tourSchema);