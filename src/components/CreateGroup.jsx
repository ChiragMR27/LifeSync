import React, { useState } from 'react';
import { familyApi } from '../api/axiosConfig';

const CreateGroup = ({ onBack, onCreate }) => {
  const [groupName, setGroupName] = useState('');
  const [category, setCategory] = useState('grocery');

  const handleCreate = async (e) => {
    e.preventDefault();
    
    const currentUserEmail = localStorage.getItem('userEmail') || 'admin@placeholder.com';
    
    try {
      await familyApi.post('/groups', {
        name: groupName,
        // THE FIX: Allows creating a Chat group
        type: category === 'grocery' ? 'Grocery' : 'Chat',
        badgeColor: category === 'grocery' ? '#00e5ff' : '#ff4d4d',
        leaderEmail: currentUserEmail 
      });

      onCreate(); 
    } catch (error) {
      console.error("Error creating group in database:", error);
      alert("Failed to create group. Is your Spring Boot backend running?");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={onBack} style={styles.backBtn}>←</button>
        <h2 style={styles.title}>Create New Group</h2>
      </div>

      <form onSubmit={handleCreate} style={styles.form}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>Service Category</label>
          <select 
            style={styles.input}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="grocery">Grocery</option>
            {/* THE FIX: Added Chat option to the UI */}
            <option value="chat">Chat</option>
          </select>
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Group Name</label>
          <input 
            type="text" 
            placeholder={category === 'chat' ? "e.g. Family Chat, Besties" : "e.g. Family Groceries, My Gym Buddies"}
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            style={styles.input} 
            required 
          />
        </div>

        <button type="submit" style={styles.createBtn}>Create Group</button>
      </form>
    </div>
  );
};

const styles = {
  container: { backgroundColor: '#0a0a0c', height: '100%', color: '#fff', fontFamily: 'sans-serif' },
  header: { display: 'flex', alignItems: 'center', padding: '20px', borderBottom: '1px solid #1a1c23', backgroundColor: '#16181d' },
  backBtn: { background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer', marginRight: '15px' },
  title: { margin: 0, fontSize: '18px' },
  form: { padding: '20px' },
  inputGroup: { marginBottom: '25px' },
  label: { display: 'block', marginBottom: '10px', fontSize: '14px', color: '#ddd' },
  input: { width: '100%', padding: '15px', backgroundColor: '#16181d', border: '1px solid #2a2d35', borderRadius: '8px', color: '#fff', fontSize: '14px', boxSizing: 'border-box' },
  createBtn: { width: '100%', padding: '15px', backgroundColor: '#00e5ff', color: '#000', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }
};

export default CreateGroup;