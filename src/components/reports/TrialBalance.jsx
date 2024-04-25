import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase-config.js";
import CustomCalendar from "../tools/CustomCalendar.jsx";
import ReportToolSuite from "../tools/ReportToolSuite";
import formatNumber from "../tools/formatNumber";
import Help from "../layouts/Help";

const TrialBalance = () => {
  const [accounts, setAccounts] = useState([]);
  const [totalCredits, setTotalCredits] = useState(0);
  const [totalDebits, setTotalDebits] = useState(0);

  const [selectedDate, setSelectedDate] = useState(null);
  const handleDateSelection = (value) => {
    setSelectedDate(value);
  };
  const handleResetDateFilter = () => {
    setSelectedDate(null);
  };

  const fetchAllAccounts = async () => {
    let queryRef = collection(db, "accounts");
    if (selectedDate) {
      const [startDate, endDate] = selectedDate;
      if (endDate) {
        queryRef = query(queryRef, where("dateCreated", ">=", startDate), where("dateCreated", "<=", endDate));
      } else {
      queryRef = query(queryRef, where("dateCreated", "==", startDate));
    }
  }
    const querySnapshot = await getDocs(queryRef);
    const fetchedAccounts = querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    }));
    setAccounts(fetchedAccounts);
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
  }, [accounts]);
  
  useEffect(() => {
    fetchAllAccounts();
  }, [selectedDate])

  return (
    <div className="wrapper">
      <CustomCalendar 
        handleDateSelection={handleDateSelection}
        handleResetDateFilter={handleResetDateFilter} 
      />
      <Help componentName="TrialBalance" />
      <div id="capture">
        <h1>Trial Balance</h1>
        <p>As of {selectedDate ? (selectedDate.length > 1 ? `${selectedDate[0].toLocaleDateString()} - ${selectedDate[1].toLocaleDateString()}` : selectedDate[0].toLocaleDateString()) : new Date().toLocaleDateString()}</p>
        <table className="statement-table">
          <thead>
            <tr>
              <th>Account Name</th>
              <th>Debits</th>
              <th>Credits</th>
            </tr>
          </thead>
          <tbody>
            {accounts
              .sort((a, b) => a.accountNumber - b.accountNumber)
              .map((account) => (
                <tr key={account.accountID}>
                  <td>{account.accountName}</td>
                  <td>
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
              <td>{formatNumber(totalDebits)}</td>
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
