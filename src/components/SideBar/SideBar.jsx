import React, { useContext, useState } from "react";
import SearchBar from "../SearchBar/SearchBar";
import "./SideBar.css";
import { AppContext } from "../../context/AppContext";
import litWhiteLogo from "../../assets/images/litWhiteLogo.png";
import ims_logo from "../../assets/images/ims_logo.png";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import VendorMaster from "../Forms/VendorMaster/VendorMaster";
import ItemMaster from "../Forms/ItemMaster/ItemMaster";
import WarehouseMaster from "../Forms/WarehouseMaster/WarehouseMaster";
import BOMMaster from "../Forms/BOMMaster/BOMMaster";
import TypeMaster from "../Forms/TypeMaster/TypeMaster";
import GroupMaster from "../Forms/GroupMaster/GroupMaster";
import PartMaster from "../Forms/PartMaster/PartMaster";
import Incoming from "../Forms/Incoming/Incoming";
import IncomingReprint from "../Forms/IncomingReprint/IncomingReprint";
import IQC from "../Forms/IQC/IQC";
import Requisition from "../Forms/Requisition/Requisition";
import IssueProduction from "../Forms/IssueProduction/IssueProduction";
import RequisitionReceipt from "../Forms/RequisitionReceipt/RequisitionReceipt";
import ProductionReceipt from "../Forms/ProductionReceipt/ProductionReceipt";
import WIPReturn from "../Forms/WIPReturn/WIPReturn";
import ActivityLogs from "../ActivityLogs/ActivityLogs";

const SideBar = () => {
  const { setRightSideComponent, setIsActiveComponent, setLabelName } =
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
      icon: "fas fa-database",
      label: "Masters",
      path: "Masters",
      submenu: [
        {
          label: "Business Partner",
          compName: "VendorMaster",
          path: "Masters / Business Partner",
          icon: "fas fa-truck",
        },
        {
          label: "Item Master",
          compName: "ItemMaster",
          path: "Masters / Item Master",
          icon: "fas fa-box",
        },
        {
          label: "Warehouse Master",
          compName: "WarehouseMaster",
          path: "Masters / Warehouse Master",
          icon: "fas fa-warehouse",
        },
        {
          label: "BOM Master",
          compName: "BOMMaster",
          path: "Masters / BOM Master",
          icon: "fas fa-cubes",
        },
        {
          label: "Type Master",
          compName: "TypeMaster",
          path: "Masters / Type Master",
          icon: "fas fa-list-alt",
        },
        {
          label: "Group Master",
          compName: "GroupMaster",
          path: "Masters / Group Master",
          icon: "fas fa-layer-group",
        },
        {
          label: "Part Master",
          compName: "PartMaster",
          path: "Masters / Part Master",
          icon: "fas fa-cog",
        },
      ],
    },
    {
      icon: "fas fa-sync-alt",
      label: "Transactions",
      path: "Transactions",
      submenu: [
        {
          label: "Incoming",
          compName: "Incoming",
          path: "Transactions / Incoming",
          icon: "fas fa-arrow-down",
        },
        {
          label: "Incoming Reprint",
          compName: "IncomingReprint",
          path: "Transactions / Incoming Reprint",
          icon: "fas fa-print",
        },
        {
          label: "IQC",
          compName: "IQC",
          path: "Transactions / IQC",
          icon: "fas fa-clipboard-check",
        },
        {
          label: "Requisition",
          compName: "Requisition",
          path: "Transactions / Requisition",
          icon: "fas fa-clipboard-list",
        },
        {
          label: "Issue Production",
          compName: "IssueProduction",
          path: "Transactions / Issue Production",
          icon: "fas fa-cogs",
        },
        {
          label: "Requisition Receipt",
          compName: "RequisitionReceipt",
          path: "Transactions / Requisition Receipt",
          icon: "fas fa-clipboard",
        },
        {
          label: "Production Receipt",
          compName: "ProductionReceipt",
          path: "Transactions / Production Receipt",
          icon: "fas fa-cog",
        },
        {
          label: "WIP Return",
          compName: "WIPReturn",
          path: "Transactions / WIP Return",
          icon: "fas fa-undo",
        },
      ],
    },
    {
      icon: "fas fa-chart-pie",
      path: "Reports",
      label: "Reports",
    },
  ];

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      navigate("/");
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
    // Master Submenu component list
    name === "VendorMaster" && setRightSideComponent(<VendorMaster />);
    name === "ItemMaster" && setRightSideComponent(<ItemMaster />);
    name === "WarehouseMaster" && setRightSideComponent(<WarehouseMaster />);
    name === "BOMMaster" && setRightSideComponent(<BOMMaster />);
    name === "TypeMaster" && setRightSideComponent(<TypeMaster />);
    name === "GroupMaster" && setRightSideComponent(<GroupMaster />);
    name === "PartMaster" && setRightSideComponent(<PartMaster />);

    // Transaction Submenu component list
    name === "Incoming" && setRightSideComponent(<Incoming />);
    name === "IncomingReprint" && setRightSideComponent(<IncomingReprint />);
    name === "IQC" && setRightSideComponent(<IQC />);
    name === "Requisition" && setRightSideComponent(<Requisition />);
    name === "IssueProduction" && setRightSideComponent(<IssueProduction />);
    name === "RequisitionReceipt" &&
      setRightSideComponent(<RequisitionReceipt />);
    name === "ProductionReceipt" &&
      setRightSideComponent(<ProductionReceipt />);
    name === "WIPReturn" && setRightSideComponent(<WIPReturn />);
    name === "Activity Logs" && setRightSideComponent(<ActivityLogs />);
  };

  return (
    <div
      className={`d-flex flex-column vh-100 sidebar ${
        isCollapsed ? "collapsed" : ""
      }`}
    >
      <div className="p-2 d-flex justify-content-between align-items-center">
        {!isCollapsed && <img src={ims_logo} width={70} height={60} />}
        <button
          className="btn btn-sm btn-outline-light"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <i className="fa-solid fa-bars"></i>
        </button>
      </div>

      {/* Search Bar */}
      <SearchBar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

      {/* Menu Items */}
      {!isCollapsed && <p className="heading">MAIN MENU</p>}
      <ul className="nav nav-pills flex-column mb-auto mt-1">
        {menuItems.map((item, idx) => (
          <li key={idx} className="nav-item">
            {item.submenu ? (
              <>
                <div
                  className="nav-link text-white d-flex justify-content-between align-items-center menuListItem"
                  onClick={() => toggleSubmenu(item.label)}
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
                            setIsActiveComponent(sub.path);
                            setLabelName(sub.label);
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

        {!isCollapsed && <p className="heading">ADMINISTRATION</p>}
        <li className="nav-item">
          <a className="nav-link text-white menuListItem mt-3">
            <i className="fas fa-sliders-h me-2"></i>
            {!isCollapsed && "Settings"}
          </a>
        </li>
        <li
          className="nav-item"
          onClick={() => {
            handleRightSideComponentName("ActivityLogs");
            setLabelName("Activity Logs");
            setIsActiveComponent("Activity Logs");
          }}
        >
          <a className="nav-link text-white menuListItem">
            <i className="fa-solid fa-layer-group me-2"></i>
            {!isCollapsed && "Logs"}
          </a>
        </li>
      </ul>
      {!isCollapsed && (
        <div className="ms-2">
          <div className="user-profile">
            <div className="profile-info" title="John Doe">
              <img
                src="https://ui-avatars.com/api/?name=John+Doe&background=2563eb&color=fff"
                alt="Profile"
              />
              <div className="user-details">
                <p className="m-0 text-white">
                  Hi, <span>John Doe</span>
                </p>
                <small>Administrator</small>
              </div>
            </div>
            <button onClick={handleLogout} className="btn logout">
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SideBar;
