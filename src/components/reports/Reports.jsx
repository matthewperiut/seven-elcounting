import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Reports = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div
      className="reports-menu"
      onMouseEnter={handleMenu}
      onMouseLeave={handleMenu}
    >
      <button className="reports-menu-button">Reports</button>
      {isOpen && (
        <div className="reports-dropdown"> 
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
            <li>
              <Link to="/eventLog">Event Log</Link>
            </li>

            </ul>
        </div>
      )}
    </div>
  );
};

export default Reports;