import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { AppContext } from "../../../context/AppContext";
import api from "../../../services/api";
import { Link } from "react-router-dom";
import { Modal } from "bootstrap";
import { toast } from "react-toastify";
import { AbilityContext } from "../../../utils/AbilityContext";
import exportToExcel from "../../../utils/exportToExcel";
import Select from "react-select";

const WarehouseMaster = () => {
  const [errors, setErrors] = useState({});
  const warehouseModalRef = useRef(null);
  const warehouseEditModalRef = useRef(null);
  const { isAddWarehouse, setIsAddWarehouse } = useContext(AppContext);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddSubLocation, setIsAddSubLocation] = useState([{ id: 1 }]);
  // Confirm modal states
  const [message, setMesssage] = useState("");
  const [confirmState, setConfirmState] = useState(false);
  const [confirmType, setConfirmType] = useState("");
  const [warehouseIdState, setWarehouseIdState] = useState("");
  const [isConfirmModal, setIsConfirmModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(null);
  const [items, setItems] = useState([]);
  const [selectedWarehouses, setSelectedWarehouses] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [status, setStatus] = useState("active");
  const [isChecked, setIsChecked] = useState(true);
  const [subLocations, setSubLocations] = useState([
    {
      id: Date.now(),
      name: "",
      itemName: "",
      itemCode: "",
      racks: "",
    },
  ]);
  const [formData, setFormData] = useState({
    trno: "",
    name: "",
    code: "",
    type: "",
    status: "active",
    subLocations: [],
  });
  const itemOptions = useMemo(
    () =>
      items.map((item) => (
        <option key={item.id} value={item.id}>
          ({item.code}) {item.name}
        </option>
      )),
    [items]
  );

  const handleLocationChange = (index, field, value) => {
    setSubLocations((prev) => {
      const updated = [...prev];
      if (field === null && typeof value === "object") {
        updated[index] = { ...updated[index], ...value };
      } else {
        updated[index] = { ...updated[index], [field]: value };
      }
      return updated;
    });
  };

  const handleAddSubLocation = () => {
    setIsLoading(true);
    setTimeout(() => {
      setSubLocations((prev) => [
        ...prev,
        {
          id: Date.now(),
          name: "",
          itemName: "",
          itemCode: "",
          racks: "",
        },
      ]);
      setIsLoading(false);
    }, 300);
  };

  const handleDeleteSubLocation = (id) => {
    if (subLocations.length > 1) {
      setSubLocations(subLocations.filter((loc) => loc.id !== id));
    }
  };
  // Check if all existing rows are filled
  const isAllFilled = subLocations.every(
    (loc) =>
      loc.name.trim() !== "" &&
      loc.itemName.trim() !== "" &&
      loc.itemCode.trim() !== "" &&
      loc.racks.toString().trim() !== ""
  );
  const [isShowWarehouseDetails, setIsShowWarehouseDetails] = useState(false);
  const [isEditWarehouseDetails, setIsEditWarehouseDetails] = useState(false);
  const [warehouseDetails, setWarehouseDetails] = useState({
    id: "",
    trno: "",
    name: "",
    code: "",
    type: "",
    status: "",
    subLocations: [],
  });
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editErrors, setEditErrors] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [filteredWarehouses, setFilteredWarehouses] = useState([]);

  useEffect(() => {
    if (formData.subLocations.length === 0) {
      setFormData((prev) => ({
        ...prev,
        subLocations:
          isAddSubLocation.length > 0
            ? isAddSubLocation.map((location) => ({
                id: location.id,
                name: "",
                itemName: "",
                itemCode: "",
                racks: "",
              }))
            : [],
      }));
    }
  }, []);

  useEffect(() => {
    fetchWarehouses();
  }, []);

  // Confirm useEffect for confirm modal
  useEffect(() => {
    let modal = null;

    if (isConfirmModal) {
      const modalElement = document.getElementById("warehouseConfirmModal");

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

  useEffect(() => {
    let result = [...warehouses];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (warehouse) =>
          warehouse.name.toLowerCase().includes(query) ||
          warehouse.code.toLowerCase().includes(query) ||
          warehouse.trno.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter) {
      result = result.filter(
        (warehouse) =>
          warehouse.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    setFilteredWarehouses(result);
  }, [warehouses, searchQuery, statusFilter]);

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

  const fetchWarehouses = () => {
    setLoading(true);
    api
      .get("/api/warehouses")
      .then((response) => {
        console.log("Warehouses response:", response.data);
        if (response.data && response.data.status) {
          setWarehouses(response.data.data || []);
        } else {
          console.error(
            "Error fetching warehouses:",
            response.data.message || "Unknown error"
          );
          toast.error(
            "Error in fetching warehouses. Please refresh the page and try again"
          );
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching warehouses:", error);
        toast.error("Error in fetching warehouses. Please try again");
        setLoading(false);
      });
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
      setMesssage("Are you sure you want to delete this warehouse?");
      setIsConfirmModal(true);
    } else {
      if (selectedWarehouses.length === 0) {
        toast.error("Please select at least one warehouse to delete.");
        return;
      }
      setMesssage(
        `Are you sure you want to delete ${selectedWarehouses.length} selected warehouse(s)?`
      );
      setIsConfirmModal(true);
    }
  };

  const handleYesConfirm = () => {
    if (confirmType === "single") handleDeleteWarehouse(warehouseIdState);
    else handleDeleteSelected();
  };

  const handleWarehouseCheckboxChange = (warehouseId) => {
    setSelectedWarehouses((prevSelected) => {
      const newSelected = prevSelected.includes(warehouseId)
        ? prevSelected.filter((id) => id !== warehouseId)
        : [...prevSelected, warehouseId];
      // Update select all checkbox state based on whether all warehouses are selected
      setSelectAll(newSelected.length === warehouses.length);

      return newSelected;
    });
  };

  const handleSelectAllChange = (e) => {
    const checked = e.target.checked;
    setSelectAll(checked);

    if (checked) {
      // Select all warehouses
      const allWarehouseIds = warehouses.map((warehouse) => warehouse.id);
      setSelectedWarehouses(allWarehouseIds);
    } else {
      // Deselect all warehouses
      setSelectedWarehouses([]);
    }
  };

  const handleSetIsAddWarehouse = () => {
    setIsAddWarehouse(true);
  };

  // Fetch items data
  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/items/all");

      if (response.data.status && response.data.data) {
        const allItems = response.data.data;
        setItems(allItems);
      } else {
        setItems([]);
      }
    } catch (error) {
      console.error("Error fetching items:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);
  const handleViewDetails = (warehouse, e) => {
    e.preventDefault();

    // Fetch detailed warehouse information
    api
      .get(`/api/warehouses/${warehouse.id}`)
      .then((response) => {
        if (response.data && response.data.status) {
          setWarehouseDetails({
            id: response.data.data.id,
            trno: response.data.data.trno,
            name: response.data.data.name,
            code: response.data.data.code,
            type: response.data.data.type,
            subLocations: response.data.data.subLocations,
            status: response.data.data.status,
          });
          setIsShowWarehouseDetails(true);

          // Initialize and show modal after a short delay to ensure DOM is updated
          setTimeout(() => {
            const modalElement = document.getElementById(
              "warehouseDetailModal"
            );
            if (modalElement) {
              const modal = new Modal(modalElement);
              modal.show();
            }
          }, 100);
        } else {
          console.error(
            "Error fetching warehouse details:",
            response.data.message || "Unknown error"
          );
          toast.error("Error fetching warehouse details. Please try again.");
        }
      })
      .catch((error) => {
        console.error("Error fetching warehouse details:", error);
        toast.error("Error fetching warehouse details. Please try again.");
      });
  };

  const handleEditDetails = (warehouse, e) => {
    e.preventDefault();

    // Prevent double-clicking
    if (isProcessing) return;
    setIsProcessing(true);

    api
      .get(`/api/warehouses/${warehouse.id}`)
      .then((response) => {
        if (response.data && response.data.status) {
          const warehouseData = response.data.data;
          console.log(warehouseData);
          setWarehouseDetails({
            id: warehouseData.id,
            trno: warehouseData.trno,
            name: warehouseData.name,
            code: warehouseData.code,
            type: warehouseData.type,
            subLocations: warehouseData.subLocations,
            status: warehouseData.status,
          });
          setIsEditWarehouseDetails(true);
          // Set status state to match warehouse status
          const currentStatus = warehouseData.status.toLowerCase();
          setStatus(currentStatus);
          setIsChecked(currentStatus === "active");

          setTimeout(() => {
            const modalElement = document.getElementById("warehouseEditModal");
            if (modalElement) {
              const modal = new Modal(modalElement);
              modal.show();
            }
            setIsProcessing(false);
          }, 100);
        } else {
          console.error(
            "Error fetching warehouse details:",
            response.data.message || "Unknown error"
          );
          toast.error("Error fetching warehouse details. Please try again.");
          setIsProcessing(false);
        }
      })
      .catch((error) => {
        console.error("Error fetching warehouse details:", error);
        toast.error("Error fetching warehouse details. Please try again.");
        setIsProcessing(false);
      });
  };

  const handleEditWarehouse = (e) => {
    e.preventDefault();

    // Clear previous errors
    setEditErrors({});

    const updatedData = {
      id: warehouseDetails.id,
      name: warehouseDetails.name,
      code: warehouseDetails.code,
      type: warehouseDetails.type,
      subLocations: warehouseDetails.subLocations,
      status: warehouseDetails.status,
    };

    api
      .put(`/api/warehouses/update/${warehouseDetails.id}`, updatedData)
      .then((response) => {
        console.log("Update warehouse response:", response.data);
        if (response.data && response.data.status) {
          toast.success("Warehouse updated successfully");
          // Refresh warehouse list
          fetchWarehouses();
          // Close the modal
          const modalElement = document.getElementById("warehouseEditModal");
          if (modalElement) {
            const modalInstance = Modal.getInstance(modalElement);
            if (modalInstance) {
              modalInstance.hide();
            }
          }
          // Reset states
          setIsEditWarehouseDetails(false);
          setIsProcessing(false);
          setEditErrors({});
        } else {
          console.error(
            "Error in update response:",
            response.data.message || "Unknown error"
          );
          // Handle validation errors from backend
          if (response.data.errors) {
            setEditErrors(response.data.errors);
          } else {
            toast.error(
              response.data.message ||
                "Error updating warehouse. Please try again."
            );
          }
        }
      })
      .catch((error) => {
        console.error("Error updating warehouse:", error);
        if (error.response && error.response.data) {
          // Handle validation errors from backend
          if (error.response.data.errors) {
            setEditErrors(error.response.data.errors);
          } else {
            toast.error(
              error.response.data.message ||
                "Error updating warehouse. Please try again."
            );
          }
        } else {
          toast.error("Error updating warehouse. Please try again.");
        }
      });
  };

  const handleAddWarehouse = (e) => {
    e.preventDefault();
    const newErrors = validateForm(formData);
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      e.preventDefault();
      // const finalData = {
      //   name: formData.name,
      //   code: formData.code,
      //   type: formData.type,
      //   subLocations,
      //   status: formData.status,
      // };
      const finalData = {
        name: formData.name,
        code: formData.code,
        type: formData.type,
        status: formData.status,
        subLocations: subLocations.name
          ? subLocations.map(({ name, racks, itemCode, itemName }) => ({
              subLocationCode: name,
              rackNumber: racks,
              itemCode,
              itemName,
            }))
          : [],
      };

      console.log(
        "Submitting add warehouse form: " + JSON.stringify(finalData)
      );
      api
        .post("/api/warehouses/add", finalData)
        .then((response) => {
          console.log("Response received:", response.data);
          if (response.data && response.data.status) {
            setIsAddSubLocation([{ id: 1 }]);
            toast.success("Warehouse added successfully:", response.data.data);
            // Reset form and close it
            handleReset(e);
            setIsAddWarehouse(false);
            // Refresh warehouse list
            fetchWarehouses();
          } else {
            console.error(
              "Error in response:",
              response.data.message || "Unknown error"
            );
          }
        })
        .catch((error) => {
          toast.error(
            error.response.data.message ||
              "Error in adding warehouse. Please try again."
          );
          console.error("Error adding warehouse:", error);
        });
    }
  };

  const validateForm = (data) => {
    const errors = {};
    if (!data.name || data.name.trim() === "") {
      errors.name = "Name is required";
    }
    if (!data.code || data.code.trim() === "") {
      errors.code = "Code is required";
    }
    return errors;
  };

  const handleReset = (e) => {
    e.preventDefault();
    setFormData({
      name: "",
      code: "",
      type: "",
      subLocations: isAddSubLocation.map((location) => ({
        id: location.id,
        name: "",
        itemName: "",
        itemCode: "",
        racks: "",
      })),
      status: "active",
    });
    setIsChecked(true);
    setStatus("active");
  };

  const handleDeleteWarehouse = (warehouseId) => {
    api
      .delete(`/api/warehouses/delete/${warehouseId}`)
      .then((response) => {
        console.log("Delete warehouse response:", response.data);
        if (response.data && response.data.status) {
          console.log("Warehouse deleted successfully:", response.data.message);
          toast.success("Successfully deleted the warehouse");
          // Refresh the warehouses list
          fetchWarehouses();
        } else {
          console.error(
            "Error in delete response:",
            response.data.message || "Unknown error"
          );
          toast.error(
            response.data.message ||
              "Error deleting warehouse. Please try again."
          );
        }
        setIsConfirmModal(false);
      })
      .catch((error) => {
        console.error("Error deleting warehouse:", error);
        toast.error("Error deleting warehouse. Please try again.");
        setIsConfirmModal(false);
      });
  };

  const handleDeleteSelected = () => {
    console.log("Sending delete request for warehouses:", selectedWarehouses);
    // Make API call to delete selected warehouses
    api
      .post("/api/warehouses/delete-multiple", selectedWarehouses)
      .then((response) => {
        console.log("Delete multiple response:", response.data);
        if (response.data && response.data.status) {
          console.log(
            "Selected warehouses deleted successfully:",
            response.data.message
          );
          // Clear selection state
          setSelectedWarehouses([]);
          setSelectAll(false);
          // Refresh the warehouses list
          fetchWarehouses();
          // Show success message
          toast.success(
            response.data.message ||
              `Successfully deleted ${selectedWarehouses.length} warehouse(s).`
          );
        } else {
          console.error(
            "Error in delete multiple response:",
            response.data.message || "Unknown error"
          );
          toast.error(
            response.data.message ||
              "Error deleting selected warehouses. Please try again."
          );
        }
        setIsConfirmModal(false);
      })
      .catch((error) => {
        console.error("Error deleting selected warehouses:", error);
        toast.error("Error deleting selected warehouses. Please try again.");
        setIsConfirmModal(false);
      });
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("");
  };

  // RBAC
  const ability = useContext(AbilityContext);

  const customStyles = {
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    menu: (base) => ({ ...base, zIndex: 9999 }),
    option: (provided) => ({
      ...provided,
      fontSize: "0.8rem",
      padding: "6px 10px",
    }),
  };

  // Excel import
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileUpload = (event) => {
    event.preventDefault();
    const file = event.target.files[0];

    if (file) {
      setSelectedFile(file);
    }
  };
const handleSaveToAPI = async () => {
  if (!selectedFile) {
    toast.error("Please select an excel file");
    return;
  }
  try {
    setIsLoading(true);

    const formData = new FormData();
    formData.append("file", selectedFile); // "file" must match @RequestParam name in backend

    await api.post("/api/warehouses/import-excel", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    fetchWarehouses();
    setIsLoading(false);
  } catch (error) {
    console.error("Error saving excel data:", error);
    toast.error(error.response?.data?.message || "Error saving excel data");
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
            <h3 className="nav-header header-style">Warehouse Master</h3>
            <p className="breadcrumb">
              <Link to="/dashboard">
                <i className="fas fa-home text-8"></i>
              </Link>{" "}
              <span className="ms-1 mt-1 text-small-gray">
                / Masters / Warehouse Master
              </span>
            </p>
          </div>

          {/* Add Warehouse Button */}

          {ability.can("edit", "Warehouse Master") && (
            <button
              className="btn btn-primary add-btn"
              onClick={handleSetIsAddWarehouse}
            >
              <i className="fa-solid fa-plus pe-1"></i> Add New Warehouse
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
            placeholder="Search by transaction no, name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filter-options">
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
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
      {isAddWarehouse && (
        <div className="table-form-container mx-2">
          <div className="form-header">
            <h2>
              <i className="fas fa-warehouse"></i> Add New Warehouse
            </h2>
            <button className="btn" onClick={() => setIsAddWarehouse(false)}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          {/* Form Fields */}
          <form
            autoComplete="off"
            className="padding-2"
            onSubmit={handleAddWarehouse}
          >
            <div className="form-grid border-bottom pt-0">
              <div className="row form-style">
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="trNo" className="form-label">
                    TRNO
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-hashtag position-absolute z-0 input-icon"></i>
                    <input
                      type="text"
                      className="form-control ps-5 text-font input-centered"
                      id="trNo"
                      placeholder="********************"
                      disabled
                    />
                  </div>
                </div>
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="name" className="form-label">
                    Name <span className="text-danger fs-6">*</span>
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-font position-absolute z-0 input-icon"></i>
                    <input
                      type="text"
                      className="form-control ps-5 text-font"
                      id="name"
                      placeholder="Enter warehouse name"
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
                  <label htmlFor="code" className="form-label">
                    Code <span className="text-danger fs-6">*</span>
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-qrcode position-absolute z-0 input-icon"></i>
                    <input
                      type="text"
                      className="form-control ps-5 text-font"
                      id="code"
                      placeholder="Enter warehouse code"
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
              </div>
              <div className="row form-style">
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="type" className="form-label">
                    Type <span className="text-danger fs-6">*</span>
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-layer-group position-absolute z-0 input-icon"></i>
                    <select
                      className={`form-select ps-5 text-font ${
                        formData.type ? "" : "text-secondary"
                      }`}
                      id="type"
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value })
                      }
                    >
                      <option value="" className="text-muted">
                        Select Type
                      </option>
                      <option value="IQC">IQC</option>
                      <option value="WIP">WIP</option>
                      <option value="STR">STR</option>
                      <option value="REJ">REJ</option>
                    </select>
                  </div>
                  {errors.code && (
                    <span className="error-message">{errors.type}</span>
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
              </div>

              <div className="subLocation-section">
                <div className="form-header">
                  <h2>
                    <i className="fa-solid fa-location-arrow"></i>
                    Add Sub Locations
                  </h2>
                </div>
                <div className="item-table-container mt-3">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Location Name</th>
                        <th>Item</th>
                        <th>Racks</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subLocations.map((location, index) => (
                        <tr key={location.id}>
                          <td>
                            <div className="position-relative w-100">
                              <i className="fa-solid fa-location-dot position-absolute z-0 input-icon"></i>
                              <input
                                className="form-control text-8 ps-5"
                                placeholder="Enter Sub Location"
                                value={location.name}
                                onChange={(e) =>
                                  handleLocationChange(
                                    index,
                                    "name",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          </td>
                          <td>
                            <Select
                              styles={customStyles}
                              classNamePrefix="react-select"
                              placeholder="Select Item"
                              value={
                                location.itemName
                                  ? items
                                      .map((item) => ({
                                        id: item.id,
                                        value: item.id,
                                        label: `(${item.code}) ${item.name}`,
                                        name: item.name, // for matching by name
                                      }))
                                      .find(
                                        (option) =>
                                          option.name === location.itemName
                                      ) || null
                                  : null
                              }
                              onChange={(selectedOption) => {
                                handleLocationChange(index, null, {
                                  itemName: selectedOption
                                    ? selectedOption.name
                                    : "",
                                  itemCode: selectedOption
                                    ? selectedOption.code
                                    : "",
                                });
                              }}
                              options={items.map((item) => ({
                                id: item.id,
                                value: item.id,
                                label: `(${item.code}) ${item.name}`,
                                name: item.name,
                                code: item.code,
                              }))}
                              isSearchable
                              menuPortalTarget={document.body}
                            />
                          </td>
                          <td>
                            <div className="position-relative w-100">
                              <i className="fa-solid fa-boxes-stacked position-absolute z-0 input-icon"></i>
                              <input
                                type="number"
                                className="form-control text-8 ps-5"
                                placeholder="Enter Racks"
                                value={location.racks}
                                onChange={(e) =>
                                  handleLocationChange(
                                    index,
                                    "racks",
                                    e.target.value
                                  )
                                }
                                min="0"
                              />
                            </div>
                          </td>
                          <td style={{ minWidth: "4rem" }}>
                            <button
                              type="button"
                              className="btn btn-outline-danger text-8"
                              onClick={() =>
                                handleDeleteSubLocation(location.id)
                              }
                              disabled={subLocations.length <= 1}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <button
                    type="button"
                    className="btn btn-secondary text-8 ms-2"
                    onClick={handleAddSubLocation}
                    // disabled={!isAllFilled || isLoading}
                  >
                    <i className="fas fa-plus me-2"></i>Add More
                  </button>
                </div>
              </div>
            </div>
            <div className="form-actions">
              <button
                className="btn btn-primary border border-0 text-8 px-3 fw-medium py-2 me-3 float-end"
                onClick={handleAddWarehouse}
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
                id="select-all-count"
                checked={selectAll}
                onChange={handleSelectAllChange}
              />
              <label htmlFor="select-all-count">
                {selectedWarehouses.length} Selected
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
                  const rowData = filteredWarehouses.filter((row) =>
                    selectedWarehouses.includes(row.id)
                  );
                  exportToExcel(rowData, "Warehouses");
                }}
              >
                <i className="fas fa-file-export me-1"></i>
                Export Selected
              </button>
            </div>
            {/* <button
              className="btn-action btn-danger"
              onClick={() => {
                setConfirmType("multi");
                handleShowConfirm("multi");
              }}
            >
              <i className="fas fa-trash"></i>
              Delete Selected
            </button> */}
          </div>
          <table>
            <thead>
              <tr>
                <th className="checkbox-cell">
                  <input type="checkbox" id="select-all-header" disabled />
                </th>
                <th>TRNO</th>
                <th>Warehouse Code</th>
                <th>Warehouse Name</th>
                <th>Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="text-break">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredWarehouses.length === 0 ? (
                <tr className="no-data-row">
                  <td colSpan="7" className="no-data-cell">
                    <div className="no-data-content">
                      <i className="fas fa-warehouse no-data-icon"></i>
                      <p className="no-data-text">
                        {warehouses.length === 0
                          ? "No warehouses found"
                          : "No matching warehouses found"}
                      </p>
                      <p className="no-data-subtext">
                        {warehouses.length === 0
                          ? 'Click the "Add New Warehouse" button to create your first warehouse'
                          : "Try adjusting your search or filter criteria"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredWarehouses.map((warehouse) => (
                  <tr key={warehouse.id}>
                    <td className="checkbox-cell ps-4">
                      <input
                        type="checkbox"
                        checked={selectedWarehouses.includes(warehouse.id)}
                        onChange={() =>
                          handleWarehouseCheckboxChange(warehouse.id)
                        }
                      />
                    </td>
                    <td className="ps-4">
                      <div>
                        <span>{warehouse.trno}</span>
                      </div>
                    </td>
                    <td className="ps-4">
                      <div>
                        <span>{warehouse.code}</span>
                      </div>
                    </td>
                    <td className="ps-4">
                      <div>
                        <span>{warehouse.name}</span>
                      </div>
                    </td>
                    <td className="ps-4">
                      <div>
                        <span>{warehouse.type}</span>
                      </div>
                    </td>
                    <td className="ps-4">
                      <div>
                        <span
                          className={`badge status ${warehouse.status.toLowerCase()}`}
                        >
                          {warehouse.status.charAt(0).toUpperCase() +
                            warehouse.status.slice(1).toLowerCase()}
                        </span>
                      </div>
                    </td>
                    <td className="actions ps-3">
                      <button
                        className="btn-icon btn-primary"
                        title="View Details"
                        onClick={(e) => handleViewDetails(warehouse, e)}
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      {ability.can("edit", "Warehouse Master") && (
                        <button
                          className="btn-icon btn-success"
                          title="Edit"
                          onClick={(e) => handleEditDetails(warehouse, e)}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                      )}
                      {/* {ability.can("edit", "Warehouse Master") && (
                        <button
                          className="btn-icon btn-danger"
                          title="Delete"
                          onClick={() => {
                            setWarehouseIdState(warehouse.id);
                            setConfirmType("single");
                            handleShowConfirm("single");
                          }}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      )} */}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="pagination-container">
            <div className="pagination-info">
              Showing {filteredWarehouses.length > 0 ? 1 : 0}-
              {filteredWarehouses.length} of {warehouses.length} entries
            </div>
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
        <div className="modal fade" id="warehouseConfirmModal" tabIndex="-1">
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

      {/* View Warehouse Details Modal */}
      {isShowWarehouseDetails && (
        <div
          className="modal fade"
          id="warehouseDetailModal"
          tabIndex="-1"
          aria-labelledby="warehouseDetailModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="warehouseDetailModalLabel">
                  <i className="fas fa-circle-info me-2"></i>
                  Warehouse Details
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
                    <strong>TRNO:</strong>
                    <span>{warehouseDetails.trno}</span>
                  </div>

                  <div className="detail-item">
                    <strong>Name:</strong>
                    <span>{warehouseDetails.name}</span>
                  </div>

                  <div className="detail-item">
                    <strong>Code:</strong>
                    <span>{warehouseDetails.code}</span>
                  </div>

                  <div className="detail-item">
                    <strong>Type:</strong>
                    <span>{warehouseDetails.type}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Status:</strong>
                    <span
                      className={`badge status ${warehouseDetails.status?.toLowerCase()} w-50`}
                    >
                      {warehouseDetails.status?.charAt(0).toUpperCase() +
                        warehouseDetails.status?.slice(1)}
                    </span>
                  </div>
                  {/* Sub Locations Section */}
                  {warehouseDetails.subLocations &&
                  warehouseDetails.subLocations.length > 0 ? (
                    <div className="mt-3 detail-item">
                      <strong className="mb-2">Sub Locations:</strong>
                      {warehouseDetails.subLocations.map((subLoc) => (
                        <div
                          key={subLoc.id}
                          className="card p-2 mb-2 border shadow-sm"
                          style={{ fontSize: "0.9rem" }}
                        >
                          <div>
                            <strong>Location:</strong> {subLoc.subLocationCode}
                          </div>
                          <div>
                            <strong>Rack No:</strong> {subLoc.rackNumber}
                          </div>
                          <div>
                            <strong>Item Code:</strong> {subLoc.itemCode}
                          </div>
                          <div>
                            <strong>Item Name:</strong> {subLoc.itemName}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-3 detail-item">
                      <strong className="mb-2">Sub Locations:</strong>
                      <span>No sub locations added</span>
                    </div>
                  )}
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
                  <i className="fa-solid fa-xmark me-1"></i>Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Warehouse Details Modal */}
      {isEditWarehouseDetails && (
        <div
          className="modal fade"
          id="warehouseEditModal"
          tabIndex="-1"
          aria-labelledby="warehouseEditModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="warehouseEditModalLabel">
                  <i className="fa-solid fa-pencil me-2 font-1"></i>
                  Edit Warehouse
                </h5>
                <button
                  type="button"
                  className="btn"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                  onClick={() => {
                    setIsProcessing(false);
                    setIsEditWarehouseDetails(false);
                  }}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              {/* Modal Body */}
              <div className="modal-body">
                <div className="table-form-container mx-2">
                  {/* Form Fields */}
                  <form
                    autoComplete="off"
                    className="padding-2"
                    onSubmit={handleEditWarehouse}
                  >
                    <div className="form-grid pt-0">
                      <div className="row form-style">
                        <div className="col-4 d-flex flex-column form-group">
                          <label htmlFor="trNo" className="form-label">
                            TRNO
                          </label>
                          <div className="position-relative w-100">
                            <i className="fas fa-hashtag position-absolute z-0 input-icon"></i>
                            <input
                              type="text"
                              className="form-control ps-5 text-font input-centered"
                              id="trNo"
                              value={warehouseDetails.trno}
                              disabled
                            />
                          </div>
                        </div>
                        <div className="col-4 d-flex flex-column form-group">
                          <label htmlFor="name" className="form-label">
                            Name <span className="text-danger fs-6">*</span>
                          </label>
                          <div className="position-relative w-100">
                            <i className="fas fa-font position-absolute z-0 input-icon"></i>
                            <input
                              type="text"
                              className={`form-control ps-5 text-font ${
                                editErrors.name ? "is-invalid" : ""
                              }`}
                              id="name"
                              placeholder="Enter warehouse name"
                              value={warehouseDetails.name}
                              onChange={(e) =>
                                setWarehouseDetails({
                                  ...warehouseDetails,
                                  name: e.target.value,
                                })
                              }
                            />
                          </div>
                          {editErrors.name && (
                            <span className="error-message">
                              {editErrors.name}
                            </span>
                          )}
                        </div>
                        <div className="col-4 d-flex flex-column form-group">
                          <label htmlFor="code" className="form-label">
                            Code <span className="text-danger fs-6">*</span>
                          </label>
                          <div className="position-relative w-100">
                            <i className="fas fa-qrcode position-absolute z-0 input-icon"></i>
                            <input
                              type="text"
                              className={`form-control ps-5 text-font ${
                                editErrors.code ? "is-invalid" : ""
                              }`}
                              id="code"
                              placeholder="Enter warehouse code"
                              value={warehouseDetails.code}
                              onChange={(e) =>
                                setWarehouseDetails({
                                  ...warehouseDetails,
                                  code: e.target.value,
                                })
                              }
                            />
                          </div>
                          {editErrors.code && (
                            <span className="error-message">
                              {editErrors.code}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="row form-style">
                        <div className="col-4 d-flex flex-column form-group">
                          <label htmlFor="type" className="form-label">
                            Type <span className="text-danger fs-6">*</span>
                          </label>
                          <div className="position-relative w-100">
                            <i className="fas fa-layer-group position-absolute z-0 input-icon"></i>
                            <select
                              className="form-control text-font switch-padding"
                              id="type"
                              value={warehouseDetails.type}
                              onChange={(e) =>
                                setWarehouseDetails({
                                  ...warehouseDetails,
                                  type: e.target.value,
                                })
                              }
                            >
                              <option value="">Select Type</option>
                              <option value="IQC">IQC</option>
                              <option value="WIP">WIP</option>
                              <option value="STR">STR</option>
                              <option value="REJ">REJ</option>
                            </select>
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
                                id="editStatusSwitch"
                                checked={isChecked}
                                onChange={(e) => {
                                  const newStatus = e.target.checked
                                    ? "active"
                                    : "inactive";
                                  setIsChecked(e.target.checked);
                                  setStatus(newStatus);
                                  setWarehouseDetails((prev) => ({
                                    ...prev,
                                    status: newStatus,
                                  }));
                                }}
                              />
                              <label
                                className="form-check-label"
                                htmlFor="editStatusSwitch"
                              ></label>
                            </div>
                            <select
                              className="form-control text-font switch-padding"
                              id="editStatus"
                              value={status}
                              onChange={(e) => {
                                const newStatus = e.target.value;
                                setStatus(newStatus);
                                setIsChecked(newStatus === "active");
                                setWarehouseDetails((prev) => ({
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
                  </form>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-primary add-btn"
                  data-bs-dismiss="modal"
                  onClick={(e) => {
                    document.activeElement?.blur();
                    handleEditWarehouse(e);
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

export default WarehouseMaster;
