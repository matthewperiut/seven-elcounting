import { Login, Registration,ForgotPassword, 
RequireAccount, RequireUser, RequireManager, RequireAdmin, Banner, PageNotFound, 
Dashboard, AddAccounts, ViewAccounts, EditAccounts, 
DeactivateAccounts, Help, RoleManagement } from "./components"
import ViewOnlyAccounts from "./components/accounts/ViewOnlyAccounts";

import { Route, Routes } from 'react-router-dom';
import { UserContextProvider } from './components/UserContext';
import Journalizing from "./components/journalizing/Journalizing";

function App() {
  return (
    <UserContextProvider> 
      <Routes>
        <Route path="/" element={<Banner />} >
          
        {/* public routes */}
        <Route path="login" element={<Login />} />
        <Route path="registration" element={<Registration />} />
        <Route path="forgotpassword" element={<ForgotPassword />} />
        <Route path="Help" element={<Help />} />
        {/* private routes */}
        <Route path="/" element={<RequireAccount><Dashboard/></RequireAccount>} />
        <Route path="addaccounts" element={<RequireAdmin><AddAccounts /></RequireAdmin>} />
        <Route path="editusers" element={<RequireAdmin>< RoleManagement/></RequireAdmin>} />
        <Route path="viewaccounts" element={<RequireUser><ViewOnlyAccounts/></RequireUser>} />
        <Route path="editaccounts" element={<RequireAdmin><EditAccounts/></RequireAdmin>} />
        <Route path="deactivateaccounts" element={<RequireAdmin><DeactivateAccounts/></RequireAdmin>} />
        <Route path="journalizing" element={<Journalizing/>} />
        {/* page not found */}
        <Route path="*" element={<PageNotFound />} />
        </Route>
      </Routes>    
    </UserContextProvider>
  )
}

export default App;
