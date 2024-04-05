import React, { useState } from 'react';
import { Context } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import CustomCalendar from './CustomCalendar';
import Help from './Help';

const Dashboard = () => {
  const { user } = Context(); // pull user context

  return (
    <div className='wrapper'>
      <CustomCalendar />
      <Help />
      <h1>Dashboard</h1>
      {user.role === 3 ? (
        <div className="welcome-div">Welcome, administrator {user && user.email}</div>
      ) : user.role === 2 ? (
        <div className="welcome-div">Welcome, manager {user && user.email}</div>
      ) : user.role === 1 ? (
        <div className="welcome-div">Welcome, accountant {user && user.email}</div>
      ) : (
        <div className="welcome-div">
          You do not have access to the system yet, please wait for administrator approval.
        </div>
      )}
    </div>
  );
};

export default Dashboard;