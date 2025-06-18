/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert.js';
const stripe = Stripe('pk_test_51RaSryIXBAcgKiYmbLeE2iCPOsycTklwYOIxaT42UYs7hbDIi6U3qwLY0heg5jSuJm0ppanF0EWgMY43mKDMSrWT009nkrlfYm');

export const bookTour = async tourId => {
	try {
		// 1) Get checkout session from API
		const response = await axios(`/api/v1/bookings/checkout-session/${tourId}`);

		if (!response.data || !response.data.session || !response.data.session.id) {
			throw new Error('Invalid checkout session response');
		}

		// 2) Create checkout form + charge credit card
		await stripe.redirectToCheckout({
			sessionId: response.data.session.id
		});
	} catch (err) {
		console.log(err);
		showAlert('error', err);
	}
};
