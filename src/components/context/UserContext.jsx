import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebase-config";
import { useNavigate } from "react-router-dom";

const UserContext = createContext(); //create user context

const UserContextProvider = ({ children }) => {
  const [user, setUser] = useState({});
  const navigate = useNavigate();

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
            displayName: userData.DisplayName,
            photoURL: userData.photoURL,
            role: userData.role,
          });
        } else {
          setUser({
            uid: authUser.uid,
            email: authUser.email,
            role: 0, //Assuming default role if not set
          });
        }
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  //asynchronous function to sign out user and nav to login page
  const logout = async () => {
    await signOut(auth);
    setUser(null);
    navigate("/", { replace: true });
  };

  //provides user context and logout function to children components
  return (
    <UserContext.Provider value={{ user, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const Context = () => {
  return useContext(UserContext);
};

export default UserContextProvider;
