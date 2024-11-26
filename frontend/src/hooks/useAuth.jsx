import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

// hook contains an error message in case the hook is accessed outside of the context
// but the context will enclose the entire application
export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('Must be used within an AuthProvider')
    }
    return context
}


