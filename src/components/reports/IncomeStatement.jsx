import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase-config";
import CustomCalendar from "../layouts/CustomCalendar";
import ReportToolSuite from "./ReportToolSuite";

const IncomeStatement = () => {
  const [revenue, setRevenue] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [costOfGoodsSold, setCostOfGoodsSold] = useState([]);

  useEffect(() => {
    const fetchAccountsAndEntries = async () => {
      try {
        // Fetch accounts and classify them as revenues or expenses
        const revenueAccount = await getDocs(
          query(
            collection(db, "accounts"),
            where("isActivated", "==", true),
            where("accountCategory", "==", "revenues")
          )
        );
        const costOfGoodsSoldAccount = await getDocs(
          query(
            collection(db, "accounts"),
            where("isActivated", "==", true),
            where("accountName", "==", "Cost of Goods Sold")
          )
        );
        const expenseAccounts = await getDocs(
          query(
            collection(db, "accounts"),
            where("isActivated", "==", true),
            where("accountCategory", "==", "expenses")
          )
        );
        const expensesData = expenseAccounts.docs
          .filter((doc) => doc.data().accountName !== "Cost of Goods Sold")
          .map((doc) => ({
            ...doc.data(),
          }));
        setRevenue(revenueAccount.docs[0].data());
        setCostOfGoodsSold(costOfGoodsSoldAccount.docs[0].data());
        setExpenses(expensesData);
      } catch (error) {
        console.error("Error fetching accounts: ", error);
      }
    };

    fetchAccountsAndEntries();
  }, []);

  const totalExpenses = expenses.reduce(
    (total, expense) => total + parseFloat(expense.balance),
    0
  );

  return (
    <div className="wrapper">
      <CustomCalendar />
      <div id="capture">
        <h1>Income Statement</h1>
        <table className="statement-table">
          <thead>
            <tr>
              <th>Account Name</th>
              <th>Amount ($)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{revenue.accountName}</td>
              <td>${revenue.balance}</td>
            </tr>
            <tr>
              <td>{costOfGoodsSold.accountName}</td>
              <td>${costOfGoodsSold.balance}</td>
            </tr>
            <tr className="statement-total">
              <td>Gross Profit</td>
              <td>${revenue.balance - costOfGoodsSold.balance}</td>
            </tr>
            <tr className="statement-category">
              <td>Expenses</td>
              <td></td>
            </tr>
            {expenses.map((expense) => (
              <tr key={expense.accountID}>
                <td>{expense.accountName}</td>
                <td>${expense.balance}</td>
              </tr>
            ))}
            <tr className="statement-total">
              <td>Total Expenses</td>
              <td>${totalExpenses}</td>
            </tr>
            <tr className="statement-total">
              <td>Income Before Taxes</td>
              <td>
                ${revenue.balance - costOfGoodsSold.balance - totalExpenses}
              </td>
            </tr>
            <tr>
              <td>Taxes</td>
              <td>
                $
                {(revenue.balance - costOfGoodsSold.balance - totalExpenses) *
                  0.2}
              </td>
            </tr>
            <tr className="statement-total">
              <td>Net Income</td>
              <td>
                $
                {(revenue.balance - costOfGoodsSold.balance - totalExpenses) *
                  0.8}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      {ReportToolSuite("Income Statement")}
    </div>
  );
};

export default IncomeStatement;
