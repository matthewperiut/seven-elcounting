import { useEffect, useState } from "react";
import { db } from "../../firebase-config";
import { collection, getDocs } from "firebase/firestore";
import CustomCalendar from "../layouts/CustomCalendar";
import ReportToolSuite from "./ReportToolSuite";

const BalanceSheet = () => {
  const [assets, setAssets] = useState([]);
  const [liabilities, setLiabilities] = useState([]);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const accountsSnapshot = await getDocs(collection(db, "accounts"));
        const assetAccounts = [];
        const liabilityAccounts = [];

        accountsSnapshot.forEach((doc) => {
          const account = doc.data();
          if (account.accountCategory === "asset") {
            assetAccounts.push(account);
          } else if (account.accountCategory === "liability") {
            liabilityAccounts.push(account);
          }
        });

        setAssets(assetAccounts);
        setLiabilities(liabilityAccounts);
      } catch (error) {
        console.error("Error fetching accounts:", error);
      }
    };

    fetchAccounts();
  }, []);

  const calculateTotal = (accounts) => {
    return accounts.reduce((total, account) => {
      return total + parseFloat(account.balance || 0);
    }, 0);
  };

  return (
    <div className="wrapper">
      <CustomCalendar />
      {ReportToolSuite("Balance Sheet")}
      <div className="balance-sheet-container">
        <div className="balance-sheet-content" id="capture">
          <h2>Balance Sheet</h2>
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Account Name</th>
                <th>Amount ($)</th>
              </tr>
            </thead>
            <tbody>
              {/* Render Asset Accounts */}
              {assets.map((asset) => (
                <tr key={asset.accountID}>
                  <td>Assets</td>
                  <td>{asset.accountName}</td>
                  <td>${parseFloat(asset.balance).toLocaleString()}</td>
                </tr>
              ))}

              {/* Total Assets Row */}
              <tr className="total-row">
                <td></td>
                <td>Total Assets</td>
                <td>${calculateTotal(assets).toLocaleString()}</td>
              </tr>

              {/* Render Liability Accounts */}
              {liabilities.map((liability) => (
                <tr key={liability.accountID}>
                  <td>Liabilities</td>
                  <td>{liability.accountName}</td>
                  <td>${parseFloat(liability.balance).toLocaleString()}</td>
                </tr>
              ))}

              {/* Total Liabilities Row */}
              <tr className="total-row">
                <td></td>
                <td>Total Liabilities</td>
                <td>${calculateTotal(liabilities).toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BalanceSheet;
