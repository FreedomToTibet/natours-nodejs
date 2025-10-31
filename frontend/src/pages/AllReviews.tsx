import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAllReviews, useCurrentUser } from '../hooks';
import { LoadingSpinner, StarRating } from '../components';
import { formatPrice } from '../utils';

function AllReviews() {
  const { data: allReviews, isLoading: reviewsLoading, error: reviewsError } = useAllReviews();
  const { data: currentUser } = useCurrentUser();
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');

  // Debug logging
  console.log('AllReviews Debug:', {
    allReviews,
    reviewsLoading,
    reviewsError,
    currentUser
  });

  // Wait for user to load before checking permissions
  if (!currentUser) {
    return <LoadingSpinner />;
  }

  // Check if user has permission to view all reviews
  if (!['guide', 'lead-guide', 'admin'].includes(currentUser.role)) {
    return (
      <main className="main">
        <div className="user-view">
          <div className="user-view__content">
            <div className="user-view__form-container">
              <h2 className="heading-secondary ma-bt-md">Access Denied</h2>
              <p>You don't have permission to view all reviews. This feature is available for guides, lead-guides, and administrators only.</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (reviewsLoading) return <LoadingSpinner />;
  
  if (reviewsError) {
    console.error('Reviews error:', reviewsError);
    return (
      <main className="main">
        <div className="user-view">
          <div className="user-view__content">
            <div className="user-view__form-container">
              <h2 className="heading-secondary ma-bt-md">Error Loading Reviews</h2>
              <p>There was an error loading the reviews. Please try again later.</p>
              <p style={{ fontSize: '1.2rem', color: '#e74c3c', marginTop: '1rem' }}>
                Error details: {reviewsError?.message || 'Unknown error'}
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const reviews = allReviews || [];

  // Filter and sort reviews
  const filteredAndSortedReviews = reviews
    .filter(review => filterRating === null || review.rating === filterRating)
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'highest':
          return b.rating - a.rating;
        case 'lowest':
          return a.rating - b.rating;
        default:
          return 0;
      }
    });

  // Calculate statistics
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews 
    : 0;
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(review => review.rating === rating).length,
    percentage: totalReviews > 0 ? (reviews.filter(review => review.rating === rating).length / totalReviews) * 100 : 0
  }));

  if (totalReviews === 0) {
    return (
      <main className="main">
        <div className="user-view">
          <div className="user-view__content">
            <div className="user-view__form-container">
              <h2 className="heading-secondary ma-bt-md">All Reviews</h2>
              <p>No reviews have been submitted yet.</p>
              <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '0.5rem' }}>
                <p style={{ fontSize: '1.2rem', color: '#666' }}>
                  Debug info: Reviews data = {JSON.stringify(allReviews, null, 2)}
                </p>
                <button 
                  className="btn btn--small btn--green"
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/v1/reviews/test-count');
                      const data = await response.json();
                      console.log('Test count response:', data);
                      alert(`Reviews in database: ${data.count}`);
                    } catch (error) {
                      console.error('Test error:', error);
                      alert('Error testing API');
                    }
                  }}
                  style={{ marginTop: '1rem' }}
                >
                  Test API Connection
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="main">
      <div className="user-view">
        <div className="user-view__content">
          <div className="user-view__form-container">
            <h2 className="heading-secondary ma-bt-md">All Reviews</h2>
            <p className="user-view__subtitle">
              Browse all customer reviews across all tours ({totalReviews} review{totalReviews !== 1 ? 's' : ''})
            </p>

            {/* Statistics Section */}
            <div className="reviews-stats">
              <div className="reviews-stats__summary">
                <div className="reviews-stats__average">
                  <span className="reviews-stats__rating">{averageRating.toFixed(1)}</span>
                  <StarRating rating={averageRating} readonly size="medium" />
                  <span className="reviews-stats__total">({totalReviews} reviews)</span>
                </div>
              </div>
              
              <div className="reviews-stats__distribution">
                {ratingDistribution.map(({ rating, count, percentage }) => (
                  <div key={rating} className="reviews-stats__bar">
                    <span className="reviews-stats__stars">{rating} ⭐</span>
                    <div className="reviews-stats__bar-container">
                      <div 
                        className="reviews-stats__bar-fill" 
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="reviews-stats__count">({count})</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Filters and Sorting */}
            <div className="reviews-controls">
              <div className="reviews-controls__filters">
                <label htmlFor="rating-filter">Filter by rating:</label>
                <select 
                  id="rating-filter"
                  value={filterRating || ''} 
                  onChange={(e) => setFilterRating(e.target.value ? Number(e.target.value) : null)}
                  className="form__input form__input--small"
                >
                  <option value="">All ratings</option>
                  <option value="5">5 stars</option>
                  <option value="4">4 stars</option>
                  <option value="3">3 stars</option>
                  <option value="2">2 stars</option>
                  <option value="1">1 star</option>
                </select>
              </div>

              <div className="reviews-controls__sort">
                <label htmlFor="sort-by">Sort by:</label>
                <select 
                  id="sort-by"
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                  className="form__input form__input--small"
                >
                  <option value="newest">Newest first</option>
                  <option value="oldest">Oldest first</option>
                  <option value="highest">Highest rating</option>
                  <option value="lowest">Lowest rating</option>
                </select>
              </div>
            </div>

            {/* Reviews List */}
            <div className="reviews-list">
              {filteredAndSortedReviews.length === 0 ? (
                <div className="reviews-empty">
                  <p>No reviews match your current filters.</p>
                  <button 
                    className="btn btn--small btn--green"
                    onClick={() => {
                      setFilterRating(null);
                      setSortBy('newest');
                    }}
                  >
                    Clear Filters
                  </button>
                </div>
              ) : (
                filteredAndSortedReviews.map((review) => (
                  <div key={review._id} className="review-card">
                    <div className="review-card__header">
                      <div className="review-card__user">
                        <img
                          src={`/img/users/${review.user.photo}`}
                          alt={review.user.name}
                          className="review-card__user-photo"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/img/users/default.jpg';
                          }}
                        />
                        <div className="review-card__user-info">
                          <h4 className="review-card__user-name">{review.user.name}</h4>
                          <p className="review-card__date">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="review-card__rating">
                        <StarRating rating={review.rating} readonly size="small" />
                      </div>
                    </div>

                    <div className="review-card__content">
                      <p className="review-card__text">"{review.review}"</p>
                    </div>

                    <div className="review-card__tour">
                      <div className="review-card__tour-info">
                        <img
                          src={`/img/tours/${review.tour.imageCover}`}
                          alt={review.tour.name}
                          className="review-card__tour-image"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/img/tours/tour-1-cover.jpg';
                          }}
                        />
                        <div className="review-card__tour-details">
                          <h5 className="review-card__tour-name">
                            <Link to={`/tour/${review.tour.slug}`}>
                              {review.tour.name}
                            </Link>
                          </h5>
                          <div className="review-card__tour-meta">
                            <span>{review.tour.duration} days</span>
                            <span>{review.tour.difficulty}</span>
                            <span>{formatPrice(review.tour.price)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Results Summary */}
            {filteredAndSortedReviews.length > 0 && (
              <div className="reviews-summary">
                <p>
                  Showing {filteredAndSortedReviews.length} of {totalReviews} reviews
                  {filterRating && ` with ${filterRating} star${filterRating !== 1 ? 's' : ''}`}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default AllReviews;