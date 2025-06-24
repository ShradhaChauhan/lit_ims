import React, { useContext, useState } from "react";
import { AppContext } from "../../../context/AppContext";

const WarehouseMaster = () => {
  const { isAddWarehouse, setIsAddWarehouse } = useContext(AppContext);

  const [selectedWarehouses, setSelectedWarehouses] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isReset, setIsReset] = useState(false);

  const warehouses = [
    {
      id: 1,
      trNo: "1W00001",
      name: "Store 1st floor",
      warehouse: "RM1",
    },
    {
      id: 2,
      trNo: "1W00002",
      name: "Store 2nd floor",
      warehouse: "RM2",
    },
  ];

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
    alert("Warehouse Added Successfully");
  };

  const handleReset = () => {
    // setFormData(initialFormState); //
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
            placeholder="Search by name or code..."
          />
        </div>
        <div className="filter-options">
          <input
            type="text"
            className="form-control text-font"
            id="name"
            placeholder="Name"
            aria-label="Name"
          />
          <input
            type="text"
            className="form-control text-font"
            id="code"
            placeholder="Code"
            aria-label="Code"
          />
        </div>
      </div>

      {/* Form Header Section */}
      {isAddWarehouse && (
        <div className="table-form-container">
          <div className="form-header">
            <h2>
              <i className="fas fa-user-plus"></i> Add New Warehouse
            </h2>
            <button
              className="btn-close"
              onClick={() => setIsAddWarehouse(false)}
            ></button>
          </div>
          {/* Form Fields */}
          <form autoComplete="off" className="padding-2">
            <div className="form-grid border-bottom pt-0">
              <div className="row form-style">
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="trNo" className="form-label  ms-2">
                    TRNO
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-user position-absolute input-icon"></i>
                    <input
                      type="text"
                      className="form-control ps-5 text-font"
                      id="trNo"
                      placeholder="Enter TRNO"
                    />
                  </div>
                </div>
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="code" className="form-label  ms-2">
                    Code
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-user position-absolute input-icon"></i>
                    <input
                      type="text"
                      className="form-control ps-5 text-font"
                      id="code"
                      placeholder="Enter code"
                    />
                  </div>
                </div>
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="name" className="form-label  ms-2">
                    Name
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-user position-absolute input-icon"></i>
                    <input
                      type="text"
                      className="form-control ps-5 text-font"
                      id="name"
                      placeholder="Enter name"
                    />
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
                onClick={() => setIsReset(true)}
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
                  Warehouse Name <i className="fas fa-sort color-gray ms-2"></i>
                </th>
                <th>
                  Warehouse <i className="fas fa-sort color-gray ms-2"></i>
                </th>
                <td className="actions">
                  <button className="btn-icon btn-primary" title="View Details">
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
            </thead>
            <tbody>
              {warehouses.map((warehouse) => (
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
              ))}
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
