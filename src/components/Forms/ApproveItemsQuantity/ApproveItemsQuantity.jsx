import React, { useEffect, useRef, useState } from "react";
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
      const response = await api.get(
        "/api/stock-adjustments/requests?status=PENDING"
      );
      console.log(response.data);
      if (response.data.status) {
        setList(response.data.data);
      } else {
        toast.error(response.data.message || "Failed to fetch list");
      }
    } catch (error) {
      toast.error("Error in getting pending list for approval");
      console.error(error);
    }
  };

  useEffect(() => {
    handleGetApprovalList();
  }, []);

  const handleApprove = async (id) => {
    try {
      const response = await api.post(
        `/api/stock-adjustments/requests/${id}/approve`
      );
      console.log(response.data);
      if (response.data.status) {
        toast.success(
          response.data.message || "Item quantity approved successfully"
        );
        handleGetApprovalList(); // Refresh the list after successful approval
      } else {
        toast.error(response.data.message || "Failed to approve");
      }
    } catch (error) {
      toast.error("Failed to approve. Please try again");
      console.error(error);
    }
  };

  const handleYesConfirm = async (e) => {
    try {
      if (!selectedItemId || !rejectionReason.trim()) {
        toast.error("Please provide a rejection reason");
        return;
      }

      const response = await api.post(
        `/api/stock-adjustments/requests/${selectedItemId}/reject?reason=${encodeURIComponent(
          rejectionReason
        )}`
      );

      if (response.data.status) {
        toast.success(response.data.message || "Request rejected successfully");
        handleGetApprovalList(); // Refresh the list
        handleCloseConfirmModal();
        setRejectionReason(""); // Clear the reason
      } else {
        toast.error(response.data.message || "Failed to reject request");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
      console.error(error.response?.data?.message || error);
    }
  };

  return (
    <div>
      {/* Header */}
      <nav className="navbar bg-light border-body" data-bs-theme="light">
        <div className="container-fluid">
          <div className="mt-4">
            <h3 className="nav-header header-style">Approve Items Quantity</h3>
            <p className="breadcrumb">
              <Link to="/dashboard">
                <i className="fas fa-home text-8"></i>
              </Link>{" "}
              <span className="ms-1 mt-1 text-small-gray">
                / Transactions / Approve Items Quantity
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
                <th>Item Name</th>
                <th>Item Code</th>
                <th>Std Qty</th>
                <th>New Qty</th>
                <th>Requested By</th>
                <th>Reason</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="text-break">
              {list.map((val) => (
                <tr key={val.id}>
                  <td className="ps-4">{val.itemName}</td>
                  <td className="ps-4">{val.itemCode}</td>
                  <td className="ps-4">{val.oldQty}</td>
                  <td className="ps-4">{val.requestedQty}</td>
                  <td className="ps-4">{val.requestedBy}</td>
                  <td className="ps-4">{val.reason}</td>
                  <td className="ps-4">
                    <div className="d-flex gap-2">
                      <button
                        className={`btn btn-sm icon-btn approve-btn ${
                          selectedActions[val.id] === "approve"
                            ? "selected"
                            : ""
                        }`}
                        onClick={() => {
                          toggleAction(val.id, "approve");
                          handleApprove(val.id);
                        }}
                        title="Approve"
                      >
                        <i className="fas fa-check"></i>
                      </button>
                      <button
                        className={`btn btn-sm icon-btn reject-btn ${
                          selectedActions[val.id] === "reject" ? "selected" : ""
                        }`}
                        onClick={() => {
                          toggleAction(val.id, "reject");
                          setSelectedItemId(val.id);
                          setMessage(
                            "You are going to reject the quantity change for the item: " +
                              val.itemName +
                              ". Are you sure?"
                          );
                          setIsConfirmModal(true);
                        }}
                        title="Reject"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Final Submit Button */}
        {/* <button
          className="btn btn-primary float-end mt-3 me-2 text-font"
          title="Submit"
          onClick={() => {
            const payload = Object.entries(selectedActions).map(
              ([id, action]) => ({
                id: Number(id),
                action: action?.toUpperCase() || "",
              })
            );
            console.log("Final submission:", payload);
            // Send to API if needed
          }}
        >
          <i className="fas fa-thumbs-up me-2"></i>
          Submit
        </button> */}
      </div>

      {/* Confirmation dialog modal */}
      {isConfirmModal && (
        <div
          className="modal fade"
          ref={modalRef}
          id="confirmModal"
          tabIndex="-1"
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
                  onClick={handleCloseConfirmModal}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                {message}
                <label htmlFor="rejectionReason" className="form-label mt-2">
                  Reason:{" "}
                </label>
                <input
                  type="text"
                  id="rejectionReason"
                  className="form-control text-font"
                  value={rejectionReason}
                  placeholder="Enter Reason"
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-primary add-btn"
                  onClick={handleYesConfirm}
                >
                  <i className="fas fa-check me-2"></i>
                  Yes
                </button>

                <button
                  type="button"
                  className="btn btn-secondary add-btn"
                  onClick={() => {
                    setConfirmState(false);
                    handleCloseConfirmModal();
                  }}
                >
                  <i className="fas fa-times me-2"></i>
                  No
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApproveItemsQuantity;
