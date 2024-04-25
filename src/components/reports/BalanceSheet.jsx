import React, { useEffect, useState } from "react";
import { db } from "../../firebase-config";
import { collection, getDocs, getDoc, doc, query, where } from "firebase/firestore";
import CustomCalendar from "../tools/CustomCalendar";
import ReportToolSuite from "../tools/ReportToolSuite";
import formatNumber from "../tools/formatNumber";
import Help from "../layouts/Help";

function formatDate(date) {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
}

const BalanceSheet = () => {
  const [assets, setAssets] = useState([]);
  const [liabilities, setLiabilities] = useState([]);
  const [equities, setEquities] = useState([]);
  const [isBalanced, setIsBalanced] = useState(false);
  const [dates, setDates] = useState(null);

  useEffect(() => {
    const fetchAccounts = async() => {
        if (dates != null) {
          let relevantEntries = [];
          try {
            const journalEntries = await getDocs(
              query(
                collection(db, "journalEntries"),
                where("dateCreated", ">=", dates[0]),
                where("dateCreated", "<=", dates[1])
              )
            );

            journalEntries.forEach(doc => {
              const data = doc.data();
              for (let i = 0; i < data.entries.length; i++) {
                relevantEntries.push(data.entries[i]);
              }
            });

            // Here we go, create accounts, start with bal 0 if not existing, add or subtract
            let accounts = [];
            for (let i = 0; i < relevantEntries.length; i++) {
              let currentEntry = relevantEntries[i];
              let foundAccount = null;
              let foundAccIndex = -1;
              for (let j = 0; j < accounts.length; j++) {
                if (currentEntry.account === accounts[j].accountName) {
                  foundAccount = accounts[j].accountName
                  foundAccIndex = j;
                }
              }
              if (!foundAccount) {
                const accDocRef = doc(db, "accounts", currentEntry.accountID);
                const docSnap = await getDoc(accDocRef);
                if (docSnap.exists()) {
                  let accData = docSnap.data();
                  accData.balance = 0;
                  foundAccIndex = accounts.length;
                  accounts.push(accData);
                } else {
                  console.warn( currentEntry.accountName + " DNE???");
                }
              }

              let addition = currentEntry.type === accounts[foundAccIndex].normalSide;
              let new_bal = 0;
              if (addition) {
                new_bal =
                accounts[foundAccIndex].balance + parseFloat(currentEntry.amount);
              } else {
                new_bal =
                  accounts[foundAccIndex].balance - parseFloat(currentEntry.amount);
              }
              accounts[foundAccIndex].balance = new_bal;
            }
            console.log(accounts);

            const assetAccounts = [];
            const liabilityAccounts = [];
            const equityAccounts = [];
            accounts.forEach((account) => {
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

          }
          catch (error) {
            console.error("Error fetching accounts:", error);
          }
          
        } else {
          try {
            const snapshot = await getDocs(collection(db, "accounts"));
            const assetAccounts = [];
            const liabilityAccounts = [];
            const equityAccounts = [];
  
            snapshot.forEach((doc) => {
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
        }
      }
        fetchAccounts();  
  }, [dates]);

  useEffect(() => {
    const totalAssets = calculateTotal(assets);
    const totalLiabilities = calculateTotal(liabilities);
    const totalEquity = calculateTotal(equities);
    setIsBalanced(totalAssets === totalLiabilities + totalEquity);
  }, [assets, liabilities, equities]);

  const calculateTotal = (accounts) => {
    return accounts.reduce((total, account) => total + account.balance, 0);
  };

  const assetsTotal = calculateTotal(assets);
  const liabilitiesTotal = calculateTotal(liabilities);
  const equityTotal = calculateTotal(equities);
  const liabilitiesPlusEquity = liabilitiesTotal + equityTotal;

  function selectDate(dates) {
    setDates(dates);
  }

  return (
    <div className="wrapper">
      <CustomCalendar handleDateSelection={selectDate}/>
      <Help componentName="BalanceSheet" />
      <div id="capture">
        <h1>Balance Sheet</h1>
        {!dates ? "" : (
          <div>
            <p>From {formatDate(dates[0])} to {formatDate(dates[1])}</p>
          </div>
        )}
        <p className={isBalanced ? "success" : "error"}>
          {isBalanced ? "Balanced" : "Not Balanced"}
        </p>
        <table className="statement-table">
          <thead>
            <tr>
              <th>Account Name</th>
              <th>Amount</th>
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
                  <td>{formatNumber(asset.balance)}</td>
                </tr>
              ))}
            <tr className="statement-total">
              <td>Total Assets</td>
              <td>{formatNumber(assetsTotal)}</td>
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
                  <td>{formatNumber(liability.balance)}</td>
                </tr>
              ))}
            <tr className="statement-total">
              <td>Total Liabilities</td>
              <td>{formatNumber(liabilitiesTotal)}</td>
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
                  <td>{formatNumber(equity.balance)}</td>
                </tr>
              ))}
            <tr className="statement-total">
              <td>Total Equity</td>
              <td>{formatNumber(equityTotal)}</td>
            </tr>
            <tr className="statement-total">
              <td>Total Liabilities + Total Equity</td>
              <td>{formatNumber(liabilitiesPlusEquity)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      {ReportToolSuite("Balance Sheet")}
    </div>
  );
};

export default BalanceSheet;
