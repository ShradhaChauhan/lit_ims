import React, { useState } from 'react';
import {
  Modal,
  Button,
  Form,
  Table,
  InputGroup,
} from 'react-bootstrap';
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
  const [batchSplits, setBatchSplits] = useState({});

  // Handle adding a new batch split
  const handleAddBatchSplit = (isFirstAdd = false) => {
    const mainBatchNo = "P123456" + selectedProduct.code + "250912000100000002";
    
    setBatchSplits((prev) => {
      const currentSplits = prev[selectedProduct.code] || [];
      
      // Check if all existing rows have quantities filled
      const hasEmptyQuantities = currentSplits.some(split => 
        !split.quantity || parseFloat(split.quantity) === 0
      );
      
      if (!isFirstAdd && hasEmptyQuantities) {
        showUniqueToast("Please fill quantity in existing rows before adding new ones");
        return prev;
      }

      if (isFirstAdd) {
        return {
          ...prev,
          [selectedProduct.code]: [
            {
              batchNo: mainBatchNo,
              quantity: 0
            }
          ]
        };
      } else {
        // Get the last row's batch number and increment its last digit
        const lastSplit = currentSplits[currentSplits.length - 1];
        const lastDigit = parseInt(lastSplit.batchNo.slice(-1));
        const newBatchNo = lastSplit.batchNo.slice(0, -1) + (lastDigit + 1).toString();

        return {
          ...prev,
          [selectedProduct.code]: [
            ...currentSplits,
            {
              batchNo: newBatchNo,
              quantity: 0
            }
          ]
        };
      }
    });
  };

  // Handle quantity change
  const handleQuantityChange = (index, value) => {
    const numValue = parseFloat(value) || 0;
    const currentSplits = batchSplits[selectedProduct.code] || [];
    const totalQuantity = parseFloat(formData.producedQty) || 0;
    
    // Calculate sum of all splits except current
    const otherSplitsSum = currentSplits.reduce((sum, split, i) => 
      i !== index ? sum + (parseFloat(split.quantity) || 0) : sum, 0
    );

    // Check if new value would exceed total quantity
    if (numValue + otherSplitsSum > totalQuantity) {
      showUniqueToast(`Total split quantity cannot exceed ${totalQuantity}`);
      return;
    }

    setBatchSplits(prev => ({
      ...prev,
      [selectedProduct.code]: prev[selectedProduct.code].map((split, i) =>
        i === index ? { ...split, quantity: numValue } : split
      )
    }));
  };

  // Handle save
  const resetForm = () => {
    setBatchSplits({});
    setSearchTerm('');
  };

  const handleSave = () => {
    const splits = batchSplits[selectedProduct.code] || [];
    const totalQuantity = parseFloat(formData.producedQty) || 0;
    const splitSum = splits.reduce((sum, split) => 
      sum + (parseFloat(split.quantity) || 0), 0
    );

    if (Math.abs(splitSum - totalQuantity) > 0.001) {
      showUniqueToast('Split quantities must equal produced quantity');
      return;
    }

    // Prepare data for saving
    const batchData = {
      ...formData,
      items: [{
        itemCode: selectedProduct.code,
        itemName: selectedProduct.name,
        totalQuantity: totalQuantity,
        batches: splits
      }]
    };

    onSave(batchData);
    resetForm();
  };

  // Filter splits based on search term
  const filteredSplits = (batchSplits[selectedProduct.code] || []).filter(split =>
    split.batchNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                placeholder="Search batch numbers..."
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
          {/* Calculate sum of split quantities */}
          {(() => {
            const splits = batchSplits[selectedProduct.code] || [];
            const totalSplitQuantity = splits.reduce((sum, split) => 
              sum + (parseFloat(split.quantity) || 0), 0
            );
            const totalQuantity = parseFloat(formData.producedQty) || 0;
            const difference = Math.abs(totalQuantity - totalSplitQuantity);
            
            return difference > 0.001 && (
              <div className="alert alert-warning py-1 mb-2">
                <small>
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  Split quantities sum ({totalSplitQuantity.toFixed(3)}) does not match produced quantity ({totalQuantity.toFixed(3)})
                </small>
              </div>
            );
          })()}
          <Table striped bordered hover>
            <thead>
              <tr className="text-8">
                <th>Batch No</th>
                <th>BOM Name</th>
                <th>
                  Quantity
                  <Button
                    variant="link"
                    size="sm"
                    className="ms-2"
                    onClick={() => handleAddBatchSplit(!batchSplits[selectedProduct.code])}
                  >
                    <i className="fas fa-plus" />
                  </Button>
                </th>
              </tr>
            </thead>
            <tbody className="text-8 text-break">
              {filteredSplits.map((split, index) => (
                <tr key={split.batchNo}>
                  <td>{split.batchNo}</td>
                  <td>{formData.product.label}</td>
                  <td className="d-flex align-items-center gap-2">
                    <Form.Control
                      type="number"
                      size="sm"
                      value={split.quantity || ''}
                      onChange={(e) => handleQuantityChange(index, e.target.value)}
                      min="0"
                      step="0.001"
                    />
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => {
                        setBatchSplits(prev => {
                          const splits = prev[selectedProduct.code];
                          // If this is the last row, don't allow deletion
                          if (splits.length === 1) {
                            showUniqueToast("Cannot delete the last row");
                            return prev;
                          }
                          
                          // Get the quantity to redistribute
                          const quantityToRedistribute = split.quantity || 0;
                          
                          // Remove the current row
                          const updatedSplits = splits.filter((_, i) => i !== index);
                          
                          // If there's a quantity to redistribute, add it to the previous row
                          if (quantityToRedistribute > 0 && index > 0) {
                            updatedSplits[index - 1].quantity = 
                              (parseFloat(updatedSplits[index - 1].quantity) || 0) + quantityToRedistribute;
                          }
                          
                          return {
                            ...prev,
                            [selectedProduct.code]: updatedSplits
                          };
                        });
                      }}
                    >
                      <i className="fas fa-trash" />
                    </Button>
                  </td>
                </tr>
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