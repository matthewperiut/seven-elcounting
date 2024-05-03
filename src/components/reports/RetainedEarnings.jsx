import { useEffect, useState } from "react";
import ReportToolSuite from "../tools/ReportToolSuite";
import formatNumber from "../tools/formatNumber";
import CustomCalendar from "../tools/CustomCalendar";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase-config";
import Help from "../layouts/Help";
import QueryAccountsInDateRange from "../tools/QueryAccountsInDateRange";

function formatDate(date) {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
}

const RetainedEarnings = () => {
  const [retainedEarnings, setRetainedEarnings] = useState(null);
  const [dividends, setDividends] = useState(null);
  const [income, setIncome] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [accounts, setAccounts] = useState(null);

  //handles date range selection when user uses calendar
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
    const fetchRetainedEarnings = async () => {
      try {
        let fetchedAccounts = accounts;

        //queries accounts if they have not already been queried
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

        //queries accounts in selected date range
        if (selectedDate) {
          tempAccounts = await QueryAccountsInDateRange(
            fetchedAccounts,
            selectedDate[0],
            selectedDate[1]
          );
        }
        let revenue_accounts = []; //array to hold all revenues
        let expense_accounts = []; //array to hold all expenses
        tempAccounts.forEach((account) => {
          if (account.isActivated === true) {
            //sets retained earnings account
            if (account.accountName === "Retained Earnings") {
              setRetainedEarnings(account.balance);
            }
            //sets dividends account
            if (account.accountName === "Dividends") {
              setDividends(account.balance);
            }
            //pushes revenue accounts into array
            if (account.accountCategory === "revenues") {
              revenue_accounts.push(account);
            }
            //pushes expense accounts into array
            if (account.accountCategory === "expenses") {
              expense_accounts.push(account);
            }
          }
        });

        //calculates total revenues
        let totalRevenues = 0;
        revenue_accounts.forEach((account) => {
          totalRevenues += account.balance;
        });

        //calculates total expenses
        let totalExpenses = 0;
        expense_accounts.forEach((account) => {
          totalExpenses += account.balance;
        });
        setIncome((totalRevenues - totalExpenses) * 0.8); //sets income based on revenues, expenses, and tax
      } catch (error) {
        console.error(error.message);
      }
    };

    fetchRetainedEarnings();
  }, [accounts, selectedDate]);

  return (
    <div className="wrapper">
      <CustomCalendar
        handleDateSelection={handleDateSelection}
        handleResetDateFilter={handleResetDateFilter}
        isRange={true}
      />
      <Help componentName="RetainedEarnings" />
      <div id="capture">
        <h1>Retained Earnings Statement</h1>
        <table className="statement-table">
          <tbody>
            <tr>
              {selectedDate ? (
                <td>Retained earnings - {formatDate(selectedDate[0])}</td>
              ) : (
                <td>Retained earnings as of {formatDate(new Date())}</td>
              )}
              <td>{formatNumber(parseFloat(retainedEarnings))}</td>
            </tr>
            <tr>
              <td>Plus: Net income</td>
              <td>{formatNumber(parseFloat(income))}</td>
            </tr>
            <tr className="statement-total">
              <td></td>
              <td>{formatNumber(retainedEarnings + income)}</td>
            </tr>
            <tr>
              <td>Less: Dividends</td>
              <td>{formatNumber(parseFloat(dividends))}</td>
            </tr>
            <tr className="statement-total">
              {selectedDate ? (
                <td>Retained earnings - {formatDate(selectedDate[1])}</td>
              ) : (
                <td>Retained earnings as of {formatDate(new Date())}</td>
              )}

              <td>{formatNumber(retainedEarnings + income - dividends)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      {ReportToolSuite("Retained Earnings Statement")}
    </div>
  );
};

export default RetainedEarnings;
