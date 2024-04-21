import { useEffect, useState } from "react";
import ReportToolSuite from "./ReportToolSuite";
import CustomCalendar from "../layouts/CustomCalendar";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase-config";

const RetainedEarnings = () => {
  const [retainedEarnings, setRetainedEarnings] = useState(null);
  const [income, setIncome] = useState(null);
  const [dividends, setDividends] = useState(null);

  useEffect(() => {
    const fetchRetainedEarnings = async () => {
      try {
        const retainedEarningsAccount = await getDocs(
          query(
            collection(db, "accounts"),
            where("accountName", "==", "Retained Earnings")
          )
        );
        const salesRevenueAccount = await getDocs(
          query(
            collection(db, "accounts"),
            where("accountCategory", "==", "revenues")
          )
        );
        const expensesAccounts = await getDocs(
          query(
            collection(db, "accounts"),
            where("accountCategory", "==", "expenses")
          )
        );
        const dividendsAccount = await getDocs(
          query(
            collection(db, "accounts"),
            where("accountName", "==", "Dividends")
          )
        );

        setRetainedEarnings(retainedEarningsAccount.docs[0].data().balance);
        let totalExpenses = 0;
        expensesAccounts.forEach((doc) => {
          totalExpenses += doc.data().balance;
        });
        setIncome((salesRevenueAccount.docs[0].data().balance - totalExpenses) * 0.8);
        setDividends(dividendsAccount.docs[0].data().balance);
      } catch (error) {
        console.error(error.message);
      }
    };

    fetchRetainedEarnings();
  }, []);


  const afterIncome = parseFloat(retainedEarnings + income);
  const earnings = parseFloat(afterIncome - dividends);


  return (
    <div className="wrapper">
      <CustomCalendar />
      {ReportToolSuite("Retained Earnings Statement")}
        <div className="balance-sheet-content">
          <h2>Retained Earnings Statement</h2>
          <table>
            <tbody>
              <tr>
                <th>Retained earnings</th>
                <td>${retainedEarnings}</td>
              </tr>
              <tr>
                <th>Net income</th>
                <td>${income}</td>
              </tr>
              <tr className="total-row">
                <td></td>
                <td>${afterIncome}</td>
              </tr>
              <tr>
                <th>Dividends</th>
                <td>${dividends}</td>
              </tr>
              <tr className="total-row">
                <td></td>
                <td>${earnings}</td>
              </tr>
            </tbody>
          </table>
        </div>
    </div>
  );
};

export default RetainedEarnings;
