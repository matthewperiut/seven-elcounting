import { useEffect, useState } from 'react';
import { doc, getDocs, collection, updateDoc } from 'firebase/firestore';
import { db } from './firebase-config';

export const RoleManagement = ({ currentUser }) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (currentUser && currentUser.role >= 2) {
      fetchAllUsers();
    }
  }, [currentUser]);

  const fetchAllUsers = async () => {
    const querySnapshot = await getDocs(collection(db, "users"));
    setUsers(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const updateUserRole = async (uid, newRole) => {
    const userDocRef = doc(db, "users", uid);
    await updateDoc(userDocRef, { role: parseInt(newRole, 10) });
    fetchAllUsers(); // Refresh users list after updating
  };

  return (
    <div>
      <h2>User Role Management</h2>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.email} - Role: 
            <select value={user.role} onChange={(e) => updateUserRole(user.id, e.target.value)}>
              <option value="0">User</option>
              <option value="1">Management</option>
              <option value="2">Administrator</option>
            </select>
          </li>
        ))}
      </ul>
    </div>
  );
};
