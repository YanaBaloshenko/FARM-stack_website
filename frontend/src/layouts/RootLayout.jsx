import { Outlet, NavLink } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"

const RootLayout = () => {
    const { user, message, logout } = useAuth();
    
    return (
      <div className="bg-white min-h-screen p-2">
        <p className="text-red-500 p-2 border">{message}</p>
        
        <header className="p-8 w-full">
          <nav className="flex flex-row justify-between mx-auto">
            <div className="flex flex-row space-x-3">
              {user ? (
                <>
                  <NavLink to="/user">User Profile</NavLink>
                </>
              ) : (
                <NavLink to="/login">Login</NavLink>
              )}
            </div>
          </nav>
        </header>
        
        <main className="p-8 flex flex-col flex-1 bg-white">
          <Outlet />
        </main>
        <button className="p-2 bg-blue-200 border" onClick={logout} style={{ marginLeft: '30px' }}>Logout</button>
      </div>
    );
};

export default RootLayout
