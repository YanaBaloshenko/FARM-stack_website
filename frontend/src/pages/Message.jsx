import { useAuth } from "../contexts/AuthContext";

const Message = () => {
    const { message } = useAuth()
    return (
        <div className="p-2 m-2">
            <p>{message}</p>
        </div>
    )
}
export default Message
