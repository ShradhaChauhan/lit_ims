import React, { useContext, useState } from "react";
import { AppContext } from "../../../context/AppContext";

const TypeMaster = () => {
  const { isAddType, setIsAddType } = useContext(AppContext);

  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isReset, setIsReset] = useState(false);

  const types = [];

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

  const handleAddTypes = (e) => {
    e.preventDefault();
    alert("Type Added Successfully");
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
            placeholder="Search by types..."
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
      {isAddType && (
        <div className="table-form-container">
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
          <form autoComplete="off" className="padding-2">
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
                      placeholder="Enter type name"
                    />
                  </div>
                </div>
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="status" className="form-label mb-0">
                    Status
                  </label>
                  <div className="position-relative w-100">
                    <div className="form-check form-switch position-absolute input-icon mt-1 padding-left-2">
                      <input
                        className="form-check-input text-font switch-style"
                        type="checkbox"
                        role="switch"
                        id="switchCheckChecked"
                      />

                      <label
                        className="form-check-label"
                        htmlFor="switchCheckChecked"
                      ></label>
                    </div>
                    <select
                      className="form-control text-font switch-padding"
                      id="status"
                      defaultValue=""
                      required
                    >
                      <option value="" disabled hidden className="text-muted">
                        Select Status
                      </option>
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
                onClick={handleAddTypes}
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
                {selectedTypes.length} Selected
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
                  Name <i className="fas fa-sort color-gray ms-2"></i>
                </th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {types.length === 0 ? (
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
                types.map((type) => (
                  <tr key={type.id}>
                    <td className="checkbox-cell">
                      <input
                        type="checkbox"
                        checked={selectedTypes.includes(type.id)}
                        onChange={() => handleTypeCheckboxChange(type.id)}
                      />
                    </td>
                    <td>
                      <div>
                        <span>{type.trNo}</span>
                      </div>
                    </td>
                    <td>
                      <div>
                        <span>{type.name}</span>
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

export default TypeMaster;
