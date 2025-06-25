import { Link } from 'react-router-dom';
import type { Tour } from '../../services';

interface TourCtaProps {
  tour: Tour;
}

function TourCta({ tour }: TourCtaProps) {
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
          <Link to="/login" className="btn btn--green span-all-rows">
            Log in to book tour
          </Link>
        </div>
      </div>
    </section>
  );
}

export default TourCta;
