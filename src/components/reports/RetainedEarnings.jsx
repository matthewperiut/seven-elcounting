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
        if (!accounts) {
          let queryRef = collection(db, "accounts");
          const querySnapshot = await getDocs(queryRef);
          fetchedAccounts = querySnapshot.docs.map((doc) => ({
            ...doc.data(),
            id: doc.id,
          }));
          setAccounts(fetchedAccounts)
        }
        let tempAccounts = fetchedAccounts || [];
        if (selectedDate) {
          tempAccounts = await QueryAccountsInDateRange(fetchedAccounts, selectedDate[0], selectedDate[1]);
        }
        let revenue_accounts = [];
        let expense_accounts = [];
        tempAccounts.forEach((account) => {
          if (account.isActivated === true) {
            if (account.accountName === "Retained Earnings") {
              setRetainedEarnings(account.balance);
            }
             if (account.accountName === "Dividends") {
              setDividends(account.balance);
            }
             if (account.accountCategory === "revenues") {
              revenue_accounts.push(account);
            }
             if (account.accountCategory === "expenses") {
              expense_accounts.push(account);
            }
          }
        });
        const dividendsAccount = await getDocs(
          query(
            collection(db, "accounts"),
            where("accountName", "==", "Dividends")
          )
        );
        let totalRevenues = 0;
        revenue_accounts.forEach((account) => {
          totalRevenues += account.balance;
        });
        let totalExpenses = 0;
        expense_accounts.forEach((account) => {
          totalExpenses += account.balance;
        });
        setIncome((totalRevenues - totalExpenses) * 0.8);
        
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
              {(selectedDate ? (
                <td>Retained earnings - {formatDate(selectedDate[0])}</td>
              ) : (
                <td>Retained earnings as of {formatDate(new Date())}</td>
              ))}
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

              {(selectedDate ? (
                <td>Retained earnings - {formatDate(selectedDate[1])}</td>
              ) : (
                <td>Retained earnings as of {formatDate(new Date())}</td>
              ))}
              
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