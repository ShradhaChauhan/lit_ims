import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const AppContext = createContext();

const AppContextProvider = (props) => {
  const [rightSideComponent, setRightSideComponent] = useState(null);
  const [activeComponent, setIsActiveComponent] = useState(null);
  const [labelName, setLabelName] = useState(null);
  const [isAddUser, setIsAddUser] = useState(false);
  const [isAddVendor, setIsAddVendor] = useState(false);
  const [isAddItem, setIsAddItem] = useState(false);
  const [isAddWarehouse, setIsAddWarehouse] = useState(false);
  const [isAddType, setIsAddType] = useState(false);
  const [isAddGroup, setIsAddGroup] = useState(false);
  const [isAddPart, setIsAddPart] = useState(false);
  const [isAddBom, setIsAddBom] = useState(false);
  const [branchDropdownValues, setBranchDropdownValues] = useState([{}]);
  const [isAddVendorItem, setIsAddVendorItem] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [istoken, setIsToken] = useState("");
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);

  useEffect(() => {
    const savedPermissions = JSON.parse(
      localStorage.getItem("permissions") || "[]"
    );
    setPermissions(savedPermissions);
    setPermissionsLoaded(true); // Once loaded
  }, []);

  const getPermission = (pageName) => {
    return (
      permissions.find((p) => p.pageName === pageName) || {
        canView: false,
        canEdit: false,
      }
    );
  };

  useEffect(() => {
    const savedPermissions = JSON.parse(
      localStorage.getItem("permissions") || "[]"
    );
    setPermissions(savedPermissions);
  }, []);

  const updatePermissions = (newPermissions) => {
    setPermissions(newPermissions);
    localStorage.setItem("permissions", JSON.stringify(newPermissions));
  };

  // Sync changes to localStorage
  // useEffect(() => {
  //   localStorage.setItem("isAuthenticated", isAuthenticated);
  // }, [isAuthenticated]);

  // useEffect(() => {
  //   const storedPermissions = localStorage.getItem("permissions");
  //   try {
  //     if (storedPermissions) {
  //       const parsedPermissions = JSON.parse(storedPermissions);
  //       setPermissions(parsedPermissions);
  //     }
  //   } catch (e) {
  //     console.error("Failed to parse stored permissions:", e);
  //     localStorage.removeItem("permissions");
  //   }
  // }, []);

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    if (storedRole) setRole(storedRole);
  }, []);

  const value = {
    rightSideComponent,
    setRightSideComponent,
    activeComponent,
    setIsActiveComponent,
    labelName,
    setLabelName,
    isAddUser,
    setIsAddUser,
    isAddVendor,
    setIsAddVendor,
    isAddItem,
    setIsAddItem,
    isAddWarehouse,
    setIsAddWarehouse,
    isAddType,
    setIsAddType,
    isAddGroup,
    setIsAddGroup,
    isAddPart,
    setIsAddPart,
    isAddBom,
    setIsAddBom,
    branchDropdownValues,
    setBranchDropdownValues,
    isAuthenticated,
    setIsAuthenticated,
    isAddVendorItem,
    setIsAddVendorItem,
    permissions,
    setPermissions,
    updatePermissions,
    getPermission,
    role,
    setRole,
    istoken,
    setIsToken,
    permissionsLoaded,
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};

export default AppContextProvider;
