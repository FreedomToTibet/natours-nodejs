import { useNavigate } from 'react-router-dom';
import { useCurrentUser, useUserBookingForTour } from '../../hooks';
import type { Tour } from '../../services';

interface TourCtaProps {
  tour: Tour;
}

function TourCta({ tour }: TourCtaProps) {
  const { data: user } = useCurrentUser();
  const { data: existingBooking, isLoading: bookingLoading } = useUserBookingForTour(user ? tour._id : '');
  const navigate = useNavigate();

  const handleBookTour = () => {
    if (!user) {
      // Redirect to login if not authenticated
      navigate('/login');
      return;
    }
    
    // Prevent booking for non-user roles
    if (user.role !== 'user') {
      return;
    }
    
    if (existingBooking) {
      // Navigate to booking management page
      navigate(`/booking-manage/${existingBooking._id}`);
    } else {
      // Navigate to booking page for this tour
      navigate(`/booking/${tour.slug}`);
    }
  };

  const getButtonText = () => {
    if (!user) return 'Log in to book tour';
    if (user.role !== 'user') return 'Booking not available for staff';
    if (bookingLoading) return 'Checking booking...';
    if (existingBooking) {
      return existingBooking.paid ? 'Manage booking' : 'Complete payment';
    }
    return 'Book tour now!';
  };

  const getButtonClass = () => {
    if (!user || user.role !== 'user') return 'btn btn--gray span-all-rows';
    if (!existingBooking) return 'btn btn--green span-all-rows';
    return existingBooking.paid 
      ? 'btn btn--blue span-all-rows' 
      : 'btn btn--orange span-all-rows';
  };

  const isBookingDisabled = () => {
    return bookingLoading || (user ? user.role !== 'user' : false);
  };

  return (
    <section className="section-cta">
      <div className="cta">
        <div className="cta__img cta__img--logo">
          <img src="/img/logo-white.png" alt="Natours logo" />
        </div>
        <img
          className="cta__img cta__img--1"
          src={`/img/tours/${tour.images[1] || tour.imageCover}`}
          alt="Tour picture"
        />
        <img
          className="cta__img cta__img--2"
          src={`/img/tours/${tour.images[2] || tour.imageCover}`}
          alt="Tour picture"
        />
        <div className="cta__content">
          <h2 className="heading-secondary">What are you waiting for?</h2>
          <p className="cta__text">
            {tour.duration} days. 1 adventure. Infinite memories. Make it yours today!
          </p>
          
          <button 
            className={getButtonClass()}
            id="book-tour" 
            data-tour-id={tour._id}
            onClick={handleBookTour}
            disabled={isBookingDisabled()}
          >
            {getButtonText()}
          </button>
        </div>
      </div>
    </section>
  );
}

export default TourCta;
