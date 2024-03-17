import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase-config';

const EditAccounts = () => {
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    const fetchAllUsers = async () => {
      const querySnapshot = await getDocs(collection(db, 'accounts'));
      setAccounts(querySnapshot.docs.map(doc => doc.data()));
    };
      fetchAllUsers();
  }, []);

  

  

  return (
    <div>
      <h1>Edit Accounts</h1>
      <div className="user-list">
          {accounts.map((account) => (
              <div key={account.accountName} className="user-item">  
                <span>{account.accountName}</span>
                <button className="button-edit">Edit</button>
              </div>
          ))}
          <Link to="/">Dashboard</Link>
      </div>
    </div>
  );
}

export default EditAccounts