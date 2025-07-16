import React, { useState } from "react";
import { Link } from "react-router-dom";

const WIPReturn = () => {
  // Auto generate transaction number
  const generateTransactionNumber = () => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `WIP-${year}-${randomNum}`;
  };

  const [transactionNumber, setTransactionNumber] = useState(
    generateTransactionNumber()
  );
  return (
    <div>
      {" "}
      {/* Header section */}
      <nav className="navbar bg-light border-body" data-bs-theme="light">
        <div className="container-fluid">
          <div className="mt-4">
            <h3 className="nav-header header-style">WIP Return</h3>
            <p className="breadcrumb">
              <Link to="/dashboard">
                <i className="fas fa-home text-8"></i>
              </Link>{" "}
              <span className="ms-1 mt-1 text-small-gray">
                / Transactions / WIP Return
              </span>
            </p>
          </div>
        </div>
      </nav>
      {/* Form Section */}
      <div className="table-form-container mx-2 mb-3">
        <div className="form-header">
          <h2>
            <i className="fas fa-industry"></i> WIP Return Entry
          </h2>
          <p>
            Transaction #: <strong>{transactionNumber}</strong>
          </p>
        </div>
        {/* Form Fields */}
        <form autoComplete="off" className="padding-2">
          <div className="form-grid pt-0">
            {/* Input fields section */}
            <div className="row form-style">
              <div className="col-3 d-flex flex-column form-group">
                <label htmlFor="workOrder" className="form-label">
                  Work Order
                </label>
                <div className="position-relative w-100">
                  <i className="fas fa-file-lines position-absolute z-0 input-icon"></i>
                  <select
                    className="form-control ps-5 text-font"
                    id="workOrder"
                    value=""
                  >
                    <option value="" className="text-muted">
                      Select Work Order
                    </option>
                  </select>
                  <i className="fa-solid fa-angle-down position-absolute down-arrow-icon"></i>
                </div>
              </div>
              {/* <div className="col-3 d-flex flex-column form-group">
                <label htmlFor="productionLine" className="form-label">
                  Production Line
                </label>
                <div className="position-relative w-100">
                  <i className="fas fa-gears position-absolute z-0 input-icon"></i>
                  <select
                    className="form-control ps-5 text-font"
                    id="productionLine"
                    value=""
                  >
                    <option value="" className="text-muted">
                      Select Line
                    </option>
                  </select>
                  <i className="fa-solid fa-angle-down position-absolute down-arrow-icon"></i>
                </div>
              </div> */}
              <div className="col-3 d-flex flex-column form-group">
                <label htmlFor="shift" className="form-label">
                  Return Type
                </label>
                <div className="position-relative w-100">
                  <i className="fas fa-tags position-absolute z-0 input-icon"></i>
                  <select
                    className="form-control ps-5 text-font"
                    id="shift"
                    value=""
                  >
                    <option value="" className="text-muted">
                      Select Type
                    </option>
                    <option value="Excess Material" className="text-muted">
                      Excess Material
                    </option>
                    <option value="Defective Material" className="text-muted">
                      Defective Material
                    </option>
                    <option value="Unused Material" className="text-muted">
                      Unused Material
                    </option>
                  </select>
                  <i className="fa-solid fa-angle-down position-absolute down-arrow-icon"></i>
                </div>
              </div>
              <div className="col-3 d-flex flex-column form-group">
                <label htmlFor="operator" className="form-label">
                  Return Date
                </label>
                <div className="position-relative w-100">
                  <i className="fas fa-calendar position-absolute z-0 input-icon"></i>
                  <input type="date" className="form-control ps-5 text-font" />
                  <i className="fa-solid fa-angle-down position-absolute down-arrow-icon"></i>
                </div>
              </div>
            </div>
            {/* Return Items Table Section */}
            <div className="margin-2">
              <div className="table-container">
                <div className="table-header">
                  <h6>Return Items</h6>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>Material</th>
                      <th>Batch No</th>
                      <th>Original Qty</th>
                      <th>Return Qty</th>
                      <th>Condition</th>
                      <th>Return Reason</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="no-data-row">
                      <td colSpan="7" className="no-data-cell">
                        <div className="no-data-content">
                          <i className="fas fa-rotate-left no-data-icon"></i>
                          <p className="no-data-text">No Items Added</p>
                          <p className="no-data-subtext">
                            Select a work order to add return items
                          </p>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>{" "}
            {/* Return Summary Table Section */}
            {/* <div className="margin-2">
              <div className="table-container">
                <div className="row form-style p-4">
                  <h6 className="mb-2">Return Summary</h6>

                  <div className="col-3 d-flex flex-column text-font">
                    <div className="row bg-gray font-weight me-2 p-3 d-flex align-items-center justify-content-between">
                      <p className="col-6 font-gray mb-0">Total Items:</p>
                      <p className="col-6 mb-0 text-end">0</p>
                    </div>
                  </div>

                  <div className="col-3 d-flex flex-column text-font">
                    <div className="row bg-gray font-weight me-2 p-3 d-flex align-items-center justify-content-between">
                      <p className="col-6 font-gray mb-0">Reusable Items:</p>
                      <p className="col-6 mb-0 text-end">0</p>
                    </div>
                  </div>

                  <div className="col-3 d-flex flex-column text-font">
                    <div className="row bg-gray font-weight me-2 p-3 d-flex align-items-center justify-content-between">
                      <p className="col-6 font-gray mb-0">Scrap Items:</p>
                      <p className="col-6 mb-0 text-end">0</p>
                    </div>
                  </div>
                  <div className="col-3 d-flex flex-column text-font">
                    <div className="row bg-gray font-weight me-2 p-3 d-flex align-items-center justify-content-between">
                      <p className="col-6 font-gray mb-0">Return Value:</p>
                      <p className="col-6 mb-0 text-end">$0.00</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>{" "} */}
            {/* Button Section */}
            <div className="form-actions">
              <button type="button" className="btn btn-primary add-btn">
                <i className="fa-solid fa-floppy-disk me-1"></i> Process Return
                Record
              </button>
              <button className="btn btn-secondary add-btn me-2" type="button">
                <i className="fa-solid fa-xmark me-1"></i> Clear
              </button>
            </div>
            {/* Recent Returns Table Section */}
            <div className="margin-2">
              <div className="table-container">
                <div className="table-header">
                  <h6>Recent Returns</h6>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Transaction #</th>
                      <th>Work Order</th>
                      <th>Return Type</th>
                      <th>Items</th>
                      <th>Total Value</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="no-data-row">
                      <td colSpan="7" className="no-data-cell">
                        <div className="no-data-content">
                          <i className="fas fa-clock-rotate-left no-data-icon"></i>
                          <p className="no-data-text">No Recent Returns</p>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>{" "}
          </div>
        </form>
      </div>
    </div>
  );
};

export default WIPReturn;
