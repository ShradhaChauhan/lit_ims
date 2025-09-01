import { Modal } from "bootstrap";
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../../services/api";
import "./MaterialIncoming.css";
import Select from "react-select";

const MaterialIncoming = () => {
  const selectAllRef = useRef(null);
  const [selectedRows, setSelectedRows] = useState([]); // store selected row indexes
  const [printedRows, setPrintedRows] = useState([]); // permanently disabled row indexes
  const [lockedItemCode, setLockedItemCode] = useState(null); // active itemCode for current cycle
  const modalRef = useRef(null);
  const [errors, setErrors] = useState({});
  const [confirmState, setConfirmState] = useState(false);
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const receiptModalRef = useRef(null);
  const [mode, setMode] = useState("");
  const [itemQuantity, setItemQuantity] = useState("");
  const [vcode, setVcode] = useState("");
  const [vendor, setVendor] = useState("");
  const [vendors, setVendors] = useState([]);
  const [vendorItem, setVendorItem] = useState("");
  const [vendorItems, setVendorItems] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [warehouse, setWarehouse] = useState("");
  const [loading, setLoading] = useState(false);
  const [isShowReceiptDetails, setIsShowReceiptDetails] = useState(false);
  const [currentReceipt, setCurrentReceipt] = useState(null);
  const [isStdQty, setIsStdQty] = useState(true);
  const [isConfirmModal, setIsConfirmModal] = useState(false);
  // Preview modal state
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const previewModalRef = useRef(null);
  const [invoiceNumber, setInvoiceNumber] = useState("");
  // receiptList is used to store the concatenated formData and show it in the table and to save the material receipt entry in database.
  const [receiptList, setReceiptList] = useState([]);
  // formData is used to set, reset and validate the form data.
  const [formData, setFormData] = useState({
    mode: "",
    vendor: "",
    vendorName: "",
    code: "",
    item: "",
    barcode: "",
    quantity: "",
    itemCode: "",
    itemName: "",
    warehouse: "",
    batchno: "",
    invoice: "",
    numberOfBatches: "1", // Add new field for number of batch numbers to generate
  });

  const handleReset = (e) => {
    e.preventDefault();
    setFormData({
      mode: "",
      vendor: "",
      vendorName: "",
      code: "",
      item: "",
      barcode: "",
      quantity: "",
      itemCode: "",
      itemName: "",
      batchno: "",
      warehouse: "",
      invoice: "",
      numberOfBatches: "1", // Reset to default value
    });
    setMode("");
    setVendor("");
    setReceiptList([]);
  };

  useEffect(() => {
    if (isConfirmModal && modalRef.current) {
      const bsModal = new Modal(modalRef.current, {
        backdrop: "static",
      });
      bsModal.show();

      // Optional: hide modal state when it's closed
      modalRef.current.addEventListener("hidden.bs.modal", () =>
        setIsConfirmModal(false)
      );
    }
  }, [isConfirmModal]);

  const handleViewDetails = (receipt, e) => {
    e.preventDefault();
    console.log(receipt);
    // Store the current receipt for viewing in the modal
    setCurrentReceipt(receipt);
    setIsShowReceiptDetails(true);
  };

  const handleDeleteItem = (index, e) => {
    e.preventDefault();
    setReceiptList((prev) => prev.filter((_, i) => i !== index));
    toast.success("Item removed from receipt");
  };

  // Global function to clean up modal artifacts
  const cleanupModalArtifacts = () => {
    console.log("Cleaning up modal artifacts");
    document.body.classList.remove("modal-open");
    document.body.style.paddingRight = "";
    document.body.style.overflow = "";
    const backdrops = document.getElementsByClassName("modal-backdrop");
    while (backdrops.length > 0) {
      backdrops[0].remove();
    }
  };

  useEffect(() => {
    getVendorsList(); // Fetch vendor data.
    if (isShowReceiptDetails && receiptModalRef.current) {
      const bsModal = new Modal(receiptModalRef.current, {
        backdrop: "static",
      });
      bsModal.show();

      // Optional: hide modal state when it's closed
      receiptModalRef.current.addEventListener("hidden.bs.modal", () =>
        setIsShowReceiptDetails(false)
      );
    }
  }, [isShowReceiptDetails]);

  useEffect(() => {
    getVendorsList();
  }, []);

  useEffect(() => {
    getWarehouses();
  }, []);

  const getWarehouses = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/warehouses/store-and-iqc");
      if (response.data && response.data.data) {
        setWarehouses(response.data.data);
      } else {
        toast.error("No warehouses found or invalid response format");
        console.error("Invalid warehouses response:", response);
      }
    } catch (error) {
      toast.error(error.response.data.message);
      console.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (data) => {
    const errors = {};
    console.log(data);
    if (!mode) {
      errors.mode = "Please select a mode";
    }

    if (!data.vendor && mode === "manual") {
      errors.vendor = "Please select vendor name";
    }

    if (!data.quantity > 0) {
      errors.quantity = "Please enter a valid quantity";
    }

    // Validate numberOfBatches for manual mode
    if (mode === "manual") {
      const numberOfBatches = parseInt(data.numberOfBatches);
      if (!numberOfBatches || numberOfBatches < 1 || numberOfBatches > 50) {
        errors.numberOfBatches =
          "Number of batch numbers must be between 1 and 50";
      }
    }

    // if (!data.item) {
    //   errors.item = "Please select an item";
    // }

    return errors;
  };

  const handleAddReceiptItem = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const newErrors = validateForm(formData);
      setErrors(newErrors);

      // Only proceed if there are no validation errors
      if (Object.keys(newErrors).length > 0) {
        setLoading(false);
        return;
      }

      if (mode === "scan") {
        // Verify the batchno if the mode is scan
        if (!formData.barcode) {
          toast.error("Please scan a barcode first");
          setLoading(false);
          return;
        }

        const response = await api.get(
          `/api/receipt/verify-batch?batchNo=${formData.barcode}`
        );

        if (response.data && response.data.status) {
          console.log("Batch verified successfully:", response.data);

          const fetchedBatchData = response.data.data;

          // Determine the warehouse ID
          let warehouseId;
          let warehouseName;
          if (fetchedBatchData.warehouseId) {
            warehouseId = fetchedBatchData.warehouseId;
          } else {
            const defaultWarehouse = getDefaultWarehouse(
              fetchedBatchData.isInventory,
              fetchedBatchData.isIqc
            );
            warehouseId = defaultWarehouse.warehouseId;
            warehouseName = defaultWarehouse.warehouseName;
          }

          console.log("Warehouse ID:", warehouseId);
          console.log("Warehouse Name:", warehouseName);

          // Use the data returned from the API
          const batchData = response.data.data;

          // Check if quantity is being changed and requires approval
          if (!isStdQty && formData.quantity !== batchData.quantity) {
            setMessage(
              "You are changing the standard quantity. This requires approval. Do you want to continue?"
            );
            setIsConfirmModal(true);
            setLoading(false);
            // Exit here as the handleYesConfirm will handle the direct save to DB
            // The item will NOT be added to the receipt list table since it's saved directly
            return;
          }

          // Add the verified item to the receipt list with vendor information
          const newItem = {
            itemName: batchData.itemName,
            itemCode: batchData.itemCode,
            warehouse: batchData.batchNo
              ? batchData.warehouseName
              : warehouseName,
            warehouseId: batchData.batchNo
              ? batchData.warehouseId
              : warehouseId,
            quantity: isStdQty ? batchData.quantity : formData.quantity,
            batchNo: batchData.batchNo || "",
            vendorCode: formData.code || batchData.vendorCode,
            vendorName: formData.vendorName || batchData.vendorName,
          };

          // Add to receipt list
          setReceiptList((prev) => [...prev, newItem]);
          toast.success("Item verified and added successfully");

          // Reset only barcode field, not vendor information
          setFormData((prev) => ({
            ...prev,
            barcode: "",
          }));
        } else {
          toast.error("Invalid batch number. Please try again.");
        }
      } else if (mode === "manual") {
        // Manual mode - generate multiple batch numbers
        if (!vendorItem || !formData.itemCode) {
          toast.error("Please select an item first");
          setLoading(false);
          return;
        }

        const numberOfBatches = parseInt(formData.numberOfBatches) || 1;
        if (numberOfBatches < 1 || numberOfBatches > 50) {
          toast.error("Number of batch numbers must be between 1 and 50");
          setLoading(false);
          return;
        }

        console.log("Sending request to generate batch numbers with:", {
          vendorCode: formData.code,
          itemCode: formData.itemCode,
          quantity: formData.quantity,
          numberOfBatches: numberOfBatches,
          warehouse: formData.warehouse,
        });

        // Find the selected vendor item to get isInventory and isIqc values
        const selectedItem = vendorItems.find(
          (item) => item.id === parseInt(vendorItem)
        );
        console.log("Selected vendor item:", selectedItem);

        let defaultWarehouse;
        if (selectedItem) {
          defaultWarehouse = getDefaultWarehouse(
            selectedItem.isInventory,
            selectedItem.isIqc
          );
          console.log(
            "Default warehouse based on item properties:",
            defaultWarehouse
          );
        } else {
          defaultWarehouse = {
            warehouseId: findStoreWarehouseId(),
            warehouseName: findStoreWarehouseName(),
          };
          console.log("Fallback to store warehouse:", defaultWarehouse);
        }

        try {
          // Generate multiple batch numbers
          const batchNumbers = [];
          for (let i = 0; i < numberOfBatches; i++) {
            try {
              const response = await api.post(
                `/api/receipt/generate-batch?vendorCode=${formData.code}&itemCode=${formData.itemCode}&quantity=${formData.quantity}`
              );

              let batchNo = "";
              if (response.data) {
                batchNo = response.data;
                console.log(`Generated batch ${i + 1}:`, batchNo);
                batchNumbers.push(batchNo);
              } else {
                console.warn(
                  `No batch number returned from API for batch ${
                    i + 1
                  }, proceeding with empty batch`
                );
                batchNumbers.push("");
              }
            } catch (error) {
              console.warn(`Failed to generate batch number ${i + 1}:`, error);
              batchNumbers.push("");
            }
          }

          // Create multiple items with different batch numbers
          const newItems = batchNumbers.map((batchNo, index) => ({
            itemName: formData.itemName,
            itemCode: formData.itemCode,
            quantity: formData.quantity,
            batchNo: batchNo,
            vendorCode: formData.code,
            vendorName: formData.vendorName,
            warehouse: defaultWarehouse.warehouseName,
            warehouseId: defaultWarehouse.warehouseId,
          }));

          console.log("Adding new items with warehouses:", newItems);
          setReceiptList((prev) => [...prev, ...newItems]);
          toast.success(
            `${newItems.length} item(s) added successfully with ${
              batchNumbers.filter((b) => b).length
            } batch number(s)`
          );

          // Reset item selection but keep vendor information
          setVendorItem("");
          setFormData((prev) => ({
            ...prev,
            vendorItem: "",
            itemName: "",
            itemCode: "",
            quantity: "",
            warehouse: "",
            numberOfBatches: "1", // Reset to default
          }));
        } catch (error) {
          // Even if batch generation fails, still add the item with empty batch
          console.warn("Failed to generate batch numbers:", error);

          const newItem = {
            itemName: formData.itemName,
            itemCode: formData.itemCode,
            quantity: formData.quantity,
            batchNo: "",
            vendorCode: formData.code,
            vendorName: formData.vendorName,
            warehouse: defaultWarehouse.warehouseName,
            warehouseId: defaultWarehouse.warehouseId,
          };

          console.log("Adding new item with warehouse (after error):", newItem);
          setReceiptList((prev) => [...prev, newItem]);
          toast.success("Item added with no batch number");

          // Reset item selection but keep vendor information
          setVendorItem("");
          setFormData((prev) => ({
            ...prev,
            vendorItem: "",
            itemName: "",
            itemCode: "",
            quantity: "",
            warehouse: "",
            numberOfBatches: "1", // Reset to default
          }));
        }
      } else {
        toast.error("Please select a receipt mode first");
      }
    } catch (error) {
      toast.error(
        "Error processing item: " + (error.message || "Unknown error")
      );
      console.error("Error processing item:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToApproveItemsQuantity = async (
    batchData = null,
    requestedQuantity = null
  ) => {
    try {
      let warehouseId;
      let batchNo;
      let qty;

      // If batch data is provided, use it directly
      if (batchData) {
        batchNo = batchData.batchNo;
        qty = requestedQuantity || formData.quantity;

        // Determine warehouse ID from the provided batch data
        if (batchData.warehouseId) {
          warehouseId = batchData.warehouseId;
        } else {
          // Use the getDefaultWarehouse function
          const defaultWarehouse = getDefaultWarehouse(
            batchData.isInventory,
            batchData.isIqc
          );
          warehouseId = defaultWarehouse.warehouseId;
        }
      } else {
        // Fall back to the old method of verifying the batch
        batchNo = formData.barcode;
        qty = formData.quantity;

        // Verify the batch to get the warehouse information
        const verifyResponse = await api.get(
          `/api/receipt/verify-batch?batchNo=${batchNo}`
        );

        if (!verifyResponse.data || !verifyResponse.data.status) {
          throw new Error("Failed to verify batch information");
        }

        const fetchedBatchData = verifyResponse.data.data;

        // Determine the warehouse ID
        if (fetchedBatchData.warehouseId) {
          warehouseId = fetchedBatchData.warehouseId;
        } else {
          const defaultWarehouse = getDefaultWarehouse(
            fetchedBatchData.isInventory,
            fetchedBatchData.isIqc
          );
          warehouseId = defaultWarehouse.warehouseId;
        }
      }

      const data = {
        batchNo: batchNo,
        requestedQty: qty,
        reason: reason,
        warehouseId: warehouseId,
      };

      console.log("Sending approval request:", data);
      const response = await api.post("/api/approvals/stock-adjustment", data);
      console.log("Approval request response:", response.data);
      return response.data;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Error in sending request for approval"
      );
      console.error(error);
      throw error;
    }
  };

  const handleYesConfirm = async (e) => {
    try {
      if (!reason) {
        toast.error("Please provide a reason for changing the quantity");
        return;
      }

      // First verify the batch
      const verifyResponse = await api.get(
        `/api/receipt/verify-batch?batchNo=${formData.barcode}`
      );

      if (!verifyResponse.data || !verifyResponse.data.status) {
        toast.error("Failed to verify batch. Please try again.");
        return;
      }

      const batchData = verifyResponse.data.data;

      // Determine the warehouse ID and name based on isInventory and isIqc flags
      let warehouseId, warehouseName;
      if (batchData.warehouseId) {
        warehouseId = batchData.warehouseId;
        warehouseName = batchData.warehouseName;
      } else {
        // Use the getDefaultWarehouse function to determine the warehouse based on flags
        const defaultWarehouse = getDefaultWarehouse(
          batchData.isInventory,
          batchData.isIqc
        );
        warehouseId = defaultWarehouse.warehouseId;
        warehouseName = defaultWarehouse.warehouseName;
      }

      // Create new item with the updated quantity
      const newItem = {
        itemName: batchData.itemName,
        itemCode: batchData.itemCode,
        quantity: formData.quantity, // Use the modified quantity
        batchNo: batchData.batchNo || "",
        vendorCode: formData.code || batchData.vendorCode,
        vendorName: formData.vendorName || batchData.vendorName,
        warehouse: warehouseName,
        warehouseId: warehouseId,
      };

      // Do NOT add to receipt list since we're saving directly to DB
      // setReceiptList((prev) => [...prev, newItem]);

      // Save the receipt
      const payload = {
        mode: mode,
        vendor: newItem.vendorName,
        vendorCode: newItem.vendorCode,
        items: [newItem], // Use the newly created item
      };

      console.log("Submitting receipt data:", payload);
      const response = await api.post("/api/receipt/save", payload);

      if (response.data) {
        console.log(
          "Material receipt entry added successfully:",
          response.data
        );

        // Send request for approval (resource blocking)
        // Pass the batch data and requested quantity to avoid re-verification
        await handleAddToApproveItemsQuantity(batchData, formData.quantity);
        toast.success(
          "Material receipt added successfully with quantity change request"
        );

        // Reset form fields after successful submission
        setFormData((prev) => ({
          ...prev,
          barcode: "",
          quantity: "",
        }));
      }

      handleCloseConfirmModal();
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
      console.error(error.response?.data?.message || error);
    }
  };

  const handleSaveReceiptItem = async (e) => {
    e.preventDefault();

    if (receiptList.length === 0) {
      toast.error("Please add at least one item to the receipt");
      return;
    }

    setLoading(true);

    try {
      console.log("Going to save receipt");
      console.log("Receipt list:", receiptList);

      const firstItem = receiptList[0];
      const payload = {
        invoice: invoiceNumber,
        mode: mode,
        vendor: firstItem.vendorName || formData.vendorName,
        vendorCode: firstItem.vendorCode || formData.code,
        items: receiptList.map((item) => {
          const vendorItem = vendorItems.find(
            (vi) => vi.itemCode === item.itemCode
          );
          let defaultWarehouse;

          if (vendorItem) {
            defaultWarehouse = getDefaultWarehouse(
              vendorItem.isInventory,
              vendorItem.isIqc
            );
          } else {
            defaultWarehouse = {
              warehouseId: findStoreWarehouseId(),
              warehouseName: findStoreWarehouseName(),
            };
          }

          const warehouseId = item.warehouseId || defaultWarehouse.warehouseId;
          const warehouse = item.warehouse || defaultWarehouse.warehouseName;

          return {
            ...item,
            warehouseId: warehouseId,
            warehouse: warehouse,
          };
        }),
      };

      // Save the receipt first
      const response = await api.post("/api/receipt/save", payload);
      let approvalsSent = 0;

      // After saving successfully, check each item for quantity changes
      await Promise.all(
        payload.items.map(async (item) => {
          // Extract original quantity from batch number if available and convert to number
          const originalQty = item.batchNo
            ? parseInt(item.batchNo.substring(21, 27))
            : null;
          // Convert current quantity to number for comparison
          const currentQty = parseInt(item.quantity);

          if (originalQty && currentQty !== originalQty) {
            const approvalData = {
              batchNo: item.batchNo,
              requestedQty: currentQty,
              reason: `Quantity updated from ${originalQty} to ${currentQty}`,
              warehouseId: item.warehouseId,
            };

            console.log("Sending approval request:", approvalData);
            await api.post("/api/approvals/stock-adjustment", approvalData);
            approvalsSent++;

            toast.info(
              `Approval request sent for ${item.itemName} (${item.itemCode}) - Quantity change from ${originalQty} to ${currentQty}`,
              {
                autoClose: 5000,
              }
            );
          }
        })
      );

      console.log(
        "Material receipt entry added successfully:",
        response.data.data
      );

      // Show summary notification
      if (approvalsSent > 0) {
        toast.success(
          `Material receipt saved with ${approvalsSent} approval request${
            approvalsSent > 1 ? "s" : ""
          }`
        );
      } else {
        toast.success("Material receipt saved successfully");
      }
      handleReset(e);
      setSelectedRows([]);
      setPrintedRows([]);
      setLockedItemCode(null);
      setInvoiceNumber("");
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
      console.error(error.response?.data?.message || error);
    } finally {
      setLoading(false);
    }
  };

  const getVendorsList = async (e) => {
    try {
      setLoading(true);
      // console.log("Sending request to get vendors list");
      const response = await api.get("/api/vendor-customer/vendors"); // API to get vendors list
      if (response.data && response.data.data) {
        setVendors(response.data.data);
        setVendor(""); // Clear any previous vendor selection
      } else {
        toast.error("No vendors found or invalid response format");
        console.error("Invalid vendors response:", response);
      }
    } catch (error) {
      toast.error(error.response.data.message);
      console.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseConfirmModal = () => {
    // Close Bootstrap modal manually
    if (modalRef.current) {
      const bsModal = Modal.getInstance(modalRef.current);
      if (bsModal) {
        bsModal.hide();
      }
    }

    // Cleanup backdrop and modal-related styles
    cleanupModalArtifacts();

    // Delay state reset to avoid flicker
    setTimeout(() => {
      setIsConfirmModal(false);
    }, 300);
  };

  const getVendorItems = async (code) => {
    try {
      const response = await api.get(`/api/vendor-item/items/${code}`); // API to get vendors items list
      setVendorItems(response.data.data);
    } catch (error) {
      toast.error(error.response.data.message);
      console.error(error.response.data.message);
    }
  };

  const handleModeChange = () => {
    setVendor("");
    // Reset form fields except mode and vendor information
    setFormData((prev) => ({
      ...prev,
      itemName: "",
      itemCode: "",
      code: "",
      vendor: "",
      vendorName: "",
      quantity: "",
      warehouse: "",
      batchno: "",
      numberOfBatches: "1", // Reset to default value
    }));

    // Optionally clear item list if you're managing added items
    // setReceiptList([]);
  };

  // Fetch vendor by vendor code
  // const handleFetchVendorByCode = async (batchno) => {
  //   try {
  //     console.log("Verifying batch:", batchno);
  //     const response = await api.get(
  //       `/api/receipt/verify-batch?batchNo=${batchno}`
  //     );

  //     if (response.data && response.data.status) {
  //       const batchData = response.data.data;

  //       // Determine the warehouse ID and name based on isInventory and isIqc flags
  //       let warehouseId, warehouseName;
  //       if (batchData.warehouseId) {
  //         warehouseId = batchData.warehouseId;
  //         warehouseName = batchData.warehouseName;
  //       } else {
  //         // Use the getDefaultWarehouse function to determine the warehouse based on flags
  //         const defaultWarehouse = getDefaultWarehouse(
  //           batchData.isInventory,
  //           batchData.isIqc
  //         );
  //         warehouseId = defaultWarehouse.warehouseId;
  //         warehouseName = defaultWarehouse.warehouseName;
  //       }
  //       console.log("Vendor name: " + batchData.vendorName);
  //       setVendor(batchData.vendorName);
  //       setFormData({
  //         ...formData,
  //         vendor: batchData.id,
  //         vendorName: batchData.vendorName,
  //         code: batchData.vendorCode,
  //         barcode: batchno,
  //         quantity: batchData.quantity,
  //         itemCode: batchData.itemCode,
  //         warehouse: warehouseName,
  //         warehouseId: warehouseId,
  //         itemName: batchData.itemName,
  //       });
  //       console.log("Batch verified:", batchData);
  //     } else {
  //       toast.error("Invalid batch number");
  //     }
  //   } catch (error) {
  //     toast.error("Unable to fetch vendor name");
  //     console.error(error);
  //   }
  // };
  const handleFetchVendorByCode = async (batchno) => {
    try {
      console.log("Verifying batch:", batchno);
      const response = await api.get(
        `/api/receipt/verify-batch?batchNo=${batchno}`
      );

      if (response.data && response.data.status) {
        const batchData = response.data.data;

        // Determine the warehouse ID and name
        let warehouseId, warehouseName;
        if (batchData.warehouseId) {
          warehouseId = batchData.warehouseId;
          warehouseName = batchData.warehouseName;
        } else {
          const defaultWarehouse = getDefaultWarehouse(
            batchData.isInventory,
            batchData.isIqc
          );
          warehouseId = defaultWarehouse.warehouseId;
          warehouseName = defaultWarehouse.warehouseName;
        }

        // Update formData (if needed for other UI parts)
        setFormData({
          ...formData,
          vendor: batchData.id,
          vendorName: batchData.vendorName,
          code: batchData.vendorCode,
          barcode: batchno,
          quantity: batchData.quantity,
          itemCode: batchData.itemCode,
          warehouse: warehouseName,
          warehouseId: warehouseId,
          itemName: batchData.itemName,
        });

        // Add this batch as a new row in the receipt list
        setReceiptList((prev) => [
          ...prev,
          {
            itemName: batchData.itemName,
            itemCode: batchData.itemCode,
            quantity: batchData.quantity || 1,
            batchNo: batchno,
            warehouse: warehouseName,
            warehouseId: warehouseId,
          },
        ]);

        console.log("Batch verified & added:", batchData);
      } else {
        toast.error("Invalid batch number");
      }
    } catch (error) {
      toast.error("Unable to fetch vendor name");
      console.error(error);
    }
  };

  // Function to find Store warehouse ID
  const findStoreWarehouseId = () => {
    const storeWarehouse = warehouses.find(
      (w) => w.name === "Store" || w.type === "STR"
    );
    return storeWarehouse ? storeWarehouse.id : "";
  };

  // Function to find Store warehouse name
  const findStoreWarehouseName = () => {
    const storeWarehouse = warehouses.find(
      (w) => w.name === "Store" || w.type === "STR"
    );
    return storeWarehouse ? storeWarehouse.name : "";
  };

  // Function to find IQC warehouse ID
  const findIqcWarehouseId = () => {
    const iqcWarehouse = warehouses.find(
      (w) => w.name === "IQC" || w.type === "IQC"
    );
    return iqcWarehouse ? iqcWarehouse.id : "";
  };

  // Function to find IQC warehouse name
  const findIqcWarehouseName = () => {
    const iqcWarehouse = warehouses.find(
      (w) => w.name === "IQC" || w.type === "IQC"
    );
    return iqcWarehouse ? iqcWarehouse.name : "";
  };

  // Function to determine default warehouse based on isInventory and isIqc flags
  const getDefaultWarehouse = (isInventory, isIqc) => {
    if (isInventory && isIqc) {
      const warehouseId = findIqcWarehouseId();
      const warehouseName = findIqcWarehouseName();
      console.log("Selected IQC warehouse:", warehouseId, warehouseName);
      return {
        warehouseId: warehouseId,
        warehouseName: warehouseName,
      };
    } else if (isInventory && !isIqc) {
      const warehouseId = findStoreWarehouseId();
      const warehouseName = findStoreWarehouseName();
      console.log("Selected Store warehouse:", warehouseId, warehouseName);
      return {
        warehouseId: warehouseId,
        warehouseName: warehouseName,
      };
    } else {
      const warehouseId = findStoreWarehouseId();
      const warehouseName = findStoreWarehouseName();
      console.log("Default Store warehouse:", warehouseId, warehouseName);
      return {
        warehouseId: warehouseId,
        warehouseName: warehouseName,
      };
    }
  };

  // Preview modal
  useEffect(() => {
    if (isPreviewModalOpen && previewModalRef.current) {
      const bsModal = new Modal(previewModalRef.current, {
        backdrop: "static",
      });
      bsModal.show();

      previewModalRef.current.addEventListener("hidden.bs.modal", () =>
        setIsPreviewModalOpen(false)
      );
    }
  }, [isPreviewModalOpen]);

  // Batch scan
  const handleScan = async (value) => {
    // Normalize separators if needed
    let scannedValue = value.trim().replace(/[;|]/g, ",");

    // Split into batch numbers
    const batches = scannedValue
      .split(",")
      .map((b) => b.trim())
      .filter(Boolean);

    for (const batchNo of batches) {
      await handleFetchVendorByCode(batchNo); // fetch details for each batch
    }
  };

  // get selected item codes
  const selectedItemCodes = [
    ...new Set(selectedRows.map((i) => receiptList[i]?.itemCode)),
  ];

  const toggleRowSelection = (index) => {
    const row = receiptList[index];
    if (!row) return;

    setSelectedRows((prev) => {
      let newSelected;
      if (prev.includes(index)) {
        newSelected = prev.filter((i) => i !== index);
      } else {
        newSelected = [...prev, index];
      }

      // if nothing selected → unlock
      if (newSelected.length === 0) {
        setLockedItemCode(null);
      } else {
        // otherwise lock to the current item's code
        setLockedItemCode(receiptList[newSelected[0]].itemCode);
      }

      return newSelected;
    });
  };

  const handlePrint = async (e) => {
    e.preventDefault();

    if (selectedRows.length === 0) {
      toast.error("Please select at least one item to print");
      return;
    }

    try {
      // Use first selected row as reference for item/vendor details
      const firstRow = receiptList[selectedRows[0]];

      // Collect batch numbers from all selected rows
      const batchNumbers = selectedRows.map((i) => receiptList[i].batchNo);

      // Prepare payload
      const payload = {
        vendorCode: firstRow.vendorCode,
        vendorName: firstRow.vendorName,
        itemCode: firstRow.itemCode,
        itemName: firstRow.itemName,
        batchNumbers: batchNumbers.join(","), // convert array → comma separated string
      };

      console.log("Payload JSON:", JSON.stringify(payload));

      // Call API with structured payload
      const response = await api.post("/api/vendor-master-batch", payload);

      toast.success("Labels printed successfully!");

      // Mark selected rows as permanently printed (disabled)
      const updatedPrinted = [...printedRows, ...selectedRows];
      setPrintedRows(updatedPrinted);

      // Clear selection
      // Clear selection
      setSelectedRows([]);

      // uncheck header checkbox if it was checked
      if (selectAllRef.current) {
        selectAllRef.current.checked = false;
        selectAllRef.current.indeterminate = false;
      }

      // check if all rows of lockedItemCode are printed
      const allIndexesForLocked = receiptList
        .map((r, i) => (r.itemCode === lockedItemCode ? i : null))
        .filter((i) => i !== null);

      const allPrinted = allIndexesForLocked.every((i) =>
        updatedPrinted.includes(i)
      );

      if (allPrinted) {
        setLockedItemCode(null);
      }
    } catch (error) {
      toast.error("Error printing labels: " + error.message);
      console.error("Print error:", error);
    }
  };

  return (
    <div>
      {loading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            zIndex: 9999,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            pointerEvents: "all",
          }}
        >
          <div className="orbit-loader">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      )}

      {/* Header section */}
      <nav className="navbar bg-light border-body" data-bs-theme="light">
        <div className="container-fluid">
          <div className="mt-4">
            <h3 className="nav-header header-style">Material Incoming</h3>
            <p className="breadcrumb">
              <Link to="/dashboard">
                <i className="fas fa-home text-8"></i>
              </Link>{" "}
              <span className="ms-1 mt-1 text-small-gray">
                / Transactions / Material Incoming
              </span>
            </p>
          </div>
        </div>
      </nav>

      {/* Search and Filter Section */}
      {/* <div className="search-filter-container mx-2">
        <div className="search-box">
          <i className="fas fa-search position-absolute z-0 input-icon"></i>
          <input
            type="text"
            className="form-control vendor-search-bar"
            placeholder="Search by incoming materials..."
          />
        </div>
      </div> */}

      {/* Form Section */}
      <div className="table-form-container mx-2">
        <div className="form-header">
          <h2>
            <i className="fas fa-truck-ramp-box"></i> Material Receipt Entry
          </h2>
        </div>
        {/* Form Fields */}
        <form autoComplete="off" className="padding-2">
          <div className="form-grid pt-0 mb-0">
            <div className="row form-style">
              <div className="col-4 d-flex flex-column form-group">
                <label htmlFor="receiptMode" className="form-label ms-2">
                  Receipt Mode <span className="text-danger fs-6">*</span>
                </label>
                <div className="position-relative w-100">
                  <i className="fas fa-right-left ms-2 position-absolute z-0 input-icon"></i>
                  <select
                    className={`form-select ps-5 ms-1 text-font ${
                      mode ? "" : "text-secondary"
                    }`}
                    id="receiptMode"
                    value={mode}
                    onChange={(e) => {
                      setMode(e.target.value);
                      setVendorItem("");
                      handleModeChange();
                    }}
                  >
                    <option value="" disabled hidden className="text-muted">
                      Select Mode
                    </option>
                    <option value="scan">Scan</option>
                    <option value="manual">Manual</option>
                  </select>
                </div>
                {errors.mode && (
                  <span className="error-message">{errors.mode}</span>
                )}
              </div>
              <div className="col-4 d-flex flex-column form-group">
                <label htmlFor="vendorName" className="form-label ms-2">
                  Vendor Name <span className="text-danger fs-6">*</span>
                </label>

                <div className="position-relative w-100">
                  <i
                    className="fas fa-building ms-2 position-absolute input-icon"
                    style={{
                      top: "50%",
                      left: "10px",
                      transform: "translateY(-50%)",
                      zIndex: 1,
                    }}
                  ></i>

                  <Select
                    className="ms-1 text-font"
                    classNamePrefix="react-select"
                    isDisabled={mode === "scan"}
                    placeholder={
                      mode === "scan" ? "Vendor Name" : "Select Vendor"
                    }
                    options={vendors.map((v) => ({
                      value: v.id,
                      label: `${v.code ? `(${v.code}) - ` : ""}${v.name}`,
                      vendor: v,
                    }))}
                    value={
                      vendor
                        ? {
                            value: vendors.find((v) => v.name === vendor)?.id,
                            label: `${
                              vendors.find((v) => v.name === vendor)?.code
                                ? `(${
                                    vendors.find((v) => v.name === vendor)?.code
                                  }) - `
                                : ""
                            }${vendor}`,
                          }
                        : null
                    }
                    onChange={(selected) => {
                      if (selected) {
                        const selectedVendor = selected.vendor;
                        setVendor(selectedVendor.name); // store name in state
                        setFormData((prev) => ({
                          ...prev,
                          vendor: selectedVendor.id, // keep vendor id for backend
                          vendorName: selectedVendor.name, // display name
                          code: selectedVendor.code || "", // optional auto-fill
                        }));
                        getVendorItems(selectedVendor.code);
                      }
                    }}
                    styles={{
                      control: (base) => ({
                        ...base,
                        minHeight: "32px",
                        height: "32px",
                        fontSize: "0.8rem",
                        paddingLeft: "30px",
                      }),
                      valueContainer: (base) => ({
                        ...base,
                        height: "32px",
                        padding: "0 6px",
                      }),
                      indicatorsContainer: (base) => ({
                        ...base,
                        height: "32px",
                      }),
                      menu: (base) => ({
                        ...base,
                        fontSize: "0.8rem",
                      }),
                      option: (base, state) => ({
                        ...base,
                        fontSize: "0.8rem",
                        padding: "6px 10px",
                        backgroundColor: state.isSelected
                          ? "#e9ecef"
                          : state.isFocused
                          ? "#f8f9fa"
                          : "white",
                        color: "black",
                      }),
                    }}
                  />

                  {mode !== "scan" && (
                    <i className="fa-solid fa-angle-down position-absolute down-arrow-icon"></i>
                  )}
                </div>

                {errors.vendor && (
                  <span className="error-message">{errors.vendor}</span>
                )}
              </div>

              <div className="col-4 d-flex flex-column form-group">
                <label htmlFor="vendorCode" className="form-label ms-2">
                  Vendor Code
                </label>
                <div className="position-relative w-100">
                  <i className="fas fa-hashtag position-absolute ms-2 z-0 input-icon"></i>
                  <input
                    type="text"
                    className="form-control ps-5 ms-1 text-font"
                    id="vendorCode"
                    placeholder="Vendor code"
                    value={formData.code}
                    disabled
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            {mode == "manual" ? (
              <div className="col-8 d-flex flex-column form-group">
                <label htmlFor="item" className="form-label ms-2">
                  Select Item <span className="text-danger fs-6">*</span>
                </label>
                <div className="position-relative w-100">
                  <i
                    className="fas fa-box position-absolute ms-2 input-icon"
                    style={{
                      top: "50%",
                      left: "10px",
                      transform: "translateY(-50%)",
                      zIndex: 1,
                    }}
                  ></i>
                  <Select
                    id="item"
                    className="text-font ms-1"
                    classNamePrefix="react-select"
                    placeholder="Select Item"
                    value={
                      vendorItems
                        .map((item) => ({
                          value: item.id,
                          label: `${item.itemName}${
                            item.itemCode ? ` (${item.itemCode})` : ""
                          }`,
                        }))
                        .find((option) => option.value === vendorItem) || null
                    }
                    onChange={(selectedOption) => {
                      if (selectedOption) {
                        const selectedId = selectedOption.value;
                        const selectedItem = vendorItems.find(
                          (v) => v.id === selectedId
                        );

                        if (selectedItem) {
                          setVendorItem(selectedId);
                          setFormData((prev) => ({
                            ...prev,
                            vendorItem: selectedId,
                            quantity: selectedItem.quantity || 0,
                            itemCode: selectedItem.itemCode,
                            itemName: selectedItem.itemName,
                          }));
                        }
                      }
                    }}
                    options={vendorItems.map((item) => ({
                      value: item.id,
                      label: `${item.itemName}${
                        item.itemCode ? ` (${item.itemCode})` : ""
                      }`,
                    }))}
                    styles={{
                      control: (base) => ({
                        ...base,
                        minHeight: "32px",
                        height: "32px",
                        fontSize: "0.8rem",
                        paddingLeft: "30px",
                      }),
                      valueContainer: (base) => ({
                        ...base,
                        height: "32px",
                        padding: "0 6px",
                      }),
                      indicatorsContainer: (base) => ({
                        ...base,
                        height: "32px",
                      }),
                      menu: (base) => ({
                        ...base,
                        fontSize: "0.8rem",
                      }),
                      option: (base, state) => ({
                        ...base,
                        fontSize: "0.8rem",
                        padding: "6px 10px",
                        backgroundColor: state.isSelected
                          ? "#e9ecef"
                          : state.isFocused
                          ? "#f8f9fa"
                          : "white",
                        color: "black",
                      }),
                    }}
                  />
                  {/* <select
                    className={`form-select ps-5 ms-1 text-font ${
                      vendorItem ? "" : "text-secondary"
                    }`}
                    id="item"
                    value={vendorItem}
                    onChange={(e) => {
                      {
                        const selectedId = parseInt(e.target.value);
                        const selectedItem = vendorItems.find(
                          (v) => v.id === selectedId
                        );

                        if (selectedItem) {
                          setVendorItem(selectedId);
                          setFormData((prev) => ({
                            ...prev,
                            vendorItem: selectedId,
                            quantity: selectedItem.quantity || 0,
                            itemCode: selectedItem.itemCode,
                            itemName: selectedItem.itemName,
                          }));
                        }
                      }
                    }}
                  >
                    <option value="" disabled hidden className="text-muted">
                      Select Item
                    </option>
                    {vendorItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.itemName}
                        {item.itemCode && `(${item.itemCode})`}
                      </option>
                    ))}
                  </select> */}
                </div>
              </div>
            ) : mode == "scan" ? (
              <div className="col-8 d-flex flex-column form-group">
                <label htmlFor="item" className="form-label ms-2">
                  Scan Barcode <span className="text-danger fs-6">*</span>
                </label>
                <div className="position-relative w-100">
                  <i className="fas fa-qrcode position-absolute ms-2 z-0 input-icon"></i>
                  <input
                    type="text"
                    className="form-control ps-5 ms-1 text-font"
                    id="item"
                    value={formData.barcode}
                    placeholder="Scan QR code"
                    onChange={(e) => {
                      const scannedCode = e.target.value;
                      setFormData({ ...formData, barcode: scannedCode });
                      handleScan(scannedCode);
                    }}
                  />
                </div>
              </div>
            ) : (
              ""
            )}
            {mode == "manual" && (
              <div className="col-4 d-flex flex-column form-group">
                <label htmlFor="quantity" className="form-label ms-2">
                  Quantity <span className="text-danger fs-6">*</span>
                </label>

                <div className="d-flex align-items-center justify-content-between gap-2">
                  <div className="position-relative w-100">
                    <i className="fas fa-calculator position-absolute ms-2 z-0 input-icon"></i>
                    <input
                      type="text"
                      className="form-control ps-5 text-font"
                      id="quantity"
                      placeholder="Quantity"
                      value={formData.quantity}
                      onChange={(e) =>
                        setFormData({ ...formData, quantity: e.target.value })
                      }
                      disabled={mode === "scan" && isStdQty}
                    />
                  </div>
                  <input
                    className="form-check-input mt-0"
                    type="checkbox"
                    id="isStdQtyManual"
                    checked={!isStdQty}
                    onChange={(e) => setIsStdQty(!e.target.checked)}
                  />
                </div>
                {errors.quantity && (
                  <span className="error-message">{errors.quantity}</span>
                )}
              </div>
            )}
          </div>
          {mode == "manual" && (
            <div className="row">
              <div className="col-4 d-flex flex-column form-group">
                <label htmlFor="numberOfBatches" className="form-label ms-2">
                  Number of Batch Numbers{" "}
                  <span className="text-danger fs-6">*</span>
                </label>
                <small className="text-muted ms-2 mb-1">
                  Enter how many batch numbers to generate for this item
                </small>
                <div className="position-relative w-100">
                  <i className="fas fa-hashtag position-absolute ms-2 z-0 input-icon"></i>
                  <input
                    type="number"
                    className="form-control ps-5 ms-1 text-font"
                    id="numberOfBatches"
                    placeholder="Enter number of batch numbers"
                    min="1"
                    max="100"
                    value={formData.numberOfBatches}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        numberOfBatches: e.target.value,
                      })
                    }
                  />
                </div>
                {errors.numberOfBatches && (
                  <span className="error-message">
                    {errors.numberOfBatches}
                  </span>
                )}
              </div>
            </div>
          )}
          <div>
            <div className="row">
              <div className="col-3 d-flex flex-column form-group">
                <button
                  className="btn btn-primary text-8 px-3 fw-medium mx-2"
                  onClick={(e) => {
                    e.preventDefault();
                    handleAddReceiptItem(e);
                  }}
                >
                  <i className="fa-solid fa-add me-1"></i> Add Item
                </button>
              </div>
              <div className="col-6 d-flex flex-column form-group"></div>
            </div>
          </div>
          {/* Table Section */}
          {mode && (
            <div>
              <div className="table-form-container mx-2 mt-4">
                <div className="form-header d-flex justify-content-between align-items-center">
                  <h2>Receipt Items</h2>
                  <button
                    className="btn btn-outline-dark text-8"
                    onClick={handlePrint}
                  >
                    <i className="fa-solid fa-print me-1"></i> Print
                  </button>
                </div>
                <div className="item-table-container mt-3">
                  <table className="align-middle">
                    <thead>
                      <tr>
                        <th>
                          <input
                            ref={selectAllRef}
                            type="checkbox"
                            onChange={(e) => {
                              if (e.target.checked) {
                                const selectable = receiptList
                                  .map((_, idx) => idx)
                                  .filter((idx) => {
                                    const r = receiptList[idx];
                                    const isPrinted = printedRows.includes(idx);
                                    const wrongItem =
                                      lockedItemCode &&
                                      lockedItemCode !== r.itemCode;
                                    return !isPrinted && !wrongItem;
                                  });

                                setSelectedRows(selectable);

                                if (selectable.length > 0) {
                                  setLockedItemCode(
                                    receiptList[selectable[0]].itemCode
                                  );
                                }
                              } else {
                                setSelectedRows([]);
                                setLockedItemCode(null);
                              }
                            }}
                          />
                          <span className="ms-1">
                            {selectedRows.length > 0 &&
                              `(${selectedRows.length})`}
                          </span>
                        </th>
                        <th>Item Name</th>
                        <th>Item Code</th>
                        <th>Quantity</th>
                        <th>Batch No</th>
                        <th>Warehouse</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {receiptList.length === 0 ? (
                        <tr className="no-data-row">
                          <td colSpan="7" className="no-data-cell">
                            <div className="no-data-content">
                              <i className="fas fa-box-open no-data-icon"></i>
                              <p className="no-data-text">No Items Added</p>
                              <p className="no-data-subtext">
                                Scan items or add them manually
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        receiptList.map((receipt, index) => {
                          const isSelected = selectedRows.includes(index);
                          const isPrinted = printedRows.includes(index);

                          // disable condition:
                          // 1. already printed
                          // 2. locked to a different itemCode
                          const shouldDisable =
                            isPrinted ||
                            (lockedItemCode &&
                              lockedItemCode !== receipt.itemCode);

                          return (
                            <tr
                              key={index}
                              className={isPrinted ? "printed-row" : ""}
                            >
                              <td>
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleRowSelection(index)}
                                  disabled={shouldDisable}
                                />
                              </td>
                              <td>{receipt.itemName}</td>
                              <td>{receipt.itemCode}</td>
                              <td>
                                {mode === "scan" ? (
                                  <input
                                    type="text"
                                    className="form-control text-8"
                                    value={receipt.quantity}
                                    onChange={(e) => {
                                      const updatedList = [...receiptList];
                                      updatedList[index].quantity =
                                        e.target.value;
                                      setReceiptList(updatedList);
                                    }}
                                    disabled={isPrinted}
                                  />
                                ) : (
                                  receipt.quantity
                                )}
                              </td>
                              <td>{receipt.batchNo}</td>
                              <td>
                                <select
                                  className={`form-control text-font ${
                                    receipt.warehouseId ? "" : "text-secondary"
                                  }`}
                                  value={
                                    receipt.warehouseId
                                      ? `${receipt.warehouseId}|${receipt.warehouse}`
                                      : ""
                                  }
                                  onChange={(e) => {
                                    const selectedValue = e.target.value;
                                    if (selectedValue) {
                                      const [selectedId, selectedName] =
                                        selectedValue.split("|");
                                      const updatedList = [...receiptList];
                                      updatedList[index].warehouse =
                                        selectedName;
                                      updatedList[index].warehouseId =
                                        selectedId;
                                      setReceiptList(updatedList);
                                    }
                                  }}
                                  disabled
                                >
                                  {warehouses.map((w) => (
                                    <option
                                      key={w.id}
                                      value={`${w.id}|${w.name}`}
                                    >
                                      {w.name}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="actions ps-3">
                                <button
                                  className="btn-icon btn-primary"
                                  title="View Details"
                                  onClick={(e) => handleViewDetails(receipt, e)}
                                  disabled={isPrinted}
                                >
                                  <i className="fas fa-eye"></i>
                                </button>
                                <button
                                  className="btn-icon btn-danger"
                                  title="Delete"
                                  onClick={(e) => handleDeleteItem(index, e)}
                                  disabled={isPrinted}
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="form-actions">
                <button
                  className="btn btn-primary border border-0 text-8 px-3 fw-medium py-2 me-3 float-end"
                  onClick={(e) => {
                    e.preventDefault();
                    if (receiptList.length === 0) {
                      toast.error(
                        "Please add at least one item to the receipt"
                      );
                      return;
                    }
                    setIsPreviewModalOpen(true);
                  }}
                >
                  <i className="fa-solid fa-floppy-disk me-1"></i> Save Receipt
                </button>
                <button
                  className="btn btn-secondary border border-0 text-8 px-3 fw-medium py-2 bg-secondary me-3 float-end"
                  onClick={handleReset}
                >
                  <i className="fa-solid fa-xmark me-1"></i> Clear
                </button>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Confirmation dialog modal */}
      {isConfirmModal && (
        <div
          className="modal fade"
          ref={modalRef}
          id="confirmModal"
          tabIndex="-1"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-circle-check me-2"></i>
                  Confirm
                </h5>
                <button
                  type="button"
                  className="btn"
                  onClick={handleCloseConfirmModal}
                  aria-label="Close"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="modal-body">
                {message}
                <label htmlFor="reason" className="form-label mt-2">
                  Reason:{" "}
                </label>
                <input
                  type="text"
                  id="reason"
                  className="form-control text-font"
                  value={reason}
                  placeholder="Enter Reason"
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-primary add-btn"
                  onClick={handleYesConfirm}
                >
                  <i className="fas fa-check me-2"></i>
                  Yes
                </button>

                <button
                  type="button"
                  className="btn btn-secondary add-btn"
                  onClick={() => {
                    setConfirmState(false);
                    handleCloseConfirmModal();
                  }}
                >
                  <i className="fas fa-times me-2"></i>
                  No
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Receipt Details Modal */}
      {isShowReceiptDetails && currentReceipt && (
        <div
          className="modal fade"
          ref={receiptModalRef}
          id="receiptDetailModal"
          tabIndex="-1"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-circle-info me-2"></i>Receipt Item
                  Details
                </h5>
                <button
                  type="button"
                  className="btn"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="modal-body">
                <div className="user-details-grid">
                  <div className="detail-item">
                    <strong>Item Name:</strong>
                    <span>{currentReceipt.itemName}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Item Code:</strong>
                    <span>{currentReceipt.itemCode}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Quantity:</strong>
                    <span>{currentReceipt.quantity}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Batch No:</strong>
                    <span>{currentReceipt.batchNo}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Warehouse:</strong>
                    <span>{currentReceipt.warehouse || "Not specified"}</span>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary add-btn"
                  data-bs-dismiss="modal"
                  onClick={() => {
                    document.activeElement?.blur();
                  }}
                >
                  <i className="fas fa-xmark me-2"></i>Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {isPreviewModalOpen && (
        <div
          className="modal fade"
          ref={previewModalRef}
          id="previewModal"
          tabIndex="-1"
        >
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-eye me-2"></i>Preview Receipt Items
                </h5>
                <button
                  type="button"
                  className="btn"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label
                    htmlFor="invoiceNumber"
                    className="form-label fw-semibold"
                  >
                    Invoice Number <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control text-font"
                    id="invoiceNumber"
                    placeholder="Enter Invoice Number"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                  />
                </div>
                <table className="table table-bordered table-striped table-hover text-font align-middle">
                  <thead>
                    <tr>
                      <th>Item Name</th>
                      <th>Item Code</th>
                      <th>Quantity</th>
                      <th>Batch No</th>
                      <th>Warehouse</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receiptList.map((item, idx) => (
                      <tr key={idx}>
                        <td>{item.itemName}</td>
                        <td>{item.itemCode}</td>
                        <td>{item.quantity}</td>
                        <td>{item.batchNo}</td>
                        <td>
                          <select
                            className={`form-control text-font ${
                              item.warehouseId ? "" : "text-secondary"
                            }`}
                            value={
                              item.warehouseId
                                ? `${item.warehouseId}|${item.warehouse}`
                                : ""
                            }
                            onChange={(e) => {
                              const selectedValue = e.target.value;
                              if (selectedValue) {
                                const [selectedId, selectedName] =
                                  selectedValue.split("|");
                                const updatedList = [...receiptList];
                                updatedList[index].warehouse = selectedName;
                                updatedList[index].warehouseId = selectedId;
                                setReceiptList(updatedList);
                              }
                            }}
                            disabled
                          >
                            {warehouses.map((w) => (
                              <option key={w.id} value={`${w.id}|${w.name}`}>
                                {w.name}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-primary text-8"
                  onClick={(e) => {
                    e.preventDefault();
                    if (!invoiceNumber.trim()) {
                      toast.error("Please enter an invoice number");
                      return;
                    }
                    handleSaveReceiptItem(e);
                    const modalInstance = Modal.getInstance(
                      previewModalRef.current
                    );
                    if (modalInstance) modalInstance.hide();
                  }}
                >
                  <i className="fa-solid fa-floppy-disk me-1"></i> Save
                </button>
                <button
                  className="btn btn-secondary text-8"
                  data-bs-dismiss="modal"
                >
                  <i className="fa-solid fa-xmark me-1"></i> Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialIncoming;
