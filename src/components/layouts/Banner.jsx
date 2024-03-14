import React from 'react';
import logo from '../../assets/logo.png'
import default_pfp from '../../assets/default_pfp.png'
import { Outlet } from 'react-router-dom';
import { Context } from '../UserContext';

export const Banner = () => {
  const { user, logout } = Context();
  return (
    <>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', backgroundColor: '#878ffa' }}>
      <img src={logo} alt="Logo" style={{ height: '50px' }} />
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