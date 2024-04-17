// Existing imports
import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase-config";
import CustomCalendar from "../layouts/CustomCalendar";
import ReportToolSuite from "./ReportToolSuite";
import Help from "../layouts/Help";

/**
 * Formats a Firestore timestamp to a readable date string.
 * @param {firebase.firestore.Timestamp} timestamp - The Firestore timestamp to format.
 * @returns {string} The formatted date string.
 */
function formatDate(timestamp) {
  if (!timestamp) return "";

  const date = timestamp.toDate();
  const options = { year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
}

const GeneralLedger = ({ showSearchBar }) => {
  const [approvedEntries, setApprovedEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [showDateInput, setShowDateInput] = useState(false);
  const [filteredEntries, setFilteredEntries] = useState([]);

  useEffect(() => {
    const fetchApprovedEntries = async () => {
      setLoading(true);

      const approvedSnapshot = await getDocs(
        query(
          collection(db, "journalEntries"),
          where("isApproved", "==", true),
          where("isRejected", "==", false)
        )
      );

      const approvedEntriesData = approvedSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setApprovedEntries(approvedEntriesData);
      setLoading(false);
    };

    fetchApprovedEntries();
  }, []);

  useEffect(() => {
    // Filter entries based on the search query and date filter
    let filtered = approvedEntries;
    if (searchQuery) {
      filtered = filtered.filter((entry) =>
        entry.entries.some((subEntry) =>
          subEntry.account.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
    if (dateFilter) {
      filtered = filtered.filter((entry) =>
        formatDate(entry.dateCreated).includes(dateFilter)
      );
    }
    setFilteredEntries(filtered);
  }, [searchQuery, dateFilter, approvedEntries]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleDateFilterChange = (event) => {
    setDateFilter(event.target.value);
  };

  const handleFilterButtonClick = () => {
    setShowDateInput(true);
  };

  const handleDateInputClose = () => {
    setShowDateInput(false);
  };

  return (
    <div className="wrapper">
      <CustomCalendar />
      {ReportToolSuite("General Ledger")}
      <Help />
      <div id="capture">
      <h1>General Ledger </h1>
      <div>
        {showSearchBar && (
          <div>
            <input
              type="text"
              placeholder="Search Account"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
        )}
        {showDateInput ? (
          <>
            <input
              type="text"
              placeholder="Enter Date (e.g., January 1, 2023)"
              value={dateFilter}
              onChange={handleDateFilterChange}
            />
            <button onClick={handleDateInputClose}>Close</button>
          </>
        ) : (
          <button onClick={handleFilterButtonClick}>Filter by Date</button>
        )}
        {loading ? (
          <p>Loading...</p>
        ) : (
          <div className="entries-table">
            <table>
              <thead>
                <tr>
                  <th>Date Created</th>
                  <th>Description</th>
                  <th>User</th>
                  <th>Account</th>
                  <th>Debit</th>
                  <th>Credit</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries
                  .sort((a, b) => a.dateCreated - b.dateCreated)
                  .map((entry) =>
                    entry.entries.map((subEntry, index) => (
                      <tr
                        className="entry"
                        key={index}
                      >
                        {index === 0 && (
                          <>
                            <td rowSpan={entry.entries.length}>
                              {formatDate(entry.dateCreated)}
                            </td>
                            <td rowSpan={entry.entries.length}>
                              {entry.description}
                            </td>
                            <td rowSpan={entry.entries.length}>{entry.user}</td>
                          </>
                        )}
                        <td>{subEntry.account}</td>
                        <td>
                          {subEntry.type === "debit"
                            ? "$" + parseFloat(subEntry.amount).toLocaleString()
                            : ""}
                        </td>
                        <td>
                          {subEntry.type === "credit"
                            ? "$" + parseFloat(subEntry.amount).toLocaleString()
                            : ""}
                        </td>
                      </tr>
                    ))
                  )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default GeneralLedger;
