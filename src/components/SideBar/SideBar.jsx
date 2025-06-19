import React, { useState } from "react";
import SearchBar from "../SearchBar/SearchBar";
import "./SideBar.css";
import VendorMaster from "../Modals/VendorMaster";

const SideBar = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [openSubmenus, setOpenSubmenus] = useState({});

  const [activeMenu, setIsActiveMenu] = useState(null);
  const toggleMenu = (menuItem) => {
    setIsActiveMenu((prev) => (prev === menuItem ? null : menuItem));
  };
  const [showModal, setShowModel] = useState(null);

  const menuItems = [
    {
      icon: "fas fa-cog",
      label: "Master",
      submenu: [
        {
          label: "Vendor Master",
          icon: "fas fa-truck",
        },
        {
          label: "Item Master",
          icon: "fas fa-box",
        },
        {
          label: "Warehouse Master",
          icon: "fas fa-warehouse",
        },
        {
          label: "BOM",
          icon: "fas fa-cubes",
        },
        {
          label: "Type Master",
          icon: "fas fa-list-alt",
        },
        {
          label: "Group Master",
          icon: "fas fa-layer-group",
        },
        {
          label: "Part Master",
          icon: "fas fa-cog",
        },
      ],
    },
    {
      icon: "fas fa-sync-alt",
      label: "Transaction",
      submenu: [
        {
          label: "Incoming",
          icon: "fas fa-arrow-down",
        },
        {
          label: "Incoming Reprint",
          icon: "fas fa-print",
        },
        {
          label: "IQC",
          icon: "fas fa-clipboard-check",
        },
        {
          label: "Requisition",
          icon: "fas fa-clipboard-list",
        },
        {
          label: "Issue Production",
          icon: "fas fa-cogs",
        },
        {
          label: "Requisition Receipt",
          icon: "fas fa-clipboard",
        },
        {
          label: "Production Receipt",
          icon: "fas fa-cog",
        },
        {
          label: "WIP Return",
          icon: "fas fa-undo",
        },
      ],
    },
    {
      icon: "fas fa-chart-pie",
      label: "Reports",
    },
    {
      icon: "fas fa-sliders-h",
      label: "Settings",
    },
  ];

  const toggleSubmenu = (label) => {
    setOpenSubmenus((prev) => {
      const isAlreadyOpen = prev[label];
      const newState = {};
      if (!isAlreadyOpen) {
        newState[label] = true;
      }
      return newState;
    });

    setIsActiveMenu((prev) => (prev === label ? null : label));
  };

  return (
    <div
      className={`d-flex flex-column vh-100 sidebar ${
        isCollapsed ? "collapsed" : ""
      }`}
    >
      <div className="p-2 d-flex justify-content-between align-items-center">
        <div>
          <div className="col-12">
            <span className="fs-5 fw-bold text-white ms-2">
              {!isCollapsed && "John"}
            </span>
          </div>
          <div className="col-12">
            <div className="fs-6 fw-bold text-white ms-3">
              <p>{!isCollapsed && "B1"}</p>
            </div>
          </div>
        </div>
        <button
          className="btn btn-sm btn-outline-light"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <i
            className={`fas fa-${isCollapsed ? "angle-right" : "angle-left"}`}
          ></i>
        </button>
      </div>

      {/* Search Bar */}
      <SearchBar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* Menu Items */}
      <ul className="nav nav-pills flex-column mb-auto mt-3">
        {menuItems.map((item, idx) => (
          <li key={idx} className="nav-item">
            {item.submenu ? (
              <>
                <div
                  className="nav-link text-white d-flex justify-content-between align-items-center menuListItem"
                  onClick={() => toggleSubmenu(item.label)}
                  style={{ cursor: "pointer" }}
                >
                  <span>
                    <i className={`${item.icon} me-2`}></i>
                    {!isCollapsed && item.label}
                  </span>
                  {!isCollapsed && (
                    <i
                      className={`fas fa-chevron-${
                        openSubmenus[item.label] ? "down" : "right"
                      }`}
                    ></i>
                  )}
                </div>
                {!isCollapsed && openSubmenus[item.label] && (
                  <ul className="nav flex-column ms-4">
                    {item.submenu.map((sub, subIdx) => (
                      <li key={subIdx} className="nav-item">
                        <div
                          onClick={() => setShowModel(sub.label)}
                          className="nav-link text-white small menuListItem"
                        >
                          <span>
                            <i className={`${sub.icon} me-2`}></i>
                            {sub.label}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <a className="nav-link text-white menuListItem">
                <i className={`${item.icon} me-2`}></i>
                {!isCollapsed && item.label}
              </a>
            )}
          </li>
        ))}
      </ul>

      <div className="mt-auto text-white d-flex align-items-center menuListItem">
        <ul className="nav nav-pills flex-column mb-auto">
          <li className="nav-item">
            <a href="/logout" className="nav-link text-white">
              <i className="fas fa-sign-out-alt me-2"></i>{" "}
              {!isCollapsed && "Logout"}
            </a>
          </li>
        </ul>
      </div>

      {/* Modals */}
      {showModal && (
        <div
          className="modal show fade d-block"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{showModal}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModel(null)}
                ></button>
              </div>
              <div className="modal-body">
                {showModal == "Vendor Master" && <VendorMaster />}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModel(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SideBar;
