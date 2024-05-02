import {doc, getDoc, setDoc, updateDoc} from "firebase/firestore";
import {db} from "../../firebase-config.js";
import {reportError} from "./ErrorLogController.jsx";

async function genEventUID() {
  // generate uid
  const counterRef = doc(db, "eventLog", "idCounter");
  const docSnap = await getDoc(counterRef);

  if (docSnap.exists()) {
    let uniqueId = docSnap.data().count;
      await updateDoc(counterRef, {
        count: uniqueId + 1
      });
    return uniqueId;
  } else {
    console.error("Counter document does not exist.");
      await reportError("Counter document does not exist.");
    return -1;
  }
}

export async function logEvent(type, before, after, user) {
  if (!(type === "account" || type === "user" || type === "journal")) return;

  let uniqueId = await genEventUID();
  if (uniqueId < 0) return;

  // Generate the difference array
  const differences = Object.keys(before).reduce((acc, key) => {
    if (before[key] !== after[key]) {
      acc.push(`${key} changed from ${before[key]} to ${after[key]}`);
      }
    return acc;
  }, []);

  // Create a new event document with the generated unique ID
  const docEvent = doc(db, "eventLog", `${uniqueId}`);
    await setDoc(docEvent, {
      type: type,
      diff: differences.length > 0 ? differences : ["No changes detected"],
      before: before,
      after: after,
      author: user ? user.displayName : "Unknown",
      timestamp: new Date()
    }
  );
}

export async function logEventCreation(type, accountName, account, user) {
    if (!(type === "account" || type === "user" || type === "journal")) return;
    let uniqueId = await genEventUID();
    if (uniqueId < 0) return;
    const docEvent = doc(db, "eventLog", `${uniqueId}`);
    await setDoc(docEvent, {
        type: type,
        diff: ["Created " + type + ", " + accountName],
        before: {},
        after: account,
        author: user ? user.displayName : "Unknown",
        timestamp: new Date()
    });
}

export async function logEventDeactivation(type, accountName, account, user) {
  if (!(type === "account" || type === "user")) return;
  let uniqueId = await genEventUID();
  if (uniqueId < 0) return;
  const beforeAccount = { ...account, isActivated: true };
  const docEvent = doc(db, "eventLog", `${uniqueId}`);
  await setDoc(docEvent, {
    type: type,
    diff: ["Deactivated " + type + ", " + accountName],
    before: beforeAccount,
    after: account,
    author: user ? user.displayName : "Unknown",
    timestamp: new Date()
  });
}

// lazy to do this right
export async function logEventActivation(type, accountName, account, user) {
  if (!(type === "account" || type === "user")) return;
  let uniqueId = await genEventUID();
  if (uniqueId < 0) return;
  const beforeAccount = { ...account, isActivated: false };
  const docEvent = doc(db, "eventLog", `${uniqueId}`);
  await setDoc(docEvent, {
    type: type,
    diff: ["Activated " + type + ", " + accountName],
    before: beforeAccount,
    after: account,
    author: user ? user.displayName : "Unknown",
    timestamp: new Date()
  });
}

export async function logEventNewJournalEntry(type, accountName, amount, account, user) {
  if (!(type === "account")) return;
  let uniqueId = await genEventUID();
  if (uniqueId < 0) return;
  const beforeAccount = { ...account, isActivated: false };
  const docEvent = doc(db, "eventLog", `${uniqueId}`);
  await setDoc(docEvent, {
    type: type,
    diff: ["Journal Entry for " + accountName + " adding " + amount],
    before: beforeAccount,
    after: account,
    author: user ? user.displayName : "Unknown",
    timestamp: new Date()
  });
}