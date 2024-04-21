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

        accountsData.sort((a, b) => a.accountCategory.localeCompare(b.accountCategory));

        const fetchedRevenues = accountsData.filter(acc => acc.accountCategory === 'revenues').map(acc => ({
          ...acc,
          amount: parseFloat(acc.initialBalance) || 0
        }));

        const fetchedExpenses = accountsData.filter(acc => acc.accountCategory === 'expenses' && acc.accountName !== 'Cost of Goods Sold').map(acc => ({
          ...acc,
          amount: parseFloat(acc.initialBalance) || 0
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

  // Calculates gross profit, net income, total expenses, and taxes
  const costOfGoodsSold = expenses.find(expense => expense.accountName === 'Cost of Goods Sold')?.amount || 0;
  const salesRevenue = revenues.reduce((sum, account) => sum + (account.amount || 0), 0);
  const grossProfit = salesRevenue - costOfGoodsSold;
  const totalExpenses = expenses.reduce((sum, account) => sum + (account.amount || 0), 0);
  const netIncome = grossProfit - totalExpenses;
  const incomeBeforeTaxes = grossProfit - totalExpenses;
  const taxRate = 0.2; // Place holder for taxes
  const taxes = incomeBeforeTaxes * taxRate;

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
              <th style={headerStyle}></th>
            </tr>
          </thead>
          <tbody>
            {revenues.map((revenue, index) => (
              <tr key={index}>
                <td style={rowStyle}>{revenue.accountName}</td>
                <td style={rowStyle}>${revenue.amount.toLocaleString()}</td>
              </tr>
            ))}
            <tr>
              <td style={rowStyle}>Cost of Goods Sold</td>
              <td style={rowStyle}>${costOfGoodsSold.toLocaleString()}</td>
            </tr>
            <tr>
              <td style={totalRowStyle}>Gross Profit</td>
              <td style={totalRowStyle}>${grossProfit.toLocaleString()}</td>
            </tr>
          </tbody>
          <thead>
            <tr>
              <th style={headerStyle}>Expenses</th>
              <th style={headerStyle}></th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense, index) => (
              <tr key={index}>
                <td style={rowStyle}>{expense.accountName}</td>
                <td style={rowStyle}>${expense.amount.toLocaleString()}</td>
              </tr>
            ))}
            <tr>
              <td style={headerStyle}>Total Expenses (excluding cost of goods sold)</td>
              <td style={headerStyle}>${totalExpenses.toLocaleString()}</td>
            </tr>
            <tr>
              <td style={totalRowStyle}>Income before taxes</td>
              <td style={totalRowStyle}>${incomeBeforeTaxes.toLocaleString()}</td>
            </tr>
            <tr>
              <td style={totalRowStyle}>Taxes</td>
              <td style={totalRowStyle}>${taxes.toLocaleString()}</td>
            </tr>
            <tr>
              <th style={headerStyle}>Net Income</th>
              <th style={headerStyle}>${netIncome.toLocaleString()}</th>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IncomeStatement;