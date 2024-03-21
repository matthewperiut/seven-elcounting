import { useState } from 'react'
import { db } from '../../firebase-config';
import { query, collection, where, getDocs, setDoc, doc } from 'firebase/firestore';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

export const AddAccounts = () => {
  const [accountInfo, setAccountInfo] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const [showCalendar, setShowCalendar] = useState(false); 
  const toggleCalendar = () => setShowCalendar(!showCalendar); 

  const handleSubmit = async (e) => {
  e.preventDefault(); // Prevent the form from causing a page reload
  setSuccess(false); //reset success
  setErrorMessage(''); //reset error message

  try {
      //checks if account name matches a collection that already exists
      const nameCheck = await getDocs(query(collection(db, 'accounts'), where('AccountName', '==', accountInfo.accountName))); 

      //checks if provided account number already exists in a collection
      const numCheck = await getDocs(query(collection(db, 'accounts'), where('AccountNumber', '==', accountInfo.accountNumber)));

      if (!nameCheck.empty) {
        setErrorMessage('Account name already exists.');
        return;
      } else if (!numCheck.empty) {
        setErrorMessage('Account number already exists.');
        return;
      } 

      //creates collection that stores account info(names collection as account name)
      await setDoc(doc(db, "accounts", accountInfo.UID), { 
        Balance: accountInfo.balance, 
        Category: accountInfo.accountCatagory,
        Comment: accountInfo.comment || null,
        Credit: accountInfo.credit,
        Debit: accountInfo.debit,
        Order: accountInfo.order,
        Statement: accountInfo.statement,
        Subcategory: accountInfo.accountSubcatagory,
        UserID: accountInfo.UID,
        AccountDescription: accountInfo.accountDescription,
        AccountName: accountInfo.accountName,
        AccountNumber: accountInfo.accountNumber,
        DateAccountAdded: new Date(),
        InitialBalance: accountInfo.initialBalance,
        NormalSide: accountInfo.normalSide,
        isActivated: true
      });
      console.log(accountInfo);
      setSuccess(true);
      e.target.reset();
      setAccountInfo({});
    }catch(error) {
      console.log(error.message);
      setErrorMessage(error.message);
      if (error.message.includes('undefined')){ setErrorMessage('Missing critical field!') }
    }

};

//Function adds/replaces information fields in accountInfo state object
const handleAccountInfo = (e) => {
      setAccountInfo({...accountInfo, [e.target.name]: e.target.value});
}

  return (
    <div className='wrapper'>
      <button onClick={toggleCalendar} style={{ position: 'absolute', top: 0, left: 0, zIndex: 1000 }}>
        {showCalendar ? 'Hide Calendar' : 'Show Calendar'}
      </button>
      {showCalendar && (
        <div style={{ position: 'fixed', top: '180px', left: '20px', zIndex: 1000 }}>
          <Calendar />
        </div>
      )}
      <h1>Add an Account</h1>
      <form onSubmit={handleSubmit} className='account-form'>
          <label htmlFor="accountName">Account Name: </label>
          <input
            id="accountName"
            name="accountName"
            onChange={(e) => handleAccountInfo(e)}
          /> 
          <label htmlFor="accountNumber">Account Number: </label>
          <input
            id="accountNumber"
            name="accountNumber"
            onChange={(e) => handleAccountInfo(e)}
          />
          <label htmlFor="accountDescription">Account Description: </label>
          <input
            id="accountDescription" 
            name="accountDescription" 
            onChange={(e) => handleAccountInfo(e)}
          />
          <label htmlFor="normalSide">Normal Side: </label>
          <input
            id="normalSide"
            name="normalSide"
            onChange={(e) => handleAccountInfo(e)}
          />
          <label htmlFor="accountCategory">Account Category: </label>
          <input
            id="accountCatagory"
            name="accountCatagory"
            onChange={(e) => handleAccountInfo(e)}
          />
          <label htmlFor="accountSubcategory">Account Subcategory: </label>
          <input
            id="accountSubcatagory"
            name="accountSubcatagory"
            onChange={(e) => handleAccountInfo(e)}
          />
          <label htmlFor="initialBalance">Initial Balance: </label>
          <input
            id="initialBalance"
            name="initialBalance"
            onChange={(e) => handleAccountInfo(e)}
          />
          <label htmlFor="debit">Debit: </label>
          <input
            id="debit"
            name="debit"
            onChange={(e) => handleAccountInfo(e)}
          />
          <label htmlFor="credit">Credit: </label>
          <input
            id="credit"
            name="credit"
            onChange={(e) => handleAccountInfo(e)}
          />
          <label htmlFor="balance">Balance: </label>
          <input
            id="balance"
            name="balance"
            onChange={(e) => handleAccountInfo(e)}
          />
          <label htmlFor="UID">User ID: </label>
          <input
            id="UID"
            name="UID"
            onChange={(e) => handleAccountInfo(e)}
          />
          <label htmlFor="order">Order: </label>
          <input
            id="order"
            name="order"
            onChange={(e) => handleAccountInfo(e)}
          />
          <label htmlFor="statement">Statement: </label>
          <input
            id="statement"
            name="statement"
            onChange={(e) => handleAccountInfo(e)}
          />
          <label htmlFor="comment">Comment: </label>
          <input
            id="comment"
            name="comment"
            onChange={(e) => handleAccountInfo(e)}
          />
            <p style={{color: "red"}}>{errorMessage}</p>
            <p style={{color: "green"}}>{success ? "Account Added!" : ""}</p>
            <div className='center-button'><button type="submit">Add Account</button></div>
            </form>
          </div>
  )
}

export default AddAccounts