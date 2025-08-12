import React, { useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "../../../context/AppContext";
import { Link } from "react-router-dom";
import { Modal } from "bootstrap";
import api from "../../../services/api";
import { toast } from "react-toastify";
import exportToExcel from "../../../utils/exportToExcel";
import { AbilityContext } from "../../../utils/AbilityContext";
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const VendorItemsMaster = () => {
  const [vendorItems, setVendorItems] = useState([]);
  const [errors, setErrors] = useState({});
  const { isAddVendorItem, setIsAddVendorItem } = useContext(AppContext);
  const [selectAll, setSelectAll] = useState(false);
  const vendorItemModalRef = useRef(null);
  const vendorItemEditModalRef = useRef(null);
  const [selectedVendorItems, setSelectedVendorItems] = useState([]);
  const [isShowVendorItemDetails, setIsShowVendorItemDetails] = useState(false);
  const [isEditVendorItemDetails, setIsEditVendorItemDetails] = useState(false);
  const [isChecked, setIsChecked] = useState(true);
  const [status, setStatus] = useState("active");
  const [vendors, setVendors] = useState([]);
  const [items, setItems] = useState([]);
  const [vendorItemDetails, setVendorItemDetails] = useState({
    id: "",
    vendor: "",
    item: "",
    leadTime: "",
    minOrderQty: "",
    price: "",
    status: "",
  });
  const [formData, setFormData] = useState({
    vendor: "",
    item: "",
    leadTime: "",
    minOrderQty: "",
    price: "",
    status: "active",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredVendorItems, setFilteredVendorItems] = useState([]);
  const [selectedVendorFilter, setSelectedVendorFilter] = useState("");
  const [selectedItemFilter, setSelectedItemFilter] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("");

  // Confirm modal states
  const [message, setMesssage] = useState("");
  const [confirmState, setConfirmState] = useState(false);
  const [confirmType, setConfirmType] = useState("");
  const [vendorItemIdState, setVendorItemIdState] = useState("");
  const [isConfirmModal, setIsConfirmModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(null);

  // Confirm useEffect for confirm modal
  useEffect(() => {
    let modal = null;

    if (isConfirmModal) {
      const modalElement = document.getElementById("vendorItemsConfirmModal");

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
      setMesssage(
        "Are you sure you want to delete this vendor-item assignment?"
      );
      setIsConfirmModal(true);
    } else {
      if (selectedVendorItems.length === 0) {
        toast.error(
          "Please select at least one vendor-item assignment to delete."
        );
        return;
      }
      setMesssage(
        `Are you sure you want to delete ${selectedVendorItems.length} vendor-item assignment(s)?`
      );
      setIsConfirmModal(true);
    }
  };

  const handleYesConfirm = () => {
    if (confirmType === "single") handleDeleteVendorItem(vendorItemIdState);
    else handleDeleteSelectedVendorItems();
  };

  // Initialize modals
  useEffect(() => {
    let viewModal = null;
    let editModal = null;

    // Only initialize modals if the refs are available and modals are meant to be shown
    if (isShowVendorItemDetails && vendorItemModalRef.current) {
      viewModal = new Modal(vendorItemModalRef.current);
      viewModal.show();
    }

    if (isEditVendorItemDetails && vendorItemEditModalRef.current) {
      editModal = new Modal(vendorItemEditModalRef.current);
      editModal.show();
    }

    // Cleanup function
    return () => {
      if (viewModal) {
        viewModal.hide();
        viewModal.dispose();
      }
      if (editModal) {
        editModal.hide();
        editModal.dispose();
      }
    };
  }, [isShowVendorItemDetails, isEditVendorItemDetails]);

  // Add modal hide event listeners
  useEffect(() => {
    const handleViewModalHide = () => {
      setIsShowVendorItemDetails(false);
    };

    const handleEditModalHide = () => {
      cleanupModalState();
    };

    const viewModalElement = vendorItemModalRef.current;
    const editModalElement = vendorItemEditModalRef.current;

    if (viewModalElement) {
      viewModalElement.addEventListener("hidden.bs.modal", handleViewModalHide);
    }
    if (editModalElement) {
      editModalElement.addEventListener("hidden.bs.modal", handleEditModalHide);
    }

    return () => {
      if (viewModalElement) {
        viewModalElement.removeEventListener(
          "hidden.bs.modal",
          handleViewModalHide
        );
      }
      if (editModalElement) {
        editModalElement.removeEventListener(
          "hidden.bs.modal",
          handleEditModalHide
        );
      }
    };
  }, []);

  // Fetch vendors, items, and vendor items when component mounts
  useEffect(() => {
    fetchVendors();
    fetchItems();
    fetchVendorItems();
  }, []);

  // Function to fetch vendor items from API
  const fetchVendorItems = () => {
    api
      .get("/api/vendor-item/all")
      .then((response) => {
        if (response.data && response.data.status) {
          setVendorItems(response.data.data || []);
        } else {
          console.error(
            "Error fetching vendor items:",
            response.data?.message || "Unknown error"
          );
          toast.error("Error in fetching vendor items");
        }
      })
      .catch((error) => {
        toast.error("Error fetching vendor items");
        console.error("Error fetching vendor items:", error);
      });
  };

  // Function to fetch vendors from API
  const fetchVendors = () => {
    api
      .get("/api/vendor-customer/vendors")
      .then((response) => {
        if (response.data && response.data.status) {
          const vendorData = response.data.data || [];
          // Verify vendor data has required fields
          const validVendors = vendorData.filter((v) => v.code && v.name);
          if (validVendors.length !== vendorData.length) {
            console.warn(
              "Some vendors are missing required fields:",
              vendorData.filter((v) => !v.code || !v.name)
            );
            toast.warning(
              "Some vendors are missing required fields:",
              vendorData.filter((v) => !v.code || !v.name)
            );
          }
          setVendors(validVendors);
        } else {
          console.error(
            "Error fetching vendors:",
            response.data?.message || "Unknown error"
          );
          toast.error(
            "Error fetching vendors:",
            response.data?.message || "Unknown error"
          );
        }
      })
      .catch((error) => {
        toast.error("Error fetching vendors:", error);
        console.error("Error fetching vendors:", error);
      });
  };

  // Function to fetch items from API
  const fetchItems = () => {
    api
      .get("/api/items/all")
      .then((response) => {
        if (response.data && response.data.status) {
          setItems(response.data.data || []);
        } else {
          console.error(
            "Error fetching items:",
            response.data?.message || "Unknown error"
          );
          toast.error(
            "Error fetching items:",
            response.data?.message ||
              "Unknown error. Please contact the support team."
          );
        }
      })
      .catch((error) => {
        toast.error("Error in fetching items");
        console.error("Error fetching items:", error);
      });
  };

  const handleVendorItemCheckboxChange = (assignmentId) => {
    setSelectedVendorItems((prevSelected) =>
      prevSelected.includes(assignmentId)
        ? prevSelected.filter((id) => id !== assignmentId)
        : [...prevSelected, assignmentId]
    );
  };

  const handleViewDetails = (assignment, e) => {
    e.preventDefault();
    setVendorItemDetails({
      id: assignment.id,
      vendor: assignment.vendorName,
      item: assignment.itemName,
      leadTime: assignment.days,
      minOrderQty: assignment.quantity,
      price: assignment.price,
      status: assignment.status,
    });
    setIsShowVendorItemDetails(true);
  };

  const handleEditDetails = (assignment, e) => {
    e.preventDefault();
    console.log("Opening edit modal for assignment:", assignment);

    // Find the matching vendor and item
    const selectedVendor = vendors.find(
      (v) => v.name.trim() === assignment.vendorName.trim()
    );
    const selectedItem = items.find(
      (i) => i.name.trim() === assignment.itemName.trim()
    );

    if (!selectedVendor || !selectedItem) {
      toast.error("Could not find matching vendor or item");
      console.error("Could not find matching vendor or item");
      return;
    }

    // Normalize the status value
    const normalizedStatus =
      assignment.status.toLowerCase() === "active" ? "Active" : "Inactive";

    const details = {
      id: assignment.id,
      vendor: selectedVendor.name,
      item: selectedItem.name,
      leadTime: assignment.days,
      minOrderQty: assignment.quantity,
      price: assignment.price,
      status: normalizedStatus,
    };

    console.log("Setting vendor item details:", details);
    setVendorItemDetails(details);
    setIsChecked(normalizedStatus === "Active");
    setStatus(normalizedStatus);
    setIsEditVendorItemDetails(true);
  };

  const handleAddVendorItem = (e) => {
    e.preventDefault();
    const newErrors = validateForm(formData);
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // Find selected vendor and item objects to get their codes
      const selectedVendor = vendors.find(
        (v) => v.id.toString() === formData.vendor.toString()
      );
      const selectedItem = items.find(
        (i) => i.id.toString() === formData.item.toString()
      );

      if (!selectedVendor || !selectedItem) {
        toast.error("Please select both vendor and item");
        return;
      }

      const finalData = {
        vendorCode: selectedVendor.code,
        vendorName: selectedVendor.name,
        itemCode: selectedItem.code,
        itemName: selectedItem.name,
        days: formData.leadTime || 0,
        quantity: formData.minOrderQty || 0,
        price: formData.price || 0,
        status: formData.status === "active" ? "Active" : "Inactive",
      };

      console.log("Submitting vendor-item assignment:", finalData);

      api
        .post("/api/vendor-item/save", finalData)
        .then((response) => {
          console.log("Response:", response.data);
          if (response.data && response.data.status) {
            toast.success(
              response.data.message ||
                "Vendor-Item assignment added successfully!"
            );
            // Reset form
            handleReset(e);
            // Close the form
            setIsAddVendorItem(false);
            // Refresh the vendor-items list
            fetchVendorItems();
          } else {
            toast.error(
              response.data?.message || "Error adding vendor-item assignment"
            );
          }
        })
        .catch((error) => {
          console.error("Error adding vendor-item assignment:", error);
          toast.error("Error adding vendor-item assignment. Please try again.");
        });
    } else {
      toast.error("Form submission failed due to validation errors.");
      console.log("Form submission failed due to validation errors.");
    }
  };

  const validateForm = (data) => {
    const errors = {};

    if (!data.vendor.trim()) {
      errors.vendor = "Vendor is required";
    }

    if (!data.item.trim()) {
      errors.item = "Item is required";
    }

    if (!data.minOrderQty) {
      errors.minOrderQty = "Std Qty is required";
    } else if (!/^\d+$/.test(data.minOrderQty)) {
      errors.minOrderQty = "Std Qty must only be in digits";
    }

    if (!data.price) {
      errors.price = "Price is required";
    } else if (!/^\d+$/.test(data.price)) {
      errors.price = "Price must only be in digits";
    }

    return errors;
  };

  const handleSetIsAddVendorItem = () => {
    setIsAddVendorItem(true);
  };

  const handleEditVendorItem = (e) => {
    e.preventDefault();
    const newErrors = validateForm(vendorItemDetails);
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const selectedVendor = vendors.find(
        (v) => v.name.trim() === vendorItemDetails.vendor.trim()
      );
      const selectedItem = items.find(
        (i) => i.name.trim() === vendorItemDetails.item.trim()
      );

      if (!selectedVendor || !selectedItem) {
        toast.error("Please select both vendor and item");
        return;
      }

      const finalData = {
        id: parseInt(vendorItemDetails.id),
        vendorCode: selectedVendor.code,
        vendorName: selectedVendor.name,
        itemCode: selectedItem.code,
        itemName: selectedItem.name,
        days: parseInt(vendorItemDetails.leadTime) || 0,
        quantity: parseInt(vendorItemDetails.minOrderQty) || 0,
        price: parseFloat(vendorItemDetails.price) || 0,
        status: vendorItemDetails.status.toLowerCase(),
      };

      console.log("Updating vendor item with data:", finalData);

      api
        .put("/api/vendor-item/update/" + vendorItemDetails.id, finalData)
        .then((response) => {
          if (response.data && response.data.status) {
            // Close the modal using Bootstrap's Modal instance
            const modalElement = vendorItemEditModalRef.current;
            const modalInstance = Modal.getInstance(modalElement);
            if (modalInstance) {
              modalInstance.hide();
            }

            // Reset states
            setIsEditVendorItemDetails(false);
            setVendorItemDetails({
              id: "",
              vendor: "",
              item: "",
              leadTime: "",
              minOrderQty: "",
              price: "",
              status: "active",
            });
            setSelectedVendorItems([]); // Clear any selections
            setSelectAll(false); // Reset select all checkbox

            // Refresh the list
            fetchVendorItems();
            toast.success(
              response.data.message ||
                "Vendor-Item assignment updated successfully!"
            );
          } else {
            toast.error(
              response.data?.message || "Error updating vendor-item assignment"
            );
          }
        })
        .catch((error) => {
          console.error("Error updating vendor-item assignment:", error);
          console.error("Error details:", {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            finalData: finalData,
          });
          toast.error(
            `Error updating vendor-item assignment: ${
              error.response?.data?.message || error.message
            }`
          );
        });
    }
  };

  // Add cleanup function for modal state
  const cleanupModalState = () => {
    setVendorItemDetails({
      id: "",
      vendor: "",
      item: "",
      leadTime: "",
      minOrderQty: "",
      price: "",
      status: "active",
    });
    setErrors({});
    setIsEditVendorItemDetails(false);
  };

  const handleSelectAllChange = (e) => {
    const checked = e.target.checked;
    setSelectAll(checked);
    if (checked) {
      const allVendorItemIds = vendorItems.map((vendorItem) => vendorItem.id);
      setSelectedVendorItems(allVendorItemIds);
    } else {
      setSelectedVendorItems([]);
    }
  };

  const handleReset = (e) => {
    e.preventDefault();
    setFormData({
      vendor: "",
      item: "",
      leadTime: "",
      minOrderQty: "",
      price: "",
      status: "active",
    });
    setIsChecked(true);
    setStatus("active");
  };

  // Function to delete a single vendor item
  const handleDeleteVendorItem = (id) => {
    api
      .delete(`/api/vendor-item/delete/${id}`)
      .then((response) => {
        if (response.data && response.data.status) {
          toast.success(
            response.data.message ||
              "Vendor-Item assignment deleted successfully!"
          );
          fetchVendorItems(); // Refresh the list
        } else {
          toast.error(
            response.data?.message || "Error deleting vendor-item assignment"
          );
        }
        setIsConfirmModal(false);
      })
      .catch((error) => {
        console.error("Error deleting vendor-item assignment:", error);
        toast.error("Error deleting vendor-item assignment. Please try again.");
        setIsConfirmModal(false);
      });
  };

  // Function to delete multiple vendor items
  const handleDeleteSelectedVendorItems = () => {
    // Delete items one by one
    const deletePromises = selectedVendorItems.map((id) =>
      api.delete(`/api/vendor-item/delete/${id}`)
    );

    Promise.all(deletePromises)
      .then(() => {
        toast.success("Selected vendor-item assignments deleted successfully!");
        setSelectedVendorItems([]);
        setSelectAll(false);
        fetchVendorItems(); // Refresh the list
        setIsConfirmModal(false);
      })
      .catch((error) => {
        console.error("Error deleting vendor-item assignments:", error);
        toast.error(
          "Error deleting some vendor-item assignments. Please try again."
        );
        fetchVendorItems(); // Refresh to see what was deleted
        setIsConfirmModal(false);
      });
  };

  // Update filtered items whenever search or filters change
  useEffect(() => {
    let filtered = [...vendorItems];

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (item) =>
          item.vendorName.toLowerCase().includes(query) ||
          item.itemName.toLowerCase().includes(query) ||
          item.days.toString().includes(query) ||
          item.quantity.toString().includes(query) ||
          item.price.toString().includes(query)
      );
    }

    // Apply vendor filter
    if (selectedVendorFilter) {
      filtered = filtered.filter(
        (item) => item.vendorName === selectedVendorFilter
      );
    }

    // Apply item filter
    if (selectedItemFilter) {
      filtered = filtered.filter(
        (item) => item.itemName === selectedItemFilter
      );
    }

    // Apply status filter
    if (selectedStatusFilter) {
      filtered = filtered.filter(
        (item) =>
          item.status.toLowerCase() === selectedStatusFilter.toLowerCase()
      );
    }

    setFilteredVendorItems(filtered);
  }, [
    vendorItems,
    searchQuery,
    selectedVendorFilter,
    selectedItemFilter,
    selectedStatusFilter,
  ]);

  // Get unique vendor names for filter dropdown
  const uniqueVendors = [
    ...new Set(vendorItems.map((item) => item.vendorName)),
  ];
  // Get unique item names for filter dropdown
  const uniqueItems = [...new Set(vendorItems.map((item) => item.itemName))];

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle filter changes
  const handleVendorFilterChange = (e) => {
    setSelectedVendorFilter(e.target.value);
  };

  const handleItemFilterChange = (e) => {
    setSelectedItemFilter(e.target.value);
  };

  const handleStatusFilterChange = (e) => {
    setSelectedStatusFilter(e.target.value);
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery("");
    setSelectedVendorFilter("");
    setSelectedItemFilter("");
    setSelectedStatusFilter("");
  };

  // RBAC
  const ability = useContext(AbilityContext);

  // Excel import
  const [excelData, setExcelData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (evt) => {
      const arrayBuffer = evt.target.result;
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const parsedData = XLSX.utils.sheet_to_json(worksheet);
      console.log("parsedData: " + JSON.stringify(parsedData));
      setExcelData(parsedData);
    };

    reader.readAsArrayBuffer(file);
  };

  const handleSaveToAPI = async () => {
    if (excelData.length === 0) {
      toast.error("Please select an Excel file");
      return;
    }

    setIsLoading(true);

    const validRows = [];
    const invalidRows = [];

    for (let i = 0; i < excelData.length; i++) {
      const row = excelData[i];

      const payload = {
        vendorCode: row.vendor_code,
        vendorName: row.vendor_name,
        itemCode: row.item_code,
        itemName: row.item_name,
        days: row.days,
        quantity: row.quantity,
        price: row.price,
        status: row.status,
      };

      const invalidFields = {};

      for (const key in payload) {
        if (
          payload[key] === "" ||
          payload[key] === null ||
          payload[key] === undefined
        ) {
          invalidFields[key] = true;
        }
      }

      if (Object.keys(invalidFields).length > 0) {
        invalidRows.push({ rowNumber: i + 2, rowData: payload, invalidFields });
      } else {
        validRows.push(payload);
      }
    }
    let partialSuccess = false;
    try {
      for (const row of validRows) {
        try {
          await api.post("/api/vendor-item/save", row);
        } catch (err) {
          console.error(
            "Failed to save row:",
            row,
            err.response?.data || err.message
          );
        }
      }
      partialSuccess = true;
      if (invalidRows.length > 0) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Invalid Rows");

        const header = [
          "Row No.",
          "vendorCode",
          "vendorName",
          "itemCode",
          "itemName",
          "days",
          "quantity",
          "price",
          "status",
        ];
        worksheet.addRow(header);

        invalidRows.forEach(({ rowNumber, rowData, invalidFields }) => {
          const rowValues = [
            rowNumber,
            rowData.vendorCode || "",
            rowData.vendorName || "",
            rowData.itemCode || "",
            rowData.itemName || "",
            rowData.days || "",
            rowData.quantity || "",
            rowData.price || "",
            rowData.status || "",
          ];

          const newRow = worksheet.addRow(rowValues);

          // Skip index 0 ("Row No.")
          const payloadKeys = [
            "vendorCode",
            "vendorName",
            "itemCode",
            "itemName",
            "days",
            "quantity",
            "price",
            "status",
          ];

          for (let colIdx = 1; colIdx < rowValues.length; colIdx++) {
            const key = payloadKeys[colIdx - 1];
            const val = rowValues[colIdx];
            const cell = newRow.getCell(colIdx + 1);

            if (invalidFields[key] || val === "") {
              cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFFF0000" }, // Red
              };
              cell.font = {
                color: { argb: "FFFFFFFF" }, // White
                bold: true,
              };
            }
          }
        });

        worksheet.columns.forEach((col) => {
          col.width = 20;
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        saveAs(blob, "Invalid_VendorItemMaster_Rows.xlsx");

        toast.warn(
          "Some rows were skipped. Excel file with details downloaded."
        );
      } else {
        toast.success("Excel imported successfully");
      }

      fetchVendorItems();
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
            backgroundColor: "rgba(0, 0, 0, 0.7)", // semi-transparent background
            zIndex: 9999,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            pointerEvents: "all", // blocks clicks
          }}
        >
          <div
            className="spinner-border text-primary"
            role="status"
            style={{ width: "4rem", height: "4rem" }}
          >
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}
      {/* Header section */}
      <nav className="navbar bg-light border-body" data-bs-theme="light">
        <div className="container-fluid">
          <div className="mt-4">
            <h3 className="nav-header header-style">Vendor Items Master</h3>
            <p className="breadcrumb">
              <Link to="/dashboard">
                <i className="fas fa-home text-8"></i>
              </Link>{" "}
              <span className="ms-1 mt-1 text-small-gray">
                / Masters / Vendor Items
              </span>
            </p>
          </div>

          {/* Add Type Button */}

          {ability.can("edit", "Vendor Item Master") && (
            <button
              className="btn btn-primary add-btn"
              onClick={handleSetIsAddVendorItem}
            >
              <i className="fa-solid fa-plus pe-1"></i> Add New Assignment
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
            placeholder="Search assignments..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        <div className="filter-options">
          <select
            className="filter-select"
            value={selectedVendorFilter}
            onChange={handleVendorFilterChange}
          >
            <option value="">All Vendors</option>
            {uniqueVendors.map((vendor) => (
              <option key={vendor} value={vendor}>
                {vendor}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-options">
          <select
            className="filter-select"
            value={selectedItemFilter}
            onChange={handleItemFilterChange}
          >
            <option value="">All Items</option>
            {uniqueItems.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-options">
          <select
            className="filter-select"
            value={selectedStatusFilter}
            onChange={handleStatusFilterChange}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div className="filter-options">
          <button className="filter-select" onClick={resetFilters}>
            <i className="fas fa-filter me-2"></i>
            Reset Filters
          </button>
        </div>
      </div>

      {/* Form Header Section */}
      {isAddVendorItem && (
        <div className="table-form-container mx-2">
          <div className="form-header">
            <h2>
              <i className="fas fa-truck-ramp-box"></i> Add New Vendor-Item
              Assignment
            </h2>
            <button
              className="btn-close"
              onClick={() => setIsAddVendorItem(false)}
            ></button>
          </div>
          {/* Form Fields */}
          <form
            autoComplete="off"
            className="padding-2"
            onSubmit={handleAddVendorItem}
          >
            <div className="form-grid border-bottom pt-0">
              <div className="row form-style">
                <div className="col-3 d-flex flex-column form-group">
                  <label htmlFor="vendor" className="form-label ms-2">
                    Vendor <span className="text-danger fs-6">*</span>
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-user-tie position-absolute z-0 input-icon"></i>
                    <select
                      className={`form-select ps-5 text-font ${
                        formData.vendor ? "" : "text-secondary"
                      }`}
                      id="vendor"
                      value={formData.vendor}
                      onChange={(e) =>
                        setFormData({ ...formData, vendor: e.target.value })
                      }
                    >
                      <option value="" disabled hidden className="text-muted">
                        Select Vendor
                      </option>
                      {vendors.map((vendor) => (
                        <option key={vendor.id} value={vendor.id}>
                          {vendor.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.vendor && (
                    <span className="error-message ms-2">{errors.vendor}</span>
                  )}
                </div>
                <div className="col-3 d-flex flex-column form-group">
                  <label htmlFor="item" className="form-label ms-2">
                    Item <span className="text-danger fs-6">*</span>
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-box position-absolute z-0 input-icon"></i>
                    <select
                      className={`form-select ps-5 text-font ${
                        formData.item ? "" : "text-secondary"
                      }`}
                      id="item"
                      value={formData.item}
                      onChange={(e) =>
                        setFormData({ ...formData, item: e.target.value })
                      }
                    >
                      <option value="" disabled hidden className="text-muted">
                        Select Item
                      </option>
                      {items.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.item && (
                    <span className="error-message ms-2">{errors.item}</span>
                  )}
                </div>
                <div className="col-3 d-flex flex-column form-group">
                  <label htmlFor="leadTime" className="form-label">
                    Lead Time (Days) <span className="text-danger fs-6">*</span>
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-clock position-absolute z-0 input-icon"></i>
                    <input
                      type="text"
                      className="form-control ps-5 text-font"
                      id="leadTime"
                      placeholder="Enter lead time"
                      value={formData.leadTime}
                      onChange={(e) =>
                        setFormData({ ...formData, leadTime: e.target.value })
                      }
                    />
                  </div>
                  <p className="text-8">
                    Total time from order to delivery (processing +
                    manufacturing + shipping)
                  </p>
                </div>
                <div className="col-3 d-flex flex-column form-group">
                  <label htmlFor="minOrderQty" className="form-label">
                    Std Qty <span className="text-danger fs-6">*</span>
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-cubes position-absolute z-0 input-icon"></i>
                    <input
                      type="text"
                      className="form-control ps-5 text-font"
                      id="minOrderQty"
                      placeholder="Enter standard quantity"
                      value={formData.minOrderQty}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          minOrderQty: e.target.value,
                        })
                      }
                    />
                  </div>
                  {errors.minOrderQty && (
                    <span className="error-message ms-2">
                      {errors.minOrderQty}
                    </span>
                  )}
                </div>
              </div>
              <div className="row form-style">
                <div className="col-3 d-flex flex-column form-group">
                  <label htmlFor="price" className="form-label">
                    Price
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-rupee-sign position-absolute z-0 input-icon"></i>
                    <input
                      type="text"
                      className="form-control ps-5 text-font"
                      id="price"
                      placeholder="Enter price"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          price: e.target.value,
                        })
                      }
                    />
                  </div>
                  {errors.price && (
                    <span className="error-message ms-2">{errors.price}</span>
                  )}
                </div>
                <div className="col-3 d-flex flex-column form-group">
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
              </div>
            </div>
            <div className="form-actions">
              <button
                className="btn btn-primary border border-0 text-8 px-3 fw-medium py-2 me-3 float-end"
                onClick={handleAddVendorItem}
              >
                <i className="fa-solid fa-floppy-disk me-1"></i> Save Changes
              </button>
              <button
                className="btn btn-secondary border border-0 text-8 px-3 fw-medium py-2 bg-secondary me-3 float-end"
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
          <div className="table-header">
            <div className="selected-count">
              <input
                type="checkbox"
                id="select-all"
                checked={selectAll}
                onChange={handleSelectAllChange}
              />
              <label htmlFor="select-all">
                {selectedVendorItems.length} Selected
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
                  const rowData = filteredVendorItems.filter((row) =>
                    selectedVendorItems.includes(row.id)
                  );
                  exportToExcel(rowData, "VendorItems");
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
              >
                <i className="fas fa-trash"></i>
                Delete Selected
              </button>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th className="checkbox-cell">
                  <input type="checkbox" id="select-all" disabled />
                </th>
                <th>Vendor</th>
                <th>Item</th>
                <th>Lead Time</th>
                <th>Std Qty</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="text-break">
              {filteredVendorItems.length === 0 ? (
                <tr className="no-data-row">
                  <td colSpan="8" className="no-data-cell">
                    <div className="no-data-content">
                      <i className="fas fa-box-open no-data-icon"></i>
                      <p className="no-data-text">
                        {vendorItems.length === 0
                          ? "No vendor-item assignments found"
                          : "No matching assignments found"}
                      </p>
                      <p className="no-data-subtext">
                        {vendorItems.length === 0
                          ? 'Click the "Add New Assignment" button to create your first assignment'
                          : "Try adjusting your search or filters"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredVendorItems.map((assignment) => (
                  <tr key={assignment.id}>
                    <td className="checkbox-cell ps-4">
                      <input
                        type="checkbox"
                        checked={selectedVendorItems.includes(assignment.id)}
                        onChange={() =>
                          handleVendorItemCheckboxChange(assignment.id)
                        }
                      />
                    </td>
                    <td className="ps-4">
                      <div>
                        <span>{assignment.vendorName}</span>
                      </div>
                    </td>
                    <td className="ps-4">
                      <div>
                        <span>
                          {" (" +
                            assignment.itemCode +
                            ") " +
                            assignment.itemName}
                        </span>
                      </div>
                    </td>
                    <td className="ps-4">
                      <div>
                        <span>{assignment.days} days</span>
                      </div>
                    </td>
                    <td className="ps-4">
                      <div>
                        <span>{assignment.quantity}</span>
                      </div>
                    </td>
                    <td className="ps-4">
                      <div>
                        <span>₹{assignment.price}</span>
                      </div>
                    </td>
                    <td className="ps-4">
                      <span
                        className={`badge status ${assignment.status.toLowerCase()}`}
                      >
                        {assignment.status}
                      </span>
                    </td>
                    <td className="actions ps-3">
                      <button
                        className="btn-icon btn-primary"
                        title="View Details"
                        onClick={(e) => handleViewDetails(assignment, e)}
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      {ability.can("edit", "Vendor Item Master") && (
                        <button
                          className="btn-icon btn-success"
                          title="Edit"
                          onClick={(e) => handleEditDetails(assignment, e)}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                      )}
                      {ability.can("edit", "Vendor Item Master") && (
                        <button
                          className="btn-icon btn-danger"
                          title="Delete"
                          onClick={() => {
                            setVendorItemIdState(assignment.id);
                            setConfirmType("single");
                            handleShowConfirm("single");
                          }}
                        >
                          <i className="fas fa-trash"></i>
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
            <div className="pagination-info">Showing 1-2 of 25 entries</div>
            <div className="pagination">
              <button className="btn-page" disabled>
                <i className="fas fa-chevron-left"></i>
              </button>
              <button className="btn-page active">1</button>
              <button className="btn-page" disabled>
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
            <div className="items-per-page">
              <select>
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
        <div className="modal fade" id="vendorItemsConfirmModal" tabIndex="-1">
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

      {/* View Type Details Modal */}
      <div
        className="modal fade"
        ref={vendorItemModalRef}
        id="vendorItemDetailModal"
        tabIndex="-1"
        aria-labelledby="vendorItemDetailModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="vendorItemDetailModalLabel">
                <i className="fas fa-circle-info me-2"></i>
                View Assignment Details
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
                  <strong>Vendor:</strong>
                  <span>{vendorItemDetails.vendor}</span>
                </div>

                <div className="detail-item">
                  <strong>Item:</strong>
                  <span>{vendorItemDetails.item}</span>
                </div>

                <div className="detail-item">
                  <strong>Lead Time (Days):</strong>
                  <span>{vendorItemDetails.leadTime}</span>
                </div>

                <div className="detail-item">
                  <strong>Std Qty:</strong>
                  <span>{vendorItemDetails.minOrderQty}</span>
                </div>

                <div className="detail-item">
                  <strong>Price:</strong>
                  <span>{vendorItemDetails.price}</span>
                </div>

                <div className="detail-item">
                  <strong>Status:</strong>
                  <span
                    className={`badge status ${vendorItemDetails.status.toLowerCase()} w-25`}
                  >
                    {vendorItemDetails.status}
                  </span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary add-btn"
                data-bs-dismiss="modal"
              >
                <i className="fa-solid fa-xmark me-1"></i>Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Vendor Item Details Modal */}
      <div
        className="modal fade"
        ref={vendorItemEditModalRef}
        id="vendorItemEditModal"
        tabIndex="-1"
        aria-labelledby="vendorItemEditModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="vendorItemEditModalLabel">
                <i className="fa-solid fa-pencil me-2 font-1"></i>
                Edit Assignment
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <form onSubmit={handleEditVendorItem}>
              <div className="modal-body overflow-hidden">
                <div className="form-grid border-bottom pt-0">
                  <div className="row form-style">
                    <div className="col-3 d-flex flex-column form-group">
                      <label htmlFor="vendor" className="form-label ms-2">
                        Vendor <span className="text-danger fs-6">*</span>
                      </label>
                      <div className="position-relative w-100">
                        <i className="fas fa-user-tag position-absolute z-0 input-icon"></i>
                        <select
                          className="form-control ps-5 ms-2 text-font"
                          id="vendor"
                          value={vendorItemDetails.vendor || ""}
                          onChange={(e) => {
                            const selectedVendor = vendors.find(
                              (v) => v.name === e.target.value
                            );
                            setVendorItemDetails({
                              ...vendorItemDetails,
                              vendor: e.target.value,
                              vendorCode: selectedVendor?.code || "",
                            });
                          }}
                        >
                          <option value="" disabled>
                            Select Vendor
                          </option>
                          {vendors.map((vendor) => (
                            <option key={vendor.id} value={vendor.name}>
                              {vendor.name}
                            </option>
                          ))}
                        </select>
                        <i className="fa-solid fa-angle-down position-absolute down-arrow-icon"></i>
                      </div>
                      {errors.vendor && (
                        <span className="error-message ms-2">
                          {errors.vendor}
                        </span>
                      )}
                    </div>
                    <div className="col-3 d-flex flex-column form-group">
                      <label htmlFor="item" className="form-label ms-2">
                        Item <span className="text-danger fs-6">*</span>
                      </label>
                      <div className="position-relative w-100">
                        <i className="fas fa-box position-absolute z-0 input-icon"></i>
                        <select
                          className="form-control ps-5 ms-2 text-font"
                          id="item"
                          value={vendorItemDetails.item || ""}
                          onChange={(e) => {
                            const selectedItem = items.find(
                              (i) => i.name === e.target.value
                            );
                            setVendorItemDetails({
                              ...vendorItemDetails,
                              item: e.target.value,
                              itemCode: selectedItem?.code || "",
                            });
                          }}
                        >
                          <option value="" disabled>
                            Select Item
                          </option>
                          {items.map((item) => (
                            <option key={item.id} value={item.name}>
                              {item.name}
                            </option>
                          ))}
                        </select>
                        <i className="fa-solid fa-angle-down position-absolute down-arrow-icon"></i>
                      </div>
                      {errors.item && (
                        <span className="error-message ms-2">
                          {errors.item}
                        </span>
                      )}
                    </div>
                    <div className="col-3 d-flex flex-column form-group">
                      <label htmlFor="leadTime" className="form-label">
                        Lead Time (Days){" "}
                        <span className="text-danger fs-6">*</span>
                      </label>
                      <div className="position-relative w-100">
                        <i className="fas fa-clock position-absolute z-0 input-icon"></i>
                        <input
                          type="text"
                          className="form-control ps-5 text-font"
                          id="leadTime"
                          placeholder="Enter lead time"
                          value={vendorItemDetails.leadTime}
                          onChange={(e) =>
                            setVendorItemDetails({
                              ...vendorItemDetails,
                              leadTime: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="col-3 d-flex flex-column form-group">
                      <label htmlFor="minOrderQty" className="form-label">
                        Std Qty <span className="text-danger fs-6">*</span>
                      </label>
                      <div className="position-relative w-100">
                        <i className="fas fa-cubes position-absolute z-0 input-icon"></i>
                        <input
                          type="text"
                          className="form-control ps-5 text-font"
                          id="minOrderQty"
                          placeholder="Enter standard quantity"
                          value={vendorItemDetails.minOrderQty}
                          onChange={(e) =>
                            setVendorItemDetails({
                              ...vendorItemDetails,
                              minOrderQty: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row form-style">
                    <div className="col-3 d-flex flex-column form-group">
                      <label htmlFor="price" className="form-label">
                        Price
                      </label>
                      <div className="position-relative w-100">
                        <i className="fas fa-rupee-sign position-absolute z-0 input-icon"></i>
                        <input
                          type="text"
                          className="form-control ps-5 text-font"
                          id="price"
                          placeholder="Enter price"
                          value={vendorItemDetails.price}
                          onChange={(e) =>
                            setVendorItemDetails({
                              ...vendorItemDetails,
                              price: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="col-3 d-flex flex-column form-group">
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
                            checked={vendorItemDetails.status === "Active"}
                            onChange={(e) => {
                              const newStatus = e.target.checked
                                ? "Active"
                                : "Inactive";
                              setVendorItemDetails({
                                ...vendorItemDetails,
                                status: newStatus,
                              });
                              setIsChecked(e.target.checked);
                              setStatus(newStatus);
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
                          value={vendorItemDetails.status}
                          onChange={(e) => {
                            const newStatus = e.target.value;
                            setVendorItemDetails({
                              ...vendorItemDetails,
                              status: newStatus,
                            });
                            setIsChecked(newStatus === "Active");
                            setStatus(newStatus);
                          }}
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                        <i className="fa-solid fa-angle-down position-absolute down-arrow-icon"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="submit" className="btn btn-primary add-btn">
                  <i className="fa-solid fa-floppy-disk me-1"></i>Save Changes
                </button>
                <button
                  type="button"
                  className="btn btn-secondary add-btn"
                  data-bs-dismiss="modal"
                >
                  <i className="fa-solid fa-xmark me-1"></i>Close
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorItemsMaster;
