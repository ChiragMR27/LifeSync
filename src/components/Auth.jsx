import React, { useState } from 'react';
import { authApi } from '../api/axiosConfig';

const Auth = ({ onLoginSuccess }) => {
  // State to toggle between Login and Register modes
  const [isLogin, setIsLogin] = useState(true);
  
  // State to hold the user's input
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents the page from refreshing on submit
    setMessage('');

    try {
      if (isLogin) {
        // --- LOGIN LOGIC ---
        const response = await authApi.post('/login', { username, password });
        const token = response.data.token;
        
        // Save the token to the browser!
        localStorage.setItem('token', token); 
        
        // Tell the main app that we successfully logged in
        onLoginSuccess(); 
      } else {
        // --- REGISTER LOGIC ---
        await authApi.post('/register', { username, password });
        setMessage('Registration successful! You can now log in.');
        setIsLogin(true); // Automatically flip back to the login screen
        setPassword(''); // Clear the password field for safety
      }
    } catch (error) {
      // If the backend returns a 400 Bad Request or 401 Unauthorized, display the error
      setMessage(error.response?.data || 'An error occurred. Please try again.');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', textAlign: 'center' }}>
      <h2>{isLogin ? 'Log In to LifeSync' : 'Create an Account'}</h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={{ padding: '10px', fontSize: '16px' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: '10px', fontSize: '16px' }}
        />
        <button type="submit" style={{ padding: '10px', fontSize: '16px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {isLogin ? 'Log In' : 'Sign Up'}
        </button>
      </form>

      {/* Display success or error messages */}
      {message && (
        <p style={{ color: message.includes('success') ? 'green' : 'red', marginTop: '15px', fontWeight: 'bold' }}>
          {message}
        </p>
      )}

      {/* Toggle button to switch between modes */}
      <p style={{ marginTop: '20px', cursor: 'pointer', color: '#007bff', textDecoration: 'underline' }} onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? "Don't have an account? Register here." : "Already have an account? Log in here."}
      </p>
    </div>
  );
};

export default Auth;