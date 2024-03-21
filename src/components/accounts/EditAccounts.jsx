import React, { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase-config';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';


const Modal = ( {isOpen, account, closeModal, updateAccount } ) => {
  const [currentAccount, setCurrentAccount] = useState(account);

  useEffect(() => {
    if (account) {
      setCurrentAccount(account);
    }
  }, [account]);


  if (!isOpen || !currentAccount) {return null;}

  const handleValueChange = (field, value) => {
    setCurrentAccount({ ...currentAccount, [field]: value });
  };

  const saveChanges = async () => {
    const currentAccountDoc = doc(db, "accounts", account.UserID);
    await updateDoc(currentAccountDoc, currentAccount);
    updateAccount(currentAccount); // Update account in the parent component state
    closeModal(); // Close modal after saving changes
  };

return (
  <div onClick={closeModal} className='modal-background'>
      <div className='modal' onClick={(e) => e.stopPropagation()}>
              <p onClick={closeModal} className='closeButton'>&times;</p>
              <h1>{account.AccountName}</h1>
              <div>
              {Object.keys(account).filter(key => key !== 'DateAccountAdded' && key !== 'UserID' && key !== 'isActivated').map((key) => (
                <div className='editDB-form' key={key}>
                  <label className='editDB-label'>{key}: </label>
                  <input
                      type="text"
                      value={currentAccount[key]}
                      onChange={(e) => handleValueChange(key, e.target.value)}
                  />
                </div>
              ))}
              <button onClick={saveChanges}>Save Changes</button>
              </div>
      </div>
    </div>
  );
};

const EditAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false); // Moved here
  const toggleCalendar = () => setShowCalendar(!showCalendar); // Moved here

  const fetchAllAccounts = async () => {
    const querySnapshot = await getDocs(collection(db, 'accounts'));
    setAccounts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => {
    fetchAllAccounts();
  }, []);

  const handleEdit = (account) => {
    setCurrentAccount(account);
    setIsModalOpen(true);
  }

  const updateAccountInfo = (updatedAccount) => {
    setAccounts(accounts.map(account => account.AccountName === updatedAccount.AccountName ? updatedAccount : account));
    fetchAllAccounts();
  };

  return (
    <div className='editDBs'>
      <h1>Edit Accounts</h1>
      <button onClick={toggleCalendar} style={{ position: 'absolute', top: 120, left: 10, zIndex: 100 }}>
        {showCalendar ? 'Hide Calendar' : 'Show Calendar'}
      </button>
      {showCalendar && (
        <div style={{ position: 'fixed', top: '180px', left: '20px', zIndex: 100 }}>
          <Calendar />
        </div>
      )}
      <div className="database-list">
          {accounts.map((account) => (
              <div key={account.AccountName} className="database-item">  
                <p>{account.AccountName}</p>
                <button className="button-edit" onClick={() => handleEdit(account)}>Edit</button>
              </div>
          ))}
          <Modal account={currentAccount} isOpen={isModalOpen} closeModal={() => setIsModalOpen(false)} updateAccount={updateAccountInfo}/>
      </div>
    </div>
  );
};

export default EditAccounts;