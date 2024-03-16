export { default as Login } from "./auth/Login";
export { default as Registration } from "./auth/Registration";
export { default as RoleManagement } from "./rolemanagement/RoleManagement";
export { default as Banner } from "./layouts/Banner"
export { default as ForgotPassword } from "./auth/ForgotPassword"
export { RequireAccount, RequireUser, RequireManager, RequireAdmin } from "./ProtectedRoutes"
export { default as PageNotFound } from "./layouts/PageNotFound"
export { default as Dashboard } from "./layouts/Dashboard"
export { default as AddAccounts } from "./accounts/AddAccounts"
export { default as ViewAccounts } from "./accounts/ViewAccounts"
export { default as EditAccounts } from "./accounts/EditAccounts"
export { default as DeactivateAccounts } from "./accounts/DeactivateAccounts"
export { default as Modal } from "./layouts/Modal"

{/* File for easily exporting all components */}