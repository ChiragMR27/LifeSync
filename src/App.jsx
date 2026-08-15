import React, { useState } from 'react';
import Auth from './components/Auth';
import FamilyDashboard from './components/FamilyDashboard';
import GroceryList from './components/GroceryList';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [activeTab, setActiveTab] = useState('family'); 

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setActiveTab('family'); 
  };

  return (
    <div>
      {/* 
        The entire header (including the title and buttons) 
        will ONLY show up if the user is authenticated 
      */}
      {isAuthenticated && (
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 30px', backgroundColor: '#282c34', color: 'white' }}>
          <h1 style={{ margin: 0 }}>LifeSync App</h1>
          
          <div style={{ display: 'flex', gap: '15px' }}>
            <button 
              onClick={() => setActiveTab('family')} 
              style={{ padding: '8px 15px', cursor: 'pointer', backgroundColor: activeTab === 'family' ? '#007bff' : '#6c757d', color: 'white', border: 'none', borderRadius: '4px' }}>
              Family Members
            </button>
            <button 
              onClick={() => setActiveTab('groceries')} 
              style={{ padding: '8px 15px', cursor: 'pointer', backgroundColor: activeTab === 'groceries' ? '#ffc107' : '#6c757d', color: '#000', border: 'none', borderRadius: '4px' }}>
              Groceries
            </button>
            <button onClick={handleLogout} style={{ padding: '8px 15px', cursor: 'pointer', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}>
              Logout
            </button>
          </div>
        </header>
      )}

      <main>
        {!isAuthenticated ? (
          <Auth onLoginSuccess={() => setIsAuthenticated(true)} />
        ) : (
          <div>
            {activeTab === 'family' && <FamilyDashboard />}
            {activeTab === 'groceries' && <GroceryList />}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;