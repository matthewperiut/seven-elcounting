import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase-config';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; 

const ViewAccounts = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [accounts, setAccounts] = useState([]);
  const [showCalendar, setShowCalendar] = useState(false); 

  const toggleCalendar = () => setShowCalendar(!showCalendar); 

  // Initially fetch all accounts
  const fetchAllAccounts = async () => {
    const querySnapshot = await getDocs(collection(db, 'accounts'));
    setAccounts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => {
    fetchAllAccounts();
  }, []);

  const handleSearch = async (event) => {
    event.preventDefault();
    if (!searchQuery.trim()) {
      fetchAllAccounts(); // Reset to all accounts if search is cleared
      return;
    }
    const accountsRef = collection(db, 'accounts');
    const q = query(accountsRef, 
      where('AccountName', '==', searchQuery)
    );

    const querySnapshot = await getDocs(q);
    const filteredAccounts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setAccounts(filteredAccounts);
  };

  return (
    <div>
      <button onClick={toggleCalendar} style={{ position: 'absolute', top: 120, left: 10, zIndex: 100 }}>
        {showCalendar ? 'Hide Calendar' : 'Show Calendar'}
      </button>
      {showCalendar && (
        <div style={{ position: 'fixed', top: '180px', left: '20px', zIndex: 100 }}>
          <Calendar />
        </div>
      )}
      <h1>View Accounts</h1>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search..."
          style={{ borderRadius: '30px' }} 
        />
      </form>
      <div className="database-list">
        {accounts.map((account) => (
          <div key={account.id} className="database-item"> 
            <p>{account.AccountName}</p>
            <button className="button-edit">View</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ViewAccounts;
