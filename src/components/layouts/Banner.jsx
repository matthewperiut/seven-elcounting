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
        <div>
          {user && (
            <div className="user-info">
              <img src={user.photoURL || default_pfp} alt="Profile" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
              <span>{user.displayName || user.email}</span>
              {user && (<button onClick={logout}>Logout</button>)}
            </div>
          )}
        </div>
        <div>
          {(user && user.role === 3) && (
            <ul className='navbar'>
              <li className='navbar-item'><Link className='navbar-link' to="chartofaccounts">Chart of Accounts</Link></li>
              <li className='navbar-item'><Link className='navbar-link' to="journalizing">Journalizing</Link></li>
              <li className='navbar-item'><Accounts /></li>
              <li className='navbar-item'><Reports /></li>
              <li className='navbar-item'><Link className='navbar-link' to="users">Users</Link></li>

            </ul>
          )}
          {(user && (user.role === 1 || user.role == 2)) && (
            <ul className='navbar'>
              <li className='navbar-item'><Link className='navbar-link' to="chartofaccounts">Chart of Accounts</Link></li>
              <li className='navbar-item'><Link className='navbar-link' to="journalizing">Journalizing</Link></li>
              <li className='navbar-item'><Reports/></li>
            </ul>
          )}
        </div>
        <div>
          <img className='logo' onClick={backToHome} src={logo} alt="Logo" />
        </div>
      </div>
      <div><Outlet /></div>
    </>
  );
};

export default Banner;
{/* Banner as well as basic layout component for other routes */}
