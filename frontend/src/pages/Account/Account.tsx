import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCurrentUser, useUpdateUser, useUpdatePassword } from '../../hooks';
import LoadingSpinner from '../../components/LoadingSpinner';
import type { UpdateUserData, UpdatePasswordData } from '../../services';

const Account = () => {
  const { data: user, isLoading } = useCurrentUser();
  const updateUserMutation = useUpdateUser();
  const updatePasswordMutation = useUpdatePassword();
  
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
    { id: 'settings', label: 'Settings', icon: 'settings', active: true },
    { id: 'bookings', label: 'My bookings', icon: 'briefcase', active: false },
    { id: 'reviews', label: 'My reviews', icon: 'star', active: false },
    { id: 'billing', label: 'Billing', icon: 'credit-card', active: false },
  ];

  // Additional navigation items for admin users
  const adminNavItems = [
    { id: 'manage-tours', label: 'Manage tours', icon: 'map', active: false },
    { id: 'manage-users', label: 'Manage users', icon: 'users', active: false },
    { id: 'manage-reviews', label: 'Manage reviews', icon: 'star', active: false },
    { id: 'manage-bookings', label: 'Manage bookings', icon: 'briefcase', active: false },
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

  return (
    <main className="main">
      <div className="user-view">
        <nav className="user-view__menu">
          <ul className="side-nav">
            {userNavItems.map((item) => (
              <li key={item.id} className={item.active ? 'side-nav--active' : ''}>
                {item.id === 'bookings' ? (
                  <Link to="/my-tours">
                    <svg>
                      <use xlinkHref={`/img/icons.svg#icon-${item.icon}`}></use>
                    </svg>
                    {item.label}
                  </Link>
                ) : (
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    <svg>
                      <use xlinkHref={`/img/icons.svg#icon-${item.icon}`}></use>
                    </svg>
                    {item.label}
                  </a>
                )}
              </li>
            ))}
          </ul>

          {user.role === 'admin' && (
            <div className="admin-nav">
              <h5 className="admin-nav__heading">Admin</h5>
              <ul className="side-nav">
                {adminNavItems.map((item) => (
                  <li key={item.id}>
                    <a href="#" onClick={(e) => e.preventDefault()}>
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
        </div>
      </div>
    </main>
  );
};

export default Account;
