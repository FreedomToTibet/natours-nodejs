import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForgotPassword } from '../hooks';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const forgotPasswordMutation = useForgotPassword();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    forgotPasswordMutation.mutate(email, {
      onSuccess: () => {
        setIsSubmitted(true);
      }
    });
  };

  if (isSubmitted) {
    return (
      <main className="main">
        <div className="login-form">
          <h2 className="heading-secondary ma-bt-lg">Check your email</h2>
          <div className="form form--login">
            <p style={{ textAlign: 'center', fontSize: '1.6rem', color: '#999', marginBottom: '2rem' }}>
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <p style={{ textAlign: 'center', fontSize: '1.4rem', color: '#777' }}>
              Please check your email and click the link to reset your password.
              The link will expire in 10 minutes.
            </p>
            <div className="form-bottom-section">
              <p className="form-bottom-text">
                Didn't receive the email?
              </p>
              <button 
                onClick={() => {
                  setIsSubmitted(false);
                  setEmail('');
                }} 
                className="btn-small"
              >
                Try Again
              </button>
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
        <h2 className="heading-secondary ma-bt-lg">Forgot your password?</h2>
        <p style={{ textAlign: 'center', fontSize: '1.4rem', color: '#777', marginBottom: '2rem' }}>
          Enter your email address and we'll send you a recovery link to reset your password.
        </p>
        <form className="form form--login" onSubmit={handleSubmit}>
          <div className="form__group">
            <label className="form__label" htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              className="form__input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form__group">
            <button 
              className="btn btn--green" 
              type="submit"
              disabled={forgotPasswordMutation.isPending || !email}
            >
              {forgotPasswordMutation.isPending ? 'Sending...' : 'Send Reset Link'}
            </button>
          </div>
        </form>        
        <div className="form-bottom-section">
          <p className="form-bottom-text">
            Remember your password?
          </p>
          <Link to="/login" className="btn btn--green btn--small">
            Back to Login
          </Link>
        </div>
      </div>
    </main>
  );
}

export default ForgotPassword;
