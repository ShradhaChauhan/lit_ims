import { Modal } from "bootstrap";
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const MaterialIncoming = () => {
  const [errors, setErrors] = useState({});
  const receiptModalRef = useRef(null);
  const [mode, setMode] = useState("");
  const [vendorList, setVendorList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isShowReceiptDetails, setIsShowReceiptDetails] = useState(false);
  // receiptList is used to store the concatenated formData and show it in the table and to save the material receipt entry in database.
  const [receiptList, setReceiptList] = useState([]);
  // formData is used to set, reset and validate the form data.
  const [formData, setFormData] = useState({
    mode: "",
    vendor: "",
    code: "",
    item: "",
    barcode: "",
    quantity: "",
  });

  const handleReset = () => {
    e.preventDefault();
    setFormData({
      mode: "",
      vendor: "",
      code: "",
      item: "",
      barcode: "",
      quantity: "",
    });
    setMode("");
  };

  const handleViewDetails = (receipt, e) => {
    e.preventDefault();
    console.log(receipt);
    setReceiptList(receipt);
    setIsShowReceiptDetails(true);
  };

  useEffect(() => {
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

  const validateForm = (data) => {
    const errors = {};

    if (!data.mode) {
      errors.mode = "Please select a mode";
    }

    if (!data.vendor) {
      errors.vendor = "Please select vendor name";
    }

    if (!data.item) {
      errors.item = "Please select an item";
    }

    return errors;
  };

  const handleAddReceiptItem = (e) => {
    e.preventDefault();
    const newErrors = validateForm(formData);
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const newItem = {
        id: Date.now(), // unique id for key prop
        name: formData.item, // assuming item name is stored here
        code: formData.code || "AUTO", // fallback if code not set
        quantity: formData.quantity || 1, // default quantity
        batchno: "N/A", // if not present, fallback
      };

      setReceiptList((prevList) => [...prevList, newItem]);

      // Optional: reset item-specific fields after adding
      setFormData((prevData) => ({
        ...prevData,
        item: "",
        code: "",
        quantity: "",
      }));
      console.log(receiptList);
      console.log(Array.isArray(receiptList));
      toast.success("Item added to receipt!");
    }
  };

  const handleSaveReceiptItem = async (e) => {
    e.preventDefault();
    // Logic to save receipt items on click of "Save Receipt" button here.
    try {
      console.log("Submitting receipt data:", receiptList);
      const response = await api.post("/api/", receiptList); //Add the API for saving receipt.
      console.log("Material receipt entry added successfully:", response.data);

      // Reset form after successful submission
      handleReset(e);
    } catch (error) {
      let errorMessage =
        "Failed to add material receipt entry. Please try again.";

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
      console.error("Error adding type:", errorMessage);
      toast.error(errorMessage);
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
          <i className="fas fa-search position-absolute input-icon"></i>
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
                  <i className="fas fa-right-left ms-2 position-absolute input-icon"></i>
                  <select
                    className="form-control ps-5 ms-1 text-font"
                    id="receiptMode"
                    value={formData.mode}
                    onChange={(e) => {
                      setMode(e.target.value);
                      setFormData({ ...formData, mode: e.target.value });
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
                  <i className="fas fa-building ms-2 position-absolute input-icon"></i>
                  <select
                    className="form-control ps-5 ms-1 text-font"
                    id="vendorName"
                    value={formData.vendor}
                    onChange={(e) => {
                      setFormData({ ...formData, vendor: e.target.value });
                    }}
                  >
                    <option value="" disabled hidden className="text-muted">
                      Select Vendor
                    </option>
                    <option value="abc">Abc</option>
                    <option value="xyz">Xyz</option>
                    <option value="def">def</option>
                    {/* {vendorList.map((vendor) => {
                      <option value={vendor.name} key={vendor.id}>
                        {vendor.name}
                      </option>;
                    })} */}
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
                  <i className="fas fa-hashtag position-absolute ms-2 input-icon"></i>
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
                  <i className="fas fa-box position-absolute ms-2 input-icon"></i>
                  <select
                    className="form-control ps-5 ms-1 text-font"
                    id="item"
                    value={formData.item}
                    onChange={(e) =>
                      setFormData({ ...formData, item: e.target.value })
                    }
                  >
                    <option value="" disabled hidden className="text-muted">
                      Select Item
                    </option>
                    <option value="xyz">XYZ</option>
                    <option value="zzz">ZZZ</option>
                    <option value="ooo">OOO</option>
                  </select>
                  <i className="fa-solid fa-angle-down position-absolute down-arrow-icon"></i>
                </div>
                {errors.item && (
                  <span className="error-message">{errors.item}</span>
                )}
              </div>
            </div>
          ) : mode == "scan" ? (
            <div className="row">
              <div className="col-12 d-flex flex-column form-group">
                <label htmlFor="item" className="form-label ms-2">
                  Scan Barcode
                </label>
                <div className="position-relative w-100">
                  <i className="fas fa-qrcode position-absolute ms-2 input-icon"></i>
                  <select
                    className="form-control ps-5 ms-1 text-font"
                    id="item"
                    value={formData.barcode}
                    disabled
                  >
                    <option value="" disabled hidden className="text-muted">
                      Scan QR code
                    </option>
                  </select>
                  <i className="fa-solid fa-angle-down position-absolute down-arrow-icon"></i>
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
                  <i className="fas fa-calculator position-absolute ms-2 input-icon"></i>
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
                  className="btn btn-primary text-8 px-3 fw-medium mx-2 margin-top-2"
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
                        receiptList.map((receipt) => (
                          <tr key={receipt.id}>
                            <td className="ps-4">{receipt.name}</td>
                            <td className="ps-4">{receipt.code}</td>
                            <td className="ps-4">{receipt.quantity}</td>
                            <td className="ps-4">{receipt.batchno}</td>
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
                  onSubmit={handleSaveReceiptItem}
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
      {isShowReceiptDetails && (
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
                  View {receiptList.name}'s Details
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  <strong>Item Name:</strong> {receiptList.name}
                </p>
                <p>
                  <strong>Item Code:</strong> {receiptList.code}
                </p>
                <p>
                  <strong>Quantity:</strong> {receiptList.quantity}
                </p>
                <p>
                  <strong>Batch No:</strong> {receiptList.batchno}
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
