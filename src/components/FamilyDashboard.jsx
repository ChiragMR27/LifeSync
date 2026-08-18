import React, { useState, useEffect } from 'react';
import { familyApi } from '../api/axiosConfig';

const FamilyDashboard = ({ onNavigate }) => {
  const [groups, setGroups] = useState([]);

  const fetchGroups = async () => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      const response = await familyApi.get(`/groups?email=${userEmail}`);
      setGroups(response.data);
    } catch (error) {
      console.error("Error fetching groups from database:", error);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={{ fontSize: '20px', margin: 0 }}>LifeSync App</h1>
      </div>
      
      <div style={styles.content}>
        {groups.length === 0 ? (
          <div style={styles.emptyStateContainer}>
            <div style={styles.iconCircle}>
              <span style={{ fontSize: '32px' }}>👥</span>
            </div>
            <h2 style={styles.emptyStateTitle}>You haven't joined any groups yet</h2>
            <p style={styles.emptyStateSubtext}>
              Create or join a group to get started. Share grocery lists, workout trackers, and household chores!
            </p>
            <button style={styles.createButton} onClick={() => onNavigate('create-group')}>
              + Create Group
            </button>
          </div>
        ) : (
          <div style={styles.activeGroupsContainer}>
            <h2 style={styles.sectionTitle}>Your Active Groups</h2>
            <div style={styles.groupList}>
              {groups.map((group) => (
                <div 
                  key={group.id} 
                  style={styles.groupCard}
                  onClick={() => group.type === 'Grocery' ? onNavigate('grocery-list', group.id) : null}
                >
                  <div>
                    <h3 style={styles.groupName}>{group.name}</h3>
                    <p style={styles.groupMembers}>👥 {group.membersCount} members</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ ...styles.badge, color: group.badgeColor, backgroundColor: `${group.badgeColor}20` }}>
                      {group.type}
                    </span>
                    <span style={{ color: '#666', fontSize: '20px' }}>›</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px' }}>
              <button style={styles.floatingCreateButton} onClick={() => onNavigate('create-group')}>
                + Create Group
              </button>
            </div>
          </div>
        )}
      </div>

      <div style={styles.bottomNav}>
        <div style={{ ...styles.navItem, color: '#ffc107' }} onClick={() => onNavigate('home')}>
          <span style={styles.navIcon}>🏠</span>
          <span>Home</span>
        </div>
        <div style={styles.navItem} onClick={() => onNavigate('chat-dashboard')}>
          <span style={styles.navIcon}>💬</span>
          <span>Chat</span>
        </div>
        <div style={styles.navItem} onClick={() => onNavigate('create-user')}>
          <span style={styles.navIcon}>➕</span>
          <span>Add User</span>
        </div>
        <div style={styles.navItem} onClick={() => onNavigate('profile')}>
          <span style={styles.navIcon}>👤</span>
          <span>Profile</span>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', flexDirection: 'column', height: '100%', color: '#fff', fontFamily: 'sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', borderBottom: '1px solid #1a1c23' },
  content: { padding: '20px', flex: 1, paddingBottom: '80px' },
  emptyStateContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', paddingTop: '60px' },
  iconCircle: { width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#1a1c23', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px' },
  emptyStateTitle: { fontSize: '20px', fontWeight: '600', marginBottom: '10px' },
  emptyStateSubtext: { fontSize: '14px', color: '#888', maxWidth: '300px', lineHeight: '1.5', marginBottom: '30px' },
  createButton: { backgroundColor: '#00e5ff', color: '#000', border: 'none', padding: '15px 40px', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', width: '100%', maxWidth: '300px' },
  activeGroupsContainer: { paddingTop: '10px' },
  sectionTitle: { fontSize: '16px', marginBottom: '15px' },
  groupList: { display: 'flex', flexDirection: 'column', gap: '15px' },
  groupCard: { backgroundColor: '#16181d', borderRadius: '12px', padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' },
  groupName: { margin: 0, fontSize: '16px', fontWeight: '600', marginBottom: '6px' },
  groupMembers: { margin: 0, fontSize: '12px', color: '#888' },
  badge: { padding: '4px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: 'bold' },
  floatingCreateButton: { backgroundColor: '#00e5ff', color: '#000', border: 'none', padding: '12px 24px', borderRadius: '24px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' },
  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#0a0a0c', borderTop: '1px solid #1a1c23', display: 'flex', justifyContent: 'space-around', padding: '15px 0' },
  navItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#666', fontSize: '10px', cursor: 'pointer' },
  navIcon: { fontSize: '18px', marginBottom: '4px' }
};

export default FamilyDashboard;