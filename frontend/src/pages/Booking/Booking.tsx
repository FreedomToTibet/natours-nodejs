import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCurrentUser, useTour, useCreateBooking } from '../../hooks';
import { LoadingSpinner } from '../../components';

const Booking = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: user } = useCurrentUser();
  const { data: tour, isLoading: tourLoading } = useTour(slug || '');
  const createBookingMutation = useCreateBooking();
  
  const [bookAndPay, setBookAndPay] = useState(true);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (tourLoading) {
    return <LoadingSpinner />;
  }

  if (!tour || !user) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tour || !user) {
      return;
    }
    
    const bookingData = {
      tour: tour._id,
      user: user._id,
      price: tour.price,
      paid: bookAndPay
    };

    createBookingMutation.mutate(bookingData, {
      onSuccess: () => {
        navigate('/me', { state: { activeTab: bookAndPay ? 'billing' : 'bookings' } });
      }
    });
  };

  return (
    <main className="main">
      <div className="booking-container">
        <div className="booking-header">
          <h1 className="heading-primary">
            <span>Complete your booking</span>
          </h1>
        </div>

        <div className="booking-content">
          <div className="booking-tour-info">
            <div className="booking-tour-card">
              <div className="booking-tour-img">
                <img 
                  src={`/img/tours/${tour.imageCover}`} 
                  alt={tour.name}
                />
              </div>
              <div className="booking-tour-details">
                <h2 className="heading-secondary ma-bt-sm">{tour.name}</h2>
                <p className="booking-tour-summary">{tour.summary}</p>
                <div className="booking-tour-meta">
                  <div className="booking-tour-meta-item">
                    <svg className="booking-tour-icon">
                      <use xlinkHref="/img/icons.svg#icon-calendar"></use>
                    </svg>
                    <span>{tour.duration} days</span>
                  </div>
                  <div className="booking-tour-meta-item">
                    <svg className="booking-tour-icon">
                      <use xlinkHref="/img/icons.svg#icon-users"></use>
                    </svg>
                    <span>Max {tour.maxGroupSize} people</span>
                  </div>
                  <div className="booking-tour-meta-item">
                    <svg className="booking-tour-icon">
                      <use xlinkHref="/img/icons.svg#icon-trending-up"></use>
                    </svg>
                    <span>{tour.difficulty} difficulty</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="booking-form-container">
            <form className="booking-form" onSubmit={handleSubmit}>
              {createBookingMutation.isError && (
                <div className="alert alert--error ma-bt-md">
                  Booking failed. Please try again.
                </div>
              )}
              
              <div className="booking-summary">
                <h3 className="heading-tertiary ma-bt-sm">Booking Summary</h3>
                <div className="booking-price">
                  <span className="booking-price-label">Tour Price:</span>
                  <span className="booking-price-amount">${tour.price}</span>
                </div>
              </div>

              <div className="booking-options">
                <div className="form__group">
                  <div className="form__checkbox-group">
                    <input
                      type="checkbox"
                      className="form__checkbox"
                      id="book-and-pay"
                      checked={bookAndPay}
                      onChange={(e) => setBookAndPay(e.target.checked)}
                    />
                    <label htmlFor="book-and-pay" className="form__checkbox-label">
                      <span className="form__checkbox-button"></span>
                      Book and Pay Now
                    </label>
                  </div>
                  <p className="form__help-text">
                    {bookAndPay 
                      ? 'Complete payment now to secure your booking'
                      : 'Reserve your spot now, pay later'
                    }
                  </p>
                </div>
              </div>

              <div className="booking-actions">
                <button 
                  type="submit" 
                  className="btn btn--green btn--large"
                  disabled={createBookingMutation.isPending}
                >
                  {createBookingMutation.isPending 
                    ? 'Processing...' 
                    : bookAndPay 
                      ? `Pay $${tour.price}` 
                      : `Book for $${tour.price}`
                  }
                </button>
                <button 
                  type="button" 
                  className="btn btn--white btn--large"
                  onClick={() => navigate(`/tour/${tour.slug}`)}
                  disabled={createBookingMutation.isPending}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Booking;
