import { useState } from 'react'
import { Link } from 'react-router-dom'
import { db } from '../../firebase-config';
import { setDoc, doc, getDoc, query, collection, where, getDocs } from 'firebase/firestore';

export const AddAccounts = () => {
  const [accountInfo, setAccountInfo] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
  e.preventDefault(); // Prevent the form from causing a page reload
  setSuccess(false); //reset success
  setErrorMessage(''); //reset error message

  try {
      //checks if account name matches a collection that already exists
      const nameCheck = await getDoc(doc(db, 'accounts', accountInfo.accountName)); 

      //checks if provided account number already exists in a collection
      const numCheck = await getDocs(query(collection(db, 'accounts'), where('accountNumber', '==', accountInfo.accountNumber)));

      if (nameCheck.exists()) {
        setErrorMessage('Account name already exists.');
        return;
      } else if (!numCheck.empty) {
        setErrorMessage('Account number already exists.');
        return;
      } 

      //creates collection that stores account info(names collection as account name)
      await setDoc(doc(db, "accounts", accountInfo.accountName), { 
        Balance: accountInfo.balance, 
        Category: accountInfo.accountCatagory,
        Comment: accountInfo.comment,
        Credit: accountInfo.credit,
        Debit: accountInfo.debit,
        Order: accountInfo.order,
        Statement: accountInfo.statement,
        Subcategory: accountInfo.accountSubcatagory,
        UID: accountInfo.UID,
        accountDescription: accountInfo.accountDescription,
        accountName: accountInfo.accountName,
        accountNumber: accountInfo.accountNumber,
        dateAccountAdded: new Date(),
        initialBalance: accountInfo.initialBalance,
        normalSide: accountInfo.normalSide
      });
      console.log(accountInfo);
      setSuccess(true);
    }catch(error) {
      console.log(error);
      setErrorMessage(error.message);
    }

};

//Function adds/replaces information fields in accountInfo state object
const handleAccountInfo = (e) => {
      setAccountInfo({...accountInfo, [e.target.name]: e.target.value});
}




  return (
    <div>
      <h1>AddAccounts</h1>
    <form onSubmit={handleSubmit}>
            <input
              name="accountName"
              placeholder="Account Name"
              onChange={(e) => handleAccountInfo(e)}
            />
            <input
              name="accountNumber"
              placeholder="Account Number"
              onChange={(e) => handleAccountInfo(e)}
            />
            <input
              name="accountDescription" 
              placeholder="Account Description"
              onChange={(e) => handleAccountInfo(e)}
            />
            <input
              name="normalSide"
              placeholder="Normal Side"
              onChange={(e) => handleAccountInfo(e)}
            />
            <input
              name="accountCatagory"
              placeholder="Account Category (e.g. current assets)"
              onChange={(e) => handleAccountInfo(e)}
            />
            <input
              name="accountSubcatagory"
              placeholder="Account Subcategory (e.g. current assets)"
              onChange={(e) => handleAccountInfo(e)}
            />
             <input
              name="initialBalance"
              placeholder="Initial Balance"
              onChange={(e) => handleAccountInfo(e)}
            />
            <input
              name="debit"
              placeholder="Debit"
              onChange={(e) => handleAccountInfo(e)}
            />
            <input
              name="credit"
              placeholder="Credit"
              onChange={(e) => handleAccountInfo(e)}
            />
            <input
              name="balance"
              placeholder="Balance"
              onChange={(e) => handleAccountInfo(e)}
            />
            <input
              name="UID"
              placeholder="User ID"
              onChange={(e) => handleAccountInfo(e)}
            />
            <input
              name="order"
              placeholder="Order"
              onChange={(e) => handleAccountInfo(e)}
            />
            <input
              name="statement"
              placeholder="Statement (e.g. IS (income statement), BS (balance sheet), RE (Retained Earnings statement)"
              onChange={(e) => handleAccountInfo(e)}
            />
             <input
              name="comment"
              placeholder="Comment"
              onChange={(e) => handleAccountInfo(e)}
            /><br />
            <p style={{color: "red"}}>{errorMessage}</p>
            <p style={{color: "green"}}>{success ? "Account Added!" : ""}</p>
            <button type="submit">Add Account</button>
            </form>
            <Link to="/">Dashboard</Link>
          </div>
  )
}

export default AddAccounts