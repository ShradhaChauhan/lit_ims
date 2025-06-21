import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import api from "../../services/api"; // Adjust if needed
import "./Navbar.css";

const Navbar = () => {
  const { activeComponent, setIsAddUser, setIsAddVendor } =
    useContext(AppContext);
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
      <nav
        className="navbar bg-light border-bottom border-body"
        data-bs-theme="light"
      >
        <div className="container-fluid">
          <div className="ps-3 mt-4">
            <h3 className="nav-header">
              {activeComponent ? activeComponent : "User"} Management
            </h3>
            <p className="breadcrumb">
              <a href="#">
                <i className="fas fa-home"></i>
              </a>{" "}
              {activeComponent ? "" : "/ Settings "}/
              <span>
                {activeComponent ? activeComponent : "User"} Management
              </span>
            </p>
          </div>
          {/* Add User Button */}
          {!activeComponent && (
            <button className="add-btn" onClick={() => setIsAddUser(true)}>
              <i className="fa-solid fa-user-plus"></i> Add New User
            </button>
          )}
          {activeComponent === "Vendor & Customer" && (
            <button className="add-btn" onClick={() => setIsAddVendor(true)}>
              <i className="fa-solid fa-plus"></i> Add New
            </button>
          )}
          {/* <div>
            <ul className="nav nav-pills flex-column mb-auto">
              <li className="nav-item">
                <button
                  onClick={handleLogout}
                  className="nav-link text-black btn btn-link p-0 text-decoration-none"
                >
                  <i className="fas fa-sign-out-alt"></i> Logout
                </button>
              </li>
            </ul>
          </div> */}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
