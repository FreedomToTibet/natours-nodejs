import express from "express";
import * as bookingController from "./../controllers/bookingController.js";
import * as authController from "./../controllers/authController.js";

const router = express.Router();

router.use(authController.protect);

router.get("/checkout-session/:tourId", bookingController.getCheckoutSession);



export default router;