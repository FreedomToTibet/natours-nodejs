import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useCurrentUser, useUpdateUser, useUpdatePassword, useUserBookings, useUserReviews } from '../../hooks';
import { adminService } from '../../services/adminService';
import LoadingSpinner from '../../components/LoadingSpinner';
import { ConfirmModal } from '../../components';
import { StarRating } from '../../components';
import { formatCurrency } from '../../utils';
import { toast } from 'react-toastify';
import type { UpdateUserData, UpdatePasswordData } from '../../services';

// Constant for sessionStorage key
const ACTIVE_TAB_STORAGE_KEY = 'natours_account_active_tab';

const Account = () => {
  const location = useLocation();
  const { data: user, isLoading } = useCurrentUser();
  const { data: bookings = [], isLoading: bookingsLoading } = useUserBookings();
  const { data: reviews = [], isLoading: reviewsLoading } = useUserReviews();
  const updateUserMutation = useUpdateUser();
  const updatePasswordMutation = useUpdatePassword();
  // 1. Navigation state (when navigating programmatically with state)
  // 2. sessionStorage (for browser back/forward navigation)
  // 3. Default to 'settings' if nothing is found
  const [activeTab, setActiveTab] = useState(() => {
    return location.state?.activeTab || 
           sessionStorage.getItem(ACTIVE_TAB_STORAGE_KEY) || 
           'settings';
  });
  
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

  // Navigation items for guides and lead-guides
  const guideNavItems = [
    { id: 'settings', label: 'Settings', icon: 'settings' },
    { id: 'guide-tours', label: 'Guide Schedule', icon: 'map' },
    { id: 'guide-info', label: 'Guide Information', icon: 'user' },
  ];

  // Additional navigation items for admin users
  const adminNavItems = [
    { id: 'manage-tours', label: 'Manage tours', icon: 'map' },
    { id: 'manage-users', label: 'Manage users', icon: 'users' },
    { id: 'manage-reviews', label: 'Manage reviews', icon: 'star' },
    { id: 'manage-bookings', label: 'Manage bookings', icon: 'briefcase' },
  ];

  // Get navigation items based on user role
  const getNavItems = () => {
    if (user?.role === 'guide' || user?.role === 'lead-guide') {
      return guideNavItems;
    }
    return userNavItems;
  };
  
  // Handle tab switching
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  // Save active tab to sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem(ACTIVE_TAB_STORAGE_KEY, activeTab);
  }, [activeTab]);

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

  const ManageToursTab: React.FC = () => {
    const [tours, setTours] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState('');
    const [activeTour, setActiveTour] = useState<string>('');
    const [savingId, setSavingId] = useState<string>('');
    const [reassignError, setReassignError] = useState<string>('');

    useEffect(() => {
      let mounted = true;
      (async () => {
        try {
          setLoading(true);
          const data = await adminService.getTours();
          if (mounted) setTours(data);
        } finally {
          if (mounted) setLoading(false);
        }
      })();
      return () => { mounted = false; };
    }, []);

    return (
      <div className="user-view__form-container">
        <h2 className="heading-secondary ma-bt-md">Manage tours</h2>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="table">
            <div className="table__row table__row--head">
              <div>Name</div>
              <div>Lead guide</div>
              <div>Actions</div>
            </div>
            {tours.map((t) => (
              <div key={t._id} className="table__row">
                <div>{t.name}</div>
                <div>{t.guides?.[0]?.email || t.guides?.[0]?.name || '—'}</div>
                <div style={{ display: 'flex', gap: '0.8rem' }}>
                  <input
                    className="form__input"
                    type="email"
                    placeholder="new lead guide email"
                    value={activeTour === t._id ? email : ''}
                    onFocus={() => setActiveTour(t._id)}
                    onChange={(e) => { setEmail(e.target.value); if (reassignError) setReassignError(''); }}
                    style={{ maxWidth: '26rem' }}
                  />
                  <button className="btn btn--small btn--blue" disabled={savingId === t._id} onClick={async () => {
                    if (activeTour !== t._id) setActiveTour(t._id);
                    const value = email.trim();
                    if (!value) {
                      setReassignError('Please enter an email address');
                      return;
                    }
                    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
                    if (!emailOk) {
                      setReassignError('Please enter a valid email address');
                      return;
                    }
                    try {
                      setSavingId(t._id);
                      await adminService.reassignLeadGuide(t._id, value);
                      const refreshed = await adminService.getTours();
                      setTours(refreshed);
                      toast.success('Lead guide reassigned');
                      setEmail('');
                      setActiveTour('');
                      setReassignError('');
                    } catch (err: any) {
                      const msg = err?.response?.data?.message || 'Failed to reassign lead guide';
                      setReassignError(msg);
                      toast.error(msg);
                    } finally {
                      setSavingId('');
                    }
                  }}>{savingId === t._id ? 'Saving...' : 'Reassign lead'}</button>
                </div>
                {activeTour === t._id && reassignError && (
                  <div style={{ color: '#ff4d4f', fontSize: '1.2rem', marginTop: '0.6rem' }}>{reassignError}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const ManageUsersTab: React.FC = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState<string>('');
    const [lastAdminId, setLastAdminId] = useState<string | null>(null);

    useEffect(() => {
      let mounted = true;
      (async () => {
        try {
          setLoading(true);
          const data = await adminService.getUsers();
          if (mounted) {
            setUsers(data);
            const activeAdmins = (data || []).filter((u: any) => u.role === 'admin' && u.active !== false);
            setLastAdminId(activeAdmins.length === 1 ? activeAdmins[0]._id : null);
          }
        } finally {
          if (mounted) setLoading(false);
        }
      })();
      return () => { mounted = false; };
    }, []);

    return (
      <div className="user-view__form-container">
        <h2 className="heading-secondary ma-bt-md">Manage users</h2>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="table">
            <div className="table__row table__row--head">
              <div>Name</div>
              <div>Email</div>
              <div>Role</div>
              <div>Actions</div>
            </div>
            {users.map((u) => (
              <div key={u._id} className="table__row">
                <div>{u.name}</div>
                <div>{u.email}</div>
                <div>
                  {(() => {
                    const isLastAdminRow = lastAdminId === u._id && u.role === 'admin';
                    const disabledHint = isLastAdminRow ? 'Cannot demote the last remaining admin' : undefined;
                    return (
                      <select
                        value={u.role}
                        title={disabledHint}
                        onChange={(e) => setUsers(prev => prev.map(p => p._id === u._id ? { ...p, role: e.target.value } : p))}
                      >
                        <option value="user" disabled={isLastAdminRow}>user</option>
                        <option value="guide" disabled={isLastAdminRow}>guide</option>
                        <option value="lead-guide" disabled={isLastAdminRow}>lead-guide</option>
                        <option value="admin">admin</option>
                      </select>
                    );
                  })()}
                </div>
                <div>
                  <button
                    className="btn btn--small btn--green"
                    disabled={savingId === u._id}
                    onClick={async () => {
                      try {
                        setSavingId(u._id);
                        await adminService.updateUserRole(u._id, u.role);
                        toast.success('User role updated');
                      } catch (err: any) {
                        const msg = err?.response?.data?.message || 'Failed to update user role';
                        toast.error(msg);
                      } finally {
                        setSavingId('');
                      }
                    }}
                  >
                    {savingId === u._id ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const ManageReviewsTab: React.FC = () => {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingId, setPendingId] = useState<string | null>(null);

    useEffect(() => {
      let mounted = true;
      (async () => {
        try {
          setLoading(true);
          const data = await adminService.getAllReviews();
          if (mounted) setReviews(data);
        } finally {
          if (mounted) setLoading(false);
        }
      })();
      return () => { mounted = false; };
    }, []);

    return (
      <div className="user-view__form-container">
        <h2 className="heading-secondary ma-bt-md">Manage reviews</h2>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="table">
            <div className="table__row table__row--head">
              <div>Tour</div>
              <div>User</div>
              <div>Rating</div>
              <div>Review</div>
              <div>Actions</div>
            </div>
            {reviews.map((r) => (
              <div key={r._id} className="table__row">
                <div>{r.tour?.name || '—'}</div>
                <div>{r.user?.name || '—'}</div>
                <div>{r.rating}</div>
                <div style={{ maxWidth: '40rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.review}</div>
                <div>
                  <button className="btn btn--small btn--red" onClick={() => { setPendingId(r._id); setConfirmOpen(true); }}>Delete</button>
                </div>
              </div>
            ))}
            <ConfirmModal
              isOpen={confirmOpen}
              title="Delete review?"
              message="This action cannot be undone."
              confirmText="Delete"
              onCancel={() => { setConfirmOpen(false); setPendingId(null); }}
              onConfirm={async () => {
                if (!pendingId) return;
                try {
                  await adminService.deleteReview(pendingId);
                  setReviews(prev => prev.filter(p => p._id !== pendingId));
                  toast.success('Review deleted');
                } catch (err: any) {
                  const msg = err?.response?.data?.message || 'Failed to delete review';
                  toast.error(msg);
                } finally {
                  setConfirmOpen(false);
                  setPendingId(null);
                }
              }}
            />
          </div>
        )}
      </div>
    );
  };

  const ManageBookingsTab: React.FC = () => {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingId, setPendingId] = useState<string | null>(null);

    useEffect(() => {
      let mounted = true;
      (async () => {
        try {
          setLoading(true);
          const data = await adminService.getAllBookings();
          if (mounted) setItems(data);
        } finally {
          if (mounted) setLoading(false);
        }
      })();
      return () => { mounted = false; };
    }, []);

    return (
      <div className="user-view__form-container">
        <h2 className="heading-secondary ma-bt-md">Manage bookings</h2>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="table">
            <div className="table__row table__row--head">
              <div>Tour</div>
              <div>User</div>
              <div>Price</div>
              <div>Paid</div>
              <div>Actions</div>
            </div>
            {items.map((b) => (
              <div key={b._id} className="table__row">
                <div>{b.tour?.name || '—'}</div>
                <div>{b.user?.name || '—'}</div>
                <div>{formatCurrency(b.price)}</div>
                <div>{b.paid ? 'Yes' : 'No'}</div>
                <div>
                  <button className="btn btn--small btn--red" onClick={() => { setPendingId(b._id); setConfirmOpen(true); }}>Delete</button>
                </div>
              </div>
            ))}
            <ConfirmModal
              isOpen={confirmOpen}
              title="Delete booking?"
              message="This action cannot be undone."
              confirmText="Delete"
              onCancel={() => { setConfirmOpen(false); setPendingId(null); }}
              onConfirm={async () => {
                if (!pendingId) return;
                try {
                  await adminService.deleteBooking(pendingId);
                  setItems(prev => prev.filter(p => p._id !== pendingId));
                  toast.success('Booking deleted');
                } catch (err: any) {
                  const msg = err?.response?.data?.message || 'Failed to delete booking';
                  toast.error(msg);
                } finally {
                  setConfirmOpen(false);
                  setPendingId(null);
                }
              }}
            />
          </div>
        )}
      </div>
    );
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
      case 'guide-tours':
        return renderGuideToursTab();
      case 'guide-info':
        return renderGuideInfoTab();
      case 'manage-tours':
        return user.role === 'admin' ? <ManageToursTab /> : renderSettingsTab();
      case 'manage-users':
        return user.role === 'admin' ? <ManageUsersTab /> : renderSettingsTab();
      case 'manage-reviews':
        return user.role === 'admin' ? <ManageReviewsTab /> : renderSettingsTab();
      case 'manage-bookings':
        return user.role === 'admin' ? <ManageBookingsTab /> : renderSettingsTab();
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

  const renderGuideToursTab = () => (
    <div className="user-view__form-container">
      <h2 className="heading-secondary ma-bt-md">Guide Schedule</h2>
      <p style={{ fontSize: '1.6rem', color: '#777', marginBottom: '2rem' }}>
        View your assigned tours and manage your guiding schedule.
      </p>
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <a 
          href="/my-guide-tours" 
          className="btn btn--green"
          style={{ textDecoration: 'none' }}
        >
          View My Guide Tours
        </a>
      </div>
      <p style={{ fontSize: '1.4rem', color: '#999', textAlign: 'center' }}>
        Click above to see detailed information about your assigned tours and participants.
      </p>
    </div>
  );

  const renderGuideInfoTab = () => (
    <div className="user-view__form-container">
      <h2 className="heading-secondary ma-bt-md">Guide Information</h2>
      <div className="guide-info-grid" style={{ display: 'grid', gap: '2rem', marginTop: '2rem' }}>
        
        <div className="guide-info-card" style={{ 
          background: '#f9f9f9', 
          padding: '2rem', 
          borderRadius: '1rem',
          border: '1px solid #e0e0e0'
        }}>
          <h3 style={{ fontSize: '1.8rem', color: '#333', marginBottom: '1rem' }}>Role Information</h3>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
            <strong style={{ fontSize: '1.6rem', color: '#55c57a' }}>
              {user.role === 'guide' ? 'Tour Guide' : 'Lead Guide'}
            </strong>
          </div>
          <p style={{ fontSize: '1.4rem', color: '#777', lineHeight: '1.6' }}>
            {user.role === 'guide' 
              ? 'You are responsible for leading tours and ensuring guests have an amazing experience.'
              : 'You are responsible for leading tours and coordinating with other guides.'
            }
          </p>
        </div>

        <div className="guide-info-card" style={{ 
          background: '#f9f9f9', 
          padding: '2rem', 
          borderRadius: '1rem',
          border: '1px solid #e0e0e0'
        }}>
          <h3 style={{ fontSize: '1.8rem', color: '#333', marginBottom: '1rem' }}>Contact Information</h3>
          <div style={{ marginBottom: '1rem' }}>
            <strong style={{ fontSize: '1.4rem', color: '#555' }}>Name:</strong>
            <span style={{ fontSize: '1.4rem', color: '#777', marginLeft: '1rem' }}>{user.name}</span>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <strong style={{ fontSize: '1.4rem', color: '#555' }}>Email:</strong>
            <span style={{ fontSize: '1.4rem', color: '#777', marginLeft: '1rem' }}>{user.email}</span>
          </div>
        </div>

        <div className="guide-info-card" style={{ 
          background: '#f9f9f9', 
          padding: '2rem', 
          borderRadius: '1rem',
          border: '1px solid #e0e0e0'
        }}>
          <h3 style={{ fontSize: '1.8rem', color: '#333', marginBottom: '1rem' }}>Responsibilities</h3>
          <ul style={{ fontSize: '1.4rem', color: '#777', lineHeight: '1.8', paddingLeft: '2rem' }}>
            <li>Lead assigned tours professionally and safely</li>
            <li>Provide excellent customer service to all participants</li>
            <li>Ensure all safety protocols are followed</li>
            <li>Communicate effectively with tour participants</li>
            {user.role === 'lead-guide' && (
              <li>Coordinate and manage other tour guides</li>
            )}
          </ul>
        </div>

      </div>
    </div>
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
                  <span className="booking-card__duration">{booking.tour.duration} days </span>
                  <span className="booking-card__difficulty">{booking.tour.difficulty}</span>
                </p>
                <p className="booking-card__price">{formatCurrency(booking.price)}</p>
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
                {!booking.paid && (
                  <a href={`/booking-manage/${booking._id}`} className="btn btn--small btn--blue">
                    Manage Booking
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderReviewsTab = () => {
    if (reviewsLoading) {
      return (
        <div className="user-view__form-container">
          <h2 className="heading-secondary ma-bt-md">My reviews</h2>
          <LoadingSpinner />
        </div>
      );
    }

    if (reviews.length === 0) {
      return (
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
    }

    return (
      <div className="user-view__form-container">
        <h2 className="heading-secondary ma-bt-md">My reviews</h2>
        <div className="bookings-list">
          {reviews.map((review) => (
            <div key={review._id} className="booking-card">
              <div className="booking-card__image">
                <img 
                  src={`/img/tours/${review.tour.imageCover}`} 
                  alt={review.tour.name}
                />
              </div>
              <div className="booking-card__details">
                <h3 className="booking-card__title">{review.tour.name}</h3>
                <p className="booking-card__info">
                  <span className="booking-card__duration">{review.tour.duration} days </span>
                  <span className="booking-card__difficulty">{review.tour.difficulty}</span>
                </p>
                <p className="booking-card__price">{formatCurrency(review.tour.price)}</p>
                <p className="booking-card__date">
                  Reviewed on {new Date(review.createdAt).toLocaleDateString()}
                </p>
                <div className="booking-card__review">
                  <div className="booking-card__rating">
                    <StarRating rating={review.rating} readonly size="small" />
                  </div>
                  <p className="booking-card__review-text">"{review.review}"</p>
                </div>
              </div>
              <div className="booking-card__actions">
                <a href={`/tour/${review.tour.slug}`} className="btn btn--small btn--green">
                  View Tour
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

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
                <span className="payment-card__amount">{formatCurrency(booking.price)}</span>
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

  // End admin tab components

  return (
    <main className="main">
      <div className="user-view">
        <nav className="user-view__menu">
          <ul className="side-nav">
            {getNavItems().map((item) => (
              <li key={item.id} className={activeTab === item.id ? 'side-nav--active' : ''}>
                <a 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    handleTabChange(item.id);
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
                        handleTabChange(item.id);
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
