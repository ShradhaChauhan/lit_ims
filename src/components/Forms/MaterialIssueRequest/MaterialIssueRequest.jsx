import React, { useState } from "react";
import { Link } from "react-router-dom";

const MaterialIssueRequest = () => {
  const handleReset = (e) => {
    e.preventDefault();
  };

  const [requisitionType, setRequisitionType] = useState("");
  const [request, setRequest] = useState([]);
  const [bom, setBom] = useState("");
  const [type, setType] = useState("");
  const [quantity, setQuantity] = useState("");
  const [isBOMAdded, setIsBOMAdded] = useState(false);
  const allItems = ["Screw M4", "Bolt M6", "Washer 8mm"];
  const [availableItems, setAvailableItems] = useState(allItems);
  const [availableBOMs, setAvailableBOMs] = useState([
    "Product A Assembly",
    "Product B Assembly",
    "Product C Assembly",
  ]);

  // Modal
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleView = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleRequisitionChange = async (e) => {
    e.preventDefault();
    setRequisitionType(e.target.value);
    if (e.target.value === "complete bom") {
      // Call api to load select bom dropdown list
      try {
        const response = await api.get("/api/bom/all");
      } catch (error) {
        toast.error("Error fetching BOM list");
        console.error("Error fetching bom form dropdown list:", error);
      }
    } else {
      // Call api to load select item dropdown list
    }
  };

  const isCompleteBOM = requisitionType === "complete bom";
  const isIndividualItems = requisitionType === "individual items";

  // Dynamically calculate widths
  const fieldClass = isCompleteBOM || isIndividualItems ? "flex-1" : "flex-1-3";

  const handleAddRequest = (e) => {
    e.preventDefault();

    if (!quantity || (!bom && !type)) return;

    if (requisitionType === "complete bom") {
      if (isBOMAdded) {
        alert("A BOM has already been added.");
        return;
      }

      const newBOM = {
        name: bom,
        type: "BOM",
        code: "100000",
        quantity,
      };

      setRequest((prev) => [...prev, newBOM]);
      setIsBOMAdded(true);
      setBom("");
      setQuantity("");
      setRequisitionType("");
    }

    if (requisitionType === "individual items") {
      // Check for duplicates
      const isDuplicate = request.some(
        (item) => item.name === type && item.type === "Item"
      );

      if (isDuplicate) {
        alert("This item has already been added.");
        return;
      }

      const newItem = {
        name: type,
        type: "Item",
        code: "100001",
        quantity,
      };

      setRequest((prev) => [...prev, newItem]);

      // Remove item from dropdown list
      setAvailableItems((prev) => prev.filter((item) => item !== type));

      // Reset form
      setType("");
      setQuantity("");
      setRequisitionType("");
    }
  };

  // Auto generate transaction number
  const generateTransactionNumber = () => {
    const year = new Date().getFullYear(); // e.g., 2025
    const randomNum = Math.floor(1000 + Math.random() * 9000); // 4-digit random
    return `REQ-${year}-${randomNum}`;
  };

  const [transactionNumber] = useState(generateTransactionNumber());

  // Delete item form Requesteed items
  const handleDelete = (nameToDelete) => {
    // Remove item from request list
    const updatedRequest = request.filter((item) => item.name !== nameToDelete);
    setRequest(updatedRequest);

    // If it's an individual item, re-add it to available items
    const deletedItem = request.find((item) => item.name === nameToDelete);

    if (deletedItem?.type === "Item") {
      setAvailableItems((prev) => [...prev, deletedItem.name]);
    }

    // If it's a BOM, allow user to add BOM again
    if (deletedItem?.type === "BOM") {
      setIsBOMAdded(false);
    }
  };

  return (
    <div>
      {/* Header section */}
      <nav className="navbar bg-light border-body" data-bs-theme="light">
        <div className="container-fluid">
          <div className="mt-4">
            <h3 className="nav-header header-style">Material Issue Request</h3>
            <p className="breadcrumb">
              <Link to="/dashboard">
                <i className="fas fa-home text-8"></i>
              </Link>{" "}
              <span className="ms-1 mt-1 text-small-gray">
                / Transactions / Material Issue Request
              </span>
            </p>
          </div>
        </div>
      </nav>
      {/* Form Section */}
      <div className="table-form-container mx-2 mb-5">
        <div className="form-header">
          <h2>
            <i className="fas fa-file-invoice"></i> Material Requisition Entry
          </h2>
          <p>
            Transaction #: <strong>{transactionNumber}</strong>
          </p>
        </div>
        {/* Form Fields */}
        <form autoComplete="off" className="padding-2">
          <div className="form-grid pt-0">
            {/* Input fields section */}
            <div className="row form-style">
              {/* Requisition Type */}
              <div className={`${fieldClass} form-group`}>
                <label htmlFor="requisitionType" className="form-label ms-2">
                  Requisition Type
                </label>
                <div className="position-relative w-100">
                  <i className="fas fa-rectangle-list ms-2 position-absolute input-icon margin-top-8"></i>
                  <select
                    className="form-control ps-5 ms-1 text-font"
                    id="requisitionType"
                    value={requisitionType}
                    onChange={handleRequisitionChange}
                  >
                    <option value="">Select Type</option>

                    {!isBOMAdded && (
                      <option value="complete bom">Complete BOM</option>
                    )}

                    <option value="individual items">Individual Items</option>
                  </select>

                  <i className="fa-solid fa-angle-down position-absolute down-arrow-icon margin-top-8"></i>
                </div>
              </div>

              {/* Select BOM (conditionally shown) */}
              {isCompleteBOM && !isBOMAdded && (
                <div className={`${fieldClass} form-group`}>
                  <label htmlFor="selectBOM" className="form-label ms-2">
                    Select BOM
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-sitemap ms-2 position-absolute input-icon margin-top-8"></i>
                    <select
                      className="form-control ps-5 ms-1 text-font"
                      id="selectBOM"
                      value={bom}
                      onChange={(e) => setBom(e.target.value)}
                    >
                      <option value="">Select BOM</option>
                      {availableBOMs.map((b, idx) => (
                        <option key={idx} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Select Individual Items (conditionally shown) */}
              {isIndividualItems && (
                <div className={`${fieldClass} form-group`}>
                  <label htmlFor="selectItem" className="form-label ms-2">
                    Select Item
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-box ms-2 position-absolute input-icon margin-top-8"></i>
                    <select
                      className="form-control ps-5 ms-1 text-font"
                      id="selectItem"
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                    >
                      <option value="">Select Item</option>
                      {availableItems.map((item, idx) => (
                        <option key={idx} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className={`${fieldClass} form-group`}>
                <label htmlFor="quantity" className="form-label ms-2">
                  Quantity
                </label>
                <div className="position-relative w-100">
                  <i className="fas fa-calculator ms-2 position-absolute input-icon margin-top-8"></i>
                  <input
                    type="number"
                    className="form-control ps-5 ms-1 text-font"
                    id="quantity"
                    placeholder="Quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>
              </div>

              {/* Add Button */}
              <div className={`${fieldClass} form-group`}>
                <label className="form-label mb-4"></label>
                <button
                  type="button"
                  className="btn btn-primary text-8 px-3 fw-medium w-100 mt-4"
                  onClick={handleAddRequest}
                >
                  <i className="fa-solid fa-add me-1"></i> Add to Request
                </button>
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
                    <tr>
                      <th>Item/BOM Name</th>
                      <th>Type</th>
                      <th>Code</th>
                      <th>Quantity</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(request) && request.length > 0 ? (
                      request.map((i, index) => (
                        <tr key={index}>
                          <td className="ps-4">
                            <span>{i.name}</span>
                          </td>
                          <td className="ps-4">
                            <span>{i.type}</span>
                          </td>
                          <td className="ps-4">
                            <span>{i.code}</span>
                          </td>
                          <td className="ps-4">
                            <span>{i.quantity}</span>
                          </td>
                          <td className="actions ps-4">
                            <button
                              type="button"
                              className={`btn-icon btn-primary ${
                                i.type !== "BOM" ? "d-none" : ""
                              }`}
                              title="View Details"
                              data-bs-toggle="modal"
                              data-bs-target="#viewModal"
                              onClick={() => handleView(i)}
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button
                              type="button"
                              className="btn-icon btn-danger"
                              title="Delete"
                              onClick={() => handleDelete(i.name)}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr className="no-data-row">
                        <td colSpan="5" className="no-data-cell">
                          <div className="no-data-content">
                            <i className="fas fa-clipboard-list no-data-icon"></i>
                            <p className="no-data-text">No Items Requested</p>
                            <p className="no-data-subtext">
                              Add BOM or individual items to your request
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>{" "}
            {/* Button Section */}
            <div className="form-actions">
              <button type="button" className="btn btn-primary add-btn">
                <i className="fa-solid fa-floppy-disk me-1"></i> Save Receipt
              </button>
              <button
                className="btn btn-secondary add-btn me-2"
                type="button"
                onClick={handleReset}
              >
                <i className="fa-solid fa-arrows-rotate me-1"></i> Reset
              </button>
            </div>
            {/* Recent Requests Table Section */}
            <div className="margin-2 mx-2">
              <div className="table-container">
                <div className="table-header">
                  <h6>Recent Requests</h6>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>Transaction #</th>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Items</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="no-data-row">
                      <td colSpan="5" className="no-data-cell">
                        <div className="no-data-content">
                          <i className="fas fa-clock-rotate-left no-data-icon"></i>
                          <p className="no-data-text">No Recent Requests</p>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </form>
      </div>
      {/* View Modal */}
      {/* View Details Modal */}
      {showModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Item Details</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>Name: {selectedItem?.name}</p>
                <p>Type: {selectedItem?.type}</p>
                <p>Code: {selectedItem?.code}</p>
                <p>Quantity: {selectedItem?.quantity}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* {showModal && selectedItem && (
        <div className="modal fade" id="viewModal" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Item Details</h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  <strong>Name:</strong> {selectedItem.name}
                </p>
                <p>
                  <strong>Type:</strong> {selectedItem.type}
                </p>
                <p>
                  <strong>Code:</strong> {selectedItem.code}
                </p>
                <p>
                  <strong>Quantity:</strong> {selectedItem.quantity}
                </p>
              </div>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default MaterialIssueRequest;
