import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth, db } from "../../firebase-config";
import { Link } from "react-router-dom";
import { reportError } from "../events/ErrorLogController";
import { collection, getDocs, query, where } from "firebase/firestore";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [securityQuestionAnswers, setSecurityQuestionAnswers] = useState({
    answer1: "",
    answer2: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the form from causing a page reload
    setErrorMessage(""); //reset error message

    try {
      const userDoc = await getDocs(
        query(
          collection(db, "users"),
          where("email", "==", email.toLowerCase())
        )
      );

      if (userDoc.empty) {
        setErrorMessage("Email not found!");
        return;
      }

      const userData = userDoc.docs[0].data();
      if (
        securityQuestionAnswers.answer1.trim() !== userData.securityQuestion1 ||
        securityQuestionAnswers.answer2.trim() !== userData.securityQuestion2
      ) {
        setErrorMessage("One of your answers is incorrect!");
        return;
      }
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent!");
    } catch (error) {
      console.error(error.message);
      reportError(error.message);
    }
  };

  return (
    <div className="wrapper">
      <form className="input-form" onSubmit={handleSubmit}>
        <h1>Forgot Password</h1>
        {errorMessage && <p className="error">{errorMessage}</p>}
        <input
          type="email"
          placeholder="Enter account email..."
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
        />
        <br />
        <label htmlFor="answer1">What is your favorite color?</label>
        <input
          id="answer1"
          type="text"
          placeholder="Enter answer..."
          value={securityQuestionAnswers.answer1}
          required
          onChange={(e) =>
            setSecurityQuestionAnswers((prev) => ({
              ...prev,
              answer1: e.target.value,
            }))
          }
        />
        <label htmlFor="answer2">What is your favorite food?</label>
        <input
          id="answer2"
          type="text"
          placeholder="Enter answer..."
          value={securityQuestionAnswers.answer2}
          required
          onChange={(e) =>
            setSecurityQuestionAnswers((prev) => ({
              ...prev,
              answer2: e.target.value,
            }))
          }
        />{" "}
        <br />
        <div>
          <button>Send Password Reset Link</button>
        </div>
      </form>

      <div className="register-login-link">
        <Link to="/">Back To Login</Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
