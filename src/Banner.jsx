import React from 'react';
import logo from './assets/logo.png'
import default_pfp from './assets/default_pfp.png'

export const Banner = ({ user, logout }) => {
  return (
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
  );
};
