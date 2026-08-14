import React, { useState } from 'react';
import Auth from './components/Auth';
import FamilyDashboard from './components/FamilyDashboard';
import GroceryList from './components/GroceryList'; // Import the new component
import './App.css';

function App() {
  // Check if a token already exists in localStorage when the app loads
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  
  // State to track which dashboard is currently visible
  const [activeTab, setActiveTab] = useState('family'); 

  // Function to wipe the token and log the user out
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setActiveTab('family'); // Reset to default view on logout
  };

  return (
    <div>
      {/* Basic Navigation Bar */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 30px', backgroundColor: '#282c34', color: 'white' }}>
        <h1 style={{ margin: 0 }}>LifeSync App</h1>
        
        {/* Navigation buttons show only if logged in */}
        {isAuthenticated && (
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
        )}
      </header>

      {/* Main Content Area */}
      <main>
        {!isAuthenticated ? (
          // If NOT logged in, show the Auth screen
          <Auth onLoginSuccess={() => setIsAuthenticated(true)} />
        ) : (
          // If logged in, conditionally render the selected tab
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