import Stripe from 'stripe';

import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import {
  createOne,
  getOne,
  getAll,
  updateOne,
  deleteOne,
} from './handlerFactory.js';

import Tour from '../models/tourModel.js';
import User from '../models/userModel.js';
import Booking from '../models/bookingModel.js';

// Helper function to get public image URLs that work with Stripe
const getPublicTourImageUrl = (tourName) => {
  const tourImageMap = {
    'The Forest Hiker':
      'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&h=600&q=80',
    'The Sea Explorer':
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&q=80',
    'The Snow Adventurer':
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=600&q=80',
    'The City Wanderer':
      'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&h=600&q=80',
    'The Park Camper':
      'https://images.unsplash.com/photo-1533086723868-504004bbbf9c?w=800&h=600&q=80',
    'The Sports Lover':
      'https://images.unsplash.com/photo-1471295253337-3ceaaedca402?w=800&h=600&q=80',
    'The Wine Taster':
      'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&h=600&q=80',
    'The Star Gazer':
      'https://images.unsplash.com/photo-1465101162946-4377e57745c3?w=800&h=600&q=80',
    'The Northern Lights':
      'https://images.unsplash.com/photo-1579033385971-31b28b3c4fa4?w=800&h=600&q=80',
  };

  // Return the mapped image or a default one
  return (
    tourImageMap[tourName] ||
    `https://via.placeholder.com/800x600/008000/FFFFFF?text=${encodeURIComponent(
      tourName
    )}`
  );
};

export const getCheckoutSession = catchAsync(async (req, res, next) => {
  // Ensure Stripe secret key is set
  const stripeSecret = process.env.STRIPE_SECRET;

  if (!stripeSecret) {
    console.error('Stripe secret key is missing');
    return next(new AppError('Payment configuration error', 500));
  }

  console.log('Stripe secret key length:', stripeSecret.length);

  const stripe = new Stripe(stripeSecret, {
    apiVersion: '2023-10-16', // Using latest stable version
  });

  // Verify stripe is initialized
  if (!stripe) {
    return next(new AppError('Payment service is not available', 500));
  }

  // 1) Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);
  if (!tour) {
    return next(new AppError('Tour not found', 404));
  }

  try {
    // 2) Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      success_url: `${req.protocol}://${req.get(
        'host'
      )}/my-tours?alert=booking`,
      cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
      customer_email: req.user.email,
      client_reference_id: req.params.tourId,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: tour.price * 100,
            product_data: {
              name: `${tour.name} Tour`,
              description: tour.summary,
              images: [
                // Use predefined public images that are guaranteed to work with Stripe
                getPublicTourImageUrl(tour.name),
              ],
            },
          },
          quantity: 1,
        },
      ],
    }); // Log session details (excluding sensitive data)
    console.log('Created checkout session with ID:', session.id);

    // 3) Send response
    res.status(200).json({
      status: 'success',
      session: {
        id: session.id,
        url: session.url,
      },
    });
  } catch (error) {
    console.error('Stripe session creation error:', error);
    return next(new AppError('Failed to create payment session', 500));
  }
});

// Function for handling successful bookings through URL parameters (legacy approach)
export const handleSuccessfulBooking = catchAsync(async (req, res, next) => {
  // This is only TEMPORARY, until we deploy the site to a real server with Stripe webhooks
  if (req.query.alert === 'booking') {
    // Show success message
    res.locals.alert = {
      type: 'success',
      message:
        "Your booking was successful! Please check your email for a confirmation. If your booking doesn't show up immediately, please check back later.",
    };
  }
  next();
});

export const createBookingCheckout = async (session) => {
  try {
    // Check if session exists
    if (!session) {
      console.error('Session object is null or undefined');
      return;
    }

    // Log session for debugging
    console.log('Session data received:', {
      id: session.id,
      client_reference_id: session.client_reference_id,
      customer_email: session.customer_email,
      hasLineItems: !!session.line_items,
    });

    const tour = session.client_reference_id;

    // Find user by email
    const userDoc = await User.findOne({ email: session.customer_email });
    if (!userDoc) {
      console.error(`User not found for email: ${session.customer_email}`);
      return;
    }
    const user = userDoc.id;

    // Get price from the session - updated to use line_items or amount_total
    let price;

    if (session.amount_total) {
      // Use the session total amount if available
      price = session.amount_total / 100;
    } else if (
      session.line_items &&
      session.line_items.data &&
      session.line_items.data.length > 0
    ) {
      // If line_items is expanded, use that
      price = session.line_items.data[0].amount_total / 100;
    } else {
      // Fallback to retrieving the session with expanded line_items
      const stripeSecret = process.env.STRIPE_SECRET;
      const stripe = new Stripe(stripeSecret);

      // Retrieve session with expanded line_items
      const retrievedSession = await stripe.checkout.sessions.retrieve(
        session.id,
        {
          expand: ['line_items'],
        }
      );

      // Get price from line_items
      if (
        retrievedSession.line_items &&
        retrievedSession.line_items.data.length > 0
      ) {
        price = retrievedSession.line_items.data[0].amount_total / 100;
      } else if (retrievedSession.amount_total) {
        price = retrievedSession.amount_total / 100;
      } else {
        console.error('Could not determine price from session', session.id);
        return;
      }
    }

    // Create the booking
    const booking = await Booking.create({ tour, user, price });
    console.log('Booking created successfully:', booking.id);
  } catch (error) {
    console.error('Error creating booking checkout:', error);
  }
};

export const webhookCheckout = (req, res, next) => {
  const signature = req.headers['stripe-signature'];
  const stripeSecret = process.env.STRIPE_SECRET;

  // Initialize Stripe with the secret key
  const stripe = new Stripe(stripeSecret);

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    console.log('Webhook received:', event.type);
  } catch (err) {
    console.error('Webhook error:', err.message);
    return res.status(400).send(`Webhook error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    createBookingCheckout(event.data.object);
  }

  res.status(200).json({ received: true });
};

export const createBooking = catchAsync(async (req, res, next) => {
  // Check if user already has a booking for this tour
  const existingBooking = await Booking.findOne({
    tour: req.body.tour,
    user: req.body.user
  });

  if (existingBooking) {
    return next(new AppError('You already have a booking for this tour', 400));
  }

  // Create the booking
  const doc = await Booking.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      booking: doc,
    },
  });
});
export const getBooking = getOne(Booking);
export const getAllBookings = getAll(Booking);
export const updateBooking = updateOne(Booking);
export const deleteBooking = deleteOne(Booking);

// New controller to get bookings for the logged-in user
export const getMyBookings = catchAsync(async (req, res, next) => {
  // Find all bookings for the current user
  const bookings = await Booking.find({ user: req.user.id }).populate({
    path: 'tour',
    select: 'name slug imageCover duration difficulty maxGroupSize summary'
  });

  res.status(200).json({
    status: 'success',
    results: bookings.length,
    data: {
      bookings,
    },
  });
});
