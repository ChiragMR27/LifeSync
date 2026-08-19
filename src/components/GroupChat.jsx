import React, { useState, useEffect, useRef } from 'react';
import { familyApi, authApi } from '../api/axiosConfig';

const GroupChat = ({ groupId, onBack }) => {
  const [groupDetails, setGroupDetails] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  
  const [memberUsernames, setMemberUsernames] = useState({});
  const [isLoading, setIsLoading] = useState(true); 

  // THE FIX: Notification trackers
  const prevMsgLength = useRef(0);
  const initialLoadDone = useRef(false);

  const currentUserEmail = String(localStorage.getItem('userEmail') || '').toLowerCase().trim();

  // Ask for permission on load
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const fetchGroupDetails = async () => {
    try {
      const response = await familyApi.get(`/groups?email=${currentUserEmail}`);
      const currentGroup = response.data.find(g => String(g.id) === String(groupId));
      
      if (currentGroup) {
        setGroupDetails({
          ...currentGroup,
          leaderEmail: String(currentGroup.leaderEmail || '').toLowerCase().trim(),
          members: (currentGroup.members || []).map(m => String(m).toLowerCase().trim())
        });
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

  const fetchMemberUsernames = async (membersList) => {
    if (!membersList || membersList.length === 0) return;
    try {
      const response = await authApi.post('/get-usernames', membersList);
      setMemberUsernames(response.data);
    } catch (error) {
      console.error("Error fetching usernames:", error);
    }
  };

  useEffect(() => {
    let interval;
    const loadData = async () => {
      if (groupId) {
        setIsLoading(true);
        initialLoadDone.current = false;
        await fetchGroupDetails();
        await fetchMessages();
        setIsLoading(false);
        interval = setInterval(fetchMessages, 3000); 
      }
    };
    loadData();
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [groupId]);

  useEffect(() => {
    if (!isLoading) {
      initialLoadDone.current = true;
    }
  }, [isLoading]);

  // THE FIX: Trigger Native Notification if a new group message arrives!
  useEffect(() => {
    if (initialLoadDone.current && messages.length > prevMsgLength.current) {
      const newMsg = messages[messages.length - 1];
      if (newMsg && newMsg.senderEmail !== currentUserEmail && Notification.permission === 'granted') {
        const senderName = memberUsernames[newMsg.senderEmail] || newMsg.senderEmail.split('@')[0];
        
        const notif = new Notification(`${groupDetails?.name || 'Group Chat'}`, { 
          body: `${senderName}: ${newMsg.text}`
        });
        notif.onclick = () => window.focus();
      }
    }
    prevMsgLength.current = messages.length;
  }, [messages, currentUserEmail, memberUsernames, groupDetails]);

  useEffect(() => {
    if (groupDetails?.members) {
      fetchMemberUsernames(groupDetails.members);
    }
  }, [groupDetails?.members]);

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

  const handleMakeLeader = async (email) => {
    try {
      await familyApi.put(`/groups/${groupId}/leader`, { newLeaderEmail: email });
      fetchGroupDetails(); 
    } catch (error) {
      console.error("Error transferring leadership:", error);
    }
  };

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
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>

      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
          <button onClick={onBack} style={styles.backBtn}>←</button>
          
          <div 
            style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer', flex: 1, paddingLeft: '5px' }}
            onClick={() => setShowMembersModal(true)}
          >
            <h2 style={styles.title}>{groupDetails?.name || 'Loading...'}</h2>
            <span style={{ fontSize: '11px', color: '#888' }}>
              {groupDetails?.members?.length || 1} members • Tap for info
            </span>
          </div>
        </div>
      </div>

      <div style={styles.chatWindow}>
        {isLoading ? (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner} />
            <span style={styles.loadingText}>Loading messages...</span>
          </div>
        ) : (
          <>
            <p style={{ textAlign: 'center', fontSize: '10px', color: '#666', margin: '10px 0' }}>
              Group Chat established. Messages are shared with all members.
            </p>
            
            {messages.map((msg) => {
              const isMe = msg.senderEmail === currentUserEmail;
              const senderName = memberUsernames[msg.senderEmail] || msg.senderEmail.split('@')[0];

              return (
                <div key={msg.id} style={{ ...styles.messageBubbleContainer, justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                  <div style={{ ...styles.messageBubble, backgroundColor: isMe ? '#ff66b2' : '#2a2d35', color: isMe ? '#000' : '#fff' }}>
                    {!isMe && <span style={{ fontSize: '10px', color: '#ffc107', fontWeight: 'bold', marginBottom: '4px' }}>{senderName}</span>}
                    
                    <div style={{ display: 'flex', alignItems: 'flex-end', flexWrap: 'wrap', gap: '8px' }}>
                      <span style={{ fontSize: '14px', wordBreak: 'break-word', lineHeight: '1.4' }}>{msg.text}</span>
                      <span style={{ fontSize: '9px', opacity: 0.6, marginLeft: 'auto', paddingTop: '5px', whiteSpace: 'nowrap' }}>{msg.timestamp}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
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

      {showMembersModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ margin: 0 }}>Group Info</h3>
              <button onClick={() => setShowMembersModal(false)} style={styles.closeBtn}>✕</button>
            </div>
            
            <div style={styles.memberListContainer}>
              {groupDetails?.members.map(email => {
                const isLeader = email === groupDetails.leaderEmail;
                const canIKickAndPromote = currentUserEmail === groupDetails.leaderEmail && !isLeader;
                const displayUsername = memberUsernames[email] || email.split('@')[0];

                return (
                  <div key={email} style={styles.memberRow}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '14px', color: '#fff', fontWeight: 'bold' }}>{displayUsername}</span>
                      <span style={{ fontSize: '10px', color: '#888' }}>{email}</span>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                      {isLeader && <span style={styles.leaderBadge}>Leader</span>}
                      {canIKickAndPromote && (
                        <>
                          <button onClick={() => handleMakeLeader(email)} style={styles.makeLeaderBtn}>Make Leader</button>
                          <button onClick={() => handleRemoveMember(email)} style={styles.kickBtn}>Kick</button>
                        </>
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
  chatWindow: { flex: 1, display: 'flex', flexDirection: 'column', padding: '20px', overflowY: 'auto', backgroundColor: '#0a0a0c' },
  messageBubbleContainer: { display: 'flex', width: '100%', marginBottom: '15px' },
  messageBubble: { maxWidth: '75%', width: 'fit-content', padding: '10px 15px', borderRadius: '12px', display: 'flex', flexDirection: 'column' },
  chatInputContainer: { display: 'flex', padding: '15px', backgroundColor: '#16181d', borderTop: '1px solid #2a2d35', gap: '10px' },
  chatInput: { flex: 1, padding: '15px', backgroundColor: '#0a0a0c', border: '1px solid #2a2d35', borderRadius: '24px', color: '#fff', fontSize: '14px' },
  sendBtn: { backgroundColor: '#ff66b2', color: '#000', border: 'none', width: '50px', height: '50px', borderRadius: '50%', fontSize: '18px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalContent: { backgroundColor: '#16181d', padding: '25px', borderRadius: '12px', width: '90%', maxWidth: '350px', border: '1px solid #2a2d35' },
  closeBtn: { background: 'none', border: 'none', color: '#888', fontSize: '18px', cursor: 'pointer' },
  memberListContainer: { maxHeight: '150px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' },
  memberRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0a0a0c', padding: '10px', borderRadius: '6px' },
  leaderBadge: { fontSize: '10px', color: '#ff66b2', border: '1px solid #ff66b2', padding: '2px 6px', borderRadius: '10px' },
  makeLeaderBtn: { backgroundColor: 'transparent', border: '1px solid #ffc107', color: '#ffc107', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', cursor: 'pointer' },
  kickBtn: { backgroundColor: '#dc3545', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', cursor: 'pointer' },
  modalInput: { flex: 1, padding: '10px', backgroundColor: '#0a0a0c', border: '1px solid #2a2d35', borderRadius: '6px', color: '#fff', boxSizing: 'border-box' },
  modalAddBtn: { backgroundColor: '#ff66b2', color: '#000', border: 'none', padding: '10px 15px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' },
  loadingContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', paddingTop: '80px', gap: '15px' },
  spinner: { width: '40px', height: '40px', border: '4px solid rgba(255, 102, 178, 0.1)', borderTop: '4px solid #ff66b2', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  loadingText: { color: '#888', fontSize: '14px' }
};

export default GroupChat;