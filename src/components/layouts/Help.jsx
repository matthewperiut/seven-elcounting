import { useState } from "react";

const Help = () => {
  const [showModal, setShowModal] = useState(false);
  const toggleModal = () => setShowModal(!showModal);

  const [showTooltip, setShowTooltip] = useState(false);

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
            <div className="help-content">
              <h1>Add Accounts</h1>
              <p>
                The user who is logged in is able to create an account for their
                accounting needs. Every account needs the following: Account
                name, number and description, Normal Side, Account Category,
                Account subcategory, initial balance, debit, credit, balance,
                userID, order, statement, and any comments.
              </p>
              <hr />
              <h1>View Accounts</h1>
              <p>
                The user who is logged in is able to view the accounts created
                for their accounting needs. The user will be able to view all
                the statements of each account allowing for better overall
                management of the product. This feature enhances the user's
                ability to track their financial activities, analyze trends, and
                make informed decisions regarding their finances.
              </p>
              <hr />
              <h1>Edit Accounts</h1>
              <p>
                Based on the user level type (Admin or Normal), the user can
                edit any of the input values to the accounts such as the Account
                Name or the Credit and Debit Value. Editing is a primary feature
                for the admin level only. Non-Admin users will not be able to
                access this feature.
              </p>
              <hr />
              <h1>Deactivate Accounts</h1>
              <p>
                Based on the user level type (Admin or Normal), the user can
                edit any of the input values to the accounts such as the Account
                Name or the Credit and Debit Value. Editing is a primary feature
                for the admin level only. Non-Admin users will not be able to
                access this feature.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Help;
