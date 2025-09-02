import { Routes, Route } from "react-router-dom";
import Login from "./components/Login/Login";
import MainLayout from "./components/MainLayout/MainLayout";
import Dashboard from "./components/Dashboard/Dashboard";
import ProtectedRoute from "./utils/ProtectedRoute";
import PrivateRoute from "./PrivateRoute/PrivateRoute";
import Users from "./components/Users/Users";
import VendorMaster from "./components/Forms/VendorMaster/VendorMaster";
import ItemMaster from "./components/Forms/ItemMaster/ItemMaster";
import WarehouseMaster from "./components/Forms/WarehouseMaster/WarehouseMaster";
import BOMMaster from "./components/Forms/BOMMaster/BOMMaster";
import TypeMaster from "./components/Forms/TypeMaster/TypeMaster";
import GroupMaster from "./components/Forms/GroupMaster/GroupMaster";
import PartMaster from "./components/Forms/PartMaster/PartMaster";
import VendorItemsMaster from "./components/Forms/VendorItemsMaster/VendorItemsMaster";
import MaterialIncoming from "./components/Forms/MaterialIncoming/MaterialIncoming";
import IncomingQC from "./components/Forms/IncomingQC/IncomingQC";
import MaterialIssueRequest from "./components/Forms/MaterialIssueRequest/MaterialIssueRequest";
import IssueProduction from "./components/Forms/IssueProduction/IssueProduction";
import ProductionFloorReceipt from "./components/Forms/ProductionFloorReceipt/ProductionFloorReceipt";
import ActivityLogs from "./components/ActivityLogs/ActivityLogs";
import ProductionMaterialUsage from "./components/Forms/ProductionMaterialUsage/ProductionMaterialUsage";
import WIPReturn from "./components/Forms/WIPReturn/WIPReturn";
import ApproveItemsQuantity from "./components/Forms/ApproveItemsQuantity/ApproveItemsQuantity";
import Reports from "./components/Reports/Reports";
import Unauthorized from "./components/Unauthorized/Unauthorized";
import useAutoLogout from "./utils/useAutoLogout";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import StoreLandingPage from "./components/StoreLandingPage/StoreLandingPage";
import Cookies from "js-cookie";
import { useLocation } from "react-router-dom";
import { useIdleTimer } from "./utils/useIdleTimer";
import api from "./services/api";
import { useNavigate } from "react-router-dom";
import StockAdjustment from "./components/Forms/StockAdjustment/StockAdjustment";

function App() {
  // const [isLoggedIn, setIsLoggedIn] = useState(
  //   localStorage.getItem("isLoggedIn") === "true"
  // );

  const navigate = useNavigate();
  const location = useLocation();

  // Auto logout after 15 minutes of inactivity
  const handleLogout = async (type, currentPath = null) => {
    try {
      await api.post("/api/auth/logout"); // call API

      if (type === "auto" && currentPath) {
        Cookies.set("logoutType", "auto", { path: "/" });
        Cookies.set("lastVisitedRoute", currentPath, { path: "/" });
      } else if (type === "manual") {
        Cookies.set("logoutType", "manual", { path: "/" });
        Cookies.remove("lastVisitedRoute", { path: "/" });
      } else if (type === "closed") {
        Cookies.set("logoutType", "closed", { path: "/" });
        Cookies.remove("lastVisitedRoute", { path: "/" });
      }

      // Clear cookies
      Cookies.remove("authToken", { path: "/" });
      Cookies.remove("token", { path: "/" });
      Cookies.remove("permissions", { path: "/" });
      Cookies.remove("username", { path: "/" });
      Cookies.remove("isLoggedIn", { path: "/" });

      // Reset auth state
      setIsAuthenticated(false);
      setIsToken(null);
      setPermissions([]);

      navigate("/");
      toast.info("You have been logged out.");

      // only now redirect
      // window.location.href = "/";
    } catch (err) {
      console.error("Logout Failed", err);
    }
  };

  useIdleTimer(() => {
    const currentPath = window.location.pathname; // reliable
    handleLogout("auto", currentPath);
  }, 60 * 60 * 1000); // 60 min or your chosen duration

  // Tab close or browser close detection
  useEffect(() => {
    const handlePageHide = (event) => {
      // Detect if it's a refresh/navigation instead of close
      const navEntry = performance.getEntriesByType("navigation")[0];
      const isReload =
        navEntry &&
        navEntry.type &&
        (navEntry.type === "reload" || navEntry.type === "back_forward");

      if (isReload) {
        console.log("Page reloaded/navigation → skip logout");
        return;
      }

      if (!event.persisted) {
        console.log("Tab/window closed → logging out");

        // Use sendBeacon (fires reliably on unload/close)
        navigator.sendBeacon("/api/auth/logout");

        // Clear cookies
        Cookies.remove("authToken", { path: "/" });
        Cookies.remove("token", { path: "/" });
        Cookies.remove("permissions", { path: "/" });
        Cookies.remove("username", { path: "/" });
        Cookies.remove("isLoggedIn", { path: "/" });

        // Reset auth state
        setIsAuthenticated(false);
        setIsToken(null);
        setPermissions([]);
      }
    };

    window.addEventListener("pagehide", handlePageHide);
    return () => {
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, []);

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route element={<PrivateRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/store-dashboard" element={<StoreLandingPage />} />
          <Route
            path="/users"
            element={
              <ProtectedRoute page="User Management">
                <Users />
              </ProtectedRoute>
            }
          />
          <Route
            path="/business-partner"
            element={
              <ProtectedRoute page="Business Partner">
                <VendorMaster />
              </ProtectedRoute>
            }
          />
          <Route
            path="/item-master"
            element={
              <ProtectedRoute page="Item Master">
                <ItemMaster />
              </ProtectedRoute>
            }
          />
          <Route
            path="/warehouse-master"
            element={
              <ProtectedRoute page="Warehouse Master">
                <WarehouseMaster />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bom-master"
            element={
              <ProtectedRoute page="BOM Master">
                <BOMMaster />
              </ProtectedRoute>
            }
          />
          <Route
            path="/type-master"
            element={
              <ProtectedRoute page="Type Master">
                <TypeMaster />
              </ProtectedRoute>
            }
          />
          <Route
            path="/group-master"
            element={
              <ProtectedRoute page="Group Master">
                <GroupMaster />
              </ProtectedRoute>
            }
          />
          <Route
            path="/part-master"
            element={
              <ProtectedRoute page="Part Master">
                <PartMaster />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor-items-master"
            element={
              <ProtectedRoute page="Vendor Item Master">
                <VendorItemsMaster />
              </ProtectedRoute>
            }
          />
          <Route
            path="/material-incoming"
            element={
              <ProtectedRoute page="Store Material Inward">
                <MaterialIncoming />
              </ProtectedRoute>
            }
          />
          <Route
            path="/incoming-qc"
            element={
              <ProtectedRoute page="IQC">
                <IncomingQC />
              </ProtectedRoute>
            }
          />
          <Route
            path="/material-issue-request"
            element={
              <ProtectedRoute page="Material Issue Request">
                <MaterialIssueRequest />
              </ProtectedRoute>
            }
          />
          <Route
            path="/issue-to-production"
            element={
              <ProtectedRoute page="Material Issue Transfer">
                <IssueProduction />
              </ProtectedRoute>
            }
          />
          <Route
            path="/production-floor-receipt"
            element={
              <ProtectedRoute page="Material Receipt">
                <ProductionFloorReceipt />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory-audit-report"
            element={
              <ProtectedRoute page="Inventory Audit Report">
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/activity-logs"
            element={
              <ProtectedRoute page="Activity Logs">
                <ActivityLogs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/production-material-usage"
            element={
              <ProtectedRoute page="Production Material Usage">
                <ProductionMaterialUsage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wip-return"
            element={
              <ProtectedRoute page="WIP Return">
                <WIPReturn />
              </ProtectedRoute>
            }
          />
          <Route
            path="/approve-items-quantity"
            element={
              <ProtectedRoute page="My Approvals">
                <ApproveItemsQuantity />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stock-adjustment"
            element={
              <ProtectedRoute page="Stock Adjustment">
                <StockAdjustment />
              </ProtectedRoute>
            }
          />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
