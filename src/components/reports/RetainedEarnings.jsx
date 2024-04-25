import { useEffect, useState } from "react";
import ReportToolSuite from "../tools/ReportToolSuite";
import formatNumber from "../tools/formatNumber";
import CustomCalendar from "../tools/CustomCalendar";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase-config";
import Help from "../layouts/Help";

function formatDate(date) {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
}

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
        const revenues = await getDocs(
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
        let totalRevenues = 0;
        revenues.forEach((doc) => {
          totalRevenues += doc.data().balance;
        });
        setIncome((totalRevenues - totalExpenses) * 0.8);
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
      <Help componentName="RetainedEarnings" />
      <div id="capture">
        <h1>Retained Earnings Statement</h1>
        <table className="statement-table">
          <tbody>
            <tr>
              
              {/* PUT START DATE HERE */}
              <td>Retained earnings as of {formatDate(new Date())}</td>
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

              {/* PUT END DATE HERE */}
              <td>Retained earnings as of {formatDate(new Date())}</td>
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
