import React, { useState } from 'react';
import { useAuth } from "../contexts/AuthContext";

const UserPage = () => {
  const { user, jwt, setMessage } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  const handleSave = async (e) => {
    e.preventDefault();
    // Wysyłanie danych do backendu, aby zaktualizować informacje użytkownika
    const response = await fetch(`${import.meta.env.VITE_API_URL}/users/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwt}`,
      },
      body: JSON.stringify({ name, email }),
    });

    const data = await response.json();
    if (response.ok) {
      setMessage("Profile updated successfully");
    } else {
      setMessage("Error updating profile");
    }
  };

  return (
    <div>
      <h2>User Profile</h2>
      <form onSubmit={handleSave}>
        <div>
          <label>Name:</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required
          />
        </div>
        <div>
          <label>Email:</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required
          />
        </div>
        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
};

export default UserPage
