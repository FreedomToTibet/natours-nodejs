import express from 'express';
import * as userController from './../controllers/userController.js';
import * as authController from './../controllers/authController.js';


const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// Protect all routes after this middleware
router.use(authController.protect);

router.patch(
  '/updateMyPassword',
  authController.updatePassword
);

router.get(
  '/me',
  userController.getMe
);
router.patch(
	'/updateMe',
	userController.uploadUserPhoto,
	userController.resizeUserPhoto,
	userController.updateMe
);
router.delete(
	'/deleteMe',
	userController.deleteMe
);

// Guide availability routes
router.get(
	'/my-availability',
	authController.restrictTo('guide', 'lead-guide', 'admin'),
	userController.getMyAvailability
);

router.patch(
	'/update-availability',
	authController.restrictTo('guide', 'lead-guide', 'admin'),
	userController.updateAvailability
);

router.post(
	'/unavailable-dates',
	authController.restrictTo('guide', 'lead-guide', 'admin'),
	userController.addUnavailableDate
);

router.delete(
	'/unavailable-dates/:dateId',
	authController.restrictTo('guide', 'lead-guide', 'admin'),
	userController.removeUnavailableDate
);

// Special routes for lead guides/admins
router.post(
  '/verify-lead-guide',
  authController.protect,
  authController.restrictTo('admin', 'lead-guide'),
  userController.verifyLeadGuide
);

// Only admin can access these routes
router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

export default router;
