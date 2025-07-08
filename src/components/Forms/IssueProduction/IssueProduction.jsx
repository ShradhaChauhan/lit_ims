import React, { useState } from "react";
import { Link } from "react-router-dom";

const IssueProduction = () => {
  // Auto generate issue number
  const generateIssueNumber = () => {
    const year = new Date().getFullYear(); // e.g., 2025
    const randomNum = Math.floor(1000 + Math.random() * 9000); // 4-digit random
    return `REQ-${year}-${randomNum}`;
  };

  const [issueNumber] = useState(generateIssueNumber());
  return (
    <div>
      {" "}
      {/* Header section */}
      <nav className="navbar bg-light border-body" data-bs-theme="light">
        <div className="container-fluid">
          <div className="mt-4">
            <h3 className="nav-header header-style">Issue to Production</h3>
            <p className="breadcrumb">
              <Link to="/dashboard">
                <i className="fas fa-home text-8"></i>
              </Link>{" "}
              <span className="ms-1 mt-1 text-small-gray">
                / Transactions / Issue to Production
              </span>
            </p>
          </div>
        </div>
      </nav>
      {/* Form Section */}
      <div className="table-form-container mx-2 mb-5">
        <div className="form-header">
          <h2>
            <i className="fas fa-dolly"></i> Material Issue Entry
          </h2>
          <p>
            Issue #: <strong>{issueNumber}</strong>
          </p>
        </div>
        {/* Form Fields */}
        <form autoComplete="off" className="padding-2">
          <div className="form-grid pt-0">
            {/* Input fields section */}
            <div className="row form-style">
              {/* Requisition Type */}
              <div className="form-group">
                <div className="row form-style">
                  <div className="col-6 d-flex flex-column form-group">
                    <label
                      htmlFor="requisitionType"
                      className="form-label ms-2"
                    >
                      Requisition Number
                    </label>
                    <div className="position-relative w-100">
                      <i className="fas fa-file-invoice ms-2 position-absolute input-icon"></i>
                      <select
                        className="form-control ps-5 ms-1 text-font"
                        id="requisitionType"
                      >
                        <option value="">Select Requisition</option>{" "}
                        <option value="complete bom">nbdjhbs</option>
                      </select>

                      <i className="fa-solid fa-angle-down position-absolute down-arrow-icon"></i>
                    </div>
                  </div>
                  <div className="col-6 d-flex flex-column form-group">
                    <label
                      htmlFor="requisitionType"
                      className="form-label ms-2"
                    >
                      Scan Batch
                    </label>
                    <div className="position-relative w-100">
                      <i className="fas fa-barcode ms-2 position-absolute input-icon"></i>
                      <input
                        type="text"
                        className="form-control ps-5 ms-1 text-font"
                        placeholder="Scan batch number"
                      />
                    </div>
                  </div>
                </div>
              </div>
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
                      <th>Item Name</th>
                      <th>Code</th>
                      <th>Requested Qty</th>
                      <th>Standard Qty</th>
                      <th>Issued Qty</th>
                      <th>Variance</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="no-data-row">
                      <td colSpan="7" className="no-data-cell">
                        <div className="no-data-content">
                          <i className="fas fa-dolly no-data-icon"></i>
                          <p className="no-data-text">No Items to Issue</p>
                          <p className="no-data-subtext">
                            Select a requisition to view items
                          </p>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>{" "}
            {/* Recent Requests Table Section */}
            <div className="margin-2 mx-2">
              <div className="table-container">
                <div className="table-header">
                  <h6>Scanned Batches</h6>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>Item Name</th>
                      <th>Batch No</th>
                      <th>Quantity</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="no-data-row">
                      <td colSpan="4" className="no-data-cell">
                        <div className="no-data-content">
                          <i className="fas fa-barcode no-data-icon"></i>
                          <p className="no-data-text">No Batches Scanned</p>
                          <p className="no-data-subtext">
                            Scan batches to issue materials
                          </p>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IssueProduction;
