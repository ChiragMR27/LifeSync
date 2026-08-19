import React, { useState, useEffect } from 'react';
import { authApi, familyApi } from './api/axiosConfig';
import Auth from './components/Auth';
import FamilyDashboard from './components/FamilyDashboard';
import CreateGroup from './components/CreateGroup';
import GroceryList from './components/GroceryList';
import Profile from './components/Profile'; 
import CreateUser from './components/CreateUser'; 
import ChatDashboard from './components/ChatDashboard'; 
import GroupChat from './components/GroupChat'; 
import './App.css';

const PUBLIC_VAPID_KEY = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U=';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [currentView, setCurrentView] = useState('home'); 
  const [activeGroupId, setActiveGroupId] = useState(null);

  // THE FIX: Bulletproof Background Push Registration
  useEffect(() => {
    const initPush = async () => {
      if (isAuthenticated && 'serviceWorker' in navigator && 'PushManager' in window) {
        try {
          // 1. Force the permission prompt BEFORE subscribing
          const permission = await Notification.requestPermission();
          if (permission !== 'granted') return;

          // 2. Register the background script
          const registration = await navigator.serviceWorker.register('/service-worker.js');
          
          // 3. CRITICAL: Clear out any old ghost subscriptions that cause silent failures
          const existingSub = await registration.pushManager.getSubscription();
          if (existingSub) {
            await existingSub.unsubscribe();
          }

          // 4. Generate the fresh device subscription
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY)
          });

          // 5. Strictly lowercase the email so Java's ConcurrentHashMap finds it perfectly!
          const email = String(localStorage.getItem('userEmail') || '').toLowerCase().trim();
          const subJson = subscription.toJSON();

          // 6. Send the device keys to Java
          authApi.post(`/chat/subscribe?email=${email}`, subJson).catch(console.error);
          familyApi.post(`/groups/subscribe?email=${email}`, subJson).catch(console.error);
          
        } catch (err) {
          console.error("Background Push registration failed:", err);
        }
      }
    };
    
    initPush();
  }, [isAuthenticated]);

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