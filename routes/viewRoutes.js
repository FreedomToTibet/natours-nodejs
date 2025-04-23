import express from "express";
import * as viewController from "../controllers/viewController.js";
import * as authController from "../controllers/authController.js";

const router = express.Router();

router.get('/', authController.isLoggedIn, viewController.getOverview);
router.get('/tour/:slug', authController.isLoggedIn, viewController.getTour);
router.get('/login', authController.isLoggedIn, viewController.getLoginForm);
router.get('/me', authController.isLoggedIn, viewController.getAccount);

// router.get('/logout', authController.protect, viewController.logoutUser);

// router.get('/my-tours', viewController.getMyTours);
// router.get('/my-reviews', viewController.getMyReviews);

export default router;