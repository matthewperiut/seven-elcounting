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
      <div id="capture">
        <h1>Balance Sheet</h1>
        <p className={isBalanced ? "success" : "error"}>
          {isBalanced ? "Balanced" : "Not Balanced"}
        </p>
        <table className="statement-table">
          <thead>
            <tr>
              <th>Account Name</th>
              <th>Amount ($)</th>
            </tr>
          </thead>
          <tbody>
            <tr className="statement-category">
              <td>Assets</td>
              <td></td>
            </tr>
            {assets
              .sort((a, b) => a.accountNumber - b.accountNumber)
              .map((asset) => (
                <tr key={asset.accountID}>
                  <td>{asset.accountName}</td>
                  <td>${parseFloat(asset.balance).toLocaleString()}</td>
                </tr>
              ))}
            <tr className="statement-total">
              <td>Total Assets</td>
              <td>${assetsTotal.toLocaleString()}</td>
            </tr>
            <tr className="statement-category">
              <td>Liabilities</td>
              <td></td>
            </tr>
            {liabilities
              .sort((a, b) => a.accountNumber - b.accountNumber)
              .map((liability) => (
                <tr key={liability.accountID}>
                  <td>{liability.accountName}</td>
                  <td>${parseFloat(liability.balance).toLocaleString()}</td>
                </tr>
              ))}
            <tr className="statement-total">
              <td>Total Liabilities</td>
              <td>${liabilitiesTotal.toLocaleString()}</td>
            </tr>
            <tr className="statement-category">
              <td>Stockholder's Equity</td>
              <td></td>
            </tr>
            {equities
              .sort((a, b) => a.accountNumber - b.accountNumber)
              .map((equity) => (
                <tr key={equity.accountID}>
                  <td>{equity.accountName}</td>
                  <td>${parseFloat(equity.balance).toLocaleString()}</td>
                </tr>
              ))}
            <tr className="statement-total">
              <td>Total Equity</td>
              <td>${equityTotal.toLocaleString()}</td>
            </tr>
            <tr className="statement-total">
              <td>Total Liabilities + Total Equity</td>
              <td>${liabilitiesPlusEquity.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>
      {ReportToolSuite("Balance Sheet")}
    </div>
  );
};

export default BalanceSheet;
