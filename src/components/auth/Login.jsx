import { useState } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { db, auth } from "../../firebase-config";
import { doc, getDoc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent the form from causing a page reload
    if (failedAttempts > 2) return; //prevents login after 3 failed attempts
    signInWithEmailAndPassword(auth, email, password)
      .then(async (userCredential) => {
        const userDocRef = doc(db, "users", userCredential.user.uid);
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists() && docSnap.data().isActivated === false) {
          // If user is deactivated, sign them out and prevent login
          signOut(auth);
          alert("Your account is deactivated. Please contact support.");
          return; // Exit the function to prevent further execution
        }
        console.log(userCredential.user);
        navigate("/", { replace: true });
      })
      .catch((error) => {
        console.error(error.message);
        if (error.message.includes("invalid-credential")) {
          setFailedAttempts(failedAttempts + 1);
          setErrorMessage("Invalid email or password!");
        }
        reportError(error.message);
      });
  };

  return (
    <div className="wrapper">
      <form className="input-form" onSubmit={handleSubmit}>
        <h1>Login</h1>
        <label htmlFor="email">Email: </label>
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label htmlFor="password">Password: </label>
        <input
          required
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="forgot-password-link">
          <Link to="/forgotpassword">Forgot Password?</Link>
        </div>
        {errorMessage && <span className="error">{errorMessage}</span>}
        {failedAttempts > 0 &&
          ((failedAttempts < 3 && (
            <span className="error">Failed Attempts: {failedAttempts}</span>
          )) ||
            (failedAttempts > 2 && (
              <span className="error">
                Attempted too many wrong passwords! Please try again later.
              </span>
            )))}
        <div>
          <button
            className={failedAttempts > 2 ? "disabled-button" : undefined}
            disabled={failedAttempts > 2}
            type="submit"
          >
            Login
          </button>
          <div className="register-login-link">
            Don't have an account? <Link to="/registration">Register</Link>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Login;
