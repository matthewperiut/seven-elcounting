import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase-config';
import CustomCalendar from '../layouts/CustomCalendar';
import CurrencyInput from 'react-currency-input-field';

/**
 * Formats a Firestore timestamp to a readable date string.
 * @param {firebase.firestore.Timestamp} timestamp - The Firestore timestamp to format.
 * @returns {string} The formatted date string.
 */
function formatDate(timestamp) {
  if (!timestamp) return '';

  const date = timestamp.toDate();
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}


const Modal = ({ isOpen, account, closeModal, isEdit, updateAccount }) => {
  const [currentAccount, setCurrentAccount] = useState(account);

  useEffect(() => {
    setCurrentAccount(account);
  }, [account]);

  const handleValueChange = (value, field) => {
    if (isEdit) {
      setCurrentAccount({ ...currentAccount, [field]: value });
    }
  };

  const saveChanges = async () => {
    if (isEdit) {
      await updateAccount(currentAccount);
    }
    closeModal();
  };

  if (!isOpen || !currentAccount) return null;

  const customInput = (key, placeholder) => {
    if (key === "balance") {
      return (<CurrencyInput decimalsLimit={2}
        placeholder={placeholder}
        value={placeholder}
        prefix="$"
        onValueChange={(value, name, values) => handleValueChange(value, key)}/>)
    }

    if (key === "accountNumber") {
      return (<input
      type="number"
      value={placeholder}
      onChange={(e) => handleValueChange(e.target.value, key)} />);
    }

    if (key === "DateAccountAdded") {
      return (
        formatDate(currentAccount[key])
      )
    }
    
    return (<input
      type="text"
      value={placeholder}
      onChange={(e) => handleValueChange(e.target.value, key)} />);
  }

  return (
    <div onClick={closeModal} className='modal-background'>
      <div onClick={(e) => e.stopPropagation()} className='modal'>
        <p onClick={closeModal} className='closeButton'>&times;</p>
        <h1>{currentAccount.accountName}</h1>
        <div>
          {Object.keys(currentAccount).map(key => (
            <div className='editDB-form' key={key}>
              <label className='editDB-label'>{key}: </label>
              {isEdit ? (customInput(key, currentAccount[key]))
               : (
                <span>{typeof currentAccount[key]?.toDate === 'function' ? formatDate(currentAccount[key]) : currentAccount[key]}</span>
              )}
            </div>
          ))}
          <button onClick={saveChanges}>{isEdit ? 'Save Changes' : 'Close'}</button>
        </div>
      </div>
    </div>
  );
};

const ViewAccounts = ( showEdit ) => {
  const [accounts, setAccounts] = useState([]);
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const fetchAllAccounts = async () => {
    const querySnapshot = await getDocs(collection(db, 'accounts'));
    const fetchedAccounts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setAccounts(fetchedAccounts);
    setFilteredAccounts(fetchedAccounts); // Initialize filteredAccounts with all fetched accounts
  };

  useEffect(() => {
    fetchAllAccounts();
  }, []);

  useEffect(() => {
    // Filter accounts whenever the search query changes
    const filtered = accounts.filter(account =>
      account.accountName && typeof account.accountName === 'string' && account.accountName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredAccounts(filtered);
  }, [searchQuery, accounts]);

  const toggleModal = (account, editMode) => {
    setCurrentAccount(account);
    setIsEditMode(editMode);
    setIsModalOpen(!isModalOpen || currentAccount.id !== account.id || isEditMode !== editMode);
  };

  const updateAccountInfo = async (updatedAccount) => {
    // Use the account's id to get a reference to its document in Firestore
    const accountRef = doc(db, 'accounts', updatedAccount.id);
  
    // Prepare the update object by omitting the 'id' field
    // Firestore document references should not include the 'id' field as part of the document data
    const { id, ...updateData } = updatedAccount;
  
    try {
      // Update the document in Firestore
      await updateDoc(accountRef, updateData);
  
      // Optimistically update the local state without refetching all accounts
      // This approach assumes the update operation succeeds, making the UI more responsive
      setAccounts(accounts.map(account => account.id === updatedAccount.id ? updatedAccount : account));
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };
  

  return (
    <div>
      <div style={{ position: 'fixed', top: '120px', left: '20px', zIndex: 100 }}>
        <CustomCalendar />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
      <h1>{showEdit ? "Edit" : "View"} Accounts</h1>
      <input
          type="text"
          placeholder="Search accounts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ marginBottom: '20px' , borderRadius: '30px' }}
        />
      </div>
      
      <div className="database-list">
        {filteredAccounts.map((account) => (
          <div key={account.id} className="database-item" style={{ alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', padding: '10px', boxShadow: '0 2px 4px rgba(0,0,0,.1)' }}> 
            <p style={{ margin: 0 }}>{account.accountName}</p>
            <div>
              <button className="button-view" onClick={() => toggleModal(account, false)} style={{ marginRight: '5px' }}>View</button>
              {showEdit && <button className="button-edit" onClick={() => toggleModal(account, true)}>Edit</button>}
            </div>
          </div>
        ))}
      </div>
      {isModalOpen && (
        <Modal
          account={currentAccount}
          isOpen={isModalOpen}
          closeModal={() => setIsModalOpen(false)}
          isEdit={isEditMode}
          updateAccount={updateAccountInfo}
        />
      )}
    </div>
  );
};

export default ViewAccounts;

