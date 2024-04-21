import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase-config";
import CustomCalendar from "../layouts/CustomCalendar";
import ReportToolSuite from "./ReportToolSuite";

const IncomeStatement = () => {
  const [accounts, setAccounts] = useState([]);
  const [revenues, setRevenues] = useState([]);
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    const fetchAccountsAndEntries = async () => {
      try {
        // Fetch accounts and classify them as revenues or expenses
        const accountsQuery = query(collection(db, "accounts"), where("isActivated", "==", true));
        const accountSnapshot = await getDocs(accountsQuery);
        const accountsData = accountSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const entriesQuery = query(collection(db, "journalEntries"), where("isApproved", "==", true));
        const entriesSnapshot = await getDocs(entriesQuery);
        const entries = entriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Map to hold final balances
        const accountBalances = {};

        // Initialize balances to zero
        accountsData.forEach(account => {
          accountBalances[account.id] = parseFloat(account.initialBalance) || 0;
        });

        // Calculate new balances from entries
        entries.forEach(entry => {
          entry.entries.forEach(item => {
            const account = accountsData.find(acc => acc.id === item.accountID);
            if (account) {
              let effect = item.type === account.normalSide ? item.amount : -item.amount;
              accountBalances[account.id] += parseFloat(effect);
            }
          });
        });

        // Set states for revenues and expenses based on specified accounts
        const fetchedRevenues = accountsData.filter(acc => (
          acc.accountName === 'Cost of Goods Sold' || 
          acc.accountName === 'Sales Revenue' || 
          acc.accountName === 'Sales Returns'
        )).map(acc => ({
          ...acc,
          amount: accountBalances[acc.id]
        }));

        const fetchedExpenses = accountsData.filter(acc => (
          acc.accountName === 'Salaries Expense'
        )).map(acc => ({
          ...acc,
          amount: accountBalances[acc.id]
        }));

        setAccounts(accountsData);
        setRevenues(fetchedRevenues);
        setExpenses(fetchedExpenses);

      } catch (error) {
        console.error("Error fetching accounts: ", error);
      }
    };

    fetchAccountsAndEntries();
  }, []);

  // Calculate total revenues, total expenses, and net income
  const totalRevenues = revenues.reduce((sum, account) => sum + (account.amount || 0), 0);
  const totalExpenses = expenses.reduce((sum, account) => sum + (account.amount || 0), 0);
  const incomeBeforeTaxes = totalRevenues - totalExpenses;
  const taxRate = 0.2; // Place holder for taxes
  const taxes = incomeBeforeTaxes * taxRate;
  const netIncome = incomeBeforeTaxes - taxes;

  // Styles
  const headerStyle = {
    backgroundColor: '#CCCCFF',
    fontWeight: 'bold',
    textAlign: 'left',
    padding: '10px',
    border: '1px solid black',
    borderTop: '2px solid black'
  };

  const rowStyle = {
    textAlign: 'left',
    padding: '10px',
    border: '1px solid black'
  };

  const totalRowStyle = {
    ...rowStyle,
    fontWeight: 'bold',
    backgroundColor: '#EEEEFF'
  };

  const incomeBeforeTaxRowStyle ={
    ...rowStyle,
    fontWeight: 'bold',
    borderTop: '2px solid black'
  }
  
  const taxRowStyle ={
    ...rowStyle,
    fontWeight: 'bold',
  }
  const netIncomeRowStyle = {
    ...headerStyle,
    borderTop: '2px solid black'
  };

  return (
    <div className="wrapper">
      <CustomCalendar />
      {ReportToolSuite("Income Statement")}
      <div id="capture">
        <h1 style={{ textAlign: 'center' }}>Income Statement</h1>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid black' }}>
          <thead>
            <tr>
              <th style={headerStyle}>Revenue</th>
              <th style={headerStyle}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {/* Revenue Rows */}
            {revenues.map((revenue, index) => (
              <tr key={index}>
                <td style={rowStyle}>{revenue.accountName}</td>
                <td style={rowStyle}>${revenue.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
            ))}
            {/* Total Revenue Row */}
            <tr>
              <td style={totalRowStyle}>Total Revenue</td>
              <td style={totalRowStyle}>${totalRevenues.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
            </tbody>
            <thead>
            <tr>
              <th style={headerStyle}>Expenses</th>
              <th style={headerStyle}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {/* Expense Rows */}
            {expenses.map((expense, index) => (
              <tr key={index}>
                <td style={rowStyle}>{expense.accountName}</td>
                <td style={rowStyle}>${expense.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
            ))}
            {/* Total Expenses Row */}
            <tr>
              <td style={totalRowStyle}>Total Expenses</td>
              <td style={totalRowStyle}>${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
            {/* Income Before Taxes Row */}
            <tr>
              <td style={incomeBeforeTaxRowStyle}>Income Before Taxes</td>
              <td style={incomeBeforeTaxRowStyle}>${incomeBeforeTaxes.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
            {/* Taxes Row */}
            <tr>
              <td style={taxRowStyle}>Taxes</td>
              <td style={taxRowStyle}>${taxes.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
            {/* Net Income Row */}
            <tr>
              <td style={netIncomeRowStyle}>Net Income</td>
              <td style={netIncomeRowStyle}>${netIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IncomeStatement;
