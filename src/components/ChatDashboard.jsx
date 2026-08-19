import React, { useState, useEffect, useRef } from 'react';
import { authApi } from '../api/axiosConfig';

const ChatDashboard = ({ onBack }) => {
  const [searchEmail, setSearchEmail] = useState('');
  const [activeChat, setActiveChat] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState([]);
  
  const [recentChats, setRecentChats] = useState([]);
  
  const [isRecentLoading, setIsRecentLoading] = useState(true);
  const [isChatLoading, setIsChatLoading] = useState(false);

  const [toast, setToast] = useState({ show: false, title: '', body: '' });
  const prevMsgLength = useRef(0);
  const initialLoadDone = useRef(false);

  const currentUserEmail = String(localStorage.getItem('userEmail') || '').toLowerCase().trim();

  // Request native OS notification permission on load
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const triggerNativeNotification = (title, body) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const notif = new Notification(title, {
          body: body,
          icon: '/favicon.ico'
        });
        notif.onclick = () => {
          window.focus();
        };
      } catch (err) {
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.ready.then((reg) => {
            reg.showNotification(title, { body, icon: '/favicon.ico' });
          });
        }
      }
    }
  };

  const showToast = (title, body) => {
    setToast({ show: true, title, body });
    setTimeout(() => setToast({ show: false, title: '', body: '' }), 4000);
  };

  const fetchRecentChats = async () => {
    try {
      const response = await authApi.get(`/chat/recent?email=${currentUserEmail}`);
      setRecentChats(response.data);
    } catch (error) {
      console.error("Error fetching recent chats:", error);
    } finally {
      setIsRecentLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!activeChat) return;
    try {
      const response = await authApi.get(`/chat/history?user1=${currentUserEmail}&user2=${activeChat}`);
      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  useEffect(() => {
    if (!activeChat) {
      setIsRecentLoading(true);
      fetchRecentChats();
      const interval = setInterval(fetchRecentChats, 5000); 
      return () => clearInterval(interval);
    }
  }, [activeChat]);

  useEffect(() => {
    if (activeChat) {
      setIsChatLoading(true);
      initialLoadDone.current = false;
      fetchMessages().then(() => setIsChatLoading(false));
      const interval = setInterval(fetchMessages, 3000); 
      return () => clearInterval(interval);
    }
  }, [activeChat]);

  useEffect(() => {
    if (!isChatLoading) {
      initialLoadDone.current = true;
    }
  }, [isChatLoading]);

  // Triggers OS notification when app/tab is in the background
  useEffect(() => {
    if (initialLoadDone.current && messages.length > prevMsgLength.current) {
      const newMsg = messages[messages.length - 1];
      if (newMsg && newMsg.senderEmail !== currentUserEmail) {
        const senderName = recentChats.find(c => c.email === newMsg.senderEmail)?.username || newMsg.senderEmail.split('@')[0];
        showToast(`New message from ${senderName}`, newMsg.text);
        triggerNativeNotification(`Message from ${senderName}`, newMsg.text);
      }
    }
    prevMsgLength.current = messages.length;
  }, [messages, currentUserEmail, recentChats]);

  const handleSearchAndChat = async (e) => {
    e.preventDefault();
    const emailToCheck = searchEmail.toLowerCase().trim();

    if (!emailToCheck) return;

    if (emailToCheck === currentUserEmail) {
      alert("You can't start a chat with yourself!");
      return;
    }

    try {
      const checkResponse = await authApi.get(`/check-email?email=${emailToCheck}`);
      const userExists = checkResponse.data; 

      if (userExists) {
        setActiveChat(emailToCheck);
        setSearchEmail('');
      } else {
        const shareData = {
          title: 'Chat with me privately on LifeSync!',
          text: `Hey! I want to chat with you on LifeSync. Sign up with the email ${emailToCheck} so we can message each other directly!`,
          url: window.location.origin 
        };

        if (navigator.share) {
          await navigator.share(shareData);
        } else {
          alert(`User not found! Invite them:\n\n${shareData.text}`);
        }
      }
    } catch (error) {
      console.error("Error checking user:", error);
      alert("Something went wrong verifying the user.");
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    const newMsg = {
      senderEmail: currentUserEmail,
      receiverEmail: activeChat,
      text: messageInput,
      timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };

    try {
      await authApi.post('/chat/send', newMsg);
      setMessageInput('');
      fetchMessages(); 
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  if (activeChat) {
    const activeContact = recentChats.find(c => c.email === activeChat);
    const displayName = activeContact ? activeContact.username : activeChat.split('@')[0];

    return (
      <div style={styles.container}>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } } @keyframes slideDown { from { top: -50px; opacity: 0; } to { top: 20px; opacity: 1; } }`}</style>
        
        {toast.show && (
          <div style={styles.toastContainer}>
            <div style={styles.toastIcon}>💬</div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>{toast.title}</span>
              <span style={{ fontSize: '12px', color: '#ccc', marginTop: '2px' }}>{toast.body}</span>
            </div>
          </div>
        )}

        <div style={styles.header}>
          <button onClick={() => setActiveChat(null)} style={styles.backBtn}>←</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={styles.avatarMini}>👤</div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <h2 style={styles.title}>{displayName}</h2>
              <span style={{ fontSize: '10px', color: '#888', marginTop: '2px' }}>{activeChat}</span>
            </div>
          </div>
        </div>

        <div style={styles.chatWindow}>
          {isChatLoading ? (
            <div style={styles.loadingContainer}>
              <div style={styles.spinner} />
              <span style={styles.loadingText}>Loading messages...</span>
            </div>
          ) : (
            <>
              <p style={{ textAlign: 'center', fontSize: '10px', color: '#666', margin: '10px 0' }}>
                Private Chat established. End-to-end simulated.
              </p>
              
              {messages.map((msg) => {
                const isMe = msg.senderEmail === currentUserEmail;
                return (
                  <div key={msg.id} style={{ ...styles.messageBubbleContainer, justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                    <div style={{ ...styles.messageBubble, backgroundColor: isMe ? '#ff66b2' : '#2a2d35', color: isMe ? '#000' : '#fff' }}>
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
            placeholder="Type a message..." 
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            style={styles.chatInput}
          />
          <button type="submit" style={styles.sendBtn}>➤</button>
        </form>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      
      <div style={styles.header}>
        <button onClick={onBack} style={styles.backBtn}>←</button>
        <h2 style={styles.title}>Direct Messages</h2>
      </div>

      <div style={styles.content}>
        <div style={styles.searchContainer}>
          <form onSubmit={handleSearchAndChat} style={{ display: 'flex', gap: '10px' }}>
            <input 
              type="email" 
              placeholder="Search user by email..." 
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              style={styles.searchInput}
              required
            />
            <button type="submit" style={styles.searchBtn}>Chat</button>
          </form>
        </div>

        <div style={{ marginTop: '30px' }}>
          <h3 style={{ fontSize: '14px', color: '#666', borderBottom: '1px solid #2a2d35', paddingBottom: '10px' }}>Recent Chats</h3>
          
          {isRecentLoading ? (
            <div style={styles.loadingContainer}>
              <div style={styles.spinner} />
              <span style={styles.loadingText}>Loading chats...</span>
            </div>
          ) : recentChats.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#444', fontSize: '12px', marginTop: '20px' }}>No active conversations yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
              {recentChats.map((contact, index) => (
                <div 
                  key={index} 
                  style={styles.recentChatCard} 
                  onClick={() => setActiveChat(contact.email)}
                >
                  <div style={{ ...styles.avatarMini, width: '40px', height: '40px', fontSize: '18px' }}>👤</div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff' }}>{contact.username}</span>
                    <span style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>{contact.email}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { backgroundColor: '#0a0a0c', minHeight: '100vh', display: 'flex', flexDirection: 'column', color: '#fff', fontFamily: 'sans-serif', position: 'relative' },
  header: { display: 'flex', alignItems: 'center', padding: '20px', borderBottom: '1px solid #1a1c23', backgroundColor: '#16181d' },
  backBtn: { background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer', marginRight: '15px' },
  title: { margin: 0, fontSize: '18px' },
  avatarMini: { width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#2a2d35', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '14px' },
  content: { padding: '20px', flex: 1 },
  searchContainer: { backgroundColor: '#16181d', padding: '20px', borderRadius: '12px', border: '1px solid #2a2d35' },
  searchInput: { flex: 1, padding: '12px', backgroundColor: '#0a0a0c', border: '1px solid #2a2d35', borderRadius: '8px', color: '#fff', fontSize: '14px' },
  searchBtn: { backgroundColor: '#ff66b2', color: '#000', border: 'none', padding: '0 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
  chatWindow: { flex: 1, display: 'flex', flexDirection: 'column', padding: '20px', overflowY: 'auto', backgroundColor: '#0a0a0c' },
  messageBubbleContainer: { display: 'flex', width: '100%', marginBottom: '15px' },
  messageBubble: { maxWidth: '75%', width: 'fit-content', padding: '10px 15px', borderRadius: '12px', display: 'flex', flexDirection: 'column' },
  chatInputContainer: { display: 'flex', padding: '15px', backgroundColor: '#16181d', borderTop: '1px solid #2a2d35', gap: '10px' },
  chatInput: { flex: 1, padding: '15px', backgroundColor: '#0a0a0c', border: '1px solid #2a2d35', borderRadius: '24px', color: '#fff', fontSize: '14px' },
  sendBtn: { backgroundColor: '#ff66b2', color: '#000', border: 'none', width: '50px', height: '50px', borderRadius: '50%', fontSize: '18px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  recentChatCard: { display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', backgroundColor: '#16181d', borderRadius: '8px', cursor: 'pointer', border: '1px solid #2a2d35' },
  loadingContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', paddingTop: '40px', gap: '15px' },
  spinner: { width: '40px', height: '40px', border: '4px solid rgba(255, 102, 178, 0.1)', borderTop: '4px solid #ff66b2', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  loadingText: { color: '#888', fontSize: '14px' },
  toastContainer: { position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#16181d', border: '1px solid #ff66b2', borderRadius: '12px', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '15px', boxShadow: '0 8px 24px rgba(0,0,0,0.8)', zIndex: 9999, width: '85%', maxWidth: '350px', animation: 'slideDown 0.3s ease-out' },
  toastIcon: { fontSize: '24px' }
};

export default ChatDashboard;