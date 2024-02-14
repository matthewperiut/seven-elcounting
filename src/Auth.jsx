import { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from './firebase-config';

export const Auth = ({ onUserChange }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleAuthOperation = async (operation) => {
    try {
      let userCredential;
      if (operation === 'register') {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", userCredential.user.uid), {
          email: userCredential.user.email,
          role: 0
        });
        onUserChange(userCredential.user);
      } else if (operation === 'login') {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
        onUserChange(userCredential.user);
      }
    } catch (error) {
      console.error(error.message);
    }
  };

  const logout = async () => {
    await signOut(auth);
    onUserChange(null);
  };

  return (
    <div>
      {isRegistering ? (
        <>
          <h2>Register</h2>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={() => handleAuthOperation('register')}>Register</button>
        </>
      ) : (
        <>
          <h2>Login</h2>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={() => handleAuthOperation('login')}>Login</button>
        </>
      )}
      <button onClick={() => setIsRegistering(!isRegistering)}>
        {isRegistering ? "Already have an account? Login" : "Create an account"}
      </button>
      {!isRegistering && (
        <button onClick={() => sendPasswordResetEmail(auth, email).then(() => alert("Password reset email sent!")).catch((error) => console.error(error.message))}>
          Forgot Password?
        </button>
      )}
    </div>
  );
};
