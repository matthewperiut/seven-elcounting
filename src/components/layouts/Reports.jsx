import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Reports = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleMenuOpen = () => {
    setIsOpen(true);
  };

  const handleMenuClose = () => {
    setIsOpen(false);
  };

  return (
    <div
      className="reports-menu"
      onMouseEnter={handleMenuOpen}
      onMouseLeave={handleMenuClose}
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
            </ul>
        </div>
      )}
    </div>
  );
};

export default Reports;