import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase-config.js';

const GeneralLedger = () => {
  const [ledgerData, setLedgerData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLedgerData = async () => {
      setLoading(true); 

     const querySnapshot = await getDocs(query(collection(db, 'journalEntries'), where('isActivated', '==', true))
      );

      const fetchedLedgerData = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const ledgerEntry = {
          accountName: data.accountName,
          date: data.date,
          debit: data.debitAmount,
          credit: data.creditAmount,
        };
        fetchedLedgerData.push(ledgerEntry);
      });

      setLedgerData(fetchedLedgerData);
      setLoading(false); 
    };

    fetchLedgerData();
  }, []);

  return (
    <div className="ledger-container">
      <h2>General Ledger</h2>
      <table className="ledger-table">

          <thead>
            <tr>
              <th>Date</th>
              <th>Account Name</th>
              <th>Debit</th>
              <th>Credit</th>
            </tr>
          </thead>
          <tbody>
            {ledgerData.map(entry => (
              <tr key={entry.id}>
                <td>{entry.date}</td>
                <td>{entry.accountName}</td>
                <td>{entry.debit}</td>
                <td>{entry.credit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      
    </div>
  );
};

export default GeneralLedger;