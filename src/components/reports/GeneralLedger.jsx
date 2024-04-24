import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase-config";
import CustomCalendar from "../layouts/CustomCalendar";
import ReportToolSuite from "../tools/ReportToolSuite";
import Help from "../layouts/Help";
import formatNumber from "../tools/formatNumber";

function formatDate(timestamp) {
  if (!timestamp) return "";

  const date = timestamp.toDate();
  const options = { year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
}

const GeneralLedger = ({ showSearchBar }) => {
  const [approvedEntries, setApprovedEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchAccount, setSearchAccount] = useState("");
  const [searchType, setSearchType] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [showDateInput, setShowDateInput] = useState(true);
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
    let filtered = approvedEntries;

    // Filter entries based on the search criteria (account, type, and date)
    filtered = filtered.filter((entry) => {
      const lowerCaseAccount = searchAccount.toLowerCase();
      const lowerCaseType = searchType.toLowerCase();
      const lowerCaseDateFilter = dateFilter.toLowerCase();

      const matchesDate =
        !dateFilter ||
        formatDate(entry.dateCreated)
          .toLowerCase()
          .includes(lowerCaseDateFilter);

      return (
        matchesDate &&
        entry.entries.some((subEntry) => {
          const { account, type } = subEntry;
          const lowerCaseEntryAccount = account.toLowerCase();
          const lowerCaseEntryType = type.toLowerCase();

          return (
            lowerCaseEntryAccount.includes(lowerCaseAccount) ||
            lowerCaseEntryType.includes(lowerCaseType)
          );
        })
      );
    });

    setFilteredEntries(filtered);
  }, [searchAccount, searchType, dateFilter, approvedEntries]);

  const handleSearchAccountChange = (event) => {
    setSearchAccount(event.target.value);
  };

  const handleSearchTypeChange = (event) => {
    setSearchType(event.target.value);
  };

  const handleDateFilterChange = (event) => {
    setDateFilter(event.target.value);
  };

  return (
    <div className="wrapper">
      <CustomCalendar />
      <Help />
      <div id="capture">
        <h1>General Ledger</h1>
        <div>
          {showSearchBar && (
            <div>
              <input
                type="text"
                placeholder="Search Account"
                value={searchAccount}
                onChange={handleSearchAccountChange}
              />
              <input
                type="text"
                placeholder="Search Type"
                value={searchType}
                onChange={handleSearchTypeChange}
              />
            </div>
          )}
          {showDateInput && (
            <div>
              <input
                type="text"
                placeholder="Enter Date (e.g., January 1, 2023)"
                value={dateFilter}
                onChange={handleDateFilterChange}
              />
            </div>
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
                  {filteredEntries.map((entry) =>
                    entry.entries.map((subEntry, index) => (
                      <tr className="entry" key={index}>
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
                          {subEntry.type === "debit" &&
                            formatNumber(subEntry.amount)}
                        </td>
                        <td>
                          {subEntry.type === "credit" &&
                            formatNumber(subEntry.amount)}
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
      {ReportToolSuite("General Ledger")}
    </div>
  );
};

export default GeneralLedger;
