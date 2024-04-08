import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Context } from "../context/UserContext";

const Accounts = () => {
  const { user } = Context();
  const [isOpen, setIsOpen] = useState(false);

  const handleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div
      className="dropdown-menu"
      onMouseEnter={handleMenu}
      onMouseLeave={handleMenu}
    >
      <Link className="navbar-link">Accounts</Link>
      {isOpen && (
        <div className="dropdown">
          <ul>
            <li>
              <Link to="/addaccounts">Add</Link>
            </li>
            <li>
              <Link to="/editaccounts">View/Edit</Link>
            </li>
            <li>
              <Link to="/deactivateaccounts">Activate/Deactivate</Link>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Accounts;
