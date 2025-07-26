// src/components/ProtectedRoute.jsx
import { useAbility } from "../utils/AbilityContext";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ page, children }) => {
  const ability = useAbility();

  return ability.can("view", page) ? (
    children
  ) : (
    <Navigate to="/unauthorized" replace />
  );
};

export default ProtectedRoute;
