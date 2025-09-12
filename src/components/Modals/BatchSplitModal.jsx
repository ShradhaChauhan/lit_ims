import React, { useState, useEffect } from 'react';
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

// Keep track of active toast messages
const activeToasts = new Set();

// Helper function to show toast messages
const showUniqueToast = (message, type = 'error') => {
  // If the same message is already showing, don't show it again
  if (activeToasts.has(message)) {
    return;
  }

  // Add message to active toasts
  activeToasts.add(message);

  // Show the toast
  toast[type](message, {
    toastId: message, // Use message as the toast ID to prevent duplicates
    autoClose: 3000,
    onClose: () => {
      // Remove the message from active toasts when it closes
      activeToasts.delete(message);
    }
  });
};

const BatchSplitModal = ({ show, onHide, selectedProduct, formData, transactionNumber, onSave }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItems, setExpandedItems] = useState({});
  const [batchSplits, setBatchSplits] = useState({});
  const [batchNumbers, setBatchNumbers] = useState({});
  const [itemQuantities, setItemQuantities] = useState({});

  // Update itemQuantities when modal is shown or selectedProduct/formData changes
  useEffect(() => {
    if (show && selectedProduct?.items) {
      const quantities = {};
      selectedProduct.items.forEach(item => {
        quantities[item.itemCode] = item.quantity * formData.producedQty;
      });
      setItemQuantities(quantities);
    }
  }, [show, selectedProduct, formData.producedQty]);

  // Filter items based on search term
  const filteredItems = selectedProduct?.items?.filter(
    (item) =>
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.itemCode.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Handle adding a new batch split for an item
  const handleAddBatchSplit = (itemCode, isFirstAdd = false) => {
    const mainBatchNo = "P123456" + itemCode + "250912000100000002";
    const mainLastDigit = parseInt(mainBatchNo.slice(-1));
    
    setBatchSplits((prev) => {
      const currentSplits = prev[itemCode] || [];
      
      // Check if all existing split rows have quantities filled
      const hasEmptyQuantities = currentSplits.some(split => 
        !split.isMainRow && (!split.quantity || parseFloat(split.quantity) === 0)
      );
      
      if (!isFirstAdd && hasEmptyQuantities) {
        showUniqueToast("Please fill quantity in existing rows before adding new ones");
        return prev;
      }

      if (isFirstAdd) {
        return {
          ...prev,
          [itemCode]: [
            {
              batchNo: mainBatchNo,
              quantity: itemQuantities[itemCode] || 0,
              isMainRow: true
            },
            {
              batchNo: mainBatchNo.slice(0, -1) + (mainLastDigit + 1).toString(),
              quantity: 0,
              isMainRow: false
            }
          ]
        };
      } else {
        // Get the last non-main row's batch number
        const lastSplit = [...currentSplits].reverse().find(split => !split.isMainRow);
        const lastDigit = parseInt(lastSplit.batchNo.slice(-1));
        const newBatchNo = mainBatchNo.slice(0, -1) + (lastDigit + 1).toString();

        return {
          ...prev,
          [itemCode]: [
            ...currentSplits,
            {
              batchNo: newBatchNo,
              quantity: 0,
              isMainRow: false
            }
          ]
        };
      }
    });
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
    const currentSplits = batchSplits[itemCode] || [];
    const split = currentSplits[index];

    if (split.isMainRow) {
      // If changing main row quantity, update it and validate other rows
      const nonMainRowsSum = currentSplits.reduce((sum, s) => 
        !s.isMainRow ? sum + (parseFloat(s.quantity) || 0) : sum, 0
      );


      setBatchSplits((prev) => ({
        ...prev,
        [itemCode]: prev[itemCode].map((s, i) =>
          i === index ? { ...s, quantity: numValue } : s
        )
      }));
    } else {
      // For non-main rows
      const mainRow = currentSplits.find(s => s.isMainRow);
      const mainQuantity = mainRow?.quantity || 0;
      
      // Calculate sum of all non-main row splits except current and previous
      const otherSplitsSum = currentSplits.reduce((sum, s, i) => {
        if (!s.isMainRow && i !== index && i !== index - 1) {
          return sum + (parseFloat(s.quantity) || 0);
        }
        return sum;
      }, 0);

      // Check if new value would exceed total quantity
      

      setBatchSplits((prev) => {
        const splits = prev[itemCode];
        const updatedSplits = splits.map((s, i) => {
          if (i === index) {
            // Current row - set to new value
            return { ...s, quantity: numValue };
          } else if (!s.isMainRow && i === index - 1) {
            // Previous row - auto deduct
            const remainingQuantity = mainQuantity - (numValue + otherSplitsSum);
            return { ...s, quantity: Math.max(0, remainingQuantity) };
          }
          return s;
        });

        return {
          ...prev,
          [itemCode]: updatedSplits
        };
      });
    }
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
  const resetForm = () => {
    setBatchSplits({});
    setExpandedItems({});
    setSearchTerm('');
  };

  const handleSave = () => {
    // Validate all quantities are properly split
    const invalidItems = selectedProduct.items.filter(item => {
      const splits = batchSplits[item.itemCode] || [];
      const parentQuantity = itemQuantities[item.itemCode] || 0;
      const splitSum = splits.reduce((sum, split) => 
        sum + (parseFloat(split.quantity) || 0), 0
      );
      return Math.abs(splitSum - parentQuantity) > 0.001; // Using small epsilon for float comparison
    });

    if (invalidItems.length > 0) {
      showUniqueToast('Split quantities must equal total quantity for all items');
      return;
    }

    // Prepare data for saving
    const batchData = {
      ...formData,
      items: selectedProduct.items.map(item => ({
        itemCode: item.itemCode,
        itemName: item.itemName,
        totalQuantity: itemQuantities[item.itemCode] || 0,
        batches: batchSplits[item.itemCode] || []
      }))
    };

    onSave(batchData);
    resetForm();
  };

  return (
    <Modal show={show} onHide={() => { resetForm(); onHide(); }} size="xl" dialogClassName="modal-dialog-centered">
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
          </div>
        </div>
        <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          <Table striped bordered hover>
            <thead>
              <tr className="text-8">
                <th>Batch No</th>
                <th>BOM Name</th>
                <th>Total Quantity</th>
              </tr>
            </thead>
            <tbody className="text-8 text-break">
              {filteredItems.map((item) => (
                <React.Fragment key={item.itemCode}>
                  <tr>
                    <td>
                      {"P123456" + item.itemCode+ "250912000100000002"}
                      <Button
                        variant="link"
                        size="sm"
                        className="ms-2"
                        onClick={() => {
                          setExpandedItems(prev => ({
                            ...prev,
                            [item.itemCode]: !prev[item.itemCode]
                          }));
                          if (!batchSplits[item.itemCode]) {
                            handleAddBatchSplit(item.itemCode, true);
                          }
                        }}
                      >
                        <i className="fas fa-plus" />
                      </Button>
                    </td>
                    <td>{formData.product.label}</td>
                    <td>
                      <Form.Control
                        type="number"
                        size="sm"
                        value={itemQuantities[item.itemCode]?.toFixed(3) || ''}
                        onChange={(e) => {
                          const newValue = parseFloat(e.target.value) || 0;
                          setItemQuantities(prev => ({
                            ...prev,
                            [item.itemCode]: newValue
                          }));
                        }}
                      />
                    </td>
                  </tr>
                  <tr>
                    <td colSpan="4" className="p-0">
                      <Collapse in={expandedItems[item.itemCode]}>
                        <div className="p-3">
                          {/* Calculate sum of split quantities */}
                          {(() => {
                            const splits = batchSplits[item.itemCode] || [];
                            const totalSplitQuantity = splits.reduce((sum, split) => 
                              sum + (parseFloat(split.quantity) || 0), 0
                            );
                            const parentQuantity = itemQuantities[item.itemCode] || 0;
                            const difference = Math.abs(parentQuantity - totalSplitQuantity);
                            
                            return difference > 0.001 && (
                              <div className="alert alert-warning py-1 mb-2">
                                <small>
                                  <i className="fas fa-exclamation-triangle me-2"></i>
                                  Split quantities sum ({totalSplitQuantity.toFixed(3)}) does not match parent row quantity ({parentQuantity.toFixed(3)})
                                </small>
                              </div>
                            );
                          })()}
                          <Table size="sm" className="mb-2">
                            <thead>
                              <tr>
                                <th>Batch No</th>
                                <th>BOM Name</th>
                                <th>
                                  Quantity
                                  <Button
                                    variant="link"
                                    size="sm"
                                    className="ms-2"
                                    onClick={() => handleAddBatchSplit(item.itemCode, false)}
                                  >
                                    <i className="fas fa-plus" />
                                  </Button>
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {(batchSplits[item.itemCode] || []).map((split, index) => (
                                <tr key={split.batchNo}>
                                  <td>
                                    {split.batchNo}
                                  </td>
                                  <td>{formData.product.label}</td>
                                  <td className="d-flex align-items-center gap-2">
                                    <Form.Control
                                      type="number"
                                      size="sm"
                                      value={split.quantity || ''}
                                      onChange={(e) => handleQuantityChange(item.itemCode, index, e.target.value)}
                                      min="0"
                                      step="0.001"
                                      readOnly={false}
                                    />
                                    {!split.isMainRow && (
                                      <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => {
                                          setBatchSplits(prev => {
                                            const splits = prev[item.itemCode];
                                            // If this is the last non-main row, don't allow deletion
                                            const nonMainRows = splits.filter(s => !s.isMainRow);
                                            if (nonMainRows.length === 1) {
                                              showUniqueToast("Cannot delete the last split row");
                                              return prev;
                                            }
                                            
                                            // Get the quantity to redistribute
                                            const quantityToRedistribute = split.quantity || 0;
                                            
                                            // Remove the current row
                                            const updatedSplits = splits.filter((_, i) => i !== index);
                                            
                                            // If there's a quantity to redistribute, add it to the previous non-main row
                                            if (quantityToRedistribute > 0) {
                                              const prevNonMainIndex = updatedSplits.findIndex((s, i) => !s.isMainRow && i < index);
                                              if (prevNonMainIndex !== -1) {
                                                updatedSplits[prevNonMainIndex].quantity = 
                                                  (parseFloat(updatedSplits[prevNonMainIndex].quantity) || 0) + quantityToRedistribute;
                                              }
                                            }
                                            
                                            return {
                                              ...prev,
                                              [item.itemCode]: updatedSplits
                                            };
                                          });
                                        }}
                                      >
                                        <i className="fas fa-trash" />
                                      </Button>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
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
