import { Context } from "../UserContext"
import { Link, useNavigate } from "react-router-dom";
import { RoleManagement } from "../rolemanagement/RoleManagement"



const Dashboard = () => {
    const { user } = Context();
    const navigate = useNavigate();


  return (
    <>
    <h1>DashBoard</h1>
    <div>Welcome, {user && user.email}</div>
    {user.role == 3 
    ? <div>
      <Link to="addaccounts"><button>Add Accounts</button></Link>
      <Link to="viewaccounts"><button>View Accounts</button></Link>
      <Link to="editaccounts"><button>Edit Accounts</button></Link>
      <Link to="deactivateaccounts"><button>Deactivate Accounts</button></Link>
      <RoleManagement/>
      </div>
    : user.role == 2
    ? <div>Welcome, manager</div>
    : user.role == 1
    ? <div>Welcome, user</div>
    : <div>You do not have access to the system yet, please wait for administrator approval.</div>
}
    </>
  )
}

export default Dashboard