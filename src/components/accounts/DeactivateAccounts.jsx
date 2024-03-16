import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db } from '../../firebase-config';

const DeactivateAccounts = () => {
  const [activeAccounts, setActiveAccounts] = useState([]);
  const [deactivedAccounts, setDeactivedAccounts] = useState([]);

  const fetchAllUsers = async () => {
    const activeSnapshot = await getDocs(query(collection(db, 'accounts'), where('isActivated', '==', true)));
    setActiveAccounts(activeSnapshot.docs.map(doc => doc.data()));
    const deactivatedSnapshot = await getDocs(query(collection(db, 'accounts'), where('isActivated', '==', false)));
    setDeactivedAccounts(deactivatedSnapshot.docs.map(doc => doc.data()));
  };

  useEffect(() => {
      fetchAllUsers();
  }, []);

  const deactivateAccount = async (accountName, balance) => {
    if (balance > 0) {
      alert('This account has a balance above 0 and cannot be deactivated');
    }
    else {
      await updateDoc(doc(db, 'accounts', accountName), {isActivated: false});
      fetchAllUsers();
    }
  }
  const activateAccount = async (accountName) => {
    await updateDoc(doc(db, 'accounts', accountName), {isActivated: true});
    fetchAllUsers();
  }

  return (
    <div>
      <h1>Deactivate an Account</h1>
      <h3>Active Accounts</h3>
      <div className="user-list">
          {activeAccounts.map((account) => (
              <div key={account.accountName} className="user-item">  
                <span>{account.accountName}</span>
                <button className="button-edit" onClick={ () => deactivateAccount(account.accountName, account.Balance)}>Deactivate</button>
              </div>
          ))}
      </div>
      <h3>Deactivated Accounts</h3>
      <div className="user-list">
      {deactivedAccounts.map((account) => (
            <div key={account.accountName} className="user-item">  
              <span>{account.accountName}</span>
              <button className="button-edit" onClick={ () => activateAccount(account.accountName)}>Activate</button>
            </div>
        ))}
        <Link to="/">Dashboard</Link>
      </div>
    </div>
  )
}

export default DeactivateAccounts