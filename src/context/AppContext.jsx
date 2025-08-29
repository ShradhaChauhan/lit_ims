import { createContext, useEffect, useState } from "react";
import Cookies from "js-cookie";

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

  // ---- Reset Auth State ----
  const resetAuthState = () => {
    setIsAuthenticated(false);
    setIsToken("");
    setPermissions([]);
    setRole(null);

    // Remove cookies
    Cookies.remove("authToken");
    Cookies.remove("permissions");
    Cookies.remove("username");
    Cookies.remove("isLoggedIn");
  };

  // ---- Load permissions and auth state on mount ----
  useEffect(() => {
    const token = Cookies.get("authToken");
    if (!token) {
      resetAuthState(); // User is logged out
    } else {
      setIsAuthenticated(true);
      setIsToken(token);

      const savedPermissions = Cookies.get("permissions")
        ? JSON.parse(Cookies.get("permissions"))
        : [];
      setPermissions(savedPermissions);

      const savedRole = Cookies.get("role") || null;
      setRole(savedRole);
    }
    setPermissionsLoaded(true);
  }, []);

  // ---- Helper: get permissions for a page ----
  const getPermission = (pageName) => {
    return (
      permissions.find((p) => p.pageName === pageName) || {
        canView: false,
        canEdit: false,
      }
    );
  };

  // ---- Update permissions and save to cookies ----
  const updatePermissions = (newPermissions) => {
    setPermissions(newPermissions);
    Cookies.set("permissions", JSON.stringify(newPermissions), { expires: 1 });
  };

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
    isAddVendorItem,
    setIsAddVendorItem,
    isAuthenticated,
    setIsAuthenticated,
    role,
    setRole,
    permissions,
    setPermissions,
    updatePermissions,
    getPermission,
    istoken,
    setIsToken,
    permissionsLoaded,
    resetAuthState, // Expose to use in logout
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};

export default AppContextProvider;
