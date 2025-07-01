import React, { useContext, useState, useEffect } from "react";
import "./VendorMaster.css";
import { AppContext } from "../../../context/AppContext";
import api from "../../../services/api";

const VendorMaster = () => {
  const { isAddVendor, setIsAddVendor } = useContext(AppContext);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
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

  // Fetch vendor/customer data from the API
  const fetchVendors = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/vendor-customer/all");
      
      // Handle new API response format
      if (response.data && response.data.status === true && response.data.data) {
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

  // Calculate pagination values
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = vendors.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(totalItems / itemsPerPage);

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

  const handleAddPartner = async (e) => {
    e.preventDefault();

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

    if (window.confirm(`Are you sure you want to delete ${selectedVendors.length} selected partner(s)?`)) {
      try {
        // Create an array of promises for each delete operation
        const deletePromises = selectedVendors.map(id => 
          api.delete(`/api/vendor-customer/delete/${id}`)
        );
        
        // Wait for all delete operations to complete
        const results = await Promise.all(deletePromises);
        
        // Check if any of the responses use the new format
        const hasNewFormat = results.some(res => res.data && res.data.status === true);
        
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

  return (
    <div>
      {/* Search and Filter Section */}
      <div className="search-filter-container">
        <div className="search-box">
          <i className="fas fa-search position-absolute input-icon"></i>
          <input
            type="text"
            className="form-control vendor-search-bar"
            placeholder="Search by name, email, or city..."
          />
        </div>
        <div className="filter-options">
          <select className="filter-select">
            <option value="">All Types</option>
            <option value="vendor">Vendors Only</option>
            <option value="customer">Customers Only</option>
          </select>
          <select className="filter-select">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button className="filter-select">
            <i className="fas fa-filter me-2"></i>
            More Filters
          </button>
        </div>
      </div>

      {/* Form Header Section */}
      {isAddVendor && (
        <div className="table-form-container">
          <div className="form-header">
            <h2>
              <i className="fas fa-user-plus"></i> Add New Partner
            </h2>
            <button
              className="btn-close"
              onClick={() => setIsAddVendor(false)}
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
                      required
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
                </div>
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="name" className="form-label  ms-2">
                    Name
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-user position-absolute ps-2 input-icon"></i>
                    <input
                      type="text"
                      className="form-control ps-5 text-font"
                      id="name"
                      placeholder="Enter full name"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
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
                      required
                      value={formData.mobile}
                      onChange={(e) =>
                        setFormData({ ...formData, mobile: e.target.value })
                      }
                    />
                  </div>
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
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
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
                      required
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                    />
                  </div>
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
                      required
                      value={formData.state}
                      onChange={(e) =>
                        setFormData({ ...formData, state: e.target.value })
                      }
                    />
                  </div>
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
                      required
                      value={formData.pincode}
                      onChange={(e) =>
                        setFormData({ ...formData, pincode: e.target.value })
                      }
                    />
                  </div>
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
                      required
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                    ></textarea>
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
                className="btn btn-primary border border-0 add-btn me-3 float-end"
                onClick={handleAddPartner}
              >
                <i className="fa-solid fa-floppy-disk me-1"></i> Save Changes
              </button>
              <button
                className="btn btn-secondary border border-0 add-btn bg-secondary me-3 float-end"
                onClick={handleReset}
              >
                <i className="fa-solid fa-arrows-rotate me-1"></i> Reset
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="margin-2">
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
            <div className="text-center p-4">Loading vendors and customers...</div>
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
                  <th>Pincode</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {vendors.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center">
                      <div className="p-4">
                        <i className="fas fa-users fa-3x mb-3 text-muted"></i>
                        <h5>No business partners found</h5>
                        <p className="text-muted">Click the "Add New" button to create your first business partner</p>
                        <button 
                          className="btn btn-primary mt-2"
                          onClick={() => setIsAddVendor(true)}
                        >
                          <i className="fas fa-plus-circle me-2"></i>
                          Add New
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentItems.map((vendor) => (
                    <tr key={vendor.id}>
                      <td className="checkbox-cell">
                        <input
                          type="checkbox"
                          checked={selectedVendors.includes(vendor.id)}
                          onChange={() => handleVendorCheckboxChange(vendor.id)}
                        />
                      </td>
                      <td>
                        <div className="user-info">
                          <img 
                            src={`https://ui-avatars.com/api/?name=${vendor.name}&size=32&background=2563eb&color=fff`} 
                            alt={vendor.name} 
                          />
                          <span>{vendor.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${vendor.type.toLowerCase()}`}>
                          {vendor.type.charAt(0).toUpperCase() + vendor.type.slice(1)}
                        </span>
                      </td>
                      <td>{vendor.email}</td>
                      <td>{vendor.mobile}</td>
                      <td>{vendor.city}</td>
                      <td>{vendor.pincode}</td>
                      <td>
                        <span
                          className={`badge status ${vendor.status.toLowerCase()}`}
                        >
                          {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
                        </span>
                      </td>
                      <td className="actions">
                        <button
                          className="btn-icon btn-primary"
                          title="View Details"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button className="btn-icon btn-success" title="Edit">
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
          {!loading && vendors.length > 0 && (
            <div className="pagination-container">
              <div className="pagination-info">
                Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, totalItems)} of {totalItems} entries
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
                    className={`btn-page ${currentPage === i + 1 ? 'active' : ''}`}
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
    </div>
  );
};

export default VendorMaster;
