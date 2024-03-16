import { Login, Registration,ForgotPassword, 
RequireAuth, Banner, PageNotFound, 
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
        <Route path="/" element={<RequireAuth><Dashboard/></RequireAuth>} />
        <Route path="addaccounts" element={<RequireAuth><AddAccounts /></RequireAuth>} />
        <Route path="viewaccounts" element={<RequireAuth><ViewAccounts/></RequireAuth>} />
        <Route path="editaccounts" element={<RequireAuth><EditAccounts/></RequireAuth>} />
        <Route path="deactivateaccounts" element={<RequireAuth><DeactivateAccounts/></RequireAuth>} />
        {/* page not found */}
        <Route path="*" element={<PageNotFound />} />
        </Route>
      </Routes>    
    </UserContextProvider>
  )
}

export default App;
