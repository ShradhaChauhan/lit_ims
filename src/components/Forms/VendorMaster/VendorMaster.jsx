import React, { useContext, useState, useRef, useEffect } from "react";
import { Modal } from "bootstrap";
import "./VendorMaster.css";
import { AppContext } from "../../../context/AppContext";
import { Link } from "react-router-dom";
import api from "../../../services/api";

const VendorMaster = () => {
  const [errors, setErrors] = useState({});
  const partnerModalRef = useRef(null);
  const partnerEditModalRef = useRef(null);
  const { isAddVendor, setIsAddVendor } = useContext(AppContext);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isShowPartnerDetails, setIsShowPartnerDetails] = useState(false);
  const [isEditPartnerDetails, setIsEditPartnerDetails] = useState(false);
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [status, setStatus] = useState("active");
  const [isChecked, setIsChecked] = useState(true);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const [formData, setFormData] = useState({
    type: "",
    name: "",
    mobile: "",
    email: "",
    city: "",
    state: "",
    pincode: "",
    address: "",
    status: "active",
  });

  const [viewModal, setViewModal] = useState(null);
  const [editModal, setEditModal] = useState(null);

  // Add new state for search and filters
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [filteredVendors, setFilteredVendors] = useState([]);

  // Initialize filteredVendors with vendors on mount and when vendors change
  useEffect(() => {
    setFilteredVendors(vendors);
  }, [vendors]);

  // Initialize modals
  useEffect(() => {
    if (isShowPartnerDetails && partnerModalRef.current && !viewModal) {
      const modal = new Modal(partnerModalRef.current);
      setViewModal(modal);
      modal.show();
    }
  }, [isShowPartnerDetails, viewModal]);

  useEffect(() => {
    if (isEditPartnerDetails && partnerEditModalRef.current && !editModal) {
      const modal = new Modal(partnerEditModalRef.current);
      setEditModal(modal);
      modal.show();
    }
  }, [isEditPartnerDetails, editModal]);

  // Fetch vendor/customer data from the API
  const fetchVendors = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/vendor-customer/all");

      // Handle new API response format
      if (
        response.data &&
        response.data.status === true &&
        response.data.data
      ) {
        setVendors(response.data.data);
        setTotalItems(response.data.data.length);
      }
      // Handle old API response format for backward compatibility
      else if (response.data && response.data.businessPartner) {
        setVendors(response.data.businessPartner);
        setTotalItems(response.data.businessPartner.length);
      }
    } catch (error) {
      console.error("Error fetching vendor/customer data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  // Function to handle Add Vendor button click
  const handleSetIsAddVendor = () => {
    setIsAddVendor(true);
  };

  // Add useEffect for filtering
  useEffect(() => {
    filterVendors();
  }, [vendors, searchQuery, typeFilter, statusFilter]);

  // Function to filter vendors
  const filterVendors = () => {
    let filtered = [...vendors];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (vendor) =>
          vendor.name?.toLowerCase().includes(query) ||
          vendor.email?.toLowerCase().includes(query) ||
          vendor.city?.toLowerCase().includes(query) ||
          vendor.mobile?.toLowerCase().includes(query)
      );
    }

    // Apply type filter
    if (typeFilter) {
      filtered = filtered.filter(
        (vendor) => vendor.type.toLowerCase() === typeFilter.toLowerCase()
      );
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(
        (vendor) => vendor.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    setFilteredVendors(filtered);
    setTotalItems(filtered.length);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle type filter change
  const handleTypeFilterChange = (e) => {
    setTypeFilter(e.target.value);
  };

  // Handle status filter change
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setTypeFilter("");
    setStatusFilter("");
  };

  // Calculate pagination values
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredVendors.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredVendors.length / itemsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Previous page
  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Next page
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Handle items per page change
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value, 10));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Form validation function
  const validateForm = (data) => {
    const errors = {};

    if (!data.type) errors.type = "Type is required";
    if (!data.name) errors.name = "Name is required";
    if (!data.mobile) errors.mobile = "Mobile number is required";
    else if (!/^\d{10}$/.test(data.mobile))
      errors.mobile = "Mobile number must be 10 digits";
    if (data.email && !/\S+@\S+\.\S+/.test(data.email))
      errors.email = "Email is not valid";
    if (!data.city) errors.city = "City is required";
    if (!data.state) errors.state = "State is required";
    if (!data.pincode) errors.pincode = "Pincode is required";
    else if (!/^\d{6}$/.test(data.pincode))
      errors.pincode = "Pincode must be 6 digits";
    if (!data.address) errors.address = "Address is required";

    return errors;
  };

  const [partnerDetails, setPartnerDetails] = useState({
    id: "",
    type: "",
    name: "",
    mobile: "",
    email: "",
    city: "",
    state: "",
    pincode: "",
    address: "",
    status: "",
  });

  const handleAddPartner = async (e) => {
    e.preventDefault();
    const newErrors = validateForm(formData);
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        const response = await api.post("/api/vendor-customer/add", formData);
        console.log("Partner added successfully:", response.data);

        // Check for the new response format
        if (response.data && response.data.status === true) {
          alert(response.data.message || "Partner added successfully!");
        } else {
          alert("Partner added successfully!");
        }

        // Reset the form
        handleReset(e);

        // Close the form popup/modal
        setIsAddVendor(false);

        // Refresh the vendor list
        fetchVendors();
      } catch (error) {
        console.error("Error adding partner:", error);
        alert("Error adding partner. Please try again.");
      }
    } else {
      console.log("Form submission failed due to validation errors.");
    }
  };

  const handleDeletePartner = async (id) => {
    if (window.confirm("Are you sure you want to delete this partner?")) {
      try {
        const response = await api.delete(`/api/vendor-customer/delete/${id}`);

        // Handle new API response format
        if (response.data && response.data.status === true) {
          alert(response.data.message || "Partner deleted successfully!");
        } else {
          alert("Partner deleted successfully!");
        }

        // Refresh the vendor list
        fetchVendors();
      } catch (error) {
        console.error("Error deleting partner:", error);
        alert("Error deleting partner. Please try again.");
      }
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedVendors.length === 0) {
      alert("Please select at least one partner to delete.");
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to delete ${selectedVendors.length} selected partner(s)?`
      )
    ) {
      try {
        // Create an array of promises for each delete operation
        const deletePromises = selectedVendors.map((id) =>
          api.delete(`/api/vendor-customer/delete/${id}`)
        );

        // Wait for all delete operations to complete
        const results = await Promise.all(deletePromises);

        // Check if any of the responses use the new format
        const hasNewFormat = results.some(
          (res) => res.data && res.data.status === true
        );

        if (hasNewFormat) {
          alert(`${selectedVendors.length} partners deleted successfully!`);
        } else {
          alert("Selected partners deleted successfully!");
        }

        // Clear selection and refresh the vendor list
        setSelectedVendors([]);
        setSelectAll(false);
        fetchVendors();
      } catch (error) {
        console.error("Error deleting selected partners:", error);
        alert("Error deleting selected partners. Please try again.");
      }
    }
  };

  const handleEditPartner = async (e) => {
    e.preventDefault();
    const newErrors = validateForm(partnerDetails);
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        const response = await api.put(
          `/api/vendor-customer/update/${partnerDetails.id}`,
          partnerDetails
        );

        if (response.data && response.data.status === true) {
          alert(response.data.message || "Partner updated successfully!");
        } else {
          alert("Partner updated successfully!");
        }

        // Refresh the vendor list
        fetchVendors();

        // Close the modal
        handleCloseEditModal();
      } catch (error) {
        console.error("Error updating partner:", error);
        alert("Error updating partner. Please try again.");
      }
    }
  };

  const handleReset = (e) => {
    e.preventDefault();
    setFormData({
      type: "",
      name: "",
      mobile: "",
      email: "",
      city: "",
      state: "",
      pincode: "",
      address: "",
      status: "active",
    });
    setIsChecked(true);
    setStatus("active");
  };

  const handleVendorCheckboxChange = (vendorId) => {
    setSelectedVendors((prevSelected) =>
      prevSelected.includes(vendorId)
        ? prevSelected.filter((id) => id !== vendorId)
        : [...prevSelected, vendorId]
    );
  };

  const handleSelectAllChange = (e) => {
    const checked = e.target.checked;
    setSelectAll(checked);
    if (checked) {
      const allVendorIds = currentItems.map((vendor) => vendor.id);
      setSelectedVendors(allVendorIds);
    } else {
      setSelectedVendors([]);
    }
  };

  const handleViewPartner = async (partnerId) => {
    try {
      const response = await api.get(`/api/vendor-customer/get/${partnerId}`);
      if (response.data && response.data.status === true) {
        setPartnerDetails(response.data.data);
      } else if (response.data) {
        setPartnerDetails(response.data);
      }
      setIsShowPartnerDetails(true);
    } catch (error) {
      console.error("Error fetching partner details:", error);
      alert("Error fetching partner details. Please try again.");
    }
  };

  const handleShowEditModal = async (partnerId) => {
    try {
      const response = await api.get(`/api/vendor-customer/get/${partnerId}`);
      if (response.data && response.data.status === true) {
        setPartnerDetails(response.data.data);
      } else if (response.data) {
        setPartnerDetails(response.data);
      }
      setIsEditPartnerDetails(true);
    } catch (error) {
      console.error("Error fetching partner details:", error);
      alert("Error fetching partner details. Please try again.");
    }
  };

  const handleCloseViewModal = () => {
    if (viewModal) {
      viewModal.hide();
      setViewModal(null);
    }
    setIsShowPartnerDetails(false);
  };

  const handleCloseEditModal = () => {
    if (editModal) {
      editModal.hide();
      setEditModal(null);
    }
    setIsEditPartnerDetails(false);
    setErrors({});
  };

  return (
    <div>
      {/* Header section */}
      <nav className="navbar bg-light border-body" data-bs-theme="light">
        <div className="container-fluid">
          <div className="mt-4">
            <h3 className="nav-header header-style">Business Partner</h3>
            <p className="breadcrumb">
              <Link to="/dashboard">
                <i className="fas fa-home text-8"></i>
              </Link>{" "}
              <span className="ms-1 mt-1 text-small-gray">
                / Masters / Business Partner
              </span>
            </p>
          </div>

          {/* Add Partner Button */}

          <button
            className="btn btn-primary add-btn"
            onClick={handleSetIsAddVendor}
          >
            <i className="fa-solid fa-plus pe-1"></i> Add New Partner
          </button>
        </div>
      </nav>

      {/* Update Search and Filter Section */}
      <div className="search-filter-container mx-2">
        <div className="search-box">
          <i className="fas fa-search position-absolute input-icon"></i>
          <input
            type="text"
            className="form-control vendor-search-bar"
            placeholder="Search by name, email, mobile or city..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        <div className="filter-options">
          <select
            className="filter-select"
            value={typeFilter}
            onChange={handleTypeFilterChange}
          >
            <option value="">All Types</option>
            <option value="vendor">Vendors Only</option>
            <option value="customer">Customers Only</option>
          </select>
          <select
            className="filter-select"
            value={statusFilter}
            onChange={handleStatusFilterChange}
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
      {isAddVendor && (
        <div className="table-form-container mx-2">
          <div className="form-header">
            <h2>
              <i className="fas fa-plus pe-1"></i> Add New Partner
            </h2>
            <button
              className="btn-close"
              onClick={(e) => {
                handleReset(e);
                setIsAddVendor(false);
              }}
            ></button>
          </div>
          {/* Form Fields */}
          <form
            autoComplete="off"
            className="padding-2"
            onSubmit={handleAddPartner}
          >
            <div className="form-grid border-bottom pt-0">
              <div className="row form-style">
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="type" className="form-label ms-2">
                    Type
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-user-tag position-absolute input-icon"></i>
                    <select
                      className="form-control ps-5 ms-2 text-font"
                      id="type"
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value })
                      }
                    >
                      <option value="" disabled hidden className="text-muted">
                        Select Type
                      </option>
                      <option value="vendor">Vendor</option>
                      <option value="customer">Customer</option>
                    </select>
                    <i className="fa-solid fa-angle-down position-absolute down-arrow-icon"></i>
                  </div>
                  {errors.type && (
                    <span className="error-message ms-2">{errors.type}</span>
                  )}
                </div>
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="name" className="form-label  ms-2">
                    Name
                  </label>
                  <div className="position-relative w-100 ms-2">
                    <i className="fas fa-user position-absolute ps-2 input-icon"></i>
                    <input
                      type="text"
                      className="form-control ps-5 text-font"
                      id="name"
                      placeholder="Enter full name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                  {errors.name && (
                    <span className="error-message ms-2">{errors.name}</span>
                  )}
                </div>
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="mobile" className="form-label  ms-2">
                    Mobile
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-phone position-absolute ps-2 input-icon"></i>
                    <input
                      type="tel"
                      className="form-control ps-5 ms-2 text-font"
                      id="mobile"
                      placeholder="Enter mobile number"
                      value={formData.mobile}
                      onChange={(e) =>
                        setFormData({ ...formData, mobile: e.target.value })
                      }
                    />
                  </div>
                  {errors.mobile && (
                    <span className="error-message ms-2">{errors.mobile}</span>
                  )}
                </div>
              </div>
              <div className="row form-style">
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="email" className="form-label  ms-2">
                    Email
                  </label>
                  <div className="position-relative w-100">
                    <i className="fa-solid fa-envelope ps-2 position-absolute input-icon"></i>
                    <input
                      type="email"
                      className="form-control ps-5 ms-2 text-font"
                      id="email"
                      placeholder="Enter email address"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                  {errors.email && (
                    <span className="error-message ms-2">{errors.email}</span>
                  )}
                </div>
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="city" className="form-label  ms-2">
                    City
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-city position-absolute ps-2 input-icon"></i>
                    <input
                      type="text"
                      className="form-control ps-5 ms-2 text-font"
                      id="city"
                      placeholder="Enter city"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                    />
                  </div>
                  {errors.city && (
                    <span className="error-message ms-2">{errors.city}</span>
                  )}
                </div>
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="state" className="form-label  ms-2">
                    State
                  </label>
                  <div className="position-relative w-100">
                    <i className="fa-solid fa-location-crosshairs ps-2 position-absolute input-icon"></i>
                    <input
                      type="text"
                      className="form-control ps-5 ms-2 text-font"
                      id="state"
                      placeholder="Enter state"
                      value={formData.state}
                      onChange={(e) =>
                        setFormData({ ...formData, state: e.target.value })
                      }
                    />
                  </div>
                  {errors.state && (
                    <span className="error-message ms-2">{errors.state}</span>
                  )}
                </div>
              </div>
              <div className="row form-style">
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="pincode" className="form-label  ms-2">
                    Pincode
                  </label>
                  <div className="position-relative w-100">
                    <i className="fa-solid fa-map-pin ps-2 position-absolute input-icon"></i>
                    <input
                      type="text"
                      className="form-control ps-5 ms-2 text-font"
                      id="pincode"
                      placeholder="Enter pincode"
                      value={formData.pincode}
                      onChange={(e) =>
                        setFormData({ ...formData, pincode: e.target.value })
                      }
                    />
                  </div>
                  {errors.pincode && (
                    <span className="error-message ms-2">{errors.pincode}</span>
                  )}
                </div>
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="address" className="form-label  ms-2">
                    Address
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-map-marker-alt ps-2 position-absolute input-icon"></i>
                    <textarea
                      type="text"
                      className="form-control pt-3 ps-5 ms-2 text-font"
                      id="address"
                      placeholder="Enter complete address"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                    ></textarea>
                  </div>
                  {errors.address && (
                    <span className="error-message ms-2">{errors.address}</span>
                  )}
                </div>
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="status" className="form-label ms-2">
                    Status
                  </label>
                  <div className="position-relative w-100 ms-2">
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
                className="btn btn-primary border border-0 text-8 px-3 fw-medium py-2 me-3 float-end"
                onClick={handleAddPartner}
              >
                <i className="fa-solid fa-floppy-disk me-1"></i> Save Changes
              </button>
              <button
                className="btn btn-secondary border border-0 text-8 px-3 fw-medium py-2 bg-secondary me-3 float-end"
                onClick={handleReset}
              >
                <i className="fa-solid fa-arrows-rotate me-1"></i> Reset
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="margin-2 mx-2">
        {/* Table Section */}
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
                {selectedVendors.length} Selected
              </label>
            </div>
            <div className="bulk-actions">
              <button className="btn-action">
                <i className="fas fa-envelope"></i>
                Email Selected
              </button>
              <button
                className="btn-action btn-danger"
                onClick={handleDeleteSelected}
              >
                <i className="fas fa-trash"></i>
                Delete Selected
              </button>
            </div>
          </div>
          {loading ? (
            <div className="text-center p-4">
              Loading vendors and customers...
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th className="checkbox-cell">
                    <input
                      type="checkbox"
                      id="select-all-header"
                      checked={selectAll}
                      onChange={handleSelectAllChange}
                    />
                  </th>
                  <th>
                    Partner Code <i className="fas fa-sort color-gray ms-2"></i>
                  </th>
                  <th>
                    Name <i className="fas fa-sort color-gray ms-2"></i>
                  </th>
                  <th>
                    Type <i className="fas fa-sort color-gray ms-2"></i>
                  </th>
                  <th>
                    Email <i className="fas fa-sort color-gray ms-2"></i>
                  </th>
                  <th>Mobile</th>
                  <th>
                    City <i className="fas fa-sort color-gray ms-2"></i>
                  </th>
                  {/* <th>Pincode</th> */}
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredVendors.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center">
                      <div className="p-4">
                        <i className="fas fa-search fa-3x mb-3 text-muted"></i>
                        <h5>No matching partners found</h5>
                        <p className="text-muted">
                          Try adjusting your search or filter criteria
                        </p>
                        <button
                          className="btn btn-primary mt-2"
                          onClick={handleResetFilters}
                        >
                          <i className="fas fa-times-circle me-2"></i>
                          Clear Filters
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentItems.map((vendor) => (
                    <tr key={vendor.id}>
                      <td className="checkbox-cell ps-4">
                        <input
                          type="checkbox"
                          checked={selectedVendors.includes(vendor.id)}
                          onChange={() => handleVendorCheckboxChange(vendor.id)}
                        />
                      </td>
                      <td className="ps-4">{vendor.code}</td>
                      <td className="ps-3">
                        <div className="user-info">
                          <img
                            src={`https://ui-avatars.com/api/?name=${vendor.name}&size=32&background=2563eb&color=fff`}
                            alt={vendor.name}
                          />
                          <span>{vendor.name}</span>
                        </div>
                      </td>
                      <td className="ps-4">
                        <span className={`badge ${vendor.type.toLowerCase()}`}>
                          {vendor.type.charAt(0).toUpperCase() +
                            vendor.type.slice(1)}
                        </span>
                      </td>
                      <td className="ps-4">{vendor.email}</td>
                      <td className="ps-4">{vendor.mobile}</td>
                      <td className="ps-4">{vendor.city}</td>
                      {/* <td>{vendor.pincode}</td> */}
                      <td className="ps-4">
                        <span
                          className={`badge status ${vendor.status.toLowerCase()}`}
                        >
                          {vendor.status.charAt(0).toUpperCase() +
                            vendor.status.slice(1)}
                        </span>
                      </td>
                      <td className="actions">
                        <button
                          className="btn-icon btn-primary"
                          title="View Details"
                          onClick={() => handleViewPartner(vendor.id)}
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button
                          className="btn-icon btn-success"
                          title="Edit"
                          onClick={() => handleShowEditModal(vendor.id)}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          className="btn-icon btn-danger"
                          title="Delete"
                          onClick={() => handleDeletePartner(vendor.id)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          {!loading && filteredVendors.length > 0 && (
            <div className="pagination-container">
              <div className="pagination-info">
                Showing {indexOfFirstItem + 1}-
                {Math.min(indexOfLastItem, filteredVendors.length)} of{" "}
                {filteredVendors.length} entries
              </div>
              <div className="pagination">
                <button
                  className="btn-page"
                  onClick={goToPrevPage}
                  disabled={currentPage === 1}
                >
                  <i className="fas fa-chevron-left"></i>
                </button>

                {/* Generate page buttons */}
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    className={`btn-page ${
                      currentPage === i + 1 ? "active" : ""
                    }`}
                    onClick={() => paginate(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  className="btn-page"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
              <div className="items-per-page">
                <select
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                >
                  <option value="10">10 per page</option>
                  <option value="25">25 per page</option>
                  <option value="50">50 per page</option>
                  <option value="100">100 per page</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* View Partner Details Modal */}
      {isShowPartnerDetails && (
        <div
          className="modal fade"
          ref={partnerModalRef}
          id="userDetailModal"
          tabIndex="-1"
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <div class="modal-header d-flex align-items-center justify-content-between">
                  <i className="fa-solid fa-circle-info me-2"></i>
                  <h5 className="title">
                    View {partnerDetails.name}’s Details
                  </h5>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseViewModal}
                ></button>
              </div>
              <div className="modal-body">
                <div className="user-details-grid">
                  <div className="detail-item">
                    <strong>Partner Code:</strong>
                    <span>{partnerDetails.code}</span>
                  </div>

                  <div className="detail-item">
                    <strong>Email:</strong>
                    <span>{partnerDetails.email}</span>
                  </div>

                  <div className="detail-item">
                    <strong>State:</strong>
                    <span>{partnerDetails.state}</span>
                  </div>

                  <div className="detail-item">
                    <strong>Address:</strong>
                    <span>{partnerDetails.address}</span>
                  </div>

                  <div className="detail-item">
                    <strong>Name:</strong>
                    <span>{partnerDetails.name}</span>
                  </div>

                  <div className="detail-item">
                    <strong>Mobile:</strong>
                    <span>{partnerDetails.mobile}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Pincode:</strong>
                    <span>{partnerDetails.pincode}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Type:</strong>
                    <span
                      className={`badge ${partnerDetails.type?.toLowerCase()} w-50`}
                    >
                      {partnerDetails.type?.charAt(0).toUpperCase() +
                        partnerDetails.type?.slice(1)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <strong>City:</strong>
                    <span>{partnerDetails.city}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Status:</strong>
                    <span
                      className={`badge status ${partnerDetails.status?.toLowerCase()} w-50`}
                    >
                      {partnerDetails.status?.charAt(0).toUpperCase() +
                        partnerDetails.status?.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-primary add-btn"
                  onClick={() => {
                    handleCloseViewModal();
                    handleShowEditModal(partnerDetails.id);
                  }}
                >
                  <i className="fa-solid fa-edit me-1"></i> Edit
                </button>
                <button
                  type="button"
                  className="btn btn-secondary add-btn"
                  onClick={handleCloseViewModal}
                >
                  <i className="fa-solid fa-xmark me-1"></i> Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Partner Details Modal */}
      {isEditPartnerDetails && (
        <div
          className="modal fade"
          ref={partnerEditModalRef}
          id="userEditModal"
          tabIndex="-1"
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Partner</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseEditModal}
                ></button>
              </div>
              {/* Modal Body */}
              <div className="modal-body">
                <div className="table-form-container mx-2">
                  {/* Form Fields */}
                  <form
                    autoComplete="off"
                    className="padding-2"
                    onSubmit={handleEditPartner}
                  >
                    <div className="form-grid pt-0">
                      <div className="row form-style">
                        <div className="col-4 d-flex flex-column form-group">
                          <label htmlFor="type" className="form-label ms-2">
                            Type
                          </label>
                          <div className="position-relative w-100">
                            <i className="fas fa-user-tag position-absolute input-icon"></i>
                            <select
                              className="form-control ps-5 ms-2 text-font"
                              id="type"
                              value={partnerDetails.type || ""}
                              onChange={(e) =>
                                setPartnerDetails({
                                  ...partnerDetails,
                                  type: e.target.value,
                                })
                              }
                            >
                              <option
                                value=""
                                disabled
                                hidden
                                className="text-muted"
                              >
                                Select Type
                              </option>
                              <option value="vendor">Vendor</option>
                              <option value="customer">Customer</option>
                            </select>
                            <i className="fa-solid fa-angle-down position-absolute down-arrow-icon"></i>
                          </div>
                          {errors.type && (
                            <span className="error-message ms-2">
                              {errors.type}
                            </span>
                          )}
                        </div>
                        <div className="col-4 d-flex flex-column form-group">
                          <label htmlFor="name" className="form-label ms-2">
                            Name
                          </label>
                          <div className="position-relative w-100 ms-2">
                            <i className="fas fa-user position-absolute ps-2 input-icon"></i>
                            <input
                              type="text"
                              className="form-control ps-5 text-font"
                              id="name"
                              placeholder="Enter full name"
                              value={partnerDetails.name || ""}
                              onChange={(e) =>
                                setPartnerDetails({
                                  ...partnerDetails,
                                  name: e.target.value,
                                })
                              }
                            />
                          </div>
                          {errors.name && (
                            <span className="error-message ms-2">
                              {errors.name}
                            </span>
                          )}
                        </div>
                        <div className="col-4 d-flex flex-column form-group">
                          <label htmlFor="mobile" className="form-label ms-2">
                            Mobile
                          </label>
                          <div className="position-relative w-100">
                            <i className="fas fa-phone position-absolute ps-2 input-icon"></i>
                            <input
                              type="tel"
                              className="form-control ps-5 ms-2 text-font"
                              id="mobile"
                              placeholder="Enter mobile number"
                              value={partnerDetails.mobile || ""}
                              onChange={(e) =>
                                setPartnerDetails({
                                  ...partnerDetails,
                                  mobile: e.target.value,
                                })
                              }
                            />
                          </div>
                          {errors.mobile && (
                            <span className="error-message ms-2">
                              {errors.mobile}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="row form-style">
                        <div className="col-4 d-flex flex-column form-group">
                          <label htmlFor="email" className="form-label ms-2">
                            Email
                          </label>
                          <div className="position-relative w-100">
                            <i className="fa-solid fa-envelope ps-2 position-absolute input-icon"></i>
                            <input
                              type="email"
                              className="form-control ps-5 ms-2 text-font"
                              id="email"
                              placeholder="Enter email address"
                              value={partnerDetails.email || ""}
                              onChange={(e) =>
                                setPartnerDetails({
                                  ...partnerDetails,
                                  email: e.target.value,
                                })
                              }
                            />
                          </div>
                          {errors.email && (
                            <span className="error-message ms-2">
                              {errors.email}
                            </span>
                          )}
                        </div>
                        <div className="col-4 d-flex flex-column form-group">
                          <label htmlFor="city" className="form-label ms-2">
                            City
                          </label>
                          <div className="position-relative w-100">
                            <i className="fas fa-city position-absolute ps-2 input-icon"></i>
                            <input
                              type="text"
                              className="form-control ps-5 ms-2 text-font"
                              id="city"
                              placeholder="Enter city"
                              value={partnerDetails.city || ""}
                              onChange={(e) =>
                                setPartnerDetails({
                                  ...partnerDetails,
                                  city: e.target.value,
                                })
                              }
                            />
                          </div>
                          {errors.city && (
                            <span className="error-message ms-2">
                              {errors.city}
                            </span>
                          )}
                        </div>
                        <div className="col-4 d-flex flex-column form-group">
                          <label htmlFor="state" className="form-label ms-2">
                            State
                          </label>
                          <div className="position-relative w-100">
                            <i className="fa-solid fa-location-crosshairs ps-2 position-absolute input-icon"></i>
                            <input
                              type="text"
                              className="form-control ps-5 ms-2 text-font"
                              id="state"
                              placeholder="Enter state"
                              value={partnerDetails.state || ""}
                              onChange={(e) =>
                                setPartnerDetails({
                                  ...partnerDetails,
                                  state: e.target.value,
                                })
                              }
                            />
                          </div>
                          {errors.state && (
                            <span className="error-message ms-2">
                              {errors.state}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="row form-style">
                        <div className="col-4 d-flex flex-column form-group">
                          <label htmlFor="pincode" className="form-label ms-2">
                            Pincode
                          </label>
                          <div className="position-relative w-100">
                            <i className="fa-solid fa-map-pin ps-2 position-absolute input-icon"></i>
                            <input
                              type="text"
                              className="form-control ps-5 ms-2 text-font"
                              id="pincode"
                              placeholder="Enter pincode"
                              value={partnerDetails.pincode || ""}
                              onChange={(e) =>
                                setPartnerDetails({
                                  ...partnerDetails,
                                  pincode: e.target.value,
                                })
                              }
                            />
                          </div>
                          {errors.pincode && (
                            <span className="error-message ms-2">
                              {errors.pincode}
                            </span>
                          )}
                        </div>
                        <div className="col-4 d-flex flex-column form-group">
                          <label htmlFor="address" className="form-label ms-2">
                            Address
                          </label>
                          <div className="position-relative w-100">
                            <i className="fas fa-map-marker-alt ps-2 position-absolute input-icon"></i>
                            <textarea
                              className="form-control pt-3 ps-5 ms-2 text-font"
                              id="address"
                              placeholder="Enter complete address"
                              value={partnerDetails.address || ""}
                              onChange={(e) =>
                                setPartnerDetails({
                                  ...partnerDetails,
                                  address: e.target.value,
                                })
                              }
                            ></textarea>
                          </div>
                          {errors.address && (
                            <span className="error-message ms-2">
                              {errors.address}
                            </span>
                          )}
                        </div>
                        <div className="col-4 d-flex flex-column form-group">
                          <label htmlFor="status" className="form-label ms-2">
                            Status
                          </label>
                          <div className="position-relative w-100 ms-2">
                            <div className="form-check form-switch position-absolute input-icon mt-1 padding-left-2">
                              <input
                                className="form-check-input text-font switch-style"
                                type="checkbox"
                                role="switch"
                                id="switchCheckChecked"
                                checked={partnerDetails.status === "active"}
                                onChange={(e) => {
                                  const newStatus = e.target.checked
                                    ? "active"
                                    : "inactive";
                                  setPartnerDetails({
                                    ...partnerDetails,
                                    status: newStatus,
                                  });
                                }}
                              />
                            </div>
                            <select
                              className="form-control text-font switch-padding"
                              id="status"
                              value={partnerDetails.status || "active"}
                              onChange={(e) => {
                                const newStatus = e.target.value;
                                setPartnerDetails({
                                  ...partnerDetails,
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
              </div>
              <div className="modal-footer">
                <button
                  type="submit"
                  className="btn btn-primary add-btn"
                  onClick={handleEditPartner}
                >
                  <i className="fa-solid fa-floppy-disk me-1"></i> Save Changes
                </button>
                <button
                  type="button"
                  className="btn btn-secondary add-btn"
                  onClick={handleCloseEditModal}
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

export default VendorMaster;
