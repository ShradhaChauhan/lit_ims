import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../../services/api";

const ProductionFloorReceipt = () => {
  const [issueNumber, setIssueNumber] = useState("");
  const [issueNoList, setIssueNoList] = useState([]);
  const [issuedItems, setIssuedItems] = useState([]);
  const [selectedIssueNo, setSelectedIssueNo] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Auto generate transaction number
  const generateTransactionNumber = () => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `RCP-${year}-${randomNum}`;
  };

  const [transactionNumber, setTransactionNumber] = useState(
    generateTransactionNumber()
  );

  // Fetch issue number list
  const fetchIssueNoList = async () => {
    try {
      const response = await api.get("/api/");
      setIssueNoList(response.data.data);
    } catch (error) {
      toast.error("Error in fetching issue number list");
      console.error("Error fetching issue number list:", error);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchIssueNoList();
  }, []);

  const handleSetIssuedItemsList = async (e) => {
    e.preventDefault();
    try {
      const response = await api.get("/api/");
      setIssuedItems(response.data.data);
    } catch (error) {
      toast.error("Error in fetching issued items list");
      console.error("Error fetching issued items list:", error);
    }
  };

  // Checkbox select all function
  const handleSelectAllChange = (e) => {
    const checked = e.target.checked;
    setSelectAll(checked);
    if (checked) {
      const allIssueNoIds = issueNoList.map((issueNo) => issueNo.id);
      setSelectedIssueNo(allIssueNoIds);
    } else {
      setSelectedIssueNo([]);
    }
  };
  // Single single checkbox function
  const handleIssueNoCheckboxChange = (issueNoId) => {
    setSelectedIssueNo((prevSelected) =>
      prevSelected.includes(issueNoId)
        ? prevSelected.filter((id) => id !== issueNoId)
        : [...prevSelected, issueNoId]
    );
  };

  // Reset the form fields
  const handleReset = (e) => {
    e.preventDefault();
    setIssuedItems("");
    setIssueNumber("");
  };

  // Function to save confirmed receipt
  const handleConfirmReceipt = async (e) => {
    e.preventDefault();
    const finalData = [];
    try {
      console.log("Confirming receipt with data:", finalData);
      const response = await api.post("/api/", finalData);
      console.log("Successfully confirmed the receipt: ", response.data);
      toast.success("Successfully confirmed the receipt");
      // Reset form after successful submission
      handleReset(e);
      // Refresh the issue number list
      fetchIssueNoList();
    } catch (error) {
      let errorMessage = "Failed to confirm the receipt. Please try again.";

      if (error.response) {
        if (error.response.data.message) {
          // For structured error from backend (with message field)
          errorMessage = error.response.data.message;
        } else if (typeof error.response.data === "string") {
          // For plain string error from backend
          errorMessage = error.response.data;
        }
      } else {
        errorMessage = error.message;
      }

      console.error("Error confirming the receipt type:", errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <div>
      {" "}
      {/* Header section */}
      <nav className="navbar bg-light border-body" data-bs-theme="light">
        <div className="container-fluid">
          <div className="mt-4">
            <h3 className="nav-header header-style">
              Production Floor Receipt
            </h3>
            <p className="breadcrumb">
              <Link to="/dashboard">
                <i className="fas fa-home text-8"></i>
              </Link>{" "}
              <span className="ms-1 mt-1 text-small-gray">
                / Transactions / Production Floor Receipt
              </span>
            </p>
          </div>
        </div>
      </nav>
      {/* Form Section */}
      <div className="table-form-container mx-2 mb-3">
        <div className="form-header">
          <h2>
            <i className="fas fa-circle-check"></i> Material Receipt
            Confirmation
          </h2>
          <p>
            Receipt #: <strong>{transactionNumber}</strong>
          </p>
        </div>
        {/* Form Fields */}
        <form autoComplete="off" className="padding-2">
          <div className="form-grid pt-0">
            {/* Input fields section */}
            <div className="row form-style">
              <div className="col-3 d-flex flex-column form-group">
                <label htmlFor="issueNumber" className="form-label">
                  Issue Number
                </label>
                <div className="position-relative w-100">
                  <i className="fas fa-dolly position-absolute z-0 input-icon"></i>
                  <select
                    className="form-control ps-5 text-font"
                    id="issueNumber"
                    value={issueNumber}
                    onChange={() => {
                      setIssueNumber(e.target.value);
                      handleSetIssuedItemsList;
                    }}
                  >
                    <option value="" disabled hidden className="text-muted">
                      Select Issue Transaction
                    </option>
                    {issueNoList.map((issueNo) => (
                      <option key={issueNo.issueNo}>{issueNo.issueNo}</option>
                    ))}
                  </select>
                  <i className="fa-solid fa-angle-down position-absolute down-arrow-icon"></i>
                </div>
              </div>
              <div className="col-3 d-flex flex-column form-group">
                <label htmlFor="issueDate" className="form-label">
                  Issue Date
                </label>
                <div className="position-relative w-100">
                  <i className="fas fa-calendar position-absolute z-0 input-icon"></i>
                  <input
                    type="date"
                    className="form-control ps-5 text-font"
                    id="issueDate"
                    placeholder="Issue Date"
                    disabled
                  />
                </div>
              </div>
              <div className="col-3 d-flex flex-column form-group">
                <label htmlFor="requisitionNumber" className="form-label">
                  Requisition Number
                </label>
                <div className="position-relative w-100">
                  <i className="fas fa-file-invoice position-absolute z-0 input-icon"></i>
                  <input
                    type="text"
                    className="form-control ps-5 text-font"
                    id="requisitionNumber"
                    placeholder="Requisition Number"
                    disabled
                  />
                </div>
              </div>
              <div className="col-3 d-flex flex-column form-group">
                <label htmlFor="receiptDate" className="form-label">
                  Receipt Date
                </label>
                <div className="position-relative w-100">
                  <i className="fas fa-calendar position-absolute z-0 input-icon"></i>
                  <input
                    type="date"
                    className="form-control ps-5 text-font"
                    id="receiptDate"
                    placeholder="Receipt Date"
                    disabled
                  />
                </div>
              </div>
            </div>
            {/* Issued Items Table Section */}
            <div className="margin-2">
              <div className="table-container">
                <div className="table-header">
                  <h6>Issued Items</h6>
                  <div className="selected-count">
                    <input
                      type="checkbox"
                      id="select-all"
                      checked={selectAll}
                      onChange={handleSelectAllChange}
                    />
                    <label htmlFor="select-all">
                      {issuedItems.length} Selected
                    </label>
                  </div>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th className="checkbox-cell ps-4">
                        <input
                          type="checkbox"
                          id="select-all-header"
                          disabled
                        />
                      </th>
                      <th>Item Name</th>
                      <th>Batch Numbers</th>
                      <th>Issued Qty</th>
                      <th>Received Qty</th>
                      <th>Variance</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {issuedItems.length === 0 ? (
                      <tr className="no-data-row">
                        <td colSpan="7" className="no-data-cell">
                          <div className="no-data-content">
                            <i className="fas fa-boxes-stacked no-data-icon"></i>
                            <p className="no-data-text">No Items to Receive</p>
                            <p className="no-data-subtext">
                              Select an issue transaction to view items
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      issuedItems.map((issuedItem) => {
                        <tr key={issuedItem.id}>
                          <td className="checkbox-cell ps-4">
                            <input
                              type="checkbox"
                              checked={selectedIssueNo.includes(issuedItem.id)}
                              onChange={() =>
                                handleIssueNoCheckboxChange(issuedItem.id)
                              }
                            />
                          </td>
                          <td className="ps-4">
                            <div>
                              <span>{issuedItem.itemName}</span>
                            </div>
                          </td>
                          <td className="ps-4">
                            <div>
                              <span>{issuedItem.batchNumber}</span>
                            </div>
                          </td>
                          <td className="ps-4">
                            <div>
                              <span>{issuedItem.issuedQty}</span>
                            </div>
                          </td>
                          <td className="ps-4">
                            <div>
                              <span>{issuedItem.receivedQty}</span>
                            </div>
                          </td>
                          <td className="ps-4">
                            <div>
                              <span>{issuedItem.variance}</span>
                            </div>
                          </td>
                          <td className="ps-4">
                            <div>
                              <span>
                                <input
                                  type="text"
                                  className="form-control"
                                  disabled
                                />
                              </span>
                            </div>
                          </td>
                        </tr>;
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>{" "}
            {/* Receipt Summary Table Section */}
            <div className="margin-2">
              <div className="table-container">
                <div className="row form-style p-4">
                  <h6 className="mb-2">Receipt Summary</h6>

                  <div className="col-4 d-flex flex-column text-font">
                    <div className="row bg-gray font-weight me-2 p-3 d-flex align-items-center justify-content-between">
                      <p className="col-6 font-gray mb-0">Total Items:</p>
                      <p className="col-6 mb-0 text-end">
                        {issuedItems.length}
                      </p>
                    </div>
                  </div>

                  <div className="col-4 d-flex flex-column text-font">
                    <div className="row bg-gray font-weight me-2 p-3 d-flex align-items-center justify-content-between">
                      <p className="col-6 font-gray mb-0">Selected Items:</p>
                      <p className="col-6 mb-0 text-end">
                        {issuedItems.length}
                      </p>
                    </div>
                  </div>

                  <div className="col-4 d-flex flex-column text-font">
                    <div className="row bg-gray font-weight me-2 p-3 d-flex align-items-center justify-content-between">
                      <p className="col-6 font-gray mb-0">Pending Items:</p>
                      <p className="col-6 mb-0 text-end">
                        {issuedItems.length - issuedItems.length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>{" "}
            {/* Button Section */}
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-primary add-btn"
                onClick={handleConfirmReceipt}
              >
                <i className="fa-solid fa-floppy-disk me-1"></i> Confirm Receipt
              </button>
              <button className="btn btn-secondary add-btn me-2" type="button">
                <i className="fa-solid fa-xmark me-1"></i> Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
      {/* Recent Requests Table Section */}
      <div className="margin-2 mx-2">
        <div className="table-container">
          <div className="table-header">
            <h6>Recent Receipts</h6>
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
                    <p className="no-data-text">No Recent Receipts</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProductionFloorReceipt;
