import { Modal } from "bootstrap";
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../services/api";
import { useMemo } from "react";

const Reports = () => {
  const [isShowDetails, setIsShowDetails] = useState(false);
  const [isShowItemDetails, setIsShowItemDetails] = useState(false);
  const [isShowTransactionDetails, setIsShowTransactionDetails] =
    useState(false);
  const [filteredItems, setFilteredItems] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [viewItemsData, setViewItemsData] = useState(null);
  const reportModalRef = useRef(null);
  const itemModalRef = useRef(null);
  const transactionModalRef = useRef(null);
  // Serach and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedIQCStatus, setSelectedIQCStatus] = useState("");

  // Item Modal Search and Filter states
  const [warehouseDetails, setWarehouseDetails] = useState([]);
  const [modalSearchQuery, setModalSearchQuery] = useState("");
  const [modalSortConfig, setModalSortConfig] = useState({
    key: null,
    direction: null,
  });

  // Sorting state
  const [sortConfig, setSortConfig] = useState({
    key: null, // 'name', 'code', or 'type'
    direction: null, // 'asc' or 'desc'
  });

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

  // Sort warehouses based on sortConfig
  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        // Toggle direction
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      } else {
        // Set default to ascending
        return {
          key,
          direction: "asc",
        };
      }
    });
  };

  // Filtered warehouses based on search query
  const filteredWarehouses = useMemo(() => {
    let result = warehouses.filter((w) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        w.name?.toLowerCase().includes(query) ||
        w.code?.toLowerCase().includes(query) ||
        w.type?.toLowerCase().includes(query);

      const matchesLocation = selectedLocation
        ? w.location === selectedLocation
        : true;

      const matchesIQCStatus = selectedIQCStatus
        ? w.iqcStatus === selectedIQCStatus
        : true;

      return matchesSearch && matchesLocation && matchesIQCStatus;
    });

    // Apply sort
    if (sortConfig.key) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key]?.toLowerCase?.() || "";
        const bVal = b[sortConfig.key]?.toLowerCase?.() || "";

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [
    warehouses,
    searchQuery,
    selectedLocation,
    selectedIQCStatus,
    sortConfig,
  ]);

  useEffect(() => {
    setFilteredItems(filteredWarehouses);
  }, [filteredWarehouses]);

  const [warehouseDetail, setWarehouseDetail] = useState([
    {
      id: 1,
      cumulativeValue: "1000",
      itemCode: "10021256",
      itemName: "Item 1",
      quantity: 100,
      iqcStatus: "Ok",
    },
    {
      id: 2,
      cumulativeValue: "5000",
      itemCode: "10054322",
      itemName: "Item 2",
      quantity: 500,
      iqcStatus: "Not Ok",
    },
  ]);

  // Item modal filtering and sorting
  const filteredWarehouseDetails = useMemo(() => {
    let filtered = [...warehouseDetail];

    if (modalSearchQuery) {
      const query = modalSearchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.itemName?.toLowerCase().includes(query) ||
          item.itemCode?.toLowerCase().includes(query) ||
          item.uom?.toLowerCase?.().includes(query)
      );
    }

    if (modalSortConfig.key) {
      filtered.sort((a, b) => {
        const aVal = a[modalSortConfig.key];
        const bVal = b[modalSortConfig.key];

        if (typeof aVal === "string") {
          return modalSortConfig.direction === "asc"
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        } else {
          return modalSortConfig.direction === "asc"
            ? aVal - bVal
            : bVal - aVal;
        }
      });
    }

    return filtered;
  }, [warehouseDetails, modalSearchQuery, modalSortConfig]);

  const handleModalSort = (key) => {
    setModalSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "asc" };
    });
  };

  const [itemDetails, setItemDetails] = useState([
    {
      id: 1,
      itemCode: "10021256",
      itemName: "Item 1",
      transferFrom: "WIP1",
      transferTo: "STR",
      trno: "TR12345",
      quantity: 10,
      unitPrice: "10.00",
      totalPrice: "100.00",
      cumulativeQuantity: 100,
      cumulativeValue: "1000",
    },
    {
      id: 2,
      itemCode: "10021200",
      itemName: "Item 2",
      transferFrom: "STR",
      transferTo: "WIP2",
      trno: "TR12200",
      quantity: 10,
      unitPrice: "50.00",
      totalPrice: "500.00",
      cumulativeQuantity: 500,
      cumulativeValue: "5000",
    },
  ]);

  const [transactionDetails, setTransactionDetails] = useState([
    {
      id: 1,
      orderNo: "10021256",
      seriesNo: "TR12345",
      type: "Transfer",
      itemCode: "10021256",
      itemName: "Item 1",
      status: "Completed",
      quantity: 40,
      unitPrice: "10.00",
      totalPrice: "400.00",
    },
    {
      id: 2,
      orderNo: "10021100",
      seriesNo: "TR12289",
      type: "Transfer",
      itemCode: "10021100",
      itemName: "Item 1",
      status: "Completed",
      quantity: 60,
      unitPrice: "10.00",
      totalPrice: "600.00",
    },
  ]);

  // Fetch warehouse list
  const fetchWarehouses = () => {
    api
      .get("/api/warehouses")
      .then((response) => {
        console.log("Warehouses response:", response.data);
        if (response.data && response.data.status) {
          setWarehouses(response.data.data || []);
        } else {
          console.error(
            "Error fetching warehouses:",
            response.data.message || "Unknown error"
          );
          toast.error(
            "Error in fetching warehouses. Please refresh the page and try again"
          );
        }
      })
      .catch((error) => {
        console.error("Error fetching warehouses:", error);
        toast.error("Error in fetching warehouses. Please try again");
      });
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  // Modal effects
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
    if (!isShowDetails) {
      setModalSearchQuery("");
      setModalSortConfig({ key: null, direction: null });
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
            placeholder="Search by warehouse by name, code, type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filter-options">
          <button
            className="filter-select"
            onClick={() => {
              setSearchQuery("");
              setSelectedLocation("");
              setSelectedIQCStatus("");
              setSortConfig({ key: null, direction: null });
            }}
          >
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
                <th
                  onClick={() => handleSort("name")}
                  style={{ cursor: "pointer" }}
                >
                  Warehouse Name{" "}
                  {sortConfig.key === "name" &&
                    (sortConfig.direction === "asc" ? (
                      <i className="fa-solid fa-sort-up"></i>
                    ) : (
                      <i className="fa-solid fa-sort-down"></i>
                    ))}
                </th>
                <th
                  onClick={() => handleSort("code")}
                  style={{ cursor: "pointer" }}
                >
                  Warehouse Code{" "}
                  {sortConfig.key === "code" &&
                    (sortConfig.direction === "asc" ? (
                      <i className="fa-solid fa-sort-up"></i>
                    ) : (
                      <i className="fa-solid fa-sort-down"></i>
                    ))}
                </th>
                <th
                  onClick={() => handleSort("type")}
                  style={{ cursor: "pointer" }}
                >
                  Warehouse Type{" "}
                  {sortConfig.key === "type" &&
                    (sortConfig.direction === "asc" ? (
                      <i className="fa-solid fa-sort-up"></i>
                    ) : (
                      <i className="fa-solid fa-sort-down"></i>
                    ))}
                </th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody className="text-break">
              {filteredWarehouses.length === 0 ? (
                <tr className="no-data-row">
                  <td colSpan="4" className="no-data-cell">
                    <div className="no-data-content">
                      <i className="fa-solid fa-chart-line no-data-icon"></i>
                      <p className="no-data-text">No audit reports found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredWarehouses.map((w) => (
                  <tr key={w.id}>
                    <td className="ps-4">{w.name}</td>
                    <td className="ps-4">{w.code}</td>
                    <td className="ps-4">{w.type}</td>
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
                  {/* Search and Filter Section */}
                  <div className="search-filter-container mx-2">
                    <div className="search-box">
                      <i className="fas fa-search position-absolute z-0 input-icon"></i>
                      <input
                        type="text"
                        className="form-control mb-2"
                        placeholder="Search by item name, code, or UOM"
                        value={modalSearchQuery}
                        onChange={(e) => setModalSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="filter-options">
                      <button
                        className="filter-select"
                        onClick={() => {
                          setModalSearchQuery("");
                          setModalSortConfig({ key: null, direction: null });
                        }}
                      >
                        <i className="fas fa-filter me-2"></i>
                        Reset Filters
                      </button>
                    </div>
                  </div>
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th
                            onClick={() => handleModalSort("itemName")}
                            style={{ cursor: "pointer" }}
                          >
                            Item Name{" "}
                            {modalSortConfig.key === "itemName" &&
                              (modalSortConfig.direction === "asc" ? "↑" : "↓")}
                          </th>
                          <th
                            onClick={() => handleModalSort("itemCode")}
                            style={{ cursor: "pointer" }}
                          >
                            Item Code{" "}
                            {modalSortConfig.key === "itemCode" &&
                              (modalSortConfig.direction === "asc" ? "↑" : "↓")}
                          </th>
                          <th
                            onClick={() => handleModalSort("quantity")}
                            style={{ cursor: "pointer" }}
                          >
                            Quantity{" "}
                            {modalSortConfig.key === "quantity" &&
                              (modalSortConfig.direction === "asc" ? "↑" : "↓")}
                          </th>
                          <th
                            onClick={() => handleModalSort("cumulativeValue")}
                            style={{ cursor: "pointer" }}
                          >
                            Cumulative Value{" "}
                            {modalSortConfig.key === "cumulativeValue" &&
                              (modalSortConfig.direction === "asc" ? "↑" : "↓")}
                          </th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody className="text-break">
                        {warehouseDetail.length === 0 ? (
                          <tr className="no-data-row">
                            <td colSpan="5" className="no-data-cell">
                              <div className="no-data-content">
                                <i className="fas fa-box no-data-icon"></i>
                                <p className="no-data-text">
                                  No warehouses found
                                </p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          filteredWarehouseDetails.map((warehouseDetail) => (
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
                                  onClick={() => {
                                    setIsShowItemDetails(true);
                                    setViewItemsData(warehouseDetail); // or however you're getting the warehouse's data
                                    setIsShowDetails(true); // show the modal
                                  }}
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
                                <i className="fas fa-box-open no-data-icon"></i>
                                <p className="no-data-text">No items found</p>
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
                                <i className="fas fa-receipt no-data-icon"></i>
                                <p className="no-data-text">
                                  No item transaction found
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
