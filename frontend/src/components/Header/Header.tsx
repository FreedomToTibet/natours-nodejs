import { Link } from 'react-router-dom';
import { useCurrentUser, useLogout } from '../../hooks';

function Header() {
  const { data: user } = useCurrentUser();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="header">
      <nav className="nav nav--tours">
        <Link to="/" className="nav__el">
          All tours
        </Link>
      </nav>
      <div className="header__logo">
        <img src="/img/logo-white.png" alt="Natours logo" />
      </div>
      <nav className="nav nav--user">
        {user ? (
          <>
            <a 
              className="nav__el nav__el--logout"
              onClick={handleLogout}
            >
              {logoutMutation.isPending ? 'Logging out...' : 'Log out'}
            </a>
            <Link to="/me" className="nav__el">
              <img 
                className="nav__user-img" 
                src={`/img/users/${user.photo}?v=${user.photo}`} 
                alt={`Photo of ${user.name}`} 
              />
              <span>{user.name.split(' ')[0]}</span>
            </Link>
          </>
        ) : (
          <>
            <Link to="/login" className="nav__el">
              Log in
            </Link>
            <Link to="/signup" className="nav__el nav__el--cta">
              Sign up
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}

export default Header;
