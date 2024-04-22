import React, { useEffect, useState } from "react";
import { db } from "../../firebase-config";
import { collection, getDocs } from "firebase/firestore";
import CustomCalendar from "../layouts/CustomCalendar";
import ReportToolSuite from "./ReportToolSuite";

const BalanceSheet = () => {
  const [assets, setAssets] = useState([]);
  const [liabilities, setLiabilities] = useState([]);
  const [equities, setEquities] = useState([]);
  const [isBalanced, setIsBalanced] = useState(false);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const accountsSnapshot = await getDocs(collection(db, "accounts"));
        const assetAccounts = [];
        const liabilityAccounts = [];
        const equityAccounts = [];

        accountsSnapshot.forEach((doc) => {
          const account = doc.data();
          if (account.accountCategory === "assets") {
            assetAccounts.push(account);
          } else if (account.accountCategory === "liabilities") {
            liabilityAccounts.push(account);
          } else if (account.accountCategory === "equity") {
            equityAccounts.push(account);
          }
        });

        setAssets(assetAccounts);
        setLiabilities(liabilityAccounts);
        setEquities(equityAccounts);
      } catch (error) {
        console.error("Error fetching accounts:", error);
      }
    };

    fetchAccounts();
  }, []);

  useEffect(() => {
    const totalAssets = calculateTotal(assets);
    const totalLiabilities = calculateTotal(liabilities);
    const totalEquity = calculateTotal(equities);
    setIsBalanced(totalAssets === totalLiabilities + totalEquity);
  }, [assets, liabilities, equities]);

  const calculateTotal = (accounts) => {
    return accounts.reduce(
      (total, account) => total + parseFloat(account.balance || 0),
      0
    );
  };

  const assetsTotal = calculateTotal(assets);
  const liabilitiesTotal = calculateTotal(liabilities);
  const equityTotal = calculateTotal(equities);
  const liabilitiesPlusEquity = liabilitiesTotal + equityTotal;

  return (
    <div className="wrapper">
      <CustomCalendar />
      <div className="balance-sheet-container">
        <div className="balance-sheet-content">
          <h2>Balance Sheet</h2>
          <p className={isBalanced ? "success" : "error"}>
            {isBalanced
              ? "Balanced"
              : "Not Balanced"}
          </p>
          <table>
            <thead>
              <tr>
                <th>Account Name</th>
                <th>Amount ($)</th>
              </tr>
            </thead>
            <tbody>
              {/* Render Asset Accounts */}
              {assets
                .sort((a, b) => a.accountNumber - b.accountNumber)
                .map((asset) => (
                  <tr key={asset.accountID}>
                    <td>{asset.accountName}</td>
                    <td>${parseFloat(asset.balance).toLocaleString()}</td>
                  </tr>
                ))}
              {/* Total Assets Row */}
              <tr className="total-row">
                <td>Total Assets</td>
                <td>${assetsTotal.toLocaleString()}</td>
              </tr>
              {/* Render Liability Accounts */}
              {liabilities
                .sort((a, b) => a.accountNumber - b.accountNumber)
                .map((liability) => (
                  <tr key={liability.accountID}>
                    <td>{liability.accountName}</td>
                    <td>${parseFloat(liability.balance).toLocaleString()}</td>
                  </tr>
                ))}
              <tr className="total-row">
                <td>Total Liabilities</td>
                <td>${liabilitiesTotal.toLocaleString()}</td>
              </tr>
              {/* Render Equity Accounts */}
              {equities
                .sort((a, b) => a.accountNumber - b.accountNumber)
                .map((equity) => (
                  <tr key={equity.accountID}>
                    <td>{equity.accountName}</td>
                    <td>${parseFloat(equity.balance).toLocaleString()}</td>
                  </tr>
                ))}
              {/* Total Equity Row */}
              <tr className="total-row">
                <td>Total Equity</td>
                <td>${equityTotal.toLocaleString()}</td>
              </tr>
              {/* Liabilities + Equity Row */}
              <tr className="total-row">
                <td>Total Liabilities + Total Equity</td>
                <td>${liabilitiesPlusEquity.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      {ReportToolSuite("Balance Sheet")}
    </div>
  );
};

export default BalanceSheet;
