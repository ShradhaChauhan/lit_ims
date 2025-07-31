import React, { useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./ApproveItemsQuantity.css";
import { toast } from "react-toastify";
import api from "../../../services/api";
import { Modal } from "bootstrap";

const ApproveItemsQuantity = () => {
  const [selectedActions, setSelectedActions] = useState({});
  const [list, setList] = useState([]);
  const [isConfirmModal, setIsConfirmModal] = useState(false);
  const modalRef = useRef(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [message, setMessage] = useState("");
  const [confirmState, setConfirmState] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [approvedItems, setApprovedItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  // Pagination states
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [showMetaModal, setShowMetaModal] = useState(false);
  const [metaDetails, setMetaDetails] = useState(null);

  // Calculate the display range for the pagination info
  const getDisplayRange = () => {
    const start = (pagination.currentPage - 1) * pagination.itemsPerPage + 1;
    const end = Math.min(
      start + approvedItems.length - 1,
      pagination.totalItems
    );

    if (approvedItems.length === 0) {
      return "0";
    }

    return `${start}-${end}`;
  };

  const handlePageChange = (newPage) => {
    if (
      newPage < 1 ||
      newPage > pagination.totalPages ||
      newPage === pagination.currentPage
    ) {
      return;
    }

    setPagination((prev) => ({
      ...prev,
      currentPage: newPage,
    }));

    // fetch reports will be called by the useEffect that depends on currentPage
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const totalPages = pagination.totalPages;
    const currentPage = pagination.currentPage;

    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 3) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }

    if (currentPage >= totalPages - 2) {
      return [
        1,
        "...",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [
      1,
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      totalPages,
    ];
  };

  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = parseInt(e.target.value);

    setPagination((prev) => ({
      ...prev,
      itemsPerPage: newItemsPerPage,
      currentPage: 1, // Reset to first page when changing items per page
    }));

    // fetchItems will be called by the useEffect that depends on itemsPerPage
  };

  // Global function to clean up modal artifacts
  const cleanupModalArtifacts = () => {
    document.body.classList.remove("modal-open");
    document.body.style.paddingRight = "";
    document.body.style.overflow = "";
    const backdrops = document.getElementsByClassName("modal-backdrop");
    while (backdrops.length > 0) {
      backdrops[0].remove();
    }
  };

  const handleCloseConfirmModal = () => {
    // Close Bootstrap modal manually
    if (modalRef.current) {
      const bsModal = Modal.getInstance(modalRef.current);
      if (bsModal) {
        bsModal.hide();
      }
    }

    // Cleanup backdrop and modal-related styles
    cleanupModalArtifacts();

    // Delay state reset to avoid flicker
    setTimeout(() => {
      setIsConfirmModal(false);
    }, 300);
  };

  useEffect(() => {
    if (isConfirmModal && modalRef.current) {
      const bsModal = new Modal(modalRef.current, {
        backdrop: "static",
      });
      bsModal.show();

      // Optional: hide modal state when it's closed
      modalRef.current.addEventListener("hidden.bs.modal", () =>
        setIsConfirmModal(false)
      );
    }
  }, [isConfirmModal]);

  const handleGetApprovalList = async () => {
    try {
      const response = await api.get("/api/approvals/my");
      if (response.data.status) {
        setList(response.data.data);
      } else {
        toast.error(response.data.message || "Failed to fetch approvals");
      }
    } catch (error) {
      toast.error("Error in getting approvals");
      console.error(error);
    }
  };

  useEffect(() => {
    handleGetApprovalList();
  }, []);

  const handleApprovalAction = async (id, status) => {
    // status === "APPROVED"
    //   ? setMessage("Enter remarks for approval (optional)")
    //   : setMessage("Enter remarks for rejection (optional)");
    let remarks = "";
    // if (window && typeof window.prompt === "function") {
    //   remarks = window.prompt(
    //     `Enter remarks for ${
    //       status === "APPROVED" ? "approval" : "rejection"
    //     } (optional):`,
    //     ""
    //   );
    //   if (remarks === null) return; // Cancelled
    // }
    try {
      const url = `/api/approvals/${id}/action?status=${status}${
        remarks ? `&remarks=${encodeURIComponent(remarks)}` : ""
      }`;
      const response = await api.post(url);
      if (response.data.status) {
        toast.success(
          response.data.message ||
            `Request ${status.toLowerCase()} successfully`
        );
        // handleGetApprovalList();
      } else {
        toast.error(
          response.data.message || `Failed to ${status.toLowerCase()}`
        );
      }
      handleGetApprovalList();
    } catch (error) {
      toast.error(
        error.response?.data?.message || `Failed to ${status.toLowerCase()}`
      );
    }
  };

  const handleViewMeta = (metaData) => {
    let parsed = null;
    try {
      parsed =
        typeof metaData === "string" && metaData.trim().startsWith("{")
          ? JSON.parse(metaData)
          : metaData;
    } catch {
      parsed = metaData;
    }
    setMetaDetails(parsed);
    setShowMetaModal(true);
  };

  const handleCloseMetaModal = () => {
    setShowMetaModal(false);
    setMetaDetails(null);
  };

  return (
    <div>
      {/* Header */}
      <nav className="navbar bg-light border-body" data-bs-theme="light">
        <div className="container-fluid">
          <div className="mt-4">
            <h3 className="nav-header header-style">My Approvals</h3>
            <p className="breadcrumb">
              <Link to="/dashboard">
                <i className="fas fa-home text-8"></i>
              </Link>{" "}
              <span className="ms-1 mt-1 text-small-gray">
                / Transactions / My Approvals
              </span>
            </p>
          </div>
        </div>
      </nav>

      {/* Table */}
      <div className="margin-2 mx-2">
        <div className="table-container">
          <table
            className="table align-middle w-100"
            style={{ tableLayout: "auto" }}
          >
            <thead>
              <tr>
                <th>ID</th>
                <th>Reference Type</th>
                <th>Reference ID</th>
                <th>Requested By</th>
                <th>Requested To</th>
                <th>Status</th>
                {/* <th>Remarks</th> */}
                <th>Requested Date</th>
                <th>Details</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="text-break">
              {list.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center">
                    <div className="p-4">
                      <i class="fa-solid fa-check-to-slot fa-3x mb-3 icon-color"></i>
                      <h5 className="gray">Nothing to approve</h5>
                    </div>
                  </td>
                </tr>
              ) : (
                list.map((val) => (
                  <tr key={val.id}>
                    <td className="text-wrap">{val.id}</td>
                    <td className="text-wrap">{val.referenceType}</td>
                    <td className="text-wrap">{val.referenceId}</td>
                    <td className="text-wrap">{val.requestedBy}</td>
                    <td className="text-wrap">{val.requestedTo}</td>
                    <td className="text-wrap">{val.status}</td>
                    {/* <td className="text-wrap">{val.remarks ? val.remarks : "-"}</td> */}
                    <td className="text-wrap">
                      {val.requestedDate
                        ? new Date(val.requestedDate).toLocaleString()
                        : ""}
                    </td>
                    <td className="text-wrap">
                      <button
                        className="btn-icon btn-primary"
                        title="View Details"
                        onClick={() => handleViewMeta(val.metaData)}
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                    </td>
                    <td className="ps-2 text-nowrap align-middle">
                      <div className="d-flex align-items-center gap-2 flex-wrap">
                        <span
                          className="btn btn-outline-success btn-sm px-2 py-0 fw-semibold text-7"
                          role="button"
                          onClick={() =>
                            handleApprovalAction(val.id, "APPROVED")
                          }
                        >
                          Approve
                        </span>
                        <span
                          className="btn btn-outline-danger btn-sm px-2 py-0 fw-semibold text-7"
                          role="button"
                          onClick={() =>
                            handleApprovalAction(val.id, "REJECTED")
                          }
                        >
                          Reject
                        </span>
                      </div>
                    </td>

                    {/* <td className="ps-2">
                    <button
                      className="btn-icon btn-success me-2"
                      title="Approve"
                      onClick={() => {
                        handleApprovalAction(val.id, "APPROVED");
                        // setIsConfirmModal(true);
                      }}
                    >
                      <span className="badge text-bg-success">Approve</span>
                    </button>
                    <button
                      className="btn-icon btn-danger"
                      title="Reject"
                      onClick={() => {
                        handleApprovalAction(val.id, "REJECTED");
                        // setIsConfirmModal(true);
                      }}
                    >
                      <span className="badge text-bg-danger">Reject</span>
                    </button>
                  </td> */}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MetaData Modal */}
      {showMetaModal && (
        <div
          className="modal fade show"
          style={{ display: "block" }}
          tabIndex="-1"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-circle-info me-2"></i>Details
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseMetaModal}
                ></button>
              </div>
              <div className="modal-body">
                {metaDetails &&
                typeof metaDetails === "object" &&
                !Array.isArray(metaDetails) ? (
                  <table className="table table-bordered">
                    <tbody>
                      {Object.entries(metaDetails).map(([key, value]) => (
                        <tr key={key}>
                          <th style={{ verticalAlign: "top", width: "30%" }}>
                            {key}
                          </th>
                          <td>
                            {Array.isArray(value) ? (
                              <table className="table table-sm table-striped mb-0">
                                <thead>
                                  <tr>
                                    {value.length > 0 &&
                                    typeof value[0] === "object" ? (
                                      Object.keys(value[0]).map((k) => (
                                        <th key={k}>{k}</th>
                                      ))
                                    ) : (
                                      <th>Value</th>
                                    )}
                                  </tr>
                                </thead>
                                <tbody>
                                  {value.map((item, idx) => (
                                    <tr key={idx}>
                                      {typeof item === "object" ? (
                                        Object.values(item).map((v, i) => (
                                          <td key={i}>{String(v)}</td>
                                        ))
                                      ) : (
                                        <td>{String(item)}</td>
                                      )}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            ) : typeof value === "object" && value !== null ? (
                              <table className="table table-sm table-bordered mb-0">
                                <tbody>
                                  {Object.entries(value).map(([k, v]) => (
                                    <tr key={k}>
                                      <th>{k}</th>
                                      <td>{String(v)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            ) : (
                              String(value)
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ whiteSpace: "pre-line" }}>
                    {metaDetails
                      ? metaDetails
                          .split(",")
                          .map((part, idx) => (
                            <div key={idx}>{part.trim()}</div>
                          ))
                      : "No details available."}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary btn-css"
                  onClick={handleCloseMetaModal}
                >
                  <i className="fas fa-xmark me-2"></i>Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation dialog modal */}
      {/* {isConfirmModal && (
        <div
          className="modal fade"
          id="ConfirmModal"
          tabIndex="-1"
          ref={modalRef}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-circle-check me-2"></i>
                  Confirm
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setIsConfirmModal(false);
                  }}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">{message}</div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-primary add-btn"
                  onClick={() => {
                    if (modalRef.current) {
                      const bsModal = Modal.getInstance(modalRef.current);
                      if (bsModal) {
                        bsModal.hide();
                      }
                    }
                    cleanupModalArtifacts();
                    setTimeout(() => setIsConfirmModal(false), 300);
                  }}
                >
                  <i className="fas fa-check me-2"></i>
                  OK
                </button>
                <button
                  type="button"
                  className="btn btn-secondary add-btn"
                  onClick={() => {
                    if (modalRef.current) {
                      const bsModal = Modal.getInstance(modalRef.current);
                      if (bsModal) {
                        bsModal.hide();
                      }
                    }
                    cleanupModalArtifacts();
                    setTimeout(() => setIsConfirmModal(false), 300);
                  }}
                >
                  <i className="fas fa-times me-2"></i>
                  No
                </button>
              </div>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default ApproveItemsQuantity;
