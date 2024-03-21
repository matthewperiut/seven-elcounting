import React, { useState } from 'react';
import { Context } from "../UserContext";
import { useNavigate } from "react-router-dom";
import { RoleManagement } from "../rolemanagement/RoleManagement";
import Calendar from 'react-calendar'; // make sure to import the Calendar component
import 'react-calendar/dist/Calendar.css'; 

const Dashboard = () => {
  const { user } = Context(); // pull user context
  const navigate = useNavigate(); // to navigate to other pages
  
  const [showCalendar, setShowCalendar] = useState(false); 
  const toggleCalendar = () => setShowCalendar(!showCalendar); 

  return (
    <>
      <button onClick={toggleCalendar} style={{ position: 'absolute', top: 120, left: 10, zIndex: 100 }}>
      {showCalendar ? 'Hide Calendar' : 'Show Calendar'}
      </button>
      {showCalendar && (
        <div style={{ position: 'fixed', top: '180px', left: '20px', zIndex: 100 }}>
          <Calendar />
        </div>
      )}
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
    </>
  );
};

export default Dashboard;