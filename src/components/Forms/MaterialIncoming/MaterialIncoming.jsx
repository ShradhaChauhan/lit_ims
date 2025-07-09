import { Modal } from "bootstrap";
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../../services/api";

const MaterialIncoming = () => {
  const [errors, setErrors] = useState({});
  const receiptModalRef = useRef(null);
  const [mode, setMode] = useState("");
  const [itemQuantity, setItemQuantity] = useState("");
  const [vcode, setVcode] = useState("");
  const [vendor, setVendor] = useState("");
  const [vendors, setVendors] = useState([]);
  const [vendorItem, setVendorItem] = useState("");
  const [vendorItems, setVendorItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isShowReceiptDetails, setIsShowReceiptDetails] = useState(false);
  const [currentReceipt, setCurrentReceipt] = useState(null);
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
    });
    setMode("");
    setVendor("");
    setReceiptList([]);
  };

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

          // Add the verified item to the receipt list with vendor information
          const newItem = {
            itemName: batchData.itemName,
            itemCode: batchData.itemCode,
            quantity: batchData.quantity,
            batchNo: batchData.batchNo,
            vendorCode: formData.code,
            vendorName: formData.vendorName,
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
      } else if (mode === "auto") {
        // Auto mode - generate batch number
        if (!vendorItem || !formData.itemCode) {
          toast.error("Please select an item first");
          setLoading(false);
          return;
        }

        console.log("Sending request to generate batch no with:", {
          vendorCode: formData.code,
          itemCode: formData.itemCode,
          quantity: formData.quantity,
        });

        const response = await api.post(
          `/api/receipt/generate-batch?vendorCode=${formData.code}&itemCode=${formData.itemCode}&quantity=${formData.quantity}`
        );

        if (response.data) {
          const batchNo = response.data;
          console.log("Generated batch:", batchNo);

          const newItem = {
            itemName: formData.itemName,
            itemCode: formData.itemCode,
            quantity: formData.quantity,
            batchNo: batchNo,
            vendorCode: formData.code,
            vendorName: formData.vendorName,
          };

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
          }));
        } else {
          toast.error("Failed to generate batch number");
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
        items: receiptList,
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
      toast.error("Error: Unable to save material receipt.");
      console.error("Error saving material receipt:", error);
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
      toast.error("Error: Unable to fetch vendors list.");
      console.error("Error fetching vendors list:", error);
    } finally {
      setLoading(false);
    }
  };

  const getVendorItems = async (code) => {
    try {
      console.log("Code: " + code);
      const response = await api.get(`/api/vendor-item/items/${code}`); // API to get vendors items list
      setVendorItems(response.data.data);
      console.log(response.data.data);
    } catch (error) {
      toast.error("Error: Unable to fetch vendors list.");
      console.error("Error fetching vendors list:", error);
    }
  };

  const handleModeChange = () => {
    setVendor("");
    // Reset form fields except mode and vendor information
    setFormData((prev) => ({
      ...prev,
      itemName: "",
      itemCode: "",
      quantity: "",
      batchno: "",
    }));

    // Optionally clear item list if you're managing added items
    // setReceiptList([]);
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
          <button className="btn-close" onClick={handleReset}></button>
        </div>
        {/* Form Fields */}
        <form autoComplete="off" className="padding-2">
          <div className="form-grid pt-0">
            <div className="row form-style">
              <div className="col-4 d-flex flex-column form-group">
                <label htmlFor="receiptMode" className="form-label ms-2">
                  Receipt Mode
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
                    <option value="auto">Auto</option>
                  </select>
                  <i className="fa-solid fa-angle-down position-absolute down-arrow-icon"></i>
                </div>
                {errors.mode && (
                  <span className="error-message">{errors.mode}</span>
                )}
              </div>
              <div className="col-4 d-flex flex-column form-group">
                <label htmlFor="vendorName" className="form-label ms-2">
                  Vendor Name
                </label>
                <div className="position-relative w-100">
                  <i className="fas fa-building ms-2 position-absolute z-0 input-icon"></i>
                  <select
                    className="form-control ps-5 ms-1 text-font"
                    id="vendorName"
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
                      Select Vendor
                    </option>
                    {vendors.map((v) => (
                      <option value={v.id} key={v.id}>
                        {v.name}
                      </option>
                    ))}
                  </select>

                  <i className="fa-solid fa-angle-down position-absolute down-arrow-icon"></i>
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
          {mode == "auto" ? (
            <div className="row">
              <div className="col-12 d-flex flex-column form-group">
                <label htmlFor="item" className="form-label ms-2">
                  Select Item
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
                  Scan Barcode
                </label>
                <div className="position-relative w-100">
                  <i className="fas fa-qrcode position-absolute ms-2 z-0 input-icon"></i>
                  <input
                    type="text"
                    className="form-control ps-5 ms-1 text-font"
                    id="item"
                    value={formData.barcode}
                    placeholder="Scan QR code"
                    onChange={(e) =>
                      setFormData({ ...formData, barcode: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          ) : (
            ""
          )}
          <div>
            <div className="row">
              <div className="col-3 d-flex flex-column form-group">
                <label htmlFor="quantity" className="form-label  ms-2">
                  Quantity
                </label>
                <div className="position-relative w-100">
                  <i className="fas fa-calculator position-absolute ms-2 z-0 input-icon"></i>
                  <input
                    type="text"
                    className="form-control ps-5 ms-1 text-font"
                    id="quantity"
                    placeholder="Quantity"
                    value={formData.quantity}
                    disabled
                  />
                </div>
              </div>
              <div className="col-3 d-flex flex-column form-group">
                <button
                  className="btn btn-primary text-8 px-3 fw-medium mx-2"
                  style={{ marginTop: "2.1rem" }}
                  onClick={handleAddReceiptItem}
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
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {receiptList.length === 0 ? (
                        <tr className="no-data-row">
                          <td colSpan="5" className="no-data-cell">
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
                <h5 className="modal-title">Item Details</h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  <strong>Item Name:</strong> {currentReceipt.itemName}
                </p>
                <p>
                  <strong>Item Code:</strong> {currentReceipt.itemCode}
                </p>
                <p>
                  <strong>Quantity:</strong> {currentReceipt.quantity}
                </p>
                <p>
                  <strong>Batch No:</strong> {currentReceipt.batchNo}
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-bs-dismiss="modal"
                  onClick={() => {
                    document.activeElement?.blur();
                  }}
                >
                  Close
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
