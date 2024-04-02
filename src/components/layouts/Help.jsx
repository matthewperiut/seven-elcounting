import React, { useState } from 'react';

const FloatingHelpButton = () => {
  const [showModal, setShowModal] = useState(false);
  const toggleModal = () => setShowModal(!showModal);

  return (
    <>
      <button
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 100,
          padding: '10px 20px',
          borderRadius: '20%',
          backgroundColor: '#6972f7',
          color: 'black',
          fontSize: '20px',
          cursor: 'pointer',
        }}
        onClick={toggleModal}
      >
        ?
      </button>

      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 101,
          }}
          onClick={toggleModal}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '5px',
              maxWidth: '500px',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <Help />
          </div>
        </div>
      )}
    </>
  );
};

const Help = () => {
  return (
    <div>
      <div className="help-content">
      <div className="py-5 bg-light">
        <div className="container">
          <div className="row">
            <div className="col-12 col-lg-4">
              <h1>Add Accounts</h1>
            </div>
            <div className="col-12 col-lg-8">
              <p>
                The user who is logged in is able to create an account for their
                accounting needs. Every account needs the following: Account
                name, number and description, Normal Side, Account Category,
                Account subcategory, initial balance, debit, credit, balance,
                userID, order, statement, and any comments.
              </p>
              <hr style={{ width: "100%", borderTop: "1px solid #000" }} />
            </div>
          </div>
        </div>
      </div>

      <div className="py-5 bg-light">
        <div className="container">
          <div className="row">
            <div className="col-12 col-lg-4">
              <h1>View Accounts</h1>
            </div>
            <div className="col-12 col-lg-8">
              <p>
                The user who is logged in is able to view the accounts created
                for their accounting needs. The user will be able to view all
                the statements of each account allowing for better overall
                management of the product. This feature enhances the user's
                ability to track their financial activities, analyze trends, and
                make informed decisions regarding their finances.
              </p>
              <hr style={{ width: "100%", borderTop: "1px solid #000" }} />
            </div>
          </div>
        </div>
      </div>

      <div className="py-5 bg-light">
        <div className="container">
          <div className="row">
            <div className="col-12 col-lg-4">
              <h1>Edit Accounts</h1>
            </div>
            <div className="col-12 col-lg-8">
              <p>
                Based on the user level type (Admin or Normal), the user can
                edit any of the input values to the accounts such as the Account
                Name or the Credit and Debit Value. Editing is a primary feature
                for the admin level only. Non-Admin users will not be able to
                access this feature.
              </p>
              <hr style={{ width: "100%", borderTop: "1px solid #000" }} />
            </div>
          </div>
        </div>
      </div>

      <div className="py-5 bg-light">
        <div className="container">
          <div className="row">
            <div className="col-12 col-lg-4">
              <h1>Deactivate Accounts</h1>
            </div>
            <div className="col-12 col-lg-8">
              <p>
                Based on the user level type (Admin or Normal), the user can
                edit any of the input values to the accounts such as the Account
                Name or the Credit and Debit Value. Editing is a primary feature
                for the admin level only. Non-Admin users will not be able to
                access this feature.
              </p>
              <hr style={{ width: "100%", borderTop: "1px solid #000" }} />
            </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloatingHelpButton;
