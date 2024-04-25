import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase-config";
import CustomCalendar from "../tools/CustomCalendar";
import ReportToolSuite from "../tools/ReportToolSuite";
import formatNumber from "../tools/formatNumber";
import Help from "../layouts/Help";

const IncomeStatement = () => {
  const [revenues, setRevenues] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [costOfGoodsSold, setCostOfGoodsSold] = useState([]);

  useEffect(() => {
    const fetchAccountsAndEntries = async () => {
      try {
        // Fetch accounts and classify them as revenues or expenses
        const costOfGoodsSoldSnapshot = await getDocs(
          query(
            collection(db, "accounts"),
            where("isActivated", "==", true),
            where("accountName", "==", "Cost of Goods Sold")
          )
        );
        const revenuesSnapshot = await getDocs(
          query(
            collection(db, "accounts"),
            where("isActivated", "==", true),
            where("accountCategory", "==", "revenues")
          )
        );
        const revenuesData = revenuesSnapshot.docs.map((doc) => ({
          ...doc.data(),
        }));

        const expensesSnapshot = await getDocs(
          query(
            collection(db, "accounts"),
            where("isActivated", "==", true),
            where("accountCategory", "==", "expenses")
          )
        );
        const expensesData = expensesSnapshot.docs
          .filter((doc) => doc.data().accountName !== "Cost of Goods Sold")
          .map((doc) => ({
            ...doc.data(),
          }));

        let totalRevenues = 0;
        revenuesSnapshot.forEach((doc) => {
          totalRevenues += doc.data().balance;
        });
        setRevenues(revenuesData);
        setCostOfGoodsSold(costOfGoodsSoldSnapshot.docs[0].data());
        setExpenses(expensesData);
      } catch (error) {
        console.error("Error fetching accounts: ", error);
      }
    };

    fetchAccountsAndEntries();
  }, []);

  const totalExpenses = expenses.reduce(
    (total, expense) => total + expense.balance,
    0
  );
  const totalRevenues = revenues.reduce(
    (total, revenue) => total + revenue.balance,
    0
  );

  return (
    <div className="wrapper">
      <CustomCalendar />
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
