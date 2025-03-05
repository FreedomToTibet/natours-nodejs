import express from 'express';
import morgan from 'morgan';

import AppError from './utils/appError.js';
import globalErrorHandler from './controllers/errorController.js';

import tourRouter from './routes/tourRoutes.js';
import userRouter from './routes/userRoutes.js';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// 1) MIDDLEWARES

if (process.env.NODE_ENV === 'development') {
	app.use(morgan('dev'));
	app.use(express.json());
	app.use(express.static(`${__dirname}/public`));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
	req.requestTime = new Date().toISOString();
	next();
});

// 3) ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
	next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

export default app;