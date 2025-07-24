import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMyGuideTours, useTourParticipants } from '../hooks';
import { LoadingSpinner } from '../components';
import { formatPrice } from '../utils';

function MyGuideTours() {
  const [selectedTourId, setSelectedTourId] = useState<string>('');
  const { data: guideTours, isLoading: toursLoading, error: toursError } = useMyGuideTours();
  const { data: participants, isLoading: participantsLoading } = useTourParticipants(selectedTourId);

  if (toursLoading) return <LoadingSpinner />;
  
  if (toursError) {
    return (
      <main className="main">
        <div className="user-view">
          <div className="user-view__content">
            <div className="user-view__form-container">
              <h2 className="heading-secondary ma-bt-md">Error Loading Guide Tours</h2>
              <p>There was an error loading your assigned tours. Please try again later.</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const tours = guideTours?.data?.tours || [];

  if (tours.length === 0) {
    return (
      <main className="main">
        <div className="user-view">
          <div className="user-view__content">
            <div className="user-view__form-container">
              <h2 className="heading-secondary ma-bt-md">My Guide Tours</h2>
              <p>You are not currently assigned to guide any tours.</p>
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
            <h2 className="heading-secondary ma-bt-md">My Guide Tours</h2>
            <p className="user-view__subtitle">
              Tours you are assigned to guide ({tours.length} tour{tours.length !== 1 ? 's' : ''})
            </p>

            <div className="guide-tours-grid">
              {tours.map((tour) => (
                <div key={tour._id} className="guide-tour-card">
                  <div className="guide-tour-card__header">
                    <Link to={`/tour/${tour.slug}`} className="guide-tour-card__picture-link" title="Click to view tour details">
                      <img
                        src={`/img/tours/${tour.imageCover}`}
                        alt={tour.name}
                        className="guide-tour-card__picture"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/img/tours/tour-1-cover.jpg';
                        }}
                      />
                      <div className="guide-tour-card__picture-overlay">
                        <svg className="guide-tour-card__picture-icon">
                          <use xlinkHref="/img/icons.svg#icon-eye"></use>
                        </svg>
                        <span>View Details</span>
                      </div>
                    </Link>
                    <h3 className="guide-tour-card__heading">
                      <Link to={`/tour/${tour.slug}`} className="guide-tour-card__heading-link">
                        <span>{tour.name}</span>
                      </Link>
                    </h3>
                  </div>

                  <div className="guide-tour-card__details">
                    <h4>Tour Details</h4>
                    <div className="guide-tour-card__data">
                      <svg className="guide-tour-card__icon">
                        <use xlinkHref="/img/icons.svg#icon-calendar"></use>
                      </svg>
                      <span>{tour.duration} days</span>
                    </div>
                    <div className="guide-tour-card__data">
                      <svg className="guide-tour-card__icon">
                        <use xlinkHref="/img/icons.svg#icon-user"></use>
                      </svg>
                      <span>Max {tour.maxGroupSize} people</span>
                    </div>
                    <div className="guide-tour-card__data">
                      <svg className="guide-tour-card__icon">
                        <use xlinkHref="/img/icons.svg#icon-star"></use>
                      </svg>
                      <span>{tour.ratingsAverage} rating ({tour.ratingsQuantity} reviews)</span>
                    </div>
                    <div className="guide-tour-card__data">
                      <svg className="guide-tour-card__icon">
                        <use xlinkHref="/img/icons.svg#icon-dollar-sign"></use>
                      </svg>
                      <span>{formatPrice(tour.price)} per person</span>
                    </div>
                  </div>

                  <div className="guide-tour-card__footer">
                    <p className="guide-tour-card__description">
                      {tour.summary}
                    </p>
                    <button
                      className="btn btn--green btn--small"
                      onClick={() => setSelectedTourId(selectedTourId === tour._id ? '' : tour._id)}
                    >
                      {selectedTourId === tour._id ? 'Hide Participants' : 'View Participants'}
                    </button>
                  </div>

                  {selectedTourId === tour._id && (
                    <div className="guide-tour-card__participants">
                      <div className="participants-header">
                        <h4>Tour Participants</h4>
                        {participants?.data?.participants && participants.data.participants.length > 0 && (
                          <span className="participants-count">
                            {participants.data.participants.length} / {tour.maxGroupSize} booked
                          </span>
                        )}
                      </div>
                      {participantsLoading ? (
                        <p>Loading participants...</p>
                      ) : (
                        <div className="participants-container">
                          {participants?.data?.participants?.length === 0 ? (
                            <div className="participants-empty">
                              <p>No participants have booked this tour yet.</p>
                              <p className="participants-empty-subtext">
                                Capacity: {tour.maxGroupSize} people
                              </p>
                            </div>
                          ) : (
                            <div className="participants-grid">
                              {participants?.data?.participants?.map((participant) => (
                                <div key={participant._id} className="participant-compact-card">
                                  <img
                                    src={`/img/users/${participant.user.photo}`}
                                    alt={participant.user.name}
                                    className="participant-compact-card__photo"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.src = '/img/users/default.jpg';
                                    }}
                                  />
                                  <div className="participant-compact-card__info">
                                    <h6>{participant.user.name}</h6>
                                    <p>{participant.user.email}</p>
                                    <span className="participant-compact-card__price">
                                      {formatPrice(participant.price)}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default MyGuideTours;
