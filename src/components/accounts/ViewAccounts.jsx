import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase-config';

const ViewAccounts = () => {
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
      <h1>View Accounts</h1>
      <div className="account-list">
        <ul>
          {accounts.map((account, index) => (
              <li key={index}>  
                {account.accountName}
              </li>
          ))}
        </ul>
      </div>
      <Link to="/">Dashboard</Link>
    </div>
  );
}

export default ViewAccounts