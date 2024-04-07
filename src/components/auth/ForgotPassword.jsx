import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebase-config";
import { Link } from "react-router-dom";
import { reportError } from "../logs/ErrorLogController";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent the form from causing a page reload
    sendPasswordResetEmail(auth, email)
      .then(() => {
        alert("Password reset email sent!");
      })
      .catch((error) => {
        console.error(error.message);
        setErrorMessage(error.message);
        reportError(error.message);
      });
  };

  return (
    <div className="wrapper">
      <form className="input-form" onSubmit={handleSubmit}>
        <h1>Forgot Password</h1>
        <input
          type="email"
          placeholder="Enter account email..."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <p style={{ color: "#d94f00" }}>{errorMessage}</p>
        <button>Send Password Reset Link</button>
        <Link to="/SecurityQuestion">
          <button>Security Question Recovery</button>
        </Link>
      </form>
      <br />

      <Link to="/">Back To Login</Link>
    </div>
  );
};

export default ForgotPassword;
