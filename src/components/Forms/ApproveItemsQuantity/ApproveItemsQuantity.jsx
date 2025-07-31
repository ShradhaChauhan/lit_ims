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

  const toggleAction = (id, action) => {
    setSelectedActions((prev) => ({
      ...prev,
      [id]: prev[id] === action ? null : action,
    }));
  };

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
    let remarks = '';
    if (window && typeof window.prompt === 'function') {
      remarks = window.prompt(`Enter remarks for ${status === 'APPROVED' ? 'approval' : 'rejection'} (optional):`, '');
      if (remarks === null) return; // Cancelled
    }
    try {
      const url = `/api/approvals/${id}/action?status=${status}${remarks ? `&remarks=${encodeURIComponent(remarks)}` : ''}`;
      const response = await api.post(url);
      if (response.data.status) {
        toast.success(response.data.message || `Request ${status.toLowerCase()} successfully`);
        handleGetApprovalList();
      } else {
        toast.error(response.data.message || `Failed to ${status.toLowerCase()}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${status.toLowerCase()}`);
    }
  };

  const handleViewMeta = (metaData) => {
    let parsed = null;
    try {
      parsed = typeof metaData === 'string' && metaData.trim().startsWith('{')
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
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Reference Type</th>
                <th>Reference ID</th>
                <th>Requested By</th>
                <th>Requested To</th>
                <th>Status</th>
                <th>Remarks</th>
                <th>Requested Date</th>
                <th>Details</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="text-break">
              {list.map((val) => (
                <tr key={val.id}>
                  <td className="ps-4">{val.id}</td>
                  <td className="ps-4">{val.referenceType}</td>
                  <td className="ps-4">{val.referenceId}</td>
                  <td className="ps-4">{val.requestedBy}</td>
                  <td className="ps-4">{val.requestedTo}</td>
                  <td className="ps-4">{val.status}</td>
                  <td className="ps-4">{val.remarks}</td>
                  <td className="ps-4">{val.requestedDate ? new Date(val.requestedDate).toLocaleString() : ''}</td>
                  <td className="ps-4">
                    <button className="btn btn-sm btn-info" onClick={() => handleViewMeta(val.metaData)}>View</button>
                  </td>
                  <td className="ps-4">
                    <button className="btn btn-sm btn-success me-2" onClick={() => handleApprovalAction(val.id, 'APPROVED')}>Approve</button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleApprovalAction(val.id, 'REJECTED')}>Reject</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MetaData Modal */}
      {showMetaModal && (
        <div className="modal fade show" style={{display:'block'}} tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Details</h5>
                <button type="button" className="btn-close" onClick={handleCloseMetaModal}></button>
              </div>
              <div className="modal-body">
                {metaDetails && typeof metaDetails === 'object' && !Array.isArray(metaDetails) ? (
                  <table className="table table-bordered">
                    <tbody>
                      {Object.entries(metaDetails).map(([key, value]) => (
                        <tr key={key}>
                          <th style={{verticalAlign: 'top', width: '30%'}}>{key}</th>
                          <td>
                            {Array.isArray(value) ? (
                              <table className="table table-sm table-striped mb-0">
                                <thead>
                                  <tr>
                                    {value.length > 0 && typeof value[0] === 'object'
                                      ? Object.keys(value[0]).map((k) => <th key={k}>{k}</th>)
                                      : <th>Value</th>}
                                  </tr>
                                </thead>
                                <tbody>
                                  {value.map((item, idx) => (
                                    <tr key={idx}>
                                      {typeof item === 'object'
                                        ? Object.values(item).map((v, i) => <td key={i}>{String(v)}</td>)
                                        : <td>{String(item)}</td>}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            ) : typeof value === 'object' && value !== null ? (
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
                            ) : String(value)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{whiteSpace: 'pre-line'}}>
                    {metaDetails
                      ? metaDetails.split(',').map((part, idx) => <div key={idx}>{part.trim()}</div>)
                      : 'No details available.'}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseMetaModal}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApproveItemsQuantity;
