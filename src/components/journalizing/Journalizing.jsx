import { Timestamp, collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import CurrencyInput from "react-currency-input-field";
import { db } from "../../firebase-config";

const Journalizing = () => {
  const [accounts, setAccounts] = useState([]);
  const [amount, setAmount] = useState(0);
  const [isCredit, setIsCredit] = useState(false);
  const [currentAccount, setCurrentAccount] = useState('');

  const fetchAllAccounts = async () => {
    const querySnapshot = await getDocs(collection(db, "accounts"));
    const fetchedAccounts = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setAccounts(fetchedAccounts);
  };

  useEffect(() => {
    fetchAllAccounts();
  }, []);

  const handleValueChange = (value) => {
    if (!isNaN(value)) {
      setAmount(value);
    }
  };

  const handleAccountChange = (e) => {
    console.log(e.target.value);
    setCurrentAccount(e.target.value);
  };

  const handleSumbmit = async () => {
    (!isCredit && await doc(db, "Journal Entries"),
      {

      })
      (isCredit && await doc(db, "Journal Entries"),
      {
        
      })
  };

  return (
    <div className="wrapper" onSubmit={handleSumbmit}>
      <h1>Journalizing</h1>
      <label htmlFor="debit">Debit:</label>
      <select name="debit" defaultValue="Account Name" onChange={handleAccountChange}>
        <option disabled>Account Name</option>
        {accounts.map((account) => (
          <option key={account.id}>{account.accountName}</option>
        ))}
      </select>
      <span>$</span>
      <CurrencyInput
        placeholder="Amount"
        name="initialBalance"
        decimalsLimit={2}
        maxLength={12}
        onValueChange={(value) => handleValueChange(value)}
      />
      <br />
      <label htmlFor="credit">Credit:</label>
      <select name="credit" defaultValue="Account Name" onChange={handleAccountChange}>
        <option disabled>Account Name</option>
        {accounts.map((account) => (
          <option key={account.id}>{account.accountName}</option>
        ))}
      </select>
      <span>$</span>
      <CurrencyInput
        placeholder="Amount"
        name="initialBalance"
        decimalsLimit={2}
        maxLength={12}
        onValueChange={(value) => handleValueChange(value)}
      />
      <div>
        <button>Submit</button>
      </div>
    </div>
  );
};

export default Journalizing;
