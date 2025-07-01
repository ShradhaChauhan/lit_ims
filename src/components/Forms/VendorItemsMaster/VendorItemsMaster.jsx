import React, { useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "../../../context/AppContext";
import { Link } from "react-router-dom";
import { Modal } from "bootstrap";

const VendorItemsMaster = () => {
  const vendorItems = [];
  const [errors, setErrors] = useState({});
  const { isAddVendorItem, setIsAddVendorItem } = useContext(AppContext);
  const [selectAll, setSelectAll] = useState(false);
  const vendorItemModalRef = useRef(null);
  const vendorItemEditModalRef = useRef(null);
  const [selectedVendorItems, setSelectedVendorItems] = useState([]);
  const [isShowVendorItemDetails, setIsShowVendorItemDetails] = useState(false);
  const [isEditVendorItemDetails, setIsEditVendorItemDetails] = useState(false);
  const [isChecked, setIsChecked] = useState(true);
  const [vendorItemDetails, setVendorItemDetails] = useState({
    id: "",
    vendor: "",
    item: "",
    leadTime: "",
    minOrderQty: "",
    price: "",
    status: "",
  });
  const [formData, setFormData] = useState({
    vendor: "",
    item: "",
    leadTime: "",
    minOrderQty: "",
    price: "",
    status: "active",
  });

  const handleVendorItemCheckboxChange = (assignmentId) => {
    setSelectedVendorItems((prevSelected) =>
      prevSelected.includes(assignmentId)
        ? prevSelected.filter((id) => id !== assignmentId)
        : [...prevSelected, assignmentId]
    );
  };

  const handleViewDetails = (assignment, e) => {
    e.preventDefault();
    console.log(assignment);
    setVendorItemDetails(assignment);
    setIsShowVendorItemDetails(true);
  };

  const handleEditDetails = (assignment, e) => {
    e.preventDefault();
    console.log(assignment);
    setVendorItemDetails(assignment);
    setIsEditVendorItemDetails(true);
  };

  const handleAddVendorItem = (e) => {
    e.preventDefault();
    const newErrors = validateForm(formData);
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      e.preventDefault();
      const finalData = {
        vendor: formData.vendor,
        item: formData.item,
        leadTime: formData.leadTime,
        minOrderQty: formData.minOrderQty,
        price: formData.price,
        status: formData.status,
      };

      console.log("Submitting add assignment form");
      fetch("", {
        method: "POST",
        body: finalData,
      }).then(function (response) {
        console.log(response);
        return response.json();
      });
      console.log("Form submitted. ", finalData);
    } else {
      console.log("Form submission failed due to validation errors.");
    }
  };

  const validateForm = (data) => {
    const errors = {};

    if (!data.vendor.trim()) {
      errors.vendor = "Vendor is required";
    }

    if (!data.item.trim()) {
      errors.item = "Item is required";
    }

    if (!data.minOrderQty) {
      errors.minOrderQty = "Min Order Qty is required";
    } else if (!/^\d+$/.test(data.minOrderQty)) {
      errors.minOrderQty = "Min Order Qty must only be in digits";
    }

    if (!data.price) {
      errors.price = "Price is required";
    } else if (!/^\d+$/.test(data.price)) {
      errors.price = "Price must only be in digits";
    }

    return errors;
  };

  const handleSetIsAddVendorItem = () => {
    setIsAddVendorItem(true);
  };

  const handleEditVendorItem = (e) => {
    e.preventDefault();
    console.log("Vendor Item has been edited");
  };

  const handleSelectAllChange = (e) => {
    const checked = e.target.checked;
    setSelectAll(checked);
    if (checked) {
      const allVendorItemIds = vendorItems.map((vendorItem) => vendorItem.id);
      setSelectedVendorItems(allVendorItemIds);
    } else {
      setSelectedVendorItems([]);
    }
  };

  const handleReset = (e) => {
    e.preventDefault();
    setFormData({
      vendor: "",
      item: "",
      leadTime: "",
      minOrderQty: "",
      price: "",
      status: "active",
    });
    setIsChecked(true);
    setStatus("active");
  };

  return (
    <div>
      {/* Header section */}
      <nav className="navbar bg-light border-body" data-bs-theme="light">
        <div className="container-fluid">
          <div className="mt-4">
            <h3 className="nav-header header-style">Vendor Items Master</h3>
            <p className="breadcrumb">
              <Link to="/dashboard">
                <i className="fas fa-home text-8"></i>
              </Link>{" "}
              <span className="ms-1 mt-1 text-small-gray">
                / Masters / Vendor Items
              </span>
            </p>
          </div>

          {/* Add Type Button */}

          <button
            className="btn btn-primary add-btn"
            onClick={handleSetIsAddVendorItem}
          >
            <i className="fa-solid fa-plus pe-1"></i> Add New Assignment
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
            placeholder="Search assignments..."
          />
        </div>
        <div className="filter-options">
          <select className="filter-select">
            <option value="">All Vendors</option>
          </select>
        </div>
        <div className="filter-options">
          <select className="filter-select">
            <option value="">All Items</option>
          </select>
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
      {isAddVendorItem && (
        <div className="table-form-container mx-2">
          <div className="form-header">
            <h2>
              <i className="fas fa-truck-ramp-box"></i> Add New Vendor-Item
              Assignment
            </h2>
            <button
              className="btn-close"
              onClick={() => setIsAddVendorItem(false)}
            ></button>
          </div>
          {/* Form Fields */}
          <form
            autoComplete="off"
            className="padding-2"
            onSubmit={handleAddVendorItem}
          >
            <div className="form-grid border-bottom pt-0">
              <div className="row form-style">
                <div className="col-3 d-flex flex-column form-group">
                  <label htmlFor="vendor" className="form-label ms-2">
                    Vendor
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-user-tie position-absolute input-icon"></i>
                    <select
                      className="form-control ps-5 ms-2 text-font"
                      id="vendor"
                      value={formData.vendor}
                      onChange={(e) =>
                        setFormData({ ...formData, vendor: e.target.value })
                      }
                    >
                      <option value="" disabled hidden className="text-muted">
                        Select Vendor
                      </option>
                    </select>
                    <i className="fa-solid fa-angle-down position-absolute down-arrow-icon"></i>
                  </div>
                  {errors.vendor && (
                    <span className="error-message ms-2">{errors.vendor}</span>
                  )}
                </div>
                <div className="col-3 d-flex flex-column form-group">
                  <label htmlFor="item" className="form-label ms-2">
                    Item
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-box position-absolute input-icon"></i>
                    <select
                      className="form-control ps-5 ms-2 text-font"
                      id="vendor"
                      value={formData.item}
                      onChange={(e) =>
                        setFormData({ ...formData, item: e.target.value })
                      }
                    >
                      <option value="" disabled hidden className="text-muted">
                        Select Item
                      </option>
                    </select>
                    <i className="fa-solid fa-angle-down position-absolute down-arrow-icon"></i>
                  </div>
                  {errors.item && (
                    <span className="error-message ms-2">{errors.item}</span>
                  )}
                </div>
                <div className="col-3 d-flex flex-column form-group">
                  <label htmlFor="leadTime" className="form-label">
                    Lead Time (Days)
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-clock position-absolute input-icon"></i>
                    <input
                      type="text"
                      className="form-control ps-5 text-font"
                      id="leadTime"
                      placeholder="Enter lead time"
                      value={formData.leadTime}
                      onChange={(e) =>
                        setFormData({ ...formData, leadTime: e.target.value })
                      }
                    />
                  </div>
                  <p className="text-8">
                    Total time from order to delivery (processing +
                    manufacturing + shipping)
                  </p>
                </div>
                <div className="col-3 d-flex flex-column form-group">
                  <label htmlFor="minOrderQty" className="form-label">
                    Min Order Qty
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-cubes position-absolute input-icon"></i>
                    <input
                      type="text"
                      className="form-control ps-5 text-font"
                      id="minOrderQty"
                      placeholder="Enter lead time"
                      value={formData.minOrderQty}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          minOrderQty: e.target.value,
                        })
                      }
                    />
                  </div>
                  {errors.minOrderQty && (
                    <span className="error-message ms-2">
                      {errors.minOrderQty}
                    </span>
                  )}
                </div>
              </div>
              <div className="row form-style">
                <div className="col-3 d-flex flex-column form-group">
                  <label htmlFor="price" className="form-label">
                    Price
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-rupee-sign position-absolute input-icon"></i>
                    <input
                      type="text"
                      className="form-control ps-5 text-font"
                      id="price"
                      placeholder="Enter price"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          price: e.target.value,
                        })
                      }
                    />
                  </div>
                  {errors.price && (
                    <span className="error-message ms-2">{errors.price}</span>
                  )}
                </div>
                <div className="col-3 d-flex flex-column form-group">
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
                className="btn btn-primary border border-0 text-8 px-3 fw-medium py-2 me-3 float-end"
                onClick={handleAddVendorItem}
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
                {selectedVendorItems.length} Selected
              </label>
            </div>
            <div className="bulk-actions">
              <button className="btn-action">
                <i className="fas fa-file-export"></i>
                Export Selected
              </button>
              <button className="btn-action btn-danger">
                <i className="fas fa-trash"></i>
                Delete Selected
              </button>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th className="checkbox-cell">
                  <input type="checkbox" id="select-all" />
                </th>
                <th>
                  Vendor <i className="fas fa-sort color-gray ms-2"></i>
                </th>
                <th>
                  Item <i className="fas fa-sort color-gray ms-2"></i>
                </th>
                <th>Lead Time</th>
                <th>Min Order Qty</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vendorItems.length === 0 ? (
                <tr className="no-data-row">
                  <td colSpan="8" className="no-data-cell">
                    <div className="no-data-content">
                      <i className="fas fa-box-open no-data-icon"></i>
                      <p className="no-data-text">
                        No vendor-item assignments found
                      </p>
                      <p className="no-data-subtext">
                        Click the "Add New Assignment" button to create your
                        first assignment
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                vendorItems.map((assignment) => (
                  <tr key={assignment.id}>
                    <td className="checkbox-cell ps-4">
                      <input
                        assignment="checkbox"
                        checked={selectedVendorItems.includes(assignment.id)}
                        onChange={() =>
                          handleVendorItemCheckboxChange(assignment.id)
                        }
                      />
                    </td>
                    <td className="ps-4">
                      <div>
                        <span>{assignment.trNo}</span>
                      </div>
                    </td>
                    <td className="ps-4">
                      <div>
                        <span>{assignment.name}</span>
                      </div>
                    </td>
                    <td className="ps-4">
                      <span
                        className={`badge status ${assignment.status.toLowerCase()}`}
                      >
                        {assignment.status}
                      </span>
                    </td>
                    <td className="actions">
                      <button
                        className="btn-icon btn-primary"
                        title="View Details"
                        onClick={(e) => handleViewDetails(assignment, e)}
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      <button
                        className="btn-icon btn-success"
                        title="Edit"
                        onClick={(e) => handleEditDetails(assignment, e)}
                      >
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

      {/* View Type Details Modal */}
      {isShowVendorItemDetails && (
        <div
          className="modal fade"
          ref={vendorItemModalRef}
          id="vendorItemDetailModal"
          tabIndex="-1"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">View Assignment Details</h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  <strong>Vendor:</strong> {vendorItemDetails.vendor}
                </p>
                <p>
                  <strong>Item:</strong> {vendorItemDetails.item}
                </p>
                <p>
                  <strong>Lead Time (Days):</strong>{" "}
                  {vendorItemDetails.leadTime}
                </p>
                <p>
                  <strong>Min Order Qty:</strong>{" "}
                  {vendorItemDetails.minOrderQty}
                </p>
                <p>
                  <strong>Price:</strong> {vendorItemDetails.price}
                </p>
                <p>
                  <strong>Status:</strong> {vendorItemDetails.status}
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

      {/* Edit Vendor Item Details Modal */}
      {isEditVendorItemDetails && (
        <div
          className="modal fade"
          ref={vendorItemEditModalRef}
          id="vendorItemEditModal"
          tabIndex="-1"
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Assignment</h5>
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
                  onSubmit={handleEditVendorItem}
                >
                  <div className="form-grid border-bottom pt-0">
                    <div className="row form-style">
                      <div className="col-3 d-flex flex-column form-group">
                        <label htmlFor="vendor" className="form-label ms-2">
                          Vendor
                        </label>
                        <div className="position-relative w-100">
                          <i className="fas fa-user-tag position-absolute input-icon"></i>
                          <select
                            className="form-control ps-5 ms-2 text-font"
                            id="vendor"
                            value={vendorItemDetails.vendor}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                vendor: e.target.value,
                              })
                            }
                          >
                            <option
                              value=""
                              disabled
                              hidden
                              className="text-muted"
                            >
                              Select Vendor
                            </option>
                          </select>
                          <i className="fa-solid fa-angle-down position-absolute down-arrow-icon"></i>
                        </div>
                        {errors.vendor && (
                          <span className="error-message ms-2">
                            {errors.vendor}
                          </span>
                        )}
                      </div>
                      <div className="col-3 d-flex flex-column form-group">
                        <label htmlFor="item" className="form-label ms-2">
                          Item
                        </label>
                        <div className="position-relative w-100">
                          <i className="fas fa-user-tag position-absolute input-icon"></i>
                          <select
                            className="form-control ps-5 ms-2 text-font"
                            id="vendor"
                            value={vendorItemDetails.item}
                            onChange={(e) =>
                              setFormData({ ...formData, item: e.target.value })
                            }
                          >
                            <option
                              value=""
                              disabled
                              hidden
                              className="text-muted"
                            >
                              Select Item
                            </option>
                          </select>
                          <i className="fa-solid fa-angle-down position-absolute down-arrow-icon"></i>
                        </div>
                        {errors.item && (
                          <span className="error-message ms-2">
                            {errors.item}
                          </span>
                        )}
                      </div>
                      <div className="col-3 d-flex flex-column form-group">
                        <label htmlFor="leadTime" className="form-label">
                          Lead Time (Days)
                        </label>
                        <div className="position-relative w-100">
                          <i className="fas fa-hashtag position-absolute input-icon"></i>
                          <input
                            type="text"
                            className="form-control ps-5 text-font"
                            id="leadTime"
                            placeholder="Enter lead time"
                            value={vendorItemDetails.leadTime}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                leadTime: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className="col-3 d-flex flex-column form-group">
                        <label htmlFor="minOrderQty" className="form-label">
                          Min Order Qty
                        </label>
                        <div className="position-relative w-100">
                          <i className="fas fa-hashtag position-absolute input-icon"></i>
                          <input
                            type="text"
                            className="form-control ps-5 text-font"
                            id="minOrderQty"
                            placeholder="Enter lead time"
                            value={vendorItemDetails.minOrderQty}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                minOrderQty: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>
                    <div className="row form-style">
                      <div className="col-3 d-flex flex-column form-group">
                        <label htmlFor="price" className="form-label">
                          price
                        </label>
                        <div className="position-relative w-100">
                          <i className="fas fa-hashtag position-absolute input-icon"></i>
                          <input
                            type="text"
                            className="form-control ps-5 text-font"
                            id="price"
                            placeholder="Enter price"
                            value={vendorItemDetails.price}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                price: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className="col-3 d-flex flex-column form-group">
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
                      className="btn btn-primary border border-0 text-8 px-3 fw-medium py-2 me-3 float-end"
                      onClick={handleAddVendorItem}
                    >
                      <i className="fa-solid fa-floppy-disk me-1"></i> Save
                      Changes
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

export default VendorItemsMaster;
