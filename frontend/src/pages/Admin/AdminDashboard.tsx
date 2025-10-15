import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import type { User } from '../../services/authService';
import type { Tour } from '../../services/tourService';
import { LoadingSpinner } from '../../components';

function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingUserId, setSavingUserId] = useState<string>('');
  const [reassigningTourId, setReassigningTourId] = useState<string>('');
  const [reassignEmail, setReassignEmail] = useState<string>('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [usersRes, toursRes] = await Promise.all([
          api.get('/users'),
          api.get('/tours')
        ]);
        setUsers(usersRes.data?.data?.data || usersRes.data?.data?.users || []);
        setTours(toursRes.data?.data?.data || []);
      } catch (e) {
        console.error('Failed to load admin data', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleRoleChange = (userId: string, newRole: User['role']) => {
    setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
  };

  const saveUserRole = async (user: User) => {
    try {
      setSavingUserId(user._id);
      await api.patch(`/users/${user._id}`, { role: user.role });
    } catch (e) {
      console.error('Failed to update role', e);
    } finally {
      setSavingUserId('');
    }
  };

  const reassignLead = async (tourId: string) => {
    if (!reassignEmail.trim()) return;
    try {
      setReassigningTourId(tourId);
      await api.post(`/tours/${tourId}/reassign-lead-guide`, { email: reassignEmail.trim() });
      // refresh tours list
      const toursRes = await api.get('/tours');
      setTours(toursRes.data?.data?.data || []);
      setReassignEmail('');
    } catch (e) {
      console.error('Failed to reassign lead guide', e);
    } finally {
      setReassigningTourId('');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <main className="main">
      <div className="user-view">
        <div className="user-view__content">
          <div className="user-view__form-container">
            <h2 className="heading-secondary ma-bt-md">Admin Dashboard</h2>

            <section className="ma-bt-lg">
              <h3 className="heading-tertiary ma-bt-sm">Users</h3>
              <div className="table">
                <div className="table__row table__row--head">
                  <div>Name</div>
                  <div>Email</div>
                  <div>Role</div>
                  <div>Actions</div>
                </div>
                {users.map(u => (
                  <div className="table__row" key={u._id}>
                    <div>{u.name}</div>
                    <div>{u.email}</div>
                    <div>
                      <select value={u.role} onChange={(e) => handleRoleChange(u._id, e.target.value as User['role'])}>
                        <option value="user">user</option>
                        <option value="guide">guide</option>
                        <option value="lead-guide">lead-guide</option>
                        <option value="admin">admin</option>
                      </select>
                    </div>
                    <div>
                      <button className="btn btn--small btn--green" disabled={savingUserId === u._id} onClick={() => saveUserRole(u)}>
                        {savingUserId === u._id ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h3 className="heading-tertiary ma-bt-sm">Tours</h3>
              <div className="table">
                <div className="table__row table__row--head">
                  <div>Name</div>
                  <div>Lead Guide</div>
                  <div>Actions</div>
                </div>
                {tours.map(t => (
                  <div className="table__row" key={t._id}>
                    <div>
                      <Link to={`/tour/${t.slug}`}>{t.name}</Link>
                    </div>
                    <div>{Array.isArray(t.guides) && t.guides[0] ? (t.guides[0] as any).email || (t.guides[0] as any).name || '—' : '—'}</div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input
                        className="form__input"
                        type="email"
                        placeholder="new lead guide email"
                        value={reassignEmail}
                        onChange={(e) => setReassignEmail(e.target.value)}
                        style={{ maxWidth: '26rem' }}
                      />
                      <button className="btn btn--small btn--blue" disabled={reassigningTourId === t._id} onClick={() => reassignLead(t._id)}>
                        {reassigningTourId === t._id ? 'Reassigning...' : 'Reassign Lead'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </div>
        </div>
      </div>
    </main>
  );
}

export default AdminDashboard;
