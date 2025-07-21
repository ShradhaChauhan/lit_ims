import { Modal } from "bootstrap";
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../../services/api";

const MaterialIncoming = () => {
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

    if (!mode) {
      errors.mode = "Please select a mode";
    }

    if (!data.vendor) {
      errors.vendor = "Please select vendor name";
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
              : findStoreWarehouseName(),
            warehouseId: batchData.batchNo
              ? batchData.warehouseId
              : findStoreWarehouseId(),
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
        // Manual mode - generate batch number
        if (!vendorItem || !formData.itemCode) {
          toast.error("Please select an item first");
          setLoading(false);
          return;
        }

        console.log("Sending request to generate batch no with:", {
          vendorCode: formData.code,
          itemCode: formData.itemCode,
          quantity: formData.quantity,
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
          const response = await api.post(
            `/api/receipt/generate-batch?vendorCode=${formData.code}&itemCode=${formData.itemCode}&quantity=${formData.quantity}`
          );

          let batchNo = "";
          if (response.data) {
            batchNo = response.data;
            console.log("Generated batch:", batchNo);
          } else {
            console.warn(
              "No batch number returned from API, proceeding with empty batch"
            );
          }

          const newItem = {
            itemName: formData.itemName,
            itemCode: formData.itemCode,
            quantity: formData.quantity,
            batchNo: batchNo,
            vendorCode: formData.code,
            vendorName: formData.vendorName,
            warehouse: defaultWarehouse.warehouseName,
            warehouseId: defaultWarehouse.warehouseId,
          };

          console.log("Adding new item with warehouse:", newItem);
          setReceiptList((prev) => [...prev, newItem]);
          toast.success("Item added successfully");

          // Reset item selection but keep vendor information
          setVendorItem("");
          setFormData((prev) => ({
            ...prev,
            vendorItem: "",
            itemName: "",
            itemCode: "",
            quantity: "",
            warehouse: "",
          }));
        } catch (error) {
          // Even if batch generation fails, still add the item with empty batch
          console.warn("Failed to generate batch number:", error);

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

  const handleAddToApproveItemsQuantity = async () => {
    try {
      const data = {
        batchNo: formData.barcode,
        requestedQty: formData.quantity,
        reason: reason,
      };
      console.log("Sending approval request:", data);
      const response = await api.post("/api/stock-adjustments/requests", data);
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

      // Create new item with the updated quantity
      const newItem = {
        itemName: batchData.itemName,
        itemCode: batchData.itemCode,
        quantity: formData.quantity, // Use the modified quantity
        batchNo: batchData.batchNo || "",
        vendorCode: formData.code || batchData.vendorCode,
        vendorName: formData.vendorName || batchData.vendorName,
        warehouse: batchData.batchNo
          ? batchData.warehouseName
          : findStoreWarehouseName(),
        warehouseId: batchData.batchNo
          ? batchData.warehouseId
          : findStoreWarehouseId(),
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
        await handleAddToApproveItemsQuantity();
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

      // Use vendor information from the first item in the receipt list
      // This ensures we're using the correct vendor info even if the form state has changed
      const firstItem = receiptList[0];

      const payload = {
        mode: mode,
        vendor: firstItem.vendorName || formData.vendorName,
        vendorCode: firstItem.vendorCode || formData.code,
        items: receiptList.map((item) => {
          // Find the corresponding vendor item to get isInventory and isIqc values
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

          // If warehouse is not set or empty, use the default warehouse
          const warehouseId = item.warehouseId || defaultWarehouse.warehouseId;
          const warehouse = item.warehouse || defaultWarehouse.warehouseName;

          console.log(
            `Item ${item.itemCode} using warehouse:`,
            warehouse,
            warehouseId
          );

          return {
            ...item,
            warehouseId: warehouseId,
            warehouse: warehouse,
          };
        }),
      };

      console.log("Submitting receipt data:", payload);

      if (!payload.vendor || !payload.vendorCode) {
        toast.error("Vendor information is missing. Please select a vendor.");
        setLoading(false);
        return;
      }

      const response = await api.post("/api/receipt/save", payload);
      console.log(
        "Material receipt entry added successfully:",
        response.data.data
      );
      toast.success("Material receipt added successfully");
      handleReset(e);
    } catch (error) {
      toast.error(error.response.data.message);
      console.error(error.response.data.message);
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
    }));

    // Optionally clear item list if you're managing added items
    // setReceiptList([]);
  };

  // Fetch vendor by vendor code
  const handleFetchVendorByCode = async (batchno) => {
    try {
      console.log("Verifying batch:", batchno);
      const response = await api.get(
        `/api/receipt/verify-batch?batchNo=${batchno}`
      );

      if (response.data && response.data.status) {
        const batchData = response.data.data;
        setVendor(batchData.vendorName);
        setFormData({
          ...formData,
          vendor: batchData.vendorName,
          vendorName: batchData.vendorName,
          code: batchData.vendorCode,
          barcode: batchno,
          quantity: batchData.quantity,
          itemCode: batchData.itemCode,
          warehouse: batchData.warehouseName,
          itemName: batchData.itemName,
        });
        console.log("Batch verified:", batchData);
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
    console.log(
      "Getting default warehouse for isInventory:",
      isInventory,
      "isIqc:",
      isIqc
    );
    console.log("Available warehouses:", warehouses);

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
  return (
    <div>
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
      <div className="search-filter-container mx-2">
        <div className="search-box">
          <i className="fas fa-search position-absolute z-0 input-icon"></i>
          <input
            type="text"
            className="form-control vendor-search-bar"
            placeholder="Search by incoming materials..."
          />
        </div>
      </div>

      {/* Form Section */}
      <div className="table-form-container mx-2">
        <div className="form-header">
          <h2>
            <i className="fas fa-truck-ramp-box"></i> Material Receipt Entry
          </h2>
        </div>
        {/* Form Fields */}
        <form autoComplete="off" className="padding-2">
          <div className="form-grid pt-0">
            <div className="row form-style">
              <div className="col-4 d-flex flex-column form-group">
                <label htmlFor="receiptMode" className="form-label ms-2">
                  Receipt Mode <span className="text-danger fs-6">*</span>
                </label>
                <div className="position-relative w-100">
                  <i className="fas fa-right-left ms-2 position-absolute z-0 input-icon"></i>
                  <select
                    className="form-control ps-5 ms-1 text-font"
                    id="receiptMode"
                    value={mode}
                    onChange={(e) => {
                      setMode(e.target.value);
                      handleModeChange();
                    }}
                  >
                    <option value="" disabled hidden className="text-muted">
                      Select Mode
                    </option>
                    <option value="scan">Scan</option>
                    <option value="manual">Manual</option>
                  </select>
                  <i className="fa-solid fa-angle-down position-absolute down-arrow-icon"></i>
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
                  <i className="fas fa-building ms-2 position-absolute z-0 input-icon"></i>
                  <select
                    className="form-control ps-5 ms-1 text-font"
                    id="vendorName"
                    disabled={mode === "scan"}
                    value={vendor}
                    onChange={(e) => {
                      const selectedId = parseInt(e.target.value); // dropdown value is string, convert to number
                      const selectedVendor = vendors.find(
                        (v) => v.id === selectedId
                      );

                      if (selectedVendor) {
                        setVendor(selectedId); // vendor state for dropdown
                        setFormData((prev) => ({
                          ...prev,
                          vendor: selectedId, // Save vendor id (or name if preferred)
                          vendorName: selectedVendor.name,
                          code: selectedVendor.code || "", // Auto-fill vendor code
                        }));
                        getVendorItems(selectedVendor.code);
                      }
                    }}
                  >
                    <option value="" disabled hidden className="text-muted">
                      {mode === "scan" ? "Vendor Name" : "Select Vendor"}
                    </option>
                    {vendors.map((v) => (
                      <option value={v.id} key={v.id}>
                        {v.name}
                      </option>
                    ))}
                  </select>

                  {mode === "scan" ? (
                    ""
                  ) : (
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
          {mode == "manual" ? (
            <div className="row">
              <div className="col-12 d-flex flex-column form-group">
                <label htmlFor="item" className="form-label ms-2">
                  Select Item <span className="text-danger fs-6">*</span>
                </label>
                <div className="position-relative w-100">
                  <i className="fas fa-box position-absolute ms-2 z-0 input-icon"></i>
                  <select
                    className="form-control ps-5 ms-1 text-font"
                    id="item"
                    value={vendorItem}
                    onChange={(e) => {
                      {
                        // setFormData({ ...formData, item: e.target.value });
                        // console.log(e);
                        const selectedId = parseInt(e.target.value); // dropdown value is string, convert to number
                        const selectedItem = vendorItems.find(
                          (v) => v.id === selectedId
                        );

                        if (selectedItem) {
                          setVendorItem(selectedId); // vendor state for dropdown
                          setFormData((prev) => ({
                            ...prev,
                            vendorItem: selectedId, // Save vendor id (or name if preferred)
                            quantity: selectedItem.quantity || "", // Auto-fill vendor code
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
                      </option>
                    ))}
                  </select>
                  <i className="fa-solid fa-angle-down position-absolute down-arrow-icon"></i>
                </div>
                {/* {errors.item && (
                  <span className="error-message">{errors.item}</span>
                )} */}
              </div>
            </div>
          ) : mode == "scan" ? (
            <div className="row">
              <div className="col-12 d-flex flex-column form-group">
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
                      setFormData({ ...formData, barcode: e.target.value });
                      // const input = e.target.value;
                      // const vcode = input.substring(2, 8);
                      // console.log(vcode);
                      handleFetchVendorByCode(e.target.value);
                    }}
                  />
                </div>
              </div>
            </div>
          ) : (
            ""
          )}
          <div>
            <div className="row">
              {/* <div className="col-3 d-flex flex-column form-group">
                <label htmlFor="item" className="form-label ms-2">
                  Select Warehouse <span className="text-danger fs-6">*</span>
                </label>
                <div className="position-relative w-100">
                  <i className="fas fa-box position-absolute ms-2 z-0 input-icon"></i>
                  <select
                    className="form-control ps-5 ms-1 text-font"
                    id="item"
                    value={warehouse}
                    onChange={(e) => {
                      {
                        const selectedId = parseInt(e.target.value); // dropdown value is string, convert to number
                        const selectedWarehouse = warehouses.find(
                          (w) => w.id === selectedId
                        );

                        if (selectedWarehouse) {
                          setWarehouse(selectedId);
                          setFormData((prev) => ({
                            ...prev,
                            warehouse: selectedWarehouse.warehouseName || "",
                          }));
                        }
                      }
                    }}
                  >
                    <option value="" disabled hidden className="text-muted">
                      Select Item
                    </option>
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.warehouseName}
                      </option>
                    ))}
                  </select>
                  <i className="fa-solid fa-angle-down position-absolute down-arrow-icon"></i>
                </div>
              </div> */}
              <div className="col-3 d-flex flex-column form-group">
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
                  {mode === "scan" && (
                    <input
                      className="form-check-input mt-0"
                      type="checkbox"
                      id="isStdQtyManual"
                      checked={!isStdQty}
                      onChange={(e) => setIsStdQty(!e.target.checked)}
                    />
                  )}
                </div>
              </div>

              <div className="col-3 d-flex flex-column form-group">
                <button
                  className="btn btn-primary text-8 px-3 fw-medium mx-2"
                  style={{ marginTop: "2.1rem" }}
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
                <div className="form-header">
                  <h2>Receipt Items</h2>
                </div>
                <div className="item-table-container mt-3">
                  <table>
                    <thead>
                      <tr>
                        <th>Item Name</th>
                        <th>Item Code</th>
                        <th>Quantity</th>
                        <th>Batch No</th>
                        <th>Warehouse</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody className="text-break">
                      {receiptList.length === 0 ? (
                        <tr className="no-data-row">
                          <td colSpan="6" className="no-data-cell">
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
                        receiptList.map((receipt, index) => (
                          <tr key={index}>
                            <td className="ps-4">{receipt.itemName}</td>
                            <td className="ps-4">{receipt.itemCode}</td>
                            <td className="ps-4">{receipt.quantity}</td>
                            <td className="ps-4 text-break">
                              {receipt.batchNo}
                            </td>
                            <td className="ps-4">
                              <select
                                className="form-select"
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
                                    updatedList[index].warehouse = selectedName;
                                    updatedList[index].warehouseId = selectedId;
                                    setReceiptList(updatedList);
                                  }
                                }}
                              >
                                <option value="" disabled>
                                  Select Warehouse
                                </option>
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
                              >
                                <i className="fas fa-eye"></i>
                              </button>
                              <button
                                className="btn-icon btn-danger"
                                title="Delete"
                                onClick={(e) => handleDeleteItem(index, e)}
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="form-actions">
                <button
                  className="btn btn-primary border border-0 text-8 px-3 fw-medium py-2 me-3 float-end"
                  onClick={handleSaveReceiptItem}
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
                  className="btn-close"
                  onClick={handleCloseConfirmModal}
                  aria-label="Close"
                ></button>
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
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
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
    </div>
  );
};

export default MaterialIncoming;
