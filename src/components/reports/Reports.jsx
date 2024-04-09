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
            <Link to="/generalLedger"><li>General Ledger</li></Link>
            <Link to="/balance-sheet"><li>Balance Sheet</li></Link>
            <Link to="/trial-balance"><li>Trial Balance</li></Link>
            <Link to="/income-statement"><li>Income Statement</li></Link>
            <Link to="/journal-entries"><li>Journal Entries</li></Link>
            {(user && user.role === 3) && <Link to="/eventLog"><li>Event Log</li></Link>}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Reports;
