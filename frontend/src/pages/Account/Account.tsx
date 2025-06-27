import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useCurrentUser, useUpdateUser, useUpdatePassword, useUserBookings } from '../../hooks';
import LoadingSpinner from '../../components/LoadingSpinner';
import type { UpdateUserData, UpdatePasswordData } from '../../services';

const Account = () => {
  const location = useLocation();
  const { data: user, isLoading } = useCurrentUser();
  const { data: bookings = [], isLoading: bookingsLoading } = useUserBookings();
  const updateUserMutation = useUpdateUser();
  const updatePasswordMutation = useUpdatePassword();
  
  // Active tab state - check for navigation state
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'settings');
  
  // User form state
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    photo: null as File | null,
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    passwordCurrent: '',
    password: '',
    passwordConfirm: '',
  });

  // Navigation items for regular users
  const userNavItems = [
    { id: 'settings', label: 'Settings', icon: 'settings' },
    { id: 'bookings', label: 'My bookings', icon: 'briefcase' },
    { id: 'reviews', label: 'My reviews', icon: 'star' },
    { id: 'billing', label: 'Billing', icon: 'credit-card' },
  ];

  // Additional navigation items for admin users
  const adminNavItems = [
    { id: 'manage-tours', label: 'Manage tours', icon: 'map' },
    { id: 'manage-users', label: 'Manage users', icon: 'users' },
    { id: 'manage-reviews', label: 'Manage reviews', icon: 'star' },
    { id: 'manage-bookings', label: 'Manage bookings', icon: 'briefcase' },
  ];

  // Update user data when user prop changes
  useEffect(() => {
    if (user) {
      setUserData({
        name: user.name,
        email: user.email,
        photo: null,
      });
    }
  }, [user]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <main className="main">
        <div className="error">
          <div className="error__title">
            <h2 className="heading-secondary heading-secondary--error">
              Please log in to view your account
            </h2>
          </div>
        </div>
      </main>
    );
  }

  const handleUserDataSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updateData: UpdateUserData = {
      name: userData.name,
      email: userData.email,
    };
    if (userData.photo) {
      updateData.photo = userData.photo;
    }
    updateUserMutation.mutate(updateData);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updateData: UpdatePasswordData = {
      passwordCurrent: passwordData.passwordCurrent,
      password: passwordData.password,
      passwordConfirm: passwordData.passwordConfirm,
    };
    updatePasswordMutation.mutate(updateData, {
      onSuccess: () => {
        setPasswordData({
          passwordCurrent: '',
          password: '',
          passwordConfirm: '',
        });
      },
    });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUserData(prev => ({ ...prev, photo: file }));
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'settings':
        return renderSettingsTab();
      case 'bookings':
        return renderBookingsTab();
      case 'reviews':
        return renderReviewsTab();
      case 'billing':
        return renderBillingTab();
      case 'manage-tours':
        return renderManageToursTab();
      case 'manage-users':
        return renderManageUsersTab();
      case 'manage-reviews':
        return renderManageReviewsTab();
      case 'manage-bookings':
        return renderManageBookingsTab();
      default:
        return renderSettingsTab();
    }
  };

  const renderSettingsTab = () => (
    <>
      <div className="user-view__form-container">
        <h2 className="heading-secondary ma-bt-md">Your account settings</h2>
        
        <form 
          className="form form-user-data" 
          onSubmit={handleUserDataSubmit}
        >
          <div className="form__group">
            <label className="form__label" htmlFor="name">Name</label>
            <input
              id="name"
              className="form__input"
              type="text"
              value={userData.name}
              onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))}
              required
              name="name"
            />
          </div>
          <div className="form__group ma-bt-md">
            <label className="form__label" htmlFor="email">Email address</label>
            <input
              id="email"
              className="form__input"
              type="email"
              value={userData.email}
              onChange={(e) => setUserData(prev => ({ ...prev, email: e.target.value }))}
              required
              name="email"
            />
          </div>
          <div className="form__group form__photo-upload">
            <img 
              className="form__user-photo" 
              src={`/img/users/${user.photo}?v=${encodeURIComponent(user.photo)}`} 
              alt="User photo" 
            />
            <input
              className="form__upload"
              type="file"
              accept="image/*"
              id="photo"
              name="photo"
              onChange={handlePhotoChange}
            />
            <label htmlFor="photo">Choose new photo</label>
          </div>
          <div className="form__group right">
            <button 
              className="btn btn--small btn--green"
              type="submit"
              disabled={updateUserMutation.isPending}
            >
              {updateUserMutation.isPending ? 'Saving...' : 'Save settings'}
            </button>
          </div>
        </form>
      </div>

      <div className="line">&nbsp;</div>

      <div className="user-view__form-container">
        <h2 className="heading-secondary ma-bt-md">Password change</h2>
        <form 
          className="form form-user-password"
          onSubmit={handlePasswordSubmit}
        >
          <div className="form__group">
            <label className="form__label" htmlFor="password-current">Current password</label>
            <input
              id="password-current"
              className="form__input"
              type="password"
              placeholder="••••••••"
              value={passwordData.passwordCurrent}
              onChange={(e) => setPasswordData(prev => ({ ...prev, passwordCurrent: e.target.value }))}
              required
              minLength={8}
            />
          </div>
          <div className="form__group">
            <label className="form__label" htmlFor="password">New password</label>
            <input
              id="password"
              className="form__input"
              type="password"
              placeholder="••••••••"
              value={passwordData.password}
              onChange={(e) => setPasswordData(prev => ({ ...prev, password: e.target.value }))}
              required
              minLength={8}
            />
          </div>
          <div className="form__group ma-bt-lg">
            <label className="form__label" htmlFor="password-confirm">Confirm password</label>
            <input
              id="password-confirm"
              className="form__input"
              type="password"
              placeholder="••••••••"
              value={passwordData.passwordConfirm}
              onChange={(e) => setPasswordData(prev => ({ ...prev, passwordConfirm: e.target.value }))}
              required
              minLength={8}
            />
          </div>
          <div className="form__group right">
            <button 
              className="btn btn--small btn--green btn--save-password"
              type="submit"
              disabled={updatePasswordMutation.isPending}
            >
              {updatePasswordMutation.isPending ? 'Saving...' : 'Save password'}
            </button>
          </div>
        </form>
      </div>
    </>
  );

  const renderBookingsTab = () => {
    if (bookingsLoading) {
      return (
        <div className="user-view__form-container">
          <h2 className="heading-secondary ma-bt-md">My bookings</h2>
          <LoadingSpinner />
        </div>
      );
    }

    const allBookings = bookings || [];

    if (allBookings.length === 0) {
      return (
        <div className="user-view__form-container">
          <h2 className="heading-secondary ma-bt-md">My bookings</h2>
          <div className="empty-state">
            <p className="empty-state__text">
              You have no bookings yet. <br />
              <span className="empty-state__subtext">
                Browse our amazing tours and book your next adventure!
              </span>
            </p>
            <a href="/" className="btn btn--green btn--small">
              Browse tours
            </a>
          </div>
        </div>
      );
    }

    return (
      <div className="user-view__form-container">
        <h2 className="heading-secondary ma-bt-md">My bookings</h2>
        <div className="bookings-list">
          {allBookings.map((booking) => (
            <div key={booking._id} className="booking-card">
              <div className="booking-card__image">
                <img 
                  src={`/img/tours/${booking.tour.imageCover}`} 
                  alt={booking.tour.name}
                />
              </div>
              <div className="booking-card__details">
                <h3 className="booking-card__title">{booking.tour.name}</h3>
                <p className="booking-card__info">
                  <span className="booking-card__duration">{booking.tour.duration} days</span>
                  <span className="booking-card__difficulty">{booking.tour.difficulty}</span>
                </p>
                <p className="booking-card__price">${booking.price}</p>
                <p className="booking-card__date">
                  Booked on {new Date(booking.createdAt).toLocaleDateString()}
                </p>
                <p className={`booking-card__status booking-card__status--${booking.paid ? 'paid' : 'unpaid'}`}>
                  {booking.paid ? 'Paid' : 'Unpaid'}
                </p>
              </div>
              <div className="booking-card__actions">
                <a href={`/tour/${booking.tour.slug}`} className="btn btn--small btn--green">
                  View Tour
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderReviewsTab = () => (
    <div className="user-view__form-container">
      <h2 className="heading-secondary ma-bt-md">My reviews</h2>
      <div className="empty-state">
        <p className="empty-state__text">
          You haven't written any reviews yet. <br />
          <span className="empty-state__subtext">
            Share your experience with other travelers by reviewing the tours you've been on!
          </span>
        </p>
      </div>
    </div>
  );

  const renderBillingTab = () => {
    if (bookingsLoading) {
      return (
        <div className="user-view__form-container">
          <h2 className="heading-secondary ma-bt-md">Billing & payments</h2>
          <LoadingSpinner />
        </div>
      );
    }

    const paidBookings = (bookings || []).filter(booking => booking.paid);

    if (paidBookings.length === 0) {
      return (
        <div className="user-view__form-container">
          <h2 className="heading-secondary ma-bt-md">Billing & payments</h2>
          <div className="empty-state">
            <p className="empty-state__text">
              No payment history available. <br />
              <span className="empty-state__subtext">
                Your payment history and receipts will appear here after you make a booking.
              </span>
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="user-view__form-container">
        <h2 className="heading-secondary ma-bt-md">Billing & payments</h2>
        <div className="payments-list">
          {paidBookings.map((booking) => (
            <div key={booking._id} className="payment-card">
              <div className="payment-card__header">
                <h3 className="payment-card__title">{booking.tour.name}</h3>
                <span className="payment-card__amount">${booking.price}</span>
              </div>
              <div className="payment-card__details">
                <p className="payment-card__date">
                  Paid on {new Date(booking.createdAt).toLocaleDateString()}
                </p>
                <p className="payment-card__method">Payment completed</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderManageToursTab = () => (
    <div className="user-view__form-container">
      <h2 className="heading-secondary ma-bt-md">Manage tours</h2>
      <div className="empty-state">
        <p className="empty-state__text">
          Tour management dashboard <br />
          <span className="empty-state__subtext">
            Create, edit, and manage all tours in the system.
          </span>
        </p>
      </div>
    </div>
  );

  const renderManageUsersTab = () => (
    <div className="user-view__form-container">
      <h2 className="heading-secondary ma-bt-md">Manage users</h2>
      <div className="empty-state">
        <p className="empty-state__text">
          User management dashboard <br />
          <span className="empty-state__subtext">
            View and manage all user accounts in the system.
          </span>
        </p>
      </div>
    </div>
  );

  const renderManageReviewsTab = () => (
    <div className="user-view__form-container">
      <h2 className="heading-secondary ma-bt-md">Manage reviews</h2>
      <div className="empty-state">
        <p className="empty-state__text">
          Review management dashboard <br />
          <span className="empty-state__subtext">
            Moderate and manage all reviews in the system.
          </span>
        </p>
      </div>
    </div>
  );

  const renderManageBookingsTab = () => (
    <div className="user-view__form-container">
      <h2 className="heading-secondary ma-bt-md">Manage bookings</h2>
      <div className="empty-state">
        <p className="empty-state__text">
          Booking management dashboard <br />
          <span className="empty-state__subtext">
            View and manage all bookings in the system.
          </span>
        </p>
      </div>
    </div>
  );

  return (
    <main className="main">
      <div className="user-view">
        <nav className="user-view__menu">
          <ul className="side-nav">
            {userNavItems.map((item) => (
              <li key={item.id} className={activeTab === item.id ? 'side-nav--active' : ''}>
                <a 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveTab(item.id);
                  }}
                >
                  <svg>
                    <use xlinkHref={`/img/icons.svg#icon-${item.icon}`}></use>
                  </svg>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          {user.role === 'admin' && (
            <div className="admin-nav">
              <h5 className="admin-nav__heading">Admin</h5>
              <ul className="side-nav">
                {adminNavItems.map((item) => (
                  <li key={item.id} className={activeTab === item.id ? 'side-nav--active' : ''}>
                    <a 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveTab(item.id);
                      }}
                    >
                      <svg>
                        <use xlinkHref={`/img/icons.svg#icon-${item.icon}`}></use>
                      </svg>
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </nav>

        <div className="user-view__content">
          {renderTabContent()}
        </div>
      </div>
    </main>
  );
};

export default Account;
