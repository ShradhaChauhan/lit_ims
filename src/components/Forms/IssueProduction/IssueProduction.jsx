import React, { useEffect, useState, useCallback, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../../services/api";
import { AppContext } from "../../../context/AppContext";

const IssueProduction = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [requestedItems, setRequestedItems] = useState([]);
  const [requisitionNumbers, setRequisitionNumbers] = useState([]);
  const [selectedRequisition, setSelectedRequisition] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [scannedBatches, setScannedBatches] = useState([]);
  const [allItemsFulfilled, setAllItemsFulfilled] = useState(false);

  // Auto generate issue number
  const generateIssueNumber = () => {
    const year = new Date().getFullYear(); // e.g., 2025
    const randomNum = Math.floor(1000 + Math.random() * 9000); // 4-digit random
    return `ISS-${year}-${randomNum}`;
  };

  const [issueNumber, setIssueNumber] = useState(generateIssueNumber());

  // Fetch and Load Requisition Number List
  useEffect(() => {
    handleFetchRequisitionNumberList();
  }, []);

  // Fetch item details when requisition is selected
  useEffect(() => {
    if (selectedRequisition) {
      fetchRequisitionItems(selectedRequisition);
      // Reset scanned batches when requisition changes
      releaseAllBatches();
      setScannedBatches([]);
      setAllItemsFulfilled(false);
    }
  }, [selectedRequisition]);

  // Check if all items are fulfilled whenever requestedItems changes
  useEffect(() => {
    if (requestedItems.length > 0) {
      const allFulfilled = requestedItems.every(
        (item) => item.issuedQty >= item.requestedQty
      );
      setAllItemsFulfilled(allFulfilled);
    }
  }, [requestedItems]);

  // Function placeholder - no longer performs batch release
  const releaseAllBatches = useCallback(async () => {
    if (scannedBatches.length === 0) return;
    // Batch release functionality removed
    console.log("Release batches function called");
  }, [scannedBatches]);

  // Cleanup effect when component unmounts or user navigates away
  useEffect(() => {
    // This will run when the component unmounts
    return () => {
      // Cleanup code (batch release removed)
    };
  }, []);

  // Handle page navigation or refresh
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (scannedBatches.length > 0) {
        // Standard way to show a confirmation dialog before leaving
        const message =
          "You have unsaved changes. Are you sure you want to leave?";
        event.returnValue = message;
        return message;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [scannedBatches]);

  const handleFetchRequisitionNumberList = async () => {
    try {
      const response = await api.get("/api/requisitions/trNo");
      setRequisitionNumbers(response.data.data);
    } catch (error) {
      toast.error("Error in fetching requisition number list");
      console.error("Error fetching requisition number list:", error);
    }
  };

  const fetchRequisitionItems = async (requisitionNumber) => {
    try {
      const response = await api.get(
        `/api/requisitions/${requisitionNumber}/items/full`
      );
      if (response.data.status) {
        const formattedItems = response.data.data.map((item, index) => ({
          id: index + 1,
          itemName: item.name,
          code: item.code,
          requestedQty: item.quantityRequested,
          standardQty: item.stQuantity,
          issuedQty: 0,
          variance: 0,
          status: "Pending",
        }));
        setRequestedItems(formattedItems);
      }
    } catch (error) {
      toast.error("Error fetching requisition items");
      console.error("Error fetching requisition items:", error);
    }
  };

  const handleRequisitionChange = (e) => {
    const newRequisition = e.target.value;
    if (newRequisition !== selectedRequisition) {
      // Clear scanned batches when changing requisition
      setSelectedRequisition(newRequisition);
    }
  };

  const handleBatchNumberChange = (e) => {
    setBatchNumber(e.target.value);
  };

  const handleBatchNumberKeyDown = async (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      await verifyBatch(batchNumber);
    }
  };

  const verifyBatch = async (batchNo) => {
    if (!batchNo.trim()) {
      toast.error("Please enter a batch number");
      return;
    }

    if (!selectedRequisition) {
      toast.error("Please select a requisition first");
      return;
    }

    if (allItemsFulfilled) {
      toast.warning("All requested quantities have been fulfilled");
      setBatchNumber("");
      return;
    }

    try {
      // Using the new API endpoint for verifying and issuing the batch
      const response = await api.post(
        `/api/receipt/batches/reserve?batchNo=${batchNo}`
      );

      if (response.data.status) {
        const batchData = response.data.data;

        // Check if this batch has already been scanned
        const alreadyScanned = scannedBatches.some(
          (batch) => batch.batchNo === batchData.batchNo
        );
        if (alreadyScanned) {
          toast.warning("This batch has already been scanned");
          setBatchNumber("");
          return;
        }

        // Check if this item's requested quantity is already fulfilled
        const matchingItem = requestedItems.find(
          (item) => item.code === batchData.itemCode
        );
        if (
          matchingItem &&
          matchingItem.issuedQty >= matchingItem.requestedQty
        ) {
          toast.warning(
            `Requested quantity for ${matchingItem.itemName} already fulfilled`
          );
          setBatchNumber("");
          return;
        }

        // Add to scanned batches
        const newScannedBatch = {
          id: Date.now(), // Use timestamp as unique ID
          itemName: batchData.itemName,
          batchNo: batchData.batchNo,
          quantity: batchData.quantity,
          itemCode: batchData.itemCode,
        };

        setScannedBatches([...scannedBatches, newScannedBatch]);

        // Update the requested items table with the issued quantity
        const updatedItems = requestedItems.map((item) => {
          if (item.code === batchData.itemCode) {
            const newIssuedQty = item.issuedQty + batchData.quantity;
            const newVariance = newIssuedQty - item.requestedQty;
            const newStatus =
              newIssuedQty >= item.requestedQty ? "Completed" : "Pending";

            return {
              ...item,
              issuedQty: newIssuedQty,
              variance: newVariance,
              status: newStatus,
            };
          }
          return item;
        });

        setRequestedItems(updatedItems);
        toast.success("Batch verified and issued successfully");
        setBatchNumber("");
      } else {
        toast.error(response.data.message || "Invalid batch number");
        setBatchNumber("");
      }
    } catch (error) {
      toast.error("Error verifying and issuing batch");
      console.error("Error verifying and issuing batch:", error);
      setBatchNumber("");
    }
  };

  const handleRemoveBatch = async (batchToRemove) => {
    try {
      // Call API to release the batch
      const response = await api.delete(
        `/api/receipt/release-reservation?batchNo=${batchToRemove.batchNo}`
      );

      if (response.data.status) {
        // Find the item associated with this batch
        const itemToUpdate = requestedItems.find(
          (item) => item.code === batchToRemove.itemCode
        );

        if (itemToUpdate) {
          // Update the requested items table
          const updatedItems = requestedItems.map((item) => {
            if (item.code === batchToRemove.itemCode) {
              const newIssuedQty = Math.max(
                0,
                item.issuedQty - batchToRemove.quantity
              );
              // Calculate variance: issued - requested (can be negative if less issued than requested)
              const newVariance = newIssuedQty - item.requestedQty;
              const newStatus = "Pending"; // Always revert to pending when removing a batch

              return {
                ...item,
                issuedQty: newIssuedQty,
                variance: newVariance,
                status: newStatus,
              };
            }
            return item;
          });

          setRequestedItems(updatedItems);
        }

        // Remove from scanned batches
        const updatedBatches = scannedBatches.filter(
          (batch) => batch.id !== batchToRemove.id
        );
        setScannedBatches(updatedBatches);
        toast.success("Batch removed and released successfully");
      } else {
        toast.error("Failed to release batch");
      }
    } catch (error) {
      console.error("Error releasing batch:", error);
      toast.error("Error releasing batch. Please try again.");
    }
  };

  const handleCompleteIssue = async (e) => {
    e.preventDefault();

    if (!selectedRequisition) {
      toast.error("Please select a requisition first");
      return;
    }

    if (scannedBatches.length === 0) {
      toast.error("No batches have been scanned for issue");
      return;
    }

    try {
      // First confirm all batch allocations
      for (const batch of scannedBatches) {
        const confirmResponse = await api.post(
          `/api/receipt/batches/confirm?batchNo=${batch.batchNo}`
        );

        if (!confirmResponse.data.status) {
          toast.error(`Failed to confirm batch ${batch.batchNo}`);
          return;
        }
      }

      // Format the data according to the expected structure
      const finalData = {
        issueNumber: issueNumber,
        requisitionNumber: selectedRequisition,
        batchItems: scannedBatches.map((batch) => {
          // Find the corresponding item to get variance
          const item = requestedItems.find(
            (item) => item.code === batch.itemCode
          );

          return {
            itemCode: batch.itemCode,
            itemName: batch.itemName,
            batchNo: batch.batchNo,
            quantity: batch.quantity,
            issuedQty: batch.quantity,
            variance: item ? item.variance : 0,
          };
        }),
      };

      // Send data to the API
      const response = await api.post("/api/issue-production/save", finalData);

      if (response.data.status) {
        toast.success("Issue completed successfully");

        // Reset form state completely without releasing batches
        // (batches are already saved to the system)
        setSelectedRequisition("");
        setScannedBatches([]);
        setRequestedItems([]);
        setBatchNumber("");
        setAllItemsFulfilled(false);

        // Generate a new issue number for the next entry
        setIssueNumber(generateIssueNumber());

        // Refresh the requisition number list
        handleFetchRequisitionNumberList();
      } else {
        toast.error(response.data.message || "Failed to complete the issue");
      }
    } catch (error) {
      let errorMessage = "Failed to complete the issue. Please try again.";

      if (error.response) {
        if (error.response.data.message) {
          // For structured error from backend (with message field)
          errorMessage = error.response.data.message;
        } else if (typeof error.response.data === "string") {
          // For plain string error from backend
          errorMessage = error.response.data;
        }
      } else {
        errorMessage = error.message;
      }

      console.error("Error in completing the issue:", errorMessage);
      toast.error(errorMessage);
    }
  };

  // Clear form function
  const handleClearForm = () => {
    // Reset form state
    setSelectedRequisition("");
    setScannedBatches([]);
    setRequestedItems([]);
    setBatchNumber("");
    setAllItemsFulfilled(false);

    // Generate a new issue number
    setIssueNumber(generateIssueNumber());

    toast.info("Form cleared successfully");
  };

  // Role based access
  const { getPermission } = useContext(AppContext);
  const { canView, canEdit } = getPermission("Issue to Production");

  if (!canView) return <p>Access Denied</p>;

  return (
    <div>
      {" "}
      {/* Header section */}
      <nav className="navbar bg-light border-body" data-bs-theme="light">
        <div className="container-fluid">
          <div className="mt-4">
            <h3 className="nav-header header-style">Issue to Production</h3>
            <p className="breadcrumb">
              <Link to="/dashboard">
                <i className="fas fa-home text-8"></i>
              </Link>{" "}
              <span className="ms-1 mt-1 text-small-gray">
                / Transactions / Issue to Production
              </span>
            </p>
          </div>
        </div>
      </nav>
      {/* Form Section */}
      <div className="table-form-container mx-2 mb-5">
        <div className="form-header">
          <h2>
            <i className="fas fa-dolly"></i> Material Issue Entry
          </h2>
          <p>
            Issue #: <strong>{issueNumber}</strong>
          </p>
        </div>
        {/* Form Fields */}
        <form autoComplete="off" className="padding-2">
          <div className="form-grid pt-0">
            {/* Input fields section */}
            <div className="row form-style">
              {/* Requisition Type */}
              <div className="form-group">
                <div className="row form-style">
                  <div className="col-6 d-flex flex-column form-group">
                    <label
                      htmlFor="requisitionType"
                      className="form-label ms-2"
                    >
                      Requisition Number{" "}
                      <span className="text-danger fs-6">*</span>
                    </label>
                    <div className="position-relative w-100">
                      <i className="fas fa-file-invoice ms-2 position-absolute z-0 input-icon"></i>
                      <select
                        className="form-control ps-5 ms-1 text-font"
                        id="requisitionType"
                        value={selectedRequisition}
                        onChange={handleRequisitionChange}
                      >
                        <option value="">Select Requisition</option>
                        {requisitionNumbers.map((reqNumber, index) => (
                          <option key={index} value={reqNumber}>
                            {reqNumber}
                          </option>
                        ))}
                      </select>

                      <i className="fa-solid fa-angle-down position-absolute down-arrow-icon"></i>
                    </div>
                  </div>
                  <div className="col-6 d-flex flex-column form-group">
                    <label htmlFor="scanBatch" className="form-label ms-2">
                      Scan Batch <span className="text-danger fs-6">*</span>
                    </label>
                    <div className="position-relative w-100">
                      <i className="fas fa-barcode ms-2 position-absolute z-0 input-icon"></i>
                      <input
                        type="text"
                        id="scanBatch"
                        className="form-control ps-5 ms-1 text-font"
                        placeholder={
                          allItemsFulfilled
                            ? "All quantities fulfilled"
                            : "Scan batch number"
                        }
                        value={batchNumber}
                        onChange={handleBatchNumberChange}
                        onKeyDown={handleBatchNumberKeyDown}
                        disabled={allItemsFulfilled}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Requested Items Table Section */}
            <div className="margin-2 mx-2">
              <div className="table-container">
                <div className="table-header">
                  <h6>Requested Items</h6>
                </div>
                <table>
                  <thead>
                    <tr className="text-break">
                      <th>Item Name</th>
                      <th>Code</th>
                      <th>Requested Qty</th>
                      <th>Standard Qty</th>
                      <th>Issued Qty</th>
                      <th>Variance</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-break">
                    {requestedItems.length === 0 ? (
                      <tr className="no-data-row">
                        <td colSpan="7" className="no-data-cell">
                          <div className="no-data-content">
                            <i className="fas fa-dolly no-data-icon"></i>
                            <p className="no-data-text">No Items to Issue</p>
                            <p className="no-data-subtext">
                              Select a requisition to view items
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      requestedItems.map((item) => (
                        <tr key={item.id}>
                          <td className="ps-4">
                            <div>
                              <span>{item.itemName}</span>
                            </div>
                          </td>
                          <td className="ps-4">
                            <div>
                              <span>{item.code}</span>
                            </div>
                          </td>
                          <td className="ps-4">
                            <div>
                              <span>{item.requestedQty}</span>
                            </div>
                          </td>
                          <td className="ps-4">
                            <div>
                              <span>{item.standardQty}</span>
                            </div>
                          </td>
                          <td className="ps-4">
                            <div>
                              <span>{item.issuedQty}</span>
                            </div>
                          </td>
                          <td className="ps-4">
                            <div>
                              <span>{item.variance}</span>
                            </div>
                          </td>
                          <td className="ps-4">
                            <div>
                              <span
                                className={`badge status ${
                                  item.status.toLowerCase() === "pending"
                                    ? "inactive"
                                    : "active"
                                }`}
                              >
                                {item.status}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>{" "}
            {/* Scanned Batches Table Section */}
            <div className="margin-2 mx-2">
              <div className="table-container">
                <div className="table-header">
                  <h6>Scanned Batches</h6>
                </div>
                <table>
                  <thead>
                    <tr className="text-break">
                      <th>Item Name</th>
                      <th>Batch No</th>
                      <th>Quantity</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-break">
                    {scannedBatches.length === 0 ? (
                      <tr className="no-data-row">
                        <td colSpan="4" className="no-data-cell">
                          <div className="no-data-content">
                            <i className="fas fa-barcode no-data-icon"></i>
                            <p className="no-data-text">No Batches Scanned</p>
                            <p className="no-data-subtext">
                              Scan batches to issue materials
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      scannedBatches.map((batch) => (
                        <tr key={batch.id}>
                          <td className="ps-4">
                            <div>
                              <span>{batch.itemName}</span>
                            </div>
                          </td>
                          <td className="ps-4">
                            <div>
                              <span>{batch.batchNo}</span>
                            </div>
                          </td>
                          <td className="ps-4">
                            <div>
                              <span>{batch.quantity}</span>
                            </div>
                          </td>
                          <td className="ps-4">
                            <div>
                              <button
                                type="button"
                                className="btn-icon btn-danger"
                                onClick={() => handleRemoveBatch(batch)}
                              >
                                <i className="fas fa-trash"></i>
                              </button>
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
        </form>
        <div className="form-actions mt-0">
          <button
            type="submit"
            className="btn btn-primary add-btn mb-4"
            onClick={handleCompleteIssue}
          >
            <i className="fa-solid fa-check-circle me-1"></i> Complete Issue
          </button>
          <button
            className="btn btn-secondary add-btn mb-4 me-3"
            type="button"
            onClick={handleClearForm}
          >
            <i className="fa-solid fa-xmark me-1"></i> Clear
          </button>
        </div>
      </div>
    </div>
  );
};

export default IssueProduction;
