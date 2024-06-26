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
      // Check if accounts are already loaded
      if (!accounts) {
        const querySnapshot = await getDocs(
          query(collection(db, "accounts"), where("isActivated", "==", true))
        ); //grabs all active accounts
        fetchedAccounts = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setAccounts(fetchedAccounts);
      }

      let tempAccounts = fetchedAccounts || [];
      if (selectedDate) {
        tempAccounts = await QueryAccountsInDateRange(
          fetchedAccounts,
          selectedDate[0],
          selectedDate[1]
        );
      }

      let revenue_accounts = []; //array to hold all revnues
      let expense_accounts = []; //array to hold all expenses
      tempAccounts.forEach((account) => {
        if (account.isActivated === true) {
          //sets COGS account
          if (account.accountName === "Cost of Goods Sold") {
            setCostOfGoodsSold(account);
          }
          //pushes revenue accounts into array
          else if (account.accountCategory === "revenues") {
            revenue_accounts.push(account);
          }
          //pushes expense accounts into array
          else if (account.accountCategory === "expenses") {
            expense_accounts.push(account);
          }
        }
      });
      setRevenues(revenue_accounts);
      setExpenses(expense_accounts);
      setTotalRevenues(
        revenue_accounts.reduce((total, revenue) => total + revenue.balance, 0)
      ); //calculates total revenues
      setTotalExpenses(
        expense_accounts.reduce((total, expense) => total + expense.balance, 0)
      ); //calculates total expenses
    };

    fetchAccountsAndEntries();
  }, [selectedDate, accounts]); //Add accounts to the dependency array to re-run when accounts are set

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
