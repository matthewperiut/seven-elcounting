import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase-config";
import CustomCalendar from "../tools/CustomCalendar";
import ReportToolSuite from "../tools/ReportToolSuite";
import Help from "../layouts/Help";
import formatNumber from "../tools/formatNumber";

function formatDate(timestamp) {
  if (!timestamp) return "";

  const date = timestamp.toDate();
  const options = { year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
}

const GeneralLedger = () => {
  const [approvedEntries, setApprovedEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchApprovedEntries = async () => {
      setLoading(true);

      //gets all approved journal entries
      const querySnapshot = await getDocs(
        query(
          collection(db, "journalEntries"),
          where("isApproved", "==", true),
          where("isRejected", "==", false)
        )
      );

      const entriesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setApprovedEntries(entriesData);
      setLoading(false);
    };

    fetchApprovedEntries();
  }, []);

  //anytime the search query or entries change, filter entries by search term
  useEffect(() => {
    const filtered = approvedEntries.filter((entry) => {
      const formattedDate = formatDate(entry.dateCreated).toLowerCase();
      const formattedUser = entry.user.toLowerCase();
      const searchTermLower = searchTerm.toLowerCase();

      return (
        formattedDate.includes(searchTermLower) ||
        formattedUser.includes(searchTermLower) ||
        entry.entries.some((subEntry) => {
          const formattedAccount = subEntry.account.toLowerCase();
          const formattedType = subEntry.type.toLowerCase();

          return (
            formattedAccount.includes(searchTermLower) ||
            formattedType.includes(searchTermLower)
          );
        })
      );
    });

    setFilteredEntries(filtered);
  }, [approvedEntries, searchTerm]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  return (
    <div className="wrapper">
      <CustomCalendar />
      <Help componentName="GeneralLedger" />
      <div id="capture">
        <h1>General Ledger</h1>
        <div>
          <input
            type="text"
            placeholder="Search Table..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
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
                    <tr className="entry" key={`${entry.id}-${index}`}>
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
      {ReportToolSuite("General Ledger")}
    </div>
  );
};

export default GeneralLedger;
