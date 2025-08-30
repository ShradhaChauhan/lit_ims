import React, { useContext, useEffect, useState } from "react";
import SearchBar from "../SearchBar/SearchBar";
import "./SideBar.css";
import { AppContext } from "../../context/AppContext";
import ims_logo from "../../assets/images/ims_logo.png";
import api from "../../services/api";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
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
import { AbilityContext } from "../../utils/AbilityContext";

const SideBar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const {
    rightSideComponent,
    setRightSideComponent,
    setIsActiveComponent,
    setLabelName,
    permissions,
    setPermissions,
    setIsAuthenticated,
    setIsToken,
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
      icon: "fa-solid fa-house",
      path: "dashboard",
      label: "Dashboard",
    },
    {
      icon: "fas fa-user-tie",
      path: "Administrations",
      label: "Administrations",
      submenu: [
        {
          label: "User Management",
          compName: "Users",
          newPath: "users",
          path: "Administrations / Users",
          icon: "fas fa-user-group",
        },
        // {
        //   label: "Role Management",
        //   compName: "RoleManagement",
        //   newPath: "role-management",
        //   path: "Administrations / Role Management",
        //   icon: "fas fa-tag",
        // },
        // {
        //   label: "System Settings",
        //   compName: "SystemSettings",
        //   newPath: "system-settings",
        //   path: "Administrations / System Settings",
        //   icon: "fas fa-gears",
        // },
        // {
        //   label: "Audit Logs",
        //   compName: "AuditLogs",
        //   newPath: "warehouse-master",
        //   path: "Administrations / Audit Logs",
        //   icon: "fas fa-newspaper",
        // },
        {
          label: "My Approvals",
          compName: "ApproveItemsQuantity",
          newPath: "approve-items-quantity",
          path: "Administrations / My Approvals",
          icon: "fas fa-thumbs-up",
        },
      ],
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
          label: "Vendor Item Master",
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
        // {
        //   label: "Part Master",
        //   compName: "PartMaster",
        //   newPath: "part-master",
        //   path: "Masters / Part Master",
        //   icon: "fas fa-cog",
        // },
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
          label: "IQC",
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
          label: "Material Issue Transfer",
          compName: "IssueProduction",
          newPath: "issue-to-production",
          path: "Transactions / Material Issue Transfer",
          icon: "fas fa-dolly",
        },
        {
          label: "Material Receipt",
          compName: "ProductionFloorReceipt",
          newPath: "production-floor-receipt",
          path: "Transactions /Production Floor Receipt",
          icon: "fas fa-circle-check",
        },
        // {
        //   label: "Production Material Usage",
        //   compName: "ProductionMaterialUsage",
        //   newPath: "production-material-usage",
        //   path: "Transactions / Production Material Usage",
        //   icon: "fas fa-industry",
        // },
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
      path: "reports",
      label: "Reports",
      submenu: [
        {
          label: "Inventory Audit Report",
          compName: "InventoryAuditReport",
          newPath: "inventory-audit-report",
          path: "Reports / Inventory Audit Report",
          icon: "fas fa-chart-area",
        },
        // {
        //   label: "Transaction Report",
        //   compName: "TransactionReport",
        //   newPath: "transactions-report",
        //   path: "Reports / Transaction Report",
        //   icon: "fas fa-chart-line",
        // },
        // {
        //   label: "Production Report",
        //   compName: "ProductionReport",
        //   newPath: "production-report",
        //   path: "Reports / Production Report",
        //   icon: "fas fa-chart-bar",
        // },
      ],
    },
    {
      icon: "fa-solid fa-star",
      path: "activity-logs",
      label: "Activity Logs",
    },
  ];

  useEffect(() => {
    // Whenever permissions change, update the UI
  }, [permissions]);

  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout");

      // Clear cookies
      Cookies.remove("authToken");
      Cookies.remove("permissions");
      Cookies.remove("username");
      Cookies.remove("rememberedUsername");

      // Reset auth state
      setIsAuthenticated(false);
      setIsToken(null);
      setPermissions([]);

      navigate("/");
    } catch (err) {
      console.error("Logout Failed", err);
    }
  };

  // const handleLogout = async () => {
  //   try {
  //     await api.post("/api/auth/logout");

  //     // Clear all localStorage
  //     localStorage.clear();

  //     // Reset auth state
  //     setIsAuthenticated(false);
  //     setIsToken(null);
  //     setPermissions([]);

  //     navigate("/");
  //   } catch (err) {
  //     console.error("Logout Failed", err);
  //   }
  // };

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
    name === "Reports" &&
      permissions.some((p) => p.pageName.includes("Report") && p.canView) &&
      setRightSideComponent(<div>Reports Coming Soon</div>);
    name === "Activity Logs" && setRightSideComponent(<ActivityLogs />);
    name === "My Approvals" && setRightSideComponent(<ApproveItemsQuantity />);
  };

  // RBAC
  const ability = useContext(AbilityContext);

  // Search bar filter
  const [filteredMenuItems, setFilteredMenuItems] = useState(menuItems);

  useEffect(() => {
    if (!searchTerm.trim()) {
      // Reset state only if it actually needs resetting
      setFilteredMenuItems(menuItems);
      setOpenSubmenus({});
      return;
    }

    const lowerSearch = searchTerm.toLowerCase();
    const newOpenSubmenus = {};
    const newFilteredItems = [];

    menuItems.forEach((item) => {
      if (item.label === "Dashboard") {
        if (item.label.toLowerCase().includes(lowerSearch)) {
          newFilteredItems.push(item);
        }
        return;
      }

      if (!item.submenu) {
        const hasPermission = ability.can("view", item.label || "");
        const matchesSearch = item.label.toLowerCase().includes(lowerSearch);
        if (hasPermission && matchesSearch) {
          newFilteredItems.push(item);
        }
        return;
      }

      const filteredSubmenu = item.submenu.filter(
        (sub) =>
          sub.label.toLowerCase().includes(lowerSearch) &&
          ability.can("view", sub.label || "")
      );

      const matchesMenuLabel = item.label.toLowerCase().includes(lowerSearch);

      if (matchesMenuLabel || filteredSubmenu.length > 0) {
        if (filteredSubmenu.length > 0) {
          newFilteredItems.push({
            ...item,
            submenu: filteredSubmenu,
          });
          newOpenSubmenus[item.label] = true;
        } else if (matchesMenuLabel) {
          newFilteredItems.push(item);
        }
      }
    });

    setFilteredMenuItems((prev) =>
      JSON.stringify(prev) !== JSON.stringify(newFilteredItems)
        ? newFilteredItems
        : prev
    );
    setOpenSubmenus((prev) =>
      JSON.stringify(prev) !== JSON.stringify(newOpenSubmenus)
        ? newOpenSubmenus
        : prev
    );
  }, [searchTerm]);

  return (
    <div
      className={`d-flex flex-column vh-100 sidebar ${
        isCollapsed ? "collapsed" : ""
      }`}
    >
      <div className="sidebar-header">
        <div className="p-2 d-flex justify-content-between align-items-center">
          {!isCollapsed && <img src={ims_logo} width={66} height={60} />}
          <button
            className="btn btn-sm btn-outline-light"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <i className="fa-solid fa-bars"></i>
          </button>
        </div>
      </div>
      <div className="sidebar-scroll-area">
        {/* Search Bar */}
        <SearchBar
          isCollapsed={isCollapsed}
          setIsCollapsed={setIsCollapsed}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        {/* Menu Items */}
        {!isCollapsed && <p className="heading">MAIN MENU</p>}
        <ul className="nav nav-pills flex-column mb-auto mt-1">
          {filteredMenuItems
            .filter((item) => {
              // If item has submenu, check if at least one submenu has permission
              if (item.submenu) {
                const visibleSubs = item.submenu.filter((sub) =>
                  ability.can("view", sub.label || "")
                );
                return visibleSubs.length > 0;
              }
              // If no submenu, just check direct permission
              return ability.can("view", item.label || "");
            })
            .map((item, idx) => (
              <li
                key={idx}
                className="nav-item position-relative"
                onMouseEnter={() => isCollapsed && setHoveredMenu(item.label)}
                onMouseLeave={() => isCollapsed && setHoveredMenu(null)}
              >
                {/* Menu Item */}
                <div
                  className={`nav-link text-8 d-flex justify-content-between align-items-center menuListItem`}
                  onClick={() => {
                    if (item.submenu) {
                      if (isCollapsed) {
                        setIsCollapsed(false);
                        setTimeout(() => toggleSubmenu(item.label), 100);
                      } else {
                        toggleSubmenu(item.label);
                      }
                      setIsActiveMenu(item.label);
                    } else {
                      navigate(
                        `/${item.path.toLowerCase().replace(/\s+/g, "-")}`
                      );
                      setIsActiveComponent(item.path);
                      setLabelName(item.label);
                      handleRightSideComponentName(item.label);
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

                {/* Expanded submenu (expanded mode) */}
                {!isCollapsed && openSubmenus[item.label] && item.submenu && (
                  <ul className="nav flex-column ms-4">
                    {item.submenu
                      .filter((sub) => ability.can("view", sub.label || ""))
                      .map((sub, subIdx) => (
                        <li key={subIdx} className="nav-item">
                          <Link
                            to={sub.newPath}
                            onClick={() => {
                              handleRightSideComponentName(sub.compName);
                              setIsActiveComponent(sub.path);
                              setLabelName(sub.label);
                            }}
                            className="nav-link text-8 small menuListItem"
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
      </div>

      {!isCollapsed ? (
        <div className="ms-2">
          <div className="user-profile">
            <div className="profile-info" title="John Doe">
              <img
                src={`https://ui-avatars.com/api/?name=${localStorage.getItem(
                  "username"
                )}&background=2563eb&color=fff`}
                alt="Profile"
              />
              <div className="user-details">
                <p className="m-0 text-8">
                  Hi, <span>{Cookies.get("username")}</span>
                </p>
              </div>
            </div>
            <button onClick={handleLogout} className="btn logout text-8 ms-3">
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
          </div>
        </div>
      ) : (
        <button onClick={handleLogout} className="nav-link menuListItem text-8">
          <i className="fas fa-sign-out-alt mb-4"></i>
        </button>
      )}
    </div>
  );
};

export default SideBar;
