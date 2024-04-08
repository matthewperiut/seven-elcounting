import { useState } from "react";
import { Link } from "react-router-dom";
import { Context } from "../context/UserContext";

const Reports = () => {
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
      <Link className="navbar-link">Reports</Link>
      {isOpen && (
        <div className="dropdown">
          <ul>
            <li>
              <Link to="/generalLedger">General Ledger</Link>
            </li>
            <li>
              <Link to="/balance-sheet">Balance Sheet</Link>
            </li>
            <li>
              <Link to="/trial-balance">Trial Balance</Link>
            </li>
            <li>
              <Link to="/income-statement">Income Statement</Link>
            </li>
            <li>
              <Link to="/journal-entries">Journal Entries</Link>
            </li>
            {(user && user.role === 3) && <li>
              <Link to="/eventLog">Event Log</Link>
            </li>}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Reports;
