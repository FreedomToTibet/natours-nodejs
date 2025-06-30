import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useResetPassword } from '../hooks';

function ResetPassword() {
  const { token } = useParams<{ token: string }>();
  const [formData, setFormData] = useState({
    password: '',
    passwordConfirm: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const resetPasswordMutation = useResetPassword();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.passwordConfirm) {
      newErrors.passwordConfirm = 'Password confirmation is required';
    } else if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setErrors({ form: 'Invalid reset token' });
      return;
    }

    if (validateForm()) {
      resetPasswordMutation.mutate({ 
        token, 
        passwordData: formData 
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (!token) {
    return (
      <main className="main">
        <div className="login-form">
          <h2 className="heading-secondary ma-bt-lg">Invalid Reset Link</h2>
          <div className="form form--login">
            <p style={{ textAlign: 'center', fontSize: '1.6rem', color: '#e74c3c', marginBottom: '2rem' }}>
              This password reset link is invalid or has expired.
            </p>
            <div className="form-bottom-section">
              <Link to="/forgot-password" className="btn-small">
                Request New Reset Link
              </Link>
            </div>
            <div className="form-bottom-section" style={{ marginTop: '1rem' }}>
              <Link to="/login" className="btn-small">
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="main">
      <div className="login-form">
        <h2 className="heading-secondary ma-bt-lg">Reset your password</h2>
        <p style={{ textAlign: 'center', fontSize: '1.4rem', color: '#777', marginBottom: '2rem' }}>
          Enter your new password below.
        </p>
        <form className="form form--login" onSubmit={handleSubmit}>
          {errors.form && (
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <p className="form__error">{errors.form}</p>
            </div>
          )}
          <div className="form__group">
            <label className="form__label" htmlFor="password">
              New Password
            </label>
            <input
              id="password"
              className={`form__input ${errors.password ? 'form__input--error' : ''}`}
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
            />
            {errors.password && <p className="form__error">{errors.password}</p>}
          </div>
          <div className="form__group ma-bt-md">
            <label className="form__label" htmlFor="passwordConfirm">
              Confirm New Password
            </label>
            <input
              id="passwordConfirm"
              className={`form__input ${errors.passwordConfirm ? 'form__input--error' : ''}`}
              type="password"
              name="passwordConfirm"
              placeholder="••••••••"
              value={formData.passwordConfirm}
              onChange={handleChange}
              required
              minLength={8}
            />
            {errors.passwordConfirm && <p className="form__error">{errors.passwordConfirm}</p>}
          </div>
          <div className="form__group">
            <button 
              className="btn btn--green" 
              type="submit"
              disabled={resetPasswordMutation.isPending}
            >
              {resetPasswordMutation.isPending ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>
        </form>        
        <div className="form-bottom-section">
          <p className="form-bottom-text">
            Remember your password?
          </p>
          <Link to="/login" className="btn-small">
            Back to Login
          </Link>
        </div>
      </div>
    </main>
  );
}

export default ResetPassword;
