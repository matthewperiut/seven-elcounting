import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import CurrencyInput from "react-currency-input-field";
import { db } from "../../firebase-config";
import { Context } from "../context/UserContext";
import { reportError } from "../events/ErrorLogController";
import CustomCalendar from "../layouts/CustomCalendar";
import Help from "../layouts/Help";

const Journalizing = ({ adjustingEntry, update }) => {
  const { user } = Context(); //pull user context for user ID
  const [accounts, setAccounts] = useState([]); //array to hold all active accounts
  const [debitsList, setDebitsList] = useState([{ account: "", amount: "", postRef: "" }]); //array of objects for creating new inputs and storing account, amount, and postRef info
  const [creditsList, setCreditsList] = useState([{ account: "", amount: "", postRef: "" }]);
  const [errorMessage, setErrorMessage] = useState(""); //state for error handling and messages
  const [status, setStatus] = useState({
    success: false,
    submit: false,
    reset: false,
  }); //state to display success message, show confirm and cancel buttons, and handle entry reset

  const fetchAllAccounts = async () => {
    //gets snapshot of all active accounts
    const querySnapshot = await getDocs(
      query(collection(db, "accounts"), where("isActivated", "==", true))
    );

    //maps data into fetchedAccounts array
    const fetchedAccounts = querySnapshot.docs.map((doc) => ({
      ...doc.data(),
    }));
    setAccounts(fetchedAccounts); //sets accounts state with fetchedAccounts
  };

  useEffect(() => {
    if (adjustingEntry) {
      setDebitsList(
        adjustingEntry.entries
          .filter((entry) => entry.type === "debit")
          .map((entry) => ({ account: entry.account, amount: entry.amount, postRef: entry.postRef }))
      );
      setCreditsList(
        adjustingEntry.entries
          .filter((entry) => entry.type === "credit")
          .map((entry) => ({ account: entry.account, amount: entry.amount, postRef: entry.postRef }))
      );
    }
    fetchAllAccounts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    let error = false;
    let debitTotal = 0;
    let creditTotal = 0;
    setStatus((prev) => ({ ...prev, success: false }));
    setErrorMessage("");
  
    try {
      const entry = {
        user: user.displayName,
        isApproved: user.role > 1 ? true : false,
        isRejected: false,
        dateCreated: new Date(),
        comment: "",
        entries: [],
      };
  
      // Function to generate a random 3-digit number
      const generateRandomThreeDigits = () => {
        return Math.floor(100 + Math.random() * 900);
      };
  
      debitsList.forEach((debit, index) => {
        if (!debit.account || !debit.amount) {
          setErrorMessage("Must enter both an account and an amount for each debit entry!");
          error = true;
          return;
        }
        const postRef = "DC" + generateRandomThreeDigits(); // Generate post reference for debit entry
        entry.entries.push({
          type: "debit",
          account: debit.account,
          amount: debit.amount,
          postRef: postRef, // Include post reference in the entry object
        });
        debitTotal += parseFloat(debit.amount);
      });
  
      if (!error) {
        creditsList.forEach((credit, index) => {
          if (!credit.account || !credit.amount) {
            setErrorMessage("Must enter both an account and an amount for each credit entry!");
            error = true;
            return;
          }
          const postRef = "CC" + generateRandomThreeDigits(); // Generate post reference for credit entry
          entry.entries.push({
            type: "credit",
            account: credit.account,
            amount: credit.amount,
            postRef: postRef, // Include post reference in the entry object
          });
          creditTotal += parseFloat(credit.amount);
        });
      }
  
      if (error) return;
  
      if (debitTotal !== creditTotal) {
        setErrorMessage("Total debits must equal total credits!");
        return;
      }
  
      if (!status.submit) {
        setStatus((prev) => ({ ...prev, submit: true }));
        return;
      }
  
      if (status.reset) {
        e.target.reset();
        setDebitsList([{ account: "", amount: "" }]);
        setCreditsList([{ account: "", amount: "" }]);
        setStatus((prev) => ({ ...prev, submit: false, reset: false }));
        return;
      }
  
      if (adjustingEntry) {
        await updateDoc(doc(db, "journalEntries", adjustingEntry.id), {
          ...entry,
          isApproved: false,
          isRejected: false,
        });
        update();
      } else await setDoc(doc(collection(db, "journalEntries")), entry);
  
      setStatus((prev) => ({ ...prev, success: true, submit: false }));
      e.target.reset();
      setDebitsList([{ account: "", amount: "" }]);
      setCreditsList([{ account: "", amount: "" }]);
    } catch (error) {
      console.log(error.message);
      reportError(error.message);
    }
  };  

  const handleDebitAdd = () => {
    setDebitsList([...debitsList, { account: "", amount: "", postRef: "" }]); //adds new empty object to array to create new account selection and input field when another entry is added
    setErrorMessage(""); //resets error message
    setStatus((prev) => ({ ...prev, success: false, submit: false })); //resets success
  };

  const handleCreditAdd = () => {
    setCreditsList([...creditsList, { account: "", amount: "", postRef: "" }]);
    setErrorMessage("");
    setStatus((prev) => ({ ...prev, success: false, submit: false }));
  };

  const handleDebitRemoval = (index) => {
    const list = [...debitsList]; //stores array in local list array
    list.splice(index, 1); //removes element at specified index
    setDebitsList(list); //sets list to new list without specified index(gets rid of whatever transaction the user selects)
  };

  const handleCreditRemoval = (index) => {
    const list = [...creditsList];
    list.splice(index, 1);
    setCreditsList(list);
  };

  const handleDebitChange = (index, field, value) => {
    const updatedEntry = [...debitsList]; //stores array in local updatedEntry array
    updatedEntry[index][field] = value; //sets the field at the specified index to the value brought in
    setDebitsList(updatedEntry); //sets list with new value
  };

  const handleCreditChange = (index, field, value) => {
    const updatedEntry = [...creditsList];
    updatedEntry[index][field] = value;
    setCreditsList(updatedEntry);
  };

  return (
    <div className="wrapper">
      {!adjustingEntry && (
        <>
          <CustomCalendar />
          <Help />
        </>
      )}
      <h1>Journalizing</h1>
      <form onSubmit={handleSubmit}>
        <div className="entry-container">
          <div className="debit-entry">
            <h2 style={{ display: "flex" }}>Debits:</h2>
            {debitsList.map((debit, index) => (
              <div key={index}>
                <select
                  value={debit.account || "Select Account"}
                  onChange={(e) =>
                    handleDebitChange(index, "account", e.target.value)
                  }
                >
                  <option disabled>Select Account</option>
                  {accounts.map((account) => (
                    <option value={account.accountName} key={account.accountID}>
                      {account.accountName}
                    </option>
                  ))}
                </select>
                <span>$</span>
                <CurrencyInput
                  value={debit.amount}
                  placeholder="Amount"
                  name="debitAmount"
                  decimalsLimit={2}
                  maxLength={12}
                  onValueChange={(value) =>
                    handleDebitChange(index, "amount", value)
                  }
                />
                <span>Post Ref: {debit.postRef}</span>
                {debitsList.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleDebitRemoval(index)}
                    className="removetransaction-button"
                  >
                    -
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={handleDebitAdd}
              className="addtransaction-button"
            >
              Add Entry
            </button>
          </div>
        </div>

        <div className="entry-container">
          <div className="credit-entry">
            <h2 style={{ display: "flex" }}>Credits:</h2>
            {creditsList.map((credit, index) => (
              <div key={index}>
                <select
                  value={credit.account || "Select Account"}
                  onChange={(e) =>
                    handleCreditChange(index, "account", e.target.value)
                  }
                >
                  <option disabled>Select Account</option>
                  {accounts.map((account) => (
                    <option value={account.accountName} key={account.accountID}>
                      {account.accountName}
                    </option>
                  ))}
                </select>
                <span>$</span>
                <CurrencyInput
                  value={credit.amount}
                  placeholder="Amount"
                  name="creditAmount"
                  decimalsLimit={2}
                  maxLength={12}
                  onValueChange={(value) =>
                    handleCreditChange(index, "amount", value)
                  }
                />
                <span>Post Ref: {credit.postRef}</span>
                {creditsList.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleCreditRemoval(index)}
                    className="removetransaction-button"
                  >
                    -
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={handleCreditAdd}
              className="addtransaction-button"
            >
              Add Entry
            </button>
          </div>
        </div>

        {errorMessage && <div className="error">{errorMessage}</div>}
        {status.success && <div className="success">Entry Submitted!</div>}
        <div>
          {!status.submit ? (
            <button type="submit">Submit</button>
          ) : (
            <>
              <button
                type="submit"
                onClick={() => setStatus((prev) => ({ ...prev, reset: true }))}
              >
                Cancel
              </button>
              <button type="submit">Confirm</button>
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default Journalizing;
