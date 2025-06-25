import { TourCard, LoadingSpinner } from '../components';
import { useTours } from '../hooks';

function Overview() {
  const { data: tours, isLoading, error } = useTours();

  if (isLoading) {
    return (
      <main className="main">
        <LoadingSpinner />
      </main>
    );
  }

  if (error) {
    return (
      <main className="main">
        <div className="card-container" style={{ textAlign: 'center', padding: '4rem' }}>
          <h2>Error loading tours</h2>
          <p>Please try again later or check if the backend server is running on port 8000.</p>
        </div>
      </main>
    );
  }

  if (!tours || tours.length === 0) {
    return (
      <main className="main">
        <div className="card-container" style={{ textAlign: 'center', padding: '4rem' }}>
          <h2>No tours available</h2>
        </div>
      </main>
    );
  }

  return (
    <main className="main">
      <div className="card-container">
        {tours.map((tour) => (
          <TourCard key={tour._id} tour={tour} />
        ))}
      </div>
    </main>
  );
}

export default Overview;
