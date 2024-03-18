import { useEffect, useState } from 'react';
import { doc, getDocs, collection, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase-config';
import { Context } from '../UserContext';

const Modal = ({ isOpen, onClose, user, updateUser }) => {
  const [localUser, setLocalUser] = useState(user);

  useEffect(() => {
    if (user) {
      setLocalUser(user);
    }
  }, [user]);

  if (!isOpen || !localUser) return null;

  const handleValueChange = (field, value) => {
    // Attempt to cast numeric values, fallback to string if NaN
    const parsedValue = isNaN(Number(value)) ? value : Number(value);
    setLocalUser({ ...localUser, [field]: parsedValue });
  };

  const toggleActivation = async () => {
    const updatedStatus = !localUser.isActivated;
    const userDocRef = doc(db, "users", localUser.id);
    await updateDoc(userDocRef, { isActivated: updatedStatus });
    setLocalUser({ ...localUser, isActivated: updatedStatus }); // Update local state
    updateUser({ ...localUser, isActivated: updatedStatus }); // Update parent component state
  };

  const saveChanges = async () => {
    const userDocRef = doc(db, "users", localUser.id);
    await updateDoc(userDocRef, localUser);
    updateUser(localUser); // Update user in the parent component state
    onClose(); // Close modal after saving changes
  };

  return (
    <div style={{ position: 'fixed', top: '20%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white', padding: '20px', zIndex: 1000 }}>
      <h2>Settings for {localUser.email}</h2>
      <div>
        <label>Role: </label>
        <select
          value={localUser.role}
          onChange={(e) => handleValueChange('role', e.target.value)}
        >
          <option value="1">User</option>
          <option value="2">Management</option>
          <option value="3">Administrator</option>
        </select>
      </div>
      {Object.keys(localUser).filter(key => key !== 'id' && key !== 'email' && key !== 'role').map((key) => (
        <div key={key}>
          <label>{key}: </label>
          <input
            type="text"
            value={localUser[key]}
            onChange={(e) => handleValueChange(key, e.target.value)}
          />
        </div>
      ))}
      <button onClick={saveChanges}>Save Changes</button>
      <button
        onClick={toggleActivation}
        style={{ backgroundColor: localUser.isActivated ? 'red' : 'green', color: 'white', marginLeft: '10px' }}
      >
        {localUser.isActivated ? 'Deactivate' : 'Activate'}
      </button>
      <button onClick={onClose}>Close</button>
    </div>
  );
};

export const RoleManagement = () => {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const { user } = Context();


  useEffect(() => {
    const fetchAllUsers = async () => {
      const querySnapshot = await getDocs(collection(db, "users"));
      setUsers(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    
    if (user && user.role >= 2) {
      fetchAllUsers();
    }
  }, [user]);

  const handleOpenModal = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const updateUserInList = (updatedUser) => {
    setUsers(users.map(user => user.id === updatedUser.id ? updatedUser : user));
  };

  return (
    <div>
      <h2>User Role Management</h2>
      <div className="database-list">
        {users.map((user) => (
          <div key={user.id} className="database-item">
            <p>{user.email}</p>
            <button onClick={() => handleOpenModal(user)} className="button-edit">Edit</button>
          </div>
        ))}
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} user={selectedUser} updateUser={updateUserInList} />
    </div>
  );
};

export default RoleManagement