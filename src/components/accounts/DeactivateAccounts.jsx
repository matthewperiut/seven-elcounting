import { useEffect, useState } from 'react'
import { collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db } from '../../firebase-config';
import CustomCalendar from '../layouts/CustomCalendar';
import Help from '../layouts/Help.jsx';

const DeactivateAccounts = () => {
  const [activeAccounts, setActiveAccounts] = useState([]);
  const [deactivedAccounts, setDeactivedAccounts] = useState([]);

  const fetchAllAccounts = async () => {
    const activeSnapshot = await getDocs(query(collection(db, 'accounts'), where('isActivated', '==', true))); //gets snapshot of all active accounts
    const deactivatedSnapshot = await getDocs(query(collection(db, 'accounts'), where('isActivated', '==', false))); //gets snapshot of all deactivated accounts
    setActiveAccounts(activeSnapshot.docs.map(doc => doc.data())); //maps snapshot elements into state array of objects
    setDeactivedAccounts(deactivatedSnapshot.docs.map(doc => doc.data()));
  };

  useEffect(() => {
      fetchAllAccounts(); //fetches all accounts 
  }, []);

  const deactivateAccount = async (id, balance) => {
    if (balance > 0) {
      alert('This account has a balance above 0 and cannot be deactivated'); //if user attempts to deactivate account with balance greater than zero
    }
    else {
      await updateDoc(doc(db, 'accounts', id), {isActivated: false}); //deactivate account
      fetchAllAccounts();
    }
  }
  const activateAccount = async (id) => {
    await updateDoc(doc(db, 'accounts', id), {isActivated: true}); //active account
    fetchAllAccounts();
  }

  return (
    <div>
      <div style={{ position: 'absolute', top: '120px', left: '20px', zIndex: 100 }}>
        <CustomCalendar />
      </div>
      <Help />
      <h1>Deactivate an Account</h1>
      <h3>Active Accounts</h3>
      <div className="database-list">
          {activeAccounts.map((account) => (
              <div key={account.accountName} className="database-item">  
                <p>{account.accountName}</p>
                <button className="button-edit" onClick={ () => deactivateAccount(account.accountID, account.balance)}>Deactivate</button>
              </div>
          ))}
      </div>
      <h3>Deactivated Accounts</h3>
      <div className="database-list">
      {deactivedAccounts.map((account) => (
            <div key={account.accountName} className="database-item">  
              <p>{account.accountName}</p>
              <button className="button-edit" onClick={ () => activateAccount(account.accountID)}>Activate</button>
            </div>
        ))}
      </div>
    </div>
  )
}

export default DeactivateAccounts