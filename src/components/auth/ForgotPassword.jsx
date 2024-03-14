import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase-config';
import { Link } from 'react-router-dom';

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
    });
  };


  return (
    <>
    <form onSubmit={handleSubmit}>
      <div>Forgot Password</div>
      <input
          type="email"
          placeholder="myemail@gmail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
      />
      <p style={{ color: '#d94f00' }}>{errorMessage}</p>
      <button>Send Password Reset Link</button>
    </form>
    <br />
    <Link to="/">Back To Login</Link>
    </>
  )
}

export default ForgotPassword
