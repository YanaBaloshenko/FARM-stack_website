// importing createContext
import { createContext, useContext, useState, useEffect } from 'react';

export const AuthContext = createContext();
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [jwt, setJwt] =  useState(localStorage.getItem('jwt')||null);
    const [message, setMessage] = useState("Please log in");

    useEffect(() => {
        // checks if there's jwt token stored
        const storedJwt = localStorage.getItem('jwt');

        // if stored jwt is present
        if(storedJwt) {
            setJwt(storedJwt);

            // api call to fastapi server to determine if token returns a valid user
            fetch(`${import.meta.env.VITE_API_URL}/users/me`, {
                headers: {
                    Authorization: `Bearer ${storedJwt}`,
                },
            })
                .then(res => res.json())

                .then(data => {

                    if (data.username) {
                        setUser(data.username);
                        setMessage(`Welcome back, ${data.username}!`);
                    }

                    else {
                        localStorage.removeItem('jwt');
                        setJwt(null);
                        setUser(null);
                        setMessage(data.message)
                    }
                })
                .catch(() => {
                    localStorage.removeItem('jwt');
                    setJwt(null);
                    setUser(null);
                    setMessage('Please log in or register');
                });
        } else {
            setJwt(null);
            setUser(null);
            setMessage('Please log in or register');
        }
    }, []);

    const login = async (username, password) => {

        const response = await fetch(`${import.meta.env.VITE_API_URL}/users/login`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

        const data = await response.json();
        if (response.ok) {
            setJwt(data.token);
            localStorage.setItem('jwt', data.token);
            setUser(data.username);
            setMessage(`Login successful! Welcome  ${data.username}`);
        } else {
            setMessage('Login failed: ' + data.detail);
            setUser(null);
            setJwt(null);
            localStorage.removeItem('jwt');
        }
        return data
    };

    const updateProfile = async (name, email) => {
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
            setUser({ ...user, name, email });
            setMessage('Profile updated successfully');
        } else {
            setMessage('Error updating profile');
        }
    };

    const registration = async (username, password) => {

        const response = await fetch(`${import.meta.env.VITE_API_URL}/users/register`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

        const data = await response.json();
        console.log(response)
        if (response.ok) {
            setMessage(`Registration successful! Please log in`);
        } else {
            setMessage('Registration failed: ' + data.detail);
        }
        return data
    };

    const logout = () => {

        setUser(null);
        setJwt(null);
        localStorage.removeItem('jwt');
        setMessage('Logout successful');
    };
    return (
        <AuthContext.Provider value={{ user, jwt, login, logout, message, setMessage, updateProfile, registration }}>
            {children}
        </AuthContext.Provider>
    );
};
