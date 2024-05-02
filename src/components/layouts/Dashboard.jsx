import { useEffect, useState } from "react";
import { Context } from "../context/UserContext";
import EmailAdminsOrManagers from "../tools/EmailAdminsOrManagers";
import CustomCalendar from "../tools/CustomCalendar";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase-config";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const Dashboard = () => {
  const { user } = Context(); // pull user context
  const [pendingEntries, setpendingEntries] = useState(0);
  const [currentLiabilitiesTotal, setCurrentLiabilitiesTotal] = useState(0);
  const [currentAssetsTotal, setCurrentAssetsTotal] = useState(0);
  const [income, setIncome] = useState(0);
  const [sales, setSales] = useState(0);
  const [liquidityRatio, setLiquidityRatio] = useState(undefined);
  const [profitRatio, setProfitRatio] = useState(undefined);

  const fetch = async () => {
    //gets pending journal entries
    const pendingSnapshot = await getDocs(
      query(
        collection(db, "journalEntries"),
        where("isApproved", "==", false),
        where("isRejected", "==", false)
      )
    );

    //gets all current liability accounts
    const currentLiabilitiesSnapshot = await getDocs(
      query(
        collection(db, "accounts"),
        where("accountSubcategory", "==", "current liabilities")
      )
    );

    //calculates current liabilities total value
    const currentLiabilitiesTotal = currentLiabilitiesSnapshot.docs.reduce(
      (total, doc) => total + doc.data().balance,
      0
    );

    //gets all current asset accounts
    const currentAssetsSnapshot = await getDocs(
      query(
        collection(db, "accounts"),
        where("accountSubcategory", "==", "current assets")
      )
    );
    //calculates current assets total value
    const currentAssetsTotal = currentAssetsSnapshot.docs.reduce(
      (total, doc) => total + doc.data().balance,
      0
    );

    //gets all revenue accounts
    const revenues = await getDocs(
      query(
        collection(db, "accounts"),
        where("accountCategory", "==", "revenues")
      )
    );

    //gets all expense accounts
    const expenses = await getDocs(
      query(
        collection(db, "accounts"),
        where("accountCategory", "==", "expenses")
      )
    );

    //sums expenses and revenues for financial ratios
    let totalExpenses = 0;
    expenses.forEach((doc) => {
      totalExpenses += doc.data().balance;
    });
    let totalRevenues = 0;
    revenues.forEach((doc) => {
      totalRevenues += doc.data().balance;
    });

    setIncome((totalRevenues - totalExpenses) * 0.8); //calculates income
    setSales(totalRevenues);
    setpendingEntries(pendingSnapshot.size);
    setCurrentAssetsTotal(currentAssetsTotal);
    setCurrentLiabilitiesTotal(currentLiabilitiesTotal);
  };

  useEffect(() => {
    const currentRatio = currentAssetsTotal / currentLiabilitiesTotal; //calculates current ratio(Current Assets / Current Liabilities)

    //sets color of dashboard based off normal ranges of current ratio
    if (currentRatio >= 1.5) setLiquidityRatio(1);
    else if (currentRatio < 1.5 && currentRatio >= 1) setLiquidityRatio(2);
    else if (currentRatio < 1) setLiquidityRatio(3);

    const profitMargin = parseFloat(income / sales); //calculates profit margin(Net Income / Net Sales)

    //sets color of dashboard based off normal ranges of profit margin
    if (profitMargin >= 0.1) setProfitRatio(1);
    else if (profitMargin >= 0.05 && profitMargin < 0.1) setProfitRatio(2);
    else setProfitRatio(3);
  }, [income, sales, currentAssetsTotal, currentLiabilitiesTotal]);

  useEffect(() => {
    fetch(); //fetches all accounts related to financial ratios
  }, []);

  //data for current ratio bar chart
  const ratioData = [
    { name: "Current Assets", value: currentAssetsTotal.toFixed(2) },
    { name: "Current Liabilities", value: currentLiabilitiesTotal.toFixed(2) },
  ];

  //data for profit margin bar chart
  const profitData = [
    { name: "Net Income", value: income.toFixed(2) },
    { name: "Net Sales", value: sales.toFixed(2) },
  ];

  const formatYAxis = (tickItem) => `$${tickItem}`; //adds $ sign to y axis labels

  return (
    <div className="wrapper">
      <CustomCalendar />
      {user.role === 3 ? (
        <h1>Administrator {user && user.displayName}</h1>
      ) : user.role === 2 ? (
        <h1>Manager {user && user.displayName}</h1>
      ) : user.role === 1 ? (
        <h1>Welcome, accountant {user && user.displayName}</h1>
      ) : (
        <p>
          You do not have access to the system yet, please wait for
          administrator approval.
        </p>
      )}
      {user.role > 1 && pendingEntries > 0 && (
        <p>
          there {pendingEntries === 1 ? "is" : "are"} {pendingEntries} journal{" "}
          {pendingEntries === 1 ? "entry" : "entries"} pending for approval...
        </p>
      )}

      <div className="dashboard">
        <div
          className={`dashboard-box ${
            liquidityRatio === 1
              ? "good-ratio"
              : liquidityRatio === 2
              ? "warning-ratio"
              : "bad-ratio"
          }`}
        >
          <h1>Liquidity Dashboard</h1>
          <p
            className={
              liquidityRatio === 1
                ? "success"
                : liquidityRatio === 2
                ? "warning"
                : "error"
            }
          >
            Current Ratio:{" "}
            {(currentAssetsTotal / currentLiabilitiesTotal).toFixed(2)}
          </p>
          <div className="dashboard-chart">
            <ResponsiveContainer>
              <BarChart data={ratioData}>
                <XAxis dataKey="name" />
                <YAxis tickFormatter={formatYAxis} />
                <Tooltip />
                <Bar
                  dataKey="value"
                  fill={
                    liquidityRatio === 1
                      ? "#0fbe17"
                      : liquidityRatio === 2
                      ? "#f1ee0b"
                      : "#dc3545"
                  }
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div
          className={`dashboard-box ${
            profitRatio === 1
              ? "good-ratio"
              : profitRatio === 2
              ? "warning-ratio"
              : "bad-ratio"
          }`}
        >
          <h1>Profitability Dashboard</h1>
          <p
            className={
              profitRatio === 1
                ? "success"
                : profitRatio === 2
                ? "warning"
                : "error"
            }
          >
            Profit Margin: {(income / sales).toFixed(2)}
          </p>
          <div className="dashboard-chart">
            <ResponsiveContainer>
              <BarChart data={profitData}>
                <XAxis dataKey="name" />
                <YAxis tickFormatter={formatYAxis} />
                <Tooltip />
                <Bar
                  dataKey="value"
                  fill={
                    profitRatio === 1
                      ? "#0fbe17"
                      : profitRatio === 2
                      ? "#f1ee0b"
                      : "#dc3545"
                  }
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      {user.role < 2 && <EmailAdminsOrManagers />}
    </div>
  );
};

export default Dashboard;
