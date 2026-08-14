import React, { useState, useEffect } from 'react';
import { familyApi } from '../api/axiosConfig';

export default function GroceryList() {
    const [items, setItems] = useState([]);
    const [newItemName, setNewItemName] = useState('');

    // Fetch items when the page loads
    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            // Uses your local familyApi and automatically attaches the token!
            const response = await familyApi.get('/groceries');
            setItems(response.data);
        } catch (error) {
            console.error('Error fetching groceries:', error);
        }
    };

    const handleAddItem = async (e) => {
        e.preventDefault();
        if (!newItemName) return;
        
        try {
            await familyApi.post('/groceries', {
                itemName: newItemName,
                addedBy: 'Me'
            });
            setNewItemName('');
            fetchItems(); // Refresh the list after adding
        } catch (error) {
            console.error('Error adding item:', error);
        }
    };

    const handlePurchase = async (id) => {
        try {
            await familyApi.put(`/groceries/${id}`, {
                purchased: true
            });
            fetchItems(); // Refresh the list after updating
        } catch (error) {
            console.error('Error updating item:', error);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto', fontFamily: 'sans-serif' }}>
            <h2>🏠 Family Grocery List</h2>
            
            <form onSubmit={handleAddItem} style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
                <input 
                    type="text" 
                    value={newItemName} 
                    onChange={(e) => setNewItemName(e.target.value)} 
                    placeholder="Add new item..."
                    style={{ padding: '10px', flex: 1, borderRadius: '5px', border: '1px solid #ccc' }}
                />
                <button type="submit" style={{ padding: '10px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                    Add
                </button>
            </form>

            <ul style={{ listStyle: 'none', padding: 0 }}>
                {items.map(item => (
                    <li key={item.id} style={{ 
                        padding: '15px', 
                        marginBottom: '10px', 
                        backgroundColor: '#f8f9fa', 
                        borderRadius: '5px',
                        display: 'flex', 
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <span style={{ 
                            textDecoration: item.purchased ? 'line-through' : 'none',
                            color: item.purchased ? '#6c757d' : '#000'
                        }}>
                            <strong>{item.itemName}</strong> <br/>
                            <small>Added by: {item.addedBy}</small>
                        </span>
                        
                        {!item.purchased && (
                            <button onClick={() => handlePurchase(item.id)} style={{ padding: '5px 10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' }}>
                                ✓ Got it
                            </button>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}