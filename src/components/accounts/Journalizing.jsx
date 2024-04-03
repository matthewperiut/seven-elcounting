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

const Journalizing = () => {
  const { user } = Context(); //pull user context for user ID
  const [accounts, setAccounts] = useState([]);
  const [debitsList, setDebitsList] = useState([{ account: "", amount: "" }]);
  const [creditsList, setCreditsList] = useState([{ account: "", amount: "" }]);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchAllAccounts = async () => {
      const querySnapshot = await getDocs(
        query(collection(db, "accounts"), where("isActivated", "==", true))
      ); //gets snapshot of all active accounts
      const fetchedAccounts = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAccounts(fetchedAccounts);
    };

    fetchAllAccounts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); //prevent page refresh on submit
    let error = false;
    let debitTotal = 0;
    let creditTotal = 0;
    setSuccess(false); //reset success message on every submit
    setErrorMessage(""); //reset error message

    try {
      debitsList.forEach((debit) => {
        if (!debit.account || !debit.amount) {
          setErrorMessage("Must enter an account and amount for debit!");
          error = true;
          return;
        }
        debitTotal += parseFloat(debit.amount);
      });
      if (!error) {
        creditsList.forEach((credit) => {
          if (!credit.account || !credit.amount) {
            setErrorMessage("Must enter an account and amount for credit!");
            error = true;
            return;
          }
          creditTotal += parseFloat(credit.amount);
        });
      }
      if (error) return;
      if (debitTotal !== creditTotal) {
        setErrorMessage(
          "Total debits must equal total credits! Current difference: " +
            debitTotal +
            " - " +
            creditTotal +
            " = " +
            (debitTotal - creditTotal)
        );
        return;
      }

      if (!error) {
        debitsList.forEach(async (debit) => {
          await setDoc(doc(collection(db, "journalEntries")), {
            userID: user.uid,
            user: user.displayName,
            debitEntry: {
              accountID: debit.account,
              amount: debit.amount,
            },
          });
        });
        creditsList.forEach(async (credit) => {
          await setDoc(doc(collection(db, "journalEntries")), {
            userID: user.uid,
            user: user.displayName,
            creditEntry: {
              accountID: credit.account,
              amount: credit.amount,
            },
          });
        });
        setSuccess(true);
        e.target.reset();
        setDebitsList([{ account: "", amount: "" }]);
        setCreditsList([{ account: "", amount: "" }]);
      }
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleDebitAdd = () => {
    setDebitsList([...debitsList, { amount: "" }]);
    setErrorMessage("");
    setSuccess(false);
  };

  const handleCreditAdd = () => {
    setCreditsList([...creditsList, { amount: "" }]);
    setErrorMessage("");
    setSuccess(false);
  };

  const handleDebitRemoval = (index) => {
    const list = [...debitsList];
    list.splice(index, 1);
    setDebitsList(list);
  };

  const handleCreditRemoval = (index) => {
    const list = [...creditsList];
    list.splice(index, 1);
    setCreditsList(list);
  };

  const handleDebitChange = (index, field, value) => {
    const updatedEntry = [...debitsList];
    updatedEntry[index][field] = value;
    setDebitsList(updatedEntry);
  };

  const handleCreditChange = (index, field, value) => {
    const updatedEntry = [...creditsList];
    updatedEntry[index][field] = value;
    setCreditsList(updatedEntry);
  };

  return (
    <div className="wrapper">
      <h1>Journalizing</h1>
      <form onSubmit={handleSubmit}>
        <div className="entry-container">
          <div className="debit-entry">
          <h2>Debits:</h2>
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
                  <option value={account.accountID} key={account.accountID}>
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
            <h2>Credits:</h2>
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
                    <option value={account.accountID} key={account.accountID}>
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
