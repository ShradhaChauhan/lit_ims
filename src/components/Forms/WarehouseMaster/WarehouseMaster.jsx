import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../../../context/AppContext";
import api from "../../../services/api";

const WarehouseMaster = () => {
  const { isAddWarehouse, setIsAddWarehouse } = useContext(AppContext);

  const [selectedWarehouses, setSelectedWarehouses] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [status, setStatus] = useState("active");
  const [isChecked, setIsChecked] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    status: "active",
  });
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchWarehouses();
  }, []);
  
  const fetchWarehouses = () => {
    setLoading(true);
    api.get("/api/warehouses")
      .then(response => {
        console.log("Warehouses response:", response.data);
        if (response.data && response.data.status) {
          setWarehouses(response.data.data || []);
        } else {
          console.error("Error fetching warehouses:", response.data.message || "Unknown error");
        }
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching warehouses:", error);
        setLoading(false);
      });
  };

  const handleWarehouseCheckboxChange = (warehouseId) => {
    setSelectedWarehouses((prevSelected) => {
      const newSelected = prevSelected.includes(warehouseId)
        ? prevSelected.filter((id) => id !== warehouseId)
        : [...prevSelected, warehouseId];
      
      console.log("Warehouse selection changed:", warehouseId, "New selection:", newSelected);
      
      // Update select all checkbox state based on whether all warehouses are selected
      setSelectAll(newSelected.length === warehouses.length);
      
      return newSelected;
    });
  };

  const handleSelectAllChange = (e) => {
    const checked = e.target.checked;
    setSelectAll(checked);
    
    if (checked) {
      // Select all warehouses
      const allWarehouseIds = warehouses.map((warehouse) => warehouse.id);
      setSelectedWarehouses(allWarehouseIds);
      console.log("Selected all warehouses:", allWarehouseIds);
    } else {
      // Deselect all warehouses
      setSelectedWarehouses([]);
      console.log("Deselected all warehouses");
    }
  };

  const handleAddWarehouse = (e) => {
    e.preventDefault();
    const finalData = {
      name: formData.name,
      code: formData.code,
      status: formData.status,
    };

    console.log("Submitting add warehouse form");
    api.post("/api/warehouses/add", finalData)
      .then(response => {
        console.log("Response received:", response.data);
        if (response.data && response.data.status) {
          alert("Warehouse added successfully:", response.data.data);
          // Reset form and close it
          handleReset(e);
          setIsAddWarehouse(false);
          // Refresh warehouse list
          fetchWarehouses();
        } else {
          console.error("Error in response:", response.data.message || "Unknown error");
        }
      })
      .catch(error => {
        console.error("Error adding warehouse:", error);
      });
  };

  const handleReset = (e) => {
    e.preventDefault();
    setFormData({
      name: "",
      code: "",
      status: "active",
    });
    setIsChecked(true);
  };
  
  const handleDeleteWarehouse = (warehouseId) => {
    if (!window.confirm("Are you sure you want to delete this warehouse?")) {
      return;
    }
    
    api.delete(`/api/warehouses/delete/${warehouseId}`)
      .then(response => {
        console.log("Delete warehouse response:", response.data);
        if (response.data && response.data.status) {
          console.log("Warehouse deleted successfully:", response.data.message);
          // Refresh the warehouses list
          fetchWarehouses();
        } else {
          console.error("Error in delete response:", response.data.message || "Unknown error");
          alert(response.data.message || "Error deleting warehouse. Please try again.");
        }
      })
      .catch(error => {
        console.error("Error deleting warehouse:", error);
        alert("Error deleting warehouse. Please try again.");
      });
  };
  
  const handleDeleteSelected = () => {
    console.log("Current selected warehouses:", selectedWarehouses);
    
    if (selectedWarehouses.length === 0) {
      alert("Please select at least one warehouse to delete.");
      return;
    }
    
    if (!window.confirm(`Are you sure you want to delete ${selectedWarehouses.length} selected warehouse(s)?`)) {
      return;
    }
    
    console.log("Sending delete request for warehouses:", selectedWarehouses);
    
    // Make API call to delete selected warehouses
    api.post("/api/warehouses/delete-multiple", selectedWarehouses)
      .then(response => {
        console.log("Delete multiple response:", response.data);
        if (response.data && response.data.status) {
          console.log("Selected warehouses deleted successfully:", response.data.message);
          // Clear selection state
          setSelectedWarehouses([]);
          setSelectAll(false);
          // Refresh the warehouses list
          fetchWarehouses();
          // Show success message
          alert(response.data.message || `Successfully deleted ${selectedWarehouses.length} warehouse(s).`);
        } else {
          console.error("Error in delete multiple response:", response.data.message || "Unknown error");
          alert(response.data.message || "Error deleting selected warehouses. Please try again.");
        }
      })
      .catch(error => {
        console.error("Error deleting selected warehouses:", error);
        alert("Error deleting selected warehouses. Please try again.");
      });
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
            placeholder="Search by warehouses..."
          />
        </div>
        <div className="filter-options">
          <select className="filter-select">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Form Header Section */}
      {isAddWarehouse && (
        <div className="table-form-container">
          <div className="form-header">
            <h2>
              <i className="fas fa-warehouse"></i> Add New Warehouse
            </h2>
            <button
              className="btn-close"
              onClick={() => setIsAddWarehouse(false)}
            ></button>
          </div>
          {/* Form Fields */}
          <form
            autoComplete="off"
            className="padding-2"
            onSubmit={handleAddWarehouse}
          >
            <div className="form-grid border-bottom pt-0">
              <div className="row form-style">
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="trNo" className="form-label  ms-2">
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
                  <label htmlFor="name" className="form-label  ms-2">
                    Name
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-font position-absolute input-icon"></i>
                    <input
                      type="text"
                      className="form-control ps-5 text-font"
                      id="name"
                      placeholder="Enter warehouse name"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="code" className="form-label  ms-2">
                    Code
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-qrcode position-absolute input-icon"></i>
                    <input
                      type="text"
                      className="form-control ps-5 text-font"
                      id="code"
                      placeholder="Enter warehouse code"
                      required
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({ ...formData, code: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="row form-style">
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
                onClick={handleAddWarehouse}
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

      {/* Table Section */}
      <div className="margin-2">
        <div className="table-container">
          <div className="table-header">
            <div className="selected-count">
              <input
                type="checkbox"
                id="select-all-count"
                checked={selectAll}
                onChange={handleSelectAllChange}
              />
              <label htmlFor="select-all-count">
                {selectedWarehouses.length} Selected
              </label>
            </div>
            <button className="btn-action btn-danger" onClick={handleDeleteSelected}>
              <i className="fas fa-trash"></i>
              Delete Selected
            </button>
          </div>
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
                  TRNO <i className="fas fa-sort color-gray ms-2"></i>
                </th>
                <th>
                  Code <i className="fas fa-sort color-gray ms-2"></i>
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
                <tr>
                  <td colSpan="6" className="text-center">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : warehouses.length === 0 ? (
                <tr className="no-data-row">
                  <td colSpan="6" className="no-data-cell">
                    <div className="no-data-content">
                      <i className="fas fa-warehouse no-data-icon"></i>
                      <p className="no-data-text">No warehouses found</p>
                      <p className="no-data-subtext">
                        Click the "Add New Warehouse" button to create your
                        first warehouse
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                warehouses.map((warehouse) => (
                  <tr key={warehouse.id}>
                    <td className="checkbox-cell">
                      <input
                        type="checkbox"
                        checked={selectedWarehouses.includes(warehouse.id)}
                        onChange={() =>
                          handleWarehouseCheckboxChange(warehouse.id)
                        }
                      />
                    </td>
                    <td>
                      <div>
                        <span>{warehouse.trno}</span>
                      </div>
                    </td>
                    <td>
                      <div>
                        <span>{warehouse.code}</span>
                      </div>
                    </td>
                    <td>
                      <div>
                        <span>{warehouse.name}</span>
                      </div>
                    </td>
                    <td>
                      <div>
                        <span className={`status-badge ${warehouse.status.toLowerCase()}`}>
                          {warehouse.status}
                        </span>
                      </div>
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
                        onClick={() => handleDeleteWarehouse(warehouse.id)}
                      >
                        <i className="fas fa-trash"></i>
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
            Showing {warehouses.length > 0 ? 1 : 0}-{warehouses.length} of {warehouses.length} entries
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
    </div>
  );
};

export default WarehouseMaster;
