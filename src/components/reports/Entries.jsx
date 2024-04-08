import {
  collection,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { db } from "../../firebase-config";
import { Context } from "../context/UserContext";
import CustomCalendar from "../layouts/CustomCalendar";
import Help from '../layouts/Help.jsx';

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
const Modal = ({ isOpen, closeModal, user, id, fetchEntries }) => {
  const [comment, setComment] = useState(""); //state to hold comment
  if (!isOpen) return null; //is isOpen state is false, nothing gets returned(modal closed)

  //rejects entry and stores comment
  const handleRejection = async () => {
    await updateDoc(doc(db, "journalEntries", id), {
      isRejected: true,
      comment: comment,
    });
    fetchEntries(); //function to rerender tables(update approved/rejected list after decision is made on pending entry)
    closeModal();
  };

  return (
    <div onClick={closeModal} className="modal-background">
      <div onClick={(e) => e.stopPropagation()} className="modal">
        <p onClick={closeModal} className="closeButton">
          &times;
        </p>
        <div>User: {user}</div>
        <label htmlFor="comment">Comment: </label>
        <input type="text" onChange={(e) => setComment(e.target.value)} />
        <button onClick={handleRejection}>Reject</button>
      </div>
    </div>
  );
};

//Custom table for rendering pending, approved, and rejected entries
const Table = ({ entries, isPending, fetchEntries }) => {
  const { user } = Context(); //pull user context for role
  const [isModal, setIsModal] = useState(false); //state to manage if modal is open
  const [rejectedEntryInfo, setRejectedEntryInfo] = useState([]); //state to store rejected entry information(userID and entryID)

  const toggleModal = (user, id) => {
    setIsModal(!isModal);
    setRejectedEntryInfo([user, id]); //sets rejected entry information to chosen table
  };

  //approves entry
  const handleApproval = async (entry) => {
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
                ))}
              </tbody>
            </table>
          </div>
          {user.role === 2 && isPending && (
            <div>
              <button onClick={() => handleApproval(entry)}>Approve</button>
              <button onClick={() => toggleModal(entry.user, entry.id)}>
                Reject
              </button>
            </div>
          )}
        </div>
      ))}
      {isModal && (
        <Modal
          isOpen={isModal}
          closeModal={() => setIsModal(false)}
          user={rejectedEntryInfo[0]}
          id={rejectedEntryInfo[1]}
          fetchEntries={fetchEntries}
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
  const [filterType, setFilterType] = useState("account");
  const [viewType, setViewType] = useState("3");

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

    //maps data in snapshot documents into array of objects to make data accessable
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

  //run fetchEntries() everytime the component is rendered
  useEffect(() => {
    fetchEntries();
  }, []);

  const getFilteredEntries = (entries) => {
    if (!searchTerm) return entries;

    return entries.filter((entry) => {
      return entry.entries.some((subEntry) => {
        switch (filterType) {
          case "account":
            return subEntry.account
              .toLowerCase()
              .includes(searchTerm.toLowerCase());
          case "amount":
            return Number(subEntry.amount) === Number(searchTerm);
          case "date":
            return formatDate(entry.dateCreated).includes(searchTerm);
          default:
            return true;
        }
      });
    });
  };

  return (
    <div className="wrapper">
      <CustomCalendar />
      <Help />
      <div>
        <label>Search by: </label>
        <select onChange={(e) => setFilterType(e.target.value)}>
          <option value="account">Account</option>
          <option value="amount">Amount</option>
          <option value="date">Date</option>
        </select>
        <input
            type="text"
            placeholder="Enter search term..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
        />
        <p>
        <label>View: </label>
        <select onChange={(e) => setViewType(e.target.value)}>
          <option value={3}>All</option>
          <option value={0}>Pending</option>
          <option value={1}>Approved</option>
          <option value={2}>Rejected</option>
        </select>
        </p>
      </div>
      {viewType === "3" || viewType === "0" ? (
          <div>
            <h2>Pending: </h2>
            <Table
                entries={getFilteredEntries(entries.pending)}
                isPending={true}
                fetchEntries={fetchEntries}
            />
          </div>
      ) : null}
      {viewType === "3" || viewType === "1" ? (
          <div>
            <h2>Approved: </h2>
            <Table
                entries={getFilteredEntries(entries.approved)}
                isPending={false}
            />
          </div>
      ) : null}
      {viewType === "3" || viewType === "2" ? (
          <div>
            <h2>Rejected: </h2>
            <Table
                entries={getFilteredEntries(entries.rejected)}
                isPending={false}
            />
          </div>
      ) : null}
    </div>
  );
};

export default Entries;
