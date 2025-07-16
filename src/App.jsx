import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Login from "./components/Login/Login";
import { Routes, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard/Dashboard";
import ItemMaster from "./components/Forms/ItemMaster/ItemMaster";
import VendorMaster from "./components/Forms/VendorMaster/VendorMaster";
import { useContext } from "react";
import { AppContext } from "./context/AppContext";
import SideBar from "./components/SideBar/SideBar";
// import Navbar from "./components/Navbar/Navbar";
import { useLocation } from "react-router-dom";
import WarehouseMaster from "./components/Forms/WarehouseMaster/WarehouseMaster";
import BOMMaster from "./components/Forms/BOMMaster/BOMMaster";
import TypeMaster from "./components/Forms/TypeMaster/TypeMaster";
import GroupMaster from "./components/Forms/GroupMaster/GroupMaster";
import PartMaster from "./components/Forms/PartMaster/PartMaster";
import VendorItemsMaster from "./components/Forms/VendorItemsMaster/VendorItemsMaster";
import MaterialIncoming from "./components/Forms/MaterialIncoming/MaterialIncoming";
import IncomingQC from "./components/Forms/IncomingQC/IncomingQC";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MaterialIssueRequest from "./components/Forms/MaterialIssueRequest/MaterialIssueRequest";
import IssueProduction from "./components/Forms/IssueProduction/IssueProduction";
import ProductionFloorReceipt from "./components/Forms/ProductionFloorReceipt/ProductionFloorReceipt";
import ActivityLogs from "./components/ActivityLogs/ActivityLogs";
import Reports from "./components/Reports/Reports";
import ProductionMaterialUsage from "./components/Forms/ProductionMaterialUsage/ProductionMaterialUsage";
import WIPReturn from "./components/Forms/WIPReturn/WIPReturn";
import Users from "./components/Users/Users";

function App() {
  const { rightSideComponent, setRightSideComponent, isAuthenticated } =
    useContext(AppContext);
  const location = useLocation();
  const isLoginPage = location.pathname === "/";

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnHover
        draggable
      />
      {isLoginPage ? (
        // Show only login component on the login route
        <Routes>
          <Route path="/" element={<Login />} />
        </Routes>
      ) : (
        <div className="container-fluid min-vh-100 d-flex flex-1 p-0 app-container">
          {/* Sidebar */}
          <div className="d-flex flex-column">
            <SideBar />
          </div>

          {/* Right Side Content */}
          <div className="w-100 d-flex flex-column content-area">
            {/* Content Area */}
            <div className="right-side-div bg-light flex-grow-1 overflow-auto">
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/users" element={<Users />} />
                <Route path="/business-partner" element={<VendorMaster />} />
                <Route path="/item-master" element={<ItemMaster />} />
                <Route path="/warehouse-master" element={<WarehouseMaster />} />
                <Route path="/bom-master" element={<BOMMaster />} />
                <Route path="/type-master" element={<TypeMaster />} />
                <Route path="/group-master" element={<GroupMaster />} />
                <Route path="/part-master" element={<PartMaster />} />
                <Route
                  path="/vendor-items-master"
                  element={<VendorItemsMaster />}
                />
                <Route
                  path="/material-incoming"
                  element={<MaterialIncoming />}
                />
                <Route path="/incoming-qc" element={<IncomingQC />} />
                <Route
                  path="/material-issue-request"
                  element={<MaterialIssueRequest />}
                />
                <Route
                  path="/issue-to-production"
                  element={<IssueProduction />}
                />
                <Route
                  path="/production-floor-receipt"
                  element={<ProductionFloorReceipt />}
                />
                <Route path="/inventory-audit-report" element={<Reports />} />
                <Route path="/activity-logs" element={<ActivityLogs />} />
                <Route
                  path="/production-material-usage"
                  element={<ProductionMaterialUsage />}
                />
                <Route path="/wip-return" element={<WIPReturn />} />
              </Routes>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
