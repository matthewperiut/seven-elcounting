import { Route, Routes } from 'react-router-dom';

import { 
Login,
Registration,
ForgotPassword, 
RequireAccount, 
RequireUser,
RequireAdmin, 
Banner, 
PageNotFound, 
Dashboard, 
AddAccounts, 
ChartofAccounts, 
EditAccounts, 
DeactivateAccounts,
RoleManagement, 
UserContextProvider, 
Journalizing,
Entries,
GeneralLedger,
ChangeEventLog,
BalanceSheet,
IncomeStatement, 
TrialBalance
} from "./components"


function App() {
  return (
    <UserContextProvider> 
      <Routes>
          
        {/* public routes */}
        <Route path="/" element={<Banner />} >
        <Route path="login" element={<Login />} />
        <Route path="registration" element={<Registration />} />
        <Route path="forgotpassword" element={<ForgotPassword />} />

        {/* private routes */}
        <Route path="/" element={<RequireAccount><Dashboard/></RequireAccount>} />
        {/* admin routes */}
        <Route path="users" element={<RequireAdmin>< RoleManagement/></RequireAdmin>} />
        <Route path="addaccounts" element={<RequireAdmin><AddAccounts /></RequireAdmin>} />
        <Route path="editaccounts" element={<RequireAdmin><EditAccounts/></RequireAdmin>} />
        <Route path="deactivateaccounts" element={<RequireAdmin><DeactivateAccounts/></RequireAdmin>} />

        {/* accountant routes */}
        <Route path="chartofaccounts" element={<RequireUser><ChartofAccounts/></RequireUser>} />
        <Route path="journalizing" element={<RequireUser><Journalizing/></RequireUser>} />
        <Route path="journalentries" element={<RequireUser><Entries/></RequireUser>} />
        <Route path="generalLedger" element={<RequireUser><GeneralLedger/></RequireUser>} />
        <Route path="eventLog" element={<RequireUser><ChangeEventLog /></RequireUser>} />
        <Route path="balancesheet" element={<RequireUser><BalanceSheet/></RequireUser>} />
        <Route path="incomestatement" element={<RequireUser><IncomeStatement/></RequireUser>} />
        <Route path="trialBalance" element={<RequireUser><TrialBalance/></RequireUser>} />


        {/* page not found */}
        <Route path="*" element={<PageNotFound />} />

        </Route>
      </Routes>    
    </UserContextProvider>
  )
}

export default App;
