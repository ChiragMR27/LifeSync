import React, { useState, useEffect } from 'react';
import { familyApi } from '../api/axiosConfig';

const GroceryList = ({ groupId, onBack }) => {
  const [activeTab, setActiveTab] = useState('shopping'); 
  const [newItem, setNewItem] = useState('');
  const [items, setItems] = useState([]);
  
  // Member & Leader States
  const [membersCount, setMembersCount] = useState(1);
  const [membersList, setMembersList] = useState([]);
  const [leaderEmail, setLeaderEmail] = useState('');
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');

  // Quantity Modal States
  const [showQuantityModal, setShowQuantityModal] = useState(false);
  const [itemToMove, setItemToMove] = useState(null);
  const [isDirectAdd, setIsDirectAdd] = useState(false);
  const [quantity, setQuantity] = useState(0.25);
  const [unit, setUnit] = useState('kg');

  // THE FIX: Sanitize the logged-in email (lowercase and remove spaces)
  const currentUserEmail = String(localStorage.getItem('userEmail') || '').toLowerCase().trim();

  const fetchGroupDetails = async () => {
    try {
      // THE FIX: We must pass the email parameter here because the backend now strictly requires it!
      const response = await familyApi.get(`/groups?email=${currentUserEmail}`);
      
      // We also force both IDs to Strings just in case React Router passed the ID as text
      const currentGroup = response.data.find(g => String(g.id) === String(groupId));
      
      if (currentGroup) {
        setMembersCount(currentGroup.membersCount);
        setLeaderEmail(String(currentGroup.leaderEmail || '').toLowerCase().trim());
        
        const cleanMembers = (currentGroup.members || []).map(m => String(m || '').toLowerCase().trim());
        setMembersList(cleanMembers);
      }
    } catch (error) {
      console.error("Error fetching group details:", error);
    }
  };

  const fetchGroceries = async () => {
    try {
      const response = await familyApi.get(`/groups/${groupId}/groceries`);
      setItems(response.data);
    } catch (error) {
      console.error("Error fetching groceries:", error);
    }
  };

  useEffect(() => {
    if (groupId) {
      fetchGroupDetails();
      fetchGroceries();
    }
  }, [groupId]);

  const handleAddItem = async (e, isDefaultTarget) => {
    e.preventDefault();
    if (!newItem) return;

    if (!isDefaultTarget) {
      setItemToMove({ text: newItem, isDefault: false, inCart: true, addedBy: currentUserEmail, claimedBy: null });
      setIsDirectAdd(true);
      setShowQuantityModal(true);
      return;
    }

    const payload = {
      text: newItem,
      isDefault: true, 
      inCart: false, 
      addedBy: currentUserEmail,
      claimedBy: null
    };

    try {
      await familyApi.post(`/groups/${groupId}/groceries`, payload);
      setNewItem('');
      fetchGroceries(); 
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  const updateItem = async (item, updates) => {
    try {
      await familyApi.put(`/groups/${groupId}/groceries/${item.id}`, { ...item, ...updates });
      fetchGroceries();
    } catch (error) {
      console.error("Error updating item:", error);
    }
  };

  const confirmQuantityAndMove = async () => {
    try {
      if (isDirectAdd) {
        const payload = { ...itemToMove, quantity: parseFloat(quantity), unit };
        await familyApi.post(`/groups/${groupId}/groceries`, payload);
        setNewItem('');
      } else {
        await familyApi.put(`/groups/${groupId}/groceries/${itemToMove.id}`, { 
          ...itemToMove, 
          inCart: true, 
          addedBy: currentUserEmail,
          quantity: parseFloat(quantity),
          unit
        });
      }
      
      setShowQuantityModal(false);
      setQuantity(0.25);
      setUnit('kg');
      fetchGroceries();
    } catch (error) {
      console.error("Error moving item to cart:", error);
    }
  };

  const handleDeleteOrCheckout = async (item) => {
    try {
      if (item.isDefault) {
        await updateItem(item, { inCart: false, claimedBy: null, quantity: null, unit: null });
      } else {
        await familyApi.delete(`/groups/${groupId}/groceries/${item.id}`);
        fetchGroceries();
      }
    } catch (error) {
      console.error("Error checking out item:", error);
    }
  };

  const handleAddMemberSubmit = async (e) => {
    e.preventDefault();
    try {
      await familyApi.post(`/groups/${groupId}/members`, { email: newMemberEmail.toLowerCase().trim() });
      setNewMemberEmail('');
      fetchGroupDetails(); 
    } catch (error) {
      console.error("Error adding member:", error);
      alert("Failed to add member.");
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

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={onBack} style={styles.backBtn}>←</button>
        <h2 style={styles.title}>Family Groceries</h2>
      </div>

      <div style={styles.tabContainer}>
        <div style={{ ...styles.tab, borderBottom: activeTab === 'shopping' ? '3px solid #00e5ff' : 'none', color: activeTab === 'shopping' ? '#00e5ff' : '#888' }} onClick={() => setActiveTab('shopping')}>Shopping List</div>
        <div style={{ ...styles.tab, borderBottom: activeTab === 'status' ? '3px solid #00e5ff' : 'none', color: activeTab === 'status' ? '#00e5ff' : '#888' }} onClick={() => setActiveTab('status')}>Status</div>
        <div style={{ ...styles.tab, borderBottom: activeTab === 'checkout' ? '3px solid #00e5ff' : 'none', color: activeTab === 'checkout' ? '#00e5ff' : '#888' }} onClick={() => setActiveTab('checkout')}>Checkout</div>
      </div>

      <div style={styles.content}>
        <div style={styles.actionRow}>
          <button onClick={() => setShowAddMember(true)} style={styles.addMemberBtn}>Manage Members</button>
          <span style={styles.memberCount}>{membersCount} members</span>
        </div>

        {activeTab === 'shopping' && (
          <>
            <form style={styles.inputForm}>
              <input type="text" placeholder="Add new grocery item..." value={newItem} onChange={(e) => setNewItem(e.target.value)} style={styles.input} />
              <div style={{ display: 'flex', gap: '5px' }}>
                <button type="button" onClick={(e) => handleAddItem(e, true)} style={styles.addBtnDefault}>Add Default</button>
                <button type="button" onClick={(e) => handleAddItem(e, false)} style={styles.addBtnCart}>Add to Cart</button>
              </div>
            </form>

            <div style={styles.list}>
              {items.filter(item => item.isDefault).map((item) => {
                // THE FIX: Check if you are the leader OR if you added the item!
                const itemAddedBy = String(item.addedBy || '').toLowerCase().trim();
                const canDelete = currentUserEmail === leaderEmail || currentUserEmail === itemAddedBy;

                return (
                  <div key={item.id} style={styles.listItem}>
                    <span>{item.text}</span>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      {!item.inCart ? (
                        <button onClick={() => { setItemToMove(item); setIsDirectAdd(false); setShowQuantityModal(true); }} style={styles.actionBtn}>Move to Cart</button>
                      ) : (
                        <span style={{ color: '#00e5ff', fontSize: '12px' }}>In Cart ✓</span>
                      )}
                      
                      {canDelete && (
                        <button onClick={() => familyApi.delete(`/groups/${groupId}/groceries/${item.id}`).then(fetchGroceries)} style={styles.deleteBtn}>🗑️</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {activeTab === 'status' && (
          <div style={styles.list}>
            {items.filter(item => item.inCart).map((item) => (
              <div key={item.id} style={styles.listItem}>
                <span>
                  {item.text} 
                  {item.quantity && <strong style={{ color: '#00e5ff', marginLeft: '8px' }}>({item.quantity} {item.unit})</strong>}
                </span>
                {item.claimedBy ? (
                  <span style={{ fontSize: '12px', color: '#ffc107' }}>Claimed by {(item.claimedBy || '').split('@')[0]}</span>
                ) : (
                  String(item.addedBy || '').toLowerCase().trim() !== currentUserEmail ? (
                    <button onClick={() => updateItem(item, { claimedBy: currentUserEmail })} style={styles.gotItBtn}>Got It!</button>
                  ) : (
                    <span style={{ fontSize: '12px', color: '#888' }}>Waiting for claim...</span>
                  )
                )}
              </div>
            ))}
            {items.filter(item => item.inCart).length === 0 && <p style={{ color: '#888', textAlign: 'center' }}>Cart is empty.</p>}
          </div>
        )}

        {activeTab === 'checkout' && (
          <div style={styles.list}>
            {items.filter(item => item.inCart && String(item.claimedBy || '').toLowerCase().trim() === currentUserEmail).map((item) => (
              <div key={item.id} style={styles.listItem}>
                <span style={{ textDecoration: 'line-through', color: '#888' }}>
                  {item.text} {item.quantity && `(${item.quantity} ${item.unit})`}
                </span>
                <button onClick={() => handleDeleteOrCheckout(item)} style={styles.deleteBtn}>Delete Cart Item</button>
              </div>
            ))}
            {items.filter(item => item.inCart && String(item.claimedBy || '').toLowerCase().trim() === currentUserEmail).length === 0 && (
              <p style={{ color: '#888', textAlign: 'center' }}>You haven't claimed any items to checkout yet.</p>
            )}
          </div>
        )}
      </div>

      {showQuantityModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <h3 style={{ margin: '0 0 15px 0', color: '#00e5ff' }}>Set Quantity</h3>
            <p style={{ fontSize: '14px', marginBottom: '15px', color: '#ccc' }}>How much <strong>{itemToMove?.text}</strong> is needed?</p>
            
            <div style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
              <input 
                type="number" 
                step="0.25" 
                min="0.25"
                value={quantity} 
                onChange={(e) => setQuantity(e.target.value)} 
                style={styles.modalInput} 
              />
              <select value={unit} onChange={(e) => setUnit(e.target.value)} style={styles.modalInput}>
                <option value="kg">kg</option>
                <option value="g">grams</option>
                <option value="L">Liters</option>
                <option value="ml">ml</option>
                <option value="pcs">Pieces</option>
                <option value="pkts">Packets</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowQuantityModal(false)} style={{ ...styles.modalAddBtn, backgroundColor: '#333', color: '#fff', flex: 1 }}>Cancel</button>
              <button onClick={confirmQuantityAndMove} style={{ ...styles.modalAddBtn, flex: 1 }}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {showAddMember && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ margin: 0 }}>Group Members</h3>
              <button onClick={() => setShowAddMember(false)} style={styles.closeBtn}>✕</button>
            </div>
            
            <div style={styles.memberListContainer}>
              {membersList.map(email => (
                <div key={email} style={styles.memberRow}>
                  <div>
                    <span style={{ fontSize: '14px', color: '#fff' }}>{email.split('@')[0]}</span>
                    {email === leaderEmail && <span style={{ marginLeft: '8px', fontSize: '10px', color: '#00e5ff', border: '1px solid #00e5ff', padding: '2px 6px', borderRadius: '10px' }}>Leader</span>}
                  </div>
                  
                  {currentUserEmail === leaderEmail && email !== leaderEmail && (
                    <button onClick={() => handleMakeLeader(email)} style={styles.makeLeaderBtn}>Make Leader</button>
                  )}
                </div>
              ))}
            </div>

            <hr style={{ borderColor: '#2a2d35', margin: '20px 0' }} />

            <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Invite New Member</h4>
            <form onSubmit={handleAddMemberSubmit} style={{ display: 'flex', gap: '10px' }}>
              <input type="email" placeholder="user@example.com" value={newMemberEmail} onChange={(e) => setNewMemberEmail(e.target.value)} style={styles.modalInput} required />
              <button type="submit" style={styles.modalAddBtn}>Add</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { backgroundColor: '#0a0a0c', minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif', position: 'relative' },
  header: { display: 'flex', alignItems: 'center', padding: '20px', borderBottom: '1px solid #1a1c23', backgroundColor: '#16181d' },
  backBtn: { background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer', marginRight: '15px' },
  title: { margin: 0, fontSize: '18px' },
  tabContainer: { display: 'flex', backgroundColor: '#16181d', borderBottom: '1px solid #2a2d35' },
  tab: { flex: 1, textAlign: 'center', padding: '15px 0', fontSize: '14px', cursor: 'pointer', fontWeight: 'bold' },
  content: { padding: '20px' },
  actionRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  addMemberBtn: { backgroundColor: 'transparent', border: '1px solid #ffc107', color: '#ffc107', padding: '6px 12px', borderRadius: '16px', fontSize: '12px', cursor: 'pointer' },
  memberCount: { fontSize: '12px', color: '#888' },
  inputForm: { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' },
  input: { padding: '12px', backgroundColor: '#16181d', border: '1px solid #2a2d35', borderRadius: '8px', color: '#fff', fontSize: '14px' },
  addBtnDefault: { flex: 1, backgroundColor: '#2a2d35', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' },
  addBtnCart: { flex: 1, backgroundColor: '#00e5ff', color: '#000', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' },
  list: { display: 'flex', flexDirection: 'column', gap: '10px' },
  listItem: { backgroundColor: '#16181d', padding: '15px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px' },
  actionBtn: { backgroundColor: '#333', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' },
  gotItBtn: { backgroundColor: '#ffc107', color: '#000', border: 'none', padding: '6px 15px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' },
  deleteBtn: { background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontSize: '14px' },
  
  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalContent: { backgroundColor: '#16181d', padding: '25px', borderRadius: '12px', width: '90%', maxWidth: '350px', border: '1px solid #2a2d35' },
  closeBtn: { background: 'none', border: 'none', color: '#888', fontSize: '18px', cursor: 'pointer' },
  memberListContainer: { maxHeight: '150px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' },
  memberRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0a0a0c', padding: '10px', borderRadius: '6px' },
  makeLeaderBtn: { backgroundColor: 'transparent', border: '1px solid #ffc107', color: '#ffc107', padding: '4px 8px', borderRadius: '4px', fontSize: '10px', cursor: 'pointer' },
  modalInput: { flex: 1, padding: '10px', backgroundColor: '#0a0a0c', border: '1px solid #2a2d35', borderRadius: '6px', color: '#fff', boxSizing: 'border-box' },
  modalAddBtn: { backgroundColor: '#00e5ff', color: '#000', border: 'none', padding: '10px 15px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }
};

export default GroceryList;