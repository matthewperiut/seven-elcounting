import React, { useState } from "react";
import { db, auth } from "../../firebase-config"; 
import { collection, query, where, getDocs } from "firebase/firestore";
import { sendPasswordResetEmail } from "firebase/auth";


const SecurityQuestion = () => {
  const [email, setEmail] = useState("");
  const [userFound, setUserFound] = useState(null);
  const [securityQuestion1, setSecurityQuestion1] = useState("");
  const [securityQuestion2, setSecurityQuestion2] = useState("");
  const [answer1, setAnswer1] = useState("");
  const [answer2, setAnswer2] = useState("");
  const [error, setError] = useState("");

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };


  //Using try catches for minor error handling. Some are thrown to console for self testing. 
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      const fetchedEmail = email.toLowerCase();
      const querySnapshot = await getDocs(
        query(collection(db, "users"), where("email", "==", fetchedEmail))
      );

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        setUserFound(true);
        setSecurityQuestion1(userData.securityQuestion1);
        setSecurityQuestion2(userData.securityQuestion2);
        setError("");
      } else {
        setUserFound(false);
        setSecurityQuestion1("");
        setSecurityQuestion2("");
        setError("No user found with the entered email");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      setError("Error fetching user. Please try again");
    }
  };

  //Submitting Answers to the security questions.
  const handleAnswerSubmit = async (e) => {
    e.preventDefault();

    if (answer1.trim() === "" || answer2.trim() === "") {
      setError("Please answer both security questions");
      return;
    }

    const correctAnswer1 = securityQuestion1.toLowerCase();
    const correctAnswer2 = securityQuestion2.toLowerCase();

    if (
      answer1.toLowerCase() === correctAnswer1 &&
      answer2.toLowerCase() === correctAnswer2
    ) {
      try { //try catch for password reset with error
        sendPasswordResetEmail(auth,email);
        setError("Password reset email sent. Please check your email");
      } catch (error) {
        console.error("Error sending password reset email:", error);
        setError("Failed to send password reset email. Please try again");
      }
    } else {
      setError("Incorrect answers. Please try again");
    }

    //Resetting form state (Had to google)
    setAnswer1("");
    setAnswer2("");
  };

  return (
    <div className="wrapper">
      <form className="input-form" onSubmit={handleFormSubmit}>
        <h1>Input Email</h1>
        <div>
          <input
            id="emailInput"
            type="email"
            placeholder="Email..."
            value={email}
            onChange={handleEmailChange}
          />
        </div>
        <button type="submit">Submit</button>
      </form>

      {userFound === true && (
        <div>
          <form onSubmit={handleAnswerSubmit}>
            <div>
              <label htmlFor="answer1Input">What is your favorite color?</label>
              <input
                id="answer1Input"
                type="text"
                placeholder="Answer 1"
                value={answer1}
                onChange={(e) => setAnswer1(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="answer2Input">What is your favorite food?</label>
              <input
                id="answer2Input"
                type="text"
                placeholder="Answer 2"
                value={answer2}
                onChange={(e) => setAnswer2(e.target.value)}
              />
            </div>
            <button type="submit">Submit Answers</button>
          </form>
          {error && <p>{error}</p>}
        </div>
      )}

      {userFound === false && <p>{error}</p>}
    </div>
  );
};

export default SecurityQuestion;
