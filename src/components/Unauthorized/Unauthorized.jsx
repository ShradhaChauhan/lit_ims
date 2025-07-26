import React from "react";
import "./Unauthorized.css";

const Unauthorized = () => {
  return (
    <div className="unauthorized-wrapper d-flex align-items-center justify-content-center vh-100 bg-dark text-white">
      <div className="container d-flex flex-column flex-md-row align-items-center justify-content-between px-4">
        <div className="text-section mb-5 mb-md-0">
          <h1 className="text-danger fade-in-top">403 - Access Denied</h1>
          <h2 className="fw-semibold slide-in-left">You are not authorized.</h2>
          <p className="text-muted mt-3 fade-in delay-2">
            You don’t have the necessary permissions to access this page. If you
            believe this is a mistake, please contact the administrator.
          </p>
        </div>
        <div className="door-section text-center bounce-in">
          <div className="neon-403 mb-3">403</div>
          <div className="door rounded"></div>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
