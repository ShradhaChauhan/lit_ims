import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import api from "../../services/api";
import "./Navbar.css";
import { toast } from "react-toastify";

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
    setBranchDropdownValues,
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

  const handleLoadBranchDropdownValues = async (e) => {
    e.preventDefault();

    try {
      const response = await api.get("/api/branch/by-company"); // API call
      const branchList = response.data.data;

      const formattedBranches = branchList.map((branch) => ({
        label: `${branch.name} (${branch.code})`,
        value: branch.id,
      }));

      setBranchDropdownValues(formattedBranches); // ✅ Set dropdown values
      setIsAddUser(true); // ✅ Open the Add User form/modal
    } catch (error) {
      console.error("Failed to load branch dropdown values:", error);
      toast.error("Failed to load branches. Please try again");
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
            <button
              className="add-btn"
              onClick={handleLoadBranchDropdownValues}
            >
              <i className="fa-solid fa-plus pe-1"></i> Add New User
            </button>
          )}
          {/* Add Partner Button */}
          {activeComponent === "Masters / Business Partner" && (
            <button className="add-btn" onClick={() => setIsAddVendor(true)}>
              <i className="fa-solid fa-plus"></i> Add New Partner
            </button>
          )}
          {/* Add Item Button */}
          {activeComponent === "Masters / Item Master" && (
            <button className="add-btn" onClick={() => setIsAddItem(true)}>
              <i className="fa-solid fa-plus"></i> Add New Item
            </button>
          )}
          {/* Add Warehouse Button */}
          {activeComponent === "Masters / Warehouse Master" && (
            <button className="add-btn" onClick={() => setIsAddWarehouse(true)}>
              <i className="fa-solid fa-plus"></i> Add New Warehouse
            </button>
          )}
          {/* Add Type Button */}
          {activeComponent === "Masters / Type Master" && (
            <button className="add-btn" onClick={() => setIsAddType(true)}>
              <i className="fa-solid fa-plus"></i> Add New Type
            </button>
          )}
          {/* Add Group Button */}
          {activeComponent === "Masters / Group Master" && (
            <button className="add-btn" onClick={() => setIsAddGroup(true)}>
              <i className="fa-solid fa-plus"></i> Add New Group
            </button>
          )}
          {/* Add Part Button */}
          {activeComponent === "Masters / Part Master" && (
            <button className="add-btn" onClick={() => setIsAddPart(true)}>
              <i className="fa-solid fa-plus"></i> Add New Part
            </button>
          )}
          {/* Add BOM Button */}
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
