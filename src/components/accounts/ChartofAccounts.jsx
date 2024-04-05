import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase-config.js';
import CustomCalendar from '../layouts/CustomCalendar.jsx';
import Help from '../layouts/Help.jsx';

function formatDate(timestamp) {
  if (!timestamp) return "";

  const date = timestamp.toDate();
  const options = { year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
}

// Modal component
const Modal = ({ isOpen, onClose, ledgerData, accountName, initialBalance, dateAccountAdded }) => {
  if (!isOpen) return null;

  // Initial balance is now directly used from props
  let runningBalance = parseFloat(initialBalance) || 0;
  let entryNo = 0; // Initialize entry no.
  
  const [filteredEntries, setFilteredEntries] = useState(ledgerData);
  const [searchAmount, setSearchAmount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  useEffect(() => {
    setFilteredEntries(ledgerData);
  }, [ledgerData]);

  const handleSearchAmountChange = (event) => {
    setSearchAmount(event.target.value);
    filterEntries(startDate, endDate, event.target.value);
  };

  const handleStartDateChange = (event) => {
    setStartDate(event.target.value);
    filterEntries(event.target.value, endDate, searchAmount);
  };

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
    filterEntries(startDate, event.target.value, searchAmount);
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters); // Toggle the visibility of filters
  };

  const filterEntries = (start, end, amount) => {
    let filtered = ledgerData.filter((entry) => {
      const date = new Date(entry.dateCreated);
      return (!start || date >= new Date(start)) && (!end || date <= new Date(end));
    });

    if (amount) {
      filtered = filtered.filter((entry) => {
        return entry.entries.some((subEntry) =>
          subEntry.amount.toString().includes(amount)
        );
      });
    }
    setFilteredEntries(filtered);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
    }}>
      <div style={{
        width: '80%',
        maxHeight: '90vh',
        overflowY: 'auto',
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '5px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        position: 'relative',
      }}>
        <span style={{
          position: 'absolute',
          top: '10px',
          right: '20px',
          cursor: 'pointer',
          fontSize: '1.5rem',
        }} onClick={onClose}>&times;</span>
        <h2 style={{ textAlign: 'center' }}>Account Ledger for {accountName}</h2>
      <div>
        <button onClick={toggleFilters} style={{ marginBottom: '10px' }}>Filters</button>
        {showFilters && (
          <div style={{ display: 'flex', marginBottom: '10px' }}>
          <div style={{ marginRight: '10px' }}>
          <label>Search:</label>
            <input
              type="text"
              placeholder="Search amount..."
              value={searchAmount}
              onChange={handleSearchAmountChange}
            />
          </div>
          <div style={{ marginRight: '10px' }}>
          <label>Start Date:</label>
            <input
              type="date"
              value={startDate}
              onChange={handleStartDateChange}
            />
          </div>
          <div>
          <label>End Date:</label>
            <input
              type="date"
              value={endDate}
              onChange={handleEndDateChange}
            />
          </div>
        </div>
        )}
        </div>
        {filteredEntries && filteredEntries.length > 0 ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
          }}>
            <table style={{
              width: '100%',
              maxWidth: '600px',
              borderCollapse: 'collapse',
              margin: '20px 0',
            }}>
              <thead>
                <tr>
                  <th style={{ borderBottom: '2px solid #ddd', padding: '10px', textAlign: 'left' }}>Entry No.</th>
                  <th style={{ borderBottom: '2px solid #ddd', padding: '10px', textAlign: 'left' }}>Date</th>
                  <th style={{ borderBottom: '2px solid #ddd', padding: '10px', textAlign: 'left' }}>Debit</th>
                  <th style={{ borderBottom: '2px solid #ddd', padding: '10px', textAlign: 'left' }}>Credit</th>
                  <th style={{ borderBottom: '2px solid #ddd', padding: '10px', textAlign: 'left' }}>Balance</th>
                </tr>
              </thead>
            <tbody>
                <tr>
                  <td style={{ padding: '10px' }}>{filteredEntries.length > 0 ? 'N/A' : 1}</td>
                  <td style={{ padding: '10px' }}>{formatDate(dateAccountAdded)}</td>
                  <td style={{ padding: '10px' }}></td>
                  <td style={{ padding: '10px' }}></td>
                  <td style={{ padding: '10px' }}>${parseFloat(initialBalance).toLocaleString()}</td>
                </tr>
                {filteredEntries.map((entry, index) => {
                  const relevantSubEntries = entry.entries.filter(subEntry => subEntry.account === accountName);
                  return relevantSubEntries.map((subEntry, subIndex) => {
                      entryNo += 1;
                      // Adjust running balance based on the transaction type
                      if (subEntry.type === 'debit') {
                        runningBalance += parseFloat(subEntry.amount);
                      } else if (subEntry.type === 'credit') {
                        runningBalance -= parseFloat(subEntry.amount);
                      }
                      return (
                        <tr key={subIndex}>
                               <td style={{ padding: '10px' }}>{entryNo}</td>
                               <td style={{ padding: '10px' }}>{formatDate(entry.dateCreated)}</td>
                               <td style={{ padding: '10px' }}>{subEntry.type === 'debit' ? `$${parseFloat(subEntry.amount).toLocaleString()}` : ''}</td>
                               <td style={{ padding: '10px' }}>{subEntry.type === 'credit' ? `$${parseFloat(subEntry.amount).toLocaleString()}` : ''}</td>
                               <td style={{ padding: '10px' }}>${runningBalance.toLocaleString()}</td>
                        </tr>
                      );
                  });
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ textAlign: 'center' }}>No ledger entries found for this account.</p>
        )}
      </div>
    </div>
  );
};

const ViewAccounts = (showEdit) => {
  const [accounts, setAccounts] = useState([]);
  
  //used for searching account name or number
  const [searchQuery, setSearchQuery] = useState(''); 
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  
  //setting the columns to show or not
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

  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const fetchAccounts = async () => {
      const querySnapshot = await getDocs(query(collection(db, 'accounts'), where('isActivated', '==', true))); //grabs all active accounts
      const fetchedAccounts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAccounts(fetchedAccounts);
    };
    fetchAccounts();
  }, []);

  useEffect(() => {
    // Filter accounts based on the search query or other filters
    const filtered = accounts.filter(account =>
      account.accountName.toLowerCase().includes(searchQuery.toLowerCase()) || account.accountNumber.toString().includes(searchQuery)
    );
    setFilteredAccounts(filtered);
  }, [searchQuery, accounts]);
  
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const formatDate = (timestamp) => {
    if (!timestamp || typeof timestamp.toDate !== 'function') return 'N/A';
    const date = timestamp.toDate();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const openModal = async (account) => {
    console.log("Opening modal with account:", account);
    try {
        const querySnapshot = await getDocs(
            query(
                collection(db, 'journalEntries'),
                where('isApproved', '==', true) // Ensure only fetching approved entries
            )
        );
        const allEntries = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const relatedEntries = allEntries.filter(entry => 
            entry.entries && entry.entries.some(subEntry => 
                subEntry.account === account.accountName
            )
        );
        // Pass dateAccountAdded to the Modal
        setSelectedAccount({ 
          ...account, 
          ledgerData: relatedEntries, 
          initialBalance: account.balance,
          dateAccountAdded: account.DateAccountAdded // Ensure this field is correctly named as per your database
        });
    } catch (error) {
        console.error('Error fetching ledger data:', error);
    }
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
    <div className='wrapper'>
      {!selectedAccount && (
        <>
          <CustomCalendar />
          <Help />
          <div style={{ textAlign: 'center', padding: '0 10px' }}>
            <h1 style={{ display: 'inline-block' }}>Charts of Accounts</h1>
            <div style={{position: 'absolute', right: '20px', top: '0' }}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                title="Show or hide filters"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                style={{ cursor: 'pointer' }}
              >
                Filters
              </button>
              {showTooltip && (
                <div style={{
                  position: 'absolute',
                  bottom: '10px', 
                  left: '-45%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(0, 0, 0, 0.50)',
                  color: 'white',
                  padding: '5px 10px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  whiteSpace: 'nowrap',
                }}>
                  Table Filters
                </div>
              )}
            </div>
            {showDropdown && (
              <div style={{ position: 'absolute', right: '10px', top: '170px', border: '1px solid #ddd', padding: '10px', background: '#fff' }}>
                {Object.keys(visibleColumns).map(columnName => (
                  <div key={columnName} style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                    <input
                      type="checkbox"
                      id={columnName}
                      checked={visibleColumns[columnName]}
                      onChange={() => toggleColumnVisibility(columnName)}
                      style={{ marginRight: '5px' }}
                    />
                    <label htmlFor={columnName}>{columnName}</label>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{ textAlign: 'center', padding: '0 10px' }}>
            <input
              type="text"
              placeholder="Search by Account Name or Number..."
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
        </>
      )}
      <div className="accounts-table" style={{ paddingTop: '30px' }}>
        {filteredAccounts.length > 0 && (
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
              {filteredAccounts.map((account) => (
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
        )}
      </div>
      <Modal isOpen={selectedAccount !== null} onClose={closeModal} ledgerData={selectedAccount ? selectedAccount.ledgerData : []} accountName={selectedAccount ? selectedAccount.accountName : ""} initialBalance={selectedAccount ? selectedAccount.initialBalance : ""} dateAccountAdded={selectedAccount ? selectedAccount.dateAccountAdded : null} />
      {searchQuery && filteredAccounts.length === 0 && (
        <div style={{ textAlign: 'center', color:'red', fontWeight: 'bold', fontSize: 18 }}>No results found</div>
      )} 
    </div>
  );
};

export default ViewAccounts;
