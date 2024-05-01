import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase-config";
import CustomCalendar from "../tools/CustomCalendar";
import ReportToolSuite from "../tools/ReportToolSuite";
import formatNumber from "../tools/formatNumber";
import Help from "../layouts/Help";
import QueryAccountsInDateRange from "../tools/QueryAccountsInDateRange";

const IncomeStatement = () => {
  const [revenues, setRevenues] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState([]);
  const [totalRevenues, setTotalRevenues] = useState([]);
  const [costOfGoodsSold, setCostOfGoodsSold] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [accounts, setAccounts] = useState(null);

  const handleDateSelection = (dates) => {
    try {
    setSelectedDate([dates[0], dates[1]]);
    } catch (e) {
      setSelectedDate(null);
    }
  };
  const handleResetDateFilter = () => {
    setSelectedDate(null);
  };

  useEffect(() => {
    const fetchAccountsAndEntries = async () => {
      let fetchedAccounts = accounts;
      if (!accounts) {  // Check if accounts are already loaded
        let queryRef = collection(db, "accounts");
        const querySnapshot = await getDocs(queryRef);
        fetchedAccounts = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setAccounts(fetchedAccounts);  // This updates the state but doesn't update the variable in this closure
      }
  
      let tempAccounts = fetchedAccounts || [];  // Use fetchedAccounts directly if loaded, default to an empty array
      if (selectedDate) {
        tempAccounts = await QueryAccountsInDateRange(fetchedAccounts, selectedDate[0], selectedDate[1]);
      }
      console.log(tempAccounts);  // Check the tempAccounts content
  
      let revenue_accounts = [];
      let expense_accounts = [];
      tempAccounts.forEach((account) => {
        if (account.isActivated === true) {
          if (account.accountName === "Cost of Goods Sold") {
            setCostOfGoodsSold(account);
          }
          else if (account.accountCategory === "revenues") {
            revenue_accounts.push(account);
          }
          else if (account.accountCategory === "expenses") {
            expense_accounts.push(account);
          }
        }
      });
      setRevenues(revenue_accounts);
      setExpenses(expense_accounts);
      setTotalRevenues(revenue_accounts.reduce((total, revenue) => total + revenue.balance, 0));
      setTotalExpenses(expense_accounts.reduce((total, expense) => total + expense.balance, 0));
    };
  
    fetchAccountsAndEntries();
  }, [selectedDate, accounts]);  // Add accounts to the dependency array to re-run when accounts are set
  

  return (
    <div className="wrapper">
      <CustomCalendar 
        handleDateSelection={handleDateSelection}
        handleResetDateFilter={handleResetDateFilter} 
        isRange={true}
      />
      <Help componentName="IncomeStatement" />
      <div id="capture">
        <h1>Income Statement</h1>
        <table className="statement-table">
          <thead>
            <tr>
              <th>Account Name</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
          <tr className="statement-category">
              <td>Revenues</td>
              <td></td>
            </tr>
          {revenues.map((revenue) => (
              <tr key={revenue.accountID}>
                <td>{revenue.accountName}</td>
                <td>{formatNumber(parseFloat(revenue.balance))}</td>
              </tr>
            ))}
            <tr className="statement-category">
              <td>Cost of Goods Sold</td>
              <td></td>
            </tr>
            <tr>
              <td>{costOfGoodsSold.accountName}</td>
              <td>{formatNumber(parseFloat(costOfGoodsSold.balance))}</td>
            </tr>
            <tr className="statement-total">
              <td>Gross Profit</td>
              <td>{formatNumber(totalRevenues - costOfGoodsSold.balance)}</td>
            </tr>
            <tr className="statement-category">
              <td>Expenses</td>
              <td></td>
            </tr>
            {expenses.map((expense) => (
              <tr key={expense.accountID}>
                <td>{expense.accountName}</td>
                <td>{formatNumber(parseFloat(expense.balance))}</td>
              </tr>
            ))}
            <tr className="statement-total">
              <td>Total Expenses</td>
              <td>{formatNumber(totalExpenses)}</td>
            </tr>
            <tr className="statement-total">
              <td>Income Before Taxes</td>
              <td>
                {formatNumber(
                  totalRevenues - costOfGoodsSold.balance - totalExpenses
                )}
              </td>
            </tr>
            <tr>
              <td>Taxes</td>
              <td>
                {formatNumber(
                  (totalRevenues - costOfGoodsSold.balance - totalExpenses) *
                    0.2
                )}
              </td>
            </tr>
            <tr className="statement-total">
              <td>Net Income</td>
              <td>
                {formatNumber(
                  (totalRevenues - costOfGoodsSold.balance - totalExpenses) *
                    0.8
                )}
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
