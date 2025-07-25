import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBooking, usePayBooking, useCancelBooking, useCreateReview, useUserReviewForTour, useUpdateReview, useDeleteReview } from '../../hooks';
import { LoadingSpinner, StarRating } from '../../components';
import { formatCurrency } from '../../utils';

const BookingManage = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { data: booking, isLoading } = useBooking(bookingId || '');
  const { data: existingReview, refetch: refetchReview } = useUserReviewForTour(booking?.tour._id || '');
  const payBookingMutation = usePayBooking();
  const cancelBookingMutation = useCancelBooking();
  const createReviewMutation = useCreateReview();
  const updateReviewMutation = useUpdateReview();
  const deleteReviewMutation = useDeleteReview();
  
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [reviewData, setReviewData] = useState({
    review: '',
    rating: 5
  });

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

  const handleReviewSubmit = () => {
    if (booking?.tour._id && reviewData.review.trim()) {
      createReviewMutation.mutate({
        tourId: booking.tour._id,
        reviewData: {
          review: reviewData.review,
          rating: reviewData.rating
        }
      }, {
        onSuccess: () => {
          setShowReviewForm(false);
          setReviewData({ review: '', rating: 5 });
          refetchReview();
        }
      });
    }
  };

  const handleEditReview = () => {
    if (existingReview) {
      setReviewData({
        review: existingReview.review,
        rating: existingReview.rating
      });
      setShowEditForm(true);
    }
  };

  const handleUpdateReview = () => {
    if (existingReview && reviewData.review.trim()) {
      updateReviewMutation.mutate({
        reviewId: existingReview._id,
        reviewData: {
          review: reviewData.review,
          rating: reviewData.rating
        }
      }, {
        onSuccess: () => {
          setShowEditForm(false);
          setReviewData({ review: '', rating: 5 });
          refetchReview();
        },
        onError: (error) => {
          console.error('Error updating review:', error);
          console.error('Full error object:', JSON.stringify(error, null, 2));
          alert('Failed to update review. Check console for details.');
        }
      });
    }
  };

  const handleDeleteReview = () => {
    if (existingReview) {
      deleteReviewMutation.mutate(existingReview._id, {
        onSuccess: () => {
          setShowDeleteConfirm(false);
          refetchReview();
        },
        onError: (error) => {
          console.error('Error deleting review:', error);
          console.error('Full error object:', JSON.stringify(error, null, 2));
          alert('Failed to delete review. Check console for details.');
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

            {/* Review Section - Only show for paid bookings */}
            {booking.paid && (
              <div className="review-section">
                <div className="review-section__header">
                  <h3 className="review-section__title">
                    {existingReview ? 'Your Review' : 'Share Your Experience'}
                  </h3>
                  {!existingReview && !showReviewForm && (
                    <button 
                      className="btn btn--small btn--green"
                      onClick={() => setShowReviewForm(true)}
                    >
                      Write a Review
                    </button>
                  )}
                </div>
                
                {existingReview && !showEditForm ? (
                  <div className="existing-review">
                    <div className="review-display">
                      <div className="review-display__rating">
                        <StarRating rating={existingReview.rating} readonly size="small" />
                        <span className="review-display__date">
                          Reviewed on {new Date(existingReview.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="review-display__text">"{existingReview.review}"</p>
                      <div className="review-display__actions">
                        <button 
                          className="btn btn--small btn--blue"
                          onClick={handleEditReview}
                        >
                          Edit Review
                        </button>
                        {!showDeleteConfirm ? (
                          <button 
                            className="btn btn--small btn--red"
                            onClick={() => setShowDeleteConfirm(true)}
                          >
                            Delete Review
                          </button>
                        ) : (
                          <div className="delete-confirm">
                            <p className="delete-confirm-text">Are you sure?</p>
                            <div className="delete-confirm-actions">
                              <button 
                                className="btn btn--small btn--red"
                                onClick={handleDeleteReview}
                                disabled={deleteReviewMutation.isPending}
                              >
                                {deleteReviewMutation.isPending ? '...' : 'Yes'}
                              </button>
                              <button 
                                className="btn btn--small btn--white"
                                onClick={() => setShowDeleteConfirm(false)}
                              >
                                No
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : showEditForm ? (
                  <div className="review-form">
                    <div className="review-form__group">
                      <label className="review-form__label" htmlFor="edit-review-text">
                        Edit Your Review
                      </label>
                      <textarea
                        id="edit-review-text"
                        className="review-form__textarea"
                        placeholder="Share your experience with this tour..."
                        value={reviewData.review}
                        onChange={(e) => setReviewData(prev => ({ ...prev, review: e.target.value }))}
                        maxLength={500}
                      />
                    </div>
                    
                    <div className="review-form__group">
                      <div className="review-form__rating-group">
                        <label className="review-form__label">Rating:</label>
                        <StarRating 
                          rating={reviewData.rating}
                          onRatingChange={(rating) => setReviewData(prev => ({ ...prev, rating }))}
                        />
                      </div>
                    </div>
                    
                    <div className="review-form__actions">
                      <button 
                        className="btn btn--white btn--small"
                        onClick={() => {
                          setShowEditForm(false);
                          setReviewData({ review: '', rating: 5 });
                        }}
                      >
                        Cancel
                      </button>
                      <button 
                        className="btn btn--green btn--small"
                        onClick={handleUpdateReview}
                        disabled={!reviewData.review.trim() || updateReviewMutation.isPending}
                      >
                        {updateReviewMutation.isPending ? 'Updating...' : 'Update Review'}
                      </button>
                    </div>
                  </div>
                ) : showReviewForm ? (
                  <div className="review-form">
                    <div className="review-form__group">
                      <label className="review-form__label" htmlFor="review-text">
                        Your Review
                      </label>
                      <textarea
                        id="review-text"
                        className="review-form__textarea"
                        placeholder="Share your experience with this tour..."
                        value={reviewData.review}
                        onChange={(e) => setReviewData(prev => ({ ...prev, review: e.target.value }))}
                        maxLength={500}
                      />
                    </div>
                    
                    <div className="review-form__group">
                      <div className="review-form__rating-group">
                        <label className="review-form__label">Rating:</label>
                        <StarRating 
                          rating={reviewData.rating}
                          onRatingChange={(rating) => setReviewData(prev => ({ ...prev, rating }))}
                        />
                      </div>
                    </div>
                    
                    <div className="review-form__actions">
                      <button 
                        className="btn btn--white btn--small"
                        onClick={() => {
                          setShowReviewForm(false);
                          setReviewData({ review: '', rating: 5 });
                        }}
                      >
                        Cancel
                      </button>
                      <button 
                        className="btn btn--green btn--small"
                        onClick={handleReviewSubmit}
                        disabled={!reviewData.review.trim() || createReviewMutation.isPending}
                      >
                        {createReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="review-section__info">
                    Help other travelers by sharing your experience with this tour.
                  </p>
                )}
              </div>
            )}
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
                    <span className="booking-detail-value">{formatCurrency(booking.price)}</span>
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
                      : `Pay ${formatCurrency(booking.price)}`
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
