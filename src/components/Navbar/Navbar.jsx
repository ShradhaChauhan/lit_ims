import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import api from "../../services/api"; // Adjust if needed
import "./Navbar.css";

const Navbar = () => {
  const {
    activeComponent,
    labelName,
    setIsAddUser,
    setIsAddVendor,
    setIsAddItem,
    setIsAddWarehouse,
    setIsAddType,
    setIsAddGroup,
    setIsAddPart,
    setIsAddBom,
  } = useContext(AppContext);
  const navigate = useNavigate();

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await api.post(
        "/auth/logout",
        {},
        {
          withCredentials: true,
        }
      );
      navigate("/");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div>
      <nav className="navbar bg-light border-body" data-bs-theme="light">
        <div className="container-fluid">
          <div className="ps-3 mt-4">
            <h3 className="nav-header">
              {labelName ? labelName : "User Management"}
            </h3>
            <p className="breadcrumb">
              <a href="#">
                <i className="fas fa-home"></i>
              </a>{" "}
              {activeComponent ? "" : "/ Settings "}/
              <span>
                {activeComponent ? activeComponent : "User Management"}
              </span>
            </p>
          </div>
          {/* Add User Button */}
          {!activeComponent && (
            <button className="add-btn" onClick={() => setIsAddUser(true)}>
              <i className="fa-solid fa-user-plus"></i> Add New User
            </button>
          )}
          {activeComponent === "Masters / Business Partner" && (
            <button className="add-btn" onClick={() => setIsAddVendor(true)}>
              <i className="fa-solid fa-plus"></i> Add New Partner
            </button>
          )}
          {activeComponent === "Masters / Item Master" && (
            <button className="add-btn" onClick={() => setIsAddItem(true)}>
              <i className="fa-solid fa-plus"></i> Add New Item
            </button>
          )}
          {activeComponent === "Masters / Warehouse Master" && (
            <button className="add-btn" onClick={() => setIsAddWarehouse(true)}>
              <i className="fa-solid fa-plus"></i> Add New Warehouse
            </button>
          )}
          {activeComponent === "Masters / Type Master" && (
            <button className="add-btn" onClick={() => setIsAddType(true)}>
              <i className="fa-solid fa-plus"></i> Add New Type
            </button>
          )}
          {activeComponent === "Masters / Group Master" && (
            <button className="add-btn" onClick={() => setIsAddGroup(true)}>
              <i className="fa-solid fa-plus"></i> Add New Group
            </button>
          )}
          {activeComponent === "Masters / Part Master" && (
            <button className="add-btn" onClick={() => setIsAddPart(true)}>
              <i className="fa-solid fa-plus"></i> Add New Part
            </button>
          )}

          {activeComponent === "Masters / BOM Master" && (
            <button className="add-btn" onClick={() => setIsAddBom(true)}>
              <i className="fa-solid fa-plus"></i> Add New BOM
            </button>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
