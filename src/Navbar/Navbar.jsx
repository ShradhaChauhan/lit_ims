import React, { useContext } from "react";
import { AppContext } from "../context/AppContext";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const { activeComponent } = useContext(AppContext);
  const navigate = useNavigate();

  const handleLogout = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/logout", {}, {
        withCredentials: true,
      });
      navigate("/");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div>
      <nav
        className="navbar bg-dark border-bottom border-body"
        data-bs-theme="dark"
      >
        <div className="container-fluid">
          <a className="navbar-brand" href="#">
            {activeComponent ? activeComponent : "Users"}
          </a>
          <div>
            <ul className="nav nav-pills flex-column mb-auto">
              <li className="nav-item">
                <a href="/logout" onClick={handleLogout} className="nav-link text-white">
                  <i className="fas fa-sign-out-alt"></i> Logout
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
