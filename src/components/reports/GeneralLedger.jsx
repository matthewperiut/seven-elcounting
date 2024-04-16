// Existing imports
import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase-config";
import CustomCalendar from "../layouts/CustomCalendar";
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

// Modal component similar to the one in ChartOfAccounts
const LedgerModal = ({ isOpen, closeModal, selectedEntry }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-background">
      <div className="modal">
        <p onClick={closeModal} className="closeButton">
          &times;
        </p>
        <h2>Journal Entry Details</h2>
        <table>
          <thead>
            <tr>
              <th>Date Created</th>
              <th>User</th>
              <th>Account</th>
              <th>Type</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {selectedEntry.entries.map((entry, index) => (
              <tr key={index}>
                <td>{formatDate(selectedEntry.dateCreated)}</td>
                <td>{selectedEntry.user}</td>
                <td>{entry.account}</td>
                <td>{entry.type}</td>
                <td>{entry.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const GeneralLedger = ({ showSearchBar }) => {
  const [approvedEntries, setApprovedEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [showDateInput, setShowDateInput] = useState(false);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [selectedEntry, setSelectedEntry] = useState(null); // State to store the selected entry
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleEntryClick = (entryId, e) => {
    // Check if the click target is the post reference link
    const isPostRefLink = e.target.classList.contains("postRefLink");
    if (isPostRefLink) {
      // If it's the post reference link, open the modal
      const clickedEntry = approvedEntries.find((entry) => entry.id === entryId);
      setSelectedEntry(clickedEntry);
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEntry(null);
  };

  const handlePostRefClick = (entryId) => {
    // Find the clicked entry from the entries data
    const clickedEntry = approvedEntries.find((entry) => entry.id === entryId);
    setSelectedEntry(clickedEntry);
    setShowModal(true); // Open the modal
  };

  return (
    <div className="wrapper">
      <CustomCalendar />
      <Help />
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
                  <th>Post Ref.</th> 
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((entry) =>
                  entry.entries.map((subEntry, index) => (
                    <tr
                      className="entry"
                      key={index}
                      onClick={(e) => handleEntryClick(entry.id, e)}// Attach click handler to the row
                      style={{ cursor: "pointer" }} // Change cursor to pointer
                    >
                      {index === 0 && (
                        <>
                          <td rowSpan={entry.entries.length}>
                            {formatDate(entry.dateCreated)}
                          </td>
                          <td rowSpan={entry.entries.length}>{entry.description}</td>
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
                      <td>
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handlePostRefClick(entry.id);
                          }}
                          className="postRefLink"
                        >
                          {subEntry.postRef}
                        </a>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {isModalOpen && (
        <LedgerModal
          isOpen={isModalOpen}
          closeModal={closeModal}
          selectedEntry={selectedEntry}
        />
      )}
    </div>
  );
};

export default GeneralLedger;
