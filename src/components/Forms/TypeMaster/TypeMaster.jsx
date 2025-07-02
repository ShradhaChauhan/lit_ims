import React, { useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "../../../context/AppContext";
import api from "../../../services/api";
import { Link } from "react-router-dom";
import { Modal } from "bootstrap";

const TypeMaster = () => {
  const [errors, setErrors] = useState({});
  const { isAddType, setIsAddType } = useContext(AppContext);
  const typeModalRef = useRef(null);
  const typeEditModalRef = useRef(null);
  const [isShowTypeDetails, setIsShowTypeDetails] = useState(false);
  const [isEditTypeDetails, setIsEditTypeDetails] = useState(false);
  const [typeDetails, setTypeDetails] = useState({
    id: "",
    trNo: "",
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

  // Fetch types from API
  const fetchTypes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/type/all');
      setTypes(response.data.data);
    } catch (error) {
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
        const response = await api.post('/api/type/save', finalData);
        console.log("Type added successfully:", response.data);
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
          } else if (typeof error.response.data === 'string') {
            // For plain string error from backend
            errorMessage = error.response.data;
          }
        } else {
          errorMessage = error.message;
        }

        console.error("Error adding type:", errorMessage);
        alert(errorMessage);
      }
    }
  };

  const handleEditType = (e) => {
    e.preventDefault();
    console.log("Type has been edited");
  };

  const handleViewDetails = (type, e) => {
    e.preventDefault();
    console.log(type);
    setTypeDetails(type);
    setIsShowTypeDetails(true);
  };

  const handleEditDetails = (type, e) => {
    e.preventDefault();
    console.log(type);
    setTypeDetails(type);
    setIsEditTypeDetails(true);
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
    if (window.confirm("Are you sure you want to delete this type?")) {
      try {
        setIsDeleting(true);
        await api.delete(`/api/type/delete/${id}`);
        // Refresh the types list
        fetchTypes();
      } catch (error) {
        console.error("Error deleting type:", error);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Handle multiple delete
  const handleDeleteMultiple = async () => {
    if (selectedTypes.length === 0) {
      alert("Please select at least one type to delete");
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedTypes.length} selected types?`)) {
      try {
        setIsDeleting(true);
        console.log("Deleting types with IDs:", selectedTypes);
        await api.post('/api/type/delete-multiple', selectedTypes);
        // Reset selection
        setSelectedTypes([]);
        setSelectAll(false);
        // Refresh the types list
        fetchTypes();
      } catch (error) {
        console.error("Error deleting multiple types:", error.response ? error.response.data : error.message);
        alert("Failed to delete selected types. Please try again.");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Filter types based on search term and status filter
  const filteredTypes = types.filter(type => {
    const matchesSearch = searchTerm === "" || 
      type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      type.trno.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "" || 
      type.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

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
          <i className="fas fa-search position-absolute input-icon"></i>
          <input
            type="text"
            className="form-control vendor-search-bar"
            placeholder="Search by types..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-options">
          <select 
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
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
                    <i className="fas fa-hashtag position-absolute input-icon"></i>
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
                    Name
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-font position-absolute input-icon"></i>
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
                    <div className="form-check form-switch position-absolute input-icon mt-1 padding-left-2">
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
                className="btn btn-secondary border border-0 text-8 px-3 fw-medium py-2 bg-secondary me-3 float-end"
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
              onClick={handleDeleteMultiple}
              disabled={selectedTypes.length === 0 || isDeleting}
            >
              {isDeleting ? (
                <><i className="fas fa-spinner fa-spin"></i> Deleting...</>
              ) : (
                <><i className="fas fa-trash"></i> Delete Selected</>
              )}
            </button>
          </div>
          <table>
            <thead>
              <tr>
                <th className="checkbox-cell">
                  <input 
                    type="checkbox" 
                    checked={selectAll}
                    onChange={handleSelectAllChange}
                  />
                </th>
                <th>
                  TRNO <i className="fas fa-sort color-gray ms-2"></i>
                </th>
                <th>
                  Name <i className="fas fa-sort color-gray ms-2"></i>
                </th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr className="no-data-row">
                  <td colSpan="5" className="no-data-cell">
                    <div className="no-data-content">
                      <i className="fas fa-spinner fa-spin"></i>
                      <p className="no-data-text">Loading types...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredTypes.length === 0 ? (
                <tr className="no-data-row">
                  <td colSpan="5" className="no-data-cell">
                    <div className="no-data-content">
                      <i className="fas fa-tags no-data-icon"></i>
                      <p className="no-data-text">No types found</p>
                      <p className="no-data-subtext">
                        Click the "Add New Type" button to create your first
                        type
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTypes.map((type) => (
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
                        onClick={() => handleDeleteType(type.id)}
                        disabled={isDeleting}
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
              Showing 1-{filteredTypes.length} of {types.length} entries
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
                  View {typeDetails.name}'s Details
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  <strong>TRNO:</strong> {typeDetails.trNo}
                </p>
                <p>
                  <strong>Name:</strong> {typeDetails.name}
                </p>
                <p>
                  <strong>Status:</strong> {typeDetails.status}
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-bs-dismiss="modal"
                  onClick={() => {
                    document.activeElement?.blur();
                  }}
                >
                  Close
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
                <h5 className="modal-title">Edit Type</h5>
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
                          <i className="fas fa-hashtag position-absolute input-icon"></i>
                          <input
                            type="text"
                            className="form-control ps-5 text-font input-centered"
                            id="trNo"
                            value={typeDetails.trNo}
                            disabled
                          />
                        </div>
                      </div>
                      <div className="col-4 d-flex flex-column form-group">
                        <label htmlFor="name" className="form-label">
                          Name
                        </label>
                        <div className="position-relative w-100">
                          <i className="fas fa-font position-absolute input-icon"></i>
                          <input
                            type="text"
                            className="form-control ps-5 text-font"
                            id="name"
                            placeholder="Enter type name"
                            value={typeDetails.name}
                            onChange={(e) =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                          />
                        </div>
                      </div>
                      <div className="col-4 d-flex flex-column form-group">
                        <label htmlFor="status" className="form-label">
                          Status
                        </label>
                        <div className="position-relative w-100">
                          <div className="form-check form-switch position-absolute input-icon mt-1 padding-left-2">
                            <input
                              className="form-check-input text-font switch-style"
                              type="checkbox"
                              role="switch"
                              id="switchCheckChecked"
                              checked={
                                typeDetails.status == "active" ? true : false
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
                            value={typeDetails.status}
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
                  className="btn btn-primary border border-0 text-8 px-3 fw-medium py-2 me-3 float-end"
                  data-bs-dismiss="modal"
                  onClick={(e) => {
                    document.activeElement?.blur();
                    handleEditType(e);
                  }}
                >
                  <i className="fa-solid fa-floppy-disk me-1"></i> Save Changes
                </button>
                <button
                  className="btn btn-secondary border border-0 bg-secondary text-8 px-3 fw-medium py-2 me-3 float-end"
                  data-bs-dismiss="modal"
                  onClick={() => {
                    document.activeElement?.blur();
                  }}
                >
                  <i className="fa-solid fa-x-mark me-1"></i> Close
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
