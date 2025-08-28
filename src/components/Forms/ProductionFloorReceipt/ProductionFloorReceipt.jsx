import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../../services/api";
import { AppContext } from "../../../context/AppContext";

const ProductionFloorReceipt = () => {
  const [issueNumber, setIssueNumber] = useState("");
  const [issueNoList, setIssueNoList] = useState([]);
  const [issuedItems, setIssuedItems] = useState([]);
  const [selectedIssueNo, setSelectedIssueNo] = useState([]);
  const [recentReceipts, setRecentReceipts] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [issueSummary, setIssueSummary] = useState({
    requisitionNumber: "",
    issueDate: "",
    receiptDate: new Date().toISOString().split("T")[0],
  });
  const [receipts, setReceipts] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  // Pagination states
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  // Calculate the display range for the pagination info
  const getDisplayRange = () => {
    const start = (pagination.currentPage - 1) * pagination.itemsPerPage + 1;
    const end = Math.min(start + receipts.length - 1, pagination.totalItems);

    if (receipts.length === 0) {
      return "0";
    }

    return `${start}-${end}`;
  };

  const handlePageChange = (newPage) => {
    if (
      newPage < 1 ||
      newPage > pagination.totalPages ||
      newPage === pagination.currentPage
    ) {
      return;
    }

    setPagination((prev) => ({
      ...prev,
      currentPage: newPage,
    }));

    // fetch reports will be called by the useEffect that depends on currentPage
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const totalPages = pagination.totalPages;
    const currentPage = pagination.currentPage;

    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 3) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }

    if (currentPage >= totalPages - 2) {
      return [
        1,
        "...",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [
      1,
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      totalPages,
    ];
  };

  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = parseInt(e.target.value);

    setPagination((prev) => ({
      ...prev,
      itemsPerPage: newItemsPerPage,
      currentPage: 1, // Reset to first page when changing items per page
    }));

    // fetchItems will be called by the useEffect that depends on itemsPerPage
  };

  // Auto generate transaction number
  const generateTransactionNumber = () => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `RCP-${year}-${randomNum}`;
  };

  const [transactionNumber, setTransactionNumber] = useState(
    generateTransactionNumber()
  );

  // Fetch Recent Receipts
  const fetchRecentReceipts = async () => {
    try {
      const response = await api.get("/api/production-receipt/table");
      console.log(response.data.data);
      setRecentReceipts(response.data.data);
    } catch (error) {
      toast.error("Error in fetching recent receipts");
      console.error("Error fetching recent receipts:", error);
    }
  };

  useEffect(() => {
    fetchRecentReceipts();
  }, []);

  // Fetch issue number list
  const fetchIssueNoList = async () => {
    try {
      const response = await api.get("/api/issue-production/all-issue-numbers");
      setIssueNoList(response.data.data.map((issueNo) => ({ issueNo })));
    } catch (error) {
      toast.error("Error in fetching issue number list");
      console.error("Error fetching issue number list:", error);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchIssueNoList();
  }, []);

  const handleIssueNumberChange = async (e) => {
    const selectedIssueNumber = e.target.value;
    setIssueNumber(selectedIssueNumber);

    if (selectedIssueNumber) {
      try {
        // Fetch issue summary data
        const summaryResponse = await api.get(
          `/api/issue-production/summary-by-issue?issueNumber=${selectedIssueNumber}`
        );
        const summaryData = summaryResponse.data.data;

        // Update issue summary state
        setIssueSummary({
          requisitionNumber: summaryData.requisitionNumber,
          issueDate: formatDateFromString(summaryData.issueDate),
          receiptDate: new Date().toISOString().split("T")[0],
        });

        // Process items data - each batch number is a separate item
        const processedItems = summaryData.items.map((item) => ({
          id: item.id, // Use the id from the API response
          itemCode: item.itemCode,
          itemName: item.itemName,
          issuedQty: item.totalIssued,
          batchNumber: item.batchNumber,
          requestedQuantity: item.requestedQuantity,
          receivedQty: "",
          variance: -item.totalIssued,
          notes: "",
        }));

        setIssuedItems(processedItems);

        // Don't select items by default
        setSelectedIssueNo([]);
        setSelectAll(false);
      } catch (error) {
        toast.error("Error in fetching issue summary");
        console.error("Error fetching issue summary:", error);
        setIssuedItems([]);
        setIssueSummary({
          requisitionNumber: "",
          issueDate: "",
          receiptDate: new Date().toISOString().split("T")[0],
        });
      }
    }
  };

  // Helper function to format date from string like "12/07/2025 12:11 pm"
  const formatDateFromString = (dateString) => {
    try {
      if (!dateString) return "";

      const parts = dateString.split(" ")[0].split("/");
      if (parts.length !== 3) return "";

      // Format as YYYY-MM-DD for input date field
      return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(
        2,
        "0"
      )}`;
    } catch (error) {
      console.error("Error formatting date:", error);
      return "";
    }
  };

  // Handle received quantity change
  const handleReceivedQtyChange = (id, value) => {
    const numValue = value === "" ? "" : parseFloat(value) || 0;

    setIssuedItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id) {
          const variance =
            numValue === "" ? -item.issuedQty : numValue - item.issuedQty;
          return { ...item, receivedQty: numValue, variance };
        }
        return item;
      })
    );
  };

  // Handle notes change
  const handleNotesChange = (id, value) => {
    setIssuedItems((prevItems) =>
      prevItems.map((item) => {
        if (item.id === id) {
          return { ...item, notes: value };
        }
        return item;
      })
    );
  };

  // Checkbox select all function
  const handleSelectAllChange = (e) => {
    const checked = e.target.checked;
    setSelectAll(checked);
    if (checked) {
      const allIssueNoIds = issuedItems.map((item) => item.id);
      setSelectedIssueNo(allIssueNoIds);
    } else {
      setSelectedIssueNo([]);
    }
  };

  // Single checkbox function
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
    setIssuedItems([]);
    setIssueNumber("");
    setIssueSummary({
      requisitionNumber: "",
      issueDate: "",
      receiptDate: new Date().toISOString().split("T")[0],
    });
    setSelectedIssueNo([]);
    setSelectAll(false);
    setTransactionNumber(generateTransactionNumber());
  };

  // Function to save confirmed receipt
  const handleConfirmReceipt = async (e) => {
    e.preventDefault();

    // Filter only selected items
    const selectedItems = issuedItems.filter((item) =>
      selectedIssueNo.includes(item.id)
    );

    if (selectedItems.length === 0) {
      toast.warning("Please select at least one item to confirm receipt");
      return;
    }

    // Check if all selected items have received quantities
    const missingReceivedQty = selectedItems.some(
      (item) => item.receivedQty === "" || item.receivedQty === null
    );

    if (missingReceivedQty) {
      toast.warning("Please enter received quantity for all selected items");
      return;
    }

    // Format dates to YYYY-MM-DD
    const formatDateToYYYYMMDD = (dateString) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toISOString().split("T")[0];
    };

    const finalData = {
      transactionNumber,
      issueNumber,
      requisitionNumber: issueSummary.requisitionNumber,
      issueDate: formatDateToYYYYMMDD(issueSummary.issueDate),
      receiptDate: formatDateToYYYYMMDD(issueSummary.receiptDate),
      items: selectedItems.map((item) => ({
        id: item.id,
        itemCode: item.itemCode,
        itemName: item.itemName,
        batchNumber: item.batchNumber,
        issuedQty: parseFloat(item.issuedQty) || 0,
        receivedQty: parseFloat(item.receivedQty) || 0,
        variance: parseFloat(item.variance) || 0,
        notes: item.notes || "",
      })),
    };

    try {
      console.log("Confirming receipt with data:", finalData);
      const response = await api.post(
        "/api/production-receipt/confirm",
        finalData
      );
      console.log("Successfully confirmed the receipt: ", response.data);
      toast.success("Successfully confirmed the receipt");
      // Reset form after successful submission
      handleReset(e);
      // Refresh the issue number list
      fetchIssueNoList();
      fetchRecentReceipts();
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

      console.error("Error confirming the receipt:", errorMessage);
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
            <h3 className="nav-header header-style">Material Receipt</h3>
            <p className="breadcrumb">
              <Link to="/dashboard">
                <i className="fas fa-home text-8"></i>
              </Link>{" "}
              <span className="ms-1 mt-1 text-small-gray">
                / Transactions / Material Receipt
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
                  Issue Number <span className="text-danger fs-6">*</span>
                </label>
                <div className="position-relative w-100">
                  <i className="fas fa-dolly position-absolute z-0 input-icon"></i>
                  <select
                    className={`form-select ps-5 text-font ${
                      issueNumber ? "" : "text-secondary"
                    }`}
                    id="issueNumber"
                    value={issueNumber}
                    onChange={handleIssueNumberChange}
                  >
                    <option value="" disabled hidden className="text-muted">
                      Select Issue Transaction
                    </option>
                    {issueNoList.length === 0 && (
                      <option value="NaN" disabled>
                        Nothing to issue
                      </option>
                    )}
                    {issueNoList.map((issueNo) => (
                      <option key={issueNo.issueNo} value={issueNo.issueNo}>
                        {issueNo.issueNo}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="col-3 d-flex flex-column form-group">
                <label htmlFor="issueDate" className="form-label">
                  Issue Date <span className="text-danger fs-6">*</span>
                </label>
                <div className="position-relative w-100">
                  <i className="fas fa-calendar position-absolute z-0 input-icon"></i>
                  <input
                    type="date"
                    className="form-control ps-5 text-font"
                    id="issueDate"
                    value={issueSummary.issueDate}
                    placeholder="Issue Date"
                    disabled
                  />
                </div>
              </div>
              <div className="col-3 d-flex flex-column form-group">
                <label htmlFor="requisitionNumber" className="form-label">
                  Requisition Number <span className="text-danger fs-6">*</span>
                </label>
                <div className="position-relative w-100">
                  <i className="fas fa-file-invoice position-absolute z-0 input-icon"></i>
                  <input
                    type="text"
                    className="form-control ps-5 text-font"
                    id="requisitionNumber"
                    value={issueSummary.requisitionNumber}
                    placeholder="Requisition Number"
                    disabled
                  />
                </div>
              </div>
              <div className="col-3 d-flex flex-column form-group">
                <label htmlFor="receiptDate" className="form-label">
                  Receipt Date <span className="text-danger fs-6">*</span>
                </label>
                <div className="position-relative w-100">
                  <i className="fas fa-calendar position-absolute z-0 input-icon"></i>
                  <input
                    type="date"
                    className="form-control ps-5 text-font"
                    id="receiptDate"
                    value={issueSummary.receiptDate}
                    onChange={(e) =>
                      setIssueSummary({
                        ...issueSummary,
                        receiptDate: e.target.value,
                      })
                    }
                    placeholder="Receipt Date"
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
                      {selectedIssueNo.length} Selected
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
                      <th>Batch Number</th>
                      <th>Requested Qty</th>
                      <th>Issued Qty</th>
                      <th>Received Qty</th>
                      <th>Variance</th>
                      <th>Notes</th>
                    </tr>
                  </thead>
                  <tbody className="text-break">
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
                      issuedItems.map((issuedItem) => (
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
                              <span>
                                {"(" +
                                  issuedItem.itemCode +
                                  ") - " +
                                  issuedItem.itemName}
                              </span>
                            </div>
                          </td>
                          <td className="ps-4">
                            <div>
                              <span>{issuedItem.batchNumber}</span>
                            </div>
                          </td>
                          <td className="ps-4">
                            <div>
                              <span>{issuedItem.requestedQuantity}</span>
                            </div>
                          </td>
                          <td className="ps-4">
                            <div>
                              <span>{issuedItem.issuedQty}</span>
                            </div>
                          </td>
                          <td className="ps-4">
                            <div className="position-relative w-100">
                              <input
                                type="number"
                                className="form-control text-font"
                                value={issuedItem.receivedQty}
                                placeholder="Enter qty"
                                onChange={(e) =>
                                  handleReceivedQtyChange(
                                    issuedItem.id,
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          </td>
                          <td className="ps-4">
                            <div>
                              <span>{issuedItem.variance}</span>
                            </div>
                          </td>
                          <td className="ps-4">
                            <div className="position-relative w-100">
                              <input
                                type="text"
                                className="form-control text-font"
                                value={issuedItem.notes || ""}
                                placeholder="Add notes"
                                onChange={(e) =>
                                  handleNotesChange(
                                    issuedItem.id,
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          </td>
                        </tr>
                      ))
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
                        {selectedIssueNo.length}
                      </p>
                    </div>
                  </div>

                  <div className="col-4 d-flex flex-column text-font">
                    <div className="row bg-gray font-weight me-2 p-3 d-flex align-items-center justify-content-between">
                      <p className="col-6 font-gray mb-0">Pending Items:</p>
                      <p className="col-6 mb-0 text-end">
                        {issuedItems.length - selectedIssueNo.length}
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
                disabled={selectedIssueNo.length === 0}
              >
                <i className="fa-solid fa-floppy-disk me-1"></i> Confirm Receipt
              </button>

              <button
                className="btn btn-secondary add-btn me-2"
                type="button"
                onClick={handleReset}
              >
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
              {recentReceipts.length > 0 ? (
                recentReceipts.map((r, index) => (
                  <tr key={index}>
                    <td className="ps-4">
                      <div>
                        <span>{r.transactionNumber}</span>
                      </div>
                    </td>
                    <td className="ps-4">
                      <div>
                        <span>{r.receiptDate}</span>
                      </div>
                    </td>
                    <td className="ps-4">
                      <div>
                        <span>{r.type}</span>
                      </div>
                    </td>
                    <td className="ps-4">
                      <ul className="mb-0 ps-3">
                        {r.items.map((item, index) => (
                          <li key={index}>
                            {"(" + item.itemCode + ") "} {item.itemName}
                          </li>
                        ))}
                      </ul>
                    </td>

                    <td className="ps-3">
                      <span
                        className={`badge status ${
                          r.status.toLowerCase() === "completed"
                            ? "active"
                            : "inactive"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="no-data-row">
                  <td colSpan="5" className="no-data-cell">
                    <div className="no-data-content">
                      <i className="fas fa-clock-rotate-left no-data-icon"></i>
                      <p className="no-data-text">No Recent Receipts</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {/* Pagination */}
          <div className="pagination-container">
            <div className="pagination-info">
              Showing {getDisplayRange()} of {filteredItems.length} entries
            </div>
            <div className="pagination">
              <button
                className="btn-page"
                disabled={pagination.currentPage === 1}
                onClick={() => handlePageChange(pagination.currentPage - 1)}
              >
                <i className="fas fa-chevron-left"></i>
              </button>

              {getPageNumbers().map((page, index) =>
                page === "..." ? (
                  <span
                    key={`ellipsis-${index}`}
                    className="pagination-ellipsis"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    className={`btn-page ${
                      pagination.currentPage === page ? "active" : ""
                    }`}
                    onClick={() => handlePageChange(page)}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                className="btn-page"
                disabled={pagination.currentPage === pagination.totalPages}
                onClick={() => handlePageChange(pagination.currentPage + 1)}
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
            <div className="items-per-page">
              <select
                value={pagination.itemsPerPage}
                onChange={handleItemsPerPageChange}
              >
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

export default ProductionFloorReceipt;
