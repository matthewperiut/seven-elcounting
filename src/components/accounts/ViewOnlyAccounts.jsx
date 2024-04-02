import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase-config';
import CustomCalendar from '../layouts/CustomCalendar';

const ViewAccounts = (showEdit) => {
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    const fetchAccounts = async () => {
      const querySnapshot = await getDocs(collection(db, 'accounts'));
      const fetchedAccounts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAccounts(fetchedAccounts);
    };

    fetchAccounts();
  }, []);

  // Function to format Firestore timestamp
  function formatDate(timestamp) {
    if (!timestamp) return '';
  
    const date = timestamp.toDate();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }

  return (
    <div>
      <div style={{ position: 'fixed', top: '120px', left: '20px', zIndex: 100 }}>
        <CustomCalendar />
      </div>

      <h1 style={{ textAlign: 'center' }}>Charts of Accounts</h1>
      <div className="accounts-table" style={{ display: 'flex', justifyContent: 'center' }}>
        <table border="2" style={{ width: '80%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'center' }}>Account Name</th>
              <th style={{ textAlign: 'center' }}>Account Number</th>
              <th style={{ textAlign: 'center' }}>Category</th>
              <th style={{ textAlign: 'center' }}>Subcatagory</th>
              <th style={{ textAlign: 'center' }}> Financial Statement</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((account) => (
              <tr key={account.id}>
                <td style={{ textAlign: 'center' }}>{account.accountName}</td>
                <td style={{ textAlign: 'center' }}>{account.accountNumber}</td>
                <td style={{ textAlign: 'center' }}>{account.accountCatagory}</td>
                <td style={{ textAlign: 'center' }}>{account.accountSubcatagory}</td>
                <td style={{ textAlign: 'center' }}>{account.statement}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewAccounts;