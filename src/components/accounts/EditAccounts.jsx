import { useEffect, useState } from 'react'
import { collection, doc, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase-config';


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
                <div className='edit-account-form' key={key}>
                  <label className='edit-account-label'>{key}: </label>
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
)
}


const EditAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAccount, setCurrentAccount] = useState(null);



  const fetchAllAccounts = async () => {
    const querySnapshot = await getDocs(collection(db, 'accounts')); //gets snapshot of all accounts
    setAccounts(querySnapshot.docs.map(doc => doc.data())); //maps snapshot elements into state array of objects
  };

  useEffect(() => {
      fetchAllAccounts(); //fetches all accounts
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
    <div className='edit-accounts'>
      <h1>Edit Accounts</h1>
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
}

export default EditAccounts