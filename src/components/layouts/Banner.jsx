import React from 'react';
import logo from '../../assets/logo.png'
import default_pfp from '../../assets/default_pfp.png'
import { Link, Outlet } from 'react-router-dom';
import { Context } from '../UserContext';

export const Banner = () => {
  const { user, logout } = Context();
  return (
    <>
    <div className="banner">
      <img src={logo} alt="Logo" style={{ height: '50px' }} />
      {user.role === 3 && (
      <ul className='navbar'>
      <li className='navbar-item'><Link className='navbar-link' to="addaccounts">Add Accounts</Link></li>
      <li className='navbar-item'><Link className='navbar-link' to="viewaccounts">View Accounts</Link></li>
      <li className='navbar-item'><Link className='navbar-link' to="editaccounts">Edit Accounts</Link></li>
      <li className='navbar-item'><Link className='navbar-link' to="deactivateaccounts">Deactivate Accounts</Link></li>
      </ul>
      )}
      {(user.role === 1 || user.role == 2) && (
      <ul className='navbar'>
      <li className='navbar-item'><Link className='navbar-link' to="viewaccounts">View Accounts</Link></li>
      </ul>
      )}
      {user && (
        <div>
          <img src={user.photoURL || default_pfp} alt="Profile" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
          <span>{user.displayName || user.email}</span>
          <button onClick={logout}>Logout</button>
        </div>
      )}
    </div>
    <div><Outlet /></div>
    
    </>
  );
};

export default Banner

{/* Banner as well as basic layout component for other routes */}