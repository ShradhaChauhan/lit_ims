import React, { useContext } from "react";
import SideBar from "../SideBar/SideBar";
import Users from "../Users/Users";
import { AppContext } from "../../context/AppContext";
import Navbar from "../Navbar/Navbar";
import "./Dashboard.css";

const Dashboard = () => {
  const { rightSideComponent, setRightSideComponent } = useContext(AppContext);

  return (
    <div className="container-fluid min-vh-100 d-flex p-0 overflow-hidden">
      {/* Sidebar */}
      <div className="d-none d-md-flex flex-column">
        <SideBar />
      </div>

      {/* Right Side Content */}
      <div className="w-100 d-none d-md-flex flex-column">
        {/* Navbar */}
        <Navbar />
        {/* Content */}
        <div className="p-2 mt-3 right-side-div">
          {rightSideComponent ? rightSideComponent : <Users />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
