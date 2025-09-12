import React, { useState, useEffect } from "react";
import { Button, Table, Badge, Pagination } from "react-bootstrap";
import Select from "react-select";
import ProductionEntryModal from "../../Modals/ProductionEntryModal";
import ItemsViewModal from "../../Modals/ItemsViewModal";
import "./ProductionPunch.css";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";
import api from "../../../services/api";
import { toast } from "react-toastify";

const ProductionReportEntry = () => {
  const [showModal, setShowModal] = useState(false);
  const [showItemsModal, setShowItemsModal] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const [productionData, setProductionData] = useState([
    // {
    //   id: 4,
    //   trNo: "PP-888B33CF",
    //   bomCode: "456789",
    //   bomName: "TESTING",
    //   producedQuantity: 300,
    //   productionDate: "2025-09-11",
    //   warehouseId: 7,
    //   warehouseName: "WIP2",
    //   createdBy: "MANJEET",
    //   createdAt: "2025-09-11T17:06:57.186727",
    //   items: [
    //     {
    //       itemCode: "10301034",
    //       itemName: "J2K LENCE",
    //       usedQuantity: 1500,
    //       batchNumbers: ["MV0014410301034250911005000000003"],
    //     },
    //     {
    //       itemCode: "10301035",
    //       itemName: "J2K BOTTOM COVER",
    //       usedQuantity: 1500,
    //       batchNumbers: ["MV0014410301035250911005000000002"],
    //     },
    //   ],
    // },
    // {
    //   id: 3,
    //   trNo: "PP-F642A952",
    //   bomCode: "456789",
    //   bomName: "TESTING",
    //   producedQuantity: 500,
    //   productionDate: "2025-09-10",
    //   warehouseId: 7,
    //   warehouseName: "WIP2",
    //   createdBy: "MANJEET",
    //   createdAt: "2025-09-11T16:11:41.02988",
    //   items: [
    //     {
    //       itemCode: "10301034",
    //       itemName: "J2K LENCE",
    //       usedQuantity: 2500,
    //       batchNumbers: ["MV0014410301034250911005000000002"],
    //     },
    //   ],
    // },
    // {
    //   id: 2,
    //   trNo: "PP-17E7AEF0",
    //   bomCode: "456789",
    //   bomName: "TESTING",
    //   producedQuantity: 1000,
    //   productionDate: "2025-09-11",
    //   warehouseId: 7,
    //   warehouseName: "WIP2",
    //   createdBy: "MANJEET",
    //   createdAt: "2025-09-11T16:09:43.611068",
    //   items: [
    //     {
    //       itemCode: "10301034",
    //       itemName: "J2K LENCE",
    //       usedQuantity: 5000,
    //       batchNumbers: [
    //         "MV0014410301034250911005000000001",
    //         "MV0014410301034250911005000000002",
    //       ],
    //     },
    //   ],
    // },
    // {
    //   id: 1,
    //   trNo: "PP-0F08D5A8",
    //   bomCode: "456789",
    //   bomName: "TESTING",
    //   producedQuantity: 500,
    //   productionDate: "2025-09-11",
    //   warehouseId: 7,
    //   warehouseName: "WIP2",
    //   createdBy: "MANJEET",
    //   createdAt: "2025-09-11T16:01:15.53059",
    //   items: [
    //     {
    //       itemCode: "10301034",
    //       itemName: "J2K LENCE",
    //       usedQuantity: 2500,
    //       batchNumbers: ["MV0014410301034250911005000000001"],
    //     },
    //   ],
    // },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const itemsPerPage = 10;

  // Toast configuration helper
  const showToast = (type, message) => {
    toast[type](message, { autoClose: 30000 });
  };

  const fetchProductionData = async () => {
    try {
      setLoading(true);
      const response = await api.get("api/production-punch");
      console.log("API Response:", JSON.stringify(response.data.data));
      if (response.data.status) {
        console.log(
          "Setting production data:",
          JSON.stringify(response.data.data)
        );
        setProductionData(response.data.data);
      } else {
        showToast("error", "No records found");
      }
    } catch (err) {
      showToast("error", err.response.data.message);
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // Commented out for testing with dummy data
  // useEffect(() => {
  //   fetchProductionData();
  // }, []);

  const handleExportExcel = () => {
    const dataToExport =
      selectedRows.length > 0
        ? productionData.filter((row) => selectedRows.includes(row.id))
        : productionData;

    const exportData = dataToExport.map((entry) => ({
      "Transaction No": entry.trNo,
      "BOM Code": entry.bomCode,
      "BOM Name": entry.bomName,
      "Produced Quantity": entry.producedQuantity,
      "Production Date": entry.productionDate,
      Warehouse: entry.warehouseName,
      "Created By": entry.createdBy,
      "Created At": entry.createdAt,
      Items: entry.items
        .map(
          (item) =>
            `${item.itemName} (${item.itemCode}) - Qty: ${item.usedQuantity}`
        )
        .join(", "),
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Production Report");
    XLSX.writeFile(wb, "Production_Report.xlsx");
  };

  const handleSelectAll = () => {
    if (selectedRows.length === productionData.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(productionData.map((row) => row.id));
    }
  };

  const handleSelectRow = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const handleModalClose = () => setShowModal(false);
  const handleModalShow = () => setShowModal(true);

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = productionData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(productionData.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Auto generate transaction number
  const generateTransactionNumber = () => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `PU-${year}-${randomNum}`;
  };

  const [transactionNumber, setTransactionNumber] = useState(
    generateTransactionNumber()
  );
  return (
    <div className="production-report-entry">
      {/* Header section */}
      <nav className="navbar bg-light border-body" data-bs-theme="light">
        <div className="container-fluid">
          <div className="mt-4">
            <h3 className="nav-header header-style">Production Punch</h3>
            <p className="breadcrumb">
              <Link to="/dashboard">
                <i className="fas fa-home text-8"></i>
              </Link>{" "}
              <span className="ms-1 mt-1 text-small-gray">
                / Production Punch
              </span>
            </p>
          </div>
          <button className="btn btn-primary add-btn" onClick={handleModalShow}>
            <i className="fa-solid fa-plus pe-1"></i> Add Production Punch
          </button>
        </div>
      </nav>
      {/* Table */}
      <div className="margin-2">
        <div className="table-container">
          {/* Table Header */}
          <div className="table-header">
            <div className="selected-count">
              <input
                type="checkbox"
                id="select-all"
                checked={selectedRows.length === productionData.length}
                onChange={handleSelectAll}
                className="ms-3 text-8"
              />
              <label htmlFor="select-all" className="text-8">
                {selectedRows.length} Selected
              </label>
            </div>
            <div className="bulk-actions">
              <button
                className="btn btn-outline-success text-8"
                onClick={handleExportExcel}
                disabled={selectedRows.length === 0}
              >
                <i className="fas fa-file-export me-2"></i>
                Export Excel
              </button>
            </div>
          </div>
          {loading ? (
            <div className="text-center p-4">Loading...</div>
          ) : error ? (
            <div className="text-center p-4 text-secondary">{error}</div>
          ) : productionData.length === 0 ? (
            <div className="text-center p-4">No data available</div>
          ) : (
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      className="text-8"
                      checked={selectedRows.length === productionData.length}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th>Transaction No</th>
                  <th>BOM Code</th>
                  <th>BOM Name</th>
                  <th>Produced Qty</th>
                  <th>Production Date</th>
                  <th>Warehouse</th>
                  <th>Created By</th>
                  <th>Created At</th>
                  <th>Items</th>
                </tr>
              </thead>
              <tbody className="text-break">
                {currentItems.map((entry) => (
                  <tr key={entry.id}>
                    <td>
                      <input
                        type="checkbox"
                        className="text-8"
                        checked={selectedRows.includes(entry.id)}
                        onChange={() => handleSelectRow(entry.id)}
                      />
                    </td>
                    <td>{entry.trNo}</td>
                    <td>{entry.bomCode}</td>
                    <td>{entry.bomName}</td>
                    <td>{entry.producedQuantity}</td>
                    <td>{entry.productionDate}</td>
                    <td>{entry.warehouseName}</td>
                    <td>{entry.createdBy}</td>
                    <td>{new Date(entry.createdAt).toLocaleString()}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <button
                          className="btn-icon view"
                          onClick={() => {
                            setSelectedItems(entry.items);
                            setShowItemsModal(true);
                          }}
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <div className="d-flex justify-content-center mt-4">
            <Pagination>
              <Pagination.Prev
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              />
              {[...Array(totalPages)].map((_, index) => (
                <Pagination.Item
                  key={index + 1}
                  active={index + 1 === currentPage}
                  onClick={() => handlePageChange(index + 1)}
                >
                  {index + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              />
            </Pagination>
          </div>
        </div>
      </div>

      <ProductionEntryModal show={showModal} onHide={handleModalClose} />
      <ItemsViewModal
        show={showItemsModal}
        onHide={() => setShowItemsModal(false)}
        items={selectedItems}
      />
    </div>
  );
};

export default ProductionReportEntry;
