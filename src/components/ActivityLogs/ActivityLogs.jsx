import React, { useState } from "react";
import { Link } from "react-router-dom";

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  return (
    <div>
      {" "}
      {/* Header Section */}
      <nav className="navbar bg-light border-body" data-bs-theme="light">
        <div className="container-fluid">
          <div className="mt-4">
            <h3 className="nav-header header-style">Activity Logs</h3>
            <p className="breadcrumb">
              <Link to="/dashboard">
                <i className="fas fa-home text-8"></i>
              </Link>{" "}
              <span className="ms-1 mt-1 text-small-gray">/ Activity Logs</span>
            </p>
          </div>
        </div>
      </nav>
      {/* Search and Filter Section */}
      <div className="search-filter-container mx-2">
        <div className="search-box">
          <i className="fas fa-search position-absolute z-0 input-icon"></i>
          <input
            type="text"
            className="form-control vendor-search-bar"
            placeholder="Search by transaction number..."
          />
        </div>
        <div className="filter-options">
          <button className="filter-select">
            <i className="fas fa-filter me-2"></i>
            Reset Filters
          </button>
        </div>
      </div>
      {/* Logs Table Section */}
      <div className="margin-2 mx-2">
        <div className="table-container">
          <div className="table-header"></div>
          <table>
            <thead>
              <tr>
                <th className="checkbox-cell">Id</th>
                <th>Details</th>
                <th>Performed By</th>
                <th>Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr className="no-data-row">
                  <td colSpan="5" className="no-data-cell">
                    <div className="no-data-content">
                      <i className="fas fa-star no-data-icon"></i>
                      <p className="no-data-text">No activity logs found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td className="checkbox-cell ps-4">
                      <div>
                        <span>{log.id}</span>
                      </div>
                    </td>
                    <td className="ps-4">
                      <div>
                        <span>{log.details}</span>
                      </div>
                    </td>
                    <td className="ps-4">
                      <div>
                        <span>{log.performed_by}</span>
                      </div>
                    </td>
                    <td className="ps-4">
                      <span>{log.time}</span>
                    </td>
                    <td className="ps-4">
                      <span>{log.action}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ActivityLogs;
