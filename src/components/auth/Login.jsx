import { useState } from 'react';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { db, auth } from '../../firebase-config';
import { doc, getDoc } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';

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
        navigate("/", { replace: true});
    })
    .catch((error) => {
      console.error(error.message);
      setErrorMessage(error.message);
      if (error.message.includes("invalid-credential")) {
        setFailedAttempts(failedAttempts + 1);
      }
      reportError(error.message);
    });
  };

  
  
  return (
    <div className='wrapper'>
    <form className="input-form" onSubmit={handleSubmit}>
        <h2>Login</h2>
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
        <div className='forgot-password-link'><Link to="/forgotpassword">Forgot Password?</Link></div>
        
        <span style={{ color: '#d94f00' }}>{errorMessage}</span>
        {failedAttempts > 0 && 
          ((failedAttempts < 3 && (<span>Failed Attempts: {failedAttempts}</span>))
          || (failedAttempts > 2 && (<span style={{color: 'red'}}>Attempted too many wrong passwords! Please try again later.</span>)))
        }
        <div>
        <button className={failedAttempts > 2 ? "disabled-button" : undefined} disabled= {failedAttempts > 2} type="submit">Login</button>
        <Link to="/registration"><button> Create an account </button></Link>
        </div>
        </form>
    </div>
  )
}

export default Login