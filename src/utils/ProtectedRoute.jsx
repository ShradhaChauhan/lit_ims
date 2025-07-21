// src/components/ProtectedRoute.jsx
import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";

const ProtectedRoute = ({ children, pageName }) => {
  const { permissions, role } = useContext(AppContext);

  if (role === "owner") {
    return children;
  }

  const page = permissions.find((p) => p.pageName === pageName);
  if (!page || !page.canView) {
    toast.error("Access Denied", {
      toastId: "access-denied",
    });

    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
