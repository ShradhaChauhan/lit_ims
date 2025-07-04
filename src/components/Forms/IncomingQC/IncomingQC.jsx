import React, { useState } from "react";
import { Link } from "react-router-dom";

const IncomingQC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  return (
    <div>
      {/* Header section */}
      <nav className="navbar bg-light border-body" data-bs-theme="light">
        <div className="container-fluid">
          <div className="mt-4">
            <h3 className="nav-header header-style">Incoming QC</h3>
            <p className="breadcrumb">
              <Link to="/dashboard">
                <i className="fas fa-home text-8"></i>
              </Link>{" "}
              <span className="ms-1 mt-1 text-small-gray">
                / Transactions / Incoming QC
              </span>
            </p>
          </div>
        </div>
      </nav>

      {/* Search and Filter Section */}
      <div className="search-filter-container mx-2">
        <div className="search-box">
          <i className="fas fa-search position-absolute input-icon"></i>
          <input
            type="text"
            className="form-control vendor-search-bar"
            placeholder="Search by incoming reprint..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Form Section */}
      <div className="table-form-container mx-2">
        <div className="form-header">
          <h2>
            <i className="fas fa-clipboard-check"></i> Incoming QC
          </h2>
          <button className="btn-close"></button>
        </div>
        {/* Form Fields */}
        <form autoComplete="off" className="padding-2">
          <div className="form-grid pt-0">
            <div className="row form-style">
              <div className="col-4 d-flex flex-column form-group">
                <label htmlFor="receiptMode" className="form-label ms-2">
                  Batch No
                </label>
                <div className="position-relative w-100">
                  <i className="fas fa-right-left ms-2 position-absolute input-icon"></i>
                  <select
                    className="form-control ps-5 ms-1 text-font"
                    id="batchno"
                    value=""
                  >
                    <option value="" disabled hidden className="text-muted">
                      Select Batch No
                    </option>
                    <option value="scan"></option>
                  </select>
                  <i className="fa-solid fa-angle-down position-absolute down-arrow-icon"></i>
                </div>
                {/* {errors.mode && (
                  <span className="error-message">{errors.mode}</span>
                )} */}
              </div>
              <div className="col-4 d-flex flex-column form-group">
                <label htmlFor="receiptMode" className="form-label ms-2">
                  Item Name
                </label>
                <div className="position-relative w-100">
                  <i className="fas fa-right-left ms-2 position-absolute input-icon"></i>
                  <select
                    className="form-control ps-5 ms-1 text-font"
                    id="item"
                    value=""
                  >
                    <option value="" disabled hidden className="text-muted">
                      Select Item Name
                    </option>
                    <option value="scan"></option>
                  </select>
                  <i className="fa-solid fa-angle-down position-absolute down-arrow-icon"></i>
                </div>
                {/* {errors.mode && (
                  <span className="error-message">{errors.mode}</span>
                )} */}
              </div>
              <div className="col-4 d-flex flex-column form-group">
                <label htmlFor="vendorName" className="form-label ms-2">
                  Item Code
                </label>
                <div className="position-relative w-100">
                  <i className="fas fa-building ms-2 position-absolute input-icon"></i>
                  <select
                    className="form-control ps-5 ms-1 text-font"
                    id="vendorName"
                    value=""
                  >
                    <option value="" disabled hidden className="text-muted">
                      Select Item Code
                    </option>
                    <option value="abc"></option>
                  </select>
                  <i className="fa-solid fa-angle-down position-absolute down-arrow-icon"></i>
                </div>
                {/* {errors.vendor && (
                  <span className="error-message">{errors.vendor}</span>
                )} */}
              </div>
            </div>
          </div>
          <div>
            <div className="row">
              <div className="col-3 d-flex flex-column form-group">
                <button className="btn btn-primary text-8 px-3 fw-medium mx-2 margin-top-2">
                  <i className="fa-solid fa-add me-1"></i> Add Receipt
                </button>
              </div>
              <div className="col-6 d-flex flex-column form-group"></div>
            </div>
          </div>
          {/* Table Section */}

          <div>
            <div className="table-form-container mx-2 mt-4">
              <div className="form-header">
                <h2>Pending Transactions</h2>
              </div>
              <div className="item-table-container mt-3">
                <table>
                  <thead>
                    <tr>
                      <th>Batch No</th>
                      <th>Item Name</th>
                      <th>Item Code</th>
                      <th>Quantity</th>
                      <th>Vendor Name</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="ps-4">512036</td>
                      <td className="ps-4">Capacitor</td>
                      <td className="ps-4">1001</td>
                      <td className="ps-4">100</td>
                      <td className="ps-4">Ram Kapoor</td>
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
                  </tbody>
                </table>
              </div>
            </div>
            <div className="form-actions">
              <button className="btn btn-primary border border-0 text-8 px-3 fw-medium py-2 me-3 float-end">
                <i className="fa-solid fa-print me-1"></i> Print
              </button>
              <button className="btn btn-secondary border border-0 text-8 px-3 fw-medium py-2 bg-secondary me-3 float-end">
                <i className="fa-solid fa-xmark me-1"></i> Clear
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IncomingQC;
