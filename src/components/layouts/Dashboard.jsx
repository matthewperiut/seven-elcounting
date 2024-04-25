import { useEffect, useState } from "react";
import { Context } from "../context/UserContext";
import EmailAdminsOrManagers from "../tools/EmailAdminsOrManagers";
import CustomCalendar from "../tools/CustomCalendar";
import Help from "./Help";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase-config";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";


const Dashboard = () => {
  const { user } = Context(); // pull user context
  const [pendingEntries, setpendingEntries] = useState(0);
  const [currentLiabilities, setCurrentLiabilities] = useState(0);
  const [currentAssets, setCurrentAssets] = useState(0);
  const [ratio, setRatio] = useState({green: false, red: false});



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

    setpendingEntries(pendingSnapshot.size);
    setCurrentAssets(currentAssetsTotal);
    setCurrentLiabilities(currentLiabilitiesTotal);

    const currentRatio = currentAssetsTotal / currentLiabilitiesTotal;
    if ((currentRatio) >= 1.5) setRatio({ green: true, red: false });
    else if ((currentRatio) < 1.5 && (currentRatio) > 1) setRatio({ green: false, red: false });
    else if ((currentRatio) < 1) setRatio({ green: false, red: true });
  }

  useEffect(() => {
    fetch();
  }, []);

  const data = [
    { name: "Current Assets", value: currentAssets },
    { name: "Current Liabilities", value: currentLiabilities }
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
          there {pendingEntries === 1 ? "is" : "are"} {pendingEntries} pending
          journal {pendingEntries === 1 ? "entry" : "entries"}...
        </p>
      )}

      <h1>Dashboard</h1>
      <div className={ratio.green ? "success" : ratio.red ? "error" : "needs closer look"}>
        Current Ratio: {currentAssets / currentLiabilities}
      </div>
      <div style={{ width: '100%', height: 200 }}>
        <ResponsiveContainer>
          <BarChart data={data}>
            <XAxis dataKey="name" />
            <YAxis tickFormatter={formatYAxis} />
            <Tooltip />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>        
      </div>
      <EmailAdminsOrManagers />
    </div>
  );
};

export default Dashboard;
