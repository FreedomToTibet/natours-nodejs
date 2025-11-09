import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBooking, usePayBooking, useCancelBooking, useCreateReview, useUserReviewForTour, useUpdateReview, useDeleteReview } from '../../hooks';
import { LoadingSpinner, StarRating, BookingCard } from '../../components';
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
          <div className="booking-info">
            <BookingCard
              booking={booking}
              onPay={handlePayment}
              onCancel={handleCancel}
            />
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
              
              {showReviewForm && (
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
              )}

              {existingReview && !showReviewForm && (
                <div className="existing-review">
                  <div className="review-display">
                    <div className="review-display__rating">
                      <StarRating rating={existingReview.rating} readonly size="small" />
                      <span className="review-display__date">
                        Reviewed on {new Date(existingReview.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="review-display__text">"{existingReview.review}"</p>
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className="booking-back-section">
            <button 
              type="button" 
              className="btn btn--white"
              onClick={() => navigate('/me')}
            >
              Back to Account
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default BookingManage;
