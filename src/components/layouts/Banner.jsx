import logo from "../../assets/logo.png";
import default_pfp from "../../assets/default_pfp.png";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { Context } from "../context/UserContext";
import Reports from "../reports/Reports";
import Accounts from "../accounts/Accounts";
import { useState } from "react";

export const Banner = () => {
  const { user, logout } = Context(); //pull user context and logout function
  const navigate = useNavigate();
  const [showTooltip, setShowTooltip] = useState(false);

  const backToHome = () => {
    navigate("/", { replace: true }); //navigates back to dashboard
  };

  return (
    <>
      <div className="banner">
        {user && (
          <div className="user-info">
            <img src={user.photoURL || default_pfp} alt="Profile" />
            <span>{user.displayName || user.email}</span>
            {user && <button onClick={logout}>Logout</button>}
          </div>
        )}
        {user && user.role > 0 && (
          <ul className="navbar">
            <li className="navbar-item">
              <Link className="navbar-link" to="chartofaccounts">
                Chart of Accounts
              </Link>
            </li>
            <li className="navbar-item">
              <Link className="navbar-link" to="journalizing">
                Journalizing
              </Link>
            </li>
            <li className="navbar-item">
              <Reports />
            </li>
            {user && user.role === 3 && (
              <>
                <li className="navbar-item">
                  <Accounts />
                </li>
                <li className="navbar-item">
                  <Link className="navbar-link" to="users">
                    Users
                  </Link>
                </li>
              </>
            )}
          </ul>
        )}
        <div
          className="logo-container"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          style={{ position: "relative" }}
        >
          <img className="logo" onClick={backToHome} src={logo} alt="Logo" />
          {showTooltip && (
            <div
              className="tooltip"
              style={{ position: "absolute", top: "75%", left: "35%" }}
            >
              Dashboard
            </div>
          )}
        </div>
      </div>
      <div>
        <Outlet />
      </div>
    </>
  );
};

export default Banner;
