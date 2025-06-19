import React from "react";
import SideBar from "../SideBar/SideBar";
import Users from "../Users/Users";

const Dashboard = () => {
  return (
    <div className="container-fluid min-vh-100 d-flex p-0">
      {/* Sidebar */}
      <div className="col-md-3 d-none d-md-flex flex-column">
        <SideBar />
      </div>
      {/* Right Side Content */}
      <div className="col-md-9 d-none d-md-flex flex-column p-5">
        <Users />
      </div>
    </div>
  );
};

export default Dashboard;
