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

  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Sync changes to localStorage
  useEffect(() => {
    localStorage.setItem("isAuthenticated", isAuthenticated);
  }, [isAuthenticated]);

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
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};

export default AppContextProvider;
