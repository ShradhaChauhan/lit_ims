import React, { useContext, useState } from "react";
import { AppContext } from "../../../context/AppContext";

const WarehouseMaster = () => {
  const { isAddWarehouse, setIsAddWarehouse } = useContext(AppContext);

  const [selectedWarehouses, setSelectedWarehouses] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isReset, setIsReset] = useState(false);
  const [status, setStatus] = useState("active");
  const [isChecked, setIsChecked] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    status: "active",
  });
  const warehouses = [];

  const handleWarehouseCheckboxChange = (warehouseId) => {
    setSelectedWarehouses((prevSelected) =>
      prevSelected.includes(warehouseId)
        ? prevSelected.filter((id) => id !== warehouseId)
        : [...prevSelected, warehouseId]
    );
  };

  const handleSelectAllChange = (e) => {
    const checked = e.target.checked;
    setSelectAll(checked);
    if (checked) {
      const allWarehouseIds = warehouses.map((warehouse) => warehouse.id);
      setSelectedWarehouses(allWarehouseIds);
    } else {
      setSelectedWarehouses([]);
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
    fetch("", {
      method: "POST",
      body: finalData,
    }).then(function (response) {
      console.log(response);
      return response.json();
    });
    console.log("Form submitted. ", finalData);
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
                id="select-all"
                checked={selectAll}
                onChange={handleSelectAllChange}
              />
              <label htmlFor="select-all">
                {selectedWarehouses.length} Selected
              </label>
            </div>
            <button className="btn-action btn-danger">
              <i className="fas fa-trash"></i>
              Delete Selected
            </button>
          </div>
          <table>
            <thead>
              <tr>
                <th className="checkbox-cell">
                  <input type="checkbox" id="select-all" />
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
              {warehouses.length === 0 ? (
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
                        <span>{warehouse.trNo}</span>
                      </div>
                    </td>
                    <td>
                      <div>
                        <span>{warehouse.name}</span>
                      </div>
                    </td>
                    <td>
                      <div>
                        <span>{warehouse.warehouse}</span>
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
                      <button className="btn-icon btn-danger" title="Delete">
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
            <div className="pagination-info">Showing 1-2 of 25 entries</div>
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
