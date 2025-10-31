import { useState } from 'react';
import { useMyAvailability, useUpdateAvailability, useAddUnavailableDate, useRemoveUnavailableDate, useCurrentUser } from '../hooks';
import { LoadingSpinner, ConfirmModal } from '../components';

function GuideAvailability() {
  const { data: currentUser } = useCurrentUser();
  const { data: availability, isLoading: availabilityLoading } = useMyAvailability();
  const updateAvailabilityMutation = useUpdateAvailability();
  const addUnavailableDateMutation = useAddUnavailableDate();
  const removeUnavailableDateMutation = useRemoveUnavailableDate();

  const [availabilityNote, setAvailabilityNote] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; dateId: string; dateRange: string }>({
    isOpen: false,
    dateId: '',
    dateRange: ''
  });

  // Check if user has permission
  if (currentUser && !['guide', 'lead-guide', 'admin'].includes(currentUser.role)) {
    return (
      <main className="main">
        <div className="user-view">
          <div className="user-view__content">
            <div className="user-view__form-container">
              <h2 className="heading-secondary ma-bt-md">Access Denied</h2>
              <p>You don't have permission to manage availability. This feature is available for guides only.</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (availabilityLoading) return <LoadingSpinner />;

  const availabilityData = availability?.data;

  const handleAvailabilityToggle = (available: boolean) => {
    updateAvailabilityMutation.mutate({
      available,
      availabilityNote: availabilityNote || availabilityData?.availabilityNote || ''
    });
  };

  const handleUpdateNote = () => {
    updateAvailabilityMutation.mutate({
      available: availabilityData?.available ?? true,
      availabilityNote
    });
  };

  const handleAddUnavailableDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate) return;

    addUnavailableDateMutation.mutate({
      startDate,
      endDate,
      reason
    }, {
      onSuccess: () => {
        setStartDate('');
        setEndDate('');
        setReason('');
      }
    });
  };

  const handleRemoveDate = (dateId: string) => {
    removeUnavailableDateMutation.mutate(dateId);
    setConfirmModal({ isOpen: false, dateId: '', dateRange: '' });
  };

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start).toLocaleDateString();
    const endDate = new Date(end).toLocaleDateString();
    return `${startDate} - ${endDate}`;
  };

  const isDateInPast = (dateString: string) => {
    return new Date(dateString) < new Date();
  };

  return (
    <main className="main">
      <div className="user-view">
        <div className="user-view__content">
          <div className="user-view__form-container">
            <h2 className="heading-secondary ma-bt-md">My Availability</h2>
            <p className="user-view__subtitle">
              Manage your availability status and schedule for tour assignments
            </p>

            {/* Current Availability Status */}
            <div className="availability-status">
              <h3 className="heading-tertiary ma-bt-sm">Current Status</h3>
              <div className={`availability-indicator ${availabilityData?.available ? 'available' : 'unavailable'}`}>
                <div className="availability-indicator__icon">
                  {availabilityData?.available ? '✅' : '❌'}
                </div>
                <div className="availability-indicator__text">
                  <strong>
                    {availabilityData?.available ? 'Available' : 'Unavailable'}
                  </strong>
                  <p>You are currently {availabilityData?.available ? 'available' : 'unavailable'} for tour assignments</p>
                </div>
              </div>

              <div className="availability-actions">
                <button
                  className={`btn btn--small ${availabilityData?.available ? 'btn--red' : 'btn--green'}`}
                  onClick={() => handleAvailabilityToggle(!availabilityData?.available)}
                  disabled={updateAvailabilityMutation.isPending}
                >
                  {updateAvailabilityMutation.isPending 
                    ? 'Updating...' 
                    : availabilityData?.available 
                      ? 'Mark Unavailable' 
                      : 'Mark Available'
                  }
                </button>
              </div>
            </div>

            {/* Availability Note */}
            <div className="availability-note">
              <h3 className="heading-tertiary ma-bt-sm">Availability Note</h3>
              <div className="form__group">
                <textarea
                  className="form__input"
                  placeholder="Add a note about your availability (optional)"
                  value={availabilityNote || availabilityData?.availabilityNote || ''}
                  onChange={(e) => setAvailabilityNote(e.target.value)}
                  maxLength={200}
                  rows={3}
                />
                <small className="form__help">
                  {(availabilityNote || availabilityData?.availabilityNote || '').length}/200 characters
                </small>
              </div>
              <button
                className="btn btn--small btn--blue"
                onClick={handleUpdateNote}
                disabled={updateAvailabilityMutation.isPending}
              >
                {updateAvailabilityMutation.isPending ? 'Updating...' : 'Update Note'}
              </button>
            </div>

            {/* Add Unavailable Date Range */}
            <div className="unavailable-dates-form">
              <h3 className="heading-tertiary ma-bt-sm">Add Unavailable Period</h3>
              <form onSubmit={handleAddUnavailableDate} className="form">
                <div className="form__group-inline">
                  <div className="form__group">
                    <label className="form__label" htmlFor="start-date">Start Date</label>
                    <input
                      id="start-date"
                      className="form__input"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                  <div className="form__group">
                    <label className="form__label" htmlFor="end-date">End Date</label>
                    <input
                      id="end-date"
                      className="form__input"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate || new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                </div>
                <div className="form__group">
                  <label className="form__label" htmlFor="reason">Reason (Optional)</label>
                  <input
                    id="reason"
                    className="form__input"
                    type="text"
                    placeholder="e.g., Vacation, Personal leave, Training"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    maxLength={100}
                  />
                </div>
                <div className="form__group">
                  <button
                    type="submit"
                    className="btn btn--green"
                    disabled={addUnavailableDateMutation.isPending || !startDate || !endDate}
                  >
                    {addUnavailableDateMutation.isPending ? 'Adding...' : 'Add Unavailable Period'}
                  </button>
                </div>
              </form>
            </div>

            {/* Current Unavailable Dates */}
            <div className="unavailable-dates-list">
              <h3 className="heading-tertiary ma-bt-sm">Scheduled Unavailable Periods</h3>
              {availabilityData?.unavailableDates?.length === 0 ? (
                <div className="empty-state">
                  <p>No unavailable periods scheduled.</p>
                </div>
              ) : (
                <div className="unavailable-dates-grid">
                  {availabilityData?.unavailableDates?.map((dateRange) => (
                    <div 
                      key={dateRange._id} 
                      className={`unavailable-date-card ${isDateInPast(dateRange.endDate) ? 'past' : ''}`}
                    >
                      <div className="unavailable-date-card__header">
                        <h4 className="unavailable-date-card__dates">
                          {formatDateRange(dateRange.startDate, dateRange.endDate)}
                        </h4>
                        {isDateInPast(dateRange.endDate) && (
                          <span className="unavailable-date-card__badge">Past</span>
                        )}
                      </div>
                      {dateRange.reason && (
                        <p className="unavailable-date-card__reason">
                          <strong>Reason:</strong> {dateRange.reason}
                        </p>
                      )}
                      <div className="unavailable-date-card__actions">
                        <button
                          className="btn btn--small btn--red"
                          onClick={() => setConfirmModal({
                            isOpen: true,
                            dateId: dateRange._id,
                            dateRange: formatDateRange(dateRange.startDate, dateRange.endDate)
                          })}
                          disabled={removeUnavailableDateMutation.isPending}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Remove Unavailable Period"
        message={`Are you sure you want to remove the unavailable period: ${confirmModal.dateRange}?`}
        confirmText="Remove"
        onCancel={() => setConfirmModal({ isOpen: false, dateId: '', dateRange: '' })}
        onConfirm={() => handleRemoveDate(confirmModal.dateId)}
      />
    </main>
  );
}

export default GuideAvailability;