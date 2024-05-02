import { db } from "../../firebase-config";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  query,
  where,
} from "firebase/firestore";

const QueryAccountsInDateRange = async (accounts, start_date, end_date) => {
  let relevantEntries = [];
  const journalEntries = await getDocs(
    query(
      collection(db, "journalEntries"),
      where("isApproved", "==", true),
      where("dateCreated", ">=", start_date),
      where("dateCreated", "<=", end_date)
    )
  );

  journalEntries.forEach((doc) => {
    const data = doc.data();
    for (let i = 0; i < data.entries.length; i++) {
      relevantEntries.push(data.entries[i]);
    }
  });

  //Here we go, create accounts, start with bal 0 if not existing, add or subtract
  let accountsTemp = accounts;
  accountsTemp.forEach((account) => {
    account.balance = 0;
  });

  for (let i = 0; i < relevantEntries.length; i++) {
    let currentEntry = relevantEntries[i];
    let foundAccount = null;
    let foundAccIndex = -1;
    for (let j = 0; j < accountsTemp.length; j++) {
      if (currentEntry.account === accountsTemp[j].accountName) {
        foundAccount = accountsTemp[j].accountName;
        foundAccIndex = j;
      }
    }

    let addition = currentEntry.type === accounts[foundAccIndex].normalSide;
    let new_bal = 0;
    if (addition) {
      new_bal =
        accountsTemp[foundAccIndex].balance + parseFloat(currentEntry.amount);
    } else {
      new_bal =
        accountsTemp[foundAccIndex].balance - parseFloat(currentEntry.amount);
    }
    accountsTemp[foundAccIndex].balance = new_bal;
  }

  return accountsTemp;
};

export default QueryAccountsInDateRange;
