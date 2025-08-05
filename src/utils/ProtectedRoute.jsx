// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import { useAbility } from "../utils/AbilityContext";

const ProtectedRoute = ({ page, children }) => {
  const ability = useAbility();
  const { permissionsLoaded } = useContext(AppContext);

  // ⏳ Wait for permissions to be loaded before making access decision
  if (!permissionsLoaded) return null; // or show a loader/spinner

  return ability.can("view", page) ? (
    children
  ) : (
    <Navigate to="/unauthorized" replace />
  );
};

export default ProtectedRoute;
