import { useEffect, useState } from "react";
import ReportToolSuite from "../tools/ReportToolSuite";
import formatNumber from "../tools/formatNumber";
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
        const expenses = await getDocs(
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
        expenses.forEach((doc) => {
          totalExpenses += doc.data().balance;
        });
        setIncome(
          (salesRevenueAccount.docs[0].data().balance - totalExpenses) * 0.8
        );
        setDividends(dividendsAccount.docs[0].data().balance);
      } catch (error) {
        console.error(error.message);
      }
    };

    fetchRetainedEarnings();
  }, []);

  return (
    <div className="wrapper">
      <CustomCalendar />
      <div id="capture">
        <h1>Retained Earnings Statement</h1>
        <table className="statement-table">
          <tbody>
            <tr>
              <td>Retained earnings</td>
              <td>{formatNumber(parseFloat(retainedEarnings))}</td>
            </tr>
            <tr>
              <td>Net income</td>
              <td>{formatNumber(parseFloat(income))}</td>
            </tr>
            <tr className="statement-total">
              <td></td>
              <td>{formatNumber(retainedEarnings + income)}</td>
            </tr>
            <tr>
              <td>Dividends</td>
              <td>{formatNumber(parseFloat(dividends))}</td>
            </tr>
            <tr className="statement-total">
              <td></td>
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
