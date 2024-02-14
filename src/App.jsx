import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase-config';
import { Auth } from './Auth';
import { RoleManagement } from './RoleManagement';
import { Banner } from './Banner'; // Import the Banner component

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
            displayName: userData.displayName,
            photoURL: userData.photoURL,
            role: userData.role
          });
        } else {
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
    setUser(null);
  };

  return (
    <div>
      <Banner user={user} logout={logout} /> {/* Integrate the Banner component */}
      {user ? (
        <>
          <p>Welcome, {user.email}</p>
          {user.role >= 1 && <RoleManagement currentUser={user} />}
        </>
      ) : (
        <Auth onUserChange={(user) => setUser(user)} />
      )}
    </div>
  );
}

export default App;
