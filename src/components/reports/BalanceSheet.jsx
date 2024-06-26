import React, { useEffect, useState } from "react";
import { db } from "../../firebase-config";
import { collection, getDocs, query, where } from "firebase/firestore";
import CustomCalendar from "../tools/CustomCalendar";
import ReportToolSuite from "../tools/ReportToolSuite";
import formatNumber from "../tools/formatNumber";
import Help from "../layouts/Help";
import QueryAccountsInDateRange from "../tools/QueryAccountsInDateRange";

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
  const [accounts, setAccounts] = useState(null);

  useEffect(() => {
    const fetchAccounts = async () => {
      if (dates != null) {
        try {
          //queries accounts in particular date range
          const accountsTemp = await QueryAccountsInDateRange(
            accounts,
            dates[0],
            dates[1]
          );

          const assetAccounts = []; //array to hold all asset accounts
          const liabilityAccounts = []; //array to hold all liability accounts
          const equityAccounts = []; //array to hold all equity accounts
          accountsTemp.forEach((account) => {
            if (account.isActivated === true) {
              //pushes asset accounts into array
              if (account.accountCategory === "assets") {
                assetAccounts.push(account);
              }
              //pushes liability accounts into array
              if (account.accountCategory === "liabilities") {
                liabilityAccounts.push(account);
              }
              //pushes equity accounts into array
              if (account.accountCategory === "equity") {
                equityAccounts.push(account);
              }
            }
          });

          setAssets(assetAccounts);
          setLiabilities(liabilityAccounts);
          setEquities(equityAccounts);
        } catch (error) {
          console.error("Error fetching accounts:", error);
        }
      } else {
        try {
          if (!accounts) {
            const querySnapshot = await getDocs(
              query(
                collection(db, "accounts"),
                where("isActivated", "==", true)
              )
            ); //grabs all active accounts
            let accountsTemp = [];
            const assetAccounts = [];
            const liabilityAccounts = [];
            const equityAccounts = [];

            querySnapshot.forEach((doc) => {
              const account = doc.data();
              accountsTemp.push(account);
            });

            setAccounts(accountsTemp);

            accountsTemp.forEach((account) => {
              if (account.isActivated === true) {
                //pushes assets accounts into array
                if (account.accountCategory === "assets") {
                  assetAccounts.push(account);
                  //pushes liabilities accounts into array
                } else if (account.accountCategory === "liabilities") {
                  liabilityAccounts.push(account);
                  //pushes equity accounts into array
                } else if (account.accountCategory === "equity") {
                  equityAccounts.push(account);
                }
              }
            });

            setAssets(assetAccounts);
            setLiabilities(liabilityAccounts);
            setEquities(equityAccounts);
          }
        } catch (error) {
          console.error("Error fetching accounts:", error);
        }
      }
    };
    fetchAccounts();
  }, [dates]);

  //recalculates total balances each time component renders
  useEffect(() => {
    const totalAssets = calculateTotal(assets);
    const totalLiabilities = calculateTotal(liabilities);
    const totalEquity = calculateTotal(equities);
    setIsBalanced(totalAssets === totalLiabilities + totalEquity);
  }, [assets, liabilities, equities]);

  //function to calculate account totals
  const calculateTotal = (accounts) => {
    return accounts.reduce((total, account) => total + account.balance, 0);
  };

  const assetsTotal = calculateTotal(assets); //calculates assets total
  const liabilitiesTotal = calculateTotal(liabilities); //calculates liabilities total
  const equityTotal = calculateTotal(equities); //calculates equities total
  const liabilitiesPlusEquity = liabilitiesTotal + equityTotal; //calculates total liabilities plus total equity

  //sets selected dates from calendar
  function selectDate(date) {
    try {
      const date2 = new Date("2023-12-17T03:24:00");
      date.setHours(23, 59, 0, 0);
      setDates([date2, date]);
    } catch (e) {
      setDates(null);
    }
  }

  return (
    <div className="wrapper">
      <CustomCalendar handleDateSelection={selectDate} isRange={false} />
      <Help componentName="BalanceSheet" />
      <div id="capture">
        <h1>Balance Sheet</h1>
        {!dates ? (
          ""
        ) : (
          <div>
            <p>On {formatDate(dates[1])}</p>
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
