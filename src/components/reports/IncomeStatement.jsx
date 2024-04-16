import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase-config";
import CustomCalendar from "../layouts/CustomCalendar";
import ShareReport from "./ShareReport";

const IncomeStatement = () => {
  const [accounts, setAccounts] = useState([]);
  const [revenues, setRevenues] = useState([]);
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        // Fetch accounts and classify them as revenues or expenses
        const accountsQuery = query(collection(db, "accounts"), where("isActivated", "==", true));
        const querySnapshot = await getDocs(accountsQuery);
        const fetchedAccounts = [];
        const fetchedRevenues = [];
        const fetchedExpenses = [];
        querySnapshot.forEach((doc) => {
          const account = doc.data();
          account.id = doc.id;
          fetchedAccounts.push(account);
          if (account.normalSide === 'credit') {
            fetchedRevenues.push(account);
          } else if (account.normalSide === 'debit') {
            fetchedExpenses.push(account);
          }
        });
        setAccounts(fetchedAccounts);
        setRevenues(fetchedRevenues);
        setExpenses(fetchedExpenses);
      } catch (error) {
        console.error("Error fetching accounts: ", error);
      }
    };
    
    fetchAccounts();
  }, []);

  // Calculate total revenues, total expenses, and net income
  const totalRevenues = revenues.reduce((sum, account) => sum + (account.amount || 0), 0);
  const totalExpenses = expenses.reduce((sum, account) => sum + (account.amount || 0), 0);
  const netIncome = totalRevenues - totalExpenses;

  // Styles
  const headerStyle = {
    backgroundColor: '#f2f2f2',
    fontWeight: 'bold',
    textAlign: 'left',
    padding: '10px',
    border: '1px solid black'
  };

  const rowStyle = {
    textAlign: 'left',
    padding: '10px',
    border: '1px solid black'
  };

  const totalRowStyle = {
    ...rowStyle,
    fontWeight: 'bold'
  };

  const netIncomeRowStyle = {
    ...totalRowStyle,
    borderTop: '2px solid black'
  };

  return (
    <div className="wrapper">
      <CustomCalendar />
      {ShareReport("Income Statement")}
      <div id="capture">
      <h1 style={{ textAlign: 'center' }}>Income Statement</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid black' }}>
        <thead>
          <tr>
            <th style={headerStyle}>Category</th>
            <th style={headerStyle}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {/* Revenue Rows */}
          <tr>
            <td style={headerStyle}>Revenue</td>
            <td></td>
          </tr>
          {/* Dynamically Generated Revenue Rows */}
          {revenues.map((revenue, index) => (
            <tr key={index}>
              <td style={rowStyle}>{revenue.accountName}</td>
              <td style={rowStyle}>{revenue.amount}</td>
            </tr>
          ))}
          {/* Total Revenue Row */}
          <tr>
            <td style={totalRowStyle}>Total Revenue</td>
            <td style={totalRowStyle}>${totalRevenues.toLocaleString()}</td>
          </tr>

          {/* Expenses Rows */}
          <tr>
            <td style={headerStyle}>Expenses</td>
            <td></td>
          </tr>
          {/* Dynamically Generated Expense Rows */}
          {expenses.map((expense, index) => (
            <tr key={index}>
              <td style={rowStyle}>{expense.accountName}</td>
              <td style={rowStyle}>{expense.amount}</td>
            </tr>
          ))}
          {/* Total Expenses Row */}
          <tr>
            <td style={totalRowStyle}>Total Expenses</td>
            <td style={totalRowStyle}>${totalExpenses.toLocaleString()}</td>
          </tr>

          {/* Net Income Row */}
          <tr>
            <td style={netIncomeRowStyle}>Net Income</td>
            <td style={netIncomeRowStyle}>${netIncome.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>

      </div>
    </div>
  );
};

export default IncomeStatement;
