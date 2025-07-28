import AppError from '../utils/appError.js';

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  console.log('Validation error details:');
  const errorDetails = {};
  
  Object.keys(err.errors).forEach(field => {
    const error = err.errors[field];
    console.log(`- ${field}: ${error.message} (${error.kind})`);
    errorDetails[field] = {
      message: error.message,
      value: error.value,
      kind: error.kind
    };
  });

  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  
  const appError = new AppError(message, 400);
  appError.validationDetails = errorDetails;
  return appError;
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 401);

const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  console.log(value);

  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

const sendErrorDev = (err, req, res) => {
  console.log('DETAILED ERROR INFO (DEV MODE):');
  console.log('Error name:', err.name);
  console.log('Error message:', err.message);
  console.log('Error stack:', err.stack);
  
  if (err.name === 'ValidationError' && err.errors) {
    console.log('Validation error details:');
    Object.keys(err.errors).forEach(field => {
      console.log(`- ${field}: ${err.errors[field].message} (${err.errors[field].kind})`);
    });
  }
  
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
      validationErrors: err.name === 'ValidationError' ? err.errors : undefined
    });
  }
	return res.status(err.statusCode).render('error', {
		title: 'Something went wrong!',
		msg: err.message,
	});
};

const sendErrorProd = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });

      // Programming or other unknown error: don't leak error details
    } 
		// 1) Log error
		console.error('ERROR 💥', err);

		// 2) Send generic message
		return res.status(500).json({
			status: 'error',
			message: 'Something went very wrong!',
		});
  } 
	// Operational, trusted error: send message to client
	if (err.isOperational) {
		return res.status(err.statusCode).render('error', {
			title: 'Something went wrong!',
			msg: err.message,
		});
	} 
	// 1) Log error
	console.error('ERROR 💥', err);

	// 2) Send generic message
	return res.status(err.statusCode).render('error', {
		title: 'Something went wrong!',
		msg: 'Please try again later.',
	});
};

export default (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = JSON.parse(JSON.stringify(err));
    error.message = err.message;

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError')
      error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};
