import { useState, useEffect } from 'react';
import { db } from '../../firebase-config';
import { query, collection, where, getDocs, setDoc, doc } from 'firebase/firestore';
import CustomCalendar from '../layouts/CustomCalendar';

export const AddAccounts = () => {
  const [accountInfo, setAccountInfo] = useState({ credit: false, debit: false });
  const [errorMessage, setErrorMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const [displayedbalance, setDisplayedbalance] = useState('');

  useEffect(() => {
    // Automatically generate a random account number when the component mounts
    setAccountInfo(prev => ({
      ...prev,
      accountNumber: Math.floor(100000000 + Math.random() * 900000000).toString(), // Random 9-digit number
    }));
  }, []);

  const checkExistingAccount = async (field, value) => {
    const q = query(collection(db, 'accounts'), where(field, '==', value));
    const docs = await getDocs(q);
    return !docs.empty;
  };

  const createAccount = async () => {
    await setDoc(doc(db, "accounts", accountInfo.UID), {
      ...accountInfo,
      DateAccountAdded: new Date(),
      isActivated: true,
      Comment: accountInfo.comment || null,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);
    setErrorMessage('');

    try {
      if (await checkExistingAccount('accountName', accountInfo.accountName)) {
        setErrorMessage('Account name already exists.');
        return;
      }
      if (await checkExistingAccount('accountNumber', accountInfo.accountNumber)) {
        setErrorMessage('Account number already exists.');
        return;
      }

      await createAccount();
      setSuccess(true);
      e.target.reset();
      setAccountInfo({ credit: false, debit: false });
    } catch (error) {
      console.error(error.message);
      setErrorMessage(error.message.includes('undefined') ? 'Missing critical field!' : error.message);
    }
  };
  const handleChange = (e) => {
    if (e.target.name === 'balance') {
      // Force only two decimal places and update displayed value with a dollar sign
      const value = parseFloat(e.target.value).toFixed(2);
      if (!isNaN(value)) {
        setAccountInfo(prev => ({ ...prev, balance: value }));
        setDisplayedbalance(`$${value}`);
      }
    } else {
      // Handle other inputs normally
      setAccountInfo(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }
  };

  const inputFields = [
    { id: 'accountName', label: 'Account Name', type: 'text' },
    { id: 'accountNumber', label: 'Account Number', type: 'number', readOnly: true },
    { id: 'accountDescription', label: 'Account Description', type: 'text' },
    { id: 'normalSide', label: 'Normal Side', type: 'text' },
    { id: 'accountCatagory', label: 'Account Category', type: 'text' },
    { id: 'accountSubcatagory', label: 'Account Subcategory', type: 'text' },
    { id: 'balance', label: 'Initial Balance', type: 'number' },
    { id: 'order', label: 'Order', type: 'number' },
    { id: 'statement', label: 'Statement', type: 'text' },
    { id: 'comment', label: 'Comment', type: 'text' },
    { id: 'UID', label: 'User ID', type: 'text' },
  ];

  const inputStyle = { width: '100%', padding: '10px', marginBottom: '10px' }; // CSS for input boxes

  return (
    <div className='wrapper'>
      <div style={{ position: 'fixed', top: '120px', left: '20px', zIndex: 100 }}>
        <CustomCalendar />
      </div>
      <h1>Add an Account</h1>
      <form onSubmit={handleSubmit} className='account-form'>
        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '500px', margin: 'auto' }}>
          {inputFields.map(({ id, label, type, readOnly = false }) => {
            // Special handling for the initial balance field
            if (id === 'balance') {
              return (
                <div key={id} style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
                  <label htmlFor={id} style={{ marginRight: '10px' }}>{label}: </label>
                  <span style={{ marginRight: '8px' }}>$</span>
                  <input
                    id={id}
                    name={id}
                    type="text" // Changed to text to allow for formatted input
                    onChange={handleChange}
                    value={displayedbalance.replace(/^\$/, '')} // Remove $ for the actual input value
                    style={{ ...inputStyle, paddingLeft: '25px' }} // Adjust padding to accommodate the dollar sign if needed
                  />
                </div>
              );
            } else {
              // Default handling for all other input fields
              return (
                <div key={id} style={{ marginBottom: '20px' }}>
                  <label htmlFor={id} style={{ marginRight: '10px' }}>{label}: </label>
                  <input
                    id={id}
                    name={id}
                    type={type}
                    onChange={handleChange}
                    value={accountInfo[id] || ''}
                    readOnly={readOnly}
                    style={inputStyle}
                  />
                </div>
              );
            }
          })}
          <div>
            <label>Account Type: </label>
            <input type="radio" name="accountType" value="debit" checked={accountInfo.accountType === 'debit'} onChange={handleChange} /> Debit
            <input type="radio" name="accountType" value="credit" checked={accountInfo.accountType === 'credit'} onChange={handleChange} /> Credit
          </div>
          <p style={{ color: "red" }}>{errorMessage}</p>
          <p style={{ color: "green" }}>{success ? "Account Added!" : ""}</p>
          <div className='center-button' style={{ marginTop: '20px' }}>
            <button type="submit" style={{ padding: '10px 20px', fontSize: '16px' }}>Add Account</button>
          </div>
        </div>
      </form>
    </div>
  );
  
};

export default AddAccounts;