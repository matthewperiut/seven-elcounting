import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase-config.js";
import CustomCalendar from "../tools/CustomCalendar.jsx";
import ReportToolSuite from "../tools/ReportToolSuite";
import formatNumber from "../tools/formatNumber";
import Help from "../layouts/Help";
import QueryAccountsInDateRange from "../tools/QueryAccountsInDateRange.jsx";

const TrialBalance = () => {
  const [accounts, setAccounts] = useState([]);
  const [totalCredits, setTotalCredits] = useState(0);
  const [totalDebits, setTotalDebits] = useState(0);
  const [selectedDate, setSelectedDate] = useState(null);

  const handleDateSelection = (date) => {
    try {
      const date2 = new Date("2023-12-17T03:24:00");
      date.setHours(23, 59, 0, 0);
      setSelectedDate([date2, date]);
    } catch (e) {
      setSelectedDate(null);
    }
  };
  const handleResetDateFilter = () => {
    setSelectedDate(null);
  };

  const fetchAllAccounts = async () => {
    const querySnapshot = await getDocs(
      query(collection(db, "accounts"), where("isActivated", "==", true))
    ); //grabs all active accounts
    const fetchedAccounts = querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));

    try {
      if (selectedDate) {
        const tempAccounts = await QueryAccountsInDateRange(
          fetchedAccounts,
          selectedDate[0],
          selectedDate[1]
        );
        setAccounts(tempAccounts);
      } else {
        setAccounts(fetchedAccounts);
      }
    } catch (e) {
      setAccounts(fetchedAccounts);
    }
  };

  useEffect(() => {
    fetchAllAccounts();

    let credits = 0;
    let debits = 0;

    accounts.forEach((account) => {
      if (account.normalSide === "credit") {
        credits += account.balance;
      } else if (account.normalSide === "debit") {
        debits += account.balance;
      }
    });

    setTotalCredits(credits);
    setTotalDebits(debits);
  }, [selectedDate, accounts]);

  return (
    <div className="wrapper">
      <CustomCalendar
        handleDateSelection={handleDateSelection}
        handleResetDateFilter={handleResetDateFilter}
      />
      <Help componentName="TrialBalance" />
      <div id="capture">
        <h1>Trial Balance</h1>
        <p>
          As of{" "}
          {selectedDate
            ? selectedDate[0].toLocaleDateString()
            : new Date().toLocaleDateString()}
        </p>
        <table className="statement-table">
          <thead>
            <tr>
              <th>Account Name</th>
              <th style={{ textAlign: "center" }}>Debits</th>
              <th>Credits</th>
            </tr>
          </thead>
          <tbody>
            {accounts
              .sort((a, b) => a.accountNumber - b.accountNumber)
              .map((account) => (
                <tr key={account.accountID}>
                  <td>{account.accountName}</td>
                  <td style={{ textAlign: "center" }}>
                    {account.normalSide === "debit" &&
                      formatNumber(account.balance)}
                  </td>
                  <td>
                    {account.normalSide === "credit" &&
                      formatNumber(account.balance)}
                  </td>
                </tr>
              ))}
            <tr className="statement-total">
              <td>Total</td>
              <td style={{ textAlign: "center" }}>
                {formatNumber(totalDebits)}
              </td>
              <td>{formatNumber(totalCredits)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      {ReportToolSuite("Trial Balance")}
    </div>
  );
};

export default TrialBalance;
