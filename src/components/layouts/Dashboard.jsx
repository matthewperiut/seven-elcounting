import { Context } from "../UserContext";
import { useNavigate } from "react-router-dom";
import { RoleManagement } from "../rolemanagement/RoleManagement";

const Dashboard = () => {
  const { user } = Context(); //pull user context
  const navigate = useNavigate(); //to navigate to other pages

  return (
    <>
      <h1>DashBoard</h1>
      <div className="welcome-div">Welcome, {user && user.email}</div>
      {user.role == 3 ? (
        <div>
          <RoleManagement />
        </div>
      ) : user.role == 2 ? (
        <div className="welcome-div">Welcome, manager</div>
      ) : user.role == 1 ? (
        <div className="welcome-div">Welcome, accountant</div>
      ) : (
        <div className="welcome-div">
          You do not have access to the system yet, please wait for
          administrator approval.
        </div>
      )}
    </>
  );
};

export default Dashboard;
