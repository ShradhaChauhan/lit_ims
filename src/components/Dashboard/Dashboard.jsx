import React, { useContext, useEffect } from "react";
import SideBar from "../SideBar/SideBar";
import Users from "../Users/Users";
import { AppContext } from "../../context/AppContext";
import "./Dashboard.css";
import { Routes, Route, useNavigate } from "react-router-dom";
import ItemMaster from "../Forms/ItemMaster/ItemMaster";
import VendorMaster from "../Forms/VendorMaster/VendorMaster";
import { Link } from "react-router-dom";
import PartMaster from "../Forms/PartMaster/PartMaster";
import GroupMaster from "../Forms/GroupMaster/GroupMaster";
import WarehouseMaster from "../Forms/WarehouseMaster/WarehouseMaster";
import BOMMaster from "../Forms/BOMMaster/BOMMaster";
import TypeMaster from "../Forms/TypeMaster/TypeMaster";
import AdminLandingPage from "../AdminLandingPage/AdminLandingPage";
import Cookies from "js-cookie";
import { Navigate } from "react-router-dom";

const Dashboard = () => {
  const { rightSideComponent, setRightSideComponent } = useContext(AppContext);
  const navigate = useNavigate();

  // useEffect(() => {
  //   const token = Cookies.get("token");
  //   if (!token) {
  //     navigate("/", { replace: true });
  //   }
  // }, [navigate]);

  return (
    <div className="right-side-div bg-light flex-grow-1 overflow-auto">
      {/* {rightSideComponent ? rightSideComponent : <Users />} */}
      {rightSideComponent === "/item-master" ? (
        <ItemMaster />
      ) : rightSideComponent === "/vendor-master" ? (
        <VendorMaster />
      ) : rightSideComponent === "/part-master" ? (
        <PartMaster />
      ) : rightSideComponent === "/group-master" ? (
        <GroupMaster />
      ) : rightSideComponent === "/warehouse-master" ? (
        <WarehouseMaster />
      ) : rightSideComponent === "/bom-master" ? (
        <BOMMaster />
      ) : rightSideComponent === "/type-master" ? (
        <TypeMaster />
      ) : rightSideComponent === "/users" ? (
        <Users />
      ) : (
        <AdminLandingPage />
      )}
    </div>
  );
};

export default Dashboard;
