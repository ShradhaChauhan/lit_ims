import React from "react";
import { Link } from "react-router-dom";

const Reports = () => {
  return (
    <div>
      {" "}
      {/* Header Section */}
      <nav className="navbar bg-light border-body" data-bs-theme="light">
        <div className="container-fluid">
          <div className="mt-4">
            <h3 className="nav-header header-style">Audit Reports</h3>
            <p className="breadcrumb">
              <Link to="/dashboard">
                <i className="fas fa-home text-8"></i>
              </Link>{" "}
              <span className="ms-1 mt-1 text-small-gray">/ Audit Reports</span>
            </p>
          </div>
        </div>
      </nav>
      <div className="no-data-content fs-4">
        <i className="fas fa-clock"></i>
        <p className="fs-4">Coming Soon...</p>
      </div>
    </div>
  );
};

export default Reports;
