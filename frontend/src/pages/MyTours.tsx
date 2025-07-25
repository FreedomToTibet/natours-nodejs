import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUserBookings, useCurrentUser } from '../hooks';
import LoadingSpinner from '../components/LoadingSpinner';

function MyTours() {
  const navigate = useNavigate();
  const { data: user } = useCurrentUser();
  const { data: bookings, isLoading, error, refetch } = useUserBookings();
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date');
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: '/my-tours' } });
    }
  }, [user, navigate]);

  // Make sure we fetch fresh data when component mounts
  useEffect(() => {
    if (user) {
      refetch();
    }
  }, [refetch, user]);

  // Debug logs
  useEffect(() => {
    // Always log for debugging
    console.log('User:', user);
    console.log('Bookings:', bookings);
    console.log('Loading:', isLoading);
    console.log('Error:', error);
  }, [user, bookings, isLoading, error]);

  if (!user) {
    return <LoadingSpinner />;
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    console.error('Error loading bookings:', error);
    return (
      <div className="error container">
        <h2 className="heading-secondary">Error loading your bookings</h2>
        <p>Please try again later or contact support.</p>
        <button onClick={() => refetch()} className="btn btn--green">
          Try Again
        </button>
      </div>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <div className="container my-tours-empty">
        <h2 className="heading-secondary">My Tours</h2>
        <p>You haven't booked any tours yet.</p>
        <Link to="/" className="btn btn--green">Browse Tours</Link>
      </div>
    );
  }

  // Sort bookings based on user preference
  const sortedBookings = [...bookings].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else {
      return a.tour.name.localeCompare(b.tour.name);
    }
  });

  return (
    <div className="container my-tours">
      <h2 className="heading-secondary">My Tours</h2>
      
      <div className="my-tours-controls">
        <div className="my-tours-sort">
          <label>Sort by:</label>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as 'date' | 'name')}
            className="form__input"
          >
            <option value="date">Booking Date</option>
            <option value="name">Tour Name</option>
          </select>
        </div>
        <div className="my-tours-count">
          {bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'}
        </div>
      </div>

      <div className="card-container">
        {sortedBookings.map((booking) => (
          <div className="card" key={booking._id}>
            <div className="card__header">
              <div className="card__picture">
                <div className="card__picture-overlay">&nbsp;</div>
                <img
                  src={`/img/tours/${booking.tour.imageCover}`}
                  alt={booking.tour.name}
                  className="card__picture-img"
                />
              </div>
              <h3 className="heading-tertirary">
                <span>{booking.tour.name}</span>
              </h3>
            </div>
            <div className="card__details">
              <h4 className="card__sub-heading">
                {booking.tour.difficulty} {booking.tour.duration}-day tour
              </h4>
              <p className="card__text">
                Booked on {new Date(booking.createdAt).toLocaleDateString()}
              </p>
              <div className="card__data">
                <div>
                  <span className="card__footer-value">${booking.price}</span>
                  {booking.paid ? (
                    <span className="card__footer-text card__footer-paid">Paid</span>
                  ) : (
                    <span className="card__footer-text card__footer-pending">Pending</span>
                  )}
                </div>
              </div>
            </div>
            <div className="card__footer">
              <Link
                to={`/booking-manage/${booking._id}`}
                className="btn btn--small btn--green"
              >
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyTours;
