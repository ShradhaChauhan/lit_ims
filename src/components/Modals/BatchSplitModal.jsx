import React, { useState } from 'react';
import {
  Modal,
  Button,
  Form,
  Table,
  InputGroup,
  Row,
  Col,
  Collapse
} from 'react-bootstrap';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';

const BatchSplitModal = ({ show, onHide, selectedProduct, formData, transactionNumber, onSave }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItems, setExpandedItems] = useState({});
  const [batchSplits, setBatchSplits] = useState({});
  const [batchNumbers, setBatchNumbers] = useState({});

  // Filter items based on search term
  const filteredItems = selectedProduct?.items?.filter(
    (item) =>
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.itemCode.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Handle adding a new batch split for an item
  const handleAddBatchSplit = (itemCode) => {
    setBatchSplits((prev) => ({
      ...prev,
      [itemCode]: [
        ...(prev[itemCode] || []),
        {
          batchNo: generateBatchNumber(itemCode),
          quantity: 0
        }
      ]
    }));
  };

  // Generate a unique batch number in format P12345678452145250912000100000002
  const generateBatchNumber = (itemCode) => {
    const timestamp = Date.now().toString();
    const randomDigits = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const sequence = ((batchSplits[itemCode]?.length || 0) + 1).toString().padStart(8, '0');    
    return `P123456${randomDigits}${sequence}`;
  };

  // Handle quantity change in batch split
  const handleQuantityChange = (itemCode, index, value) => {
    const numValue = parseFloat(value) || 0;
    const item = selectedProduct.items.find(i => i.itemCode === itemCode);
    const totalQuantity = item.quantity * formData.producedQty;
    
    // Calculate sum of other splits
    const otherSplitsSum = batchSplits[itemCode]?.reduce((sum, split, i) => 
      i !== index ? sum + (parseFloat(split.quantity) || 0) : sum, 0
    ) || 0;

    // Check if new value would exceed total quantity
    if (numValue + otherSplitsSum > totalQuantity) {
      toast.error(`Total split quantity cannot exceed ${totalQuantity}`);
      return;
    }

    setBatchSplits((prev) => ({
      ...prev,
      [itemCode]: prev[itemCode].map((split, i) =>
        i === index ? { ...split, quantity: numValue } : split
      )
    }));
  };

  // Handle export to Excel
  const handleExportExcel = () => {
    if (!selectedProduct || !selectedProduct.items) return;

    const exportData = selectedProduct.items.map((item) => {
      const splits = batchSplits[item.itemCode] || [];
      return {
        'Item Code': item.itemCode,
        'Item Name': item.itemName,
        'Total Quantity': item.quantity * formData.producedQty,
        'Batch Splits': splits.map(s => `${s.batchNo}: ${s.quantity}`).join(', ') || 'No splits'
      };
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Batch Splits');
    XLSX.writeFile(wb, `${selectedProduct.code}_${selectedProduct.name}_Batch_Splits.xlsx`);
  };

  // Handle print stickers
  const handlePrintStickers = () => {
    // Implement sticker printing logic here
    // This would typically involve generating a print-friendly format
    // and using the browser's print functionality or a printing library
    window.print();
  };

  // Handle save
  const handleSave = () => {
    // Validate all quantities are properly split
    const invalidItems = selectedProduct.items.filter(item => {
      const totalQuantity = item.quantity * formData.producedQty;
      const splits = batchSplits[item.itemCode] || [];
      const splitSum = splits.reduce((sum, split) => sum + (parseFloat(split.quantity) || 0), 0);
      return Math.abs(splitSum - totalQuantity) > 0.001; // Using small epsilon for float comparison
    });

    if (invalidItems.length > 0) {
      toast.error('Please ensure all items are fully split into batches');
      return;
    }

    // Prepare data for saving
    const batchData = {
      ...formData,
      items: selectedProduct.items.map(item => ({
        itemCode: item.itemCode,
        itemName: item.itemName,
        totalQuantity: item.quantity * formData.producedQty,
        batches: batchSplits[item.itemCode] || []
      }))
    };

    onSave(batchData);
  };

  return (
    <Modal show={show} onHide={onHide} size="xl" dialogClassName="modal-dialog-centered">
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="fas fa-layer-group me-2" />
          Batch Split Preview
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-3 d-flex justify-content-between align-items-center">
          <p className="text-8">
            Transaction #: <strong>{transactionNumber}</strong>
          </p>
          <div className="d-flex gap-2">
            <InputGroup className="w-auto">
              <InputGroup.Text className="text-8">
                <i className="fas fa-search" />
              </InputGroup.Text>
              <Form.Control
                className="text-8"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button
                variant="outline-secondary"
                onClick={() => setSearchTerm('')}
                className="text-8"
              >
                <i className="fas fa-undo" /> Reset
              </Button>
            </InputGroup>
            <Button
              variant="outline-success"
              className="text-8"
              onClick={handleExportExcel}
            >
              <i className="fas fa-file-excel me-2" />
              Export
            </Button>
            <Button
              variant="outline-primary"
              className="text-8"
              onClick={handlePrintStickers}
            >
              <i className="fas fa-print me-2" />
              Print Stickers
            </Button>
          </div>
        </div>
        <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          <Table striped bordered hover>
            <thead>
              <tr className="text-8">
                <th>Batch No</th>
                <th>Item Name</th>
                <th>Total Quantity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="text-8 text-break">
              {filteredItems.map((item) => (
                <React.Fragment key={item.itemCode}>
                  <tr>
                    <td>{"P123456" + item.itemCode+ "250912000100000002"}</td>
                    <td>({item.itemCode}) - {item.itemName}</td>
                    <td>{(item.quantity * formData.producedQty).toFixed(3)}</td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => {
                          setExpandedItems(prev => ({
                            ...prev,
                            [item.itemCode]: !prev[item.itemCode]
                          }));
                          if (!batchSplits[item.itemCode]) {
                            handleAddBatchSplit(item.itemCode);
                          }
                        }}
                      >
                        <i className={`fas fa-chevron-${expandedItems[item.itemCode] ? 'up' : 'down'} me-1`} />
                        {expandedItems[item.itemCode] ? 'Hide' : 'Show'} Splits
                      </Button>
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="4" className="p-0">
                      <Collapse in={expandedItems[item.itemCode]}>
                        <div className="p-3">
                          <Table size="sm" className="mb-2">
                            <thead>
                              <tr>
                                <th>Batch No</th>
                                <th>Item Name</th>
                                <th>Quantity</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(batchSplits[item.itemCode] || []).map((split, index) => (
                                <tr key={split.batchNo}>
                                  <td>{split.batchNo}</td>
                                  <td>({item.itemCode}) - {item.itemName}</td>
                                  <td>
                                    <Form.Control
                                      type="number"
                                      size="sm"
                                      value={split.quantity}
                                      onChange={(e) => handleQuantityChange(item.itemCode, index, e.target.value)}
                                      min="0"
                                      step="0.001"
                                    />
                                  </td>
                                  <td>
                                    <Button
                                      variant="outline-danger"
                                      size="sm"
                                      onClick={() => {
                                        setBatchSplits(prev => ({
                                          ...prev,
                                          [item.itemCode]: prev[item.itemCode].filter((_, i) => i !== index)
                                        }));
                                      }}
                                    >
                                      <i className="fas fa-trash" />
                                    </Button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() => handleAddBatchSplit(item.itemCode)}
                          >
                            <i className="fas fa-plus me-1" />
                            Add Split
                          </Button>
                        </div>
                      </Collapse>
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </Table>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" className="text-8" onClick={onHide}>
          <i className="fas fa-times me-2" />
          Close
        </Button>
        <Button variant="primary" className="text-8" onClick={handleSave}>
          <i className="fas fa-floppy-disk me-2" />
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default BatchSplitModal;
