import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./MaterialIssueRequest.css";
import { toast } from "react-toastify";
import api from "../../../services/api";

const MaterialIssueRequest = () => {
  // Helper function to check requisition type restriction
  const getRequisitionTypeOptions = () => {
    // If no items have been added yet, allow both types
    if (request.length === 0) {
      return ["complete bom", "individual items"];
    }

    // If we have a BOM in the list already, only allow BOM type
    if (request.some((item) => item.type === "BOM")) {
      return ["complete bom"];
    }

    // If we have individual items, only allow individual items
    if (request.some((item) => item.type === "Item")) {
      return ["individual items"];
    }

    // Fallback - should not reach here
    return ["complete bom", "individual items"];
  };

  const handleReset = (e) => {
    if (e) e.preventDefault();

    // Reset all form fields
    setRequest([]);
    setRequisitionType("");
    setBom("");
    setType("");
    setQuantity("");
    setIsBOMAdded(false);

    // Reset available items from the original items list
    const itemNames = itemsList.map((item) => ({
      id: item.id,
      name: item.name,
      code: item.code,
      uom: item.uom,
    }));
    setAvailableItems(itemNames);

    // Generate new transaction number
    setTransactionNumber(generateTransactionNumber());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (request.length === 0) {
      toast.error("Please add at least one item to the request");
      return;
    }

    try {
      // Determine type based on the first item
      const requestType = request[0].type === "BOM" ? "bom" : "items";

      // Format data for API
      const formattedItems = request.map((item) => ({
        id: item.id,
        name: item.name,
        code: item.code,
        type: item.type.toLowerCase(),
        quantity: Number(item.quantity),
      }));

      const payload = {
        transactionNumber,
        type: requestType,
        items: formattedItems,
      };

      console.log("Submitting payload:", payload);

      const response = await api.post("/api/requisitions/save", payload);

      if (response.data.status) {
        toast.success("Material request saved successfully");

        // Fetch updated recent requests
        try {
          const recentResponse = await api.get("/api/requisitions/recent");
          if (recentResponse.data.status) {
            setRecentRequests(recentResponse.data.data);
          }
        } catch (error) {
          console.error("Error fetching updated recent requests:", error);
        }

        // Perform complete form reset
        handleReset();
      } else {
        toast.error(response.data.message || "Error saving request");
      }
    } catch (error) {
      toast.error("Error submitting request");
      console.error("Error submitting material request:", error);
    }
  };

  const [requisitionType, setRequisitionType] = useState("");
  const [request, setRequest] = useState([]);
  const [bom, setBom] = useState("");
  const [type, setType] = useState("");
  const [quantity, setQuantity] = useState("");
  const [isBOMAdded, setIsBOMAdded] = useState(false);
  const [availableItems, setAvailableItems] = useState([]);
  const [availableBOMs, setAvailableBOMs] = useState([]);
  const [bomList, setBomList] = useState([]);
  const [itemsList, setItemsList] = useState([]);
  const [recentRequests, setRecentRequests] = useState([]);

  // Disable add to request button until all fields are filled
  const isFormValid =
    (requisitionType === "complete bom" && bom && quantity) ||
    (requisitionType === "individual items" && type && quantity);

  // Modal
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleView = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  // Load BOM and Item data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch BOM data
        const bomResponse = await api.get("/api/bom/all");
        const bomData = bomResponse.data.data;
        setBomList(bomData);

        // Extract BOM names for dropdown
        const bomNames = bomData.map((bom) => ({
          id: bom.id,
          name: bom.name,
          code: bom.code,
        }));
        setAvailableBOMs(bomNames);

        // Fetch Item data
        const itemsResponse = await api.get("/api/items/all");
        const itemsData = itemsResponse.data.data;
        setItemsList(itemsData);

        // Extract item names for dropdown
        const itemNames = itemsData.map((item) => ({
          id: item.id,
          name: item.name,
          code: item.code,
          uom: item.uom,
        }));
        setAvailableItems(itemNames);

        // Fetch recent requests
        const recentResponse = await api.get("/api/requisitions/recent");
        if (recentResponse.data.status) {
          setRecentRequests(recentResponse.data.data);
        }
      } catch (error) {
        toast.error("Error fetching data");
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleRequisitionChange = (e) => {
    e.preventDefault();
    setRequisitionType(e.target.value);
  };

  const isCompleteBOM = requisitionType === "complete bom";
  const isIndividualItems = requisitionType === "individual items";

  // Dynamically calculate widths
  const fieldClass = isCompleteBOM || isIndividualItems ? "flex-1" : "flex-1-3";

  const handleAddRequest = (e) => {
    e.preventDefault();

    if (!quantity || (!bom && !type)) {
      toast.error("Please select item and quantity");
      return;
    }

    // Ensure we're consistent with the current request type
    const currentRequestType = request.length > 0 ? request[0].type : null;
    const newItemType = requisitionType === "complete bom" ? "BOM" : "Item";

    if (currentRequestType && currentRequestType !== newItemType) {
      toast.error(`You can only add ${currentRequestType}s to this request`);
      return;
    }

    if (requisitionType === "complete bom") {
      if (isBOMAdded) {
        alert("A BOM has already been added.");
        return;
      }

      // Find the selected BOM from the list
      const selectedBOM = bomList.find((b) => b.id.toString() === bom);

      if (!selectedBOM) {
        toast.error("Selected BOM not found");
        return;
      }

      const newBOM = {
        id: selectedBOM.id,
        name: selectedBOM.name,
        type: "BOM",
        code: selectedBOM.code,
        quantity,
        items: selectedBOM.items,
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
        (item) => item.id.toString() === type && item.type === "Item"
      );

      if (isDuplicate) {
        alert("This item has already been added.");
        return;
      }

      // Find the selected item from the list
      const selectedItem = itemsList.find(
        (item) => item.id.toString() === type
      );

      if (!selectedItem) {
        toast.error("Selected item not found");
        return;
      }

      const newItem = {
        id: selectedItem.id,
        name: selectedItem.name,
        type: "Item",
        code: selectedItem.code,
        uom: selectedItem.uom,
        quantity,
      };

      setRequest((prev) => [...prev, newItem]);

      // Remove item from dropdown list
      setAvailableItems((prev) =>
        prev.filter((item) => item.id.toString() !== type)
      );

      // Reset form
      setType("");
      setQuantity("");
      setRequisitionType("");
    }
  };

  // Auto generate transaction number
  const generateTransactionNumber = () => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `REQ-${year}-${randomNum}`;
  };

  const [transactionNumber, setTransactionNumber] = useState(
    generateTransactionNumber()
  );

  // Delete item from Requested items
  const handleDelete = (idToDelete) => {
    // Remove item from request list
    const updatedRequest = request.filter((item) => item.id !== idToDelete);
    setRequest(updatedRequest);

    // If it's an individual item, re-add it to available items
    const deletedItem = request.find((item) => item.id === idToDelete);

    if (deletedItem?.type === "Item") {
      // Find the original item in the items list
      const originalItem = itemsList.find((item) => item.id === deletedItem.id);
      if (originalItem) {
        setAvailableItems((prev) => [
          ...prev,
          {
            id: originalItem.id,
            name: originalItem.name,
            code: originalItem.code,
            uom: originalItem.uom,
          },
        ]);
      }
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
                  <i className="fas fa-rectangle-list ms-2 position-absolute z-0 input-icon margin-top-8"></i>
                  <select
                    className="form-control ps-5 ms-1 text-font"
                    id="requisitionType"
                    value={requisitionType}
                    onChange={handleRequisitionChange}
                  >
                    <option value="">Select Type</option>

                    {/* Show BOM option only if allowed by current request state */}
                    {getRequisitionTypeOptions().includes("complete bom") &&
                      !isBOMAdded && (
                        <option value="complete bom">Complete BOM</option>
                      )}

                    {/* Show Individual Items option only if allowed by current request state */}
                    {getRequisitionTypeOptions().includes(
                      "individual items"
                    ) && (
                      <option value="individual items">Individual Items</option>
                    )}
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
                    <i className="fas fa-sitemap ms-2 position-absolute z-0 input-icon margin-top-8"></i>
                    <select
                      className="form-control ps-5 ms-1 text-font"
                      id="selectBOM"
                      value={bom}
                      onChange={(e) => setBom(e.target.value)}
                    >
                      <option value="">Select BOM</option>
                      {availableBOMs.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.code})
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
                    <i className="fas fa-box ms-2 position-absolute z-0 input-icon margin-top-8"></i>
                    <select
                      className="form-control ps-5 ms-1 text-font"
                      id="selectItem"
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                    >
                      <option value="">Select Item</option>
                      {availableItems.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name} ({item.code}) - {item.uom}
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
                  <i className="fas fa-calculator ms-2 position-absolute z-0 input-icon margin-top-8"></i>
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
                  disabled={!isFormValid}
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
                            <span>
                              {i.quantity} {i.uom ? i.uom : ""}
                            </span>
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
                              onClick={() => handleDelete(i.id)}
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
              <button
                type="button"
                className="btn btn-primary add-btn"
                onClick={handleSubmit}
                disabled={request.length === 0}
              >
                <i className="fa-solid fa-floppy-disk me-1"></i> Save Request
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
                    {recentRequests.length > 0 ? (
                      recentRequests.map((req, index) => (
                        <tr key={index}>
                          <td className="ps-4">{req.transactionNumber}</td>
                          <td className="ps-4">{req.createdAt}</td>
                          <td className="ps-4 text-capitalize">{req.type}</td>
                          <td className="ps-4">
                            {req.items && req.items.length > 0
                              ? req.items.map((item) => item.name).join(", ")
                              : "-"}
                          </td>
                          <td className="ps-4">
                            <span
                              className={`status-badge ${req.status.toLowerCase()}`}
                            >
                              {req.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr className="no-data-row">
                        <td colSpan="5" className="no-data-cell">
                          <div className="no-data-content">
                            <i className="fas fa-clock-rotate-left no-data-icon"></i>
                            <p className="no-data-text">No Recent Requests</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* View Modal */}
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
                <p>
                  <strong>Name:</strong> {selectedItem?.name}
                </p>
                <p>
                  <strong>Type:</strong> {selectedItem?.type}
                </p>
                <p>
                  <strong>Code:</strong> {selectedItem?.code}
                </p>
                <p>
                  <strong>Quantity:</strong> {selectedItem?.quantity}
                </p>

                {selectedItem?.items && selectedItem.items.length > 0 && (
                  <>
                    <hr />
                    <h6>BOM Items:</h6>
                    <table className="table table-striped table-sm">
                      <thead>
                        <tr>
                          <th>Item Name</th>
                          <th>Code</th>
                          <th>UOM</th>
                          <th>Qty</th>
                          <th>Warehouse</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedItem.items.map((item, idx) => (
                          <tr key={idx}>
                            <td>{item.itemName}</td>
                            <td>{item.itemCode}</td>
                            <td>{item.uom}</td>
                            <td>{item.quantity}</td>
                            <td>{item.warehouseName}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialIssueRequest;
