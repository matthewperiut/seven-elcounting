import { useEffect, useState } from 'react'
import { collection, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { db } from '../../firebase-config';

const ViewAccounts = () => {
  const [accounts, setAccounts] = useState([]);

  const fetchAllAccounts = async () => {
    const querySnapshot = await getDocs(collection(db, 'accounts')); //gets snapshot of all accounts
    setAccounts(querySnapshot.docs.map(doc => doc.data())); //maps snapshot elements into state array of objects
  };

  useEffect(() => {
      fetchAllAccounts(); //fetches all accounts
  }, []);
  

  

  return (
    <div>
      <h1>View Accounts</h1>
      <div className="database-list">
          {accounts.map((account) => (
              <div key={account.AccountName} className="database-item"> 
                <p>{account.AccountName}</p>
                <button className="button-edit">View</button>
              </div>
          ))}
      </div>
    </div>
  );
}

export default ViewAccounts