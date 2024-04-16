import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase-config.js";
import CustomCalendar from "../layouts/CustomCalendar.jsx";
import CurrencyInput from "react-currency-input-field";
import Help from "../layouts/Help";
import { logEvent } from "../events/EventLogController.jsx";
import { Context } from "../context/UserContext.jsx";

/**
 * Formats a Firestore timestamp to a readable date string.
 * @param {firebase.firestore.Timestamp} timestamp - The Firestore timestamp to format.
 * @returns {string} The formatted date string.
 */
function formatDate(timestamp) {
  if (!timestamp) return "";

  const date = timestamp.toDate();
  const options = { year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
}

const Modal = ({ isOpen, account, closeModal, isEdit, updateAccount }) => {
  const [currentAccount, setCurrentAccount] = useState(account);
  const [originalAccount, setOriginalAccount] = useState(account);

  useEffect(() => {
    setCurrentAccount(account);
    setOriginalAccount(account);
  }, [account]);

  const handleValueChange = (value, field) => {
    if (isEdit) {
      setCurrentAccount({ ...currentAccount, [field]: value });
    }
  };

  const { user } = Context();
  const saveChanges = async () => {
    if (isEdit) {
      await updateAccount(currentAccount);
      await logEvent("account", originalAccount, currentAccount, user);
    }
    closeModal();
  };

  if (!isOpen || !currentAccount) return null;

  const customInput = (key, placeholder) => {
    if (key === "balance") {
      return (
        <CurrencyInput
          decimalsLimit={2}
          placeholder={placeholder}
          value={placeholder}
          prefix="$"
          onValueChange={(value) => handleValueChange(value, key)}
        />
      );
    }

    if (key === "accountNumber") {
      return (
        <input
          type="number"
          value={placeholder}
          onChange={(e) => handleValueChange(e.target.value, key)}
        />
      );
    }

    if (key === "normalSide") {
      return (
        <select defaultValue={placeholder}>
          <option value="debit">Debit</option>
          <option value="credit">Credit</option>
        </select>
      )
    }

    return (
      <input
        type="text"
        value={placeholder}
        onChange={(e) => handleValueChange(e.target.value, key)}
      />
    );
  };

  return (
    <div onClick={closeModal} className="modal-background">
      <div onClick={(e) => e.stopPropagation()} className="modal">
        <p onClick={closeModal} className="closeButton">
          &times;
        </p>
        <h1>{currentAccount.accountName}</h1>
        <div>
          {isEdit ? (
            <>
              {Object.keys(currentAccount)
                .filter(
                  (key) =>
                    key !== "DateAccountAdded" &&
                    key !== "UID" &&
                    key !== "isActivated"
                )
                .map((key) => (
                  <div className="editDB-form" key={key}>
                    <label className="editDB-label">{key}: </label>
                    {customInput(key, currentAccount[key])}
                  </div>
                ))}
            </>
          ) : (
            <>
              {Object.keys(currentAccount).map((key) => (
                <div className="editDB-form" key={key}>
                  <label className="editDB-label">{key}: </label>
                  <span>
                    {typeof currentAccount[key]?.toDate === "function"
                      ? formatDate(currentAccount[key])
                      : currentAccount[key]}
                  </span>
                </div>
              ))}
            </>
          )}
          <button onClick={saveChanges}>
            {isEdit ? "Save Changes" : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
};

const EditAccounts = (showEdit) => {
  const [accounts, setAccounts] = useState([]);
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const fetchAllAccounts = async () => {
    const querySnapshot = await getDocs(collection(db, "accounts"));
    const fetchedAccounts = querySnapshot.docs.map((doc) => ({
      ...doc.data(),
    }));
    setAccounts(fetchedAccounts);
    setFilteredAccounts(fetchedAccounts); // Initialize filteredAccounts with all fetched accounts
  };

  useEffect(() => {
    fetchAllAccounts();
  }, []);

  useEffect(() => {
    // Filter accounts whenever the search query changes
    const filtered = accounts.filter(
      (account) =>
        account.accountName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (account.order &&
          typeof account.order === "string" &&
          account.order.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (account.accountSubcatagory &&
          typeof account.accountSubcatagory === "string" &&
          account.accountSubcatagory
            .toLowerCase()
            .includes(searchQuery.toLowerCase())) ||
        (account.accountCategory &&
          typeof account.accountCategory === "string" &&
          account.accountCategory
            .toLowerCase()
            .includes(searchQuery.toLowerCase())) ||
        (account.accountNumber &&
          typeof account.accountNumber === "string" &&
          account.accountNumber
            .toLowerCase()
            .includes(searchQuery.toLowerCase())) ||
        (account.balance &&
          typeof account.balance === "string" &&
          account.balance.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredAccounts(filtered);
  }, [searchQuery, accounts]);

  const toggleModal = (account, editMode) => {
    setCurrentAccount(account);
    setIsEditMode(editMode);
    setIsModalOpen(
      !isModalOpen ||
        currentAccount.id !== account.id ||
        isEditMode !== editMode
    );
  };

  const updateAccountInfo = async (updatedAccount) => {
    try {
      // Update the document in Firestore
      await updateDoc(doc(db, "accounts", updatedAccount.accountID), updatedAccount);

      // Optimistically update the local state without refetching all accounts
      // This approach assumes the update operation succeeds, making the UI more responsive
      setAccounts(
        accounts.map((account) =>
          account.accountID === updatedAccount.accountID ? updatedAccount : account
        )
      );
    } catch (error) {
      console.error("Error updating document: ", error);
      reportError(error.message);
    }
  };

  return (
    <div className="wrapper">
      <CustomCalendar />
      <Help />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <h1>{showEdit ? "Edit" : "View"} Accounts</h1>
        <input
          type="text"
          placeholder="Search accounts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="database-list">
        {filteredAccounts.map((account) => (
          <div
            key={account.accountID}
            className="database-item"
            style={{
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "10px",
              padding: "10px",
              boxShadow: "0 2px 4px rgba(0,0,0,.1)",
            }}
          >
            <p style={{ margin: 0 }}>{account.accountName}</p>
            <div>
              <button
                className="button-view"
                onClick={() => toggleModal(account, false)}
                style={{ marginRight: "5px" }}
              >
                View
              </button>
              {showEdit && (
                <button
                  className="button-edit"
                  onClick={() => toggleModal(account, true)}
                >
                  Edit
                </button>
              )}
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

export default EditAccounts;
