import React, { useContext } from "react";
import { AppContext } from "../context/AppContext";

const Navbar = () => {
  const { activeComponent } = useContext(AppContext);

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
                <a href="/logout" className="nav-link text-white">
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
