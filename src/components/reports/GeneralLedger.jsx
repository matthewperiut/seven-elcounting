import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase-config.js';

const GeneralLedger = () => {
  const [ledgerData, setLedgerData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredLedgerData, setFilteredLedgerData] = useState([]);

  useEffect(() => {
    const fetchLedgerData = async () => {
      setLoading(true); 

      const querySnapshot = await getDocs(query(collection(db, 'journalEntries'), where('isActivated', '==', true)));

      const fetchedLedgerData = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const ledgerEntry = {
          id: doc.id,
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

  useEffect(() => {
    // Filter ledgerData based on the searchQuery
    const filtered = ledgerData.filter(entry =>
      entry.accountName.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredLedgerData(filtered);
  }, [searchQuery, ledgerData]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  return (
    <div className="ledger-container">
      <h2>General Ledger</h2>
      <input
        type="text"
        placeholder="Search Account name or amount"
        value={searchQuery}
        onChange={handleSearchChange}
        style={{ marginBottom: '20px', borderRadius: '30px' }}
      />
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
          {filteredLedgerData.map(entry => (
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