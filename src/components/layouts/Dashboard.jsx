import { useEffect, useState } from "react";
import { Context } from "../context/UserContext";
import EmailAdminsOrManagers from "../tools/EmailAdminsOrManagers";
import CustomCalendar from "../tools/CustomCalendar";
import Help from "./Help";
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
  const [liquidityRatio, setLiquidityRatio] = useState(1);
  const [profitRatio, setProfitRatio] = useState(1);

  const fetch = async () => {
    const pendingSnapshot = await getDocs(
      query(
        collection(db, "journalEntries"),
        where("isApproved", "==", false),
        where("isRejected", "==", false)
      )
    );

    const currentLiabilitiesSnapshot = await getDocs(
      query(
        collection(db, "accounts"),
        where("accountSubcategory", "==", "current liabilities")
      )
    );
    const currentLiabilitiesTotal = currentLiabilitiesSnapshot.docs.reduce(
      (total, doc) => total + doc.data().balance,
      0
    );

    const currentAssetsSnapshot = await getDocs(
      query(
        collection(db, "accounts"),
        where("accountSubcategory", "==", "current assets")
      )
    );
    const currentAssetsTotal = currentAssetsSnapshot.docs.reduce(
      (total, doc) => total + doc.data().balance,
      0
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

    let totalExpenses = 0;
    expenses.forEach((doc) => {
      totalExpenses += doc.data().balance;
    });
    setIncome(
      (salesRevenueAccount.docs[0].data().balance - totalExpenses) * 0.8
    );
    setSales(salesRevenueAccount.docs[0].data().balance);
    setpendingEntries(pendingSnapshot.size);
    setCurrentAssetsTotal(currentAssetsTotal);
    setCurrentLiabilitiesTotal(currentLiabilitiesTotal);

    const currentRatio = currentAssetsTotal / currentLiabilitiesTotal;
    if (currentRatio >= 1.5) setLiquidityRatio(1);
    else if (currentRatio < 1.5 && currentRatio > 1) setLiquidityRatio(2);
    else if (currentRatio < 1) setLiquidityRatio(3);

    const profitMargin = income / sales;
    if (profitMargin > 0.1) setProfitRatio(1);
    else if (profitMargin < 0.1 && profitMargin >= 0.05) setProfitRatio(2);
    else if (profitMargin < 0.05) setProfitRatio(3);
  };

  useEffect(() => {
    fetch();
  }, []);

  const liquidityData = [
    { name: "Current Assets", value: currentAssetsTotal },
    { name: "Current Liabilities", value: currentLiabilitiesTotal },
  ];
  const profitData = [
    { name: "Net Income", value: income },
    { name: "Net Sales", value: sales },
  ];
  const formatYAxis = (tickItem) => `$${tickItem}`;

  return (
    <div className="wrapper">
      <CustomCalendar />
      <Help />
      {user.role === 3 ? (
        <p>Administrator {user && user.displayName}</p>
      ) : user.role === 2 ? (
        <p>Manager {user && user.displayName}</p>
      ) : user.role === 1 ? (
        <p>Welcome, accountant {user && user.displayName}</p>
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
            Current Ratio: {currentAssetsTotal / currentLiabilitiesTotal}
          </p>
          <div className="dashboard-chart">
            <ResponsiveContainer>
              <BarChart data={liquidityData}>
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
            Profit Margin: {income / sales}
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
