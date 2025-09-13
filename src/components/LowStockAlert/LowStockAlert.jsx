import React, { useEffect, useState } from "react";
import { Modal, Button, Table } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTriangleExclamation,
  faXmark,
  faCartShopping,
} from "@fortawesome/free-solid-svg-icons";
import "./LowStockAlert.css"; // custom animations
import * as XLSX from "xlsx";
import { toast } from "react-toastify";

const LowStockAlert = ({ items }) => {
  const [show, setShow] = useState(false);
  const [lowStockItems, setLowStockItems] = useState([]);

  useEffect(() => {
    if (items.length > 0) {
      const lowStock = items.filter(
        (item) => item.currentStock < item.minStock
      );
      if (lowStock.length > 0) {
        setLowStockItems(lowStock);
        setShow(true);
      }
    }
  }, [items]);

  if (lowStockItems.length === 0) return null;

  // Function to export data to Excel
  const handleExportToExcel = () => {
    if (lowStockItems.length === 0) {
      toast.warning("No data available to export!");
      return;
    }

    // Format data for export
    const exportData = lowStockItems.map(item => ({
      "Item Code": item.code,
      "Item Name": item.name,
      "Available Stock": item.currentStock,
      "Minimum Required": item.minStock
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Low Stock Items");
    
    // Generate and save file
    XLSX.writeFile(wb, "Low_Stock_Items.xlsx");
    toast.success("Successfully exported to Excel");
  };

  return (
    <Modal
      show={show}
      onHide={() => setShow(false)}
      centered
      size="lg"
      dialogClassName="animated-modal"
    >
      <Modal.Header
        closeButton
        style={{
          backgroundColor: "#f2ccccff",
          borderBottom: "2px solid #dc3545",
        }}
      >
        <Modal.Title className="d-flex align-items-center text-danger fw-bold">
          {/* Pulsing warning icon */}
          <FontAwesomeIcon
            icon={faTriangleExclamation}
            className="me-2 pulse-icon"
          />
          Low Stock Level
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p className="fw-semibold text-muted mb-3 fade-in-text">
          The following items are currently below their minimum stock level.
          Please review and take necessary action.
        </p>

        <Table
          bordered
          hover
          responsive
          className="align-middle shadow-sm fade-in-table"
        >
          <thead style={{ backgroundColor: "#f8f9fa" }}>
            <tr>
              <th>Item Code</th>
              <th>Item Name</th>
              <th>Available</th>
              <th>Minimum Required</th>
            </tr>
          </thead>
          <tbody>
            {lowStockItems.map((item) => (
              <tr key={item.id} className="highlight-row">
                <td>{item.code}</td>
                <td>{item.name}</td>
                <td className="fw-bold text-danger">{item.currentStock}</td>
                <td>{item.minStock}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Modal.Body>

      <Modal.Footer className="d-flex justify-content-between">
        <Button
          variant="outline-primary"
          size="sm"
          onClick={handleExportToExcel}
        >
          <i className="fas fa-file-export"></i> Export Excel
        </Button>
        <Button
          variant="danger"
          className="text-8"
          onClick={() => setShow(false)}
        >
          <i className="fa-solid fa-xmark me-2"></i>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default LowStockAlert;
