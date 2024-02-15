import { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { db, auth } from './firebase-config';
import { doc, setDoc } from 'firebase/firestore';
import "./App.css";

export const Auth = ({ onUserChange }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [DOB, setDOB] = useState(new Date());
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [validationResults, setValidationResults] = useState({
    minLength: false,
    specialChar: false,
    number: false,
    letter: false,
    startsWithLetter: false
  });

  // Validate password function
  const validatePassword = (password) => {
    const results = {
      minLength: password.length >= 8,
      specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      number: /\d/.test(password),
      letter: /[A-Za-z]/.test(password),
      startsWithLetter: /^[A-Za-z]/.test(password)
    };
    setValidationResults(results);
  };

  // Call validatePassword every time the password changes
  useEffect(() => {
    validatePassword(password);
  }, [password]);

  // Check if all validation results are true
  const isPasswordValid = Object.values(validationResults).every(Boolean);

  const handleAuthOperation = async (operation) => {
    if (operation === 'register' && !isPasswordValid) return; // Prevents registration if password is not valid

    try {
      let userCredential;
      if (operation === 'register') {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const date = new Date(); // Current date
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear().toString().slice(-2);

        await setDoc(doc(db, "users", userCredential.user.uid), {
          email: userCredential.user.email,
          displayName: firstName.charAt(0) + lastName + month.toString() + year.toString(),
          firstName: firstName,
          lastName: lastName,
          DOB: DOB,
          approved: false,
          address: address,
          role: 0
        });
      } else if (operation === 'login') {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }
      onUserChange(userCredential.user);
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault(); // Prevent the form from causing a page reload
    const operation = isRegistering ? 'register' : 'login';
    handleAuthOperation(operation);
  };

  const renderValidationMessage = (isValid, message) => (
    <li className={isValid ? "valid" : "invalid"} style={{ listStyleType: "none", display: "flex", alignItems: "flex-start", margin: "2px 0px" }}>
      <svg className="checklist-icon" version="1.1" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 512 512" style={{ marginRight: "5px", marginLeft: "0px" }}>
        <path fill={isValid ? "#4BCA81" : "#FF0033"} d={isValid ? "M432 64l-240 240-112-112-80 80 192 192 320-320z" : "M507.331 411.33l-155.322-155.325 155.322-155.325c1.672-1.673 2.881-3.627 3.656-5.708 2.123-5.688 0.912-12.341-3.662-16.915l-73.373-73.373c-4.574-4.573-11.225-5.783-16.914-3.66-2.080 0.775-4.035 1.984-5.709 3.655l-155.324 155.326-155.324-155.325c-1.673-1.671-3.627-2.88-5.707-3.655-5.69-2.124-12.341-0.913-16.915 3.66l-73.374 73.374c-4.574 4.574-5.784 11.226-3.661 16.914 0.776 2.080 1.985 4.036 3.656 5.708l155.325 155.324-155.325 155.326c-1.671 1.673-2.88 3.627-3.657 5.707-2.124 5.688-0.913 12.341 3.661 16.915l73.374 73.373c4.575 4.574 11.226 5.784 16.915 3.661 2.080-0.776 4.035-1.985 5.708-3.656l155.324-155.325 155.324 155.325c1.674 1.672 3.627 2.881 5.707 3.657 5.689 2.123 12.342 0.913 16.914-3.661l73.373-73.374c4.574-4.574 5.785-11.227 3.662-16.915-0.776-2.080-1.985-4.034-3.657-5.707z"}></path>
      </svg>
      <span style={{ paddingTop: "2px", opacity: isValid ? "1" : "0.5", flex: "1 1 0%" }}>{message}</span>
    </li>
  );

  return (
    <div>
      <form onSubmit={handleSubmit}>
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
            <input
              type="date"
              placeholder="date of birth"
              value={DOB}
              onChange={(e) => setDOB(e.target.value)}
            />
            <input
              type="firstName"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <input
              type="lastName"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
            <input
              type="address"
              placeholder="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <button type="submit">Register</button>
            <ul style={{ padding: "0" }}>
              {renderValidationMessage(validationResults.minLength, "Password must contain at least 8 characters")}
              {renderValidationMessage(validationResults.letter, "Password must begin with a letter")}
              {renderValidationMessage(validationResults.number, "Password must contain a number")}
              {renderValidationMessage(validationResults.specialChar, "Password must contain a special character")}
              {renderValidationMessage(validationResults.startsWithLetter, "Password must start with a letter")}
            </ul>
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
            <button type="submit">Login</button>
          </>
        )}
      </form>
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
