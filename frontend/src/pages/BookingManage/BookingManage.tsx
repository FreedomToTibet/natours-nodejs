import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBooking, usePayBooking, useCancelBooking } from '../../hooks';
import { LoadingSpinner } from '../../components';

const BookingManage = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { data: booking, isLoading } = useBooking(bookingId || '');
  const payBookingMutation = usePayBooking();
  const cancelBookingMutation = useCancelBooking();
  
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!booking) {
    return (
      <main className="main">
        <div className="error">
          <div className="error__title">
            <h2 className="heading-secondary heading-secondary--error">
              Booking not found
            </h2>
            <p>The booking you're looking for doesn't exist or you don't have access to it.</p>
          </div>
        </div>
      </main>
    );
  }

  const handlePayment = () => {
    if (booking._id) {
      payBookingMutation.mutate(booking._id, {
        onSuccess: () => {
          navigate('/me', { state: { activeTab: 'billing' } });
        }
      });
    }
  };

  const handleCancel = () => {
    if (booking._id) {
      cancelBookingMutation.mutate(booking._id, {
        onSuccess: () => {
          navigate('/me', { state: { activeTab: 'bookings' } });
        }
      });
    }
  };

  return (
    <main className="main">
      <div className="booking-container">
        <div className="booking-header">
          <h1 className="heading-primary">
            <span>Manage Your Booking</span>
          </h1>
        </div>

        <div className="booking-content">
          <div className="booking-tour-info">
            <div className="booking-tour-card">
              <div className="booking-tour-img">
                <img 
                  src={`/img/tours/${booking.tour.imageCover}`} 
                  alt={booking.tour.name}
                />
              </div>
              <div className="booking-tour-details">
                <h2 className="heading-secondary ma-bt-sm">{booking.tour.name}</h2>
                <div className="booking-tour-meta">
                  <div className="booking-tour-meta-item">
                    <svg className="booking-tour-icon">
                      <use xlinkHref="/img/icons.svg#icon-calendar"></use>
                    </svg>
                    <span>{booking.tour.duration} days</span>
                  </div>
                  <div className="booking-tour-meta-item">
                    <svg className="booking-tour-icon">
                      <use xlinkHref="/img/icons.svg#icon-trending-up"></use>
                    </svg>
                    <span>{booking.tour.difficulty} difficulty</span>
                  </div>
                  <div className="booking-tour-meta-item">
                    <svg className="booking-tour-icon">
                      <use xlinkHref={booking.paid ? "/img/icons.svg#icon-check" : "/img/icons.svg#icon-clock"}></use>
                    </svg>
                    <span>{booking.paid ? 'Paid' : 'Payment Pending'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="booking-form-container">
            <div className="booking-manage">
              <div className="booking-summary">
                <h3 className="heading-tertiary ma-bt-sm">Booking Details</h3>
                <div className="booking-details-grid">
                  <div className="booking-detail">
                    <span className="booking-detail-label">Booking ID:</span>
                    <span className="booking-detail-value">{booking._id}</span>
                  </div>
                  <div className="booking-detail">
                    <span className="booking-detail-label">Booking Date:</span>
                    <span className="booking-detail-value">
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="booking-detail">
                    <span className="booking-detail-label">Price:</span>
                    <span className="booking-detail-value">${booking.price}</span>
                  </div>
                  <div className="booking-detail">
                    <span className="booking-detail-label">Payment Status:</span>
                    <span className={`booking-detail-value ${booking.paid ? 'status-paid' : 'status-pending'}`}>
                      {booking.paid ? 'Paid' : 'Payment Pending'}
                    </span>
                  </div>
                </div>
              </div>

              {!booking.paid && (
                <div className="booking-payment-section">
                  <h3 className="heading-tertiary ma-bt-sm">Complete Payment</h3>
                  <p className="booking-payment-text">
                    Complete your payment to secure your booking for this amazing tour.
                  </p>
                  <button 
                    className="btn btn--green btn--large ma-bt-md"
                    onClick={handlePayment}
                    disabled={payBookingMutation.isPending}
                  >
                    {payBookingMutation.isPending 
                      ? 'Processing Payment...' 
                      : `Pay $${booking.price}`
                    }
                  </button>
                </div>
              )}

              <div className="booking-actions-section">
                <div className="booking-actions">
                  <button 
                    type="button" 
                    className="btn btn--blue btn--large"
                    onClick={() => navigate(`/tour/${booking.tour.slug}`)}
                  >
                    View Tour Details
                  </button>
                  
                  {!showCancelConfirm ? (
                    <button 
                      type="button" 
                      className="btn btn--red btn--large"
                      onClick={() => setShowCancelConfirm(true)}
                    >
                      Cancel Booking
                    </button>
                  ) : (
                    <div className="cancel-confirm">
                      <p className="cancel-confirm-text">
                        Are you sure you want to cancel this booking? This action cannot be undone.
                      </p>
                      <div className="cancel-confirm-actions">
                        <button 
                          className="btn btn--red"
                          onClick={handleCancel}
                          disabled={cancelBookingMutation.isPending}
                        >
                          {cancelBookingMutation.isPending ? 'Canceling...' : 'Yes, Cancel'}
                        </button>
                        <button 
                          className="btn btn--white"
                          onClick={() => setShowCancelConfirm(false)}
                        >
                          Keep Booking
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="booking-back-section">
                <button 
                  type="button" 
                  className="btn btn--white btn--large"
                  onClick={() => navigate('/me')}
                >
                  Back to Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default BookingManage;
