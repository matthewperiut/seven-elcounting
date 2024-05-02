import { useEffect, useState } from "react";
import { doc, getDocs, collection, updateDoc } from "firebase/firestore";
import { db } from "../../firebase-config";
import { Context } from "../context/UserContext";
import CustomCalendar from "../tools/CustomCalendar";
import { logEvent } from "../events/EventLogController.jsx";
import Help from "../layouts/Help";
import EmailUser from "../tools/EmailUser.jsx";

const Modal = ({ isOpen, onClose, user: edittingUser, updateUser }) => {
  const [localUser, setLocalUser] = useState(edittingUser);
  const [originalLocalUser, setOriginalLocalUser] = useState(edittingUser);
  const { user } = Context();

  useEffect(() => {
    if (edittingUser) {
      setOriginalLocalUser(edittingUser);
      setLocalUser(edittingUser);
    }
  }, [edittingUser]);

  if (!isOpen || !localUser) return null;

  const handleValueChange = (field, value) => {
    //Attempt to cast numeric values, fallback to string if NaN
    const parsedValue = isNaN(Number(value)) ? value : Number(value);
    setLocalUser({ ...localUser, [field]: parsedValue });
  };

  const toggleActivation = async () => {
    const updatedStatus = !localUser.isActivated;
    const userDocRef = doc(db, "users", localUser.id);
    await updateDoc(userDocRef, { isActivated: updatedStatus });
    setLocalUser({ ...localUser, isActivated: updatedStatus }); //Update local state
    updateUser({ ...localUser, isActivated: updatedStatus }); //Update parent component state
  };

  const saveChanges = async () => {
    const userDocRef = doc(db, "users", localUser.id);
    await updateDoc(userDocRef, localUser);
    updateUser(localUser); //Update user in the parent component state
    logEvent("user", originalLocalUser, localUser, user);
    onClose(); //Close modal after saving changes
  };

  return (
    <div onClick={onClose} className="modal-background">
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <p onClick={onClose} className="closeButton">
          &times;
        </p>
        <h2>Settings for {localUser.email}</h2>
        <div className="editDB-form">
          <label className="editDB-label">Role: </label>
          <select
            value={localUser.role}
            onChange={(e) => handleValueChange("role", e.target.value)}
          >
            <option value="0">Non-User</option>
            <option value="1">User</option>
            <option value="2">Management</option>
            <option value="3">Administrator</option>
          </select>
          
        </div>
        <div className="editDB-form">
          <label className="editDB-label">Approved: </label>
          <select
            value={localUser.Approved}
            onChange={(e) => handleValueChange("Approved", e.target.value)}
          >
            <option value={true}>Yes</option>
            <option value={false}>No</option>
          </select>
          
        </div>

        {Object.keys(localUser)
          .filter(
            (key) =>
              key !== "id" &&
              key !== "email" &&
              key !== "role" &&
              key !== "isActivated" &&
              key !== "Approved"
          )
          .map((key) => (
            <div className="editDB-form" key={key}>
              <label className="editDB-label">{key}: </label>
              <input
                type="text"
                value={localUser[key]}
                onChange={(e) => handleValueChange(key, e.target.value)}
              />
            </div>
          ))}
        <button
          onClick={toggleActivation}
          style={{ backgroundColor: localUser.isActivated ? "red" : "green" }}
        >
          {localUser.isActivated ? "Deactivate" : "Activate"}
        </button>
        <button onClick={saveChanges}>Save Changes</button>
      </div>
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
      setUsers(
        querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
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
    setUsers(
      users.map((user) => (user.id === updatedUser.id ? updatedUser : user))
    );
  };

  return (
    <div className="wrapper">
      <CustomCalendar />
      <Help componentName="RoleManagement" />
      <h2>User Role Management</h2>
      <div className="database-list">
        {users.map((user) => (
          <div key={user.id} className="database-item">
            <p>{user.email}</p>
            <div>
              <button onClick={() => handleOpenModal(user)}>Edit</button>
              <EmailUser in_email={user.email} />
            </div>
          </div>
        ))}
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={selectedUser}
        updateUser={updateUserInList}
      />
    </div>
  );
};

export default RoleManagement;
