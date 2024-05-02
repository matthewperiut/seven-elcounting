import { useState } from "react";
import { Link } from "react-router-dom";
import { Context } from "../context/UserContext";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase-config";

const Reports = () => {
  const { user } = Context();
  const [isOpen, setIsOpen] = useState(false);
  const [pendingEntries, setpendingEntries] = useState(0);

  const handleMenu = async () => {
    setIsOpen(!isOpen);
    //queries pending journal entries for manager notification
    const pendingSnapshot = await getDocs(
      query(
        collection(db, "journalEntries"),
        where("isApproved", "==", false),
        where("isRejected", "==", false)
      )
    );
    setpendingEntries(pendingSnapshot.size);
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
            <Link to="/generalLedger">
              <li>General Ledger</li>
            </Link>
            <Link to="/balancesheet">
              <li>Balance Sheet</li>
            </Link>
            <Link to="/trialbalance">
              <li>Trial Balance</li>
            </Link>
            <Link to="/incomestatement">
              <li>Income Statement</li>
            </Link>
            <Link to="/retainedearnings">
              <li>Retained Earnings Statement</li>
            </Link>
            <Link to="/journalentries">
              <li>
                Journal Entries
                {user.role > 1 && pendingEntries > 0 && (
                  <div className="entries-notification">{pendingEntries}</div>
                )}
              </li>
            </Link>
            {user && user.role === 3 && (
              <Link to="/eventLog">
                <li>Event Log</li>
              </Link>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Reports;
