import express from "express";
import * as bookingController from "./../controllers/bookingController.js";
import * as authController from "./../controllers/authController.js";

const router = express.Router();

router.use(authController.protect);

router.get("/checkout-session/:tourId", bookingController.getCheckoutSession);
router.get("/my-bookings", bookingController.getMyBookings);
router.post("/", bookingController.createBooking);

// Allow users to manage their own bookings
router
	.route("/:id")
	.get(bookingController.getUserBooking)
	.patch(bookingController.updateUserBooking)
	.delete(bookingController.deleteUserBooking);

router.use(authController.restrictTo("admin", "lead-guide"));

router
	.route("/")
	.get(bookingController.getAllBookings);

router
	.route("/admin/:id")
	.get(bookingController.getBooking)
	.patch(bookingController.updateBooking)
	.delete(bookingController.deleteBooking);

export default router;