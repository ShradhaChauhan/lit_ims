import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../../services/api";

const WIPReturn = () => {
  const [warehouseList, setWarehouseList] = useState([]);
  const [order, setOrder] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState("");
  const [warehouse, setWarehouse] = useState("");
  const [workOrders, setWorkOrders] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [recentReceipts, setRecentReceipts] = useState([]);
  const [returnItems, setReturnItems] = useState([]);
  const [returnQty, setReturnQty] = useState("");
  const [reason, setReason] = useState("");
  // Pagination states
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  const fetchWarehouseList = async () => {
    try {
      const response = await api.get("/api/warehouses/wip");
      console.log("Warehouse list response:", response.data.data);
      setWarehouseList(response.data.data);
    } catch (error) {
      console.error("Error fetching warehouse list:", error);
      toast.error("Error fetching warehouse list");
    }
  };

  useEffect(() => {
    // Fetch warehouse list on component mount
    fetchWarehouseList();
  }, []);

  // Calculate the display range for the pagination info
  const getDisplayRange = () => {
    const start = (pagination.currentPage - 1) * pagination.itemsPerPage + 1;
    const end = Math.min(start + workOrders.length - 1, pagination.totalItems);

    if (workOrders.length === 0) {
      return "0";
    }

    return `${start}-${end}`;
  };

  // Fetch Recent Receipts
  const fetchRecentReceipts = async () => {
    try {
      const response = await api.get("/api/production-receipt/receipts");
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

  const getReceiptItems = async (id) => {
    try {
      console.log("id: " + id);
      const response = await api.get(
        `/api/production-receipt/receipts/${id}/items`
      );
      console.log(response.data.data);
      setReturnItems(response.data.data);
    } catch (error) {
      toast.error("Error in fetching receipt items");
      console.error("Error fetching receipt items:", error);
    }
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
    return `WIP-${year}-${randomNum}`;
  };

  const [transactionNumber, setTransactionNumber] = useState(
    generateTransactionNumber()
  );

  const deleteReturnItem = (itemCode) => {
    const updatedItems = returnItems.filter(
      (item) => item.itemCode !== itemCode
    );
    setReturnItems(updatedItems);
  };

  const processReturn = async () => {
    try {
      // Call api for approval here
    } catch (error) {
      toast.error("Error in sending request for approval");
      console.error(error);
    }
  };

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
                  Work Order <span className="text-danger fs-6">*</span>
                </label>
                <div className="position-relative w-100">
                  <i className="fas fa-file-lines ms-2 position-absolute z-0 input-icon"></i>
                  <select
                    className={`form-select ps-5 ms-2 text-font ${
                      order === "" ? "text-muted" : ""
                    }`}
                    id="workOrder"
                    value={order}
                    onChange={(e) => {
                      setOrder(e.target.value);
                      getReceiptItems(e.target.value);
                    }}
                  >
                    <option value="" className="text-muted">
                      Select Work Order
                    </option>
                    {recentReceipts.map((r, index) => (
                      <option key={index} value={r.id}>
                        {r.transactionNumber}
                      </option>
                    ))}
                  </select>
                  {/* <i className="fa-solid fa-angle-down position-absolute down-arrow-icon"></i> */}
                </div>
              </div>
              <div className="col-3 d-flex flex-column form-group">
                <label htmlFor="shift" className="form-label">
                  Return Type <span className="text-danger fs-6">*</span>
                </label>
                <div className="position-relative w-100">
                  <i className="fas fa-tags ms-2 position-absolute z-0 input-icon"></i>
                  <select
                    className={`form-select ps-5 ms-2 text-font ${
                      type === "" ? "text-muted" : ""
                    }`}
                    id="shift"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
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
                  {/* <i className="fa-solid fa-angle-down position-absolute down-arrow-icon"></i> */}
                </div>
              </div>
              <div className="col-3 d-flex flex-column form-group">
                <label htmlFor="date" className="form-label">
                  Return Date <span className="text-danger fs-6">*</span>
                </label>
                <div className="position-relative w-100">
                  <i className="fas fa-calendar ms-2 position-absolute z-0 input-icon"></i>
                  <input
                    type="date"
                    id="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={`form-select ps-5 ms-2 text-font ${
                      date === "" ? "text-muted" : ""
                    }`}
                  />
                </div>
              </div>
              <div className="col-3 d-flex flex-column form-group">
                <label htmlFor="warehouse" className="form-label ms-1">
                  Your Warehouse <span className="text-danger fs-6">*</span>
                </label>
                <div className="position-relative w-100">
                  <i className="fas fa-warehouse ms-2 position-absolute z-0 input-icon text-font"></i>
                  <select
                    className={`form-select ps-5 ms-2 text-font ${
                      warehouse === "" ? "text-muted" : ""
                    }`}
                    id="warehouse"
                    value={warehouse}
                    onChange={(e) => setWarehouse(e.target.value)}
                  >
                    <option value="" disabled hidden>
                      Select Your Warehouse
                    </option>
                    {warehouseList.map((w) => (
                      <option value={w.id} key={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
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
                      <th>Return Reason</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-break">
                    {returnItems.length === 0 ? (
                      <tr className="no-data-row">
                        <td colSpan="6" className="no-data-cell">
                          <div className="no-data-content">
                            <i className="fas fa-rotate-left no-data-icon"></i>
                            <p className="no-data-text">No Items Added</p>
                            <p className="no-data-subtext">
                              Select a work order to add return items
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      returnItems.map((r, index) => (
                        <tr key={index}>
                          <td className="ps-4">
                            <div>
                              <input
                                type="text"
                                className="form-control text-font w-100"
                                disabled
                                value={r.itemName}
                              />
                            </div>
                          </td>
                          <td className="ps-4">
                            <div>
                              <input
                                type="text"
                                className="form-control text-font w-100"
                                disabled
                                value={r.batchNumber}
                              />
                            </div>
                          </td>
                          <td className="ps-4">
                            <div>
                              <input
                                type="text"
                                className="form-control text-font w-100"
                                disabled
                                value={r.receivedQuantity}
                              />
                            </div>
                          </td>
                          <td className="ps-4">
                            <div>
                              <input
                                type="text"
                                className="form-control text-font w-100"
                                value={returnQty}
                                placeholder="Return Qty"
                                onChange={(e) => setReturnQty(e.target.value)}
                              />
                            </div>
                          </td>
                          <td className="ps-4">
                            <div>
                              <input
                                type="text"
                                className="form-control text-font w-100"
                                placeholder="Reason"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                              />
                            </div>
                          </td>
                          <td className="actions ps-4">
                            <button
                              type="button"
                              className="btn-icon btn-danger"
                              title="View Details"
                              onClick={(e) => {
                                e.preventDefault();
                                deleteReturnItem(r.itemCode);
                              }}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>{" "}
            {/* Button Section */}
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-primary add-btn"
                // onClick={processReturn()}
              >
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
                  <tbody className="text-break">
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
                {/* Pagination */}
                <div className="pagination-container">
                  <div className="pagination-info">
                    Showing {getDisplayRange()} of {filteredItems.length}{" "}
                    entries
                  </div>
                  <div className="pagination">
                    <button
                      className="btn-page"
                      disabled={pagination.currentPage === 1}
                      onClick={() =>
                        handlePageChange(pagination.currentPage - 1)
                      }
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
                      disabled={
                        pagination.currentPage === pagination.totalPages
                      }
                      onClick={() =>
                        handlePageChange(pagination.currentPage + 1)
                      }
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
            </div>{" "}
          </div>
        </form>
      </div>
    </div>
  );
};

export default WIPReturn;
