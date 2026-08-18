import React, { useState, useEffect } from 'react';
import { familyApi, authApi } from '../api/axiosConfig';

const GroupChat = ({ groupId, onBack }) => {
  const [groupDetails, setGroupDetails] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  
  // Member Management States
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');

  const currentUserEmail = String(localStorage.getItem('userEmail') || '').toLowerCase().trim();

  const fetchGroupDetails = async () => {
    try {
      const response = await familyApi.get(`/groups?email=${currentUserEmail}`);
      const currentGroup = response.data.find(g => String(g.id) === String(groupId));
      if (currentGroup) {
        setGroupDetails(currentGroup);
      }
    } catch (error) {
      console.error("Error fetching group details:", error);
    }
  };

  const fetchMessages = async () => {
    if (!groupId) return;
    try {
      const response = await familyApi.get(`/groups/${groupId}/messages`);
      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching group messages:", error);
    }
  };

  useEffect(() => {
    if (groupId) {
      fetchGroupDetails();
      fetchMessages();
      const interval = setInterval(fetchMessages, 3000); 
      return () => clearInterval(interval);
    }
  }, [groupId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    const newMsg = {
      senderEmail: currentUserEmail,
      text: messageInput,
      timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };

    try {
      await familyApi.post(`/groups/${groupId}/messages`, newMsg);
      setMessageInput('');
      fetchMessages(); 
    } catch (error) {
      console.error("Error sending group message:", error);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    const emailToCheck = newMemberEmail.toLowerCase().trim();

    try {
      // Ask Auth Service if user exists
      const checkResponse = await authApi.get(`/check-email?email=${emailToCheck}`);
      const userExists = checkResponse.data; 

      if (userExists) {
        await familyApi.post(`/groups/${groupId}/members`, { email: emailToCheck });
        setNewMemberEmail('');
        fetchGroupDetails(); 
        alert("Member added to the Group Chat!");
      } else {
        const shareData = {
          title: `Join ${groupDetails?.name} on LifeSync!`,
          text: `Hey! I added you to our group chat on LifeSync. Sign up with the email ${emailToCheck} so you can read our messages!`,
          url: window.location.origin 
        };

        if (navigator.share) {
          await navigator.share(shareData);
        } else {
          alert(`User not found! Invite them:\n\n${shareData.text}`);
        }
      }
    } catch (error) {
      console.error("Error adding member:", error);
    }
  };

  // THE FIX: Leader-only Delete Functionality
  const handleRemoveMember = async (emailToRemove) => {
    const confirmDelete = window.confirm(`Are you sure you want to kick ${emailToRemove} from the group?`);
    if (!confirmDelete) return;

    try {
      await familyApi.delete(`/groups/${groupId}/members?memberEmail=${emailToRemove}&requesterEmail=${currentUserEmail}`);
      fetchGroupDetails();
    } catch (error) {
      console.error("Error removing member:", error);
      alert("Failed to remove member. Only the leader can do this.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button onClick={onBack} style={styles.backBtn}>←</button>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h2 style={styles.title}>{groupDetails?.name || 'Group Chat'}</h2>
            <span style={{ fontSize: '11px', color: '#888' }}>
              {groupDetails?.members?.length || 1} members
            </span>
          </div>
        </div>
        <button onClick={() => setShowMembersModal(true)} style={styles.manageBtn}>Manage</button>
      </div>

      <div style={styles.chatWindow}>
        <p style={{ textAlign: 'center', fontSize: '10px', color: '#666', margin: '10px 0' }}>
          Group Chat established. Messages are shared with all members.
        </p>
        
        {messages.map((msg) => {
          const isMe = msg.senderEmail === currentUserEmail;
          return (
            <div key={msg.id} style={{ ...styles.messageBubbleContainer, justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
              <div style={{ ...styles.messageBubble, backgroundColor: isMe ? '#ff4d4d' : '#2a2d35', color: isMe ? '#000' : '#fff' }}>
                {!isMe && <span style={{ fontSize: '10px', color: '#ffc107', fontWeight: 'bold', marginBottom: '2px' }}>{msg.senderEmail.split('@')[0]}</span>}
                <p style={{ margin: 0, fontSize: '14px' }}>{msg.text}</p>
                <span style={{ fontSize: '9px', opacity: 0.6, alignSelf: 'flex-end', marginTop: '4px' }}>{msg.timestamp}</span>
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSendMessage} style={styles.chatInputContainer}>
        <input 
          type="text" 
          placeholder="Type a group message..." 
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          style={styles.chatInput}
        />
        <button type="submit" style={styles.sendBtn}>➤</button>
      </form>

      {/* Leader Management Modal */}
      {showMembersModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ margin: 0 }}>Manage Group</h3>
              <button onClick={() => setShowMembersModal(false)} style={styles.closeBtn}>✕</button>
            </div>
            
            <div style={styles.memberListContainer}>
              {groupDetails?.members.map(email => {
                const isLeader = email === groupDetails.leaderEmail;
                const canIKick = currentUserEmail === groupDetails.leaderEmail && !isLeader;

                return (
                  <div key={email} style={styles.memberRow}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '14px', color: '#fff' }}>{email.split('@')[0]}</span>
                      <span style={{ fontSize: '10px', color: '#888' }}>{email}</span>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                      {isLeader && <span style={styles.leaderBadge}>Leader</span>}
                      {canIKick && (
                        <button onClick={() => handleRemoveMember(email)} style={styles.kickBtn}>Kick</button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            <hr style={{ borderColor: '#2a2d35', margin: '20px 0' }} />

            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Add Participant</h4>
            <form onSubmit={handleAddMember} style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="email" 
                placeholder="user@example.com" 
                value={newMemberEmail} 
                onChange={(e) => setNewMemberEmail(e.target.value)} 
                style={styles.modalInput} 
                required 
              />
              <button type="submit" style={styles.modalAddBtn}>Add</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { backgroundColor: '#0a0a0c', minHeight: '100vh', display: 'flex', flexDirection: 'column', color: '#fff', fontFamily: 'sans-serif', position: 'relative' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderBottom: '1px solid #1a1c23', backgroundColor: '#16181d' },
  backBtn: { background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer', marginRight: '15px' },
  title: { margin: 0, fontSize: '18px' },
  manageBtn: { backgroundColor: 'transparent', border: '1px solid #ff4d4d', color: '#ff4d4d', padding: '6px 12px', borderRadius: '16px', fontSize: '12px', cursor: 'pointer' },
  chatWindow: { flex: 1, display: 'flex', flexDirection: 'column', padding: '20px', overflowY: 'auto', backgroundColor: '#0a0a0c' },
  messageBubbleContainer: { display: 'flex', width: '100%', marginBottom: '15px' },
  messageBubble: { maxWidth: '75%', padding: '10px 15px', borderRadius: '12px', display: 'flex', flexDirection: 'column' },
  chatInputContainer: { display: 'flex', padding: '15px', backgroundColor: '#16181d', borderTop: '1px solid #2a2d35', gap: '10px' },
  chatInput: { flex: 1, padding: '15px', backgroundColor: '#0a0a0c', border: '1px solid #2a2d35', borderRadius: '24px', color: '#fff', fontSize: '14px' },
  sendBtn: { backgroundColor: '#ff4d4d', color: '#000', border: 'none', width: '50px', height: '50px', borderRadius: '50%', fontSize: '18px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  
  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalContent: { backgroundColor: '#16181d', padding: '25px', borderRadius: '12px', width: '90%', maxWidth: '350px', border: '1px solid #2a2d35' },
  closeBtn: { background: 'none', border: 'none', color: '#888', fontSize: '18px', cursor: 'pointer' },
  memberListContainer: { maxHeight: '150px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' },
  memberRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0a0a0c', padding: '10px', borderRadius: '6px' },
  leaderBadge: { fontSize: '10px', color: '#ff4d4d', border: '1px solid #ff4d4d', padding: '2px 6px', borderRadius: '10px' },
  kickBtn: { backgroundColor: '#dc3545', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', cursor: 'pointer' },
  modalInput: { flex: 1, padding: '10px', backgroundColor: '#0a0a0c', border: '1px solid #2a2d35', borderRadius: '6px', color: '#fff', boxSizing: 'border-box' },
  modalAddBtn: { backgroundColor: '#ff4d4d', color: '#000', border: 'none', padding: '10px 15px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }
};

export default GroupChat;