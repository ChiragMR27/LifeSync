import React, { useState, useRef } from 'react';
import { authApi } from '../api/axiosConfig';

const Auth = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(false);
  const [otpMode, setOtpMode] = useState(false); 
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  const [otpValues, setOtpValues] = useState(['', '', '', '']);
  const inputRefs = [useRef(), useRef(), useRef(), useRef()];

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setMessage('');

    if (password !== confirmPassword) {
      setMessage("Passwords do not match!");
      return;
    }
    
    try {
      await authApi.post('/send-otp', { username, email });
      setOtpMode(true); 
      setMessage(`OTP sent to ${email}`);
    } catch (error) {
      setMessage(error.response?.data || 'Failed to send OTP. Check email config.');
    }
  };

  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    setMessage('');
    
    const otpCode = otpValues.join('');
    if (otpCode.length < 4) {
      setMessage("Please enter the full 4-digit code.");
      return;
    }

    try {
      await authApi.post('/register', { username, email, password, otp: otpCode });
      
      setMessage('Registration successful! You can now log in.');
      setTimeout(() => {
        setOtpMode(false);
        setIsLogin(true); 
        setPassword(''); 
      }, 2000);
    } catch (error) {
      setMessage(error.response?.data || 'Invalid or expired OTP!');
    }
  };

  // THE FIX: STANDARD LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const response = await authApi.post('/login', { username, password });
      
      const token = response.data.token;
      const actualEmail = response.data.email; 
      
      localStorage.setItem('token', token); 
      localStorage.setItem('userEmail', actualEmail); 
      
      onLoginSuccess(); 
    } catch (error) {
      setMessage(error.response?.data || 'Invalid credentials.');
    }
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return; 
    
    const newOtp = [...otpValues];
    newOtp[index] = value;
    setOtpValues(newOtp);

    if (value !== '' && index < 3) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && otpValues[index] === '' && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#0a0a0a',
      color: '#ffffff',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
    formWrapper: {
      width: '100%',
      maxWidth: '360px',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
    },
    logoContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginBottom: '35px',
    },
    logoIcon: {
      width: '50px',
      height: '50px',
      backgroundColor: '#ff6b6b',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: '10px',
    },
    logoText: {
      fontSize: '24px',
      fontWeight: 'bold',
      margin: '0',
      letterSpacing: '1px',
    },
    subText: {
      fontSize: '10px',
      color: '#888',
      letterSpacing: '2px',
      margin: '5px 0 0 0',
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      marginBottom: '15px',
    },
    label: {
      fontSize: '12px',
      marginBottom: '5px',
      color: '#e0e0e0',
      fontWeight: '500',
    },
    inputContainer: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
    },
    input: {
      width: '100%',
      backgroundColor: '#1c1e32',
      border: 'none',
      borderRadius: '8px',
      padding: '12px 40px 12px 15px',
      color: '#ffffff',
      fontSize: '14px',
      outline: 'none',
      boxSizing: 'border-box'
    },
    eyeIcon: {
      position: 'absolute',
      right: '12px',
      cursor: 'pointer',
      color: '#888',
      background: 'none',
      border: 'none',
      padding: '0',
      display: 'flex',
      alignItems: 'center'
    },
    button: {
      backgroundColor: '#00e5ff',
      color: '#000000',
      border: 'none',
      borderRadius: '8px',
      padding: '14px',
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: 'pointer',
      marginTop: '10px',
      boxShadow: '0 4px 15px rgba(0, 229, 255, 0.3)',
    },
    otpContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: '10px',
      marginBottom: '20px',
    },
    otpBox: {
      width: '60px',
      height: '60px',
      backgroundColor: '#1c1e32',
      border: '2px solid #ffc107', 
      borderRadius: '8px',
      color: '#ffffff',
      fontSize: '24px',
      textAlign: 'center',
      outline: 'none',
    },
    toggleText: {
      marginTop: '30px',
      fontSize: '12px',
      color: '#a0a0a0',
      textAlign: 'center',
    },
    link: {
      color: '#ffc107',
      fontWeight: 'bold',
      cursor: 'pointer',
      textDecoration: 'none',
    },
    message: {
      marginTop: '15px',
      textAlign: 'center',
      fontSize: '14px',
      color: message.includes('success') || message.includes('sent') ? '#00e5ff' : '#ff4d4d',
    }
  };

  const EyeOpen = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  );

  const EyeClosed = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
      <line x1="1" y1="1" x2="23" y2="23"></line>
    </svg>
  );

  return (
    <div style={styles.container}>
      <div style={styles.formWrapper}>
        
        <div style={styles.logoContainer}>
          <div style={styles.logoIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10"></polyline>
              <polyline points="1 20 1 14 7 14"></polyline>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
          </div>
          <h1 style={styles.logoText}>LifeSync</h1>
          <p style={styles.subText}>HOUSEHOLD & LIFESTYLE</p>
        </div>

        {otpMode ? (
          <form onSubmit={handleVerifyAndRegister} style={{ display: 'flex', flexDirection: 'column' }}>
            <h2 style={{ textAlign: 'center', fontSize: '18px', marginBottom: '5px' }}>Verification Code</h2>
            <p style={{ textAlign: 'center', fontSize: '12px', color: '#888', marginBottom: '25px' }}>
              We have sent a 4-digit OTP to {email.replace(/(.{2})(.*)(?=@)/, "$1***")}
            </p>

            <div style={styles.otpContainer}>
              {otpValues.map((value, index) => (
                <input
                  key={index}
                  ref={inputRefs[index]}
                  type="text"
                  maxLength="1"
                  value={value}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  style={styles.otpBox}
                />
              ))}
            </div>

            <button type="submit" style={styles.button}>Verify & Register</button>
            <p style={styles.toggleText}>
              Didn't receive the OTP? <span style={styles.link} onClick={handleSendOtp}>Resend OTP</span>
            </p>
          </form>
        ) : (
          <form onSubmit={isLogin ? handleLogin : handleSendOtp} style={{ display: 'flex', flexDirection: 'column' }}>
            
            {!isLogin && (
              <div style={styles.inputGroup}>
                <label style={styles.label}>Username</label>
                <div style={styles.inputContainer}>
                  <input
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    style={styles.input}
                  />
                </div>
              </div>
            )}

            {!isLogin ? (
              <div style={styles.inputGroup}>
                <label style={styles.label}>Email Address</label>
                <div style={styles.inputContainer}>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={styles.input}
                  />
                </div>
              </div>
            ) : (
              <div style={styles.inputGroup}>
                <label style={styles.label}>Username</label>
                <div style={styles.inputContainer}>
                  <input
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    style={styles.input}
                  />
                </div>
              </div>
            )}

            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <div style={styles.inputContainer}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={styles.input}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  {showPassword ? <EyeClosed /> : <EyeOpen />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div style={styles.inputGroup}>
                <label style={styles.label}>Confirm Password</label>
                <div style={styles.inputContainer}>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    style={styles.input}
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                    {showConfirmPassword ? <EyeClosed /> : <EyeOpen />}
                  </button>
                </div>
              </div>
            )}

            <button type="submit" style={styles.button}>
              {isLogin ? 'Login' : 'Send OTP'}
            </button>
          </form>
        )}

        {message && <p style={styles.message}>{message}</p>}

        {!otpMode && (
          <p style={styles.toggleText}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <span style={styles.link} onClick={() => { setIsLogin(!isLogin); setMessage(''); }}>
              {isLogin ? 'Register here' : 'Login'}
            </span>
          </p>
        )}

      </div>
    </div>
  );
};

export default Auth;