import { Link } from 'react-router-dom';
import type { Booking } from '../../services';
import './BookingCard.css';

interface BookingCardProps {
  booking: Booking;
  onCancel?: (bookingId: string) => void;
  onPay?: (bookingId: string) => void;
  showActions?: boolean;
}

export default function BookingCard({ booking, onCancel, onPay, showActions = true }: BookingCardProps) {
  const formattedDate = new Date(booking.createdAt).toLocaleDateString();

  return (
    <div className="booking-card">
      <div className="booking-card__header">
        <Link to={`/tour/${booking.tour.slug}`} className="booking-card__tour-name">
          {booking.tour.name}
        </Link>
        <span className={`booking-card__status booking-card__status--${booking.paid ? 'paid' : 'pending'}`}>
          {booking.paid ? 'Paid' : 'Pending'}
        </span>
      </div>

      <div className="booking-card__details">
        <div className="booking-card__detail">
          <span className="booking-card__label">Booking Date</span>
          <span className="booking-card__value">{formattedDate}</span>
        </div>
        <div className="booking-card__detail">
          <span className="booking-card__label">Duration</span>
          <span className="booking-card__value">{booking.tour.duration} days</span>
        </div>
        <div className="booking-card__detail">
          <span className="booking-card__label">Difficulty</span>
          <span className="booking-card__value">{booking.tour.difficulty}</span>
        </div>
        <div className="booking-card__detail">
          <span className="booking-card__label">Price</span>
          <span className="booking-card__value booking-card__value--price">${booking.price.toLocaleString()}</span>
        </div>
        <div className="booking-card__detail">
          <span className="booking-card__label">Booking ID</span>
          <span className="booking-card__value booking-card__value--id">{booking._id.slice(-8)}</span>
        </div>
      </div>

      {showActions && (
        <div className="booking-card__actions">
          <Link 
            to={`/booking-manage/${booking._id}`} 
            className="booking-card__button booking-card__button--secondary"
          >
            View Details
          </Link>
          {!booking.paid && onPay && (
            <button
              onClick={() => onPay(booking._id)}
              className="booking-card__button booking-card__button--primary"
            >
              Pay Now
            </button>
          )}
          {onCancel && (
            <button
              onClick={() => onCancel(booking._id)}
              className="booking-card__button booking-card__button--danger"
            >
              Cancel
            </button>
          )}
        </div>
      )}
    </div>
  );
}