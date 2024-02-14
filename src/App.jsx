import { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from './firebase-config';

function App() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // New state for loading animation
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null); // New state to store user information

  const handleAuthOperation = async (operation) => {
    setIsLoading(true); // Start loading animation
    try {
      let userCredential;
      if (operation === 'register') {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      } else if (operation === 'login') {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }
      setUser(userCredential.user);
      console.log(userCredential.user);
    } catch (error) {
      console.error(error.message);
    } finally {
      setIsLoading(false); // Stop loading animation
    }
  };

  const signup = () => handleAuthOperation('register');
  const login = () => handleAuthOperation('login');

  const logout = async () => {
    await signOut(auth);
    setUser(null); // Clear user state
  };

  const forgotPassword = async () => {
    if (!email) alert("Please enter your email first.");
    else {
      try {
        await sendPasswordResetEmail(auth, email);
        alert("Password reset email sent!");
      } catch (error) {
        console.error(error.message);
      }
    }
  };

  const toggleForm = () => setIsRegistering(!isRegistering);

  return (
    <>
      <div>
        <h1>Seven-Elcounting</h1>
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <>
            {user ? (
              <div>
                <p>Welcome, {user.email}</p>
                <button onClick={logout}>Logout</button>
              </div>
            ) : (
              <form>
                <input
                  type="email"
                  required
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <input
                  type="password"
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div style={{ marginTop: "10px" }}>
                  <a href="#" onClick={toggleForm} style={{ marginRight: "10px" }}>
                    {isRegistering ? "Already have an account?" : "Create an account!"}
                  </a>
                  {!isRegistering && (
                    <a href="#" onClick={forgotPassword}>Forgot Password?</a>
                  )}
                </div>
                <button type="button" onClick={isRegistering ? signup : login} style={{ marginTop: "10px" }}>
                  {isRegistering ? "Register" : "Login"}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </>
  );
}

export default App;
