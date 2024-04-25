import { useState } from "react";
import logo from "../../assets/logo.png";

const Help = ({ componentName }) => {
  const [showModal, setShowModal] = useState(false);
  const toggleModal = () => setShowModal(!showModal);

  const [showTooltip, setShowTooltip] = useState(false);

  const getModalContent = () => {
    switch (componentName) {
      case "ChartOfAccounts":
        return (
          <div className="help-content">
            <u>
              <h1>Chart of Accounts</h1>
            </u>
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
            <u>
              <h1>Journalizing</h1>
            </u>
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
            <u>
              {" "}
              <h1>General Ledger</h1>
            </u>
            <p>
              Our platform provides a comprehensive solution for managing and
              organizing financial transactions within your organization. The
              General Ledger serves as a central repository for all financial
              activities, ensuring accurate recording and categorization of
              transactions. With our software, you can streamline your
              accounting processes, generate insightful reports, and maintain
              compliance with financial standards. Take control of your finances
              and optimize your business operations with our General Ledger
              solution
            </p>
          </div>
        );
      case "BalanceSheet":
        return (
          <div className="help-content">
            <u>
              <h1>Balance Sheet</h1>
            </u>
            <p>
              Our platform offers a powerful tool for analyzing and
              understanding your organization's financial position. The Balance
              Sheet provides a snapshot of assets, liabilities, and equity at a
              specific point in time, enabling you to assess solvency and
              financial health. With our software, you can efficiently track
              financial changes, identify trends, and make informed decisions.
              Gain valuable insights into your company's financial status and
              optimize resource allocation with our Balance Sheet solution.
            </p>
          </div>
        );
      case "TrialBalancee":
        return (
          <div className="help-content">
            <u>
              <h1>Trial Balance</h1>
            </u>
            <p>
              Our platform offers a vital tool for verifying the accuracy of
              your accounting records. The Trial Balance summarizes the balances
              of all ledger accounts to ensure that debits equal credits,
              serving as an essential step before preparing financial
              statements. With our software, you can easily identify errors or
              discrepancies in your accounting data, facilitating smoother
              financial reporting and decision-making. Gain confidence in your
              financial data integrity with our Trial Balance solution.
            </p>
          </div>
        );
      case "IncomeStatement":
        return (
          <div className="help-content">
            <u>
              <h1>Income Statement</h1>
            </u>
            <p>
              Our platform provides a powerful tool for analyzing your
              organization's financial performance over a specific period. The
              Income Statement, also known as the Profit and Loss Statement,
              summarizes revenues and expenses to determine net income or loss.
              With our software, you can gain insights into revenue sources,
              cost structures, and profitability trends. Make informed decisions
              and track financial performance effectively with our Income
              Statement solution.
            </p>
          </div>
        );
      case "RetainedEarnings":
        return (
          <div className="help-content">
            <u>
              <h1>Retained Earnings</h1>
            </u>
            <p>
              Our platform offers a valuable tool for tracking and managing the
              accumulation of earnings within your company. Retained Earnings
              represent the cumulative net income earned minus dividends
              distributed to shareholders. This metric reflects the company's
              reinvestment of profits for growth and expansion. With our
              software, you can monitor the growth of retained earnings over
              time, assess financial stability, and make strategic decisions
              regarding dividend payouts and reinvestment strategies. Gain
              insight into your company's retained earnings position with our
              Retained Earnings solution.
            </p>
          </div>
        );
      case "JournalEntries":
        return (
          <div className="help-content">
            <u>
              <h1>Journal Entries</h1>
            </u>
            <p>
              Our platform offers a critical tool for recording and organizing
              financial transactions in a systematic manner. Journal Entries
              capture the details of each transaction, including date, accounts
              involved, transaction type, and amounts. This information is
              essential for maintaining accurate financial records and
              facilitating the preparation of financial statements. With our
              software, you can streamline the entry process, ensure data
              integrity, and support auditability. Gain control over your
              financial data and ensure compliance with accounting standards
              with our Journal Entries solution.
            </p>
          </div>
        );
      case "EventLog":
        return (
          <div className="help-content">
            <u>
              <h1>Event Log</h1>
            </u>
            <p>
              Our platform provides a comprehensive tool for tracking and
              monitoring all significant events and activities within your
              system. The Event Log records important actions, changes, and
              occurrences, offering a detailed history of system activities.
              This log is valuable for troubleshooting, security auditing, and
              compliance purposes. With our software, you can gain visibility
              into system events, identify patterns, and maintain a secure and
              accountable environment. Stay informed and in control with our
              Event Log solution.
            </p>
          </div>
        );
      case "AddAccounts":
        return (
          <div className="help-content">
            <u>
              <h1>Add Accounts</h1>
            </u>
            <p>
              The user who is logged in is able to create an account for their
              accounting needs. Every account needs the following: Account name,
              number and description, Normal Side, Account Category, Account
              subcategory, initial balance, debit, credit, balance, userID,
              order, statement, and any comments.
            </p>
          </div>
        );
      case "EditAccounts":
        return (
          <div className="help-content">
            <u>
              <h1>View/Edit Accounts</h1>
            </u>

            <strong className="emphasis">View Accounts</strong>
            <p>
              The user who is logged in is able to view the accounts created for
              their accounting needs. The user will be able to view all the
              statements of each account allowing for better overall management
              of the product. This feature enhances the user's ability to track
              their financial activities, analyze trends, and make informed
              decisions regarding their finances.
            </p>
            <strong className="emphasis">Edit Accounts</strong>
            <p>
              Based on the user level type (Admin or Normal), the user can edit
              any of the input values to the accounts such as the Account Name
              or the Credit and Debit Value. Editing is a primary feature for
              the admin level only. Non-Admin users will not be able to access
              this feature.
            </p>
          </div>
        );
      case "DeactivateAccounts":
        return (
          <div className="help-content">
            <u>
              <h1>Deactivate Accounts</h1>
            </u>
            <p>
              Based on the user level type (Admin or Normal), the user can edit
              any of the input values to the accounts such as the Account Name
              or the Credit and Debit Value. Editing is a primary feature for
              the admin level only. Non-Admin users will not be able to access
              this feature.
            </p>
          </div>
        );
      case "RoleManagement":
        return (
          <div className="help-content">
            <u>
              <h1>Role Management</h1>
            </u>
            <p>
              Our platform offers a robust tool for administering user roles and
              permissions within your organization's system. Role Management
              allows you to define and assign specific roles to users,
              controlling access to features and data based on job
              responsibilities and organizational hierarchy. With our software,
              you can streamline user management, enforce security policies, and
              ensure compliance with data privacy regulations. Empower
              administrators to efficiently manage user access and permissions
              with our Role Management solution.
            </p>
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
            <img className="logo" src={logo} alt="Logo" />
          </div>
        </div>
      )}
    </div>
  );
};

export default Help;
