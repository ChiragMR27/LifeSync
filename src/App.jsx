import React, { useState } from 'react';
import Auth from './components/Auth';
import FamilyDashboard from './components/FamilyDashboard';
import './App.css';

function App() {
  // Check if a token already exists in localStorage when the app loads
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  // Function to wipe the token and log the user out
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  return (
    <div>
      {/* Basic Navigation Bar */}
      <header style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 30px', backgroundColor: '#282c34', color: 'white' }}>
        <h1 style={{ margin: 0  }}>LifeSync App</h1>
        {isAuthenticated && (
          <button onClick={handleLogout} style={{ padding: '5px 15px', cursor: 'pointer', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}>
            Logout
          </button>
        )}
      </header>

      {/* Main Content Area */}
      <main>
        {!isAuthenticated ? (
          // If NOT logged in, show the Auth screen
          <Auth onLoginSuccess={() => setIsAuthenticated(true)} />
        ) : (
          // If logged in, show the actual Family Dashboard
          <FamilyDashboard />
        )}
      </main>
    </div>
  );
}

export default App;