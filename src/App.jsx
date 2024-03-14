import { Login, Registration, RoleManagement, ForgotPassword, RequireAuth, Banner, PageNotFound } from "./components"
import { Route, Routes } from 'react-router-dom';
import { UserContextProvider } from './components/UserContext';

function App() {
  return (
    <UserContextProvider> 
      <Routes>
        <Route path="/" element={<Banner />} >
          
        {/* public routes */}
        <Route path="/" element={<Login />} />
        <Route path="registration" element={<Registration />} />
        <Route path="forgotpassword" element={<ForgotPassword />} />
        {/* private routes */}
        <Route path="rolemanagement" element={<RequireAuth><RoleManagement/></RequireAuth>} />

        {/* page not found */}
        <Route path="*" element={<PageNotFound />} />
        </Route>
      </Routes>    
    </UserContextProvider>
  )
}

export default App;
