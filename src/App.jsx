import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase-config';
import { Auth } from './Auth';
import { RoleManagement } from './RoleManagement';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
      if (authUser) {
        const userRef = doc(db, "users", authUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setUser({
            uid: authUser.uid,
            email: authUser.email,
            role: userData.role
          });
        } else {
          // Handle the case where the user is authenticated but does not have a Firestore document
          console.log("No user document!");
          setUser({
            uid: authUser.uid,
            email: authUser.email,
            role: 0 // Assuming default role if not set
          });
        }
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
    setUser(null); // Make sure to clear the user state
  };

  return (
    <div>
      <h1>Seven-Elcounting</h1>
      {user ? (
        <>
          <p>Welcome, {user.email}</p>
          <button onClick={logout}>Logout</button>
          {user.role >= 1 && <RoleManagement currentUser={user} />}
        </>
      ) : (
        <Auth onUserChange={(user) => setUser(user)} />
      )}
    </div>
  );
}

export default App;
