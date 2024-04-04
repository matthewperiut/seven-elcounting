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

const Entries = () => {
  const { user } = Context();
  const [entries, setEntries] = useState({
    pending: [],
    approved: [],
    rejected: [],
  });

  useEffect(() => {

    const fetchEntries = async () => {
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
      setEntries({
        pending: pendingEntries,
        approved: approvedEntries,
        rejected: rejectedEntries,
      });
    };
    fetchEntries();
  }, []);

  const handleApproval = async (entry) => {
    await updateDoc(doc(db, "journalEntries", entry.id), {
      isApproved: true,
    });
    setEntries((prev) => ({
      ...prev,
      pending: prev.pending.filter((e) => e.id !== entry.id),
      approved: [...prev.approved, entry]
    }))
  };
  const handleRejection = async (entry) => {
    await updateDoc(doc(db, "journalEntries", entry.id), {
      isRejected: true,
    });
    setEntries((prev) => ({
      ...prev,
      pending: prev.pending.filter((e) => e.id !== entry.id),
      rejected: [...prev.rejected, entry]
    }))
  };

  const Table = ({ entries, isPending }) => (
    <div>
      {entries.map((entry) => (
        <div className="entries-table" key={entry.id}>
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
              <tr key={entry.id}>
                <td rowSpan={entry.entries.length}>
                  {formatDate(entry.dateCreated)}
                </td>
                <td rowSpan={entry.entries.length}>{entry.user}</td>
                <td>{entry.entries[0].account}</td>
                <td>{entry.entries[0].type}</td>
                <td>{entry.entries[0].amount}</td>
              </tr>
              {entry.entries.slice(1).map((subEntry, index) => (
                <tr key={index}>
                  <td>{subEntry.account}</td>
                  <td>{subEntry.type}</td>
                  <td>{subEntry.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {user.role === 2 && isPending && (
            <div>
              <button onClick={() => handleApproval(entry)}>Approve</button>
              <button onClick={() => handleRejection(entry)}>Reject</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="wrapper">
      <div>
        <h2>Pending: </h2>
        <Table entries={entries.pending} isPending={true} />
      </div>
      <div>
        <h2>Approved: </h2>
        <Table entries={entries.approved} isPending={false} />
      </div>
      <div>
        <h2>Rejected: </h2>
        <Table entries={entries.rejected} isPending={false} />
      </div>
    </div>
  );
};

export default Entries;
