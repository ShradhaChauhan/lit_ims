import React, { useState } from "react";
import { Link } from "react-router-dom";

const MaterialIssueRequest = () => {
  const handleReset = (e) => {
    e.preventDefault();
  };

  const [requisitionType, setRequisitionType] = useState("");

  const handleRequisitionChange = (e) => {
    setRequisitionType(e.target.value);
  };

  const isCompleteBOM = requisitionType === "complete bom";

  // Dynamically calculate widths
  const fieldClass = isCompleteBOM ? "flex-1" : "flex-1-3";

  return (
    <div>
      {/* Header section */}
      <nav className="navbar bg-light border-body" data-bs-theme="light">
        <div className="container-fluid">
          <div className="mt-4">
            <h3 className="nav-header header-style">Material Issue Request</h3>
            <p className="breadcrumb">
              <Link to="/dashboard">
                <i className="fas fa-home text-8"></i>
              </Link>{" "}
              <span className="ms-1 mt-1 text-small-gray">
                / Transactions / Material Issue Request
              </span>
            </p>
          </div>
        </div>
      </nav>
      {/* Form Section */}
      <div className="table-form-container mx-2 mb-5">
        <div className="form-header">
          <h2>
            <i className="fas fa-file-invoice"></i> Material Requisition Entry
          </h2>
          <p>
            Transaction #: <strong>REQ-2025-0001</strong>
          </p>
        </div>
        {/* Form Fields */}
        <form autoComplete="off" className="padding-2">
          <div className="form-grid pt-0">
            {/* Input fields section */}
            <div className="row form-style">
              {/* Requisition Type */}
              <div className={`${fieldClass} form-group`}>
                <label htmlFor="requisitionType" className="form-label ms-2">
                  Requisition Type
                </label>
                <div className="position-relative w-100">
                  <i className="fas fa-rectangle-list ms-2 position-absolute input-icon margin-top-8"></i>
                  <select
                    className="form-control ps-5 ms-1 text-font"
                    id="requisitionType"
                    value={requisitionType}
                    onChange={handleRequisitionChange}
                  >
                    <option value="" disabled hidden className="text-muted">
                      Select Type
                    </option>
                    <option value="complete bom">Complete BOM</option>
                    <option value="individual items">Individual Items</option>
                  </select>
                  <i className="fa-solid fa-angle-down position-absolute down-arrow-icon margin-top-8"></i>
                </div>
              </div>

              {/* Select BOM (conditionally shown) */}
              <div
                className={`${
                  isCompleteBOM ? fieldClass : "d-none"
                } form-group`}
              >
                <label htmlFor="selectBOM" className="form-label ms-2">
                  Select BOM
                </label>
                <div className="position-relative w-100">
                  <i className="fas fa-sitemap ms-2 position-absolute input-icon margin-top-8"></i>
                  <select
                    className="form-control ps-5 ms-1 text-font"
                    id="selectBOM"
                  >
                    <option value="" disabled hidden className="text-muted">
                      Select BOM
                    </option>
                    <option value="bom1">BOM 1</option>
                    <option value="bom2">BOM 2</option>
                  </select>
                </div>
              </div>

              {/* Quantity */}
              <div className={`${fieldClass} form-group`}>
                <label htmlFor="quantity" className="form-label ms-2">
                  Quantity
                </label>
                <div className="position-relative w-100">
                  <i className="fas fa-calculator ms-2 position-absolute input-icon margin-top-8"></i>
                  <input
                    type="text"
                    className="form-control ps-5 ms-1 text-font"
                    id="quantity"
                    disabled
                  />
                </div>
              </div>

              {/* Add Button */}
              <div className={`${fieldClass} form-group`}>
                <label className="form-label mb-4"></label>
                <button className="btn btn-primary text-8 px-3 fw-medium w-100 mt-4">
                  <i className="fa-solid fa-add me-1"></i> Add to Request
                </button>
              </div>

              {/* <div className="col-4 d-flex flex-column form-group">
                <label htmlFor="requisitionType" className="form-label ms-2">
                  Requisition Type
                </label>
                <div className="position-relative w-100">
                  <i className="fas fa-rectangle-list ms-2 position-absolute input-icon"></i>
                  <select
                    className="form-control ps-5 ms-1 text-font"
                    id="requisitionType"
                    value=""
                  >
                    <option value="" disabled hidden className="text-muted">
                      Select Type
                    </option>
                    <option value="complete bom">Complete BOM</option>
                    <option value="individual items">Individual Items</option>
                  </select>
                  <i className="fa-solid fa-angle-down position-absolute down-arrow-icon"></i>
                </div>
              </div>
              <div className="col-4 d-flex flex-column form-group">
                <label htmlFor="quantity" className="form-label ms-2">
                  Quantity
                </label>
                <div className="position-relative w-100">
                  <i className="fas fa-calculator ms-2 position-absolute input-icon"></i>
                  <input
                    type="text"
                    className="form-control ps-5 ms-1 text-font"
                    id="quantity"
                    disabled
                  />
                </div>
              </div>
              <div className="col-4 d-flex flex-column form-group">
                <label htmlFor="" className="form-label mb-4"></label>
                <button className="btn btn-primary text-8 px-3 fw-medium mx-2">
                  <i className="fa-solid fa-add me-1"></i> Add to Request
                </button>
              </div> */}
            </div>

            {/* Requested Items Table Section */}
            <div className="margin-2 mx-2">
              <div className="table-container">
                <div className="table-header">
                  <h6>Requested Items</h6>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>Item/BOM Name</th>
                      <th>Type</th>
                      <th>Code</th>
                      <th>Quantity</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="no-data-row">
                      <td colSpan="5" className="no-data-cell">
                        <div className="no-data-content">
                          <i className="fas fa-clipboard-list no-data-icon"></i>
                          <p className="no-data-text">No Items Requested</p>

                          <p className="no-data-subtext">
                            Add BOM or individual items to your request
                          </p>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Requests Table Section */}
            <div className="margin-2 mx-2">
              <div className="table-container">
                <div className="table-header">
                  <h6>Recent Requests</h6>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>Transaction #</th>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Items</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="no-data-row">
                      <td colSpan="5" className="no-data-cell">
                        <div className="no-data-content">
                          <i className="fas fa-clock-rotate-left no-data-icon"></i>
                          <p className="no-data-text">No Recent Requests</p>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Button Section */}
            <div className="form-actions">
              <button type="submit" className="btn btn-primary add-btn">
                <i className="fa-solid fa-floppy-disk me-1"></i> Save Receipt
              </button>
              <button
                className="btn btn-secondary add-btn"
                type="button"
                onClick={handleReset}
              >
                <i className="fa-solid fa-arrows-rotate me-1"></i> Reset
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MaterialIssueRequest;
