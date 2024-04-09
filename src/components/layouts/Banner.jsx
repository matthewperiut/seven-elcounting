import logo from '../../assets/logo.png';
import default_pfp from '../../assets/default_pfp.png';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Context } from '../context/UserContext';
import Reports from '../reports/Reports';
import Accounts from '../accounts/Accounts'


export const Banner = () => {
  const { user, logout } = Context(); //pull user context and logout function
  const navigate = useNavigate();

  const backToHome = () => {
    navigate("/", { replace: true })
  }

  return (
    <>
      <div className="banner">
          {user && (
            <div className="user-info">
              <img src={user.photoURL || default_pfp} alt="Profile"/>
              <span>{user.displayName || user.email}</span>
              {user && (<button onClick={logout}>Logout</button>)}
            </div>
          )}
          {(user && (user.role > 0)) && (
            <ul className='navbar'>
              <li className='navbar-item'><Link className='navbar-link' to="chartofaccounts">Chart of Accounts</Link></li>
              <li className='navbar-item'><Link className='navbar-link' to="journalizing">Journalizing</Link></li>
              <li className='navbar-item'><Reports/></li>
              {(user && (user.role === 3)) && (
                <>
                <li className='navbar-item'><Accounts /></li>
                <li className='navbar-item'><Link className='navbar-link' to="users">Users</Link></li>
                </>
              )}
            </ul>
        )}
          <img className='logo' onClick={backToHome} src={logo} alt="Logo" />
      </div>
      <div><Outlet /></div>
    </>
  );
};

export default Banner;
{/* Banner as well as basic layout component for other routes */}
