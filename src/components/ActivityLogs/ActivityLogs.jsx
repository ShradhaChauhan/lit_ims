import React, { useEffect, useRef, useState } from "react";
import { debounce } from "lodash";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../services/api";
import "./ActivityLogs.css";
import { Modal } from "bootstrap";
import Cookies from "js-cookie";

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isShowLogDetails, setIsShowLogDetails] = useState(false);
  const [logDetails, setLogDetails] = useState(null);
  const logModalRef = useRef(null);
  useEffect(() => {
    if (isShowLogDetails && logModalRef.current) {
      const bsModal = new Modal(logModalRef.current, {
        backdrop: "static",
      });
      bsModal.show();

      logModalRef.current.addEventListener("hidden.bs.modal", () =>
        setIsShowLogDetails(false)
      );
    }
  }, [isShowLogDetails]);
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filter
  const [selectedAction, setSelectedAction] = useState("");

  const filteredLogs = useMemo(() => {
    const term = inputValue.toLowerCase();

    return logs.filter((log) => {
      const matchesSearch =
        log.id?.toString().toLowerCase().includes(term) ||
        log.details?.toLowerCase().includes(term) ||
        log.performedBy?.toLowerCase().includes(term) ||
        (log.timestamp &&
          new Date(log.timestamp)
            .toLocaleString()
            .toLowerCase()
            .includes(term)) ||
        log.action?.toLowerCase().includes(term);

      const matchesAction =
        selectedAction === "" ||
        log.action?.toLowerCase() === selectedAction.toLowerCase();

      return matchesSearch && matchesAction;
    });
  }, [logs, inputValue, selectedAction]);

  // Pagination Calculation
  const indexOfLastLog = currentPage * rowsPerPage;
  const indexOfFirstLog = indexOfLastLog - rowsPerPage;
  const totalPages = Math.ceil(filteredLogs.length / rowsPerPage);
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);

  // const getActivityLogs = async () => {
  //   try {
  //     const response =
  //       localStorage.getItem("username") === "owner"
  //         ? await api.get("/api/logs")
  //         : await api.get("/api/logs/me");
  //     const logData = response?.data ?? [];
  //     setLogs(logData);
  //   } catch (error) {
  //     toast.error("Error: Unable to fetch activity logs.");
  //     console.error("Error fetching activity logs:", error);
  //   }
  // };

  const getActivityLogs = async () => {
    try {
      // const isOwner = localStorage.getItem("username") === "owner";
      const isOwner = Cookies.get("username") === "owner";

      const response = isOwner
        ? await api.get("/api/logs")
        : await api.get("/api/logs/me");

      const logData = response?.data ?? [];
      setLogs(logData);
    } catch (error) {
      toast.error("Error: Unable to fetch activity logs.");
      console.error("Error fetching activity logs:", error);
    }
  };

  useEffect(() => {
    getActivityLogs();
  }, []);

  useEffect(() => {
    const debounced = debounce((val) => {
      setCurrentPage(1);
    }, 300);

    debounced(inputValue);

    return () => {
      debounced.cancel();
    };
  }, [inputValue]);

  const handleViewDetails = (log, e) => {
    e.preventDefault();
    console.log(log);
    setLogDetails(log);
    setIsShowLogDetails(true);
  };

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
            placeholder="Search transactions..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
        </div>
        <div className="filter-options">
          <select
            className="filter-select"
            value={selectedAction}
            onChange={(e) => {
              setSelectedAction(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">Action</option>
            <option value="CREATE">Create</option>
            <option value="VIEW">View</option>
            <option value="UPDATE">Update</option>
            <option value="DELETE">Delete</option>
          </select>
        </div>
        <div className="filter-options">
          <button
            className="filter-select"
            onClick={() => {
              setInputValue("");
              setSelectedAction("");
              setCurrentPage(1);
            }}
          >
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
                <th>IP Address</th>
                <th>Actions</th>
                <th>View Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr className="no-data-row">
                  <td colSpan="5" className="no-data-cell">
                    <div className="no-data-content">
                      <i className="fas fa-star no-data-icon"></i>
                      <p className="no-data-text">No activity logs found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="checkbox-cell ps-4">{log.id ?? "-"}</td>
                    <td className="ps-4 text-break">{log.details ?? "-"}</td>
                    <td className="ps-4 text-break">
                      {log.performedBy ?? "System"}
                    </td>
                    <td className="ps-4 text-break">
                      {log.timestamp
                        ? new Date(log.timestamp).toLocaleString()
                        : "-"}
                    </td>
                    <td className="ps-4 text-break">{log.ipAddress ?? "-"}</td>
                    <td
                      className={`badge text-center ${
                        log.action === "CREATE"
                          ? "create"
                          : log.action === "VIEW"
                          ? "view"
                          : log.action === "UPDATE"
                          ? "update"
                          : "delete"
                      } px-2 py-1 mt-4 ms-3`}
                    >
                      {log.action ?? "-"}
                    </td>

                    <td className="ps-5">
                      <button
                        className="btn-icon btn-primary"
                        title="View Details"
                        onClick={(e) => handleViewDetails(log, e)}
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {/* Pagination */}
          <div className="pagination-container">
            <div className="pagination-info">
              Showing {indexOfFirstLog + 1} to{" "}
              {Math.min(indexOfLastLog, filteredLogs.length)} of{" "}
              {filteredLogs.length} entries
            </div>
            <div className="pagination">
              <button
                className="btn-page"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <i className="fas fa-chevron-left"></i>
                {/* &laquo; Prev */}
              </button>
              <button className="btn btn-primary">{currentPage}</button>
              <button
                className="btn-page"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                <i className="fas fa-chevron-right"></i>
                {/* Next &raquo; */}
              </button>
            </div>
            <div className="items-per-page">
              <select
                className="form-select"
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1); // reset to page 1
                }}
              >
                <option value="10">10 per page</option>
                <option value="25">25 per page</option>
                <option value="50">50 per page</option>
                <option value="100">100 per page</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      {/* View Item Details Modal */}
      {/* View Receipt Details Modal */}
      {isShowLogDetails && (
        <div
          className="modal fade modal-lg"
          ref={logModalRef}
          id="logDetailModal"
          tabIndex="-1"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-circle-info me-2"></i>Transaction Details
                </h5>
                <button
                  type="button"
                  className="btn"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="modal-body">
                <div className="user-details-grid">
                  <div className="detail-item">
                    <strong>Module:</strong>
                    <span>{logDetails.entityName}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Module Id:</strong>
                    <span>{logDetails.entityId}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Performed By:</strong>
                    <span>{logDetails.performedBy}</span>
                  </div>
                  <div className="detail-item">
                    <strong>IP Address:</strong>
                    <span>{logDetails.ipAddress}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Details:</strong>
                    <span>{logDetails.details}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Time:</strong>
                    <span>{logDetails.timestamp}</span>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary add-btn"
                  data-bs-dismiss="modal"
                  onClick={() => {
                    document.activeElement?.blur();
                  }}
                >
                  <i className="fas fa-xmark me-2"></i>Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityLogs;
