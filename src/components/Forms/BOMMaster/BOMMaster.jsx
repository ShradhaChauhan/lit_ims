import React, { useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "../../../context/AppContext";
import api from "../../../services/api";
import { Link } from "react-router-dom";
import { Modal } from "bootstrap";
import { toast } from "react-toastify";
import exportToExcel from "../../../utils/exportToExcel";
import { AbilityContext } from "../../../utils/AbilityContext";
import Select from "react-select";
import * as XLSX from "xlsx";

const BOMMaster = () => {
  const [errors, setErrors] = useState({});
  const { isAddBom, setIsAddBom } = useContext(AppContext);
  const bomModalRef = useRef(null);
  const bomEditModalRef = useRef(null);
  const [isShowBomDetails, setIsShowBomDetails] = useState(false);
  const [isEditBomDetails, setIsEditBomDetails] = useState(false);
  const [bomDetails, setBomDetails] = useState({
    id: "",
    code: "",
    name: "",
    itemsCount: "",
    totalQuantity: "",
    totalValue: "",
    status: "",
  });
  const [selectedBoms, setSelectedBoms] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isReset, setIsReset] = useState(false);
  const idRef = useRef(2);
  const [status, setStatus] = useState("active");
  const [isChecked, setIsChecked] = useState(true);
  const [warehouses, setWarehouses] = useState([]);
  const [items, setItems] = useState([]);
  const [boms, setBoms] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    status: "active",
    items: [],
  });
  const [isAddBomPart, setIsAddBomPart] = useState([{ id: 1 }]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPart, setSelectedPart] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [filteredBoms, setFilteredBoms] = useState([]);

  // Confirm modal states
  const [message, setMesssage] = useState("");
  const [confirmState, setConfirmState] = useState(false);
  const [confirmType, setConfirmType] = useState("");
  const [bomIdState, setBomIdState] = useState("");
  const [isConfirmModal, setIsConfirmModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(null);

  // Confirm useEffect for confirm modal
  useEffect(() => {
    let modal = null;

    if (isConfirmModal) {
      const modalElement = document.getElementById("bomConfirmModal");

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
      setMesssage("Are you sure you want to delete this BOM?");
      setIsConfirmModal(true);
    } else {
      if (selectedBoms.length === 0) {
        toast.error("Please select BOMs to delete");
        return;
      }
      setMesssage(
        `Are you sure you want to delete ${selectedBoms.length} selected BOMs?`
      );
      setIsConfirmModal(true);
    }
  };

  const handleYesConfirm = () => {
    if (confirmType === "single") handleDeleteBom(bomIdState);
    else handleBulkDelete();
  };

  useEffect(() => {
    if (formData.items.length === 0) {
      setFormData((prev) => ({
        ...prev,
        items: isAddBomPart.map((part) => ({
          id: part.id,
          item: "",
          code: "",
          uom: "",
          quantity: "",
          warehouse:
            warehouses.find((w) => w.name.toLowerCase().includes("store"))
              ?.id || "",
        })),
      }));
    }
  }, [warehouses]);

  useEffect(() => {
    api
      .get("/api/bom/all")
      .then((response) => {
        if (response.data.status && response.data.data) {
          setBoms(response.data.data);
        }
      })
      .catch((error) => {
        toast.error("Error in fetching BOM's");
        console.error("Error fetching BOMs:", error);
      });

    api
      .get("/api/warehouses")
      .then((response) => {
        if (response.data.status && response.data.data) {
          setWarehouses(response.data.data);
        } else {
          setWarehouses(response.data.warehouses || []);
        }
      })
      .catch((error) => {
        toast.error("Error in fetching warehouses");
        console.error("Error fetching warehouses:", error);
      });

    api
      .get("/api/items/all")
      .then((response) => {
        if (response.data.status && response.data.data) {
          setItems(response.data.data);
        } else {
          setItems(response.data.items || []);
        }
      })
      .catch((error) => {
        toast.error("Error in fecthing items");
        console.error("Error fetching items:", error);
      });
  }, []);

  useEffect(() => {
    let filtered = [...boms];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (bom) =>
          bom.name.toLowerCase().includes(searchLower) ||
          bom.code.toLowerCase().includes(searchLower)
      );
    }

    if (selectedStatus) {
      filtered = filtered.filter((bom) => bom.status === selectedStatus);
    }

    if (selectedWarehouse) {
      filtered = filtered.filter((bom) =>
        bom.items?.some(
          (item) => item.warehouseId === parseInt(selectedWarehouse)
        )
      );
    }

    if (selectedPart) {
      filtered = filtered.filter((bom) =>
        bom.items?.some((item) => item.itemId === parseInt(selectedPart))
      );
    }

    // Update pagination when filters change
    setPagination((prev) => ({
      ...prev,
      totalItems: filtered.length,
      totalPages: Math.ceil(filtered.length / prev.itemsPerPage),
      currentPage: 1, // Reset to first page when filters change
    }));

    setFilteredBoms(filtered);
  }, [boms, searchTerm, selectedStatus, selectedWarehouse, selectedPart]);

  const handleBomCheckboxChange = (bomId) => {
    setSelectedBoms((prevSelected) =>
      prevSelected.includes(bomId)
        ? prevSelected.filter((id) => id !== bomId)
        : [...prevSelected, bomId]
    );
  };

  const handleSelectAllChange = (e) => {
    const checked = e.target.checked;
    setSelectAll(checked);
    if (checked) {
      const allBomIds = boms.map((bom) => bom.id);
      setSelectedBoms(allBomIds);
    } else {
      setSelectedBoms([]);
    }
  };

  const handleDeleteItem = (itemId) => {
    setIsAddBomPart((prevParts) =>
      prevParts.filter((part) => part.id !== itemId)
    );

    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== itemId),
    }));
  };

  const handleAddBoms = (e) => {
    e.preventDefault();
    const newErrors = validateForm(formData);
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const finalData = {
        name: formData.name,
        code: formData.code,
        status: formData.status,
        items: formData.items.map((item) => {
          const selectedItem =
            items.find((i) => i.id === parseInt(item.item)) || {};
          const storeWarehouse =
            warehouses.find((w) => w.name.toLowerCase().includes("store")) ||
            {};

          return {
            itemId: parseInt(item.item) || 0,
            itemName: selectedItem.name || "",
            itemCode: item.code || "",
            uom: item.uom || "",
            quantity: parseFloat(item.quantity) || 0,
            warehouseId: storeWarehouse.id || 0,
            warehouseName: storeWarehouse.name || "",
          };
        }),
      };
      console.log("finalData: " + JSON.stringify(finalData));
      api
        .post("/api/bom/add", finalData)
        .then((response) => {
          setFormData({
            name: "",
            code: "",
            status: "active",
            items: [
              {
                id: 1,
                item: "",
                code: "",
                uom: "",
                quantity: "",
                warehouse: "",
              },
            ],
          });
          toast.success("Bom added successfully");
          setIsAddBomPart([{ id: 1 }]);
          idRef.current = 2;
          setIsChecked(true);
          setStatus("active");
          setIsAddBom(false);

          // Refresh the current page
          fetchBOMs(pagination.currentPage);
        })
        .catch((error) => {
          toast.error("Error in adding new BOM");
          console.error("Error adding BOM:", error);
        });
    }
  };

  const validateForm = (data) => {
    const errors = {};

    if (!data.name.trim()) {
      errors.name = "BOM name is required";
    }

    if (!data.code) {
      errors.code = "Code is required";
    } else if (!/^\d+$/.test(data.code)) {
      errors.code = "Code must only be in digits";
    }

    return errors;
  };

  const handleEditBom = (e) => {
    e.preventDefault();
    const newErrors = validateForm(bomDetails);
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const storeWarehouse =
        warehouses.find((w) => w.name.toLowerCase().includes("store")) || {};

      const finalData = {
        name: bomDetails.name,
        code: bomDetails.code,
        status: bomDetails.status,
        items: bomDetails.items.map((item) => ({
          itemId: item.itemId,
          itemName: item.itemName,
          itemCode: item.itemCode,
          uom: item.uom,
          quantity: parseFloat(item.quantity),
          warehouseId: storeWarehouse.id || 0,
          warehouseName: storeWarehouse.name || "",
        })),
      };

      api
        .put(`/api/bom/update/${bomDetails.id}`, finalData)
        .then((response) => {
          console.log("BOM updated successfully:", response.data);
          toast.success("Bom updated successfully");
          // Close the modal using Bootstrap's hide method
          const modal = Modal.getInstance(bomEditModalRef.current);
          if (modal) {
            modal.hide();
          }
          setIsEditBomDetails(false);
          // Refresh the current page
          fetchBOMs(pagination.currentPage);
        })
        .catch((error) => {
          toast.error("Error in updating the BOM");
          console.error("Error updating BOM:", error);
        });
    }
  };

  const handleAddItemToEdit = () => {
    const storeWarehouse =
      warehouses.find((w) => w.name.toLowerCase().includes("store")) || {};
    setBomDetails((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          itemId: "",
          itemName: "",
          itemCode: "",
          uom: "",
          quantity: "",
          warehouseId: storeWarehouse.id || "",
          warehouseName: storeWarehouse.name || "",
        },
      ],
    }));
  };

  const handleRemoveItemFromEdit = (index) => {
    setBomDetails((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleEditItemChange = (index, field, value) => {
    setBomDetails((prev) => {
      const updatedItems = [...prev.items];
      if (field === "item") {
        const selectedItem = items.find((item) => item.id === parseInt(value));
        if (selectedItem) {
          updatedItems[index] = {
            ...updatedItems[index],
            itemId: selectedItem.id,
            itemName: selectedItem.name,
            itemCode: selectedItem.code,
            uom: selectedItem.uom,
          };
        }
      } else if (field === "warehouse") {
        const storeWarehouse = warehouses.find((w) =>
          w.name.toLowerCase().includes("store")
        );
        if (storeWarehouse) {
          updatedItems[index] = {
            ...updatedItems[index],
            warehouseId: storeWarehouse.id,
            warehouseName: storeWarehouse.name,
          };
        }
      } else {
        updatedItems[index] = {
          ...updatedItems[index],
          [field]: value,
        };
      }
      return {
        ...prev,
        items: updatedItems,
      };
    });
  };

  const handleViewDetails = (bom, e) => {
    e.preventDefault();
    console.log(bom);
    setBomDetails(bom);
    setIsShowBomDetails(true);
  };

  const handleEditDetails = (bom, e) => {
    e.preventDefault();
    console.log(bom);
    setBomDetails(bom);
    setIsEditBomDetails(true);
  };

  useEffect(() => {
    if (isShowBomDetails && bomModalRef.current) {
      const bsModal = new Modal(bomModalRef.current, {
        backdrop: "static",
      });
      bsModal.show();

      bomModalRef.current.addEventListener("hidden.bs.modal", () =>
        setIsShowBomDetails(false)
      );
    } else if (isEditBomDetails && bomEditModalRef.current) {
      const bsModal = new Modal(bomEditModalRef.current, {
        backdrop: "static",
      });
      bsModal.show();

      bomEditModalRef.current.addEventListener("hidden.bs.modal", () =>
        setIsEditBomDetails(false)
      );
    }
  }, [isShowBomDetails, isEditBomDetails]);

  const handleReset = (e) => {
    e.preventDefault();
    setFormData({
      name: "",
      code: "",
      status: "active",
      items: isAddBomPart.map((part) => ({
        id: part.id,
        item: "",
        code: "",
        uom: "",
        quantity: "",
        warehouse: "",
      })),
    });
    setIsChecked(true);
    setStatus("active");
  };
  const handleSetIsAddBOM = () => {
    setIsAddBom(true);
  };

  // Function to fetch BOMs with pagination
  const fetchBOMs = (page = 1, perPage = pagination.itemsPerPage) => {
    api
      .get(`/api/bom/all`)
      .then((response) => {
        if (response.data.status && response.data.data) {
          const allBoms = response.data.data;
          setBoms(allBoms);
          setPagination({
            currentPage: page,
            totalPages: Math.ceil(allBoms.length / perPage),
            totalItems: allBoms.length,
            itemsPerPage: perPage,
          });
        }
      })
      .catch((error) => {
        toast.error("Error in fetching BOM's from database");
        console.error("Error fetching BOMs:", error);
      });
  };

  // Initial fetch
  useEffect(() => {
    fetchBOMs();
  }, []);

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({
        ...prev,
        currentPage: newPage,
      }));
    }
  };

  // Handle items per page change
  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = parseInt(e.target.value);
    setPagination((prev) => ({
      ...prev,
      itemsPerPage: newItemsPerPage,
      currentPage: 1, // Reset to first page when changing items per page
      totalPages: Math.ceil(filteredBoms.length / newItemsPerPage),
    }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];

    if (field === "item") {
      const selectedItem = items.find((item) => item.id === parseInt(value));
      if (selectedItem) {
        updatedItems[index] = {
          ...updatedItems[index],
          item: value,
          code: selectedItem.code,
          uom: selectedItem.uom,
        };
      }
    } else if (field === "warehouse") {
      updatedItems[index] = {
        ...updatedItems[index],
        warehouse: value,
      };
    } else if (field === "quantity") {
      updatedItems[index] = {
        ...updatedItems[index],
        quantity: value,
      };
    }

    setFormData({
      ...formData,
      items: updatedItems,
    });
  };

  // Handle single BOM deletion
  const handleDeleteBom = (bomId) => {
    api
      .delete(`/api/bom/delete/${bomId}`)
      .then((response) => {
        console.log("BOM deleted successfully:", response.data);
        toast.success("BOM deleted successfully");
        // Refresh the current page
        fetchBOMs(pagination.currentPage);
        setIsConfirmModal(false);
      })
      .catch((error) => {
        toast.error("Error deleting the BOM");
        console.error("Error deleting BOM:", error);
        setIsConfirmModal(false);
      });
  };

  // Handle bulk deletion
  const handleBulkDelete = () => {
    // Create an array of promises for each delete operation
    const deletePromises = selectedBoms.map((bomId) =>
      api.delete(`/api/bom/delete/${bomId}`)
    );

    Promise.all(deletePromises)
      .then(() => {
        console.log("Selected BOMs deleted successfully");
        toast.success("Selected BOM's deleted successfully");
        setSelectedBoms([]); // Clear selection
        setSelectAll(false); // Reset select all checkbox
        // Refresh the current page
        fetchBOMs(pagination.currentPage);
        setIsConfirmModal(false);
      })
      .catch((error) => {
        toast.error("Error deleting selected BOM's.");
        console.error("Error deleting BOMs:", error);
        setIsConfirmModal(false);
      });
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedPart("");
    setSelectedWarehouse("");
    setSelectedStatus("");
  };

  // RBAC
  const ability = useContext(AbilityContext);

  // Import excel
  const [jsonData, setJsonData] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      // Always read "Sheet1" from your llyodbom.xlsx
      const worksheet = workbook.Sheets["Sheet1"];
      const rows = XLSX.utils.sheet_to_json(worksheet);

      // Group by Parent Item
      const grouped = {};
      rows.forEach((row) => {
        const parentCode = row["Parent Item"];
        if (!grouped[parentCode]) {
          grouped[parentCode] = {
            name: row["Product Description"],
            code: String(parentCode),
            status: "active",
            items: [],
          };
        }

        grouped[parentCode].items.push({
          itemId: Number(row["Component Code"]),
          itemName: row["Item Description"],
          itemCode: String(row["Component Code"]),
          uom: row["UOM"], // default
          quantity: Number(row["Quantity"]),
          warehouseId: 1, // default
          warehouseName: "Store1",
        });
      });

      setJsonData(Object.values(grouped));
    };
    console.log(jsonData);
    reader.readAsArrayBuffer(file);
  };

  const handleUpload = async () => {
    if (!jsonData) {
      alert("Please upload a file first!");
      return;
    }

    try {
      for (const bom of jsonData) {
        console.log(bom);
        await api.post("/api/bom/add", bom);
      }
      alert("Upload successful!");
    } catch (error) {
      console.error(error);
      alert("Error uploading BOM data.");
    }
  };

  // Download template
  const downloadBOMTemplate = () => {
    // Define headers
    const headers = [
      "Parent Item",
      "Product Description",
      "Component Code",
      "Item Description",
      "Quantity",
      "UOM",
    ];

    // Dummy rows
    const dummyData = [
      [
        "10010001",
        "Split AC Indoor Unit",
        "20020011",
        "Copper Pipe 10mm",
        2,
        "PCS",
      ],
      [
        "10010001",
        "Split AC Indoor Unit",
        "20020022",
        "Remote Control AC",
        1,
        "PCS",
      ],
      [
        "10010001",
        "Split AC Indoor Unit",
        "20020033",
        "Mounting Bracket Set",
        1,
        "SET",
      ],
    ];

    // Create worksheet with headers + data
    const ws = XLSX.utils.aoa_to_sheet([headers, ...dummyData]);

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "BOM Template");

    // Trigger file download
    XLSX.writeFile(wb, "BOM_Template.xlsx");
  };

  return (
    <div>
      <nav className="navbar bg-light border-body" data-bs-theme="light">
        <div className="container-fluid">
          <div className="mt-4">
            <h3 className="nav-header header-style">BOM Master</h3>
            <p className="breadcrumb">
              <Link to="/dashboard">
                <i className="fas fa-home text-8"></i>
              </Link>{" "}
              <span className="ms-1 mt-1 text-small-gray">
                / Masters / BOM Master
              </span>
            </p>
          </div>
          {/* Add BOM Button */}

          {ability.can("edit", "BOM Master") && (
            <button
              className="btn btn-primary add-btn"
              onClick={handleSetIsAddBOM}
            >
              <i className="fa-solid fa-plus pe-1"></i> Add New BOM
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
            placeholder="Search by name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-options">
          <select
            className="filter-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
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
      {isAddBom && (
        <div className="table-form-container mx-2">
          <div className="form-header">
            <h2>
              <i className="fas fa-sitemap"></i> Add New Bom
            </h2>
            <button className="btn" onClick={() => setIsAddBom(false)}>
              <i className="fas fa-times"></i>
            </button>
          </div>

          {/* Form Fields */}
          <form
            autoComplete="off"
            className="padding-2"
            onSubmit={handleAddBoms}
          >
            <div className="form-grid border-bottom pt-0">
              <div className="row form-style">
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="bomName" className="form-label">
                    BOM Name <span className="text-danger fs-6">*</span>
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-file-alt position-absolute z-0 input-icon"></i>
                    <input
                      type="text"
                      className="form-control ps-5 text-font"
                      id="bomName"
                      placeholder="Enter BOM name"
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
                  <label htmlFor="bomCode" className="form-label">
                    BOM Code <span className="text-danger fs-6">*</span>
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-qrcode position-absolute z-0 input-icon"></i>
                    <input
                      type="text"
                      className="form-control ps-5 text-font"
                      id="bomCode"
                      placeholder="Enter BOM code"
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({ ...formData, code: e.target.value })
                      }
                    />
                  </div>
                  {errors.code && (
                    <span className="error-message">{errors.code}</span>
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
                      <option value="" disabled hidden className="text-muted">
                        Select Status
                      </option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                    <i className="fa-solid fa-angle-down position-absolute down-arrow-icon"></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="parts-section">
              <div className="bom-list-header">
                <h2>Items List</h2>
              </div>
              <div className="item-table-container mt-3">
                <table>
                  <thead>
                    <tr>
                      <th>Item Name</th>
                      <th>Item Code</th>
                      <th>UOM</th>
                      <th>Quantity</th>
                      <th>Warehouse</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-break">
                    {isAddBomPart.map((bomPart, index) => {
                      const currentItem = formData.items.find(
                        (item) => item.id === bomPart.id
                      ) || {
                        id: bomPart.id,
                        item: "",
                        code: "",
                        uom: "",
                        quantity: "",
                        warehouse: "",
                      };

                      return (
                        <tr key={bomPart.id}>
                          <td>
                            <div className="field-wrapper">
                              <div className="position-relative w-100">
                                <i
                                  className="fas fa-cogs position-absolute input-icon"
                                  style={{
                                    top: "50%",
                                    left: "10px",
                                    transform: "translateY(-50%)",
                                    zIndex: 1,
                                  }}
                                ></i>
                                <Select
                                  className="w-100 text-font ps-5"
                                  classNamePrefix="react-select"
                                  placeholder="Select Item"
                                  isSearchable
                                  options={items.map((item) => ({
                                    value: item.id,
                                    label: `${item.name} (${item.code})`,
                                    code: item.code,
                                    uom: item.uom,
                                  }))}
                                  // find the correct option from items to show as selected
                                  value={
                                    items
                                      .map((item) => ({
                                        value: item.id,
                                        label: `${item.name} (${item.code})`,
                                        code: item.code,
                                        uom: item.uom,
                                      }))
                                      .find(
                                        (opt) => opt.value === currentItem.item
                                      ) || null
                                  }
                                  onChange={(selected) =>
                                    handleItemChange(
                                      index,
                                      "item",
                                      selected ? selected.value : ""
                                    )
                                  }
                                />
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="field-wrapper">
                              <input
                                type="text"
                                className="form-control text-font w-100"
                                disabled
                                value={currentItem.code || ""}
                              />
                            </div>
                          </td>
                          <td>
                            <div className="field-wrapper">
                              <input
                                type="text"
                                className="form-control text-font w-100"
                                disabled
                                value={currentItem.uom || ""}
                              />
                            </div>
                          </td>
                          <td>
                            <div className="field-wrapper">
                              <input
                                type="number"
                                className="form-control text-font w-100"
                                min="0.01"
                                step="0.01"
                                required
                                value={currentItem.quantity || ""}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "quantity",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          </td>
                          <td>
                            <div className="field-wrapper">
                              <div className="position-relative w-100">
                                <i className="fas fa-warehouse position-absolute z-0 input-icon"></i>
                                <select
                                  className="form-control text-font w-100 ps-5"
                                  required
                                  value={
                                    warehouses.find((w) =>
                                      w.name.toLowerCase().includes("store")
                                    )?.id || ""
                                  }
                                  disabled
                                >
                                  <option value="">Select Warehouse</option>
                                  {warehouses.map((warehouse) => (
                                    <option
                                      key={warehouse.id}
                                      value={warehouse.id}
                                    >
                                      {warehouse.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </td>
                          <td className="actions">
                            <div className="field-wrapper">
                              <button
                                type="button"
                                className="btn-icon delete ms-2"
                                title="Remove Item"
                                onClick={() => handleDeleteItem(bomPart.id)}
                                disabled={isAddBomPart.length <= 1}
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <button
                  type="button"
                  className="btn btn-secondary text-font m-3"
                  onClick={() => {
                    const newId = idRef.current++;
                    // Add new part to isAddBomPart
                    setIsAddBomPart((prevParts) => [
                      ...prevParts,
                      { id: newId },
                    ]);

                    // Add a new empty item to formData.items
                    setFormData((prev) => ({
                      ...prev,
                      items: [
                        ...prev.items,
                        {
                          id: newId,
                          item: "",
                          code: "",
                          uom: "",
                          quantity: "",
                          warehouse:
                            warehouses.find((w) =>
                              w.name.toLowerCase().includes("store")
                            )?.id || "",
                        },
                      ],
                    }));
                  }}
                >
                  <i className="fas fa-plus me-2"></i>
                  Add Item
                </button>
              </div>
            </div>

            <div className="form-actions">
              <button
                className="btn btn-primary border border-0 text-8 px-3 fw-medium py-2 me-3 float-end"
                onClick={handleAddBoms}
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
          {ability.can("edit", "Business Partner") && (
            <div className="table-header">
              <div className="selected-count">
                <input
                  type="checkbox"
                  id="select-all"
                  checked={selectAll}
                  onChange={handleSelectAllChange}
                />
                <label htmlFor="select-all">
                  {selectedBoms.length} Selected
                </label>
              </div>
              <div className="bulk-actions">
                <div className="d-flex align-items-center gap-2">
                  <input
                    className="form-control form-control-sm w-auto text-8"
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                  />
                  <button
                    onClick={handleUpload}
                    className="btn btn-outline-secondary text-8"
                  >
                    <i className="fas fa-file-import me-1"></i> Import Excel
                  </button>
                </div>
                <button
                  className="btn btn-outline-success text-8"
                  onClick={() => {
                    // Prepare data for Excel export with better formatting
                    const rowData = [];

                    // Filter selected BOMs
                    const selectedBOMData = filteredBoms.filter((row) =>
                      selectedBoms.includes(row.id)
                    );

                    // Process each BOM
                    selectedBOMData.forEach((bom) => {
                      // Add BOM header row
                      rowData.push({
                        "BOM Code": bom.code,
                        "BOM Name": bom.name,
                        Status: bom.status,
                        "Item Name": "",
                        "Item Code": "",
                        UOM: "",
                        Quantity: "",
                        Warehouse: "",
                      });

                      // Add item rows
                      if (bom.items && bom.items.length > 0) {
                        bom.items.forEach((item) => {
                          rowData.push({
                            "BOM Code": bom.code,
                            "BOM Name": "",
                            Status: "",
                            "Item Name": item.itemName,
                            "Item Code": item.itemCode,
                            UOM: item.uom,
                            Quantity: item.quantity,
                            Warehouse: item.warehouseName,
                          });
                        });
                      }

                      // Add a blank row between BOMs for better readability
                      rowData.push({
                        "BOM Code": "",
                        "BOM Name": "",
                        Status: "",
                        "Item Name": "",
                        "Item Code": "",
                        UOM: "",
                        Quantity: "",
                        Warehouse: "",
                      });
                    });

                    exportToExcel(rowData, "BOM");
                  }}
                >
                  <i className="fas fa-file-export me-1"></i>
                  Export Selected
                </button>
                <button
                  className="btn btn-outline-dark text-8"
                  onClick={downloadBOMTemplate}
                >
                  <i className="fa-solid fa-download me-1"></i>
                  Download BOM Template
                </button>

                <button
                  className="btn btn-outline-danger text-8"
                  onClick={() => {
                    setConfirmType("multi");
                    handleShowConfirm("multi");
                  }}
                  disabled={selectedBoms.length === 0}
                >
                  <i className="fas fa-trash me-2"></i>
                  Delete Selected
                </button>
              </div>
            </div>
          )}
          <table>
            <thead>
              <tr>
                <th className="checkbox-cell">
                  <input type="checkbox" id="select-all" disabled />
                </th>
                <th>BOM Code</th>
                <th>BOM Name</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="text-break">
              {filteredBoms.length === 0 ? (
                <tr className="no-data-row">
                  <td colSpan="5" className="no-data-cell">
                    <div className="no-data-content">
                      <i className="fas fa-sitemap no-data-icon mb-3"></i>
                      <p className="no-data-text mb-1">No BOM's found</p>
                      <p className="no-data-subtext">
                        {boms.length === 0
                          ? 'Click the "Add New BOM" button to create your first Bill of Materials'
                          : "No BOMs match your search criteria"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                // Get the current page's records
                filteredBoms
                  .slice(
                    (pagination.currentPage - 1) * pagination.itemsPerPage,
                    pagination.currentPage * pagination.itemsPerPage
                  )
                  .map((bom) => (
                    <tr key={bom.id}>
                      <td className="checkbox-cell ps-4">
                        <input
                          type="checkbox"
                          checked={selectedBoms.includes(bom.id)}
                          onChange={() => handleBomCheckboxChange(bom.id)}
                        />
                      </td>
                      <td className="ps-4">
                        <div>
                          <span>{bom.code}</span>
                        </div>
                      </td>
                      <td className="ps-4">
                        <div>
                          <span>{bom.name}</span>
                        </div>
                      </td>
                      <td className="ps-4">
                        <span className={`badge status ${bom.status}`}>
                          {bom.status}
                        </span>
                      </td>
                      <td className="actions ps-3">
                        <button
                          className="btn-icon view"
                          title="View Details"
                          onClick={(e) => handleViewDetails(bom, e)}
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        {ability.can("edit", "BOM Master") && (
                          <button
                            className="btn-icon edit"
                            title="Edit"
                            onClick={(e) => handleEditDetails(bom, e)}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                        )}
                        {ability.can("edit", "BOM Master") && (
                          <button
                            className="btn-icon delete"
                            title="Delete"
                            onClick={() => {
                              setBomIdState(bom.id);
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
            <div className="pagination-info">
              Showing{" "}
              {(pagination.currentPage - 1) * pagination.itemsPerPage + 1}-
              {Math.min(
                pagination.currentPage * pagination.itemsPerPage,
                pagination.totalItems
              )}{" "}
              of {pagination.totalItems} entries
            </div>
            <div className="pagination">
              <button
                className="btn-page"
                disabled={pagination.currentPage === 1}
                onClick={() => handlePageChange(pagination.currentPage - 1)}
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              {[...Array(pagination.totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  className={`btn-page ${
                    pagination.currentPage === index + 1 ? "active" : ""
                  }`}
                  onClick={() => handlePageChange(index + 1)}
                >
                  {index + 1}
                </button>
              ))}
              <button
                className="btn-page"
                disabled={pagination.currentPage === pagination.totalPages}
                onClick={() => handlePageChange(pagination.currentPage + 1)}
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

      {/* Confirmation dialog modal */}
      {isConfirmModal && (
        <div className="modal fade" id="bomConfirmModal" tabIndex="-1">
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

      {/* BOM View Modal */}
      <div
        className="modal fade"
        id="bomViewModal"
        tabIndex="-1"
        aria-labelledby="bomViewModalLabel"
        aria-hidden="true"
        ref={bomModalRef}
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="bomViewModalLabel">
                <i className="fas fa-circle-info me-2"></i>
                BOM Details
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
              {bomDetails && (
                <div>
                  <div className="user-details-grid">
                    <div className="detail-item">
                      <strong>BOM Name:</strong>
                      <span>{bomDetails.name}</span>
                    </div>
                    <div className="detail-item">
                      <strong>BOM Code:</strong>
                      <span>{bomDetails.code}</span>
                    </div>
                    <div className="detail-item">
                      <strong>Status:</strong>
                      <span
                        className={`badge status ${bomDetails.status?.toLowerCase()} w-50`}
                      >
                        {bomDetails.status?.charAt(0).toUpperCase() +
                          bomDetails.status?.slice(1)}
                      </span>
                    </div>
                    <div className="detail-item">
                      <strong>Items Count:</strong>
                      <span>
                        {bomDetails.items ? bomDetails.items.length : 0}
                      </span>
                    </div>
                  </div>
                  <div className="bom-details">
                    {/* Items Table */}
                    <div className="mt-4">
                      <h6 className="mb-3">Items List</h6>
                      <div className="table-responsive">
                        <table className="table table-bordered table-hover">
                          <thead className="table-light">
                            <tr>
                              <th>Item Name</th>
                              <th>Item Code</th>
                              <th>UOM</th>
                              <th>Quantity</th>
                              <th>Warehouse</th>
                            </tr>
                          </thead>
                          <tbody className="text-break">
                            {bomDetails.items &&
                              bomDetails.items.map((item, index) => (
                                <tr key={index}>
                                  <td>{item.itemName}</td>
                                  <td>{item.itemCode}</td>
                                  <td>{item.uom}</td>
                                  <td>{item.quantity}</td>
                                  <td>{item.warehouseName}</td>
                                </tr>
                              ))}
                            {(!bomDetails.items ||
                              bomDetails.items.length === 0) && (
                              <tr>
                                <td colSpan="5" className="text-center">
                                  No items found
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary add-btn"
                data-bs-dismiss="modal"
              >
                <i className="fas fa-xmark me-2"></i>Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* BOM Edit Modal */}
      <div
        className="modal fade"
        id="bomEditModal"
        tabIndex="-1"
        aria-labelledby="bomEditModalLabel"
        aria-hidden="true"
        ref={bomEditModalRef}
      >
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="bomEditModalLabel">
                <i className="fas fa-pencil me-2 font-1"></i>Edit BOM
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
            <div className="modal-body" style={{ overflowX: "hidden" }}>
              <form onSubmit={handleEditBom}>
                {bomDetails && (
                  <>
                    <div className="form-grid border-bottom pt-0">
                      <div className="row form-style">
                        <div className="col-4 d-flex flex-column form-group">
                          <label htmlFor="editBomName" className="form-label">
                            BOM Name <span className="text-danger fs-6">*</span>
                          </label>
                          <div className="position-relative w-100">
                            <i className="fas fa-file-alt position-absolute z-0 input-icon"></i>
                            <input
                              type="text"
                              className="form-control ps-5 text-font"
                              id="editBomName"
                              value={bomDetails.name}
                              onChange={(e) =>
                                setBomDetails({
                                  ...bomDetails,
                                  name: e.target.value,
                                })
                              }
                            />
                          </div>
                          {errors.name && (
                            <span className="error-message">{errors.name}</span>
                          )}
                        </div>
                        <div className="col-4 d-flex flex-column form-group">
                          <label htmlFor="editBomCode" className="form-label">
                            BOM Code <span className="text-danger fs-6">*</span>
                          </label>
                          <div className="position-relative w-100">
                            <i className="fas fa-qrcode position-absolute z-0 input-icon"></i>
                            <input
                              type="text"
                              className="form-control ps-5 text-font"
                              id="editBomCode"
                              value={bomDetails.code}
                              onChange={(e) =>
                                setBomDetails({
                                  ...bomDetails,
                                  code: e.target.value,
                                })
                              }
                            />
                          </div>
                          {errors.code && (
                            <span className="error-message">{errors.code}</span>
                          )}
                        </div>
                        <div className="col-4 d-flex flex-column form-group">
                          <label htmlFor="editBomStatus" className="form-label">
                            Status
                          </label>
                          <div className="position-relative w-100">
                            <div className="form-check form-switch position-absolute z-0 input-icon mt-1 padding-left-2">
                              <input
                                className="form-check-input text-font switch-style"
                                type="checkbox"
                                role="switch"
                                checked={bomDetails.status === "active"}
                                onChange={(e) =>
                                  setBomDetails({
                                    ...bomDetails,
                                    status: e.target.checked
                                      ? "active"
                                      : "inactive",
                                  })
                                }
                              />
                            </div>
                            <select
                              className="form-control text-font switch-padding"
                              value={bomDetails.status}
                              onChange={(e) =>
                                setBomDetails({
                                  ...bomDetails,
                                  status: e.target.value,
                                })
                              }
                            >
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                            </select>
                            <i className="fa-solid fa-angle-down position-absolute down-arrow-icon"></i>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="parts-section">
                      <div className="bom-list-header">
                        <h2>Items List</h2>
                      </div>
                      <div className="item-table-container mt-3">
                        <table>
                          <thead>
                            <tr>
                              <th>Item Name</th>
                              <th>Item Code</th>
                              <th>UOM</th>
                              <th>Quantity</th>
                              <th>Warehouse</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody className="text-break">
                            {bomDetails.items &&
                              bomDetails.items.map((item, index) => (
                                <tr key={index}>
                                  <td>
                                    <div className="field-wrapper">
                                      <div className="position-relative w-100">
                                        <i className="fas fa-cogs position-absolute z-0 input-icon"></i>
                                        <Select
                                          className="w-100 text-font ps-5"
                                          classNamePrefix="react-select"
                                          placeholder="Select Item"
                                          isSearchable
                                          options={items.map((i) => ({
                                            value: i.id,
                                            label: `${i.name} (${i.code})`,
                                            code: i.code,
                                            uom: i.uom,
                                          }))}
                                          value={
                                            items
                                              .map((i) => ({
                                                value: i.id,
                                                label: `${i.name} (${i.code})`,
                                                code: i.code,
                                                uom: i.uom,
                                              }))
                                              .find(
                                                (opt) =>
                                                  opt.value === item.itemId
                                              ) || null
                                          }
                                          onChange={(selected) =>
                                            handleEditItemChange(
                                              index,
                                              "item",
                                              selected ? selected.value : ""
                                            )
                                          }
                                        />
                                      </div>
                                    </div>
                                  </td>
                                  <td>
                                    <div className="field-wrapper">
                                      <input
                                        type="text"
                                        className="form-control text-font w-100"
                                        disabled
                                        value={item.itemCode || ""}
                                      />
                                    </div>
                                  </td>
                                  <td>
                                    <div className="field-wrapper">
                                      <input
                                        type="text"
                                        className="form-control text-font w-100"
                                        disabled
                                        value={item.uom || ""}
                                      />
                                    </div>
                                  </td>
                                  <td>
                                    <div className="field-wrapper">
                                      <input
                                        type="number"
                                        className="form-control text-font w-100"
                                        min="0.01"
                                        step="0.01"
                                        required
                                        value={item.quantity || ""}
                                        onChange={(e) =>
                                          handleEditItemChange(
                                            index,
                                            "quantity",
                                            e.target.value
                                          )
                                        }
                                      />
                                    </div>
                                  </td>
                                  <td>
                                    <div className="field-wrapper">
                                      <div className="position-relative w-100">
                                        <i className="fas fa-warehouse position-absolute z-0 input-icon"></i>
                                        <select
                                          className="form-control text-font w-100 ps-5"
                                          required
                                          value={
                                            warehouses.find((w) =>
                                              w.name
                                                .toLowerCase()
                                                .includes("store")
                                            )?.id || ""
                                          }
                                          disabled
                                        >
                                          <option value="">
                                            Select Warehouse
                                          </option>
                                          {warehouses.map((w) => (
                                            <option key={w.id} value={w.id}>
                                              {w.name}
                                            </option>
                                          ))}
                                        </select>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="actions">
                                    <div className="field-wrapper">
                                      <button
                                        type="button"
                                        className="btn-icon delete ms-2"
                                        title="Remove Item"
                                        onClick={() =>
                                          handleRemoveItemFromEdit(index)
                                        }
                                        disabled={bomDetails.items.length <= 1}
                                      >
                                        <i className="fas fa-trash"></i>
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                        <button
                          type="button"
                          className="btn btn-secondary text-font m-3"
                          onClick={handleAddItemToEdit}
                        >
                          <i className="fas fa-plus me-2"></i>
                          Add Item
                        </button>
                      </div>
                    </div>
                  </>
                )}
                <div className="modal-footer">
                  <button type="submit" className="btn btn-primary add-btn">
                    <i className="fa-solid fa-floppy-disk me-1"></i> Save
                    Changes
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary add-btn"
                    data-bs-dismiss="modal"
                  >
                    <i className="fas fa-xmark me-2"></i> Close
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BOMMaster;
