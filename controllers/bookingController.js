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
    'The Forest Hiker': 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&h=600&q=80',
    'The Sea Explorer': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=600&q=80',
    'The Snow Adventurer': 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=600&q=80',
    'The City Wanderer': 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&h=600&q=80',
    'The Park Camper': 'https://images.unsplash.com/photo-1533086723868-504004bbbf9c?w=800&h=600&q=80',
    'The Sports Lover': 'https://images.unsplash.com/photo-1471295253337-3ceaaedca402?w=800&h=600&q=80',
    'The Wine Taster': 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&h=600&q=80',
    'The Star Gazer': 'https://images.unsplash.com/photo-1465101162946-4377e57745c3?w=800&h=600&q=80',
    'The Northern Lights': 'https://images.unsplash.com/photo-1579033385971-31b28b3c4fa4?w=800&h=600&q=80'
  };
  
  // Return the mapped image or a default one
  return tourImageMap[tourName] || 
    `https://via.placeholder.com/800x600/008000/FFFFFF?text=${encodeURIComponent(tourName)}`;
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
    apiVersion: '2023-10-16' // Using latest stable version
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
            product_data: {              name: `${tour.name} Tour`,
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
    });    // Log session details (excluding sensitive data)
    console.log('Created checkout session with ID:', session.id);
    
    // 3) Send response
    res.status(200).json({
      status: 'success',
      session: {
        id: session.id,
        url: session.url
      }
    });
  } catch (error) {
    console.error('Stripe session creation error:', error);
    return next(new AppError('Failed to create payment session', 500));
  }
});