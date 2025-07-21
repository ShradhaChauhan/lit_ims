import { Modal } from "bootstrap";
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const Reports = () => {
  const [isShowDetails, setIsShowDetails] = useState(false);
  const [isShowItemDetails, setIsShowItemDetails] = useState(false);
  const [isShowTransactionDetails, setIsShowTransactionDetails] =
    useState(false);
  const [filteredItems, setFilteredItems] = useState([]);
  const reportModalRef = useRef(null);
  const itemModalRef = useRef(null);
  const transactionModalRef = useRef(null);
  const [reports, setReports] = useState([
    {
      warehouseName: "Moulding Shop Floor",
      warehouseCode: "ADP-11",
    },
    {
      warehouseName: "FG",
      warehouseCode: "ANT-11",
    },
  ]);

  // Pagination states
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  const [warehouseDetails, setWarehouseDetails] = useState([
    {
      cumulativeValue: "1000",
      itemCode: "10021256",
      itemName: "Item 1",
      quantity: 100,
      iqcStatus: "Ok",
    },
    {
      cumulativeValue: "1500",
      itemCode: "10054322",
      itemName: "Item 2",
      quantity: 500,
      iqcStatus: "Not Ok",
    },
  ]);

  const [itemDetails, setItemDetails] = useState([
    {
      itemCode: "10021256",
      itemName: "Item 1",
      transferFrom: "WIP1",
      transferTo: "STR",
      trno: "TR12345",
      quantity: 100,
      unitPrice: "10.00",
      totalPrice: "1000.00",
      cumulativeQuantity: 100,
      cumulativeValue: "1000",
    },
    {
      itemCode: "10021200",
      itemName: "Item 2",
      transferFrom: "STR",
      transferTo: "WIP2",
      trno: "TR12200",
      quantity: 100,
      unitPrice: "10.00",
      totalPrice: "1000.00",
      cumulativeQuantity: 100,
      cumulativeValue: "1000",
    },
  ]);

  const [transactionDetails, setTransactionDetails] = useState([
    {
      orderNo: "10021256",
      seriesNo: "TR12345",
      type: "Transfer",
      itemCode: "10021256",
      itemName: "Item 1",
      status: "Completed",
      quantity: 100,
      unitPrice: "10.00",
      totalPrice: "1000.00",
    },
    {
      orderNo: "10021100",
      seriesNo: "TR12289",
      type: "Transfer",
      itemCode: "10021100",
      itemName: "Item 1",
      status: "Completed",
      quantity: 200,
      unitPrice: "10.00",
      totalPrice: "2000.00",
    },
  ]);

  useEffect(() => {
    if (isShowDetails && reportModalRef.current) {
      const bsModal = new Modal(reportModalRef.current, {
        backdrop: "static",
      });
      bsModal.show();

      // Optional: hide modal state when it's closed
      reportModalRef.current.addEventListener("hidden.bs.modal", () =>
        setIsShowDetails(false)
      );
    }
  }, [isShowDetails]);

  useEffect(() => {
    if (isShowItemDetails && itemModalRef.current) {
      const bsModal = new Modal(itemModalRef.current, {
        backdrop: "static",
      });
      bsModal.show();

      // Optional: hide modal state when it's closed
      itemModalRef.current.addEventListener("hidden.bs.modal", () =>
        setIsShowItemDetails(false)
      );
    }
  }, [isShowItemDetails]);

  useEffect(() => {
    if (isShowTransactionDetails && transactionModalRef.current) {
      const bsModal = new Modal(transactionModalRef.current, {
        backdrop: "static",
      });
      bsModal.show();

      // Optional: hide modal state when it's closed
      transactionModalRef.current.addEventListener("hidden.bs.modal", () =>
        setIsShowTransactionDetails(false)
      );
    }
  }, [isShowTransactionDetails]);

  // Calculate the display range for the pagination info
  const getDisplayRange = () => {
    const start = (pagination.currentPage - 1) * pagination.itemsPerPage + 1;
    const end = Math.min(start + reports.length - 1, pagination.totalItems);

    if (reports.length === 0) {
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

  return (
    <div>
      {" "}
      {/* Header Section */}
      <nav className="navbar bg-light border-body" data-bs-theme="light">
        <div className="container-fluid">
          <div className="mt-4">
            <h3 className="nav-header header-style">Inventory Audit Report</h3>
            <p className="breadcrumb">
              <Link to="/dashboard">
                <i className="fas fa-home text-8"></i>
              </Link>{" "}
              <span className="ms-1 mt-1 text-small-gray">
                / Inventory Audit Report
              </span>
            </p>
          </div>
        </div>
      </nav>
      {/* Search and Filter Section */}
      <div className="search-filter-container mx-2">
        <div className="search-box">
          <i className="fas fa-search position-absolute z-0 input-icon"></i>
          <input
            type="text"
            className="form-control vendor-search-bar"
            placeholder="Search by warehouse..."
          />
        </div>
        <div className="filter-options">
          <select className="filter-select">
            <option value="">All Locations</option>
            <option value="W1">W1</option>
            <option value="W2">W2</option>
          </select>
          <select className="filter-select">
            <option value="">IQC Status</option>
            <option value="Ok">Ok</option>
            <option value="Not Ok">Not Ok</option>
          </select>

          <button className="filter-select">
            <i className="fas fa-filter me-2"></i>
            Reset Filters
          </button>
        </div>
      </div>
      {/* Table Section */}
      <div className="margin-2 mx-2">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Warehouse Name</th>
                <th>Warehouse Code</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="text-break">
              {reports.length === 0 ? (
                <tr className="no-data-row">
                  <td colSpan="4" className="no-data-cell">
                    <div className="no-data-content">
                      <i className="fa-solid fa-chart-line no-data-icon"></i>
                      <p className="no-data-text">No audit reports found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.id}>
                    <td className="ps-4">
                      <div>
                        <span>{report.warehouseName}</span>
                      </div>
                    </td>
                    <td className="ps-4">
                      <div>
                        <span>{report.warehouseCode}</span>
                      </div>
                    </td>
                    <td className="actions ps-4">
                      <button
                        className="btn-icon btn-primary"
                        title="View Details"
                        onClick={() => setIsShowDetails(true)}
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                    </td>
                  </tr>
                ))
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
      {/* View Warehouse Items Modal */}
      {isShowDetails && (
        <div
          className="modal fade modal-lg"
          ref={reportModalRef}
          id="reportDetailModal"
          tabIndex="-1"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-circle-info me-2"></i>
                  View Items in Warehouse
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <div className="margin-2 mx-2">
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Item Code</th>
                          <th>Item Name</th>
                          <th>Quantity</th>
                          <th>Cumulative Value</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody className="text-break">
                        {warehouseDetails.length === 0 ? (
                          <tr className="no-data-row">
                            <td colSpan="5" className="no-data-cell">
                              <div className="no-data-content">
                                <i className="fas fa-cogs no-data-icon"></i>
                                <p className="no-data-text">No parts found</p>
                                <p className="no-data-subtext">
                                  Click the "Add New Part" button to create your
                                  first part
                                </p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          warehouseDetails.map((warehouseDetail) => (
                            <tr key={warehouseDetail.id}>
                              <td className="ps-4">
                                <div>
                                  <span>{warehouseDetail.itemCode}</span>
                                </div>
                              </td>
                              <td className="ps-4">
                                <div>
                                  <span>{warehouseDetail.itemName}</span>
                                </div>
                              </td>
                              <td className="ps-4">
                                <div>
                                  <span>{warehouseDetail.quantity}</span>
                                </div>
                              </td>
                              <td className="ps-4">
                                <div>
                                  <span>{warehouseDetail.cumulativeValue}</span>
                                </div>
                              </td>
                              <td className="actions ps-4">
                                <button
                                  className="btn-icon btn-primary"
                                  title="View Details"
                                  onClick={() => setIsShowItemDetails(true)}
                                >
                                  <i className="fas fa-eye"></i>
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary add-btn"
                  data-bs-dismiss="modal"
                  onClick={() => {
                    document.activeElement?.blur();
                  }}
                >
                  <i className="fas fa-xmark me-2"></i>Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* View Items Report Modal */}
      {isShowItemDetails && (
        <div
          className="modal fade modal-xl"
          ref={itemModalRef}
          id="itemDetailModal"
          tabIndex="-1"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-circle-info me-2"></i>
                  View Item Report
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <div className="margin-2 mx-2">
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Item Code</th>
                          <th>Item Name</th>
                          <th>Transferred From</th>
                          <th>Transferred To</th>
                          <th>TRNO</th>
                          <th>Quantity</th>
                          <th>Unit Price</th>
                          <th>Total Price</th>
                          <th>Cumulative Quantity</th>
                          <th>Cumulative Value</th>
                        </tr>
                      </thead>
                      <tbody className="text-break">
                        {itemDetails.length === 0 ? (
                          <tr className="no-data-row">
                            <td colSpan="5" className="no-data-cell">
                              <div className="no-data-content">
                                <i className="fas fa-cogs no-data-icon"></i>
                                <p className="no-data-text">No parts found</p>
                                <p className="no-data-subtext">
                                  Click the "Add New Part" button to create your
                                  first part
                                </p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          itemDetails.map((item) => (
                            <tr key={item.id}>
                              <td className="ps-4">
                                <div>
                                  <span>{item.itemCode}</span>
                                </div>
                              </td>
                              <td className="ps-4">
                                <div>
                                  <span>{item.itemName}</span>
                                </div>
                              </td>
                              <td className="ps-4">
                                <div>
                                  <span>{item.transferFrom}</span>
                                </div>
                              </td>
                              <td className="ps-4">
                                <div>
                                  <span>{item.transferTo}</span>
                                </div>
                              </td>
                              <td className="ps-4">
                                <div>
                                  <span>{item.trno}</span>
                                  <button
                                    className="btn-icon btn-primary"
                                    title="View Details"
                                    onClick={() =>
                                      setIsShowTransactionDetails(true)
                                    }
                                  >
                                    <i className="fas fa-eye"></i>
                                  </button>
                                </div>
                              </td>
                              <td className="ps-4">
                                <div>
                                  <span>{item.quantity}</span>
                                </div>
                              </td>
                              <td className="ps-4">
                                <div>
                                  <span>{item.unitPrice}</span>
                                </div>
                              </td>
                              <td className="ps-4">
                                <div>
                                  <span>{item.totalPrice}</span>
                                </div>
                              </td>
                              <td className="ps-4">
                                <div>
                                  <span>{item.cumulativeQuantity}</span>
                                </div>
                              </td>
                              <td className="ps-4">
                                <div>
                                  <span>{item.cumulativeValue}</span>
                                </div>
                              </td>
                              <td className="ps-4">
                                <div>
                                  <span>{item.cumulativeValue}</span>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary add-btn"
                  data-bs-dismiss="modal"
                  onClick={() => {
                    document.activeElement?.blur();
                  }}
                >
                  <i className="fas fa-xmark me-2"></i>Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* View Transactions Report Modal */}
      {isShowTransactionDetails && (
        <div
          className="modal fade modal-xl"
          ref={transactionModalRef}
          id="transactionDetailModal"
          tabIndex="-1"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-circle-info me-2"></i>
                  View Transaction Report
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <div className="margin-2 mx-2">
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Order No.</th>
                          <th>Series No.</th>
                          <th>Type</th>
                          <th>Item Code</th>
                          <th>Item Name</th>
                          <th>Status</th>
                          <th>Quantity</th>
                          <th>Unit Price</th>
                          <th>Total Price</th>
                        </tr>
                      </thead>
                      <tbody className="text-break">
                        {itemDetails.length === 0 ? (
                          <tr className="no-data-row">
                            <td colSpan="5" className="no-data-cell">
                              <div className="no-data-content">
                                <i className="fas fa-cogs no-data-icon"></i>
                                <p className="no-data-text">No parts found</p>
                                <p className="no-data-subtext">
                                  Click the "Add New Part" button to create your
                                  first part
                                </p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          transactionDetails.map((tr) => (
                            <tr key={tr.id}>
                              <td className="ps-4">
                                <div>
                                  <span>{tr.orderNo}</span>
                                </div>
                              </td>
                              <td className="ps-4">
                                <div>
                                  <span>{tr.seriesNo}</span>
                                </div>
                              </td>
                              <td className="ps-4">
                                <div>
                                  <span>{tr.type}</span>
                                </div>
                              </td>
                              <td className="ps-4">
                                <div>
                                  <span>{tr.itemCode}</span>
                                </div>
                              </td>
                              <td className="ps-4">
                                <div>
                                  <span>{tr.itemName}</span>
                                </div>
                              </td>
                              <td className="ps-4">
                                <div>
                                  <span>{tr.status}</span>
                                </div>
                              </td>
                              <td className="ps-4">
                                <div>
                                  <span>{tr.quantity}</span>
                                </div>
                              </td>
                              <td className="ps-4">
                                <div>
                                  <span>{tr.unitPrice}</span>
                                </div>
                              </td>
                              <td className="ps-4">
                                <div>
                                  <span>{tr.totalPrice}</span>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary add-btn"
                  data-bs-dismiss="modal"
                  onClick={() => {
                    document.activeElement?.blur();
                  }}
                >
                  <i className="fas fa-xmark me-2"></i>Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
