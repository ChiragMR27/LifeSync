import React, { useState, useEffect } from 'react';
import { familyApi } from '../api/axiosConfig';

const FamilyDashboard = () => {
  const [familyMembers, setFamilyMembers] = useState([]);
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [age, setAge] = useState('');

  // Fetch the list of family members when the component loads
  const fetchFamilyMembers = async () => {
    try {
      // FIX: Removed the trailing slash. Passes an empty string.
      const response = await familyApi.get(''); 
      setFamilyMembers(response.data);
    } catch (error) {
      console.error("Error fetching family members:", error);
    }
  };

  // Run the fetch function automatically when the dashboard opens
  useEffect(() => {
    fetchFamilyMembers();
  }, []);

  // Handle adding a new family member
  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      // FIX: Removed the trailing slash here as well.
      await familyApi.post('', { 
        name: name, 
        relationship: relationship, 
        age: parseInt(age) 
      });
      
      // Clear the form fields
      setName('');
      setRelationship('');
      setAge('');
      
      // Refresh the list to show the new member!
      fetchFamilyMembers();
    } catch (error) {
      console.error("Error adding family member:", error);
      alert("Failed to add family member. Check the console for details.");
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px' }}>
      <h2 style={{ textAlign: 'center' }}>My Family Members</h2>

      {/* The Add Member Form */}
      <div style={{ backgroundColor: '#f4f4f9', padding: '20px', borderRadius: '8px', marginBottom: '30px' }}>
        <h3>Add New Member</h3>
        <form onSubmit={handleAddMember} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required style={{ flex: '1', padding: '8px' }} />
          <input type="text" placeholder="Relationship (e.g., Spouse)" value={relationship} onChange={(e) => setRelationship(e.target.value)} required style={{ flex: '1', padding: '8px' }} />
          <input type="number" placeholder="Age" value={age} onChange={(e) => setAge(e.target.value)} required style={{ width: '80px', padding: '8px' }} />
          <button type="submit" style={{ padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Add</button>
        </form>
      </div>

      {/* The Display List */}
      <div>
        <h3>Current Family Members</h3>
        {familyMembers.length === 0 ? (
          <p>No family members added yet.</p>
        ) : (
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {familyMembers.map((member) => (
              <li key={member.id} style={{ backgroundColor: '#fff', border: '1px solid #ddd', padding: '15px', marginBottom: '10px', borderRadius: '4px', display: 'flex', justifyContent: 'space-between' }}>
                <strong>{member.name}</strong> 
                <span>{member.relationship}, Age: {member.age}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default FamilyDashboard;