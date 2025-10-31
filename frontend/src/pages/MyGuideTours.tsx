import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMyGuideTours, useTourParticipants, useCurrentUser, useDeleteTour, useCheckInParticipant, useCheckOutParticipant, useUpdateTourCapacity, useAssignGuideToTour, useUnassignGuideFromTour } from '../hooks';
import { LoadingSpinner } from '../components';
import { formatPrice } from '../utils';

function MyGuideTours() {
  const [selectedTourId, setSelectedTourId] = useState<string>('');
  const [managingTourId, setManagingTourId] = useState<string>('');
  const [newCapacity, setNewCapacity] = useState<number>(0);
  const [guideEmail, setGuideEmail] = useState<string>('');
  
  const { data: guideTours, isLoading: toursLoading, error: toursError } = useMyGuideTours();
  const { data: participants, isLoading: participantsLoading } = useTourParticipants(selectedTourId);
  const { data: currentUser } = useCurrentUser();
  
  const deleteTourMutation = useDeleteTour();
  const checkInMutation = useCheckInParticipant();
  const checkOutMutation = useCheckOutParticipant();
  const updateCapacityMutation = useUpdateTourCapacity();
  const assignGuideMutation = useAssignGuideToTour();
  const unassignGuideMutation = useUnassignGuideFromTour();

  const handleDeleteTour = (tourId: string) => {
    if (window.confirm('Are you sure you want to delete this tour? This action cannot be undone.')) {
      deleteTourMutation.mutate(tourId);
    }
  };

  const handleCheckIn = (tourId: string, bookingId: string) => {
    checkInMutation.mutate({ tourId, bookingId });
  };

  const handleCheckOut = (tourId: string, bookingId: string) => {
    checkOutMutation.mutate({ tourId, bookingId });
  };

  const handleUpdateCapacity = (tourId: string) => {
    if (newCapacity < 1 || newCapacity > 50) {
      alert('Capacity must be between 1 and 50');
      return;
    }
    updateCapacityMutation.mutate({ id: tourId, maxGroupSize: newCapacity });
    setManagingTourId('');
    setNewCapacity(0);
  };

  const handleAssignGuide = (tourId: string) => {
    if (!guideEmail.trim()) {
      alert('Please enter a guide email');
      return;
    }
    assignGuideMutation.mutate({ id: tourId, email: guideEmail });
    setGuideEmail('');
  };

  const handleUnassignGuide = (tourId: string, guideId: string, guideName: string) => {
    if (window.confirm(`Are you sure you want to unassign ${guideName} from this tour?`)) {
      unassignGuideMutation.mutate({ id: tourId, guideId });
    }
  };

  const isLeadGuide = (tour: any) => {
    return currentUser?.role === 'lead-guide' && 
           tour.guides && 
           tour.guides.length > 0 && 
           tour.guides[0]._id === currentUser._id;
  };

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
            <div className="guide-tours-header">
              <div>
                <h2 className="heading-secondary ma-bt-md">My Guide Tours</h2>
                <p className="user-view__subtitle">
                  Tours you are assigned to guide ({tours.length} tour{tours.length !== 1 ? 's' : ''})
                </p>
              </div>
              {currentUser?.role === 'lead-guide' && (
                <div className="guide-tours-actions">
                  <Link to="/tours/create" className="btn btn--green">
                    <svg className="btn__icon">
                      <use xlinkHref="/img/icons.svg#icon-plus"></use>
                    </svg>
                    Create New Tour
                  </Link>
                </div>
              )}
            </div>

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
                    <div className="guide-tour-card__actions">
                      <button
                        className="btn btn--green btn--small"
                        onClick={() => setSelectedTourId(selectedTourId === tour._id ? '' : tour._id)}
                      >
                        {selectedTourId === tour._id ? 'Hide Participants' : 'View Participants'}
                      </button>
                      {/* Show management options for lead-guides */}
                      {isLeadGuide(tour) && (
                        <div className="guide-tour-card__management">
                          <Link to={`/tours/edit/${tour._id}`} className="btn btn--small btn--blue">
                            <svg className="guide-tour-card__icon">
                              <use xlinkHref="/img/icons.svg#icon-edit"></use>
                            </svg>
                            Edit
                          </Link>
                          <button 
                            className="btn btn--small btn--green"
                            onClick={() => setManagingTourId(managingTourId === tour._id ? '' : tour._id)}
                          >
                            <svg className="guide-tour-card__icon">
                              <use xlinkHref="/img/icons.svg#icon-settings"></use>
                            </svg>
                            Manage
                          </button>
                          <button className="btn btn--small btn--red" onClick={() => handleDeleteTour(tour._id)}>
                            <svg className="guide-tour-card__icon">
                              <use xlinkHref="/img/icons.svg#icon-trash"></use>
                            </svg>
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tour Management Interface for Lead Guides */}
                  {managingTourId === tour._id && isLeadGuide(tour) && (
                    <div className="guide-tour-card__management-panel">
                      <h4>Tour Management</h4>
                      
                      {/* Capacity Management */}
                      <div className="management-section">
                        <h5>Update Capacity</h5>
                        <div className="capacity-controls">
                          <span>Current: {tour.maxGroupSize} people</span>
                          <div className="capacity-input-group">
                            <input
                              type="number"
                              min="1"
                              max="50"
                              value={newCapacity || tour.maxGroupSize}
                              onChange={(e) => setNewCapacity(Number(e.target.value))}
                              className="form__input form__input--small"
                              placeholder="New capacity"
                            />
                            <button
                              className="btn btn--small btn--green"
                              onClick={() => handleUpdateCapacity(tour._id)}
                              disabled={updateCapacityMutation.isPending}
                            >
                              {updateCapacityMutation.isPending ? 'Updating...' : 'Update'}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Guide Management */}
                      <div className="management-section">
                        <h5>Manage Guides</h5>
                        
                        {/* Current Guides */}
                        <div className="current-guides">
                          <h6>Current Guides ({tour.guides?.length || 0})</h6>
                          {tour.guides?.map((guide: any, index: number) => (
                            <div key={guide._id} className="guide-item">
                              <div className="guide-info">
                                <img
                                  src={`/img/users/${guide.photo}`}
                                  alt={guide.name}
                                  className="guide-photo"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.src = '/img/users/default.jpg';
                                  }}
                                />
                                <div>
                                  <strong>{guide.name}</strong>
                                  {index === 0 && <span className="lead-badge">Lead Guide</span>}
                                  <p>{guide.email}</p>
                                </div>
                              </div>
                              {index > 0 && (
                                <button
                                  className="btn btn--small btn--red"
                                  onClick={() => handleUnassignGuide(tour._id, guide._id, guide.name)}
                                  disabled={unassignGuideMutation.isPending}
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Add Guide */}
                        <div className="add-guide">
                          <h6>Assign New Guide</h6>
                          <div className="guide-input-group">
                            <input
                              type="email"
                              value={guideEmail}
                              onChange={(e) => setGuideEmail(e.target.value)}
                              className="form__input form__input--small"
                              placeholder="Guide email address"
                            />
                            <button
                              className="btn btn--small btn--green"
                              onClick={() => handleAssignGuide(tour._id)}
                              disabled={assignGuideMutation.isPending || !guideEmail.trim()}
                            >
                              {assignGuideMutation.isPending ? 'Assigning...' : 'Assign'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

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
                                <div key={participant._id} className={`participant-compact-card ${participant.checkedIn ? 'participant-compact-card--checked-in' : ''}`}>
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
                                    {participant.checkedIn && (
                                      <div className="participant-compact-card__status">
                                        <svg className="participant-compact-card__check-icon">
                                          <use xlinkHref="/img/icons.svg#icon-check"></use>
                                        </svg>
                                        <span>Checked In</span>
                                        {participant.checkedInAt && (
                                          <small>
                                            {new Date(participant.checkedInAt).toLocaleString()}
                                          </small>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                  <div className="participant-compact-card__actions">
                                    {participant.checkedIn ? (
                                      <button
                                        className="btn btn--small btn--red"
                                        onClick={() => handleCheckOut(selectedTourId, participant._id)}
                                        disabled={checkOutMutation.isPending}
                                      >
                                        {checkOutMutation.isPending ? 'Processing...' : 'Check Out'}
                                      </button>
                                    ) : (
                                      <button
                                        className="btn btn--small btn--green"
                                        onClick={() => handleCheckIn(selectedTourId, participant._id)}
                                        disabled={checkInMutation.isPending}
                                      >
                                        {checkInMutation.isPending ? 'Processing...' : 'Check In'}
                                      </button>
                                    )}
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
