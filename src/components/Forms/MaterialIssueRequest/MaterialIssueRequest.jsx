import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./MaterialIssueRequest.css";
import { toast } from "react-toastify";
import api from "../../../services/api";
import Select from "react-select";
import Cookies from "js-cookie";
import * as XLSX from "xlsx";

const MaterialIssueRequest = () => {
  const [tempQuantity, setTempQuantity] = useState(0);
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

  // Export Requested Items to Excel
  const handleExportRequestedItems = () => {
    if (request.length === 0) {
      toast.warning("No items to export");
      return;
    }

    // Create worksheet data
    const wsData = [
      ["Material Issue Request - Requested Items"],
      ["Transaction #: " + transactionNumber],
      ["Generated on: " + new Date().toLocaleString()],
      [], // Empty row for spacing
      ["Item Code", "Item/BOM Name", "Type", "Quantity"],
    ];

    // Add data rows
    request.forEach((item) => {
      wsData.push([item.code, item.name, item.type, item.quantity]);
    });

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Set column widths
    const colWidths = [
      { wch: 15 }, // Item Code
      { wch: 30 }, // Item/BOM Name
      { wch: 15 }, // Type
      { wch: 15 }, // Quantity
    ];
    ws["!cols"] = colWidths;

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, "Requested Items");

    // Save the file
    XLSX.writeFile(wb, `Material_Issue_Request_${transactionNumber}.xlsx`);
  };

  // Export Recent Requests to Excel
  const handleExportRecentRequests = () => {
    if (recentRequests.length === 0) {
      toast.warning("No recent requests to export");
      return;
    }

    // Create worksheet data
    const wsData = [
      ["Material Issue Request - Recent Requests"],
      ["Generated on: " + new Date().toLocaleString()],
      [], // Empty row for spacing
      ["Transaction #", "Date", "Type", "Status"],
    ];

    // Add data rows
    recentRequests.forEach((req) => {
      wsData.push([req.transactionNumber, req.createdAt, req.type, req.status]);
    });

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Set column widths
    const colWidths = [
      { wch: 20 }, // Transaction #
      { wch: 20 }, // Date
      { wch: 15 }, // Type
      { wch: 15 }, // Status
    ];
    ws["!cols"] = colWidths;

    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(wb, ws, "Recent Requests");

    // Save the file
    XLSX.writeFile(
      wb,
      `Recent_Material_Requests_${new Date().toISOString().split("T")[0]}.xlsx`
    );
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
    setWarehouse("");

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
  const [warehouseList, setWarehouseList] = useState([]);
  const [warehouse, setWarehouse] = useState("");

  // Disable add to request button until all fields are filled
  const isFormValid =
    (requisitionType === "complete bom" && bom && quantity && warehouse) ||
    (requisitionType === "individual items" && type && quantity && warehouse);

  // Modal
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [recent, setRecent] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedRecentRequest, setSelectedRecentRequest] = useState(null);
  const [showRecentItemsModal, setShowRecentItemsModal] = useState(false);
  // Pagination states
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  const fetchWarehouseList = async () => {
    try {
      const response = await api.get("/api/warehouses/wip");
      console.log("Warehouse list response:", response.data.data);
      setWarehouseList(response.data.data);
    } catch (error) {
      console.error("Error fetching warehouse list:", error);
      toast.error("Error fetching warehouse list");
    }
  };

  useEffect(() => {
    // Fetch warehouse list and set warehouse from cookies on component mount
    // Fetch warehouse list and set warehouse from cookies on component mount
    fetchWarehouseList();
    const userWarehouseId = Cookies.get("warehouseId");
    if (userWarehouseId) {
      setWarehouse(userWarehouseId);
    }
  }, []);
  const [reqWarehouse, setReqWarehouse] = useState([]);
  const fetchWarehouses = () => {
    api
      .get("/api/warehouses")
      .then((response) => {
        if (response.data && response.data.status) {
          // Filter warehouses to only include store, wip0, and wip1
          const filteredWarehouses = (response.data.data || []).filter(w => 
            ['store', 'wip0', 'wip1'].includes(w.name.toLowerCase())
          );
          setReqWarehouse(filteredWarehouses);
        } else {
          console.error(
            "Error fetching warehouses:",
            response.data.message || "Unknown error"
          );
        }
      })
      .catch((error) => {
        console.error("Error fetching warehouses:", error);
      });
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  // Calculate the display range for the pagination info
  const getDisplayRange = () => {
    const start = (pagination.currentPage - 1) * pagination.itemsPerPage + 1;
    const end = Math.min(start + recent.length - 1, pagination.totalItems);

    if (recent.length === 0) {
      return "0";
    }

    return `${start}-${end}`;
  };

  const handlePageChange = (newPage) => {
    if (
      newPage < 1 ||
      newPage > pagination.totalPages ||
      newPage === pagination.currentPage
    ) {
      return;
    }

    setPagination((prev) => ({
      ...prev,
      currentPage: newPage,
    }));

    // fetch reports will be called by the useEffect that depends on currentPage
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const totalPages = pagination.totalPages;
    const currentPage = pagination.currentPage;

    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 3) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }

    if (currentPage >= totalPages - 2) {
      return [
        1,
        "...",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [
      1,
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      totalPages,
    ];
  };

  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = parseInt(e.target.value);

    setPagination((prev) => ({
      ...prev,
      itemsPerPage: newItemsPerPage,
      currentPage: 1, // Reset to first page when changing items per page
    }));

    // fetchItems will be called by the useEffect that depends on itemsPerPage
  };

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
        //  console.log("BOM Data:", bomData);
        // Extract BOM names for dropdown
        const bomNames = bomData.map((bom) => ({
          id: bom.id,
          name: bom.name,
          code: bom.code,
        }));
        //  console.log("BOM Names:", bomNames);
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
  const [selectedOption, setSelectedOption] = useState([]);

  const handleAddRequest = async (e) => {
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
      console.log("Selected BOM ID: " + bom);
      const selectedBOM = bomList.find((b) => b.id === bom);
      setSelectedOption(selectedBOM);
      setSelectedOption(selectedBOM);
      if (!selectedBOM) {
        toast.error("Selected BOM not found");
        return;
      }

      console.log("WIP warehouse id: " + warehouse);
      // console.log("selected BOM: " + JSON.stringify(selectedBOM));
      await Promise.all(
        selectedBOM.items.map(async (i) => {
          console.log(
            `Fetching stock quantity for item ${i.itemCode} in warehouse ${i.warehouseId}`
          );
          const response = await api.post(
            `/api/inventory/itemQuantity/${i.warehouseId}/${i.itemCode}`
          );
          // console.log(
          //   `Stock quantity for item ${i.itemCode}:`,
          //   response.data
          // );
          i.stockQty = response.data.data[0].quantity;
        })
      );
      await Promise.all(
        selectedBOM.items.map(async (i) => {
          const response = await api.post(
            `/api/inventory/itemQuantity/${warehouse}/${i.itemCode}`
          );
          i.wipQty = response.data.data[0].quantity;
        })
      );

      console.log(JSON.stringify(selectedBOM));

      const newBOM = {
        id: selectedBOM.id,
        name: selectedBOM.name,
        type: "BOM",
        code: selectedBOM.code,
        quantity,
        warehouse,
        items: selectedBOM.items.map((i) => ({
          ...i,
          calculatedQuantity: i.quantity * quantity,
        })),
        // selectedBOM.items,
      };
      console.log("newBOM:" + newBOM);
      setTempQuantity(quantity);
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
      const selectedItem = itemsList.find((item) => item.id === type);

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
        warehouse,
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (request.length === 0) {
      toast.error("Please add at least one item to the request");
      return;
    }

    try {
      // Determine type based on the first item
      const requestType = request[0].type === "BOM" ? "bom" : "items";
      console.log("Warehouse: " + warehouse);
      // Format data for API
      // const formattedItems = request.map((item) => ({
      //   id: item.id,
      //   name: item.name,
      //   code: item.code,
      //   type: item.type.toLowerCase(),
      //   quantity: Number(item.quantity),
      // }));
      const formattedItems = request.flatMap((item) => {
        if (item.type === "bom" || item.type === "BOM") {
          // BOM - flatten the sub-items with calculated quantity and their respective warehouses
          return item.items.map((subItem) => ({
            id: subItem.itemId,
            name: subItem.itemName,
            code: subItem.itemCode,
            type: "item", // sub-items are always individual items
            quantity: Number(subItem.calculatedQuantity),
            warehouseId: Number(subItem.warehouseId || warehouse), // Use item-specific warehouse or default
          }));
        } else {
          // Individual item
          return [
            {
              id: item.id,
              name: item.name,
              code: item.code,
              type: "item",
              quantity: Number(item.quantity),
              warehouseId: Number(item.warehouse), // Use the warehouse selected for individual item
            },
          ];
        }
      });

      const payload = {
        transactionNumber,
        type: requestType,
        bomName: selectedOption?.name || "",
        bomCode: selectedOption?.code || "",
        items: formattedItems,
      };

      console.log("Submitting payload:", JSON.stringify(payload));

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
      toast.error(error.response.data.message || "Error submitting request");
      console.error("Error submitting material request:", error);
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

  const handleQuantityChange = (id, val) => {
    const regex = /^(\d+(\.\d{0,2})?)?$/;

    if (val === "" || regex.test(val)) {
      const updatedData = request.map((item) =>
        item.id === id ? { ...item, quantity: val } : item
      );
      setRequest(updatedData);
    }
  };

  // Toaltal quantity calculation
  const handleBOMItemQuantityChange = (newVal, itemCode) => {
    const updatedItems = selectedItem.items.map((item) =>
      item.itemCode === itemCode
        ? { ...item, calculatedQuantity: Number(newVal) }
        : item
    );
    setSelectedItem({ ...selectedItem, items: updatedItems });
  };

  // Save button in Item Details modal
  const handleSaveItemDetails = () => {
    if (!selectedItem) return;

    // Validate that all items have a warehouse selected
    const missingWarehouse = selectedItem.items.some(item => !item.warehouseId);
    if (missingWarehouse) {
      toast.error("Please select warehouse for all items");
      return;
    }

    const updatedRequest = request.map((reqItem) =>
      reqItem.id === selectedItem.id
        ? { ...reqItem, items: selectedItem.items }
        : reqItem
    );

    setRequest(updatedRequest);
    setSelectedItem(null); // Close modal
    setShowModal(false);
    toast.success("Item details updated");
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
                  Requisition Type <span className="text-danger fs-6">*</span>
                </label>
                <div className="position-relative w-100">
                  <i className="fas fa-rectangle-list ms-2 position-absolute z-0 input-icon margin-top-8 text-font"></i>
                  <select
                    className={`form-select ps-5 ms-2 text-font ${
                      requisitionType === "" ? "text-muted" : ""
                    }`}
                    id="requisitionType"
                    value={requisitionType}
                    onChange={handleRequisitionChange}
                  >
                    <option value="">Select Type</option>

                    {/* Show BOM option only if allowed by current request state */}
                    {getRequisitionTypeOptions().includes("complete bom") &&
                      !isBOMAdded && <option value="complete bom">BOM</option>}

                    {/* Show Individual Items option only if allowed by current request state */}
                    {getRequisitionTypeOptions().includes(
                      "individual items"
                    ) && (
                      <option value="individual items">Individual Items</option>
                    )}
                  </select>
                </div>
              </div>

              {/* Select BOM (conditionally shown) */}
              {isCompleteBOM && !isBOMAdded && (
                <div className={`${fieldClass} form-group`}>
                  <label htmlFor="selectBOM" className="form-label ms-2">
                    Select BOM <span className="text-danger fs-6">*</span>
                  </label>
                  <div className="position-relative w-100">
                    <i
                      className="fas fa-sitemap ms-2 position-absolute input-icon mt-1 text-font"
                      style={{
                        top: "50%",
                        left: "10px",
                        transform: "translateY(-50%)",
                        zIndex: 1,
                      }}
                    ></i>
                    <Select
                      classNamePrefix="react-select"
                      className={`ms-1 mt-4 text-font ${
                        bom === "" ? "text-muted" : ""
                      }`}
                      id="selectBOM"
                      value={
                        bom
                          ? {
                              value: bom,
                              label: `(${
                                bomList.find((b) => b.id === bom)?.code
                              }) - ${bomList.find((b) => b.id === bom)?.name}`,
                            }
                          : null
                      }
                      onChange={(selected) => {
                        console.log("Selected BOM:", selected);
                        setBom(selected ? selected.value : "");
                      }}
                      placeholder="Select BOM"
                      options={bomList.map((b) => ({
                        value: b.id,
                        label: `(${b.code}) - ${b.name}`,
                      }))}
                      styles={{
                        control: (base) => ({
                          ...base,
                          width: "100%",
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
                    {/* <option value="">Select BOM</option>
                      {availableBOMs.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.code})
                        </option>
                      ))}
                    </select> */}
                  </div>
                </div>
              )}

              {/* Select Individual Items (conditionally shown) */}
              {isIndividualItems && (
                <div className={`${fieldClass} form-group`}>
                  <label htmlFor="selectItem" className="form-label ms-2">
                    Select Item <span className="text-danger fs-6">*</span>
                  </label>
                  <div className="position-relative w-100">
                    {/* <i className="fas fa-box ms-2 position-absolute z-0 input-icon margin-top-8"></i> */}
                    {/* <select
                      className={`form-select ps-5 ms-1 text-font ${
                        type === "" ? "text-muted" : ""
                      }`}
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
                    </select> */}
                    <i
                      className="fas fa-box ms-2 position-absolute input-icon margin-top-8"
                      style={{
                        top: "50%",
                        left: "10px",
                        transform: "translateY(-50%)",
                        zIndex: 1,
                      }}
                    ></i>
                    <Select
                      id="selectItem"
                      className="ms-1 text-font"
                      classNamePrefix="react-select"
                      value={
                        availableItems
                          .map((item) => ({
                            value: item.id,
                            label: `(${item.code}) - ${item.name}`,
                          }))
                          .find((opt) => opt.value === type) || null
                      }
                      onChange={(selected) =>
                        setType(selected ? selected.value : "")
                      }
                      options={availableItems.map((item) => ({
                        value: item.id,
                        label: `(${item.code}) - ${item.name}`,
                      }))}
                      placeholder="Select Item"
                      isClearable
                      styles={{
                        control: (base) => ({
                          ...base,
                          width: "100%",
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
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className={`${fieldClass} form-group`}>
                <label htmlFor="quantity" className="form-label ms-1">
                  Quantity <span className="text-danger fs-6">*</span>
                </label>
                <div className="position-relative w-100">
                  <i className="fas fa-calculator ms-2 position-absolute z-0 input-icon margin-top-8 text-font"></i>
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

              {/* Warehouse */}
              <div className={`${fieldClass} form-group`}>
                <label htmlFor="warehouse" className="form-label ms-1">
                  Location <span className="text-danger fs-6">*</span>
                </label>
                <div className="position-relative w-100">
                  <i className="fas fa-warehouse ms-2 position-absolute z-0 input-icon margin-top-8 text-font"></i>
                  <select
                    className={`form-select ps-5 ms-2 text-font`}
                    id="warehouse"
                    value={warehouse}
                    onChange={(e) => setWarehouse(e.target.value)}
                    disabled
                  >
                    <option value="" disabled hidden>
                      Select Warehouse Location
                    </option>
                    {warehouseList.map((w) => (
                      <option value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            {/* Add Button */}
            <div className="row">
              <div className={`${fieldClass} form-group`}>
                <label className="form-label mb-4"></label>
                <button
                  type="button"
                  className="btn btn-primary text-8 px-3 fw-medium mt-4 float-end"
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
                  <button
                    type="button"
                    className="btn btn-outline-success px-2 py-1 text-8"
                    onClick={handleExportRequestedItems}
                  >
                    <i className="fa-solid fa-file-excel me-1"></i> Export Excel
                  </button>
                </div>
                <table className="align-middle">
                  <thead>
                    <tr>
                      <th>Item/BOM Code</th>
                      <th>Item/BOM Name</th>
                      <th>Type</th>
                      <th>Quantity</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-break">
                    {Array.isArray(request) && request.length > 0 ? (
                      request.map((i, index) => (
                        <tr key={index}>
                          <td className="ps-4">
                            <span>{i.code}</span>
                          </td>
                          <td className="ps-4">
                            <span>{i.name}</span>
                          </td>
                          <td className="ps-4">
                            <span>{i.type}</span>
                          </td>
                          <td className="ps-4">
                            <span>
                              {/* <input
                                type="text"
                                className="form-control text-8"
                                value={i.quantity}
                                onChange={(e) =>
                                  handleQuantityChange(i.id, e.target.value)
                                }
                              /> */}
                              {i.quantity}
                            </span>
                          </td>
                          <td className="actions ps-4">
                            <button
                              type="button"
                              className={`btn-icon view ${
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
                              className="btn-icon delete"
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
                  <button
                    type="button"
                    className="btn btn-outline-success px-2 py-1 text-8"
                    onClick={handleExportRecentRequests}
                  >
                    <i className="fa-solid fa-file-excel me-1"></i> Export Excel
                  </button>
                </div>
                <table className="align-middle">
                  <thead>
                    <tr>
                      <th>Transaction #</th>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Items</th>
                      <th>Store Status</th>
                      <th>Approval Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-break">
                    {recentRequests.length > 0 ? (
                      recentRequests.map((req, index) => (
                        <tr key={index}>
                          <td>{req.transactionNumber}</td>
                          <td>{req.createdAt}</td>
                          <td className="text-capitalize">{req.type}</td>
                          <td>
                            <button
                              type="button"
                              className="btn-icon view"
                              title="View Items"
                              onClick={() => {
                                setSelectedRecentRequest(req);
                                setShowRecentItemsModal(true);
                              }}
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                          </td>
                          <td>
                            <span
                              className={`status-badge ${req.status.toLowerCase()}`}
                            >
                              {req.status}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`status-badge ${req.approvalStatus.toLowerCase()}`}
                            >
                              {req.approvalStatus}
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
                {/* Pagination */}
                <div className="pagination-container">
                  <div className="pagination-info">
                    Showing {getDisplayRange()} of {filteredItems.length}{" "}
                    entries
                  </div>
                  <div className="pagination">
                    <button
                      className="btn-page"
                      disabled={pagination.currentPage === 1}
                      onClick={() =>
                        handlePageChange(pagination.currentPage - 1)
                      }
                    >
                      <i className="fas fa-chevron-left"></i>
                    </button>

                    {getPageNumbers().map((page, index) =>
                      page === "..." ? (
                        <span
                          key={`ellipsis-${index}`}
                          className="pagination-ellipsis"
                        >
                          ...
                        </span>
                      ) : (
                        <button
                          key={page}
                          className={`btn-page ${
                            pagination.currentPage === page ? "active" : ""
                          }`}
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </button>
                      )
                    )}

                    <button
                      className="btn-page"
                      disabled={
                        pagination.currentPage === pagination.totalPages
                      }
                      onClick={() =>
                        handlePageChange(pagination.currentPage + 1)
                      }
                    >
                      <i className="fas fa-chevron-right"></i>
                    </button>
                  </div>
                  <div className="items-per-page">
                    <select
                      value={pagination.itemsPerPage}
                      onChange={handleItemsPerPageChange}
                    >
                      <option value="10">10 per page</option>
                      <option value="25">25 per page</option>
                      <option value="50">50 per page</option>
                      <option value="100">100 per page</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* View Modal */}
      {showModal && (
        <div
          className="modal show d-block modal-xl"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fa-solid fa-circle-info me-2"></i>Item Details
                </h5>
                <button
                  type="button"
                  className="btn"
                  aria-label="Close"
                  onClick={() => setShowModal(false)}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="modal-body">
                <div className="user-details-grid">
                  <div className="detail-item">
                    <strong>Name:</strong>
                    <span>{selectedItem?.name}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Type:</strong>
                    <span>{selectedItem?.type}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Code:</strong>
                    <span>{selectedItem?.code}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Requested Quantity:</strong>
                    <span>{selectedItem?.quantity}</span>
                  </div>
                </div>

                {selectedItem?.items && selectedItem.items.length > 0 && (
                  <>
                    <hr />
                    <h6>BOM Items:</h6>
                    <table className="align-middle">
                      <thead>
                        <tr>
                          <th>Item Name</th>
                          <th>Item Code</th>
                          <th>UOM</th>
                          <th>Requested Qty</th>
                          <th>Store Qty</th>
                          <th>WIP Qty</th>
                          <th>Warehouse</th>
                        </tr>
                      </thead>
                      <tbody className="text-break">
                        {selectedItem.items.map((item, idx) => (
                          <tr key={idx}>
                            <td>{item.itemName}</td>
                            <td>{item.itemCode}</td>
                            <td>{item.uom}</td>
                            <td>
                              <input
                                type="text"
                                className="form-control text-8"
                                value={item.calculatedQuantity}
                                onChange={(e) =>
                                  handleBOMItemQuantityChange(
                                    e.target.value,
                                    item.itemCode
                                  )
                                }
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                className="form-control text-8"
                                value={item.stockQty}
                                disabled
                              />
                            </td>
                            <td>
                              <input
                                type="text"
                                className="form-control text-8"
                                value={item.wipQty}
                                disabled
                              />
                            </td>
                            <td>
                              <select
                                className="form-select text-font"
                                value={item.warehouseId || ""}
                                onChange={(e) => {
                                  const updatedItems = selectedItem.items.map((i) =>
                                    i.itemCode === item.itemCode
                                      ? { ...i, warehouseId: e.target.value }
                                      : i
                                  );
                                  setSelectedItem({
                                    ...selectedItem,
                                    items: updatedItems,
                                  });
                                }}
                              >
                                <option value="" disabled>
                                  Select Warehouse
                                </option>
                                {reqWarehouse
                                  .filter(w => ['store', 'wip0', 'wip1'].includes(w.name.toLowerCase()))
                                  .map((w) => (
                                    <option key={w.id} value={w.id}>
                                      {w.name}
                                    </option>
                                  ))}
                              </select>
                              {/* {item.warehouseName} */}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-primary text-8"
                  onClick={handleSaveItemDetails}
                >
                  <i className="fa-solid fa-floppy-disk me-1"></i> Save Changes
                </button>
                <button
                  className="btn btn-secondary text-8"
                  onClick={() => {
                    setSelectedItem(null);
                    setShowModal(false);
                  }}
                >
                  <i className="fa-solid fa-xmark me-1"></i> Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Items Modal */}
      {showRecentItemsModal && selectedRecentRequest && (
        <div
          className="modal show d-block modal-xl"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fa-solid fa-clipboard-list me-2"></i>Request
                  Items
                </h5>
                <button
                  type="button"
                  className="btn"
                  aria-label="Close"
                  onClick={() => {
                    setSelectedRecentRequest(null);
                    setShowRecentItemsModal(false);
                  }}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="modal-body">
                <div className="user-details-grid">
                  <div className="detail-item">
                    <strong>Transaction Number:</strong>
                    <span>{selectedRecentRequest.transactionNumber}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Date:</strong>
                    <span>{selectedRecentRequest.createdAt}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Type:</strong>
                    <span className="text-capitalize">
                      {selectedRecentRequest.type}
                    </span>
                  </div>
                  <div className="detail-item">
                    <strong>Status:</strong>
                    <span
                      className={`status-badge ${selectedRecentRequest.status.toLowerCase()}`}
                    >
                      {selectedRecentRequest.status}
                    </span>
                  </div>
                </div>

                {selectedRecentRequest.items &&
                  selectedRecentRequest.items.length > 0 && (
                    <>
                      <hr />
                      <h6>Items List:</h6>
                      <table className="align-middle">
                        <thead>
                          <tr>
                            <th>Item Name</th>
                            <th>Item Code</th>
                            <th>Type</th>
                          </tr>
                        </thead>
                        <tbody className="text-break">
                          {selectedRecentRequest.items.map((item, idx) => (
                            <tr key={idx}>
                              <td className="p-4">{item.name}</td>
                              <td className="p-4">{item.code}</td>
                              <td className="text-capitalize p-4">
                                {item.type}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </>
                  )}
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary text-8"
                  onClick={() => {
                    setSelectedRecentRequest(null);
                    setShowRecentItemsModal(false);
                  }}
                >
                  <i className="fa-solid fa-xmark me-1"></i> Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialIssueRequest;
