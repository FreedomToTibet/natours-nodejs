import { Link } from 'react-router-dom';
import type { Tour } from '../../services';

interface TourCardProps {
  tour: Tour;
}

function TourCard({ tour }: TourCardProps) {
  // Format start date to show month and year
  const formatDate = (startDates: string[]) => {
    if (!startDates || startDates.length === 0) return 'Date TBA';
    const date = new Date(startDates[0]);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="card">
      <div className="card__header">
        <div className="card__picture">
          <div className="card__picture-overlay">&nbsp;</div>
          <img
            className="card__picture-img"
            src={`/img/tours/${tour.imageCover}`}
            alt={tour.name}
          />
        </div>
        <h3 className="heading-tertirary">
          <span>{tour.name}</span>
        </h3>
      </div>
      <div className="card__details">
        <h4 className="card__sub-heading">
          {tour.difficulty} {tour.duration}-day tour
        </h4>
        <p className="card__text">{tour.summary}</p>
        <div className="card__data">
          <svg className="card__icon">
            <use xlinkHref="/img/icons.svg#icon-map-pin"></use>
          </svg>
          <span>{tour.startLocation.description}</span>
        </div>
        <div className="card__data">
          <svg className="card__icon">
            <use xlinkHref="/img/icons.svg#icon-calendar"></use>
          </svg>
          <span>{formatDate(tour.startDates)}</span>
        </div>
        <div className="card__data">
          <svg className="card__icon">
            <use xlinkHref="/img/icons.svg#icon-flag"></use>
          </svg>
          <span>{tour.locations.length} stops</span>
        </div>
        <div className="card__data">
          <svg className="card__icon">
            <use xlinkHref="/img/icons.svg#icon-user"></use>
          </svg>
          <span>{tour.maxGroupSize} people</span>
        </div>
      </div>
      <div className="card__footer">
        <p>
          <span className="card__footer-value">{formatPrice(tour.price)}</span>
          <span className="card__footer-text"> per person</span>
        </p>
        <p className="card__ratings">
          <span className="card__footer-value">{tour.ratingsAverage}</span>
          <span className="card__footer-text"> rating ({tour.ratingsQuantity})</span>
        </p>
        <Link to={`/tour/${tour.slug}`} className="btn btn--green btn--small">
          Details
        </Link>
      </div>
    </div>
  );
}

export default TourCard;
