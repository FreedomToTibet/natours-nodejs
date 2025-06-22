import { Link } from 'react-router-dom';

function Signup() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Add signup logic here
    console.log('Signup form submitted');
  };

  return (
    <main className="main">
      <div className="login-form">
        <h2 className="heading-secondary ma-bt-lg">Create your account</h2>
        <form className="form form--login" onSubmit={handleSubmit}>
          <div className="form__group">
            <label className="form__label" htmlFor="name">
              Full Name
            </label>
            <input
              id="name"
              className="form__input"
              type="text"
              placeholder="John Doe"
              required
            />
          </div>
          <div className="form__group">
            <label className="form__label" htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              className="form__input"
              type="email"
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="form__group ma-bt-md">
            <label className="form__label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              className="form__input"
              type="password"
              placeholder="••••••••"
              required
              minLength={8}
            />
          </div>
          <div className="form__group ma-bt-md">
            <label className="form__label" htmlFor="passwordConfirm">
              Confirm Password
            </label>
            <input
              id="passwordConfirm"
              className="form__input"
              type="password"
              placeholder="••••••••"
              required
              minLength={8}
            />
          </div>
          <div className="form__group">
            <button className="btn btn--green" type="submit">
              Sign Up
            </button>
          </div>
        </form>        
        <div className="form-bottom-section">
          <p className="form-bottom-text">
            Already have an account?
          </p>
          <Link to="/login" className="btn btn--green btn--small">
            Log In
          </Link>
        </div>
      </div>
    </main>
  );
}

export default Signup;
