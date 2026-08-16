import React, { useState } from 'react';
import { authApi } from '../api/axiosConfig';

const CreateUser = ({ onBack }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('USER');
  const [message, setMessage] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      await authApi.post('/direct-register', {
        username,
        email,
        password,
        role
      });

      setMessage('User created successfully!');
      setUsername('');
      setEmail('');
      setPassword('');
      
    } catch (error) {
      setMessage(error.response?.data || 'Failed to create user.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={onBack} style={styles.backBtn}>←</button>
        <h2 style={styles.title}>Admin: Add New User</h2>
      </div>

      <form onSubmit={handleRegister} style={styles.form}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Username</label>
          <input 
            type="text" 
            placeholder="Enter username" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.input} 
            required
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Email Address</label>
          <input 
            type="email" 
            placeholder="Enter email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input} 
            required
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Temporary Password</label>
          <input 
            type="text" 
            placeholder="Assign a password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input} 
            required
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Role</label>
          <select 
            value={role} 
            onChange={(e) => setRole(e.target.value)} 
            style={styles.input}
          >
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        <button type="submit" style={styles.saveBtn}>Create User</button>
        
        {message && (
          <p style={{ ...styles.message, color: message.includes('success') ? '#00e5ff' : '#ff4d4d' }}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
};

const styles = {
  container: { backgroundColor: '#0a0a0c', minHeight: '100vh', display: 'flex', flexDirection: 'column', color: '#fff', fontFamily: 'sans-serif' },
  header: { display: 'flex', alignItems: 'center', padding: '20px', borderBottom: '1px solid #1a1c23', backgroundColor: '#16181d' },
  backBtn: { background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer', marginRight: '15px' },
  title: { margin: 0, fontSize: '18px', color: '#ffc107' },
  form: { padding: '30px 20px', display: 'flex', flexDirection: 'column', gap: '20px' },
  inputGroup: { display: 'flex', flexDirection: 'column' },
  label: { marginBottom: '8px', fontSize: '14px', color: '#ddd' },
  input: { padding: '15px', backgroundColor: '#16181d', border: '1px solid #2a2d35', borderRadius: '8px', color: '#fff', fontSize: '14px', width: '100%', boxSizing: 'border-box' },
  saveBtn: { width: '100%', padding: '15px', backgroundColor: '#ffc107', color: '#000', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' },
  message: { textAlign: 'center', fontSize: '14px', marginTop: '10px' }
};

export default CreateUser;