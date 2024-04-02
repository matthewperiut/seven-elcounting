import React, { useEffect, useState } from 'react';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase-config';
import CustomCalendar from '../layouts/CustomCalendar';

const Modal = ({ isOpen, account, closeModal, updateAccount }) => {
  const [currentAccount, setCurrentAccount] = useState(account);

  useEffect(() => {
    if (account) {
      setCurrentAccount(account);
    }
  }, [account]);

  if (!isOpen || !currentAccount) { return null; }

  const handleValueChange = (field, value) => {
    setCurrentAccount({ ...currentAccount, [field]: value });
  };

  const saveChanges = async () => {
    const currentAccountDoc = doc(db, "accounts", account.UID);
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

const Accounts = ({ canEdit = true, canView = true }) => {
  const [accounts, setAccounts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAccount, setCurrentAccount] = useState(null);

  const fetchAllAccounts = async () => {
    const querySnapshot = await getDocs(collection(db, 'accounts'));
    setAccounts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => {
    fetchAllAccounts();
  }, []);

  const handleEdit = (account) => {
    if (canEdit) {
      setCurrentAccount(account);
      setIsModalOpen(true);
    }
  };

  const updateAccountInfo = (updatedAccount) => {
    setAccounts(accounts.map(account => account.AccountName === updatedAccount.AccountName ? updatedAccount : account));
    fetchAllAccounts();
  };

  return (
    <div className='editDBs'>
      <div style={{ position: 'absolute', top: '120px', left: '20px', zIndex: 100 }}>
        <CustomCalendar />
      </div>
      <h1>{canView ? 'View Accounts' : 'Edit Accounts'}</h1>
      <div className="database-list">
        {accounts.map((account) => (
          <div key={account.accountName} className="database-item">
            <p>{account.accountName}</p>
            {canEdit && <button className="button-edit" onClick={() => handleEdit(account)}>Edit</button>}
          </div>
        ))}
        {canEdit && <Modal account={currentAccount} isOpen={isModalOpen} closeModal={() => setIsModalOpen(false)} updateAccount={updateAccountInfo}/>}
      </div>
    </div>
  );
};

export default Accounts;
