import { createContext, useState } from "react";

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
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};

export default AppContextProvider;
