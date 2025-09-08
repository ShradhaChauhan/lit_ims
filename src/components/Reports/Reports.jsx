import { Modal } from "bootstrap";
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../services/api";
import { useMemo } from "react";
import exportToExcel from "../../utils/exportToExcel";
import "./Reports";

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

  // View toggle state (warehouse-wise or item-wise)
  const [viewMode, setViewMode] = useState("warehouse"); // 'warehouse' or 'item'

  // Item-wise report states
  const [items, setItems] = useState([]);
  const [filteredItemsReport, setFilteredItemsReport] = useState([]);
  const [itemSearchQuery, setItemSearchQuery] = useState("");
  const [itemSortConfig, setItemSortConfig] = useState({
    key: null,
    direction: null,
  });

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

  // Item Report Modal Search and Filter states
  const [modalItemSearchQuery, setModalItemSearchQuery] = useState("");
  const [modalItemSortConfig, setModalItemSortConfig] = useState({
    key: null,
    direction: null,
  });

  // Transaction Report Modal Search and Filter states
  const [modalTransactionSearchQuery, setModalTransactionSearchQuery] =
    useState("");
  const [modalTransactionSortConfig, setModalTransactionSortConfig] = useState({
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

  // Sort items based on itemSortConfig
  const handleItemSort = (key) => {
    setItemSortConfig((prev) => {
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

  // Unmount backdrop
  useEffect(() => {
    return () => {
      // Force-remove bootstrap modal backdrop if stuck
      const backdrops = document.querySelectorAll(".modal-backdrop");
      backdrops.forEach((bd) => bd.remove());
      document.body.classList.remove("modal-open");
      document.body.style.overflow = "";
    };
  }, []);

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

  const [warehouseDetail, setWarehouseDetail] = useState([]);

  // Item history state for Item History modal
  const [itemHistory, setItemHistory] = useState([]);

  const [transactionDetails, setTransactionDetails] = useState([
    {
      id: 1,
      orderNo: "10021256",
      seriesNo: "TR12345",
      type: "Item",
      itemCode: "10021256",
      itemName: "Item 1",
      status: "Completed",
      quantity: 40,
      unitPrice: "10.00",
      totalPrice: "400.00",
    },
  ]);

  // Fetch Items in warehouse
  const fetchWarehouseItems = async (warehouseId) => {
    try {
      setIsShowDetails(false); // close modal if open
      setWarehouseDetail([]); // clear old data

      const response = await api.get(`/api/inventory/warehouse/${warehouseId}`);
      const data = response.data.data;
      console.log("WarehouseDetail: " + JSON.stringify(data));
      setWarehouseDetail(data);

      // Open modal after data is set
      setTimeout(() => {
        setIsShowDetails(true);
      }, 50); // give React enough time to re-render
    } catch (error) {
      toast.error("Error in fetching types");
      console.error("Error fetching types:", error);
    }
  };

  useEffect(() => {
    if (warehouseDetail.length > 0) {
      setIsShowDetails(true);
    }
  }, [warehouseDetail]);

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
  }, [warehouseDetail, modalSearchQuery, modalSortConfig]);

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

  // Item Report modal filtering and sorting (now uses itemHistory)
  const filteredItemsDetails = useMemo(() => {
    let filtered = [...itemHistory];

    if (modalItemSearchQuery) {
      const query = modalItemSearchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.itemName?.toLowerCase().includes(query) ||
          item.itemCode?.toLowerCase().includes(query) ||
          item.sourceWarehouseName?.toLowerCase?.().includes(query) ||
          item.targetWarehouseName?.toLowerCase?.().includes(query)
      );
    }

    if (modalItemSortConfig.key) {
      filtered.sort((a, b) => {
        const aVal = a[modalItemSortConfig.key];
        const bVal = b[modalItemSortConfig.key];

        if (typeof aVal === "string") {
          return modalItemSortConfig.direction === "asc"
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        } else {
          return modalItemSortConfig.direction === "asc"
            ? aVal - bVal
            : bVal - aVal;
        }
      });
    }

    return filtered;
  }, [itemHistory, modalItemSearchQuery, modalItemSortConfig]);

  const handleModalItemSort = (key) => {
    setModalItemSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "asc" };
    });
  };

  // Transaction Report modal filtering and sorting
  const filteredTransactionDetails = useMemo(() => {
    let filtered = [...transactionDetails];

    if (modalTransactionSearchQuery) {
      const query = modalTransactionSearchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.orderNo?.toLowerCase().includes(query) ||
          item.seriesNo?.toLowerCase().includes(query) ||
          item.type?.toLowerCase().includes(query) ||
          item.itemName?.toLowerCase().includes(query) ||
          item.itemCode?.toLowerCase().includes(query)
      );
    }

    if (modalTransactionSortConfig.key) {
      filtered.sort((a, b) => {
        const aVal = a[modalTransactionSortConfig.key];
        const bVal = b[modalTransactionSortConfig.key];

        if (typeof aVal === "string") {
          return modalTransactionSortConfig.direction === "asc"
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        } else {
          return modalTransactionSortConfig.direction === "asc"
            ? aVal - bVal
            : bVal - aVal;
        }
      });
    }

    return filtered;
  }, [
    transactionDetails,
    modalTransactionSearchQuery,
    modalTransactionSortConfig,
  ]);

  const handleModalTransactionSort = (key) => {
    setModalTransactionSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "asc" };
    });
  };

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

  // Fetch all items for item-wise report
  const fetchAllItems = () => {
    api
      .get("/api/inventory/items")
      .then((response) => {
        if (response.data && response.data.status) {
          setItems(response.data.data || []);
        } else {
          console.error(
            "Error fetching items:",
            response.data.message || "Unknown error"
          );
          toast.error(
            "Error in fetching items. Please refresh the page and try again"
          );
        }
      })
      .catch((error) => {
        console.error("Error fetching items:", error);
        toast.error("Error in fetching items. Please try again");
      });
  };

  useEffect(() => {
    fetchWarehouses();
    fetchAllItems();
  }, []);

  // Filtered items for item-wise report
  const filteredItems_Report = useMemo(() => {
    let result = items.filter((item) => {
      const query = itemSearchQuery.toLowerCase();
      const matchesSearch =
        item.name?.toLowerCase().includes(query) ||
        item.code?.toLowerCase().includes(query) ||
        item.uom?.toLowerCase().includes(query);

      return matchesSearch;
    });

    // Apply sort
    if (itemSortConfig.key) {
      result.sort((a, b) => {
        const aVal = a[itemSortConfig.key]?.toLowerCase?.() || "";
        const bVal = b[itemSortConfig.key]?.toLowerCase?.() || "";

        if (aVal < bVal) return itemSortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return itemSortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [items, itemSearchQuery, itemSortConfig]);

  useEffect(() => {
    setFilteredItemsReport(filteredItems_Report);
  }, [filteredItems_Report]);

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

  // Reset search and sort when view mode changes
  useEffect(() => {
    if (viewMode === "warehouse") {
      setItemSearchQuery("");
      setItemSortConfig({ key: null, direction: null });
    } else {
      setSearchQuery("");
      setSortConfig({ key: null, direction: null });
    }
  }, [viewMode]);

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
    const currentData =
      viewMode === "warehouse" ? filteredWarehouses : filteredItemsReport;
    const start = (pagination.currentPage - 1) * pagination.itemsPerPage + 1;
    const end = Math.min(start + currentData.length - 1, pagination.totalItems);

    if (currentData.length === 0) {
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

  // Fetch item history when opening Item History modal
  const handleOpenItemHistory = (itemData) => {
    setIsShowItemDetails(true);
    setViewItemsData(itemData);

    // If coming from warehouse view, keep isShowDetails true
    // If coming from item view, we need to explicitly set it
    if (viewMode === "item") {
      setIsShowDetails(true);
    }

    // Fetch item history from API
    api
      .post("/api/warehouse-transfer-logs/filter", {
        itemCode: itemData.itemCode || itemData.code,
        sourceWarehouseId:
          itemData.warehouseId || itemData.sourceWarehouseId || itemData.id,
      })
      .then((response) => {
        if (response.data && response.data.status) {
          setItemHistory(response.data.data || []);
        } else {
          setItemHistory([]);
        }
      })
      .catch(() => {
        setItemHistory([]);
      });
  };

  // Export warehouse data to Excel
  const handleExportWarehouseReport = () => {
    if (filteredWarehouses.length === 0) {
      toast.warning("No data available to export!");
      return;
    }

    // Format warehouse data for export
    const exportData = filteredWarehouses.map((warehouse) => ({
      "Warehouse Name": warehouse.name,
      "Warehouse Code": warehouse.code,
      "Warehouse Type": warehouse.type,
      Location: warehouse.location || "N/A",
    }));

    exportToExcel(exportData, "Warehouse_Audit_Report");
  };

  // Export item data to Excel
  const handleExportItemReport = () => {
    if (filteredItemsReport.length === 0) {
      toast.warning("No data available to export!");
      return;
    }

    // Format item data for export
    const exportData = filteredItemsReport.map((item) => ({
      "Item Name": item.name,
      "Item Code": item.code,
      UOM: item.uom || "N/A",
      "Total Stock": item.totalStock || 0,
    }));

    exportToExcel(exportData, "Item_Audit_Report");
  };

  // Export item history data to Excel
  const handleExportItemHistoryReport = () => {
    if (itemHistory.length === 0) {
      toast.warning("No item history data available to export!");
      return;
    }

    // Format item history data for export
    const exportData = itemHistory.map((item) => ({
      "TR No": item.trNo,
      Date: item.transferredAt
        ? new Date(item.transferredAt).toLocaleString()
        : "N/A",
      "Item Code": item.itemCode,
      "Item Name": item.itemName,
      "Transferred From": item.sourceWarehouseName,
      "Transferred To": item.targetWarehouseName,
      Quantity: item.quantity,
      "Transferred By": item.transferredBy,
      Status: "Complete",
    }));

    exportToExcel(
      exportData,
      `Item_History_${
        viewItemsData?.itemCode || viewItemsData?.code || "Report"
      }`
    );
  };

  return (
    <div>
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

      {/* View Mode Toggle - Enhanced Premium Design */}
      <div className="mx-2 mt-4 mb-4">
        <div
          className="premium-tabs-container"
          style={{
            display: "flex",
            borderBottom: "1px solid #dee2e6",
            marginBottom: "15px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          <div
            className={`premium-tab ${
              viewMode === "warehouse" ? "active" : ""
            }`}
            onClick={() => setViewMode("warehouse")}
            style={{
              padding: "14px 25px",
              cursor: "pointer",
              fontWeight: viewMode === "warehouse" ? "600" : "500",
              borderBottom:
                viewMode === "warehouse" ? "3px solid #007bff" : "none",
              color: viewMode === "warehouse" ? "#007bff" : "#495057",
              transition: "all 0.3s ease",
              marginRight: "10px",
              fontSize: "15px",
              display: "flex",
              alignItems: "center",
              backgroundColor:
                viewMode === "warehouse" ? "#f8f9fa" : "transparent",
            }}
          >
            <i
              className="fas fa-warehouse me-2"
              style={{ fontSize: "16px" }}
            ></i>
            Warehouse-wise Report
          </div>
          <div
            className={`premium-tab ${viewMode === "item" ? "active" : ""}`}
            onClick={() => setViewMode("item")}
            style={{
              padding: "14px 25px",
              cursor: "pointer",
              fontWeight: viewMode === "item" ? "600" : "500",
              borderBottom: viewMode === "item" ? "3px solid #007bff" : "none",
              color: viewMode === "item" ? "#007bff" : "#495057",
              transition: "all 0.3s ease",
              fontSize: "15px",
              display: "flex",
              alignItems: "center",
              backgroundColor: viewMode === "item" ? "#f8f9fa" : "transparent",
            }}
          >
            <i className="fas fa-box me-2" style={{ fontSize: "16px" }}></i>
            Item-wise Report
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="search-filter-container mx-2">
        <div className="search-box text-8">
          <i className="fas fa-search position-absolute z-0 input-icon"></i>
          {viewMode === "warehouse" ? (
            <input
              type="text"
              className="form-control vendor-search-bar"
              placeholder="Search by warehouse by name, code, type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          ) : (
            <input
              type="text"
              className="form-control vendor-search-bar"
              placeholder="Search by item name, code, UOM..."
              value={itemSearchQuery}
              onChange={(e) => setItemSearchQuery(e.target.value)}
            />
          )}
        </div>
        <div className="filter-options d-flex">
          <button
            className="btn btn-outline-secondary text-8 me-2"
            onClick={() => {
              if (viewMode === "warehouse") {
                setSearchQuery("");
                setSelectedLocation("");
                setSelectedIQCStatus("");
                setSortConfig({ key: null, direction: null });
              } else {
                setItemSearchQuery("");
                setItemSortConfig({ key: null, direction: null });
              }
            }}
          >
            <i className="fas fa-filter me-2"></i>
            Reset Filters
          </button>

          {/* Export to Excel Button */}
          <button
            className="btn btn-outline-success text-8"
            onClick={
              viewMode === "warehouse"
                ? handleExportWarehouseReport
                : handleExportItemReport
            }
          >
            <i className="fas fa-file-excel me-2"></i>
            Export to Excel
          </button>
        </div>
      </div>
      {/* Table Section */}
      <div className="margin-2 mx-2">
        <div className="table-container">
          {viewMode === "warehouse" ? (
            <table>
              <thead>
                <tr>
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
                      <td className="ps-4">{w.code}</td>
                      <td className="ps-4">{w.name}</td>
                      <td className="ps-4">{w.type}</td>
                      <td className="actions ps-4">
                        <button
                          className="btn-icon view"
                          title="View Details"
                          onClick={() => fetchWarehouseItems(w.id)}
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table>
              <thead>
                <tr>
                  <th
                    onClick={() => handleItemSort("name")}
                    style={{ cursor: "pointer" }}
                  >
                    Item Name{" "}
                    {itemSortConfig.key === "name" &&
                      (itemSortConfig.direction === "asc" ? (
                        <i className="fa-solid fa-sort-up"></i>
                      ) : (
                        <i className="fa-solid fa-sort-down"></i>
                      ))}
                  </th>
                  <th
                    onClick={() => handleItemSort("code")}
                    style={{ cursor: "pointer" }}
                  >
                    Item Code{" "}
                    {itemSortConfig.key === "code" &&
                      (itemSortConfig.direction === "asc" ? (
                        <i className="fa-solid fa-sort-up"></i>
                      ) : (
                        <i className="fa-solid fa-sort-down"></i>
                      ))}
                  </th>
                  <th
                    onClick={() => handleItemSort("uom")}
                    style={{ cursor: "pointer" }}
                  >
                    UOM{" "}
                    {itemSortConfig.key === "uom" &&
                      (itemSortConfig.direction === "asc" ? (
                        <i className="fa-solid fa-sort-up"></i>
                      ) : (
                        <i className="fa-solid fa-sort-down"></i>
                      ))}
                  </th>
                  <th
                    onClick={() => handleItemSort("totalStock")}
                    style={{ cursor: "pointer" }}
                  >
                    Total Stock{" "}
                    {itemSortConfig.key === "totalStock" &&
                      (itemSortConfig.direction === "asc" ? (
                        <i className="fa-solid fa-sort-up"></i>
                      ) : (
                        <i className="fa-solid fa-sort-down"></i>
                      ))}
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody className="text-break">
                {filteredItemsReport.length === 0 ? (
                  <tr className="no-data-row">
                    <td colSpan="5" className="no-data-cell">
                      <div className="no-data-content">
                        <i className="fa-solid fa-box no-data-icon"></i>
                        <p className="no-data-text">No items found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredItemsReport.map((item) => (
                    <tr key={item.id}>
                      <td className="ps-4">{item.name}</td>
                      <td className="ps-4">{item.code}</td>
                      <td className="ps-4">{item.uom}</td>
                      <td className="ps-4">{item.totalStock || 0}</td>
                      <td className="actions ps-4">
                        <button
                          className="btn-icon view"
                          title="View Details"
                          onClick={() => handleOpenItemHistory(item)}
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          <div className="pagination-container">
            <div className="pagination-info">
              {viewMode === "warehouse" ? (
                <>
                  Showing {getDisplayRange()} of {filteredItems.length} entries
                </>
              ) : (
                <>
                  Showing {getDisplayRange()} of {filteredItemsReport.length}{" "}
                  entries
                </>
              )}
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
                  className="btn"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="modal-body">
                <div className="margin-2 mx-2">
                  {/* Search and Filter Section */}
                  <div className="search-filter-container mx-2">
                    <div className="search-box text-8">
                      <i className="fas fa-search position-absolute z-0 input-icon"></i>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search by item name, code, or UOM"
                        value={modalSearchQuery}
                        onChange={(e) => setModalSearchQuery(e.target.value)}
                      />
                    </div>
                    <div className="filter-options">
                      <button
                        className="btn btn-outline-secondary text-8"
                        onClick={() => {
                          setModalSearchQuery("");
                          setModalSortConfig({ key: null, direction: null });
                        }}
                      >
                        <i className="fas fa-filter me-2"></i>
                        Reset Filters
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-success me-2 text-8"
                        onClick={handleExportItemHistoryReport}
                      >
                        <i className="fas fa-file-excel me-2"></i>Export to
                        Excel
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
                              (modalSortConfig.direction === "asc" ? (
                                <i className="fa-solid fa-sort-up"></i>
                              ) : (
                                <i className="fa-solid fa-sort-down"></i>
                              ))}
                          </th>
                          <th
                            onClick={() => handleModalSort("itemCode")}
                            style={{ cursor: "pointer" }}
                          >
                            Item Code{" "}
                            {modalSortConfig.key === "itemCode" &&
                              (modalSortConfig.direction === "asc" ? (
                                <i className="fa-solid fa-sort-up"></i>
                              ) : (
                                <i className="fa-solid fa-sort-down"></i>
                              ))}
                          </th>
                          <th
                            onClick={() => handleModalSort("quantity")}
                            style={{ cursor: "pointer" }}
                          >
                            Stock{" "}
                            {modalSortConfig.key === "quantity" &&
                              (modalSortConfig.direction === "asc" ? (
                                <i className="fa-solid fa-sort-up"></i>
                              ) : (
                                <i className="fa-solid fa-sort-down"></i>
                              ))}
                          </th>
                          {/* <th
                            onClick={() => handleModalSort("cumulativeValue")}
                            style={{ cursor: "pointer" }}
                          >
                            Total Cost{" "}
                            {modalSortConfig.key === "cumulativeValue" &&
                              (modalSortConfig.direction === "asc" ? (
                                <i className="fa-solid fa-sort-up"></i>
                              ) : (
                                <i className="fa-solid fa-sort-down"></i>
                              ))}
                          </th> */}
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody className="text-break">
                        {filteredWarehouseDetails.length === 0 ? (
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
                          filteredWarehouseDetails.map(
                            (warehouseDetail, index) => (
                              <tr key={index}>
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
                                    <span>
                                      {warehouseDetail.quantity + " "}
                                      {warehouseDetail.uom}
                                    </span>
                                  </div>
                                </td>
                                {/* <td className="ps-5">
                                  <div>
                                    <span>-</span>
                                  </div>
                                </td> */}
                                <td className="actions ps-4">
                                  <button
                                    className="btn-icon view"
                                    title="View Details"
                                    onClick={() =>
                                      handleOpenItemHistory(warehouseDetail)
                                    }
                                  >
                                    <i className="fas fa-eye"></i>
                                  </button>
                                </td>
                              </tr>
                            )
                          )
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
          className="modal fade"
          ref={itemModalRef}
          id="itemDetailModal"
          tabIndex="-1"
        >
          <div className="modal-dialog modal-fullscreen">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-circle-info me-2"></i>
                  Item History
                </h5>
                <button
                  type="button"
                  className="btn"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="modal-body">
                {/* Search and Filter Section */}
                <div className="search-filter-container mx-2">
                  <div className="search-box text-8">
                    <i className="fas fa-search position-absolute z-0 input-icon"></i>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search by item name, code, or UOM"
                      value={modalItemSearchQuery}
                      onChange={(e) => setModalItemSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="filter-options">
                    <button
                      className="btn btn-outline-secondary text-8"
                      onClick={() => {
                        setModalItemSearchQuery("");
                        setModalItemSortConfig({ key: null, direction: null });
                      }}
                    >
                      <i className="fas fa-filter me-2"></i>
                      Reset Filters
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-success text-8 me-2"
                      onClick={handleExportItemHistoryReport}
                    >
                      <i className="fas fa-file-excel me-2"></i>Export to Excel
                    </button>
                  </div>
                </div>
                <div className="margin-2 mx-2">
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th
                            onClick={() => handleModalItemSort("trNo")}
                            style={{ cursor: "pointer" }}
                          >
                            TRNO{" "}
                            {modalItemSortConfig.key === "trNo" &&
                              (modalItemSortConfig.direction === "asc" ? (
                                <i className="fa-solid fa-sort-up"></i>
                              ) : (
                                <i className="fa-solid fa-sort-down"></i>
                              ))}
                          </th>
                          <th
                            onClick={() => handleModalItemSort("transferredAt")}
                            style={{ cursor: "pointer" }}
                          >
                            Date{" "}
                            {modalItemSortConfig.key === "transferredAt" &&
                              (modalItemSortConfig.direction === "asc" ? (
                                <i className="fa-solid fa-sort-up"></i>
                              ) : (
                                <i className="fa-solid fa-sort-down"></i>
                              ))}
                          </th>
                          <th
                            onClick={() => handleModalItemSort("itemCode")}
                            style={{ cursor: "pointer" }}
                          >
                            Item Code{" "}
                            {modalItemSortConfig.key === "itemCode" &&
                              (modalItemSortConfig.direction === "asc" ? (
                                <i className="fa-solid fa-sort-up"></i>
                              ) : (
                                <i className="fa-solid fa-sort-down"></i>
                              ))}
                          </th>
                          <th
                            onClick={() => handleModalItemSort("itemName")}
                            style={{ cursor: "pointer" }}
                          >
                            Item Name{" "}
                            {modalItemSortConfig.key === "itemName" &&
                              (modalItemSortConfig.direction === "asc" ? (
                                <i className="fa-solid fa-sort-up"></i>
                              ) : (
                                <i className="fa-solid fa-sort-down"></i>
                              ))}
                          </th>
                          <th
                            onClick={() =>
                              handleModalItemSort("sourceWarehouseName")
                            }
                            style={{ cursor: "pointer" }}
                          >
                            Transferred From{" "}
                            {modalItemSortConfig.key ===
                              "sourceWarehouseName" &&
                              (modalItemSortConfig.direction === "asc" ? (
                                <i className="fa-solid fa-sort-up"></i>
                              ) : (
                                <i className="fa-solid fa-sort-down"></i>
                              ))}
                          </th>
                          <th
                            onClick={() =>
                              handleModalItemSort("targetWarehouseName")
                            }
                            style={{ cursor: "pointer" }}
                          >
                            Transferred To{" "}
                            {modalItemSortConfig.key ===
                              "targetWarehouseName" &&
                              (modalItemSortConfig.direction === "asc" ? (
                                <i className="fa-solid fa-sort-up"></i>
                              ) : (
                                <i className="fa-solid fa-sort-down"></i>
                              ))}
                          </th>
                          <th
                            onClick={() => handleModalItemSort("quantity")}
                            style={{ cursor: "pointer" }}
                          >
                            Quantity{" "}
                            {modalItemSortConfig.key === "quantity" &&
                              (modalItemSortConfig.direction === "asc" ? (
                                <i className="fa-solid fa-sort-up"></i>
                              ) : (
                                <i className="fa-solid fa-sort-down"></i>
                              ))}
                          </th>
                          <th
                            onClick={() => handleModalItemSort("transferredBy")}
                            style={{ cursor: "pointer" }}
                          >
                            Transferred By{" "}
                            {modalItemSortConfig.key === "transferredBy" &&
                              (modalItemSortConfig.direction === "asc" ? (
                                <i className="fa-solid fa-sort-up"></i>
                              ) : (
                                <i className="fa-solid fa-sort-down"></i>
                              ))}
                          </th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody className="text-break">
                        {filteredItemsDetails.length === 0 ? (
                          <tr className="no-data-row">
                            <td colSpan="9" className="no-data-cell">
                              <div className="no-data-content">
                                <i className="fas fa-box-open no-data-icon"></i>
                                <p className="no-data-text">No items found</p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          filteredItemsDetails.map((item, idx) => (
                            <tr key={idx}>
                              <td className="ps-4">
                                <div>
                                  <span>{item.trNo}</span>
                                </div>
                              </td>
                              <td className="ps-4">
                                <div>
                                  <span>
                                    {item.transferredAt
                                      ? new Date(
                                          item.transferredAt
                                        ).toLocaleString()
                                      : "-"}
                                  </span>
                                </div>
                              </td>
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
                                  <span>{item.sourceWarehouseName}</span>
                                </div>
                              </td>
                              <td className="ps-4">
                                <div>
                                  <span>{item.targetWarehouseName}</span>
                                </div>
                              </td>
                              <td className="ps-4">
                                <div>
                                  <span>{item.quantity}</span>
                                </div>
                              </td>
                              <td className="ps-4">
                                <div>
                                  <span>{item.transferredBy}</span>
                                </div>
                              </td>
                              <td className="ps-4">
                                <div>
                                  <span>Complete</span>
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
      {/* {isShowTransactionDetails && (
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
                  View Transaction Receipt
                </h5>
                <button
                  type="button"
                  className="btn"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ><i className="fas fa-times"></i></button>
              </div>
              <div className="modal-body">
                <div className="search-filter-container mx-2">
                  <div className="search-box">
                    <i className="fas fa-search position-absolute z-0 input-icon"></i>
                    <input
                      type="text"
                      className="form-control mb-2"
                      placeholder="Search by transaction by order no., series no., type, item code, item name..."
                      value={modalTransactionSearchQuery}
                      onChange={(e) =>
                        setModalTransactionSearchQuery(e.target.value)
                      }
                    />
                  </div>
                  <div className="filter-options">
                    <button
                      className="filter-select"
                      onClick={() => {
                        setModalTransactionSearchQuery("");
                        setModalTransactionSortConfig({
                          key: null,
                          direction: null,
                        });
                      }}
                    >
                      <i className="fas fa-filter me-2"></i>
                      Reset Filters
                    </button>
                  </div>
                </div>
                <div className="margin-2 mx-2">
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th
                            onClick={() =>
                              handleModalTransactionSort("orderNo")
                            }
                            style={{ cursor: "pointer" }}
                          >
                            Order No.{" "}
                            {modalTransactionSortConfig.key === "orderNo" &&
                              (modalTransactionSortConfig.direction ===
                              "asc" ? (
                                <i className="fa-solid fa-sort-up"></i>
                              ) : (
                                <i className="fa-solid fa-sort-down"></i>
                              ))}
                          </th>
                          <th
                            onClick={() =>
                              handleModalTransactionSort("seriesNo")
                            }
                            style={{ cursor: "pointer" }}
                          >
                            Series No.{" "}
                            {modalTransactionSortConfig.key === "seriesNo" &&
                              (modalTransactionSortConfig.direction ===
                              "asc" ? (
                                <i className="fa-solid fa-sort-up"></i>
                              ) : (
                                <i className="fa-solid fa-sort-down"></i>
                              ))}
                          </th>
                          <th
                            onClick={() => handleModalTransactionSort("type")}
                            style={{ cursor: "pointer" }}
                          >
                            Type{" "}
                            {modalTransactionSortConfig.key === "type" &&
                              (modalTransactionSortConfig.direction ===
                              "asc" ? (
                                <i className="fa-solid fa-sort-up"></i>
                              ) : (
                                <i className="fa-solid fa-sort-down"></i>
                              ))}
                          </th>
                          <th
                            onClick={() =>
                              handleModalTransactionSort("itemCode")
                            }
                            style={{ cursor: "pointer" }}
                          >
                            Item Code{" "}
                            {modalTransactionSortConfig.key === "itemCode" &&
                              (modalTransactionSortConfig.direction ===
                              "asc" ? (
                                <i className="fa-solid fa-sort-up"></i>
                              ) : (
                                <i className="fa-solid fa-sort-down"></i>
                              ))}
                          </th>
                          <th
                            onClick={() =>
                              handleModalTransactionSort("itemName")
                            }
                            style={{ cursor: "pointer" }}
                          >
                            Item Name{" "}
                            {modalTransactionSortConfig.key === "itemName" &&
                              (modalTransactionSortConfig.direction ===
                              "asc" ? (
                                <i className="fa-solid fa-sort-up"></i>
                              ) : (
                                <i className="fa-solid fa-sort-down"></i>
                              ))}
                          </th>
                          <th
                            onClick={() => handleModalTransactionSort("status")}
                            style={{ cursor: "pointer" }}
                          >
                            Status{" "}
                            {modalTransactionSortConfig.key === "status" &&
                              (modalTransactionSortConfig.direction ===
                              "asc" ? (
                                <i className="fa-solid fa-sort-up"></i>
                              ) : (
                                <i className="fa-solid fa-sort-down"></i>
                              ))}
                          </th>
                          <th
                            onClick={() =>
                              handleModalTransactionSort("quantity")
                            }
                            style={{ cursor: "pointer" }}
                          >
                            Quantity{" "}
                            {modalTransactionSortConfig.key === "quantity" &&
                              (modalTransactionSortConfig.direction ===
                              "asc" ? (
                                <i className="fa-solid fa-sort-up"></i>
                              ) : (
                                <i className="fa-solid fa-sort-down"></i>
                              ))}
                          </th>
                          <th
                            onClick={() =>
                              handleModalTransactionSort("unitPrice")
                            }
                            style={{ cursor: "pointer" }}
                          >
                            Unit Price{" "}
                            {modalTransactionSortConfig.key === "unitPrice" &&
                              (modalTransactionSortConfig.direction ===
                              "asc" ? (
                                <i className="fa-solid fa-sort-up"></i>
                              ) : (
                                <i className="fa-solid fa-sort-down"></i>
                              ))}
                          </th>
                          <th
                            onClick={() =>
                              handleModalTransactionSort("totalPrice")
                            }
                            style={{ cursor: "pointer" }}
                          >
                            Total Price{" "}
                            {modalTransactionSortConfig.key === "totalPrice" &&
                              (modalTransactionSortConfig.direction ===
                              "asc" ? (
                                <i className="fa-solid fa-sort-up"></i>
                              ) : (
                                <i className="fa-solid fa-sort-down"></i>
                              ))}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="text-break">
                        {filteredTransactionDetails.length === 0 ? (
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
                          filteredTransactionDetails.map((tr) => (
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
                  className="btn btn-success me-2"
                  onClick={handleExportItemHistoryReport}
                >
                  <i className="fas fa-file-excel me-2"></i>Export to Excel
                </button>
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
      )} */}
    </div>
  );
};

export default Reports;
