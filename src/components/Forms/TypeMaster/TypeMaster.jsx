import React, { useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "../../../context/AppContext";
import api from "../../../services/api";
import { Link } from "react-router-dom";
import { Modal } from "bootstrap";
import { toast } from "react-toastify";

const TypeMaster = () => {
  const [errors, setErrors] = useState({});
  const { isAddType, setIsAddType } = useContext(AppContext);
  const typeModalRef = useRef(null);
  const typeEditModalRef = useRef(null);
  const [isShowTypeDetails, setIsShowTypeDetails] = useState(false);
  const [isEditTypeDetails, setIsEditTypeDetails] = useState(false);
  const [typeDetails, setTypeDetails] = useState({
    id: "",
    trno: "",
    name: "",
    status: "",
  });
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [status, setStatus] = useState("active");
  const [isChecked, setIsChecked] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    status: "active",
  });
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Confirm modal states
  const [message, setMesssage] = useState("");
  const [confirmState, setConfirmState] = useState(false);
  const [confirmType, setConfirmType] = useState("");
  const [typeIdState, setTypeIdState] = useState("");
  const [isConfirmModal, setIsConfirmModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(null);

  // Confirm useEffect for confirm modal
  useEffect(() => {
    let modal = null;

    if (isConfirmModal) {
      const modalElement = document.getElementById("typeConfirmModal");

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
      setMesssage("Are you sure you want to delete this type?");
      setIsConfirmModal(true);
    } else {
      if (selectedTypes.length === 0) {
        toast.error("Please select at least one type to delete");
        return;
      }
      setMesssage(
        `Are you sure you want to delete ${selectedTypes.length} selected types?`
      );
      setIsConfirmModal(true);
    }
  };

  const handleYesConfirm = () => {
    if (confirmType === "single") handleDeleteType(typeIdState);
    else handleDeleteMultiple();
  };

  // Fetch types from API
  const fetchTypes = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/type/all");
      setTypes(response.data.data);
    } catch (error) {
      toast.error("Error in fetching types");
      console.error("Error fetching types:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchTypes();
  }, []);

  const handleTypeCheckboxChange = (typeId) => {
    setSelectedTypes((prevSelected) =>
      prevSelected.includes(typeId)
        ? prevSelected.filter((id) => id !== typeId)
        : [...prevSelected, typeId]
    );
  };

  const handleSelectAllChange = (e) => {
    const checked = e.target.checked;
    setSelectAll(checked);
    if (checked) {
      const allTypeIds = types.map((type) => type.id);
      setSelectedTypes(allTypeIds);
    } else {
      setSelectedTypes([]);
    }
  };

  const validateForm = (data) => {
    const errors = {};

    if (!data.name.trim()) {
      errors.name = "Type name is required";
    }

    return errors;
  };

  const handleAddTypes = async (e) => {
    e.preventDefault();
    const newErrors = validateForm(formData);
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const finalData = {
        name: formData.name,
        status: formData.status,
      };

      try {
        console.log("Submitting type data:", finalData);
        const response = await api.post("/api/type/save", finalData);
        console.log("Type added successfully:", response.data);
        toast.success("Type added successfully");
        setIsAddType(false);
        // Reset form after successful submission
        handleReset(e);
        // Refresh the types list
        fetchTypes();
      } catch (error) {
        let errorMessage = "Failed to add type. Please try again.";

        if (error.response) {
          if (error.response.data.message) {
            // For structured error from backend (with message field)
            errorMessage = error.response.data.message;
          } else if (typeof error.response.data === "string") {
            // For plain string error from backend
            errorMessage = error.response.data;
          }
        } else {
          errorMessage = error.message;
        }

        console.error("Error adding type:", errorMessage);
        toast.error(errorMessage);
      }
    }
  };

  const handleEditType = async (e) => {
    e.preventDefault();

    // Validate the form data
    const newErrors = validateForm({
      name: typeDetails.name,
      status: typeDetails.status,
    });
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        const updateData = {
          name: typeDetails.name,
          status: typeDetails.status,
        };

        const response = await api.put(
          `/api/type/update/${typeDetails.id}`,
          updateData
        );
        console.log("Type updated successfully:", response.data);
        toast.success("Type updated successfully");
        // Close the modal
        setIsEditTypeDetails(false);

        // Refresh the types list
        fetchTypes();
      } catch (error) {
        let errorMessage = "Failed to update type. Please try again.";

        if (error.response) {
          if (error.response.data.message) {
            errorMessage = error.response.data.message;
          } else if (typeof error.response.data === "string") {
            errorMessage = error.response.data;
          }
        } else {
          errorMessage = error.message;
        }

        console.error("Error updating type:", errorMessage);
        toast.error(errorMessage);
      }
    }
  };

  const handleViewDetails = async (type, e) => {
    e.preventDefault();
    try {
      const response = await api.get(`/api/type/${type.id}`);
      setTypeDetails(response.data.data);
      setIsShowTypeDetails(true);
    } catch (error) {
      console.error("Error fetching type details:", error);
      toast.error("Failed to fetch type details. Please try again.");
    }
  };

  const handleEditDetails = async (type, e) => {
    e.preventDefault();
    try {
      const response = await api.get(`/api/type/${type.id}`);
      setTypeDetails(response.data.data);
      setIsEditTypeDetails(true);
    } catch (error) {
      console.error("Error fetching type details:", error);
      toast.error("Failed to fetch type details. Please try again.");
    }
  };

  useEffect(() => {
    if (isShowTypeDetails && typeModalRef.current) {
      const bsModal = new Modal(typeModalRef.current, {
        backdrop: "static",
      });
      bsModal.show();

      // Optional: hide modal state when it's closed
      typeModalRef.current.addEventListener("hidden.bs.modal", () =>
        setIsShowTypeDetails(false)
      );
    } else if (isEditTypeDetails && typeEditModalRef.current) {
      const bsModal = new Modal(typeEditModalRef.current, {
        backdrop: "static",
      });
      bsModal.show();

      // Hide modal state when it's closed
      typeEditModalRef.current.addEventListener("hidden.bs.modal", () =>
        setIsEditTypeDetails(false)
      );
    }
  }, [isShowTypeDetails, isEditTypeDetails]);

  const handleReset = (e) => {
    e.preventDefault();
    setFormData({
      name: "",
      status: "active",
    });
    setIsChecked(true);
    setStatus("active");
  };

  const handleSetIsAddType = () => {
    setIsAddType(true);
  };

  // Handle single delete
  const handleDeleteType = async (id) => {
    try {
      setIsDeleting(true);
      await api.delete(`/api/type/delete/${id}`);
      toast.success("Type deleted successfully");
      // Refresh the types list
      fetchTypes();
      setIsConfirmModal(false);
    } catch (error) {
      console.error("Error deleting type:", error);
      toast.error("Error in deleting the type");
      setIsConfirmModal(false);
    } finally {
      setIsConfirmModal(false);
      setIsDeleting(false);
    }
  };

  // Handle multiple delete
  const handleDeleteMultiple = async () => {
    try {
      setIsDeleting(true);
      console.log("Deleting types with IDs:", selectedTypes);
      await api.post("/api/type/delete-multiple", selectedTypes);
      // Reset selection
      setSelectedTypes([]);
      setSelectAll(false);
      toast.success("Selected types deleted successfully");
      // Refresh the types list
      fetchTypes();
      setIsConfirmModal(false);
    } catch (error) {
      console.error(
        "Error deleting multiple types:",
        error.response ? error.response.data : error.message
      );
      toast.error("Failed to delete selected types. Please try again.");
      setIsConfirmModal(false);
    } finally {
      setIsConfirmModal(false);
      setIsDeleting(false);
    }
  };

  // Filter types based on search term and status filter
  const filteredTypes = types.filter((type) => {
    // Search term filter
    const searchFields = [
      type.trno?.toLowerCase() || "",
      type.name?.toLowerCase() || "",
      type.status?.toLowerCase() || "",
    ];

    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch =
      searchTerm === "" ||
      searchFields.some((field) => field.includes(searchTermLower));

    // Status filter
    const matchesStatus =
      !statusFilter ||
      type.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Sort types by trno
  const sortedFilteredTypes = [...filteredTypes].sort((a, b) => {
    return (a.trno || "").localeCompare(b.trno || "");
  });

  // Update search input handler
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    // Reset to first page when searching
    // If you have pagination, you might want to reset the current page here
  };

  // Update status filter handler
  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
    // Reset to first page when filtering
    // If you have pagination, you might want to reset the current page here
  };

  // Reset all filters
  const handleResetFilters = () => {
    setStatusFilter("");
    setSearchTerm("");
  };

  return (
    <div>
      {/* Header section */}
      <nav className="navbar bg-light border-body" data-bs-theme="light">
        <div className="container-fluid">
          <div className="mt-4">
            <h3 className="nav-header header-style">Type Master</h3>
            <p className="breadcrumb">
              <Link to="/dashboard">
                <i className="fas fa-home text-8"></i>
              </Link>{" "}
              <span className="ms-1 mt-1 text-small-gray">
                / Masters / Type Master
              </span>
            </p>
          </div>

          {/* Add Type Button */}

          <button
            className="btn btn-primary add-btn"
            onClick={handleSetIsAddType}
          >
            <i className="fa-solid fa-plus pe-1"></i> Add New Type
          </button>
        </div>
      </nav>

      {/* Search and Filter Section */}
      <div className="search-filter-container mx-2">
        <div className="search-box">
          <i className="fas fa-search position-absolute z-0 input-icon"></i>
          <input
            type="text"
            className="form-control vendor-search-bar"
            placeholder="Search by TRNO, name or status..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <div className="filter-options">
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
      {isAddType && (
        <div className="table-form-container mx-2">
          <div className="form-header">
            <h2>
              <i className="fas fa-tags"></i> Add New Type
            </h2>
            <button
              className="btn-close"
              onClick={() => setIsAddType(false)}
            ></button>
          </div>
          {/* Form Fields */}
          <form
            autoComplete="off"
            className="padding-2"
            onSubmit={handleAddTypes}
          >
            <div className="form-grid border-bottom pt-0">
              <div className="row form-style">
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="trNo" className="form-label">
                    TRNO
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-hashtag position-absolute z-0 input-icon"></i>
                    <input
                      type="text"
                      className="form-control ps-5 text-font input-centered"
                      id="trNo"
                      placeholder="********************"
                      disabled
                    />
                  </div>
                </div>
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
                      placeholder="Enter type name"
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
              <button type="submit" className="btn btn-primary add-btn">
                <i className="fa-solid fa-floppy-disk me-1"></i> Save Changes
              </button>
              <button
                className="btn btn-secondary add-btn"
                type="button"
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
                {selectedTypes.length} Selected
              </label>
            </div>
            <button
              className="btn-action btn-danger"
              onClick={() => {
                setConfirmType("multi");
                handleShowConfirm("multi");
              }}
              disabled={selectedTypes.length === 0 || isDeleting}
            >
              {isDeleting ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Deleting...
                </>
              ) : (
                <>
                  <i className="fas fa-trash"></i> Delete Selected
                </>
              )}
            </button>
          </div>
          <table>
            <thead>
              <tr>
                <th className="checkbox-cell">
                  <input type="checkbox" disabled />
                </th>
                <th>TRNO</th>
                <th>Name</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="text-break">
              {loading ? (
                <tr className="no-data-row">
                  <td colSpan="5" className="no-data-cell">
                    <div className="no-data-content">
                      <i className="fas fa-spinner fa-spin"></i>
                      <p className="no-data-text">Loading types...</p>
                    </div>
                  </td>
                </tr>
              ) : sortedFilteredTypes.length === 0 ? (
                <tr className="no-data-row">
                  <td colSpan="5" className="no-data-cell">
                    <div className="no-data-content">
                      <i className="fas fa-tags no-data-icon"></i>
                      <p className="no-data-text">No types found</p>
                      {searchTerm || statusFilter ? (
                        <p className="no-data-subtext">
                          Try adjusting your search or filter criteria
                        </p>
                      ) : (
                        <p className="no-data-subtext">
                          Click the "Add New Type" button to create your first
                          type
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                sortedFilteredTypes.map((type) => (
                  <tr key={type.id}>
                    <td className="checkbox-cell ps-4">
                      <input
                        type="checkbox"
                        checked={selectedTypes.includes(type.id)}
                        onChange={() => handleTypeCheckboxChange(type.id)}
                      />
                    </td>
                    <td className="ps-4">
                      <div>
                        <span>{type.trno}</span>
                      </div>
                    </td>
                    <td className="ps-4">
                      <div>
                        <span>{type.name}</span>
                      </div>
                    </td>
                    <td className="ps-4">
                      <span
                        className={`badge status ${type.status.toLowerCase()}`}
                      >
                        {type.status}
                      </span>
                    </td>
                    <td className="actions">
                      <button
                        className="btn-icon btn-primary"
                        title="View Details"
                        onClick={(e) => handleViewDetails(type, e)}
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      <button
                        className="btn-icon btn-success"
                        title="Edit"
                        onClick={(e) => handleEditDetails(type, e)}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        className="btn-icon btn-danger"
                        title="Delete"
                        disabled={isDeleting}
                        onClick={() => {
                          setTypeIdState(type.id);
                          setConfirmType("single");
                          handleShowConfirm("single");
                        }}
                      >
                        {isDeleting ? (
                          <i className="fas fa-spinner fa-spin"></i>
                        ) : (
                          <i className="fas fa-trash"></i>
                        )}
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
              Showing 1-{sortedFilteredTypes.length} of {types.length} entries
              {(searchTerm || statusFilter) && (
                <span className="ms-2">
                  (filtered from {types.length} total entries)
                </span>
              )}
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
        <div className="modal fade" id="typeConfirmModal" tabIndex="-1">
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

      {/* View Type Details Modal */}
      {isShowTypeDetails && (
        <div
          className="modal fade"
          ref={typeModalRef}
          id="typeDetailModal"
          tabIndex="-1"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-circle-info me-2"></i>
                  View Type Details
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
                    <span>{typeDetails.trno}</span>
                  </div>

                  <div className="detail-item">
                    <strong>Name:</strong>
                    <span>{typeDetails.name}</span>
                  </div>

                  <div className="detail-item">
                    <strong>Status:</strong>
                    <span
                      className={`badge status ${typeDetails.status?.toLowerCase()} w-50`}
                    >
                      {typeDetails.status?.charAt(0).toUpperCase() +
                        typeDetails.status?.slice(1)}
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

      {/* Edit Type Details Modal */}
      {isEditTypeDetails && (
        <div
          className="modal fade"
          ref={typeEditModalRef}
          id="typeEditModal"
          tabIndex="-1"
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-pencil me-2 font-1"></i>Edit Type
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
                  onSubmit={handleEditType}
                >
                  <div className="form-grid pt-0">
                    <div className="row form-style">
                      <div className="col-4 d-flex flex-column form-group">
                        <label htmlFor="trNo" className="form-label">
                          TRNO
                        </label>
                        <div className="position-relative w-100">
                          <i className="fas fa-hashtag position-absolute z-0 input-icon"></i>
                          <input
                            type="text"
                            className="form-control ps-5 text-font input-centered"
                            id="trNo"
                            value={typeDetails.trno}
                            disabled
                          />
                        </div>
                      </div>
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
                            placeholder="Enter type name"
                            value={typeDetails.name}
                            onChange={(e) =>
                              setTypeDetails({
                                ...typeDetails,
                                name: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
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
                              checked={typeDetails.status === "active"}
                              onChange={(e) => {
                                const newStatus = e.target.checked
                                  ? "active"
                                  : "inactive";
                                setTypeDetails({
                                  ...typeDetails,
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
                            value={typeDetails.status}
                            onChange={(e) => {
                              const newStatus = e.target.value;
                              setTypeDetails({
                                ...typeDetails,
                                status: newStatus,
                              });
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
                    handleEditType(e);
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

export default TypeMaster;
