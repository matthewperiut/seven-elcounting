import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase-config.js";
import CustomCalendar from "../tools/CustomCalendar.jsx";
import Help from "../layouts/Help";
import formatNumber from "../tools/formatNumber.jsx";
import EmailAdminsOrManagers from "../tools/EmailAdminsOrManagers.jsx";
import { Context } from "../context/UserContext.jsx";
import ChangeEventLog from "../events/ChangeEventLog.jsx";

function formatDate(timestamp) {
  if (!timestamp) return "";

  const date = timestamp.toDate();
  const options = { year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
}

//Ledger component
const Ledger = ({ isOpen, onClose, account }) => {
  if (!isOpen) return null;

  let runningBalance = account.initialBalance;
  let entryNo = 0; //Initialize entry no.

  const [filteredEntries, setFilteredEntries] = useState(account.ledgerData);
  const [showPostRef, setShowPostRef] = useState(false);
  const [showEventLog, setShowEventLog] = useState(false);
  const [selectedPR, setSelectedPR] = useState(null);

  const handlePRClick = (pr) => {
    setSelectedPR(pr); //Set the selected PR
    setShowPostRef(true); //Open the PostRefModal
  };

  const filterEntries = (searchTerm) => {
    const filtered = account.ledgerData.filter((entry) => {
      const dateCreated = formatDate(entry.dateCreated);

      return (
        dateCreated.includes(searchTerm) ||
        entry.entries
          .filter((subEntry) => subEntry.account === account.accountName)
          .some((subEntry) => subEntry.amount.toString().includes(searchTerm))
      );
    });

    setFilteredEntries(filtered);
  };

  if (showEventLog) {
    return (
      <>
        <div onClick={onClose} className="modal-background">
          <div onClick={(e) => e.stopPropagation()} className="modal">
            <p onClick={onClose} className="closeButton">
              &times;
            </p>
            <>
              <p
                onClick={() => setShowEventLog(false)}
                className="closeButton"
                style={{ float: "left" }}
              >
                &larr;
              </p>
              <h2>Event Log for {account.accountName}</h2>

              <ChangeEventLog
                adjustingEntry={true}
                accountName={account.accountName}
              />
            </>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div onClick={onClose} className="modal-background">
        <div onClick={(e) => e.stopPropagation()} className="modal">
          <p onClick={onClose} className="closeButton">
            &times;
          </p>
          {showPostRef ? (
            <>
              <p
                onClick={() => setShowPostRef(false)}
                className="closeButton"
                style={{ float: "left" }}
              >
                &larr;
              </p>
              <h2>Journal Entry Details</h2>
              <div className="accountledger-table">
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
                    {selectedPR.entries.map((entry, index) => (
                      <tr key={index}>
                        <td>{formatDate(selectedPR.dateCreated)}</td>
                        <td>{selectedPR.user}</td>
                        <td>{entry.account}</td>
                        <td>{entry.type}</td>
                        <td>{formatNumber(entry.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <>
              <h2>Account Ledger for {account.accountName}</h2>
              <input
                type="text"
                placeholder="Search..."
                onChange={(e) => filterEntries(e.target.value)}
              />
              <button
                className="accountledger-button"
                onClick={() => setShowEventLog(true)}
              >
                Event Log
              </button>

              {filteredEntries && filteredEntries.length > 0 ? (
                <div className="accountledger-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Entry No.</th>
                        <th>Date</th>
                        <th>Debit</th>
                        <th>Credit</th>
                        <th>Balance</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{filteredEntries.length > 0 ? "N/A" : 1}</td>
                        <td>{formatDate(account.dateAccountAdded)}</td>
                        <td></td>
                        <td></td>
                        <td>{formatNumber(account.initialBalance)}</td>
                        <td></td>
                      </tr>
                      {filteredEntries
                        .sort((a, b) => a.dateCreated - b.dateCreated)
                        .map((entry) => (
                          <tr key={entry.id}>
                            <td>{entryNo++}</td>
                            <td>{formatDate(entry.dateCreated)}</td>
                            <td>
                              {entry.entries
                                .filter(
                                  (subEntry) =>
                                    subEntry.account === account.accountName
                                )
                                .map((subEntry, index) => (
                                  <span key={index}>
                                    {subEntry.type === "debit" && (
                                      <>{formatNumber(subEntry.amount)}</>
                                    )}
                                  </span>
                                ))}
                            </td>
                            <td>
                              {entry.entries
                                .filter(
                                  (subEntry) =>
                                    subEntry.account === account.accountName
                                )
                                .map((subEntry, index) => (
                                  <span key={index}>
                                    {subEntry.type === "credit" && (
                                      <>{formatNumber(subEntry.amount)}</>
                                    )}
                                  </span>
                                ))}
                            </td>
                            <td>
                              {formatNumber(
                                entry.entries
                                  .filter(
                                    (subEntry) =>
                                      subEntry.account === account.accountName
                                  )
                                  .reduce((balance, subEntry) => {
                                    let amount = parseFloat(subEntry.amount);
                                    let addition =
                                      subEntry.type === account.normalSide;

                                    if (addition) {
                                      balance += amount;
                                    } else {
                                      balance -= amount;
                                    }
                                    runningBalance = balance;
                                    return balance;
                                  }, runningBalance)
                              )}
                            </td>
                            <td>
                              <span
                                onClick={() => handlePRClick(entry)}
                                className="post-ref-link"
                              >
                                PR
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>No ledger entries found for this account.</p>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

const ChartOfAccounts = () => {
  const [accounts, setAccounts] = useState([]);

  //used for searching account name or number
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredAccounts, setFilteredAccounts] = useState([]);

  //setting the columns to show or not
  const [visibleColumns, setVisibleColumns] = useState({
    accountName: true,
    accountNumber: true,
    accountDescription: false,
    normalSide: false,
    category: true,
    subcategory: true,
    initialBalance: false,
    date: false,
    userID: false,
    order: false,
    financialStatement: true,
  });
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const querySnapshot = await getDocs(
          query(collection(db, "accounts"), where("isActivated", "==", true))
        ); //grabs all active accounts
        const fetchedAccounts = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAccounts(fetchedAccounts);
      } catch (error) {
        console.log(error.message);
      }
    };
    fetchAccounts();
  }, []);

  useEffect(() => {
    // Filter accounts based on the search query or other filters
    const filtered = accounts.filter(
      (account) =>
        account.accountName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        account.accountNumber.toString().includes(searchQuery)
    );
    filtered.sort((a, b) => a.accountNumber - b.accountNumber); //sorts filtered accounts by account number
    setFilteredAccounts(filtered);
  }, [searchQuery, accounts]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const formatDate = (timestamp) => {
    if (!timestamp || typeof timestamp.toDate !== "function") return "N/A";
    const date = timestamp.toDate();
    const options = { year: "numeric", month: "long", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
  };

  const openModal = async (account) => {
    try {
      const querySnapshot = await getDocs(
        query(
          collection(db, "journalEntries"),
          where("isApproved", "==", true) // Ensure only fetching approved entries
        )
      );
      const allEntries = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const relatedEntries = allEntries.filter(
        (entry) =>
          entry.entries &&
          entry.entries.some(
            (subEntry) => subEntry.account === account.accountName
          )
      );
      // Pass dateAccountAdded to the Ledger
      setSelectedAccount({
        ...account,
        ledgerData: relatedEntries,
      });
    } catch (error) {
      console.error("Error fetching ledger data:", error.message);
    }
  };

  const onClose = () => {
    setSelectedAccount(null);
  };

  // Toggle Column Visibility
  const toggleColumnVisibility = (columnName) => {
    setVisibleColumns((prevState) => ({
      ...prevState,
      [columnName]: !prevState[columnName],
    }));
  };

  // Reset columns to the original layout
  const resetColumns = () => {
    setVisibleColumns({
      accountName: true,
      accountNumber: true,
      accountDescription: false,
      normalSide: false,
      category: true,
      subcategory: true,
      initialBalance: false,
      date: false,
      userID: false,
      order: false,
      financialStatement: true,
    });
  };
  const { user } = Context();

  return (
    <div className="wrapper">
      {!selectedAccount && (
        <>
          <CustomCalendar />
          <Help componentName="ChartOfAccounts" />
          <div style={{ textAlign: "center", padding: "0 10px" }}>
            <h1>Chart of Accounts</h1>
            <div style={{ position: "absolute", right: "20px", top: "0" }}>
              {showTooltip && <div className="tooltip">Table Filters</div>}
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                title="Show or hide filters"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                Filters
              </button>
            </div>
            {showDropdown && (
              <div
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "60px",
                  border: "1px solid #ddd",
                  padding: "10px",
                  background: "#fff",
                }}
              >
                {Object.keys(visibleColumns).map((columnName) => (
                  <div
                    key={columnName}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "5px",
                    }}
                  >
                    <input
                      type="checkbox"
                      id={columnName}
                      checked={visibleColumns[columnName]}
                      onChange={() => toggleColumnVisibility(columnName)}
                      style={{ marginRight: "5px" }}
                    />
                    <label htmlFor={columnName}>{columnName}</label>
                  </div>
                ))}
                <button onClick={resetColumns}>Reset</button>
              </div>
            )}
          </div>
          <div>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
        </>
      )}
      <div className="accounts-table">
        {filteredAccounts.length > 0 && (
          <table border="2">
            <thead>
              <tr>
                {visibleColumns.accountName && <th>Account Name</th>}
                {visibleColumns.accountNumber && <th>Account Number</th>}
                {visibleColumns.accountDescription && (
                  <th>Account Description</th>
                )}
                {visibleColumns.normalSide && <th>Normal Side</th>}
                {visibleColumns.category && <th>Category</th>}
                {visibleColumns.subcategory && <th>Subcategory</th>}
                {visibleColumns.initialBalance && <th>Initial Balance</th>}
                {visibleColumns.date && <th>Date</th>}
                {visibleColumns.userID && <th>User ID</th>}
                {visibleColumns.order && <th>Order</th>}
                {visibleColumns.financialStatement && (
                  <th>Financial Statement</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredAccounts.map((account) => (
                <tr key={account.id}>
                  <td>
                    <span
                      onClick={() => openModal(account)}
                      className="clickableAccount"
                    >
                      {account.accountName}
                    </span>
                  </td>
                  {visibleColumns.accountNumber && (
                    <td>
                      <span
                        onClick={() => openModal(account)}
                        className="clickableAccount"
                      >
                        {account.accountNumber}
                      </span>
                    </td>
                  )}
                  {visibleColumns.accountDescription && (
                    <td>{account.accountDescription}</td>
                  )}
                  {visibleColumns.normalSide && <td>{account.normalSide}</td>}
                  {visibleColumns.category && (
                    <td>{account.accountCategory}</td>
                  )}
                  {visibleColumns.subcategory && (
                    <td>{account.accountSubcategory}</td>
                  )}
                  {visibleColumns.initialBalance && <td>{account.balance}</td>}
                  {visibleColumns.date && (
                    <td>
                      {account.DateAccountAdded
                        ? formatDate(account.DateAccountAdded)
                        : "N/A"}
                    </td>
                  )}
                  {visibleColumns.userID && <td>{account.UID}</td>}
                  {visibleColumns.order && <td>{account.order}</td>}
                  {visibleColumns.financialStatement && (
                    <td>{account.statement}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Ledger
        isOpen={selectedAccount !== null}
        onClose={onClose}
        account={selectedAccount}
      />
      {searchQuery && filteredAccounts.length === 0 && (
        <div className="error">No results found</div>
      )}
      {/* Don't remove this func below, this is literally required by 3.3, don't @ me - matthew*/}
      {user.role < 2 && <EmailAdminsOrManagers />}
    </div>
  );
};

export default ChartOfAccounts;
