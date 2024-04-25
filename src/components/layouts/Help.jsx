import { useState } from "react";

const Help = ({ componentName }) => {
  const [showModal, setShowModal] = useState(false);
  const toggleModal = () => setShowModal(!showModal);

  const [showTooltip, setShowTooltip] = useState(false);

  const getModalContent = () => {
    switch (componentName) {
      case "ChartOfAccounts":
        return (
          <div className="help-content">
            <h1>Chart of Accounts</h1>
            <p>
              The Chart of Accounts component displays a list of all accounts
              used in the accounting system. Each account has specific details
              including account name, number, description, category, and
              balance. This component is fundamental for managing financial data
              and generating reports.
            </p>
          </div>
        );
      case "Journalizing":
        return (
          <div className="help-content">
            <h1>Journalizing</h1>
            <p>
              The Journalizing component is used to record financial
              transactions into journal entries. Each entry captures details
              such as date, user, accounts affected, transaction type, and
              amounts. This component is essential for maintaining an accurate
              and auditable record of financial activities.
            </p>
          </div>
        );
      case "GeneralLedger":
        return (
          <div className="help-content">
            <h1>General Ledger</h1>
            <p>General Ledger bs idek</p>
          </div>
        );
      case "BalanceSheet":
        return (
          <div className="help-content">
            <h1>Balance Sheet</h1>
            <p>Balance Sheet bs</p>
          </div>
        );
      case "TrialBalancee":
        return (
          <div className="help-content">
            <h1>Trial Balance</h1>
            <p>Trial Balance bs</p>
          </div>
        );
      case "IncomeStatement":
        return (
          <div className="help-content">
            <h1>Income Statement</h1>
            <p>Income Statement bs</p>
          </div>
        );
      case "RetainedEarnings":
        return (
          <div className="help-content">
            <h1>Retained Earnings</h1>
            <p>Retained Earnings bs</p>
          </div>
        );
      case "JournalEntries":
        return (
          <div className="help-content">
            <h1>Journal Entries</h1>
            <p>Journal Entries bs</p>
          </div>
        );
      case "EventLog":
        return (
          <div className="help-content">
            <h1>Event Log</h1>
            <p>Event Log bs</p>
          </div>
        );
      case "AddAccounts":
        return (
          <div className="help-content">
            <h1>Add Accounts</h1>
            <p>Add Accounts</p>
          </div>
        );
      case "EditAccounts":
        return (
          <div className="help-content">
            <h1>Edit Accounts</h1>
            <p>Edit Accounts</p>
          </div>
        );
      case "DeactivateAccounts":
        return (
          <div className="help-content">
            <h1>Deactivate Accounts</h1>
            <p>EDeactivate Accounts</p>
          </div>
        );
      case "RoleManagement":
        return (
          <div className="help-content">
            <h1>Role Management</h1>
            <p>Role Management</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="help-container">
      {showTooltip && <div className="tooltip">Need Help?</div>}
      <button
        onClick={toggleModal}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        ?
      </button>
      {showModal && (
        <div className="modal-background" onClick={toggleModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            {getModalContent()}
            <hr />
            <p>7ELcounting</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Help;
