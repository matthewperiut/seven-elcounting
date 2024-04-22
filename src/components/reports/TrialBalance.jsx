import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase-config.js";
import CustomCalendar from "../layouts/CustomCalendar.jsx"
import ReportToolSuite from "./ReportToolSuite.jsx";

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
    <div className="wrapper trial-balance">
      <CustomCalendar />
      <div id="capture">
      <h1>Trial Balance</h1>
      <p>As of {new Date().toLocaleDateString()}</p>
      <table className="trial-balance-table">
        <thead>
          <tr>
            <th>Account Name</th>
            <th>Debits</th>
            <th>Credits</th>
          </tr>
        </thead>
        <tbody>
          {sortedAccounts
            .sort((a, b) => a.accountNumber - b.accountNumber)
            .map((account) => (
              <tr key={account.id}>
                <td>{account.accountName}</td>
                <td>
                  {account.normalSide === "debit"
                    ? `$${parseFloat(account.balance).toLocaleString()}`
                    : ""}
                </td>
                <td>
                  {account.normalSide === "credit"
                    ? `$${parseFloat(account.balance).toLocaleString()}`
                    : ""}
                </td>
              </tr>
            ))}
          <tr className="bold-line">
            <td className="bold-text">Total</td>
            <td className="bold-text">{`$${totalDebits.toLocaleString(
              undefined,
              { minimumFractionDigits: 2, maximumFractionDigits: 2 }
            )}`}</td>
            <td className="bold-text">{`$${totalCredits.toLocaleString(
              undefined,
              { minimumFractionDigits: 2, maximumFractionDigits: 2 }
            )}`}</td>
          </tr>
        </tbody>
      </table>
      </div>
      {ReportToolSuite("Trial Balance")}
    </div>
  );
};

export default TrialBalance;
