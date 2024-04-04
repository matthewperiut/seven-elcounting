import { useState } from "react";
import { db } from "../../firebase-config";
import {
  query,
  collection,
  where,
  getDocs,
  setDoc,
  doc,
} from "firebase/firestore";
import CustomCalendar from "../layouts/CustomCalendar";
import CurrencyInput from "react-currency-input-field";
import Help from '../layouts/Help.jsx';
import { reportError } from "../logs/ErrorLogController.jsx";

export const AddAccounts = () => {
  const [accountInfo, setAccountInfo] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const inputFields = [
    { id: "accountName", label: "Account Name", type: "text" },
    { id: "accountNumber", label: "Account Number", type: "number" },
    { id: "order", label: "Order", type: "number" },
    { id: "accountDescription", label: "Account Description", type: "text" },
    { id: "accountCatagory", label: "Account Category", type: "text" },
    { id: "accountSubcatagory", label: "Account Subcategory", type: "text" },
    { id: "UID", label: "User ID", type: "text" },
  ];

  const checkExistingAccount = async (field, value) => {
    const q = query(collection(db, "accounts"), where(field, "==", value));
    const docs = await getDocs(q);
    return !docs.empty;
  };

  const createAccount = async () => {
    const account = doc(collection(db, "accounts")); //Creates blank document with autogenerated id

    //Sets document with account information
    await setDoc(account, {
      ...accountInfo,
      DateAccountAdded: new Date(),
      isActivated: true,
      accountID: account.id
    })
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);
    setErrorMessage("");

    try {
      if (await checkExistingAccount("accountName", accountInfo.accountName)) {
        setErrorMessage("Account name already exists.");
        return;
      }
      if (
        await checkExistingAccount("accountNumber", accountInfo.accountNumber)
      ) {
        setErrorMessage("Account number already exists.");
        return;
      }

      await createAccount();
      setSuccess(true);
      e.target.reset();
      setAccountInfo({});
    } catch (error) {
      console.error(error.message);
      setErrorMessage(
        error.message.includes("undefined")
          ? "Missing critical field!"
          : error.message
      );
      reportError(error.message);
    }
  };

  const handleChange = (e) => {
    setAccountInfo((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleValueChange = (value) => {
    if (!isNaN(value)) {
      setAccountInfo(prev => ({ ...prev, balance: value }));
    }
  };

  return (
    <div className="wrapper">
      <CustomCalendar />
      <Help />
      <h1>Add an Account</h1>
      <form className="input-form" onSubmit={handleSubmit}>
        {inputFields.map(({ id, label, type }) => (
            <div key={id} className="input-label">
              <div className="label-container">
                <label htmlFor={id} key={id}>
                  {label}:
                </label>
              </div>
              <input id={id} name={id} type={type} onChange={handleChange} />
            </div>
          ))}
        <div className="input-label">
          <div className="label-container">
            <label htmlFor="initialBalance">Initial Balance:</label>
          </div>
          <span>$</span>
          <CurrencyInput
            value={accountInfo.balance}
            className="currency-input"
            name="initialBalance"
            decimalsLimit={2}
            maxLength={12}
            onValueChange={(value) => handleValueChange(value)}
          />
        </div>
        <div className="input-label">
          <div className="label-container">
            <label htmlFor="normalSide">Normal Side:</label>
          </div>
          <select name="normalSide" defaultValue="" onChange={handleChange}>
            <option disabled />
            <option value="credit">Credit</option>
            <option value="debit">Debit</option>
          </select>
        </div>
        <div className="input-label">
          <div className="label-container">
            <label htmlFor="statement">Financial Statement:</label>
          </div>
          <select name="statement" defaultValue="" onChange={handleChange}>
            <option disabled />
            <option value="Income_Statement">Income Statement</option>
            <option value="Balance_Sheet">Balance Sheet</option>
            <option value="Retained_Earnings_Statement">
              Retained Earnings Statement
            </option>
            <option value="Statement_of_Cash_Flows">
              Statement of Cash Flows
            </option>
            <option value="Statement_of_Stockholder_Equity">
              Statement of Stockholder's Equity
            </option>
          </select>
        </div>
        {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
        {success && <p style={{ color: "green" }}>Account Added!</p>}
        <div>
          <button>Add Account</button>
        </div>
      </form>
    </div>
  );
};

export default AddAccounts;
