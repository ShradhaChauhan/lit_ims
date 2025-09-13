import React, { useState } from 'react';
import {
  Modal,
  Button,
  Form,
  Table,
  InputGroup,
} from 'react-bootstrap';
import { toast } from 'react-toastify';
import api from '../../services/api';

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
  const [generateBatchNo, setGenerateBatchNo] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Reset splits when modal opens
  React.useEffect(() => {
    if (show) {
      setBatchSplits({});
      setGenerateBatchNo(0);
    }
  }, [show]);


  // Handle quantity change
  const handleQuantityChange = async (index, value) => {
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

    // Update the quantity first
    setBatchSplits(prev => ({
      ...prev,
      [selectedProduct.code]: prev[selectedProduct.code].map((split, i) =>
        i === index ? { ...split, quantity: numValue } : split
      )
    }));

    // If quantity is valid, generate batch number via API
    if (numValue > 0) {
      try {
        setIsLoading(true);
        const response = await api.post('/api/production-punch/generate-batch', {
          bomCode: formData.product?.value || selectedProduct.code,
          bomName: formData.product?.label || selectedProduct.name,
          quantity: numValue
        });

        if (response.data.status) {
          // Update the batch number with the generated one
          setBatchSplits(prev => ({
            ...prev,
            [selectedProduct.code]: prev[selectedProduct.code].map((split, i) =>
              i === index ? { ...split, batchNo: response.data.data.batchNo } : split
            )
          }));
          showUniqueToast('Batch number generated successfully', 'success');
        } else {
          showUniqueToast(response.data.message || 'Failed to generate batch number');
        }
      } catch (error) {
        console.error('Error generating batch number:', error);
        showUniqueToast('Failed to generate batch number. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handle save
  const resetForm = () => {
    setBatchSplits({});
    setSearchTerm('');
  };

  const handleSave = async () => {
    if (!selectedProduct?.code) return;
    
    const splits = batchSplits[selectedProduct.code] || [];
    const totalQuantity = parseFloat(formData.producedQty) || 0;
    const splitSum = splits.reduce((sum, split) => 
      sum + (parseFloat(split.quantity) || 0), 0
    );

    if (Math.abs(splitSum - totalQuantity) > 0.001) {
      showUniqueToast('Split quantities must equal produced quantity');
      return;
    }

    // Check if all batch numbers are filled
    const missingBatchNumbers = splits.some(split => !split.batchNo || split.batchNo.trim() === '');
    if (missingBatchNumbers) {
      showUniqueToast('All batches must have batch numbers');
      return;
    }

    try {
      setIsLoading(true);
      
      // Format the date as YYYY-MM-DD
      const productionDate = formData.date ? 
        new Date(formData.date).toISOString().split('T')[0] : 
        new Date().toISOString().split('T')[0];
      
      // Get items from selectedProduct or formData
      let items = [];
      if (selectedProduct.items) {
        items = selectedProduct.items.map(item => ({
          itemCode: item.itemCode,
          itemName: item.itemName,
          usedQuantity: Number((item.quantity * totalQuantity).toFixed(3))
        }));
      }
      
      // Prepare data for API call with the correct structure
      const requestBody = {
        trNo: transactionNumber,
        bomCode: selectedProduct.code, // Use the actual BOM code, not the item code
        bomName: formData.product?.label || selectedProduct.name,
        producedQuantity: totalQuantity,
        productionDate: productionDate,
        // Include items array
        items: items,
        // Include bomBatches array with batch numbers from the splits
        bomBatches: splits.map(split => ({
          batchNo: split.batchNo,
          quantity: parseFloat(split.quantity) || 0
        }))
      };
      
      console.log('Sending production data:', requestBody);
      
      // Make API call to save the production data
      const response = await api.post('/api/production-punch/create', requestBody);
      
      if (response.data.status) {
        showUniqueToast('Production data saved successfully', 'success');
        resetForm();
        onSave(response.data.data); // Pass the response data to the parent component
        onHide(); // Close the modal
      } else {
        showUniqueToast(response.data.message || 'Failed to save production data');
      }
    } catch (error) {
      console.error('Error saving production data:', error);
      showUniqueToast(error.response?.data?.message || 'Failed to save production data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter splits based on search term
  const filteredSplits = (selectedProduct?.code ? (batchSplits[selectedProduct.code] || []) : []).filter(split =>
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
            if (!selectedProduct?.code) return null;
            
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
          {selectedProduct?.code ? (
            <div>
              <div className="mb-3">
                <div className="d-flex gap-4 text-8">
                  <div>
                    <strong>Item Name:</strong> {formData.product?.label || "-"}
                  </div>
                  <div>
                    <strong>Total Produced Quantity:</strong> {formData.producedQty || "0"}
                  </div>
                  <div>
                    <strong>Generate Batch No:</strong>
                    <input 
                      type="number" 
                      value={generateBatchNo} 
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        const totalQuantity = parseFloat(formData.producedQty) || 0;
                        
                        // Validate the input value
                        if (value < 0) {
                          showUniqueToast('Number of batches cannot be negative');
                          return;
                        }
                        
                        if (value > totalQuantity) {
                          showUniqueToast(`Number of batches cannot exceed total quantity (${totalQuantity})`);
                          return;
                        }
                        
                        setGenerateBatchNo(value);
                        
                        if (!selectedProduct?.code) return;
                        
                        // Generate new batch splits based on the value
                        const newSplits = Array.from({ length: value }, () => ({
                          batchNo: '',
                          quantity: 0
                        }));
                        
                        setBatchSplits(prev => ({
                          ...prev,
                          [selectedProduct.code]: newSplits
                        }));
                      }}
                      min="0"
                      className="form-control text-8" />
                  </div>
                </div>
              </div>
              <Table striped bordered hover>
                <thead>
                  <tr className="text-8">
                  <th>Quantity</th>
                    <th>Item Name</th>
                    <th>Batch No</th>
                  </tr>
                </thead>
                <tbody className="text-8 text-break">
                  {filteredSplits.map((split, index) => (
                    <tr key={index}>
                        <td className="d-flex align-items-center gap-2">
                        <Form.Control
                          type="number"
                          size="sm"
                          value={split.quantity || ''}
                          onChange={(e) => handleQuantityChange(index, e.target.value)}
                          min="0"
                          step="0.001"
                          disabled={isLoading}
                        />
                       
                      </td>
                      <td>{formData.product?.label || "-"}</td>                  
                      
                      <td className="d-flex align-items-center gap-2">
                        <Form.Control
                          type="text"
                          size="sm"
                          value={split.batchNo}
                          onChange={(e) => {
                            setBatchSplits(prev => ({
                              ...prev,
                              [selectedProduct.code]: prev[selectedProduct.code].map((s, i) =>
                                i === index ? { ...s, batchNo: e.target.value } : s
                              )
                            }));
                          }}
                          readOnly={isLoading}
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
                          disabled={isLoading}
                        >
                          <i className="fas fa-trash" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="alert alert-info">
              <i className="fas fa-info-circle me-2"></i>
              No product selected
            </div>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" className="text-8" onClick={onHide}>
          <i className="fas fa-times me-2" />
          Close
        </Button>
        <Button variant="primary" className="text-8" onClick={handleSave} disabled={isLoading}>
          <i className="fas fa-floppy-disk me-2" />
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default BatchSplitModal;