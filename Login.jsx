import React, { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import firebaseApp from '../../../firebaseConfig';

const Login = ({setPage}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password){
        alert('Please enter all details');
        return;
    }
    try {
      const auth = getAuth(firebaseApp);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('User logged in:', user);
      setPage('home');
    } catch (error) {
      console.error(error);
    }
   
  };

  const handleNewUser = async (e) => {
    setPage('signup');
  }

  return (
    <div className="login">
      <h2>Login</h2>
      <form className='form' onSubmit={handleLogin}>
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
        <div className='links'>

            <h6 className='new' onClick={handleNewUser}>Create Account</h6>
            <h6 className='forgot'>Forgot Password?</h6>
        </div>
        <button className='buttons'  type="submit">Login</button>
      </form>
    </div>
  )
}

export default Login;