import { useParams } from 'react-router-dom';
import {
  TourHeader,
  TourDescription,
  TourPictures,
  TourMap,
  TourReviews,
  TourCta,
  LoadingSpinner,
} from '../components';
import { useTour } from '../hooks';

function Tour() {
  const { slug } = useParams<{ slug: string }>();
  const { data: tour, isLoading, error } = useTour(slug || '');

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="error-container">
        <h1>Something went wrong</h1>
        <p>Could not load tour details. Please try again later.</p>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="error-container">
        <h1>Tour not found</h1>
        <p>The tour you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <>
      <TourHeader tour={tour} />
      <TourDescription tour={tour} />
      <TourPictures tour={tour} />
      <TourMap tour={tour} />
      <TourReviews tour={tour} />
      <TourCta tour={tour} />
    </>
  );
}

export default Tour;
