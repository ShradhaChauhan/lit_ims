import React, { useContext, useEffect, useRef, useState } from "react";
import ItemMasterModal from "../../Modals/ItemMasterModal";
import { AppContext } from "../../../context/AppContext";
import api from "../../../services/api";
import { Link } from "react-router-dom";
import { Modal } from "bootstrap";
import { toast } from "react-toastify";
import exportToExcel from "../../../utils/exportToExcel";
import { AbilityContext } from "../../../utils/AbilityContext";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import "./ItemMaster.css";

const ItemMaster = () => {
  const [errors, setErrors] = useState({});
  const itemModalRef = useRef(null);
  const itemEditModalRef = useRef(null);
  const [isShowItemDetails, setIsShowItemDetails] = useState(false);
  const [isEditItemDetails, setIsEditItemDetails] = useState(false);
  const [itemDetails, setItemDetails] = useState({});

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [filteredItems, setFilteredItems] = useState([]);

  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const { isAddItem, setIsAddItem } = useContext(AppContext);
  const [isReset, setIsReset] = useState(false);
  const [status, setStatus] = useState("active");
  const [isChecked, setIsChecked] = useState(true);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [types, setTypes] = useState([]);
  const [groups, setGroups] = useState([]);

  // Pagination states
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    uom: "",
    type: "",
    barcode: "",
    groupName: "",
    price: "",
    stQty: "",
    life: "",
    inventoryItem: "",
    iqc: false,
    status: "active",
  });

  // Confirm modal states
  const [message, setMesssage] = useState("");
  const [confirmState, setConfirmState] = useState(false);
  const [confirmType, setConfirmType] = useState("");
  const [itemIdState, setItemIdState] = useState("");
  const [isConfirmModal, setIsConfirmModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(null);

  // Confirm useEffect for confirm modal
  useEffect(() => {
    let modal = null;

    if (isConfirmModal) {
      const modalElement = document.getElementById("itemConfirmModal");

      if (modalElement) {
        // Clean up any existing modal artifacts
        cleanupModalArtifacts();

        // Create new modal
        modal = new Modal(modalElement, {
          backdrop: "static",
          keyboard: false,
        });

        // Add event listener for when modal is hidden
        modalElement.addEventListener("hidden.bs.modal", () => {
          cleanupModalArtifacts();
          setIsConfirmModal(false);
        });

        // Show the modal
        modal.show();

        // Store modal reference
        setConfirmModal(modal);
      }
    }

    // Cleanup function
    return () => {
      if (modal) {
        modal.dispose();
        cleanupModalArtifacts();
      }
    };
  }, [isConfirmModal]);

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

  const handleCloseConfirmModal = () => {
    if (confirmModal) {
      confirmModal.hide();
      cleanupModalArtifacts();
    }

    // Add a small delay before resetting states to allow animation to complete
    setTimeout(() => {
      setIsConfirmModal(false);
    }, 300);
  };

  const handleShowConfirm = (type) => {
    if (type === "single") {
      setMesssage("Are you sure you want to delete this item?");
      setIsConfirmModal(true);
    } else {
      if (selectedItems.length === 0) {
        toast.error("Please select at least one item to delete.");
        return;
      }
      setMesssage(
        `Are you sure you want to delete ${selectedItems.length} selected item(s)?`
      );
      setIsConfirmModal(true);
    }
  };

  const handleYesConfirm = () => {
    if (confirmType === "single") handleDeleteItem(itemIdState);
    else handleDeleteSelected();
  };

  // Fetch items data
  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/items/all");

      if (response.data.status && response.data.data) {
        const allItems = response.data.data;
        setItems(allItems);
        filterItems(allItems); // Apply filters to all items
      } else {
        setItems([]);
        setFilteredItems([]);
      }
    } catch (error) {
      console.error("Error fetching items:", error);
      setItems([]);
      setFilteredItems([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter items based on search and filter criteria
  const filterItems = (itemsToFilter = items) => {
    let result = [...itemsToFilter];

    // Apply search filter
    if (searchQuery.trim()) {
      const searchLower = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.name?.toLowerCase().includes(searchLower) ||
          item.code?.toLowerCase().includes(searchLower) ||
          item.barcode?.toLowerCase().includes(searchLower) ||
          item.groupName?.toLowerCase().includes(searchLower)
      );
    }

    // Apply group filter
    if (selectedGroup) {
      result = result.filter((item) => item.groupName === selectedGroup);
    }

    // Apply type filter
    if (selectedType) {
      result = result.filter((item) => item.type === selectedType);
    }

    // Apply status filter
    if (selectedStatus) {
      result = result.filter((item) => item.status === selectedStatus);
    }

    // Update filtered items and pagination
    setFilteredItems(result);
    setPagination((prev) => ({
      ...prev,
      totalItems: result.length,
      totalPages: Math.ceil(result.length / prev.itemsPerPage),
      currentPage: 1, // Reset to first page when filters change
    }));
  };

  // Effect for initial data fetch
  useEffect(() => {
    fetchItems();
    fetchTypes();
    fetchGroups();
  }, []);

  // Effect for filtering when search or filter criteria change
  useEffect(() => {
    filterItems();
  }, [searchQuery, selectedGroup, selectedType, selectedStatus]);

  // Get paginated items
  const getPaginatedItems = () => {
    const start = (pagination.currentPage - 1) * pagination.itemsPerPage;
    const end = start + pagination.itemsPerPage;
    return filteredItems.slice(start, end);
  };

  // Search and filter handlers
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleGroupFilter = (e) => {
    setSelectedGroup(e.target.value);
  };

  const handleTypeFilter = (e) => {
    setSelectedType(e.target.value);
  };

  const handleStatusFilter = (e) => {
    setSelectedStatus(e.target.value);
  };

  // Fetch types data
  useEffect(() => {
    fetchTypes();
  }, []);

  const fetchTypes = () => {
    api
      .get("/api/type/all")
      .then((response) => {
        console.log("Types fetched:", response.data);
        setTypes(response.data.data || []);
      })
      .catch((error) => {
        console.error("Error fetching types:", error);
      });
  };

  const fetchGroups = () => {
    api
      .get("/api/group/all")
      .then((response) => {
        console.log("Groups fetched:", response.data);
        setGroups(response.data.data || []);
      })
      .catch((error) => {
        console.error("Error fetching groups:", error);
      });
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

    // fetchItems will be called by the useEffect that depends on currentPage
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

  const handleItemCheckboxChange = (itemId) => {
    setSelectedItems((prevSelected) =>
      prevSelected.includes(itemId)
        ? prevSelected.filter((id) => id !== itemId)
        : [...prevSelected, itemId]
    );
  };

  const handleSelectAllChange = (e) => {
    const checked = e.target.checked;
    setSelectAll(checked);
    if (checked) {
      const allItemIds = items.map((item) => item.id);
      setSelectedItems(allItemIds);
    } else {
      setSelectedItems([]);
    }
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    const newErrors = validateForm(formData);
    setErrors(newErrors);
    console.log(errors);
    if (Object.keys(newErrors).length === 0) {
      const finalData = {
        name: formData.name,
        code: formData.code,
        uom: formData.uom,
        type: formData.type,
        barcode: formData.barcode,
        groupName: formData.groupName,
        price: formData.price,
        stQty: formData.stQty,
        life: formData.life,
        inventoryItem: formData.inventoryItem || false,
        iqc: formData.iqc,
        status: formData.status,
      };

      console.log("Submitting add item form: " + finalData);

      api
        .post("/api/items/add", finalData)
        .then((response) => {
          console.log("Item added response:", response.data);
          // Check for success status in the new API response structure
          if (response.data.status) {
            // Show success message
            toast.success("Item added successfully");
            // Reset form
            handleReset(e);
            // Close the form
            setIsAddItem(false);
            // Refresh the items list
            fetchItems();
          } else {
            // Show error message from API
            toast.error(response.data.message || "Error in adding item");
          }
        })
        .catch((error) => {
          toast.error("Error in adding the item");
          console.error("Error adding item:", error);
        });
    }
  };
  const validateForm = (data) => {
    const errors = {};

    if (!data.name?.trim()) {
      errors.name = "Item name is required";
    }

    if (!data.code) {
      errors.code = "Code is required";
    } else if (!/^\d+$/.test(data.code)) {
      errors.code = "Code must only be in digits";
    }
    //  else if (data.code.length() !== 6) {
    //   errors.code = "Code length should be 6 digits";
    // }
    if (!data.uom) {
      errors.uom = "UOM is required";
    }

    if (!data.groupName) {
      errors.groupName = "Group is required";
    }

    if (!data.price) {
      errors.price = "Price is required";
    } else if (!/^\d+$/.test(data.price)) {
      errors.price = "Price must be digits";
    }

    if (!data.stQty) {
      errors.stQty = "ST Qty is required";
    } else if (!/^\d+$/.test(data.stQty)) {
      errors.stQty = "ST QTY must be digits";
    }

    if (!data.life) {
      errors.life = "Life is required";
    } else if (!/^\d+$/.test(data.life)) {
      errors.life = "Life must be digits";
    }

    return errors;
  };
  const handleDeleteItem = (itemId) => {
    setDeleting(true);
    api
      .delete(`/api/items/delete/${itemId}`)
      .then((response) => {
        console.log("Item deleted successfully:", response.data);
        // Check for success status in the new API response structure
        if (response.data.status) {
          // Refresh the items list
          toast.success("Successfully deleted selected items");
          fetchItems();
        } else {
          // Handle API error response
          toast.error(response.data.message || "Error deleting item");
        }
        setDeleting(false);
        setIsConfirmModal(false);
      })
      .catch((error) => {
        console.error("Error deleting item:", error);
        setDeleting(false);
        // Handle error (show error message)
        toast.error("Error deleting item. Please try again.");
        setIsConfirmModal(false);
      });
  };

  const handleDeleteSelected = () => {
    setDeleting(true);

    // Create an array of promises for each delete operation
    const deletePromises = selectedItems.map((itemId) =>
      api.delete(`/api/items/delete/${itemId}`)
    );

    // Execute all delete operations
    Promise.all(deletePromises)
      .then((responses) => {
        console.log("Items deleted successfully:", responses);
        // Check if all deletions were successful
        const allSuccessful = responses.every(
          (response) => response.data.status
        );

        if (allSuccessful) {
          // Refresh the items list
          fetchItems();
          // Clear selection
          setSelectedItems([]);
          setSelectAll(false);
        } else {
          // Some deletions failed
          toast.error("Some items could not be deleted. Please try again.");
        }
        setDeleting(false);
        setIsConfirmModal(false);
      })
      .catch((error) => {
        console.error("Error deleting items:", error);
        setDeleting(false);
        // Handle error (show error message)
        toast.error("Error deleting items. Please try again.");
        setIsConfirmModal(false);
      });
  };

  const handleReset = (e) => {
    e.preventDefault();
    setFormData({
      groupName: "",
      name: "",
      code: "",
      uom: "",
      price: "",
      stQty: "",
      life: "",
      inventoryItem: "",
      iqc: false,
      status: "active",
    });
    setIsChecked(true);
    setStatus("active");
  };

  // Calculate the display range for the pagination info
  const getDisplayRange = () => {
    const start = (pagination.currentPage - 1) * pagination.itemsPerPage + 1;
    const end = Math.min(start + items.length - 1, pagination.totalItems);

    if (items.length === 0) {
      return "0";
    }

    return `${start}-${end}`;
  };

  const handleSetIsAddVendor = () => {
    setIsAddItem(true);
  };

  const handleViewDetails = (item, e) => {
    e.preventDefault();
    console.log(item);
    setItemDetails(item);
    setIsShowItemDetails(true);
  };

  const handleEditDetails = (item, e) => {
    e.preventDefault();
    console.log(item);
    setItemDetails(item);
    setIsEditItemDetails(true);
  };

  const handleEditItem = (e) => {
    e.preventDefault();

    // Validate the form data
    const newErrors = validateForm(itemDetails);
    setErrors(newErrors);

    const finalData = {
      name: itemDetails.name,
      code: itemDetails.code,
      uom: itemDetails.uom,
      groupName: itemDetails.groupName,
      status: itemDetails.status || "active",
      price: itemDetails.price || null,
      stQty: parseInt(itemDetails.stQty) || 0,
      life: parseInt(itemDetails.life) || 0,
      inventoryItem: itemDetails.inventoryItem || false,
      iqc: itemDetails.iqc,
    };

    console.log(finalData);

    api
      .put(`/api/items/update/${itemDetails.id}`, finalData)
      .then((response) => {
        console.log("Item updated response:", response.data);
        // Check for success status in the API response structure
        if (response.data.status) {
          // Show success message
          toast.success(response.data.message || "Item Updated Successfully");

          // Close the modal
          setIsEditItemDetails(false);
          // Reset item details
          setItemDetails({});
          // Refresh the items list
          fetchItems();
        } else {
          // Show error message from API
          toast.error(response.data.message || "Error updating item");
        }
      })
      .catch((error) => {
        console.error("Error updating item:", error);
        // Show generic error message
        toast.error("Error updating item. Please try again.");
      });
  };

  useEffect(() => {
    let bsModal = null;

    if (isShowItemDetails && itemModalRef.current) {
      bsModal = new Modal(itemModalRef.current, {
        backdrop: "static",
      });
      bsModal.show();

      // Cleanup function for view modal
      const handleHidden = () => {
        setIsShowItemDetails(false);
        setItemDetails({});
        // Remove the event listener
        itemModalRef.current?.removeEventListener(
          "hidden.bs.modal",
          handleHidden
        );
      };

      // Add event listener for modal hidden event
      itemModalRef.current.addEventListener("hidden.bs.modal", handleHidden);
    } else if (isEditItemDetails && itemEditModalRef.current) {
      bsModal = new Modal(itemEditModalRef.current, {
        backdrop: "static",
      });
      bsModal.show();

      // Cleanup function for edit modal
      const handleHidden = () => {
        setIsEditItemDetails(false);
        setItemDetails({});
        // Remove the event listener
        itemEditModalRef.current?.removeEventListener(
          "hidden.bs.modal",
          handleHidden
        );
      };

      // Add event listener for modal hidden event
      itemEditModalRef.current.addEventListener(
        "hidden.bs.modal",
        handleHidden
      );
    }

    // Cleanup function
    return () => {
      if (bsModal) {
        bsModal.dispose();
      }
    };
  }, [isShowItemDetails, isEditItemDetails]);

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedGroup("");
    setSelectedType("");
    setSelectedStatus("");
  };

  // RBAC
  const ability = useContext(AbilityContext);

  // Excel import
  const [excelData, setExcelData] = useState([]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (evt) => {
      const arrayBuffer = evt.target.result;
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const parsedData = XLSX.utils.sheet_to_json(worksheet);
      // console.log("parsedData: " + JSON.stringify(parsedData));
      setExcelData(parsedData);
    };

    reader.readAsArrayBuffer(file);
  };
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveToAPI = async () => {
    if (excelData.length === 0) {
      toast.error("Please select an excel file");
      return;
    }

    setIsLoading(true);

    const invalidRows = [];
    const validRows = [];

    for (let i = 0; i < excelData.length; i++) {
      const row = excelData[i];

      const payload = {
        name: row.name,
        code: row.code,
        uom: row.uom,
        groupName: row.groupName,
        status: row.status,
        price: row.price,
        stQty: row.stQty,
        life: row.life,
        inventoryItem: row.inventoryItem,
        iqc: row.iqc,
      };

      const isInvalid = Object.values(payload).some(
        (value) => value === null || value === undefined || value === ""
      );

      if (isInvalid) {
        invalidRows.push({ rowNumber: i + 2, rowData: payload }); // +2 for Excel row number
      } else {
        validRows.push(payload);
      }
    }
    let partialSuccess = false;
    try {
      for (const row of validRows) {
        await api.post("/api/items/add", row);
      }
      partialSuccess = true;
      if (invalidRows.length > 0) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Invalid Rows");

        // Add header row
        worksheet.addRow([
          "Row No.",
          "Name",
          "Code",
          "UOM",
          "Group Name",
          "Status",
          "Price",
          "Start Qty",
          "Life",
          "Inventory Item",
          "IQC",
        ]);

        // Add invalid data with red fill for nulls
        invalidRows.forEach(({ rowNumber, rowData }) => {
          const rowValues = [
            rowNumber,
            rowData.name,
            rowData.code,
            rowData.uom,
            rowData.groupName,
            rowData.status,
            rowData.price,
            rowData.stQty,
            rowData.life,
            rowData.inventoryItem,
            rowData.iqc,
          ];

          const excelRow = worksheet.addRow(rowValues);

          rowValues.forEach((cellVal, idx) => {
            if (cellVal === null || cellVal === undefined || cellVal === "") {
              const cell = excelRow.getCell(idx + 1); // Excel is 1-indexed
              cell.value = "NULL";
              cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFFF0000" }, // Red
              };
              cell.font = {
                color: { argb: "FFFFFFFF" }, // White text
                bold: true,
              };
            }
          });
        });

        // Auto width
        worksheet.columns.forEach((column) => {
          column.width = 15;
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        saveAs(blob, "ItemMaster_Invalid_Rows.xlsx");

        toast.warn(
          "Some rows were skipped due to missing data. Check the downloaded Excel."
        );
      } else {
        toast.success("Excel imported successfully");
      }

      fetchItems();
    } catch (error) {
      console.error("Error saving excel data:", error);

      if (!partialSuccess) {
        toast.error(error.response?.data?.message || "Error importing Excel");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {isLoading && (
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
            <h3 className="nav-header header-style">Item Master</h3>
            <p className="breadcrumb">
              <Link to="/dashboard">
                <i className="fas fa-home text-8"></i>
              </Link>{" "}
              <span className="ms-1 mt-1 text-small-gray">
                / Masters / Item Master
              </span>
            </p>
          </div>

          {/* Add Item Button */}

          {ability.can("edit", "Item Master") && (
            <button
              className="btn btn-primary add-btn"
              onClick={handleSetIsAddVendor}
            >
              <i className="fa-solid fa-plus pe-1"></i> Add New Item
            </button>
          )}
        </div>
      </nav>

      {/* Search and Filter Section */}
      <div className="search-filter-container mx-2">
        <div className="search-box">
          <i className="fas fa-search position-absolute z-0 input-icon"></i>
          <input
            type="text"
            className="form-control vendor-search-bar"
            placeholder="Search by item name, code..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        <div className="filter-options">
          <select
            className="filter-select"
            value={selectedGroup}
            onChange={handleGroupFilter}
          >
            <option value="">All Groups</option>
            {groups.map((group) => (
              <option key={group.id} value={group.name}>
                {group.name}
              </option>
            ))}
          </select>

          <select
            className="filter-select"
            value={selectedStatus}
            onChange={handleStatusFilter}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button className="filter-select" onClick={handleResetFilters}>
            <i className="fas fa-filter me-2"></i>
            Reset Filters
          </button>
        </div>
      </div>

      {/* Form Header Section */}
      {isAddItem && (
        <div className="table-form-container mx-2">
          <div className="form-header">
            <h2>
              <i className="fas fa-box"></i> Add New Item
            </h2>
            <button
              className="btn-close"
              onClick={() => setIsAddItem(false)}
            ></button>
          </div>
          {/* Form Fields */}
          <form
            autoComplete="off"
            className="padding-2"
            onSubmit={handleAddItem}
          >
            <div className="form-grid border-bottom pt-0">
              <div className="row form-style">
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="groupName" className="form-label mb-0 ms-2">
                    Group <span className="text-danger fs-6">*</span>
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-layer-group position-absolute z-0 input-icon"></i>
                    <select
                      className="form-control ps-5 ms-2 text-font"
                      id="groupName"
                      placeholder="Group"
                      value={formData.groupName}
                      onChange={(e) =>
                        setFormData({ ...formData, groupName: e.target.value })
                      }
                    >
                      <option value="" disabled hidden className="text-muted">
                        Select Group
                      </option>
                      {groups.map((group) => (
                        <option key={group.id} value={group.groupCode}>
                          {group.name} - {group.groupCode}
                        </option>
                      ))}
                    </select>
                    <i className="fa-solid fa-angle-down position-absolute down-arrow-icon"></i>
                  </div>
                  {errors.groupName && (
                    <span className="error-message">{errors.groupName}</span>
                  )}
                </div>
                <div className="col-4 d-flex flex-column form-group ps-2">
                  <label htmlFor="name" className="form-label mb-0">
                    Item Name <span className="text-danger fs-6">*</span>
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-box position-absolute z-0 input-icon"></i>
                    <input
                      type="text"
                      className="form-control ps-5 text-font"
                      id="name"
                      placeholder="Enter item name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                  {errors.name && (
                    <span className="error-message">{errors.name}</span>
                  )}
                </div>
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="code" className="form-label mb-0">
                    Item Code <span className="text-danger fs-6">*</span>
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-qrcode position-absolute z-0 input-icon"></i>
                    <input
                      type="text"
                      className="form-control ps-5 text-font"
                      id="code"
                      placeholder="Enter item code"
                      inputMode="numeric"
                      maxLength="8"
                      value={formData.code}
                      onChange={(e) => {
                        const digitsOnly = e.target.value.replace(/\D/g, "");
                        if (digitsOnly.length <= 8) {
                          setFormData({
                            ...formData,
                            code: digitsOnly,
                          });
                        }
                      }}
                    />
                  </div>
                  {errors.code && (
                    <span className="error-message">{errors.code}</span>
                  )}
                </div>
              </div>
              <div className="row form-style">
                {/* <div className="col-4 d-flex flex-column form-group ps-2">
                  <label htmlFor="type" className="form-label mb-0">
                    Type
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-tags position-absolute z-0 input-icon"></i>
                    <select
                      className="form-control ps-5 text-font"
                      id="type"
                      placeholder="Type"
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value })
                      }
                    >
                      <option value="" disabled hidden className="text-muted">
                        Select Type Name
                      </option>
                      {types.map((type) => (
                        <option key={type.id} value={type.name}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                    <i className="fa-solid fa-angle-down position-absolute down-arrow-icon"></i>
                  </div>
                  {errors.type && (
                    <span className="error-message">{errors.type}</span>
                  )}
                </div> */}
                {/* <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="barcode" className="form-label mb-0">
                    Barcode
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-qrcode position-absolute z-0 input-icon"></i>
                    <input
                      type="text"
                      className="form-control ps-5 text-font"
                      id="barcode"
                      placeholder="Enter barcode"
                      value={formData.barcode}
                      onChange={(e) =>
                        setFormData({ ...formData, barcode: e.target.value })
                      }
                    />
                  </div>
                  {errors.barcode && (
                    <span className="error-message">{errors.barcode}</span>
                  )}
                </div> */}
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="uom" className="form-label mb-0 ms-2">
                    UOM <span className="text-danger fs-6">*</span>
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-ruler position-absolute z-0 input-icon"></i>
                    <select
                      className="form-control ps-5 ms-2 text-font"
                      id="uom"
                      placeholder="UOM"
                      value={formData.uom}
                      onChange={(e) =>
                        setFormData({ ...formData, uom: e.target.value })
                      }
                    >
                      <option value="" disabled hidden className="text-muted">
                        Select UOM
                      </option>
                      <option value="pcs">Pcs</option>
                      <option value="Kg">Kg</option>
                    </select>
                    <i className="fa-solid fa-angle-down position-absolute down-arrow-icon"></i>
                  </div>
                  {errors.uom && (
                    <span className="error-message">{errors.uom}</span>
                  )}
                </div>
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="price" className="form-label mb-0">
                    Price
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-rupee-sign position-absolute z-0 input-icon"></i>
                    <input
                      type="number"
                      className="form-control ps-5 text-font"
                      id="price"
                      placeholder="Enter price"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                    />
                  </div>
                  {errors.price && (
                    <span className="error-message">{errors.price}</span>
                  )}
                </div>
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="stQty" className="form-label mb-0">
                    Standard Quantity{" "}
                    <span className="text-danger fs-6">*</span>
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-cubes position-absolute z-0 input-icon"></i>
                    <input
                      type="number"
                      className="form-control ps-5 text-font"
                      id="stQty"
                      placeholder="Enter standard quantity"
                      value={formData.stQty}
                      onChange={(e) =>
                        setFormData({ ...formData, stQty: e.target.value })
                      }
                    />
                  </div>
                  {errors.stQty && (
                    <span className="error-message">{errors.stQty}</span>
                  )}
                </div>
              </div>
              <div className="row form-style">
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="life" className="form-label ms-2">
                    Life (In Days) <span className="text-danger fs-6">*</span>
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-clock position-absolute z-0 input-icon"></i>
                    <input
                      type="number"
                      className="form-control ps-5 text-font ms-2"
                      id="life"
                      placeholder="Enter life (in days)"
                      value={formData.life}
                      onChange={(e) =>
                        setFormData({ ...formData, life: e.target.value })
                      }
                    />
                  </div>
                  {errors.life && (
                    <span className="error-message">{errors.life}</span>
                  )}
                </div>
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="status" className="form-label">
                    Status
                  </label>
                  <div className="position-relative w-100">
                    <div className="form-check form-switch position-absolute z-0 input-icon mt-1 padding-left-2">
                      <input
                        className="form-check-input text-font switch-style"
                        type="checkbox"
                        role="switch"
                        id="switchCheckChecked"
                        checked={isChecked}
                        onChange={(e) => {
                          const newStatus = e.target.checked
                            ? "active"
                            : "inactive";
                          setIsChecked(e.target.checked);
                          setStatus(newStatus);
                          setFormData({
                            ...formData,
                            status: newStatus,
                          });
                        }}
                      />

                      <label
                        className="form-check-label"
                        htmlFor="switchCheckChecked"
                      ></label>
                    </div>
                    <select
                      className="form-control text-font switch-padding"
                      id="status"
                      value={status}
                      onChange={(e) => {
                        const newStatus = e.target.value;
                        setStatus(newStatus);
                        setIsChecked(newStatus === "active");

                        setFormData((prev) => ({
                          ...prev,
                          status: newStatus,
                        }));
                      }}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                    <i className="fa-solid fa-angle-down position-absolute down-arrow-icon"></i>
                  </div>
                </div>
                <div className="col-4 d-flex flex-column form-group">
                  <label className="form-label" htmlFor="inventoryItem">
                    Inventory Item
                  </label>
                  <div className="position-relative w-100">
                    {formData.inventoryItem === "true" && (
                      <i className="fas fa-square-check position-absolute z-0 input-icon ms-2"></i>
                    )}
                    {formData.inventoryItem === "false" && (
                      <i className="fas fa-square-xmark position-absolute z-0 input-icon ms-2"></i>
                    )}
                    {formData.inventoryItem === "" && (
                      <i className="fas fa-square position-absolute z-0 input-icon ms-2"></i>
                    )}
                    <select
                      className={`form-select ps-5 text-font ${
                        formData.inventoryItem ? "" : "text-secondary"
                      }`}
                      id="yesNoSelect"
                      value={formData.inventoryItem}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          inventoryItem: e.target.value,
                        })
                      }
                    >
                      <option value="">Select an option</option>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </div>
                </div>
              </div>
              {formData.inventoryItem === "true" && (
                <div className="row form-style">
                  <div className="col-4 d-flex flex-column form-group">
                    <div className="d-flex align-items-center gap-2">
                      <label className="form-label ms-2 mt-2" htmlFor="iqc">
                        IQC Required
                      </label>
                      <input
                        className="form-check-input ms-2"
                        type="checkbox"
                        id="iqc"
                        checked={formData.iqc}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            iqc: e.target.checked,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="form-actions">
              <button
                className="btn btn-primary border border-0 add-btn me-3 float-end"
                type="submit"
              >
                <i className="fa-solid fa-floppy-disk me-1"></i> Save Changes
              </button>
              <button
                className="btn btn-secondary border border-0 text-8 px-3 fw-medium py-2 bg-secondary me-3 float-end"
                type="button"
                onClick={handleReset}
              >
                <i className="fa-solid fa-arrows-rotate me-1"></i> Reset
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table Section */}
      <div className="margin-2 mx-2">
        <div className="table-container">
          <div className="table-header d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div className="selected-count">
              <input
                type="checkbox"
                id="select-all"
                checked={selectAll}
                onChange={handleSelectAllChange}
              />
              <label htmlFor="select-all">
                {selectedItems.length} Selected
              </label>
            </div>
            <div className="bulk-actions">
              <div className="d-flex align-items-center gap-2">
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  className="form-control form-control-sm w-auto text-8"
                  onChange={handleFileUpload}
                />

                <button
                  className="btn btn-outline-secondary text-8"
                  onClick={handleSaveToAPI}
                >
                  <i className="fas fa-file-import me-1"></i> Import Excel
                </button>
              </div>
              <button
                className="btn btn-outline-success text-8"
                onClick={() => {
                  console.log(selectedItems);
                  const rowData = getPaginatedItems().filter((row) =>
                    selectedItems.includes(row.id)
                  );
                  console.log(rowData);
                  exportToExcel(rowData, "ItemMaster");
                }}
              >
                <i className="fas fa-file-export me-1"></i>
                Export Selected
              </button>
              <button
                className="btn-action btn-danger"
                onClick={() => {
                  setConfirmType("multi");
                  handleShowConfirm("multi");
                }}
                disabled={selectedItems.length === 0 || deleting}
              >
                {deleting ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Deleting...
                  </>
                ) : (
                  <>
                    <i className="fas fa-trash"></i>
                    Delete Selected
                  </>
                )}
              </button>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th className="checkbox-cell">
                  <input type="checkbox" id="select-all-header" disabled />
                </th>
                <th>Name</th>
                <th>Code</th>
                <th>UOM</th>
                <th>ST Qty</th>
                <th>Life</th>
                <th>Group</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="text-break">
              {loading ? (
                <tr>
                  <td colSpan="12" className="text-center">
                    <div className="my-3">
                      <i className="fas fa-spinner fa-spin me-2"></i> Loading
                      items...
                    </div>
                  </td>
                </tr>
              ) : getPaginatedItems().length === 0 ? (
                <tr className="no-data-row">
                  <td colSpan="9" className="no-data-cell">
                    <div className="no-data-content">
                      <i className="fas fa-box-open no-data-icon"></i>
                      <p className="no-data-text">No items found</p>
                      <p className="no-data-subtext">
                        {items.length === 0
                          ? 'Click the "Add New" button to create your first item'
                          : "No items match your search criteria"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                getPaginatedItems().map((item) => (
                  <tr key={item.id}>
                    <td className="checkbox-cell ps-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => handleItemCheckboxChange(item.id)}
                      />
                    </td>
                    <td className="ps-4">
                      <div>
                        <span>{item.name}</span>
                      </div>
                    </td>
                    <td className="ps-4">
                      <div>
                        <span>{item.code}</span>
                      </div>
                    </td>
                    <td className="ps-4">
                      <div>
                        <span>{item.uom}</span>
                      </div>
                    </td>
                    <td className="ps-4">{item.stQty}</td>
                    <td className="ps-4">
                      <div>
                        <span>{item.life}</span>
                      </div>
                    </td>
                    <td className="ps-4">{item.groupName}</td>
                    <td className="ps-4">
                      <span
                        className={`badge status ${item.status?.toLowerCase()}`}
                      >
                        {item.status || "-"}
                      </span>
                    </td>
                    <td className="actions ps-3">
                      <button
                        className="btn-icon btn-primary"
                        title="View Details"
                        onClick={(e) => handleViewDetails(item, e)}
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      {ability.can("edit", "Item Master") && (
                        <button
                          className="btn-icon btn-success"
                          title="Edit"
                          onClick={(e) => handleEditDetails(item, e)}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                      )}
                      {ability.can("edit", "Item Master") && (
                        <button
                          className="btn-icon btn-danger"
                          title="Delete"
                          onClick={() => {
                            setItemIdState(item.id);
                            setConfirmType("single");
                            handleShowConfirm("single");
                          }}
                          disabled={deleting}
                        >
                          {deleting ? (
                            <i className="fas fa-spinner fa-spin"></i>
                          ) : (
                            <i className="fas fa-trash"></i>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="pagination-container">
            <div className="pagination-info">
              Showing {getDisplayRange()} of {filteredItems.length} entries
            </div>
            <div className="pagination">
              <button
                className="btn-page"
                disabled={pagination.currentPage === 1 || loading}
                onClick={() => handlePageChange(pagination.currentPage - 1)}
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
                    disabled={loading}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                className="btn-page"
                disabled={
                  pagination.currentPage === pagination.totalPages || loading
                }
                onClick={() => handlePageChange(pagination.currentPage + 1)}
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
            <div className="items-per-page">
              <select
                value={pagination.itemsPerPage}
                onChange={handleItemsPerPageChange}
                disabled={loading}
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

      {/* Confirmation dialog modal */}
      {isConfirmModal && (
        <div className="modal fade" id="itemConfirmModal" tabIndex="-1">
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
              <div className="modal-body">{message}</div>
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
      {/* View Item Details Modal */}
      {isShowItemDetails && (
        <div
          className="modal fade"
          ref={itemModalRef}
          id="itemDetailModal"
          tabIndex="-1"
        >
          <div className="modal-dialog">
            <ItemMasterModal
              item={itemDetails}
              onClose={() => {
                document.activeElement?.blur();
                setIsShowItemDetails(false);
              }}
            />
          </div>
        </div>
      )}

      {/* Edit Item Details Modal */}
      {isEditItemDetails && (
        <div
          className="modal fade"
          ref={itemEditModalRef}
          id="itemEditModal"
          tabIndex="-1"
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-pencil me-2 font-1"></i>Edit Item
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              {/* Modal Body */}
              <div className="modal-body">
                <form
                  autoComplete="off"
                  className="padding-2"
                  onSubmit={handleAddItem}
                >
                  <div className="form-grid pt-0">
                    <div className="row form-style">
                      <div className="col-4 d-flex flex-column form-group">
                        <label
                          htmlFor="groupName"
                          className="form-label mb-0 ms-2"
                        >
                          Group <span className="text-danger fs-6">*</span>
                        </label>
                        <div className="position-relative w-100">
                          <i className="fas fa-layer-group position-absolute z-0 input-icon"></i>
                          <select
                            className="form-control ps-5 ms-2 text-font"
                            id="groupName"
                            placeholder="Group"
                            value={itemDetails.groupName}
                            onChange={(e) =>
                              setItemDetails({
                                ...itemDetails,
                                groupName: e.target.value,
                              })
                            }
                          >
                            <option
                              value=""
                              disabled
                              hidden
                              className="text-muted"
                            >
                              Select Group
                            </option>
                            {groups.map((group) => (
                              <option key={group.id} value={group.groupCode}>
                                {group.name} - {group.groupCode}
                              </option>
                            ))}
                          </select>
                          <i className="fa-solid fa-angle-down position-absolute down-arrow-icon"></i>
                        </div>
                      </div>

                      <div className="col-4 d-flex flex-column form-group ps-2">
                        <label htmlFor="name" className="form-label mb-0">
                          Item Name <span className="text-danger fs-6">*</span>
                        </label>
                        <div className="position-relative w-100">
                          <i className="fas fa-box position-absolute z-0 input-icon"></i>
                          <input
                            type="text"
                            className="form-control ps-5 text-font"
                            id="name"
                            placeholder="Enter item name"
                            value={itemDetails.name}
                            onChange={(e) =>
                              setItemDetails({
                                ...itemDetails,
                                name: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className="col-4 d-flex flex-column form-group">
                        <label htmlFor="code" className="form-label mb-0">
                          Item Code <span className="text-danger fs-6">*</span>
                        </label>
                        <div className="position-relative w-100">
                          <i className="fas fa-qrcode position-absolute z-0 input-icon"></i>
                          <input
                            type="text"
                            className="form-control ps-5 text-font"
                            id="code"
                            placeholder="Enter item code"
                            value={itemDetails.code}
                            onChange={(e) =>
                              setItemDetails({
                                ...itemDetails,
                                code: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>
                    <div className="row form-style">
                      <div className="col-4 d-flex flex-column form-group">
                        <label htmlFor="uom" className="form-label mb-0 ms-2">
                          UOM <span className="text-danger fs-6">*</span>
                        </label>
                        <div className="position-relative w-100">
                          <i className="fas fa-ruler position-absolute z-0 input-icon"></i>
                          <select
                            className="form-control ps-5 ms-2 text-font"
                            id="uom"
                            placeholder="UOM"
                            value={itemDetails.uom}
                            onChange={(e) =>
                              setItemDetails({
                                ...itemDetails,
                                uom: e.target.value,
                              })
                            }
                          >
                            <option
                              value=""
                              disabled
                              hidden
                              className="text-muted"
                            >
                              Select UOM
                            </option>
                            <option value="pcs">Pcs</option>
                            <option value="Kg">Kg</option>
                          </select>
                          <i className="fa-solid fa-angle-down position-absolute down-arrow-icon"></i>
                        </div>
                      </div>
                      <div className="col-4 d-flex flex-column form-group">
                        <label htmlFor="price" className="form-label mb-0">
                          Price
                        </label>
                        <div className="position-relative w-100">
                          <i className="fas fa-rupee-sign position-absolute z-0 input-icon"></i>
                          <input
                            type="text"
                            className="form-control ps-5 text-font"
                            id="price"
                            placeholder="Enter price"
                            value={itemDetails.price}
                            onChange={(e) =>
                              setItemDetails({
                                ...itemDetails,
                                price: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className="col-4 d-flex flex-column form-group">
                        <label htmlFor="stQty" className="form-label mb-0">
                          ST QTY <span className="text-danger fs-6">*</span>
                        </label>
                        <div className="position-relative w-100">
                          <i className="fas fa-cubes position-absolute z-0 input-icon"></i>
                          <input
                            type="text"
                            className="form-control ps-5 text-font"
                            id="stQty"
                            placeholder="Enter ST QTY"
                            value={itemDetails.stQty}
                            onChange={(e) =>
                              setItemDetails({
                                ...itemDetails,
                                stQty: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>
                    <div className="row form-style">
                      <div className="col-4 d-flex flex-column form-group">
                        <label htmlFor="life" className="form-label mb-0  ms-2">
                          Life (In Days){" "}
                          <span className="text-danger fs-6">*</span>
                        </label>
                        <div className="position-relative w-100">
                          <i className="fas fa-clock position-absolute z-0 input-icon"></i>
                          <input
                            type="text"
                            className="form-control ps-5 text-font ms-2"
                            id="life"
                            placeholder="Enter life (in days)"
                            value={itemDetails.life}
                            onChange={(e) =>
                              setItemDetails({
                                ...itemDetails,
                                life: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className="col-4 d-flex flex-column form-group">
                        <label htmlFor="status" className="form-label">
                          Status
                        </label>
                        <div className="position-relative w-100">
                          <div className="form-check form-switch position-absolute z-0 input-icon mt-1 padding-left-2">
                            <input
                              className="form-check-input text-font switch-style"
                              type="checkbox"
                              role="switch"
                              id="switchCheckChecked"
                              checked={
                                itemDetails.status == "active" ? true : false
                              }
                              onChange={(e) => {
                                const newStatus = e.target.checked
                                  ? "active"
                                  : "inactive";
                                setIsChecked(e.target.checked);
                                setStatus(newStatus);
                                setItemDetails({
                                  ...itemDetails,
                                  status: newStatus,
                                });
                              }}
                            />

                            <label
                              className="form-check-label"
                              htmlFor="switchCheckChecked"
                            ></label>
                          </div>
                          <select
                            className="form-control text-font switch-padding"
                            id="status"
                            value={status}
                            onChange={(e) => {
                              const newStatus = e.target.value;
                              setStatus(newStatus);
                              setIsChecked(newStatus === "active");

                              setItemDetails((prev) => ({
                                ...prev,
                                status: newStatus,
                              }));
                            }}
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </select>
                          <i className="fa-solid fa-angle-down position-absolute down-arrow-icon"></i>
                        </div>
                      </div>
                      <div className="col-4 d-flex flex-column form-group">
                        <label className="form-label" htmlFor="inventoryItem">
                          Inventory Item
                        </label>
                        <div className="position-relative w-100">
                          {String(itemDetails.inventoryItem) === "true" && (
                            <i className="fas fa-square-check position-absolute z-0 input-icon ms-2"></i>
                          )}
                          {String(itemDetails.inventoryItem) === "false" && (
                            <i className="fas fa-square-xmark position-absolute z-0 input-icon ms-2"></i>
                          )}
                          {itemDetails.inventoryItem === "" && (
                            <i className="fas fa-square position-absolute z-0 input-icon ms-2"></i>
                          )}
                          <select
                            className={`form-select ps-5 text-font ${
                              itemDetails.inventoryItem ? "" : "text-secondary"
                            }`}
                            id="yesNoSelect"
                            value={itemDetails.inventoryItem}
                            onChange={(e) =>
                              setItemDetails({
                                ...itemDetails,
                                inventoryItem: e.target.value,
                              })
                            }
                          >
                            <option value="">Select an option</option>
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    {(itemDetails.inventoryItem === true ||
                      itemDetails.inventoryItem === "true") && (
                      <div className="row form-style">
                        <div className="col-4 d-flex flex-column form-group">
                          <div className="d-flex align-items-center gap-2">
                            <label
                              className="form-label ms-2 mt-2"
                              htmlFor="iqc"
                            >
                              IQC Required
                            </label>
                            <input
                              className="form-check-input ms-2"
                              type="checkbox"
                              id="iqc"
                              checked={itemDetails.iqc}
                              onChange={(e) =>
                                setItemDetails({
                                  ...itemDetails,
                                  iqc: e.target.checked,
                                })
                              }
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-primary add-btn"
                  data-bs-dismiss="modal"
                  onClick={(e) => {
                    document.activeElement?.blur();
                    handleEditItem(e);
                  }}
                >
                  <i className="fa-solid fa-floppy-disk me-1"></i> Save Changes
                </button>
                <button
                  className="btn btn-secondary add-btn"
                  data-bs-dismiss="modal"
                  onClick={() => {
                    document.activeElement?.blur();
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

export default ItemMaster;
