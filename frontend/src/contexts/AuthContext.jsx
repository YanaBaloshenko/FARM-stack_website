// importing createContext
import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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


// // creating AuthContext
// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//     // defining state vars and setters
//     const [user, setUser] = useState(null);
//     const [jwt, setJwt] = useState(null);
//     const [message, setMessage] = useState(null);

//     // if token is present login the user
//     useEffect(() => {
//         // checking token in local stoarage
//         const storedJwt = localStorage.getItem('jwt');
//         // if token is present using it ti get the user data
//         if (storedJwt) {
//             setJwt(storedJwt);
//             fetch('http://127.0.0.1:8000/users/me', {
//                 headers: {
//                     Authorization: `Bearer ${storedJwt}`
//                 },
//             })
//             .then(res => res.json())

//             .then(data => {
//                 // if the username is found it is set in a context and the user is already logged in
//                 if (data.username) {
//                     setUser({ username: data.username });
//                     setMessage(`Welcome back, ${data.username}!`);
//                 }
//             })

//             // if the username is not found clear local storage
//             .catch(() => {
//                 localStorage.removeItem('jwt');
//             });
//         }
//     }, []);

//     // function for registering new users
//     const register = async (username, password) => {
//         try {

//             // waiting for result from backend
//             const response = await fetch('http://127.0.0.1:8000/users/register', {
//                 // using post method with given username and password
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({ username, password }),
//             });

//             // massages for successful registaration or errors
//             if (response.ok) {
//                 const data = await response.json();
//                 setMessage(`Registration successful: user ${data.username} created`);
//             } else {
//                 const data = await response.json();
//                 setMessage(`Registration failed: ${JSON.stringify(data)}`);
//             }
//         } catch (error) {
//             setMessage(`Registration failed: ${JSON.stringify(error)}`);
//         }
//     };

//     // login function
//     const login = async (username, password) => {

//         setJwt(null)
//         // sending a POST req to login ad awaiting result
//         const response = await fetch('http://127.0.0.1:8000/users/login', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ username, password }),
//         });

//         // if login successful setting a user to an authenticated with token
//         if (response.ok) {
//             const data = await response.json();
//             setJwt(data.token);
//             // setting the token in local storage
//             localStorage.setItem('jwt', data.token);
//             // logging in
//             setUser({ username });
//             setMessage(`Login successful: user ${username}`);
//         } else {
//             // unsuccesful login
//             const data = await response.json();
//             setMessage('Login failed: ' + data.detail);
//             setUser({ username: null });
//         }
//     };

//     // logout function
//     const logout = () => {
//         // removing user
//         setUser(null);
//         setJwt('');
//         // removing the token from local storage
//         localStorage .removeItem(jwt);
//         setMessage('Logout successful');
//     };

//     // returning AuthContext component
//     return (<AuthContext.Provider value={
//         {
//             user,
//             jwt,
//             register,
//             login,
//             logout,
//             message,
//             setMessage
//         }
//     } > {
//             children
//         } </AuthContext.Provider>)
// }

// export const useAuth = () => useContext(AuthContext);
