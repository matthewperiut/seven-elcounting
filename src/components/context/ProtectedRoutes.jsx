import { Navigate } from "react-router-dom";
import { Context } from "./UserContext";


export const RequireAccount = ({ children }) => {
    const { user } = Context(); //access imported user context
    if(!user) {
        return <Navigate to="/login"/> //user not signed in, nav to login
    }
    return children //else return children components
}

export const RequireUser = ({ children }) => {
    const { user } = Context(); //access imported user context
    if(user.role < 1) {
        return <Navigate to="/"/> //user not accountant, nav to dashboard
    }
    return children //else accountant or higher role, return children components
}

export const RequireManager = ({ children }) => {
    const { user } = Context(); //access imported user context
    console.log(user.role)
    if(user.role < 2) {
        return <Navigate to="/"/> //user not manager, nav to dashboard
    }
    return children //user is manager or higher role, return children components
}

export const RequireAdmin = ({ children }) => {
    const { user } = Context(); //access imported user context
    if(user.role < 3) {
        return <Navigate to="/"/> //user not admin, nav to dashboard
    }
    return children //if admin return children components
}
