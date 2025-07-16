import React, { useContext, useState } from "react";
import SearchBar from "../SearchBar/SearchBar";
import "./SideBar.css";
import { AppContext } from "../../context/AppContext";
import ims_logo from "../../assets/images/ims_logo.png";
import api from "../../services/api";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import VendorMaster from "../Forms/VendorMaster/VendorMaster";
import ItemMaster from "../Forms/ItemMaster/ItemMaster";
import WarehouseMaster from "../Forms/WarehouseMaster/WarehouseMaster";
import BOMMaster from "../Forms/BOMMaster/BOMMaster";
import TypeMaster from "../Forms/TypeMaster/TypeMaster";
import GroupMaster from "../Forms/GroupMaster/GroupMaster";
import PartMaster from "../Forms/PartMaster/PartMaster";
import IssueProduction from "../Forms/IssueProduction/IssueProduction";
import RequisitionReceipt from "../Forms/RequisitionReceipt/RequisitionReceipt";
import ProductionReceipt from "../Forms/ProductionReceipt/ProductionReceipt";
import WIPReturn from "../Forms/WIPReturn/WIPReturn";
import ActivityLogs from "../ActivityLogs/ActivityLogs";
import MaterialIncoming from "../Forms/MaterialIncoming/MaterialIncoming";
import IncomingQC from "../Forms/IncomingQC/IncomingQC";
import MaterialIssueRequest from "../Forms/MaterialIssueRequest/MaterialIssueRequest";
import ProductionFloorReceipt from "../Forms/ProductionFloorReceipt/ProductionFloorReceipt";
import ProductionMaterialUsage from "../Forms/ProductionMaterialUsage/ProductionMaterialUsage";
import Users from "../Users/Users";
import ApproveItemsQuantity from "../Forms/ApproveItemsQuantity/ApproveItemsQuantity";

const SideBar = () => {
  const {
    rightSideComponent,
    setRightSideComponent,
    setIsActiveComponent,
    setLabelName,
  } = useContext(AppContext);

  // Floating submenu state
  const [hoveredMenu, setHoveredMenu] = useState(null);

  const [isCollapsed, setIsCollapsed] = useState(true);
  const [openSubmenus, setOpenSubmenus] = useState({});
  const navigate = useNavigate();

  const [activeMenu, setIsActiveMenu] = useState(null);
  const toggleMenu = (menuItem) => {
    setIsActiveMenu((prev) => (prev === menuItem ? null : menuItem));
  };

  const menuItems = [
    {
      icon: "fas fa-user",
      path: "users",
      label: "Users",
    },
    {
      icon: "fas fa-database",
      label: "Masters",
      path: "Masters",
      submenu: [
        {
          label: "Business Partner",
          compName: "VendorMaster",
          newPath: "business-partner",
          path: "Masters / Business Partner",
          icon: "fas fa-user-group",
        },
        {
          label: "Vendor Items Master",
          compName: "VendorItemsMaster",
          newPath: "vendor-items-master",
          path: "Masters / Vendor Items Master",
          icon: "fas fa-box-open",
        },
        {
          label: "Item Master",
          compName: "ItemMaster",
          newPath: "item-master",
          path: "Masters / Item Master",
          icon: "fas fa-box",
        },
        {
          label: "Warehouse Master",
          compName: "WarehouseMaster",
          newPath: "warehouse-master",
          path: "Masters / Warehouse Master",
          icon: "fas fa-warehouse",
        },
        {
          label: "BOM Master",
          compName: "BOMMaster",
          newPath: "bom-master",
          path: "Masters / BOM Master",
          icon: "fas fa-cubes",
        },
        {
          label: "Type Master",
          compName: "TypeMaster",
          newPath: "type-master",
          path: "Masters / Type Master",
          icon: "fas fa-list-alt",
        },
        {
          label: "Group Master",
          compName: "GroupMaster",
          newPath: "group-master",
          path: "Masters / Group Master",
          icon: "fas fa-layer-group",
        },
        {
          label: "Part Master",
          compName: "PartMaster",
          newPath: "part-master",
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
          label: "Store Material Inward",
          compName: "MaterialIncoming",
          newPath: "material-incoming",
          path: "Transactions / Material Incoming",
          icon: "fas fa-truck-ramp-box",
        },
        {
          label: "Approve Items Quantity",
          compName: "ApproveItemsQuantity",
          newPath: "approve-items-quantity",
          path: "Transactions / Approve Items Quantity",
          icon: "fas fa-thumbs-up",
        },
        {
          label: "Incoming Quality Control",
          compName: "IncomingQC",
          newPath: "incoming-qc",
          path: "Transactions / Incoming QC",
          icon: "fas fa-clipboard-check",
        },
        {
          label: "Material Issue Request",
          compName: "MaterialIssueRequest",
          newPath: "material-issue-request",
          path: "Transactions / Material Issue Request",
          icon: "fas fa-file-invoice",
        },
        {
          label: "Issue to Production",
          compName: "IssueProduction",
          newPath: "issue-to-production",
          path: "Transactions / Issue to Production",
          icon: "fas fa-dolly",
        },
        {
          label: "Production Floor Receipt",
          compName: "ProductionFloorReceipt",
          newPath: "production-floor-receipt",
          path: "Transactions /Production Floor Receipt",
          icon: "fas fa-circle-check",
        },
        {
          label: "Production Material Usage",
          compName: "ProductionMaterialUsage",
          newPath: "production-material-usage",
          path: "Transactions / Production Material Usage",
          icon: "fas fa-industry",
        },
        {
          label: "WIP Return",
          compName: "WIPReturn",
          newPath: "wip-return",
          path: "Transactions / WIP Return",
          icon: "fas fa-arrow-rotate-left",
        },
      ],
    },
    {
      icon: "fas fa-chart-pie",
      path: "inventory-audit-report",
      label: "Inventory Audit Report",
    },
    {
      icon: "fa-solid fa-star",
      path: "activity-logs",
      label: "Activity Logs",
    },
  ];

  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout");
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
    name === "Users" && setRightSideComponent(<Users />);
    // Master Submenu component list
    name === "VendorMaster" && setRightSideComponent(<VendorMaster />);
    name === "ItemMaster" && setRightSideComponent(<ItemMaster />);
    name === "WarehouseMaster" && setRightSideComponent(<WarehouseMaster />);
    name === "BOMMaster" && setRightSideComponent(<BOMMaster />);
    name === "TypeMaster" && setRightSideComponent(<TypeMaster />);
    name === "GroupMaster" && setRightSideComponent(<GroupMaster />);
    name === "PartMaster" && setRightSideComponent(<PartMaster />);

    // Transaction Submenu component list
    name === "MaterialIncoming" && setRightSideComponent(<MaterialIncoming />);
    name === "IncomingQC" && setRightSideComponent(<IncomingQC />);
    name === "IQC" && setRightSideComponent(<IQC />);
    name === "MaterialIssueRequest" &&
      setRightSideComponent(<MaterialIssueRequest />);
    name === "IssueProduction" && setRightSideComponent(<IssueProduction />);
    name === "ProductionFloorReceipt" &&
      setRightSideComponent(<ProductionFloorReceipt />);
    name === "ProductionReceipt" &&
      setRightSideComponent(<ProductionReceipt />);
    name === "ProductionMaterialUsage" &&
      setRightSideComponent(<ProductionMaterialUsage />);
    name === "WIPReturn" && setRightSideComponent(<WIPReturn />);
    name === "Reports" && setRightSideComponent(<div>Reports Coming Soon</div>);
    name === "Activity Logs" && setRightSideComponent(<ActivityLogs />);
    name === "Approve Items Quantity" &&
      setRightSideComponent(<ApproveItemsQuantity />);
  };

  return (
    <div
      className={`d-flex flex-column vh-100 sidebar ${
        isCollapsed ? "collapsed" : ""
      }`}
    >
      <div className="p-2 d-flex justify-content-between align-items-center">
        {!isCollapsed && <img src={ims_logo} width={66} height={60} />}
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
          <li
            key={idx}
            className="nav-item position-relative"
            onMouseEnter={() => isCollapsed && setHoveredMenu(item.label)}
            onMouseLeave={() => isCollapsed && setHoveredMenu(null)}
          >
            {/* Menu Item */}
            <div
              className={`nav-link text-white d-flex justify-content-between align-items-center menuListItem`}
              onClick={() => {
                if (item.submenu) {
                  // Toggle submenu
                  if (!isCollapsed) toggleSubmenu(item.label);
                } else {
                  // Navigate directly for menu items like "Reports" or "Activity Logs"
                  navigate(`/${item.path.toLowerCase().replace(/\s+/g, "-")}`);
                  setIsActiveComponent(item.path);
                  setLabelName(item.label);
                  handleRightSideComponentName(item.label); // Pass label if it's used as a compName
                }
              }}
            >
              <span>
                <i className={`${item.icon} me-2`}></i>
                {!isCollapsed && item.label}
              </span>

              {!isCollapsed && item.submenu && (
                <i
                  className={`fas fa-chevron-${
                    openSubmenus[item.label] ? "down" : "right"
                  }`}
                ></i>
              )}
            </div>

            {/* ▶️ Flyover submenu (collapsed mode) */}
            {isCollapsed && hoveredMenu === item.label && item.submenu && (
              <ul className="flyover-submenu nav flex-column">
                {item.submenu.map((sub, subIdx) => (
                  <li key={subIdx} className="nav-item">
                    <Link
                      to={sub.newPath}
                      onClick={() => {
                        handleRightSideComponentName(sub.compName);
                        setIsActiveComponent(sub.path);
                        setLabelName(sub.label);
                        setHoveredMenu(null);
                      }}
                      className="nav-link small submenu-item"
                    >
                      <i className={`${sub.icon} me-2`}></i>
                      {sub.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            {/* ▼ Expanded submenu (expanded mode) */}
            {!isCollapsed && openSubmenus[item.label] && item.submenu && (
              <ul className="nav flex-column ms-4">
                {item.submenu.map((sub, subIdx) => (
                  <li key={subIdx} className="nav-item">
                    <Link
                      to={sub.newPath}
                      onClick={() => {
                        handleRightSideComponentName(sub.compName);
                        setIsActiveComponent(sub.path);
                        setLabelName(sub.label);
                      }}
                      className="nav-link text-white small menuListItem"
                    >
                      <i className={`${sub.icon} me-2`}></i>
                      {sub.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
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
