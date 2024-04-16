import React, { useEffect, useState } from "react";
import { db } from "../../firebase-config";
import { collection, getDocs } from "firebase/firestore";
import ShareReport from "./ShareReport";
import CustomCalendar from "../layouts/CustomCalendar";

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
          if (account.accountCategory === "assets") {
            assetAccounts.push(account);
          } else if (account.accountCategory === "liabilities") {
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

  useEffect(() => {
    const totalAssets = calculateTotal(assets);
    const totalLiabilities = calculateTotal(liabilities);
    console.log("Total Assets:", totalAssets);
    console.log("Total Liabilities:", totalLiabilities);
  }, [assets, liabilities]);

  return (
    <div className="wrapper">
      <CustomCalendar />
      {ShareReport("Balance Sheet")}
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

            {/* Render Liability Accounts */}
            {liabilities.map((liability) => (
              <tr key={liability.accountID}>
                <td>Liabilities</td>
                <td>{liability.accountName}</td>
                <td>${parseFloat(liability.balance).toLocaleString()}</td>
              </tr>
            ))}

            {/* Total Assets Row */}
            <tr className="total-row">
              <td></td>
              <td>Total Assets</td>
              <td>${calculateTotal(assets).toLocaleString()}</td>
            </tr>

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
