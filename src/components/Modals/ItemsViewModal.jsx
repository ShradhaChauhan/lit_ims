import React, { useState, useEffect } from "react";
import { Modal, Table, Form, Button } from "react-bootstrap";
import * as XLSX from "xlsx";

const ItemsViewModal = ({ show, onHide, items }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);

  useEffect(() => {
    if (items) {
      setFilteredItems(items);
    }
  }, [items]);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    if (!term) {
      setFilteredItems(items);
      return;
    }

    const filtered = items.filter(item => 
      item.itemCode.toLowerCase().includes(term) ||
      item.itemName.toLowerCase().includes(term) ||
      item.batchNumbers.some(batch => batch.toLowerCase().includes(term))
    );
    setFilteredItems(filtered);
  };

  const handleReset = () => {
    setSearchTerm("");
    setFilteredItems(items);
  };

  const handleExportExcel = () => {
    const exportData = filteredItems.map(item => ({
      "Item Code": item.itemCode,
      "Item Name": item.itemName,
      "Used Quantity": item.usedQuantity,
      "Batch Numbers": item.batchNumbers.join(", ")
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Items Details");
    XLSX.writeFile(wb, "Items_Details.xlsx");
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Items Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex gap-2 align-items-center" style={{ width: '60%' }}>
            <Form.Control
            className="text-8"
              type="text"
              placeholder="Search by Item Code, Name, or Batch Number..."
              value={searchTerm}
              onChange={handleSearch}
            />
            <Button variant="secondary" onClick={handleReset}>
              <i className="fas fa-undo text-8"></i>
            </Button>
          </div>
          <Button variant="outline-success" className="text-8" onClick={handleExportExcel}>
            <i className="fas fa-file-export me-2"></i>
            Export Excel
          </Button>
        </div>

        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Item Code</th>
              <th>Item Name</th>
              <th>Used Quantity</th>
              <th>Batch Numbers</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item, index) => (
              <tr key={index}>
                <td>{item.itemCode}</td>
                <td>{item.itemName}</td>
                <td>{item.usedQuantity}</td>
                <td>
                  {item.batchNumbers.map((batch, idx) => (
                    <div key={idx}>{batch}</div>
                  ))}
                </td>
              </tr>
            ))}
            {filteredItems.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center">
                  No items found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Modal.Body>
    </Modal>
  );
};

export default ItemsViewModal;
