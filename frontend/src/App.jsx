import { useState, useEffect } from 'react';
import { AuthProvider } from './AuthContext';

import Register from './Register'
import Login from './Login'
import Users from './Users'
import Message from './Message'

const App = () => {

  const [showLogin, setShowLogin] = useState(true)

  return (
    <div className="bg-blue-200 flex flex-col justify-center items-center min-h-screen">
      <AuthProvider>
        <h1 className="text-2xl text-blue-800"> Simple Auth App </h1>

        <Message />
        <div>
          {showLogin ? <Login /> : <Register />}
          <button onClick={() => setShowLogin(!showLogin)}>{showLogin ? 'Register' : 'Login'}</button>
          <hr />
        </div>
        <Users />
      </AuthProvider>
    </div>
  );
};
export default App

// export default function App() {
//   const [users, setUsers] = useState([]);
//   useEffect(() => {
//     fetchUsers();
//   }, []);
//   const fetchUsers = () => {
//     fetch("https://jsonplaceholder.typicode.com/users")
//       .then((res) => res.json())
//       .then((data) => setUsers(data));
//   };
//   return (
//     <div className="bg-purple-800 text-white min-h-screen p-4 flex flex-col items-center">
//       <h2 className="mb-4">List of users</h2>
//       <div className="grid grid-cols-3 gap-4">
//         <ol>
//           {users.map((user) => (
//             <li key={user.id}>{user.name}</li>
//           ))}
//         </ol>
//       </div>
//     </div>
//   );
// }