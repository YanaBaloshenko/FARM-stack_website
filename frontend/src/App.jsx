import { useState, useEffect } from 'react';

import { createBrowserRouter, Route, createRoutesFromElements, RouterProvider } from 'react-router-dom'

import RootLayout from "./layouts/RootLayout"
import Home from "./pages/Home"
import UserPage from "./pages/UserPage";
import Login from "./pages/Login"
import { AuthProvider } from "./contexts/AuthContext"


// ################################ App ################################

// const PrivateRoute = ({ children }) => {
//   const { user } = useAuth();
//   return user ? children : <Navigate to="/login" />;
// };

// creating the router
const router = createBrowserRouter(
  // invoking the function that creates the actual routes
  createRoutesFromElements(
    // routes correspond and map a component
    <Route path="/" element={<RootLayout />}>
      <Route path="login" element={<Login />} />
      {/* <Route element={<AuthRequired />}> ... </Route> */} {/* protecting a page */} 
      <Route path="user" element={<UserPage />} />
      <Route path="*" element={<NotFound />} />
    </Route>
  )
);

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

// const App = () => {

//   const [showLogin, setShowLogin] = useState(true)

//   return (
//     <div className="bg-blue-200 flex flex-col justify-center items-center min-h-screen">
//       <AuthProvider>
//         <h1 className="text-2xl text-blue-800"> Simple Auth App </h1>

//         <Message />
//         <div>
//           {showLogin ? <Login /> : <Register />}
//           <button onClick={() => setShowLogin(!showLogin)}>{showLogin ? 'Register' : 'Login'}</button>
//           <hr />
//         </div>
//         <Users />
//       </AuthProvider>
//     </div>
//   );
// };
// export default App

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