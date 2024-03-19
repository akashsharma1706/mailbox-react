import React, { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import firebaseApp from '../../../firebaseConfig';


const SignUp = ({setPage}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  
const handleSignUp = async (e) => {
  e.preventDefault();
  
  if (!email || !password || !confirmPassword) {
    alert('Please enter all fields');
    return;
  }

  if (password !== confirmPassword) {
    alert('Passwords do not match');
    return;
  }

  try {
    const auth = getAuth(firebaseApp);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log('User signed up:', user);
    setPage('login');
  } catch (error) {
    console.error('Sign up error:', error);
    alert('Failed to sign up. Please try again later.');
  }
};

  const handleAlreadyAccount = async () => {
    setPage('login');
  }

  return (
    <div className="signup">
      <h2>Sign Up</h2>
      <form className='form' onSubmit={handleSignUp}>
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
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <div className='links'>
            <h6 className='new' onClick={handleAlreadyAccount}>Already have a account? Login</h6>
        </div>
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
};

export default SignUp;