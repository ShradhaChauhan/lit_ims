import React, { useState } from "react";
import { Button, Table, Badge, Pagination } from "react-bootstrap";
import Select from "react-select";
import ProductionEntryModal from "../../Modals/ProductionEntryModal";
import "./ProductionReportEntry.css";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";

// Dummy data for the table
const dummyData = [
  {
    id: 1,
    date: "2025-09-10",
    plant: "Plant A",
    category: "Electronics",
    productCode: "PROD001",
    productName: "LED Display",
    targetQty: 100,
    producedQty: 95,
    location: "Assembly Line 1",
    totalPlanQty: 500,
    totalBalanceQty: 405,
  },
  {
    id: 2,
    date: "2025-09-10",
    plant: "Plant B",
    category: "Electronics",
    productCode: "PROD002",
    productName: "Circuit Board",
    targetQty: 150,
    producedQty: 160,
    location: "Assembly Line 2",
    totalPlanQty: 600,
    totalBalanceQty: 440,
  },
  {
    id: 3,
    date: "2025-09-10",
    plant: "Plant A",
    category: "Mechanical",
    productCode: "PROD003",
    productName: "Gear Assembly",
    targetQty: 80,
    producedQty: 60,
    location: "Assembly Line 3",
    totalPlanQty: 400,
    totalBalanceQty: 340,
  },
  {
    id: 4,
    date: "2025-09-10",
    plant: "Plant C",
    category: "Electronics",
    productCode: "PROD004",
    productName: "Power Supply Unit",
    targetQty: 120,
    producedQty: 125,
    location: "Assembly Line 1",
    totalPlanQty: 600,
    totalBalanceQty: 475,
  },
  {
    id: 5,
    date: "2025-09-10",
    plant: "Plant B",
    category: "Mechanical",
    productCode: "PROD005",
    productName: "Bearing Assembly",
    targetQty: 200,
    producedQty: 180,
    location: "Assembly Line 4",
    totalPlanQty: 800,
    totalBalanceQty: 620,
  },
  {
    id: 6,
    date: "2025-09-10",
    plant: "Plant A",
    category: "Plastics",
    productCode: "PROD006",
    productName: "Injection Molded Case",
    targetQty: 300,
    producedQty: 310,
    location: "Molding Line 1",
    totalPlanQty: 1200,
    totalBalanceQty: 890,
  },
  {
    id: 7,
    date: "2025-09-10",
    plant: "Plant C",
    category: "Electronics",
    productCode: "PROD007",
    productName: "Control Panel",
    targetQty: 90,
    producedQty: 90,
    location: "Assembly Line 2",
    totalPlanQty: 450,
    totalBalanceQty: 360,
  },
  {
    id: 8,
    date: "2025-09-10",
    plant: "Plant B",
    category: "Mechanical",
    productCode: "PROD008",
    productName: "Shaft Assembly",
    targetQty: 150,
    producedQty: 150,
    location: "Assembly Line 3",
    totalPlanQty: 600,
    totalBalanceQty: 450,
  },
  {
    id: 9,
    date: "2025-09-10",
    plant: "Plant A",
    category: "Plastics",
    productCode: "PROD009",
    productName: "Front Panel",
    targetQty: 250,
    producedQty: 250,
    location: "Molding Line 2",
    totalPlanQty: 1000,
    totalBalanceQty: 750,
  },
  {
    id: 10,
    date: "2025-09-10",
    plant: "Plant C",
    category: "Electronics",
    productCode: "PROD010",
    productName: "Sensor Module",
    targetQty: 180,
    producedQty: 175,
    location: "Assembly Line 1",
    totalPlanQty: 720,
    totalBalanceQty: 545,
  },
  {
    id: 11,
    date: "2025-09-10",
    plant: "Plant B",
    category: "Mechanical",
    productCode: "PROD011",
    productName: "Coupling Unit",
    targetQty: 120,
    producedQty: 130,
    location: "Assembly Line 4",
    totalPlanQty: 480,
    totalBalanceQty: 350,
  },
  {
    id: 12,
    date: "2025-09-10",
    plant: "Plant A",
    category: "Plastics",
    productCode: "PROD012",
    productName: "Housing Cover",
    targetQty: 400,
    producedQty: 395,
    location: "Molding Line 1",
    totalPlanQty: 1600,
    totalBalanceQty: 1205,
  },
  {
    id: 13,
    date: "2025-09-10",
    plant: "Plant C",
    category: "Electronics",
    productCode: "PROD013",
    productName: "Display Module",
    targetQty: 160,
    producedQty: 165,
    location: "Assembly Line 2",
    totalPlanQty: 640,
    totalBalanceQty: 475,
  },
  {
    id: 14,
    date: "2025-09-10",
    plant: "Plant B",
    category: "Mechanical",
    productCode: "PROD014",
    productName: "Pulley System",
    targetQty: 100,
    producedQty: 95,
    location: "Assembly Line 3",
    totalPlanQty: 400,
    totalBalanceQty: 305,
  },
  {
    id: 15,
    date: "2025-09-10",
    plant: "Plant A",
    category: "Plastics",
    productCode: "PROD015",
    productName: "Button Panel",
    targetQty: 300,
    producedQty: 320,
    location: "Molding Line 2",
    totalPlanQty: 1200,
    totalBalanceQty: 880,
  },
  {
    id: 16,
    date: "2025-09-10",
    plant: "Plant C",
    category: "Electronics",
    productCode: "PROD016",
    productName: "Power Module",
    targetQty: 140,
    producedQty: 140,
    location: "Assembly Line 1",
    totalPlanQty: 560,
    totalBalanceQty: 420,
  },
  {
    id: 17,
    date: "2025-09-10",
    plant: "Plant B",
    category: "Mechanical",
    productCode: "PROD017",
    productName: "Spring Assembly",
    targetQty: 200,
    producedQty: 200,
    location: "Assembly Line 4",
    totalPlanQty: 800,
    totalBalanceQty: 600,
  },
  {
    id: 18,
    date: "2025-09-10",
    plant: "Plant A",
    category: "Plastics",
    productCode: "PROD018",
    productName: "Side Panel",
    targetQty: 350,
    producedQty: 360,
    location: "Molding Line 1",
    totalPlanQty: 1400,
    totalBalanceQty: 1040,
  },
  {
    id: 19,
    date: "2025-09-10",
    plant: "Plant C",
    category: "Electronics",
    productCode: "PROD019",
    productName: "Control Board",
    targetQty: 120,
    producedQty: 115,
    location: "Assembly Line 2",
    totalPlanQty: 480,
    totalBalanceQty: 365,
  },
  {
    id: 20,
    date: "2025-09-10",
    plant: "Plant B",
    category: "Mechanical",
    productCode: "PROD020",
    productName: "Gear Box",
    targetQty: 80,
    producedQty: 85,
    location: "Assembly Line 3",
    totalPlanQty: 320,
    totalBalanceQty: 235,
  },
];

const ProductionReportEntry = () => {
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState([]);
  const itemsPerPage = 10;

  const handleExportExcel = () => {
    const dataToExport =
      selectedRows.length > 0
        ? dummyData.filter((row) => selectedRows.includes(row.id))
        : dummyData;

    const exportData = dataToExport.map(
      ({
        date,
        plant,
        category,
        productCode,
        productName,
        targetQty,
        producedQty,
        location,
        totalPlanQty,
        totalBalanceQty,
      }) => ({
        Date: date,
        Plant: plant,
        Category: category,
        "Product Code": productCode,
        "Product Name": productName,
        "Target Qty": targetQty,
        "Produced Qty": producedQty,
        Location: location,
        "Total Plan Qty": totalPlanQty,
        "Total Balance Qty": totalBalanceQty,
        Status:
          producedQty === targetQty
            ? "Achieved"
            : producedQty > targetQty
            ? "Excess"
            : "Not Achieved",
      })
    );

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Production Report");
    XLSX.writeFile(wb, "Production_Report.xlsx");
  };

  const handleSelectAll = () => {
    if (selectedRows.length === dummyData.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(dummyData.map((row) => row.id));
    }
  };

  const handleSelectRow = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const getStatusInfo = (target, produced) => {
    if (produced === target) return { variant: "achieved", text: "Achieved" };
    if (produced > target) return { variant: "excess", text: "Excess" };
    return { variant: "not-achieved", text: "Not Achieved" };
  };

  const handleModalClose = () => setShowModal(false);
  const handleModalShow = () => setShowModal(true);

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = dummyData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(dummyData.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="production-report-entry">
      {/* Header section */}
      <nav className="navbar bg-light border-body" data-bs-theme="light">
        <div className="container-fluid">
          <div className="mt-4">
            <h3 className="nav-header header-style">Production Report Entry</h3>
            <p className="breadcrumb">
              <Link to="/dashboard">
                <i className="fas fa-home text-8"></i>
              </Link>{" "}
              <span className="ms-1 mt-1 text-small-gray">
                / Production Report Entry
              </span>
            </p>
          </div>
          <button className="btn btn-primary add-btn" onClick={handleModalShow}>
            <i className="fa-solid fa-plus pe-1"></i> Add Production Entry
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
                checked={selectedRows.length === dummyData.length}
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
          <table className="table table-hover">
            <thead>
              <tr>
                <th>
                  <input type="checkbox" className="text-8" disabled />
                </th>
                <th>Date</th>
                <th>Plant</th>
                <th>Category</th>
                <th>Product Code</th>
                <th>Product Name</th>
                <th>Target Qty</th>
                <th>Produced Qty</th>
                <th>Location</th>
                <th>Total Plan Qty</th>
                <th>Total Balance Qty</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody className="text-break">
              {currentItems.map((entry) => {
                const status = getStatusInfo(
                  entry.targetQty,
                  entry.producedQty
                );
                return (
                  <tr key={entry.id}>
                    <td>
                      <input
                        type="checkbox"
                        className="text-8"
                        checked={selectedRows.includes(entry.id)}
                        onChange={() => handleSelectRow(entry.id)}
                      />
                    </td>
                    <td>{entry.date}</td>
                    <td>{entry.plant}</td>
                    <td>{entry.category}</td>
                    <td>{entry.productCode}</td>
                    <td>{entry.productName}</td>
                    <td>{entry.targetQty}</td>
                    <td>{entry.producedQty}</td>
                    <td>{entry.location}</td>
                    <td>{entry.totalPlanQty}</td>
                    <td>{entry.totalBalanceQty}</td>
                    <td>
                      <span className={`badge ${status.variant}`}>
                        {status.text}
                      </span>
                      {/* <Badge className={`status ${status.variant}`}>
                      {status.text}
                    </Badge> */}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

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
    </div>
  );
};

export default ProductionReportEntry;
