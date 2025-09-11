import React, { useState, useMemo } from "react";
import { Modal } from "react-bootstrap";
import * as XLSX from "xlsx";

const BatchListModal = ({ show, onHide, batchList, itemName, itemCode }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all, issued, not_issued

  // Calculate total quantity
  const totalQuantity = useMemo(() => {
    return batchList.reduce((sum, batch) => sum + batch.quantity, 0);
  }, [batchList]);

  // Filter batch list based on search term and status
  const filteredBatchList = useMemo(() => {
    return batchList.filter((batch) => {
      const matchesSearch =
        batch.batchNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        batch.entryDate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        batch.quantity.toString().includes(searchTerm);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "issued" && batch.issued) ||
        (statusFilter === "not_issued" && !batch.issued);

      return matchesSearch && matchesStatus;
    });
  }, [batchList, searchTerm, statusFilter]);

  // Handle export to Excel
  const handleExport = () => {
    const wsData = [
      ["Batch List Details"],
      [], // Empty row for spacing
      ["Item Code:", itemCode],
      ["Item Name:", itemName],
      ["Total Quantity:", totalQuantity],
      ["Generated on:", new Date().toLocaleString()],
      [], // Empty row for spacing
      ["Batch No", "Entry Date", "Quantity", "Status"],
    ];

    // Add data rows
    filteredBatchList.forEach((batch) => {
      wsData.push([
        batch.batchNo,
        new Date(batch.entryDate).toLocaleString(),
        batch.quantity,
        batch.issued ? "Issued" : "Not Issued",
      ]);
    });

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Set column widths
    const colWidths = [
      { wch: 35 }, // Batch No
      { wch: 20 }, // Entry Date
      { wch: 15 }, // Quantity
      { wch: 15 }, // Status
    ];
    ws["!cols"] = colWidths;

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, "Batch List");

    // Save the file
    XLSX.writeFile(wb, `Batch_List_${itemName}.xlsx`);
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Batch List Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Item Details Section */}
        <div className="d-flex justify-content-between align-items-center mb-4 bg-light p-3 rounded">
          <div>
            <h6 className="mb-1">
              ({itemCode}) - {itemName}
            </h6>
          </div>
          <div>
            <h6 className="mb-1">
              Total Quantity:{" "}
              <span className="text-primary">
                {totalQuantity.toLocaleString()}
              </span>
            </h6>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="d-flex justify-content-between align-items-center mb-3 gap-3">
          <div className="d-flex gap-3 flex-grow-1">
            <div className="position-relative" style={{ width: "300px" }}>
              <i
                className="fas fa-search position-absolute"
                style={{
                  left: "10px",
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              ></i>
              <input
                type="text"
                className="form-control ps-4"
                placeholder="Search batches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ paddingLeft: "30px" }}
              />
            </div>
            <select
              className="form-select"
              style={{ width: "150px" }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="issued">Issued</option>
              <option value="not_issued">Not Issued</option>
            </select>
          </div>
          <button
            className="btn btn-outline-success px-2 py-1"
            onClick={handleExport}
          >
            <i className="fa-solid fa-file-excel me-1"></i> Export Excel
          </button>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Batch No</th>
                <th>Quantity</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody className="text-break">
              {filteredBatchList.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center">
                    No batches found
                  </td>
                </tr>
              ) : (
                filteredBatchList.map((batch, index) => (
                  <tr key={index}>
                    <td>{batch.entryDate}</td>
                    <td>{batch.batchNo}</td>
                    <td>{batch.quantity}</td>
                    <td>
                      <span
                        className={`badge ${
                          batch.issued === false ? "bg-success" : "bg-warning"
                        }`}
                      >
                        {!batch.issued ? "Not Issued" : "Issued"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default BatchListModal;
