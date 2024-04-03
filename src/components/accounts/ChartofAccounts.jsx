import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase-config.js';
import CustomCalendar from '../layouts/CustomCalendar.jsx';
import Help from '../layouts/Help.jsx';

// Modal component 
const Modal = ({ isOpen, onClose, ledgerData }) => {
  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>Account Ledger</h2>
        <table border="1">
          <thead>
            <tr>
              <th>Date</th>
              <th>Entry Number</th>
              <th>Description</th>
              <th>Credit</th>
              <th>Debit</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>
            {ledgerData.map(entry => (
              <tr key={entry.entryNumber}>
                <td>{entry.date}</td>
                <td>{entry.entryNumber}</td>
                <td>{entry.description}</td>
                <td>{entry.credit}</td>
                <td>{entry.debit}</td>
                <td>{entry.balance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal isOpen={selectedAccount !== null} onClose={closeModal} ledgerData={selectedAccount ? selectedAccount.ledgerData : []} />

    </div>
  );
};
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
  const [selectedAccount, setSelectedAccount] = useState(null);

  useEffect(() => {
    const fetchAccounts = async () => {
      const querySnapshot = await getDocs(query(collection(db, 'accounts'), where('isActivated', '==', true))); //gets snapshot of all active accounts
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

  const openModal = (account) => {
    console.log("Opening modal with account:", account);
    setSelectedAccount(account);
  };

  const closeModal = () => {
    setSelectedAccount(null);
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
          <td>
        <button onClick={() => openModal(account)} style={{ border: 'none', background: 'none', color: 'black', cursor: 'pointer' }}>
          {account.accountName}
         </button>
        </td>                
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