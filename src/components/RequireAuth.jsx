import { Navigate } from "react-router-dom";
import { Context } from "./UserContext";


const RequireAuth = ({ children }) => {
    const { user } = Context(); //access imported user context
    if(!user) {
        return <Navigate to="login"/> //user not signed in, nav to login
    }
    return children //else return children components
}

export default RequireAuth



{/* File to protect certain routes(like RoleManagement) */}