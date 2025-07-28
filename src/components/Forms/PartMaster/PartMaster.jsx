import React, { useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "../../../context/AppContext";
import api from "../../../services/api";
import { Link } from "react-router-dom";
import { Modal } from "bootstrap";
import { toast } from "react-toastify";
import { AbilityContext } from "../../../utils/AbilityContext";

const PartMaster = () => {
  const [errors, setErrors] = useState({});
  const { isAddPart, setIsAddPart } = useContext(AppContext);
  const partModalRef = useRef(null);
  const partEditModalRef = useRef(null);
  const [isShowPartDetails, setIsShowPartDetails] = useState(false);
  const [isEditPartDetails, setIsEditPartDetails] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [uomFilter, setUOMFilter] = useState("");
  const [partDetails, setPartDetails] = useState({
    id: "",
    trNo: "",
    name: "",
    uom: "",
    status: "",
  });
  const [selectedParts, setSelectedParts] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [status, setStatus] = useState("active");
  const [isChecked, setIsChecked] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    uom: "",
    status: "active",
  });
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Confirm modal states
  const [message, setMesssage] = useState("");
  const [confirmState, setConfirmState] = useState(false);
  const [confirmType, setConfirmType] = useState("");
  const [partIdState, setPartIdState] = useState("");
  const [isConfirmModal, setIsConfirmModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(null);

  // Confirm useEffect for confirm modal
  useEffect(() => {
    let modal = null;

    if (isConfirmModal) {
      const modalElement = document.getElementById("partConfirmModal");

      if (modalElement) {
        // Clean up any existing modal artifacts
        cleanupModalArtifacts();

        // Create new modal
        modal = new Modal(modalElement, {
          backdrop: "static",
          keyboard: false,
        });

        // Add event listener for when modal is hidden
        modalElement.addEventListener("hidden.bs.modal", () => {
          cleanupModalArtifacts();
          setIsConfirmModal(false);
        });

        // Show the modal
        modal.show();

        // Store modal reference
        setConfirmModal(modal);
      }
    }

    // Cleanup function
    return () => {
      if (modal) {
        modal.dispose();
        cleanupModalArtifacts();
      }
    };
  }, [isConfirmModal]);

  // Global function to clean up modal artifacts
  const cleanupModalArtifacts = () => {
    console.log("Cleaning up modal artifacts");
    document.body.classList.remove("modal-open");
    document.body.style.paddingRight = "";
    document.body.style.overflow = "";
    const backdrops = document.getElementsByClassName("modal-backdrop");
    while (backdrops.length > 0) {
      backdrops[0].remove();
    }
  };

  const handleCloseConfirmModal = () => {
    if (confirmModal) {
      confirmModal.hide();
      cleanupModalArtifacts();
    }

    // Add a small delay before resetting states to allow animation to complete
    setTimeout(() => {
      setIsConfirmModal(false);
    }, 300);
  };

  const handleShowConfirm = (type) => {
    if (type === "single") {
      setMesssage("Are you sure you want to delete this part?");
      setIsConfirmModal(true);
    }
  };

  const handleYesConfirm = () => {
    if (confirmType === "single") handleDeletePart(partIdState);
  };

  useEffect(() => {
    fetchParts();
  }, []);

  const fetchParts = () => {
    setLoading(true);
    setError(null);
    api
      .get("/api/part/all")
      .then((response) => {
        console.log("Parts loaded:", response.data);
        setParts(response.data.data || []);
        setLoading(false);
      })
      .catch((error) => {
        toast.error("Error in fetching parts from database. Please try again.");
        console.error("Error loading parts:", error);
        setError("Failed to load parts. Please try again.");
        setLoading(false);
      });
  };

  const handlePartCheckboxChange = (partId) => {
    setSelectedParts((prevSelected) =>
      prevSelected.includes(partId)
        ? prevSelected.filter((id) => id !== partId)
        : [...prevSelected, partId]
    );
  };

  const handleSelectAllChange = (e) => {
    const checked = e.target.checked;
    setSelectAll(checked);
    if (checked) {
      const allPartIds = parts.map((part) => part.id);
      setSelectedParts(allPartIds);
    } else {
      setSelectedParts([]);
    }
  };

  const handleAddParts = (e) => {
    e.preventDefault();
    const newErrors = validateForm(formData);
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const finalData = {
        name: formData.name,
        code: formData.code,
        uom: formData.uom,
        status: formData.status,
      };

      console.log("Submitting add part form");
      api
        .post("/api/part/save", finalData)
        .then((response) => {
          console.log("Part added successfully:", response.data);
          toast.success("Part added successfully");
          setIsAddPart(false);
          // Reset form after successful submission
          handleReset(e);
          // Refresh parts list
          fetchParts();
        })
        .catch((error) => {
          toast.error("Failed to add part. Please try again");
          console.error("Error adding part:", error);
        });
    }
  };

  const validateForm = (data) => {
    const errors = {};

    if (!data.name.trim()) {
      errors.name = "Part name is required";
    }

    if (!data.code.trim()) {
      errors.code = "Code is required";
    } else if (!/^\d+$/.test(data.code)) {
      errors.code = "Code must only be in digits";
    }

    if (!data.uom.trim()) {
      errors.uom = "UOM is required";
    }

    return errors;
  };

  const handleEditPart = (e) => {
    e.preventDefault();
    console.log("Part has been edited");
  };

  const handleViewDetails = (part, e) => {
    e.preventDefault();
    console.log(part);
    setPartDetails(part);
    setIsShowPartDetails(true);
  };

  const handleEditDetails = (part, e) => {
    e.preventDefault();
    console.log(part);
    setPartDetails(part);
    setIsEditPartDetails(true);
  };

  useEffect(() => {
    if (isShowPartDetails && partModalRef.current) {
      const bsModal = new Modal(partModalRef.current, {
        backdrop: "static",
      });
      bsModal.show();

      // Optional: hide modal state when it's closed
      partModalRef.current.addEventListener("hidden.bs.modal", () =>
        setIsShowPartDetails(false)
      );
    } else if (isEditPartDetails && partEditModalRef.current) {
      const bsModal = new Modal(partEditModalRef.current, {
        backdrop: "static",
      });
      bsModal.show();

      // Hide modal state when it's closed
      partEditModalRef.current.addEventListener("hidden.bs.modal", () =>
        setIsEditPartDetails(false)
      );
    }
  }, [isShowPartDetails, isEditPartDetails]);

  const handleReset = (e) => {
    e.preventDefault();

    setFormData({
      name: "",
      code: "",
      uom: "",
      status: "active",
    });
    setIsChecked(true);
    setStatus("active");
  };

  const handleSetIsAddPart = () => {
    setIsAddPart(true);
  };

  const handleDeletePart = (partId) => {
    setLoading(true);
    api
      .delete(`/api/part/delete/${partId}`)
      .then((response) => {
        toast.success("Part deleted successfully");
        console.log("Part deleted successfully:", response.data);
        // Refresh parts list after deletion
        fetchParts();
        setIsConfirmModal(false);
      })
      .catch((error) => {
        toast.error("Failed to deleted the part. Please try again");
        console.error("Error deleting part:", error);
        setError("Failed to delete part. Please try again.");
        setLoading(false);
        setIsConfirmModal(false);
      });
  };

  // Update search input handler
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Update uom filter handler
  const handleUOMFilter = (e) => {
    setUOMFilter(e.target.value);
  };

  // Update status filter handler
  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setStatusFilter("");
    setUOMFilter("");
    setSearchTerm("");
  };

  // RBAC
  const ability = useContext(AbilityContext);

  return (
    <div>
      {/* Header section */}
      <nav className="navbar bg-light border-body" data-bs-theme="light">
        <div className="container-fluid">
          <div className="mt-4">
            <h3 className="nav-header header-style">Part Master</h3>
            <p className="breadcrumb">
              <Link to="/dashboard">
                <i className="fas fa-home text-8"></i>
              </Link>{" "}
              <span className="ms-1 mt-1 text-small-gray">
                / Masters / Part Master
              </span>
            </p>
          </div>

          {/* Add Part Button */}

          {ability.can("edit", "Part Master") && (
            <button
              className="btn btn-primary add-btn"
              onClick={handleSetIsAddPart}
            >
              <i className="fa-solid fa-plus pe-1"></i> Add New Part
            </button>
          )}
        </div>
      </nav>

      {/* Search and Filter Section */}
      <div className="search-filter-container mx-2">
        <div className="search-box">
          <i className="fas fa-search position-absolute z-0 input-icon"></i>
          <input
            type="text"
            className="form-control vendor-search-bar"
            placeholder="Search by types..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <div className="filter-options">
          <select
            className="filter-select"
            value={uomFilter}
            onChange={handleUOMFilter}
          >
            <option value="">All UOM</option>
            <option value="pcs">Pieces (PCS)</option>
            <option value="kg">Kilogram (KG)</option>
            <option value="gm">Gram (GM)</option>
            <option value="ltr">Litre (LTR)</option>
            <option value="mtr">Meter (MTR)</option>
            <option value="box">Box (BOX)</option>
          </select>
          <select
            className="filter-select"
            value={statusFilter}
            onChange={handleStatusFilter}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <button className="filter-select" onClick={handleResetFilters}>
            <i className="fas fa-filter me-2"></i>
            Reset Filters
          </button>
        </div>
      </div>

      {/* Form Header Section */}
      {isAddPart && (
        <div className="table-form-container mx-2">
          <div className="form-header">
            <h2>
              <i className="fas fa-cogs"></i> Add New Part
            </h2>
            <button
              className="btn-close"
              onClick={() => setIsAddPart(false)}
            ></button>
          </div>

          {/* Form Fields */}
          <form
            autoComplete="off"
            className="padding-2"
            onSubmit={handleAddParts}
          >
            <div className="form-grid border-bottom pt-0">
              <div className="row form-style">
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="name" className="form-label">
                    Name <span className="text-danger fs-6">*</span>
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-font position-absolute z-0 input-icon"></i>
                    <input
                      type="text"
                      className="form-control ps-5 text-font"
                      id="name"
                      placeholder="Enter part name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                  {errors.name && (
                    <span className="error-message">{errors.name}</span>
                  )}
                </div>
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="code" className="form-label">
                    Code <span className="text-danger fs-6">*</span>
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-qrcode position-absolute z-0 input-icon"></i>
                    <input
                      type="text"
                      className="form-control ps-5 text-font"
                      id="code"
                      placeholder="Enter part code"
                      inputMode="numeric"
                      maxLength="6"
                      value={formData.code}
                      onChange={(e) => {
                        const digitsOnly = e.target.value.replace(/\D/g, "");
                        if (digitsOnly.length <= 6) {
                          setFormData({ ...formData, code: e.target.value });
                        }
                      }}
                    />
                  </div>
                  {errors.code && (
                    <span className="error-message">{errors.code}</span>
                  )}
                </div>
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="uom" className="form-label">
                    UOM <span className="text-danger fs-6">*</span>
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-ruler position-absolute z-0 input-icon"></i>
                    <select
                      className={`form-select ps-5 text-font ${
                        formData.uom ? "" : "text-secondary"
                      }`}
                      id="uom"
                      value={formData.uom}
                      onChange={(e) =>
                        setFormData({ ...formData, uom: e.target.value })
                      }
                    >
                      <option value="" disabled hidden className="text-muted">
                        Select UOM
                      </option>
                      <option value="pcs">Pieces (PCS)</option>
                      <option value="kg">Kilogram (KG)</option>
                      <option value="gm">Gram (GM)</option>
                      <option value="ltr">Litre (LTR)</option>
                      <option value="mtr">Meter (MTR)</option>
                      <option value="box">Box (BOX)</option>
                    </select>
                  </div>
                  {errors.uom && (
                    <span className="error-message">{errors.uom}</span>
                  )}
                </div>
              </div>
              <div className="row form-style">
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="status" className="form-label">
                    Status
                  </label>
                  <div className="position-relative w-100">
                    <div className="form-check form-switch position-absolute z-0 input-icon mt-1 padding-left-2">
                      <input
                        className="form-check-input text-font switch-style"
                        type="checkbox"
                        role="switch"
                        id="switchCheckChecked"
                        checked={isChecked}
                        onChange={(e) => {
                          const newStatus = e.target.checked
                            ? "active"
                            : "inactive";
                          setIsChecked(e.target.checked);
                          setStatus(newStatus);
                          setFormData({
                            ...formData,
                            status: newStatus,
                          });
                        }}
                      />

                      <label
                        className="form-check-label"
                        htmlFor="switchCheckChecked"
                      ></label>
                    </div>
                    <select
                      className="form-control text-font switch-padding"
                      id="status"
                      value={status}
                      onChange={(e) => {
                        const newStatus = e.target.value;
                        setStatus(newStatus);
                        setIsChecked(newStatus === "active");

                        setFormData((prev) => ({
                          ...prev,
                          status: newStatus,
                        }));
                      }}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                    <i className="fa-solid fa-angle-down position-absolute down-arrow-icon"></i>
                  </div>
                </div>
              </div>
            </div>
            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary border border-0 text-8 px-3 fw-medium py-2 me-3 float-end"
              >
                <i className="fa-solid fa-floppy-disk me-1"></i> Save Changes
              </button>
              <button
                type="button"
                className="btn btn-secondary border border-0 text-8 px-3 fw-medium py-2 bg-secondary me-3 float-end"
                onClick={handleReset}
              >
                <i className="fa-solid fa-arrows-rotate me-1"></i> Reset
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table Section */}
      <div className="margin-2 mx-2">
        <div className="table-container">
          <div className="table-header">
            <div className="selected-count">
              <input
                type="checkbox"
                id="select-all"
                checked={selectAll}
                onChange={handleSelectAllChange}
              />
              <label htmlFor="select-all">
                {selectedParts.length} Selected
              </label>
            </div>
            <div className="bulk-actions">
              <button className="btn-action btn-danger">
                <i className="fas fa-trash"></i>
                Delete Selected
              </button>
            </div>
          </div>
          {loading ? (
            <div className="text-center p-3">
              <i className="fas fa-spinner fa-spin me-2"></i> Loading parts...
            </div>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th className="checkbox-cell ps-4">
                    <input type="checkbox" id="select-all-header" disabled />
                  </th>
                  <th>Code</th>
                  <th>Name</th>
                  <th>UOM</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="text-break">
                {parts.length === 0 ? (
                  <tr className="no-data-row">
                    <td colSpan="6" className="no-data-cell">
                      <div className="no-data-content">
                        <i className="fas fa-cogs no-data-icon"></i>
                        <p className="no-data-text">No parts found</p>
                        <p className="no-data-subtext">
                          Click the "Add New Part" button to create your first
                          part
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  parts.map((part) => (
                    <tr key={part.id}>
                      <td className="checkbox-cell ps-4">
                        <input
                          type="checkbox"
                          checked={selectedParts.includes(part.id)}
                          onChange={() => handlePartCheckboxChange(part.id)}
                        />
                      </td>
                      <td className="ps-4">
                        <div>
                          <span>{part.code}</span>
                        </div>
                      </td>
                      <td className="ps-4">
                        <div>
                          <span>{part.name}</span>
                        </div>
                      </td>
                      <td className="ps-4">
                        <div>
                          <span>{part.uom}</span>
                        </div>
                      </td>
                      <td className="ps-3">
                        <div>
                          <span className={`status-badge ${part.status}`}>
                            {part.status === "active" ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </td>
                      <td className="actions ps-3">
                        <button
                          className="btn-icon btn-primary"
                          title="View Details"
                          onClick={(e) => handleViewDetails(part, e)}
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        {ability.can("edit", "Part Master") && (
                          <button
                            className="btn-icon btn-success"
                            title="Edit"
                            onClick={(e) => handleEditDetails(part, e)}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                        )}
                        {ability.can("edit", "Part Master") && (
                          <button
                            className="btn-icon btn-danger"
                            title="Delete"
                            onClick={() => {
                              setPartIdState(part.id);
                              setConfirmType("single");
                              handleShowConfirm("single");
                            }}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          <div className="pagination-container">
            <div className="pagination-info">
              {parts.length > 0
                ? `Showing 1-${parts.length} of ${parts.length} entries`
                : "No entries"}
            </div>
            <div className="pagination">
              <button className="btn-page" disabled>
                <i className="fas fa-chevron-left"></i>
              </button>
              <button className="btn-page active">1</button>
              <button className="btn-page" disabled>
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
            <div className="items-per-page">
              <select>
                <option value="10">10 per page</option>
                <option value="25">25 per page</option>
                <option value="50">50 per page</option>
                <option value="100">100 per page</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation dialog modal */}
      {isConfirmModal && (
        <div className="modal fade" id="partConfirmModal" tabIndex="-1">
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
              <div className="modal-body">{message}</div>
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

      {/* View Part Details Modal */}
      {isShowPartDetails && (
        <div
          className="modal fade"
          ref={partModalRef}
          id="partDetailModal"
          tabIndex="-1"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-circle-info me-2"></i>
                  View Part Details
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <div className="user-details-grid">
                  <div className="detail-item">
                    <strong>TRNO:</strong>
                    <span>{partDetails.trno}</span>
                  </div>

                  <div className="detail-item">
                    <strong>Name:</strong>
                    <span>{partDetails.name}</span>
                  </div>
                  <div className="detail-item">
                    <strong>UOM:</strong>
                    <span>{partDetails.uom}</span>
                  </div>

                  <div className="detail-item">
                    <strong>Status:</strong>
                    <span
                      className={`badge status ${partDetails.status?.toLowerCase()} w-50`}
                    >
                      {partDetails.status?.charAt(0).toUpperCase() +
                        partDetails.status?.slice(1)}
                    </span>
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

      {/* Edit Part Details Modal */}
      {isEditPartDetails && (
        <div
          className="modal fade"
          ref={partEditModalRef}
          id="partEditModal"
          tabIndex="-1"
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {" "}
                  <i className="fas fa-pencil me-2 font-1"></i>Edit Part
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              {/* Modal Body */}
              <div className="modal-body">
                <form
                  autoComplete="off"
                  className="padding-2"
                  onSubmit={handleAddParts}
                >
                  <div className="form-grid pt-0">
                    <div className="row form-style">
                      <div className="col-4 d-flex flex-column form-group">
                        <label htmlFor="name" className="form-label">
                          Name <span className="text-danger fs-6">*</span>
                        </label>
                        <div className="position-relative w-100">
                          <i className="fas fa-font position-absolute z-0 input-icon"></i>
                          <input
                            type="text"
                            className="form-control ps-5 text-font"
                            id="name"
                            placeholder="Enter part name"
                            value={partDetails.name}
                            onChange={(e) =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                          />
                        </div>
                      </div>
                      <div className="col-4 d-flex flex-column form-group">
                        <label htmlFor="code" className="form-label">
                          Code <span className="text-danger fs-6">*</span>
                        </label>
                        <div className="position-relative w-100">
                          <i className="fas fa-qrcode position-absolute z-0 input-icon"></i>
                          <input
                            type="text"
                            className="form-control ps-5 text-font"
                            id="code"
                            placeholder="Enter part code"
                            value={partDetails.code}
                            onChange={(e) =>
                              setFormData({ ...formData, code: e.target.value })
                            }
                          />
                        </div>
                      </div>
                      <div className="col-4 d-flex flex-column form-group">
                        <label htmlFor="uom" className="form-label">
                          UOM <span className="text-danger fs-6">*</span>
                        </label>
                        <div className="position-relative w-100">
                          <i className="fas fa-ruler position-absolute z-0 input-icon"></i>
                          <select
                            className={`form-select ps-5 text-font ${
                              partDetails.uom ? "" : "text-secondary"
                            }`}
                            id="uom"
                            value={partDetails.uom}
                            onChange={(e) =>
                              setFormData({ ...formData, uom: e.target.value })
                            }
                          >
                            <option
                              value=""
                              disabled
                              hidden
                              className="text-muted"
                            >
                              Select UOM
                            </option>
                            <option value="pcs">Pieces (PCS)</option>
                            <option value="kg">Kilogram (KG)</option>
                            <option value="gm">Gram (GM)</option>
                            <option value="ltr">Litre (LTR)</option>
                            <option value="mtr">Meter (MTR)</option>
                            <option value="box">Box (BOX)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="row form-style">
                      <div className="col-4 d-flex flex-column form-group">
                        <label htmlFor="status" className="form-label">
                          Status
                        </label>
                        <div className="position-relative w-100">
                          <div className="form-check form-switch position-absolute z-0 input-icon mt-1 padding-left-2">
                            <input
                              className="form-check-input text-font switch-style"
                              type="checkbox"
                              role="switch"
                              id="switchCheckChecked"
                              checked={
                                partDetails.status == "active" ? true : false
                              }
                              onChange={(e) => {
                                const newStatus = e.target.checked
                                  ? "active"
                                  : "inactive";
                                setIsChecked(e.target.checked);
                                setStatus(newStatus);
                                setFormData({
                                  ...formData,
                                  status: newStatus,
                                });
                              }}
                            />

                            <label
                              className="form-check-label"
                              htmlFor="switchCheckChecked"
                            ></label>
                          </div>
                          <select
                            className="form-control text-font switch-padding"
                            id="status"
                            value={partDetails.status}
                            onChange={(e) => {
                              const newStatus = e.target.value;
                              setStatus(newStatus);
                              setIsChecked(newStatus === "active");

                              setFormData((prev) => ({
                                ...prev,
                                status: newStatus,
                              }));
                            }}
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </select>
                          <i className="fa-solid fa-angle-down position-absolute down-arrow-icon"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-primary add-btn"
                  data-bs-dismiss="modal"
                  onClick={(e) => {
                    document.activeElement?.blur();
                    handleEditPart(e);
                  }}
                >
                  <i className="fa-solid fa-floppy-disk me-1"></i> Save Changes
                </button>
                <button
                  className="btn btn-secondary add-btn"
                  data-bs-dismiss="modal"
                  onClick={() => {
                    document.activeElement?.blur();
                  }}
                >
                  <i className="fa-solid fa-xmark me-1"></i> Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartMaster;
