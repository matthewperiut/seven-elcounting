import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase-config';
import CustomCalendar from '../layouts/CustomCalendar';
import Help from '../layouts/Help.jsx';

const ViewAccounts = (showEdit) => {
  const [accounts, setAccounts] = useState([]);
  const [visibleColumns, setVisibleColumns] = useState({
    accountName: true,
    accountNumber: true,
    accountDescription: false,
    normalSide: false,
    category: true,
    subcategory: true,
    initialBalance: false,
    date: false,
    userID: false,
    order: false,
    financialStatement: true,
  });
  const [showDropdown, setShowDropdown] = useState(false);

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

  const formatDate = (timestamp) => {
    if (!timestamp || typeof timestamp.toDate !== 'function') return 'N/A';
    const date = timestamp.toDate();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  // Toggle Column Visibility
  const toggleColumnVisibility = (columnName) => {
    setVisibleColumns(prevState => ({
      ...prevState,
      [columnName]: !prevState[columnName],
    }));
  };

  return (
    <div>
      <div style={{ position: 'absolute', top: '120px', left: '20px', zIndex: 100 }}>
        <CustomCalendar />
      </div>
      <Help />
      <div style={{ textAlign: 'center', padding: '0 10px' }}>
      <h1 style={{ display: 'inline-block' }}>Charts of Accounts</h1>
      </div>
      <div style={{ textAlign: 'right', padding: '0 20px', position: 'absolute', right: 0, top: '120px' }}>
        <button onClick={() => setShowDropdown(!showDropdown)}>Filters</button>
        {showDropdown && (
          <div style={{textAlign: 'left', position: 'right', right: 0, border: '1px solid #ddd', padding: '10px', background: '#fff' }}>
            {Object.keys(visibleColumns).map(columnName => (
              <div key={columnName}>
                <input
                  type="checkbox"
                  id={columnName}
                  checked={visibleColumns[columnName]}
                  onChange={() => toggleColumnVisibility(columnName)}
                />
                <label htmlFor={columnName}>{columnName}</label>
              </div>
            ))}
            </div>
          )}
      </div>
      <div className="accounts-table" style={{ paddingTop: '30px' }}>
        <table border="2">
          <thead>
            <tr>
              {visibleColumns.accountName && <th>Account Name</th>}
              {visibleColumns.accountNumber && <th>Account Number</th>}
              {visibleColumns.accountDescription && <th>Account Description</th>}
              {visibleColumns.normalSide && <th>Normal Side</th>}
              {visibleColumns.category && <th>Category</th>}
              {visibleColumns.subcategory && <th>Subcategory</th>}
              {visibleColumns.initialBalance && <th>Initial Balance</th>}
              {visibleColumns.date && <th>Date</th>}
              {visibleColumns.userID && <th>User ID</th>}
              {visibleColumns.order && <th>Order</th>}
              {visibleColumns.financialStatement && <th>Financial Statement</th>}
            </tr>
          </thead>
          <tbody>
            {accounts.map((account) => (
              <tr key={account.id}>
                {visibleColumns.accountName && <td>{account.accountName}</td>}
                {visibleColumns.accountNumber && <td>{account.accountNumber}</td>}
                {visibleColumns.accountDescription && <td>{account.accountDescription}</td>}
                {visibleColumns.normalSide && <td>{account.normalSide}</td>}
                {visibleColumns.category && <td>{account.accountCatagory}</td>} 
                {visibleColumns.subcategory && <td>{account.accountSubcatagory}</td>}
                {visibleColumns.initialBalance && <td>{account.balance}</td>}
                {visibleColumns.date && <td>{account.DateAccountAdded ? formatDate(account.DateAccountAdded) : 'N/A'}</td>}
                {visibleColumns.userID && <td>{account.UID}</td>}
                {visibleColumns.order && <td>{account.order}</td>}
                {visibleColumns.financialStatement && <td>{account.statement}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ViewAccounts;