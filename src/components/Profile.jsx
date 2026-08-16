import React, { useState } from 'react';
import { authApi } from '../api/axiosConfig';

const Profile = ({ onBack, onLogout }) => {
  const currentUsername = localStorage.getItem('userEmail'); 

  const [newUsername, setNewUsername] = useState(currentUsername || '');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      await authApi.put('/update', {
        currentUsername: currentUsername,
        newUsername: newUsername,
        newPassword: newPassword
      });

      if (newUsername && newUsername !== currentUsername) {
        localStorage.setItem('userEmail', newUsername);
      }

      setMessage('Profile updated successfully!');
      setNewPassword(''); 
      
    } catch (error) {
      setMessage(error.response?.data || 'Failed to update profile.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={onBack} style={styles.backBtn}>←</button>
        <h2 style={styles.title}>Edit Profile</h2>
      </div>

      <form onSubmit={handleUpdate} style={styles.form}>
        
        <div style={styles.iconCircle}>
          <span style={{ fontSize: '40px' }}>👤</span>
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Update Username / Email ID</label>
          <input 
            type="text" 
            placeholder="Enter new username or email" 
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            style={styles.input} 
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Update Password</label>
          <input 
            type="password" 
            placeholder="Enter a new password" 
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={styles.input} 
          />
          <p style={{ fontSize: '10px', color: '#888', marginTop: '5px' }}>Leave blank if you don't want to change it.</p>
        </div>

        <button type="submit" style={styles.saveBtn}>Save Changes</button>
        
        {message && (
          <p style={{ ...styles.message, color: message.includes('success') ? '#00e5ff' : '#ff4d4d' }}>
            {message}
          </p>
        )}
      </form>

      <div style={{ padding: '20px', marginTop: 'auto' }}>
        <button onClick={onLogout} style={styles.logoutBtnBig}>Log Out</button>
      </div>
    </div>
  );
};

const styles = {
  container: { backgroundColor: '#0a0a0c', minHeight: '100vh', display: 'flex', flexDirection: 'column', color: '#fff', fontFamily: 'sans-serif' },
  header: { display: 'flex', alignItems: 'center', padding: '20px', borderBottom: '1px solid #1a1c23', backgroundColor: '#16181d' },
  backBtn: { background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer', marginRight: '15px' },
  title: { margin: 0, fontSize: '18px' },
  form: { padding: '30px 20px', display: 'flex', flexDirection: 'column', gap: '20px' },
  iconCircle: { width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#1a1c23', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto 20px auto', border: '2px solid #00e5ff' },
  inputGroup: { display: 'flex', flexDirection: 'column' },
  label: { marginBottom: '8px', fontSize: '14px', color: '#ddd' },
  input: { padding: '15px', backgroundColor: '#16181d', border: '1px solid #2a2d35', borderRadius: '8px', color: '#fff', fontSize: '14px', width: '100%', boxSizing: 'border-box' },
  saveBtn: { width: '100%', padding: '15px', backgroundColor: '#00e5ff', color: '#000', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' },
  logoutBtnBig: { width: '100%', padding: '15px', backgroundColor: 'transparent', color: '#ff4d4d', border: '1px solid #ff4d4d', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' },
  message: { textAlign: 'center', fontSize: '14px', marginTop: '10px' }
};

export default Profile;