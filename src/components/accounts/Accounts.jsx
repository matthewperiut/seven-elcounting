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
              <Link to="/addaccounts"><li>Add</li></Link>
              <Link to="/editaccounts"><li>View/Edit</li></Link>
              <Link to="/deactivateaccounts"><li>Activate/Deactivate</li></Link>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Accounts;
