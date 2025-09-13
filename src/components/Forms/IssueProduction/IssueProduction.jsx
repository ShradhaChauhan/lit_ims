import React, { useEffect, useState, useCallback, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import Select from "react-select";
import api from "../../../services/api";
import * as XLSX from "xlsx";
import BatchListModal from "../../Modals/BatchListModal";

// Toast configuration helper
const showToast = (type, message) => {
  toast[type](message, { autoClose: 30000 });
};

const IssueProduction = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [parentBomCode, setParentBomCode] = useState(null);
  const [parentBomName, setParentBomName] = useState(null);
  const [requestedItems, setRequestedItems] = useState([]);
  const [requisitionNumbers, setRequisitionNumbers] = useState([]);
  const [selectedRequisition, setSelectedRequisition] = useState("");
  const [batchNumber, setBatchNumber] = useState("");
  const [scannedBatches, setScannedBatches] = useState([]);
  const [isRequisitionLoaded, setIsRequisitionLoaded] = useState(false);
  const [allItemsFulfilled, setAllItemsFulfilled] = useState(false);
  const [batchList, setBatchList] = useState([]);
  const [type, setType] = useState({
    type: "item",
    parentBomCode: null,
    parentBomName: null,
  });
  const [itemCode, setItemCode] = useState("");
  const [itemWiseData, setItemWiseData] = useState([]);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [selectedItemBatches, setSelectedItemBatches] = useState([]);
  const [selectedItemName, setSelectedItemName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItemCode, setSelectedItemCode] = useState("");

  // Filter requested items based on search term
  const filteredRequestedItems = requestedItems.filter(
    (item) =>
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.itemName.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      // Reset state when component unmounts
      setSelectedRequisition("");
      setScannedBatches([]);
      setRequestedItems([]);
      setBatchNumber("");
      setAllItemsFulfilled(false);
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
      console.log("trno list: " + JSON.stringify(response.data.data));
      setRequisitionNumbers(response.data.data);
    } catch (error) {
      showToast("error", "Error in fetching requisition number list");
      console.error("Error fetching requisition number list:", error);
    }
  };

  const fetchBatchList = async (itemCode, itemName) => {
    try {
      const response = await api.get(`/api/receipt/by-item/${itemCode}`);
      if (response.data.status) {
        setSelectedItemBatches(response.data.data);
        setSelectedItemName(itemName);
        setSelectedItemCode(itemCode);
        setShowBatchModal(true);
      } else {
        showToast("error", "No batch details found for this item");
      }
    } catch (error) {
      showToast("error", "Error fetching item batch details");
      console.error("Error fetching item batch details:", error);
    }
  };

  const fetchRequisitionItems = async (requisitionNumber) => {
    try {
      const response = await api.get(
        `/api/requisitions/${requisitionNumber}/items/full`
      );

      if (response.data.status) {
        const items = response.data.data[0].items;
        setParentBomCode(response.data.data[0].parentBomCode);
        setParentBomName(response.data.data[0].parentBomName);
        // Get warehouseId from the requisition data
        setParentBomCode(response.data.data[0].parentBomCode);
        setParentBomName(response.data.data[0].parentBomName);
        // Get warehouseId from the requisition data
        const warehouseId = response.data.data[0].warehouseId;

        // Step 1: Fetch stockQty for each item in parallel
        const stockQtyPromises = items.map((item) =>
          api
            .post(`/api/inventory/itemQuantity/${warehouseId}/${item.code}`)
            .then((stockResponse) => {
              // Get quantity from the first item in the data array
              const quantity = stockResponse.data.data[0]?.quantity || 0;
              return quantity;
            })
            .catch((err) => {
              console.error(`Error fetching stockQty for ${item.code}:`, err);
              return 0; // fallback to 0
            })
        );

        // Step 2: Wait for all stockQty responses
        const stockQuantities = await Promise.all(stockQtyPromises);
        console.log("WIP stockQuantities: " + JSON.stringify(stockQuantities));

        const storeStockQtyPromises = items.map((item) =>
          api
            .post(`/api/inventory/itemQuantity/1/${item.code}`)
            .then((stockResponse) => {
              // Get quantity from the first item in the data array
              const quantity = stockResponse.data.data[0]?.quantity || 0;
              return quantity;
            })
            .catch((err) => {
              console.error(
                `Error fetching store stockQty for ${item.code}:`,
                err
              );
              return 0; // fallback to 0
            })
        );

        const storeStockQuantities = await Promise.all(storeStockQtyPromises);
        console.log(
          "store stockQuantities: " + JSON.stringify(storeStockQuantities)
        );
        // Step 3: Combine stockQty into formattedItems
        const formattedItems = items.map((item, index) => ({
          id: index + 1,
          itemName: item.name,
          code: item.code,
          requestedQty: item.quantityRequested,
          standardQty: item.stQuantity,
          issuedQty: 0,
          variance: 0,
          status: "Pending",
          wipStockQty: stockQuantities,
          storeStockQty: storeStockQuantities,
        }));

        // Step 4: Update state
        setRequestedItems(formattedItems);
        setType({
          type: response.data.data[0].type,
          parentBomCode: response.data.data[0].parentBomCode,
          parentBomName: response.data.data[0].parentBomName,
        });
        setIsRequisitionLoaded(true);
      }
    } catch (error) {
      showToast("error", "Error fetching requisition items");
      console.error("Error fetching requisition items:", error);
    }
  };

  const handleRequisitionChange = (selectedOption) => {
    const newRequisition = selectedOption ? selectedOption.value : "";
    if (newRequisition !== selectedRequisition) {
      // Clear scanned batches when changing requisition
      setSelectedRequisition(newRequisition);
      setIsRequisitionLoaded(false);
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

  const processIndividualBatch = async (batchNo) => {
    const errors = [];
    const warnings = [];

    // Extract item code from batch number (between index 7 and 15)
    if (batchNo.length < 15) {
      errors.push({ batch: batchNo, message: "Invalid batch number format" });
      return { success: false, errors, warnings };
    }

    const itemCodeFromBatch = batchNo.substring(7, 15);

    // Check if item exists in requested items before making API call
    const itemExists = requestedItems.some(
      (item) => item.code === itemCodeFromBatch
    );
    if (!itemExists) {
      warnings.push({
        batch: batchNo,
        message: "This item is not in the requisition list",
      });
      return { success: false, errors, warnings };
    }

    try {
      // Using the new API endpoint for verifying and issuing the batch
      const response = await api.post(
        `/api/receipt/batches/reserve?batchNo=${batchNo}`
      );

      if (response.data.status) {
        const batchData = response.data.data;
        
        // Log batch data for debugging
        console.log("Batch data from API:", {
          batchNo: batchData.batchNo,
          itemCode: batchData.itemCode,
          itemName: batchData.itemName,
          warehouseId: batchData.warehouseId
        });

        // Check if this batch has already been scanned
        const alreadyScanned = scannedBatches.some(
          (batch) => batch.batchNo === batchData.batchNo
        );
        if (alreadyScanned) {
          warnings.push({
            batch: batchNo,
            message: "This batch has already been scanned",
          });
          return { success: false, errors, warnings };
        }

        // Validate that the API returned the same item code we expected
        if (batchData.itemCode !== itemCodeFromBatch) {
          errors.push({ batch: batchNo, message: "Batch data mismatch" });
          return { success: false, errors, warnings };
        }

        // Check if this item's requested quantity is already fulfilled
        const matchingItem = requestedItems.find(
          (item) => item.code === batchData.itemCode
        );
        if (
          matchingItem &&
          matchingItem.issuedQty >= matchingItem.requestedQty
        ) {
          warnings.push({
            batch: batchNo,
            message: `Requested quantity for ${matchingItem.itemName} already fulfilled`,
          });
          return { success: false, errors, warnings };
        }

        // Add to scanned batches
        const newScannedBatch = {
          id: Date.now(), // Use timestamp as unique ID
          itemName: batchData.itemName,
          batchNo: batchData.batchNo,
          quantity: batchData.quantity,
          itemCode: batchData.itemCode,
          warehouseId: batchData.warehouseId,
        };

        setScannedBatches((prev) => [...prev, newScannedBatch]);

        // Update the requested items table with the issued quantity
        setRequestedItems((prevItems) =>
          prevItems.map((item) => {
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
          })
        );

        return { success: true, errors, warnings, batchData };
      } else {
        errors.push({
          batch: batchNo,
          message: response.data.message || "Invalid batch number",
        });
        return { success: false, errors, warnings };
      }
    } catch (error) {
      errors.push({
        batch: batchNo,
        message:
          error.response.data.message || "Error verifying and issuing batch",
      });
      console.error("Error verifying and issuing batch:", error);
      return { success: false, errors, warnings };
    }
  };

  const verifyBatch = async (batchInput) => {
    if (!batchInput.trim()) {
      showToast("error", "Please enter a batch number");
      return;
    }

    if (!selectedRequisition) {
      showToast("error", "Please select a requisition first");
      return;
    }

    if (allItemsFulfilled) {
      showToast("warning", "All requested quantities have been fulfilled");
      setBatchNumber("");
      return;
    }

    // Split batch numbers by comma and trim whitespace
    const batchNumbers = batchInput.split(",").map((batch) => batch.trim());
    const allErrors = [];
    const allWarnings = [];
    let successCount = 0;

    // Process each batch number sequentially
    for (const batchNo of batchNumbers) {
      const result = await processIndividualBatch(batchNo);

      if (result.errors.length > 0) allErrors.push(...result.errors);
      if (result.warnings.length > 0) allWarnings.push(...result.warnings);
      if (result.success) successCount++;
    }

    // Display results
    if (successCount > 0) {
      toast.success(
        `Successfully processed ${successCount} batch${
          successCount > 1 ? "es" : ""
        }`
      );
    }

    // Display errors and warnings
    if (allErrors.length > 0) {
      allErrors.forEach((error) => {
        showToast("error", `Batch ${error.batch}: ${error.message}`);
      });
    }

    if (allWarnings.length > 0) {
      allWarnings.forEach((warning) => {
        showToast("warning", `Batch ${warning.batch}: ${warning.message}`);
      });
    }

    setBatchNumber("");
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
        showToast("error", "Failed to release batch");
      }
    } catch (error) {
      console.error("Error releasing batch:", error);
      showToast("error", "Error releasing batch. Please try again.");
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
              // stockQty: batch.stockQty
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
  // const handleCompleteIssue = async (e) => {
  //   e.preventDefault();

  //   if (!selectedRequisition) {
  //     showToast("error", "Please select a requisition first");
  //     return;
  //   }

  //   if (scannedBatches.length === 0) {
  //     showToast("error", "No batches have been scanned for issue");
  //     return;
  //   }

  //   try {
  //     s
  //     for (const batch of scannedBatches) {
  //       const confirmResponse = await api.post(
  //         `/api/receipt/batches/confirm?batchNo=${batch.batchNo}`
  //       );

  //       if (!confirmResponse.data.status) {
  //         showToast("error", `Failed to confirm batch ${batch.batchNo}`);
  //         return;
  //       }
  //     }

     
  //     const finalData = {
  //       issueNumber: issueNumber,
  //       requisitionNumber: selectedRequisition,
  //       batchItems: scannedBatches.map((batch) => {
         
  //         const item = requestedItems.find(
  //           (item) => item.code === batch.itemCode
  //         );

  //         return {
  //           itemCode: batch.itemCode,
  //           itemName: batch.itemName,
  //           batchNo: batch.batchNo,
  //           quantity: batch.quantity,
  //           issuedQty: batch.quantity,
  //           variance: item ? item.variance : 0,
  //           warehouseId: batch.warehouseId,
  //         };
  //       }),
  //     };
  //     // Log warehouse IDs for debugging
  //     console.log("Warehouse IDs:", scannedBatches.map(batch => `${batch.batchNo}: ${batch.warehouseId}`));
  //     console.log("finalData: " + JSON.stringify(finalData));
  //     // Send data to the API
  //     const response = await api.post("/api/issue-production/save", finalData);

  //     if (response.data.status) {
  //       showToast("success", "Issue completed successfully");

  //       // Reset form state completely without releasing batches
  //       // (batches are already saved to the system)
  //       setSelectedRequisition("");
  //       setScannedBatches([]);
  //       setRequestedItems([]);
  //       setBatchNumber("");
  //       setAllItemsFulfilled(false);

  //       // Generate a new issue number for the next entry
  //       setIssueNumber(generateIssueNumber());

  //       // Refresh the requisition number list
  //       handleFetchRequisitionNumberList();
  //     } else {
  //       showToast(
  //         "error",
  //         response.data.message || "Failed to complete the issue"
  //       );
  //     }
  //   } catch (error) {
  //     let errorMessage = "Failed to complete the issue. Please try again.";

  //     if (error.response) {
  //       if (error.response.data.message) {
  //         // For structured error from backend (with message field)
  //         errorMessage = error.response.data.message;
  //       } else if (typeof error.response.data === "string") {
  //         // For plain string error from backend
  //         errorMessage = error.response.data;
  //       }
  //     } else {
  //       errorMessage = error.message;
  //     }

  //     console.error("Error in completing the issue:", errorMessage);
  //     showToast("error", errorMessage);
  //   }
  // };

  // Clear form function
  const handleClearForm = () => {
    // Reset form state
    setSelectedRequisition("");
    setScannedBatches([]);
    setRequestedItems([]);
    setBatchNumber("");
    setAllItemsFulfilled(false);
    setIsRequisitionLoaded(false);

    // Generate a new issue number
    setIssueNumber(generateIssueNumber());

    showToast("info", "Form cleared successfully");
  };

  // Export to Excel
  const handleExport = (e) => {
    e.preventDefault();

    // Create worksheet data
    const wsData = [
      ["(" + parentBomCode + ") " + parentBomName + " Report"],
      [], // Empty row for spacing
      ["Generated on: " + new Date().toLocaleString()],
      [], // Empty row for spacing
      [
        "Item Code",
        "Item Name",
        "WIP Stock Qty",
        "Requested Qty",
        "Issued Qty",
        "Variance",
        "Status",
      ],
    ];

    // Add data rows
    requestedItems.forEach((item) => {
      wsData.push([
        item.code,
        item.itemName,
        item.stockQty,
        item.requestedQty,
        item.issuedQty,
        item.variance,
        item.status,
      ]);
    });

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Set column widths
    const colWidths = [
      { wch: 15 }, // Item Code
      { wch: 30 }, // Item Name
      { wch: 15 }, // WIP Stock Qty
      { wch: 15 }, // Requested Qty
      { wch: 15 }, // Issued Qty
      { wch: 15 }, // Variance
      { wch: 15 }, // Status
    ];
    ws["!cols"] = colWidths;

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, "Issue Production");

    // Save the file
    XLSX.writeFile(wb, `(${parentBomCode}) ${parentBomName} Report.xlsx`);
  };

  return (
    <div>
      {" "}
      {/* Header section */}
      <nav className="navbar bg-light border-body" data-bs-theme="light">
        <div className="container-fluid">
          <div className="mt-4">
            <h3 className="nav-header header-style">Material Issue Transfer</h3>
            <p className="breadcrumb">
              <Link to="/dashboard">
                <i className="fas fa-home text-8"></i>
              </Link>{" "}
              <span className="ms-1 mt-1 text-small-gray">
                / Transactions / Material Issue Transfer
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
                      <i
                        className="fas fa-file-invoice position-absolute input-icon"
                        style={{
                          left: "15px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          zIndex: "1",
                        }}
                      ></i>
                      <Select
                        className="text-font"
                        styles={{
                          control: (base) => ({
                            ...base,
                            paddingLeft: "32px",
                            minHeight: "32px",
                            height: "32px",
                          }),
                          valueContainer: (base) => ({
                            ...base,
                            height: "32px",
                            padding: "0 8px",
                            display: "flex",
                            alignItems: "center",
                          }),
                          input: (base) => ({
                            ...base,
                            margin: "0px",
                            padding: "0px",
                          }),
                          singleValue: (base) => ({
                            ...base,
                            margin: "0",
                            padding: "0",
                            lineHeight: "32px", // aligns text with height
                            display: "flex",
                            alignItems: "center",
                          }),
                          placeholder: (base) => ({
                            ...base,
                            lineHeight: "32px",
                            display: "flex",
                            alignItems: "center",
                          }),
                        }}
                        classNamePrefix="select"
                        id="requisitionType"
                        value={
                          selectedRequisition
                            ? {
                                value: selectedRequisition,
                                label: requisitionNumbers.find(
                                  (r) =>
                                    r.transactionNumber === selectedRequisition
                                )
                                  ? `(${
                                      requisitionNumbers.find(
                                        (r) =>
                                          r.transactionNumber ===
                                          selectedRequisition
                                      ).warehouseName
                                    }) - ${selectedRequisition} - (${
                                      requisitionNumbers.find(
                                        (r) =>
                                          r.transactionNumber ===
                                          selectedRequisition
                                      ).date
                                    })`
                                  : selectedRequisition,
                              }
                            : null
                        }
                        onChange={handleRequisitionChange}
                        options={requisitionNumbers.map((reqNumber) => ({
                          value: reqNumber.transactionNumber,
                          label: `(${reqNumber.warehouseName}) - ${reqNumber.transactionNumber} - (${reqNumber.date})`,
                        }))}
                        placeholder="Select Requisition"
                        isClearable
                        isSearchable
                      />
                    </div>
                  </div>
                  {/* {isRequisitionLoaded && (
                    <>
                      <div className="col-3 d-flex flex-column form-group">
                        <label
                          htmlFor="parentItemName"
                          className="form-label ms-2"
                        >
                          Parent Item Name{" "}
                          <span className="text-danger fs-6">*</span>
                        </label>
                        <div className="position-relative w-100">
                          <i className="fas fa-box ms-2 position-absolute z-0 input-icon"></i>
                          <input
                            id="parentItemName"
                            className="form-control ps-5 ms-1 text-font"
                            value={
                              parentBomCode && parentBomName
                                ? `(${parentBomCode}) - ${parentBomName}`
                                : ""
                            }
                            disabled
                          />
                        </div>
                      </div>
                      <div className="col-3 d-flex flex-column form-group">
                        <label
                          htmlFor="requestedQty"
                          className="form-label ms-2"
                        >
                          Requested Qty{" "}
                          <span className="text-danger fs-6">*</span>
                        </label>
                        <div className="position-relative w-100">
                          <i className="fas fa-cubes ms-2 position-absolute z-0 input-icon"></i>
                          <input
                            id="requestedQty"
                            className="form-control ps-5 ms-1 text-font"
                            value={requestedItems.reduce(
                              (total, item) => total + item.requestedQty,
                              0
                            )}
                            disabled
                          />
                        </div>
                      </div>
                    </>
                  )} */}

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
                  <div className="d-flex justify-content-between align-items-center w-100">
                    <h6>
                      {type.type === "item"
                        ? "Individual Items"
                        : "(" +
                          type.parentBomName +
                          " - " +
                          type.parentBomCode +
                          ") - BOM Items"}
                    </h6>
                    <div className="d-flex align-items-center gap-3">
                      <div className="position-relative">
                        <i
                          className="fas fa-search position-absolute input-icon"
                          style={{
                            left: "10px",
                            top: "50%",
                            transform: "translateY(-50%)",
                          }}
                        ></i>
                        <input
                          type="text"
                          className="form-control ps-5"
                          placeholder="Search items..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          style={{
                            width: "250px",
                            paddingLeft: "30px",
                            fontSize: "0.8rem",
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        className="btn btn-outline-success px-2 py-1 text-8"
                        onClick={handleExport}
                      >
                        <i className="fa-solid fa-file-excel me-1"></i> Export
                        Excel
                      </button>
                    </div>
                  </div>
                </div>
                <table>
                  <thead>
                    <tr className="text-break">
                      <th>Item Code</th>
                      <th>Item Name</th>
                      <th>Requested Qty</th>
                      {/* <th>Standard Qty</th> */}
                      <th>Issued Qty</th>
                      <th>Variance</th>
                      <th>WIP Stock Qty</th>
                      <th>Store Stock Qty</th>
                      <th>Actions</th>
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
                    ) : filteredRequestedItems.length === 0 ? (
                      <tr className="no-data-row">
                        <td colSpan="7" className="no-data-cell">
                          <div className="no-data-content">
                            <i className="fas fa-search no-data-icon"></i>
                            <p className="no-data-text">
                              No matching items found
                            </p>
                            <p className="no-data-subtext">
                              Try a different search term
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredRequestedItems.map((item, index) => (
                        <tr key={item.id}>
                          <td className="ps-4">
                            <div>
                              <span>{item.code}</span>
                            </div>
                          </td>
                          <td className="ps-4">
                            <div>
                              <span>{item.itemName}</span>
                            </div>
                          </td>
                          <td
                            className="ps-4"
                            style={{
                              backgroundColor:
                                item.status.toLowerCase() === "completed"
                                  ? "#e6f4ea"
                                  : "#fff3cd",
                            }}
                          >
                            <div>
                              <span>{item.requestedQty}</span>
                            </div>
                          </td>
                          {/* <td className="ps-4">
                            <div>
                              <span>{item.standardQty}</span>
                            </div>
                          </td> */}
                          <td
                            className="ps-4"
                            style={{
                              backgroundColor:
                                item.status.toLowerCase() === "completed"
                                  ? "#e6f4ea"
                                  : "#e8f0fe",
                            }}
                          >
                            <div>
                              <span>{item.issuedQty}</span>
                            </div>
                          </td>
                          <td
                            className="ps-4"
                            style={{
                              backgroundColor:
                                item.variance > 0
                                  ? "#e6f4ea"
                                  : item.variance < 0
                                  ? "#fce8e6"
                                  : "transparent",
                            }}
                          >
                            <div>
                              <span>{item.variance}</span>
                            </div>
                          </td>
                          <td
                            className="ps-4"
                            style={{ backgroundColor: "#e2e6e8ff" }}
                          >
                            <div>
                              <span>{item.wipStockQty[index]}</span>
                            </div>
                          </td>

                          <td
                            className="ps-4"
                            style={{ backgroundColor: "#e2e6e8ff" }}
                          >
                            <div>
                              <span>{item.storeStockQty[index]}</span>
                            </div>
                          </td>
                          <td className="ps-4">
                            <button
                              type="button"
                              className="btn-icon view p-0"
                              onClick={() =>
                                fetchBatchList(item.code, item.itemName)
                              }
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                          </td>
                          <td className="ps-4">
                            <div>
                              <span
                                className={`badge status ${
                                  item.status.toLowerCase() === "completed"
                                    ? "completed"
                                    : "pending"
                                }`}
                                style={{
                                  backgroundColor:
                                    item.status.toLowerCase() === "completed"
                                      ? "#e6f4ea"
                                      : "#fff3cd",
                                  color:
                                    item.status.toLowerCase() === "completed"
                                      ? "#1e4620"
                                      : "#856404",
                                }}
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
                              <span>
                                {"(" + batch.itemCode + ") " + batch.itemName}
                              </span>
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
      {/* Batch List Modal */}
      <BatchListModal
        show={showBatchModal}
        onHide={() => setShowBatchModal(false)}
        batchList={selectedItemBatches}
        itemName={selectedItemName}
        itemCode={selectedItemCode}
      />
    </div>
  );
};

export default IssueProduction;
