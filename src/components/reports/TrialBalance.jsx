import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase-config.js";

const TrialBalance = () => {
  const [accounts, setAccounts] = useState([]);
  const [totalCredits, setTotalCredits] = useState(0);
  const [totalDebits, setTotalDebits] = useState(0);

  const fetchAllAccounts = async () => {
    const querySnapshot = await getDocs(collection(db, "accounts"));
    const fetchedAccounts = querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));
    setAccounts(fetchedAccounts);
  };

  useEffect(() => {
    fetchAllAccounts();
  }, []);

  useEffect(() => {
    let credits = 0;
    let debits = 0;

    accounts.forEach((account) => {
      if (account.normalSide === "credit") {
        credits += parseFloat(account.balance);
      } else if (account.normalSide === "debit") {
        debits += parseFloat(account.balance);
      }
    });

    setTotalCredits(credits);
    setTotalDebits(debits);
  }, [accounts]);

  // Sort accounts by normalSide (debit first, then credit)
  const sortedAccounts = [...accounts].sort((a, b) => {
    if (a.normalSide === "debit" && b.normalSide === "credit") return -1;
    if (a.normalSide === "credit" && b.normalSide === "debit") return 1;
    return 0;
  });

  return (
    <div className="wrapper">
      <div className="trail-balance">
        <h1 style={{ fontFamily: "Times New Roman", fontSize: "18px", fontWeight: "bold" }}>Trial Balance</h1>
        <p style={{ fontFamily: "Times New Roman", fontSize: "18px", fontWeight: "bold", textAlign: "center" }}>As of {new Date().toLocaleDateString()}</p>
        <table className="table">
          <thead>
            <tr style={{ borderBottom: "2px solid black" }}>
              <th style={{ textAlign: "start", paddingRight: "10px" }}>Account Name</th>
              <th style={{ textAlign: "start", paddingRight: "10px" }}>Debits</th>
              <th style={{ textAlign: "start", paddingRight: "10px" }}>Credits</th>
            </tr>
          </thead>
          <tbody>
            {sortedAccounts.sort((a, b) => a.accountNumber - b.accountNumber).map((account) => (
              <tr key={account.id}>
                <td style={{ textAlign: "start", paddingRight: "10px" }}>{account.accountName}</td>
                <td style={{ textAlign: "start", paddingRight: "10px" }}>{account.normalSide === "debit" ? `$${parseFloat(account.balance).toLocaleString()}` : ""}</td>
                <td style={{ textAlign: "start", paddingRight: "10px" }}>{account.normalSide === "credit" ? `$${parseFloat(account.balance).toLocaleString()}` : ""}</td>
              </tr>
            ))}
            <tr style={{ borderTop: "2px solid black", fontWeight: "bold" }}>
              <td style={{ textAlign: "start", paddingRight: "10px" }}>Total</td>
              <td style={{ textAlign: "start", paddingRight: "10px" }}>{`$${totalDebits.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}</td>
              <td style={{ textAlign: "start", paddingRight: "10px" }}>{`$${totalCredits.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TrialBalance;
