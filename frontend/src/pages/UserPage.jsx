import React, { useState, useEffect } from 'react';
import { AuthContext } from "../contexts/AuthContext";
import { useAuth } from "../hooks/useAuth";

const UserPage = () => {
  const { user, jwt, setMessage } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [originalName, setOriginalName] = useState('');
  const [originalEmail, setOriginalEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true)

  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);

  useEffect(() => {
    if (!jwt) {
      setMessage('User not authenticated. Please log in.');
      return;
    }

    const fetchUserData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/users/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${jwt}`, // Use JWT to authenticate the request
          },
        });
        
        if (response.ok) {
          const data = await response.json(); // Assuming the response has name and email
          setName(data.name);  // Set the name from the response
          setEmail(data.email);  // Set the email from the response
          setOriginalName(data.name); // Save the original name for comparison
          setOriginalEmail(data.email); // Save the original email for comparison
        } else {
          setMessage('Error fetching user data');
        }
      } catch (error) {
        setMessage('Error fetching user data');
      } finally {
        setIsLoading(false); // Stop loading when the data fetch is done
      }
    };

    fetchUserData();
  }, [jwt, setMessage]);

  const handleSaveName = async () => {
    if (name !== originalName) {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`,
        },
        body: JSON.stringify({ name }),
      });

      if (response.ok) {
        setMessage('Name updated successfully');
        setOriginalName(name); // Update original name
        window.location.reload();
      } else {
        setMessage('Error updating name');
      }
    } else {
      setMessage('No changes made to the name');
    }
  };

  // Handle save for email change
  const handleSaveEmail = async () => {
    if (email !== originalEmail) {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`,
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setMessage('Email updated successfully');
        setOriginalEmail(email); // Update original email
        window.location.reload();
      } else {
        setMessage('Error updating email');
      }
    } else {
      setMessage('No changes made to the email');
    }
  };

  // Clear the form when entering edit mode
  const handleEditName = () => {
    setName(''); // Clear name field when entering edit mode
    setIsEditingName(true); // Enter edit mode
  };

  const handleEditEmail = () => {
    setEmail(''); // Clear email field when entering edit mode
    setIsEditingEmail(true); // Enter edit mode
  };

  // Cancel editing and reset the form fields to original values
  const handleCancelNameEdit = () => {
    setName(originalName); // Reset to original value
    setIsEditingName(false); // Exit edit mode
  };

  const handleCancelEmailEdit = () => {
    setEmail(originalEmail); // Reset to original value
    setIsEditingEmail(false); // Exit edit mode
  };

  return (
    <div>
      <div>
        <label>Name: </label>
        {isEditingName ? (
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        ) : (
          <span>{name}</span>
        )}
        <div>
          {isEditingName ? (
            <>
            <button className="p-1 bg-blue-200" type="button" onClick={handleSaveName} style={{ marginRight: '10px' }}>
              Save Name
            </button>
            <button className="p-1 bg-blue-200" type="button" onClick={handleCancelNameEdit} style={{ marginLeft: '10px' }}>
              Cancel
            </button>
          </>
        ) : (
          <button className="p-1 bg-blue-200" type="button" onClick={handleEditName}>
            Edit Name
            </button>
          )}
        </div>
      </div>

      <div>
        <label>Email: </label>
        {isEditingEmail ? (
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        ) : (
          <span>{email}</span>
        )}
        <div>
          {isEditingEmail ? (
            <>
            <button className="p-1 bg-blue-200" type="button" onClick={handleSaveEmail} style={{ marginRight: '10px' }}>
              Save Email
            </button>
            <button className="p-1 bg-blue-200" type="button" onClick={handleCancelEmailEdit} style={{ marginLeft: '10px' }}>
              Cancel
            </button>
          </>
        ) : (
          <button className="p-1 bg-blue-200" type="button" onClick={handleEditEmail}>
            Edit Email
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserPage
