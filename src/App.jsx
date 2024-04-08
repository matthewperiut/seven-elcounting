import { Route, Routes } from 'react-router-dom';

import { 
Login,
Registration,
ForgotPassword, 
RequireAccount, 
RequireUser,
SecurityQuestion, 
RequireAdmin, 
Banner, 
PageNotFound, 
Dashboard, 
AddAccounts, 
ChartofAccounts, 
EditAccounts, 
DeactivateAccounts,
Help, 
RoleManagement, 
UserContextProvider, 
Journalizing,
Entries,
GeneralLedger
} from "./components"
import EventLog from './components/logs/EventLog';


function App() {
  return (
    <UserContextProvider> 
      <Routes>
        <Route path="/" element={<Banner />} >
          
        {/* public routes */}
        <Route path="login" element={<Login />} />
        <Route path="registration" element={<Registration />} />
        <Route path="forgotpassword" element={<ForgotPassword />} />
        <Route path="securityquestion" element={<SecurityQuestion />} />

        <Route path="Help" element={<Help />} />

        {/* private routes */}
        <Route path="/" element={<RequireAccount><Dashboard/></RequireAccount>} />
        <Route path="addaccounts" element={<RequireAdmin><AddAccounts /></RequireAdmin>} />
        <Route path="users" element={<RequireAdmin>< RoleManagement/></RequireAdmin>} />
        <Route path="chartofaccounts" element={<RequireUser><ChartofAccounts/></RequireUser>} />
        <Route path="editaccounts" element={<RequireAdmin><EditAccounts/></RequireAdmin>} />
        <Route path="deactivateaccounts" element={<RequireAdmin><DeactivateAccounts/></RequireAdmin>} />
        <Route path="journalizing" element={<Journalizing/>} />
        <Route path="journal-entries" element={<RequireAccount><Entries/></RequireAccount>} />
        <Route path="generalLedger" element={<GeneralLedger />} />
        <Route path="eventLog" element={<EventLog />} />
        {/* page not found */}
        <Route path="*" element={<PageNotFound />} />
        </Route>
      </Routes>    
    </UserContextProvider>
  )
}

export default App;
