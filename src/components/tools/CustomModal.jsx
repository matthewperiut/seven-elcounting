const Modal = ({ isOpen, account, closeModal, isEdit, updateAccount }) => {
    const [currentAccount, setCurrentAccount] = useState(account);
  
    useEffect(() => {
      setCurrentAccount(account);
    }, [account]);
  
    const handleValueChange = (e, field) => {
      if (isEdit) {
        setCurrentAccount({ ...currentAccount, [field]: e.target.value });
      }
    };
  
    const saveChanges = async () => {
      if (isEdit) {
        // Assuming you have functions to update the account in the database
        await updateAccount(currentAccount);
      }
      closeModal();
    };
  
    if (!isOpen || !currentAccount) return null;
  
    return (
      <div onClick={closeModal} className='modal-background'>
        <div onClick={(e) => e.stopPropagation()} className='modal'>
          <p onClick={closeModal} className='closeButton'>&times;</p>
          <h1>{currentAccount.accountName}</h1>
          <div>
            {Object.keys(currentAccount).map(key => (
              <div className='editDB-form' key={key}>
                <label className='editDB-label'>{key}: </label>
                {isEdit ? (
                  <input
                    type="text"
                    value={currentAccount[key]}
                    onChange={(e) => handleValueChange(e, key)}
                  />
                ) : (
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

  export default Modal;