import React from 'react';
import logo from '../../assets/logo.png';
import default_pfp from '../../assets/default_pfp.png';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Context } from '../UserContext';

export const Banner = () => {
  const { user, logout } = Context(); //pull user context and logout function
  const navigate = useNavigate();

  const backToHome = () => {
    navigate("/", { replace: true })
  }

  return (
    <>
      <div className="banner">
        <div className="left-section">
          {user && (
            <div className="user-info">
              <img src={user.photoURL || default_pfp} alt="Profile" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
              <span>{user.displayName || user.email}</span>
            </div>
          )}
        </div>
        <div className="middle-section">
          <img className='logo' onClick={backToHome} src={logo} alt="Logo" style={{ height: '50px', display: 'block', margin: '0 auto' }} />
          {(user && user.role === 3) && (
            <ul className='navbar'>
              <li className='navbar-item'><Link className='navbar-link' to="addaccounts">Add Accounts</Link></li>
              <li className='navbar-item'><Link className='navbar-link' to="viewaccounts">View Accounts</Link></li>
              <li className='navbar-item'><Link className='navbar-link' to="editusers">Edit Users</Link></li>
              <li className='navbar-item'><Link className='navbar-link' to="editaccounts">Edit Accounts</Link></li>
              <li className='navbar-item'><Link className='navbar-link' to="deactivateaccounts">Deactivate Accounts</Link></li>
              <li className='navbar-item'><Link className='navbar-link' to="journalizing">Journalizing</Link></li>
            </ul>
          )}
          {(user && (user.role === 1 || user.role == 2)) && (
            <ul className='navbar'>
              <li className='navbar-item'><Link className='navbar-link' to="viewaccounts">View Accounts</Link></li>
              <li className='navbar-item'><Link className='navbar-link' to="journalizing">Journalizing</Link></li>
            </ul>
          )}
        </div>
        <div className="right-section">
          {user && (
            <button onClick={logout}>Logout</button>
          )}
        </div>
      </div>
      <div><Outlet /></div>
    </>
  );
};

export default Banner;
{/* Banner as well as basic layout component for other routes */}
