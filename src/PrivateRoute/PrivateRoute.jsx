// import { Navigate, Outlet } from "react-router-dom";

// const PrivateRoute = () => {
//   const token = localStorage.getItem("authToken");
//   return token ? <Outlet /> : <Navigate to="/" />;
// };

// export default PrivateRoute;

import { Navigate, Outlet } from "react-router-dom";
import Cookies from "js-cookie";

const PrivateRoute = () => {
  const token = Cookies.get("authToken");
  return token ? <Outlet /> : <Navigate to="/" replace />;
};

export default PrivateRoute;
