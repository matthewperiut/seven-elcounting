import { Login, Registration,ForgotPassword, 
RequireAccount, RequireUser, RequireManager, RequireAdmin, Banner, PageNotFound, 
Dashboard, AddAccounts, ViewAccounts, EditAccounts, 
DeactivateAccounts } from "./components"

import { Route, Routes } from 'react-router-dom';
import { UserContextProvider } from './components/UserContext';

function App() {
  return (
    <UserContextProvider> 
      <Routes>
        <Route path="/" element={<Banner />} >
          
        {/* public routes */}
        <Route path="login" element={<Login />} />
        <Route path="registration" element={<Registration />} />
        <Route path="forgotpassword" element={<ForgotPassword />} />
        {/* private routes */}
        <Route path="/" element={<RequireAccount><Dashboard/></RequireAccount>} />
        <Route path="addaccounts" element={<RequireAdmin><AddAccounts /></RequireAdmin>} />
        <Route path="viewaccounts" element={<RequireUser><ViewAccounts/></RequireUser>} />
        <Route path="editaccounts" element={<RequireAdmin><EditAccounts/></RequireAdmin>} />
        <Route path="deactivateaccounts" element={<RequireAdmin><DeactivateAccounts/></RequireAdmin>} />
        {/* page not found */}
        <Route path="*" element={<PageNotFound />} />
        </Route>
      </Routes>    
    </UserContextProvider>
  )
}

export default App;
