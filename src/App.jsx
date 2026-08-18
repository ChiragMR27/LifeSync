import React, { useState } from 'react';
import Auth from './components/Auth';
import FamilyDashboard from './components/FamilyDashboard';
import CreateGroup from './components/CreateGroup';
import GroceryList from './components/GroceryList';
import Profile from './components/Profile'; 
import CreateUser from './components/CreateUser'; 
import ChatDashboard from './components/ChatDashboard'; 
import GroupChat from './components/GroupChat'; // NEW: Group Chat UI
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [currentView, setCurrentView] = useState('home'); 
  
  const [activeGroupId, setActiveGroupId] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    setIsAuthenticated(false);
    setCurrentView('home'); 
  };

  const handleNavigate = (view, groupId = null) => {
    if (groupId) setActiveGroupId(groupId);
    setCurrentView(view);
  };

  return (
    <div style={{ backgroundColor: '#000', minHeight: '100vh', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '400px', backgroundColor: '#0a0a0c', position: 'relative', overflowY: 'auto', overflowX: 'hidden', minHeight: '100vh' }}>
        
        {!isAuthenticated ? (
          <Auth onLoginSuccess={() => setIsAuthenticated(true)} />
        ) : (
          <>
            {currentView === 'home' && (
              <FamilyDashboard 
                onNavigate={handleNavigate} 
                onLogout={handleLogout} 
              />
            )}
            {currentView === 'create-group' && (
              <CreateGroup 
                onBack={() => setCurrentView('home')} 
                onCreate={() => setCurrentView('home')} 
              />
            )}
            {currentView === 'grocery-list' && (
              <GroceryList 
                groupId={activeGroupId} 
                onBack={() => setCurrentView('home')} 
              />
            )}
            {currentView === 'profile' && (
              <Profile 
                onBack={() => setCurrentView('home')} 
                onLogout={handleLogout}
              />
            )}
            {currentView === 'create-user' && (
              <CreateUser 
                onBack={() => setCurrentView('home')} 
              />
            )}
            {currentView === 'chat-dashboard' && (
              <ChatDashboard 
                onBack={() => setCurrentView('home')} 
              />
            )}
            {/* THE FIX: Added routing for the WhatsApp-style Group Chat */}
            {currentView === 'group-chat' && (
              <GroupChat 
                groupId={activeGroupId}
                onBack={() => setCurrentView('home')} 
              />
            )}
          </>
        )}

      </div>
    </div>
  );
}

export default App;