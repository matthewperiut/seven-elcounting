import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { db } from "../../firebase-config";
import { Context } from "../context/UserContext";
import CustomCalendar from "../tools/CustomCalendar";
import Help from "../layouts/Help";
import Journalizing from "../accounts/Journalizing";
import formatNumber from "../tools/formatNumber";

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

//Custom modal to enter comment for rejected journal entry
const Modal = ({ isOpen, closeModal, fetchEntries, isAdjusting, entry }) => {
  const [comment, setComment] = useState(""); //state to hold comment
  if (!isOpen) return null; //is isOpen state is false, nothing gets returned(modal closed)

  const update = () => {
    fetchEntries(); //function to rerender tables(update approved/rejected list after decision is made on pending entry)
    closeModal();
  };

  //rejects entry and stores comment
  const handleSubmit = async () => {
    await updateDoc(doc(db, "journalEntries", entry.id), {
      isRejected: true,
      comment: comment,
    });
    update();
  };

  const handleAdjustment = async () => {
    const journalDocSnap = await getDoc(doc(db, "journalEntries", entry.id));
    const journalData = journalDocSnap.data();
    if (journalData.isApproved) {
      for (let i = 0; i < journalData.entries.length; i++) {
        let entryData = journalData.entries[i];
        const accountDocSnap = await getDoc(
          doc(db, "accounts", entryData.accountID)
        );
        const accountData = accountDocSnap.data();
        let addition = entryData.type === accountData.normalSide;
        let new_bal = 0;
        if (addition) {
          new_bal =
            parseFloat(accountData.balance) - parseFloat(entryData.amount);
        } else {
          new_bal =
            parseFloat(accountData.balance) + parseFloat(entryData.amount);
        }
        await updateDoc(doc(db, "accounts", entryData.accountID), {
          balance: new_bal,
        });
      }
    }
  };

  return (
    <div onClick={closeModal} className="modal-background">
      <div onClick={(e) => e.stopPropagation()} className="modal">
        <p onClick={closeModal} className="closeButton">
          &times;
        </p>
        <br />
        {isAdjusting ? (
          <Journalizing
            adjustingEntry={entry}
            adjust={handleAdjustment}
            update={update}
          />
        ) : (
          <>
            <div>User: {entry.user}</div>
            <label htmlFor="comment">Comment: </label>
            <input type="text" onChange={(e) => setComment(e.target.value)} />
            <button onClick={handleSubmit}>Reject</button>
          </>
        )}
      </div>
    </div>
  );
};

//Custom table for rendering pending, approved, and rejected entries
const Table = ({ entries, isPending, fetchEntries }) => {
  const { user } = Context(); //pull user context for role
  const [isModal, setIsModal] = useState(false); //state to manage if modal is open
  const [entryInfo, setEntryInfo] = useState({}); //state to store rejected entry information(userID and entryID)
  const [isAdjusting, setIsAdjusting] = useState(false);

  const toggleModal = (entry, adjust) => {
    setIsModal(!isModal);
    adjust ? setIsAdjusting(true) : setIsAdjusting(false);
    setEntryInfo(entry); //sets rejected entry information to chosen table
  };

  //approves entry
  const handleApproval = async (entry) => {
    const journalEntryRef = doc(db, "journalEntries", entry.id);
    const journalDocSnap = await getDoc(journalEntryRef);
    const journalData = journalDocSnap.data();

    for (let i = 0; i < journalData.entries.length; i++) {
      let entryData = journalData.entries[i];
      const accountEntryRef = doc(db, "accounts", entryData.accountID);
      const accountDocSnap = await getDoc(accountEntryRef);
      const accountData = accountDocSnap.data();
      let addition = entryData.type === accountData.normalSide;
      let new_bal = 0;
      if (addition) {
        new_bal =
          parseFloat(accountData.balance) + parseFloat(entryData.amount);
      } else {
        new_bal =
          parseFloat(accountData.balance) - parseFloat(entryData.amount);
      }
      await updateDoc(accountEntryRef, {
        balance: new_bal,
      });
    }

    await updateDoc(doc(db, "journalEntries", entry.id), {
      isApproved: true,
    });

    fetchEntries(); //function to rerender tables(update approved/rejected list after decision is made on pending entry)
  };

  return (
    <div>
      {entries.map((entry) => (
        <div key={entry.id}>
          <div className="entries-table">
            <table>
              <thead>
                <tr>
                  <th>Date Created</th>
                  <th>User</th>
                  <th>Account</th>
                  <th>Debit</th>
                  <th>Credit</th>
                </tr>
              </thead>
              <tbody>
                {entry.entries.map((subEntry, index) => (
                  <tr className="entry" key={index}>
                    {index === 0 && (
                      <>
                        <td rowSpan={entry.entries.length}>
                          {formatDate(entry.dateCreated)}
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
                ))}
              </tbody>
            </table>
          </div>
          {user.role > 1 && isPending && (
            <>
              <button onClick={() => handleApproval(entry)}>Approve</button>
              <button onClick={() => toggleModal(entry, false)}>Reject</button>
            </>
          )}
          <button onClick={() => toggleModal(entry, true)}>Adjust</button>
        </div>
      ))}
      {isModal && (
        <Modal
          isOpen={isModal}
          closeModal={() => setIsModal(false)}
          entry={entryInfo}
          fetchEntries={fetchEntries}
          isAdjusting={isAdjusting}
        />
      )}
    </div>
  );
};

const Entries = () => {
  //state object of arrays to store pending, approved, and rejected entries
  const [entries, setEntries] = useState({
    pending: [],
    approved: [],
    rejected: [],
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [viewType, setViewType] = useState("3");

  //allows user to select date(s)
  const [selectedDate, setSelectedDate] = useState(null);
  const handleDateSelection = (value) => {
    //setSelectedDate(value);
  };
  const handleResetDateFilter = () => {
    //setSelectedDate(null);
  };

  const fetchEntries = async () => {
    //queries entries based off approval status
    const pendingSnapshot = await getDocs(
      query(
        collection(db, "journalEntries"),
        where("isApproved", "==", false),
        where("isRejected", "==", false)
      )
    );
    const approvedSnapshot = await getDocs(
      query(
        collection(db, "journalEntries"),
        where("isApproved", "==", true),
        where("isRejected", "==", false)
      )
    );
    const rejectedSnapshot = await getDocs(
      query(
        collection(db, "journalEntries"),
        where("isApproved", "==", false),
        where("isRejected", "==", true)
      )
    );

    //maps data in snapshot documents into array of objects to make data accessible
    const pendingEntries = pendingSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    const approvedEntries = approvedSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    const rejectedEntries = rejectedSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    //sets entries with respective document data
    setEntries({
      pending: pendingEntries,
      approved: approvedEntries,
      rejected: rejectedEntries,
    });
  };

  //run fetchEntries() every time the component is rendered
  useEffect(() => {
    fetchEntries();
  }, []);

  const getFilteredEntries = (entries) => {
    let filteredEntries = entries;

    if (searchTerm) {
      filteredEntries = filteredEntries.filter((entry) => {
        return entry.entries.some((subEntry) => {
          return (
            subEntry.account.toLowerCase().includes(searchTerm.toLowerCase()) ||
            subEntry.amount.toString().includes(searchTerm) ||
            formatDate(entry.dateCreated)
              .toLowerCase()
              .includes(searchTerm.toLowerCase())
          );
        });
      });
    }
    // More filtering by the selected date(s)
    if (selectedDate) {
      const [startDate, endDate] = selectedDate;
      filteredEntries = filteredEntries.filter((entry) => {
        const entryDate = entry.dateCreated.toDate();
        // If user selects second dat, it assume range
        if (endDate) {
          return entryDate >= startDate && entryDate <= endDate;
        }
        // Otherwise, filter as single date
        return entryDate.toDateString() === startDate.toDateString();
      });
    }
    return filteredEntries;
  };

  return (
    <div className="wrapper">
      <CustomCalendar
        handleDateSelection={handleDateSelection}
        handleResetDateFilter={handleResetDateFilter}
      />
      <Help componentName="JournalEntries" />
      <div>
        <input
          type="text"
          placeholder="Search by account, amount, or date..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <p>
        <label>View: </label>
        <select onChange={(e) => setViewType(e.target.value)}>
          <option value={3}>All</option>
          <option value={0}>Pending</option>
          <option value={1}>Approved</option>
          <option value={2}>Rejected</option>
        </select>
      </p>
      {viewType === "3" || viewType === "0" ? (
        <div>
          <h2>Pending</h2>
          <Table
            entries={getFilteredEntries(entries.pending)}
            isPending={true}
            fetchEntries={fetchEntries}
          />
        </div>
      ) : null}
      {viewType === "3" || viewType === "1" ? (
        <div>
          <h2>Approved</h2>
          <Table
            entries={getFilteredEntries(entries.approved)}
            isPending={false}
            fetchEntries={fetchEntries}
          />
        </div>
      ) : null}
      {viewType === "3" || viewType === "2" ? (
        <div>
          <h2>Rejected</h2>
          <Table
            entries={getFilteredEntries(entries.rejected)}
            isPending={false}
            fetchEntries={fetchEntries}
          />
        </div>
      ) : null}
    </div>
  );
};

export default Entries;
