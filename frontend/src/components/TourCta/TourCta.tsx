import { useNavigate } from 'react-router-dom';
import { useCurrentUser } from '../../hooks';
import type { Tour } from '../../services';

interface TourCtaProps {
  tour: Tour;
}

function TourCta({ tour }: TourCtaProps) {
  const { data: user } = useCurrentUser();
  const navigate = useNavigate();

  const handleBookTour = () => {
    if (!user) {
      // Redirect to login if not authenticated
      navigate('/login');
      return;
    }
    
    // Navigate to booking page for this tour
    navigate(`/booking/${tour.slug}`);
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
            className="btn btn--green span-all-rows" 
            id="book-tour" 
            data-tour-id={tour._id}
            onClick={handleBookTour}
          >
            {user ? 'Book tour now!' : 'Log in to book tour'}
          </button>
        </div>
      </div>
    </section>
  );
}

export default TourCta;
