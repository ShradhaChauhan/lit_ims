import React, { useContext, useState } from "react";
import SearchBar from "../SearchBar/SearchBar";
import "./SideBar.css";
import VendorMaster from "../Modals/VendorMaster";
import { AppContext } from "../../context/AppContext";
import litWhiteLogo from "../../assets/images/litWhiteLogo.png";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const SideBar = () => {
  const { setRightSideComponent, setIsActiveComponent } =
    useContext(AppContext);

  const [isCollapsed, setIsCollapsed] = useState(true);
  const [openSubmenus, setOpenSubmenus] = useState({});
  const navigate = useNavigate();

  const [activeMenu, setIsActiveMenu] = useState(null);
  const toggleMenu = (menuItem) => {
    setIsActiveMenu((prev) => (prev === menuItem ? null : menuItem));
  };

  const menuItems = [
    {
      icon: "fas fa-cog",
      label: "Master",
      submenu: [
        {
          label: "Vendor Master",
          compName: "VendorMaster",
          icon: "fas fa-truck",
        },
        {
          label: "Item Master",
          compName: "ItemMaster",
          icon: "fas fa-box",
        },
        {
          label: "Warehouse Master",
          compName: "WarehouseMaster",
          icon: "fas fa-warehouse",
        },
        {
          label: "BOM",
          compName: "BOM",
          icon: "fas fa-cubes",
        },
        {
          label: "Type Master",
          compName: "TypeMaster",
          icon: "fas fa-list-alt",
        },
        {
          label: "Group Master",
          compName: "GroupMaster",
          icon: "fas fa-layer-group",
        },
        {
          label: "Part Master",
          compName: "PartMaster",
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
          compName: "Incoming",
          icon: "fas fa-arrow-down",
        },
        {
          label: "Incoming Reprint",
          compName: "IncomingReprint",
          icon: "fas fa-print",
        },
        {
          label: "IQC",
          compName: "IQC",
          icon: "fas fa-clipboard-check",
        },
        {
          label: "Requisition",
          compName: "Requisition",
          icon: "fas fa-clipboard-list",
        },
        {
          label: "Issue Production",
          compName: "IssueProduction",
          icon: "fas fa-cogs",
        },
        {
          label: "Requisition Receipt",
          compName: "RequisitionReceipt",
          icon: "fas fa-clipboard",
        },
        {
          label: "Production Receipt",
          compName: "ProductionReceipt",
          icon: "fas fa-cog",
        },
        {
          label: "WIP Return",
          compName: "WIPReturn",
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

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      navigate('/');
    } catch (err) {
      console.error("Logout Failed", err);
    }
  };

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

  const handleRightSideComponentName = (name) => {
    name === "VendorMaster" && setRightSideComponent(<VendorMaster />);
    name === "ItemMaster" && setRightSideComponent(<VendorMaster />);
    name === "WarehouseMaster" && setRightSideComponent(<VendorMaster />);
    name === "BOM" && setRightSideComponent(<VendorMaster />);
    name === "TypeMaster" && setRightSideComponent(<VendorMaster />);
    name === "GroupMaster" && setRightSideComponent(<VendorMaster />);
    name === "PartMaster" && setRightSideComponent(<VendorMaster />);
  };

  return (
    <div
      className={`d-flex flex-column vh-100 sidebar ${
        isCollapsed ? "collapsed" : ""
      }`}
    >
      <div className="p-2 d-flex justify-content-between align-items-center">
        {!isCollapsed && <img src={litWhiteLogo} width={40} height={40} />}
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
                          onClick={() => {
                            handleRightSideComponentName(sub.compName);
                            setIsActiveComponent(sub.label);
                          }}
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
      {!isCollapsed && (
        <div className="ms-2">
          <div className="row p-2">
            <div className="col-2">
              <a className="nav-link text-white userLogo">
                <i className="d-flex justify-content-center fa-solid fa-user"></i>
              </a>
            </div>
            <div className="col-10">
              <div>
                <span className="fs-5 fw-bold text-white">Hi! John</span>
              </div>
              <div className="fs-6 fw-bold text-white ms-3">
                <p>B1</p>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modals */}
      {/* {showModal && (
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
      )} */}
    </div>
  );
};

export default SideBar;
