import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import CurrencyInput from "react-currency-input-field";
import { db } from "../../firebase-config";
import { Context } from "../context/UserContext";
import { reportError } from "../logs/ErrorLogController";
import CustomCalendar from "../layouts/CustomCalendar";
import Help from "../layouts/Help.jsx";

const Journalizing = () => {
  const { user } = Context(); //pull user context for user ID
  const [accounts, setAccounts] = useState([]); //array to hold all active accounts
  const [debitsList, setDebitsList] = useState([{ account: "", amount: "" }]); //array of objects for creating new inputs and storing account and amount info
  const [creditsList, setCreditsList] = useState([{ account: "", amount: "" }]);
  const [success, setSuccess] = useState(false); //state to determine success
  const [errorMessage, setErrorMessage] = useState(""); //state for error handling and messages

  useEffect(() => {
    const fetchAllAccounts = async () => {
      //gets snapshot of all active accounts
      const querySnapshot = await getDocs(
        query(collection(db, "accounts"), where("isActivated", "==", true))
      );

      //maps data into fetchedAccounts array
      const fetchedAccounts = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAccounts(fetchedAccounts); //sets accounts state with fetchedAccounts
    };

    fetchAllAccounts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); //prevent page refresh on submit
    let error = false; //variable to detect an error
    let debitTotal = 0; //variable to track debit total
    let creditTotal = 0; //variable to track credit total
    setSuccess(false); //reset success message on every submit
    setErrorMessage(""); //reset error message
    try {
      //creates object for storing entry data
      const entry = {
        user: user.displayName,
        isApproved: user.role > 1 ? true : false, //if user is manager or admin, auto approve entry, else in pending state
        isRejected: false,
        dateCreated: new Date(),
        comment: "",
        entries: [],
      };

      //iterates through each debit transaction and checks for errors.
      //if no errors, pushes the debit values into the entries array in the entry object and calculates total debits
      debitsList.forEach((debit) => {
        if (!debit.account || !debit.amount) {
          setErrorMessage("Must enter an account and amount for debit!");
          error = true;
          return;
        }
        entry.entries.push({
          type: "debit",
          account: debit.account,
          amount: debit.amount,
        });
        debitTotal += parseFloat(debit.amount);
      });

      //if no errors already exist, iterates through each credit transaction and checks for errors.
      //if no errors, pushes the credit values into the entries array in the entry object and calculates total credits
      if (!error) {
        creditsList.forEach((credit) => {
          if (!credit.account || !credit.amount) {
            setErrorMessage("Must enter an account and amount for credit!");
            error = true;
            return;
          }
          entry.entries.push({
            type: "credit",
            account: credit.account,
            amount: credit.amount,
          });
          creditTotal += parseFloat(credit.amount);
        });
      }

      if (error) return; //checks if error has occured, if so, return from function.

      //checks if total debits equals total credits(balances)
      if (debitTotal !== creditTotal) {
        setErrorMessage(
          "Total debits must equal total credits! Current difference: " +
            debitTotal +
            " - " +
            creditTotal +
            " = " +
            (debitTotal - creditTotal)
        );
        return; //if not, return from function
      }
      await setDoc(doc(collection(db, "journalEntries")), entry); //creates document with entry data
      setSuccess(true); //document created
      e.target.reset(); //reset uncontrolled input fields
      setDebitsList([{ account: "", amount: "" }]); //reset array with empty objects
      setCreditsList([{ account: "", amount: "" }]);
    } catch (error) {
      console.log(error.message);
      reportError(error.message);
    }
  };

  const handleDebitAdd = () => {
    setDebitsList([...debitsList, { account: "", amount: "" }]); //adds new empty object to array to create new account selection and input field when another entry is added
    setErrorMessage(""); //resets error message
    setSuccess(false); //resets success
  };

  const handleCreditAdd = () => {
    setCreditsList([...creditsList, { account: "", amount: "" }]);
    setErrorMessage("");
    setSuccess(false);
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
      <CustomCalendar />
      <Help />
      <h1>Journalizing</h1>
      <form onSubmit={handleSubmit}>
        <div className="entry-container">
          <div className="debit-entry">
            <h2 style={{ display: "flex" }}>Debits:</h2>
            {debitsList.map((debit, index) => (
              <div key={index}>
                <select
                  defaultValue="Select Account"
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
                  defaultValue="Select Account"
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

        {errorMessage && <div style={{ color: "red" }}>{errorMessage}</div>}
        {success && <div style={{ color: "green" }}>Entry Submitted!</div>}
        <div>
          <button type="submit">Submit</button>
        </div>
      </form>
    </div>
  );
};

export default Journalizing;
