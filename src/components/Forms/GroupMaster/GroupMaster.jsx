import React, { useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "../../../context/AppContext";
import api from "../../../services/api";
import { Link } from "react-router-dom";
import { Modal } from "bootstrap";
import { toast } from "react-toastify";
import { AbilityContext } from "../../../utils/AbilityContext";
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import exportToExcel from "../../../utils/exportToExcel";

const GroupMaster = () => {
  const [errors, setErrors] = useState({});
  const { isAddGroup, setIsAddGroup } = useContext(AppContext);
  const groupModalRef = useRef(null);
  const groupEditModalRef = useRef(null);
  const [isShowGroupDetails, setIsShowGroupDetails] = useState(false);
  const [isEditGroupDetails, setIsEditGroupDetails] = useState(false);
  const [groupDetails, setGroupDetails] = useState({
    id: "",
    trno: "",
    name: "",
    groupCode: "",
    status: "",
  });
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [status, setStatus] = useState("active");
  const [isChecked, setIsChecked] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    groupCode: "",
    status: "active",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Data loading state
  const [groups, setGroups] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState(null);

  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 0,
  });

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Edit switch state
  const [editSwitchChecked, setEditSwitchChecked] = useState(true);

  // Confirm modal states
  const [message, setMesssage] = useState("");
  const [confirmState, setConfirmState] = useState(false);
  const [confirmType, setConfirmType] = useState("");
  const [groupIdState, setGroupIdState] = useState("");
  const [isConfirmModal, setIsConfirmModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(null);

  // Confirm useEffect for confirm modal
  useEffect(() => {
    let modal = null;

    if (isConfirmModal) {
      const modalElement = document.getElementById("groupConfirmModal");

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
      setMesssage("Are you sure you want to delete this group?");
      setIsConfirmModal(true);
    } else {
      if (selectedGroups.length === 0) {
        return;
      }
      setMesssage(
        `Are you sure you want to delete ${selectedGroups.length} selected group(s)?`
      );
      setIsConfirmModal(true);
    }
  };

  const handleYesConfirm = () => {
    if (confirmType === "single") handleDeleteSingle(groupIdState);
    else handleDeleteSelected();
  };

  // Load groups data
  const loadGroups = async () => {
    setDataLoading(true);
    setDataError(null);

    try {
      const response = await api.get("/api/group/all");
      const allGroups = response.data.data || [];

      const filteredGroups = allGroups.filter((group) => {
        const searchFields = [
          group.trno?.toLowerCase() || "",
          group.name?.toLowerCase() || "",
          group.status?.toLowerCase() || "",
        ];

        const searchTermLower = searchTerm.toLowerCase();
        const matchesSearch =
          searchTerm === "" ||
          searchFields.some((field) => field.includes(searchTermLower));

        const matchesStatus =
          !statusFilter ||
          group.status?.toLowerCase() === statusFilter.toLowerCase();

        return matchesSearch && matchesStatus;
      });

      const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage;
      const endIndex = startIndex + pagination.itemsPerPage;
      const currentPageItems = filteredGroups.slice(startIndex, endIndex);

      setGroups(currentPageItems);

      setPagination((prev) => ({
        ...prev,
        totalItems: filteredGroups.length,
        totalPages: Math.ceil(filteredGroups.length / prev.itemsPerPage),
      }));
    } catch (err) {
      console.error("Error loading groups:", err);
      setDataError(err.response?.data?.message || "Error loading groups");
      toast.error("Error in getting groups list. Please try again.");
      setGroups([]);
    } finally {
      setDataLoading(false);
    }
  };

  // Load data on component mount and when pagination, search or filter changes
  useEffect(() => {
    loadGroups();
  }, [
    pagination.currentPage,
    pagination.itemsPerPage,
    searchTerm,
    statusFilter,
  ]);

  const handleGroupCheckboxChange = (groupId) => {
    setSelectedGroups((prevSelected) =>
      prevSelected.includes(groupId)
        ? prevSelected.filter((id) => id !== groupId)
        : [...prevSelected, groupId]
    );
  };

  const handleSelectAllChange = (e) => {
    const checked = e.target.checked;
    setSelectAll(checked);
    if (checked) {
      const allGroupIds = groups.map((group) => group.id);
      setSelectedGroups(allGroupIds);
    } else {
      setSelectedGroups([]);
    }
  };

  const handleDeleteSelected = async () => {
    setDeleteLoading(true);
    setDataError(null);
    try {
      // Delete groups one by one
      for (const groupId of selectedGroups) {
        await api.delete(`/api/group/delete/${groupId}`);
      }
      toast.success("Groups deleted successfully");
      // Clear selection and reload data
      setSelectedGroups([]);
      setSelectAll(false);
      loadGroups();
      setIsConfirmModal(false);
    } catch (err) {
      toast.error("Error in deleting groups");
      console.error("Error deleting groups:", err);
      setDataError(err.response?.data?.message || "Error deleting groups");
      setIsConfirmModal(false);
    } finally {
      setDeleteLoading(false);
      setIsConfirmModal(false);
    }
  };

  const handleDeleteSingle = async (groupId) => {
    setDataLoading(true);
    setDataError(null);

    try {
      await api.delete(`/api/group/delete/${groupId}`);

      // If the deleted group was selected, remove it from selection
      if (selectedGroups.includes(groupId)) {
        setSelectedGroups((prev) => prev.filter((id) => id !== groupId));
      }
      toast.success("Group deleted successfully");
      // Reload data
      loadGroups();
      setIsConfirmModal(false);
    } catch (err) {
      toast.error("Error in deleting group. Please try agian");
      console.error("Error deleting group:", err);
      setDataError(err.response?.data?.message || "Error deleting group");
      setIsConfirmModal(false);
    } finally {
      setIsConfirmModal(false);
      setDataLoading(false);
    }
  };

  const handleAddGroups = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const finalData = {
      name: formData.name,
      groupCode: formData.groupCode,
      status: formData.status,
    };

    try {
      const response = await api.post("/api/group/save", finalData);
      console.log("Group added successfully:", response.data);
      toast.success("Group added successfully");
      setFormData({
        name: "",
        groupCode: "",
        status: "active",
      });
      setIsChecked(true);
      setIsAddGroup(false);
      // Reload the groups data after adding a new group
      loadGroups();
    } catch (err) {
      toast.error("Error in adding group");
      console.error("Error adding group:", err);
      setError(err.response?.data?.message || "Error adding group");
    } finally {
      setLoading(false);
    }
  };
  const validateForm = (data) => {
    const errors = {};

    if (!data.name.trim()) {
      errors.name = "Group name is required";
    }
    if (!data.groupCode.trim()) {
      errors.groupCode = "Code is required";
    }

    return errors;
  };

  const handleEditGroup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const finalData = {
      name: groupDetails.name,
      groupCode: groupDetails.groupCode,
      status: groupDetails.status,
    };

    try {
      const response = await api.put(
        `/api/group/update/${groupDetails.id}`,
        finalData
      );
      console.log("Group updated successfully:", response.data);
      toast.success("Group updated successfully");
      // Close the bootstrap modal properly
      if (groupEditModalRef.current) {
        const bsModal = Modal.getInstance(groupEditModalRef.current);
        bsModal?.hide();
      }

      // Reset states
      setIsEditGroupDetails(false);
      setError(null);

      // Reload the groups data to show updated information
      loadGroups();
    } catch (err) {
      toast, error("Error in updating group");
      console.error("Error updating group:", err);
      setError(err.response?.data?.message || "Error updating group");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (group, e) => {
    e.preventDefault();
    try {
      const response = await api.get(`/api/group/${group.id}`);
      console.log(response.data.data);
      setGroupDetails(response.data.data);
      setIsShowGroupDetails(true);
    } catch (err) {
      toast.error("Error in fetching group details");
      console.error("Error fetching group details:", err);
      setDataError(
        err.response?.data?.message || "Error fetching group details"
      );
    }
  };

  const handleEditDetails = async (group, e) => {
    e.preventDefault();
    try {
      const response = await api.get(`/api/group/${group.id}`);
      setGroupDetails(response.data.data);
      setEditSwitchChecked(
        response.data.data.status.toLowerCase() === "active"
      );
      setIsEditGroupDetails(true);
    } catch (err) {
      toast.error("Error in fetching group details");
      console.error("Error fetching group details:", err);
      setDataError(
        err.response?.data?.message || "Error fetching group details"
      );
    }
  };

  useEffect(() => {
    if (isShowGroupDetails && groupModalRef.current) {
      const bsModal = new Modal(groupModalRef.current, {
        backdrop: "static",
      });
      bsModal.show();

      // Optional: hide modal state when it's closed
      groupModalRef.current.addEventListener("hidden.bs.modal", () =>
        setIsShowGroupDetails(false)
      );
    } else if (isEditGroupDetails && groupEditModalRef.current) {
      const bsModal = new Modal(groupEditModalRef.current, {
        backdrop: "static",
      });
      bsModal.show();

      // Hide modal state when it's closed
      groupEditModalRef.current.addEventListener("hidden.bs.modal", () =>
        setIsEditGroupDetails(false)
      );
    }
  }, [isShowGroupDetails, isEditGroupDetails]);

  const handleReset = (e) => {
    e.preventDefault();
    setFormData({
      name: "",
      groupCode: "",
      status: "active",
    });
    setStatus("active");
    setIsChecked(true);
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setPagination((prev) => ({
      ...prev,
      currentPage: newPage,
    }));
  };

  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = parseInt(e.target.value, 10);
    setPagination((prev) => ({
      ...prev,
      itemsPerPage: newItemsPerPage,
      currentPage: 1, // reset to first page
    }));
  };
  // Handle search and filter
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPagination({ ...pagination, currentPage: 1 }); // Reset to first page when searching
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
    setPagination({ ...pagination, currentPage: 1 }); // Reset to first page when filtering
  };

  const handleSetIsAddGroup = () => {
    setIsAddGroup(true);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setStatusFilter("");
    setSearchTerm("");
  };

  // Filter types based on search term and status filter
  const filteredTypes = groups.filter((group) => {
    // Search term filter
    const searchFields = [
      group.trno?.toLowerCase() || "",
      group.name?.toLowerCase() || "",
      group.status?.toLowerCase() || "",
    ];

    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch =
      searchTerm === "" ||
      searchFields.some((field) => field.includes(searchTermLower));

    // Status filter
    const matchesStatus =
      !statusFilter ||
      group.status?.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Sort types by trno
  const sortedFilteredTypes = [...filteredTypes].sort((a, b) => {
    return (a.trno || "").localeCompare(b.trno || "");
  });

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
      const workbook = XLSX.read(arrayBuffer, { type: "array" }); // 'array' instead of 'binary'
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const parsedData = XLSX.utils.sheet_to_json(worksheet);
      // console.log("parsedData: " + JSON.stringify(parsedData));
      setExcelData(parsedData);
    };

    reader.readAsArrayBuffer(file);
  };

  const handleSaveToAPI = async () => {
    if (excelData.length === 0) {
      toast.error("Please select an excel file");
      return;
    }

    setIsLoading(true);

    const validRows = [];
    const invalidRows = [];

    for (let i = 0; i < excelData.length; i++) {
      const row = excelData[i];

      const payload = {
        name: row.name,
        status: row.status,
        groupCode: row.groupCode,
      };

      const isInvalid = Object.values(payload).some(
        (value) => value === null || value === undefined || value === ""
      );

      if (isInvalid) {
        invalidRows.push({ rowNumber: i + 2, rowData: payload }); // +2 for Excel-like row number
      } else {
        validRows.push(payload);
      }
    }
    let partialSuccess = false;
    try {
      for (const row of validRows) {
        await api.post("/api/group/save", row);
      }
      partialSuccess = true;
      if (invalidRows.length > 0) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Invalid Group Rows");

        // Add header
        worksheet.addRow(["Row No.", "Name", "Status", "Group Code"]);

        // Add invalid rows with red cell highlight
        invalidRows.forEach(({ rowNumber, rowData }) => {
          const rowValues = [
            rowNumber,
            rowData.name,
            rowData.status,
            rowData.groupCode,
          ];
          const newRow = worksheet.addRow(rowValues);

          rowValues.forEach((val, colIdx) => {
            const cell = newRow.getCell(colIdx + 1);
            if (val === null || val === undefined || val === "") {
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

        // Auto-size columns
        worksheet.columns.forEach((col) => {
          col.width = 20;
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        saveAs(blob, "GroupMaster_Invalid_Rows.xlsx");

        toast.warn(
          "Some rows were skipped. Excel file downloaded with details."
        );
      } else {
        toast.success("Excel imported successfully");
      }

      loadGroups();
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
            <h3 className="nav-header header-style">Group Master</h3>
            <p className="breadcrumb">
              <Link to="/dashboard">
                <i className="fas fa-home text-8"></i>
              </Link>{" "}
              <span className="ms-1 mt-1 text-small-gray">
                / Masters / Group Master
              </span>
            </p>
          </div>

          {/* Add Group Button */}

          {ability.can("edit", "Group Master") && (
            <button
              className="btn btn-primary add-btn"
              onClick={handleSetIsAddGroup}
            >
              <i className="fa-solid fa-plus pe-1"></i> Add New Group
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
            placeholder="Search by groups..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <div className="filter-options">
          <select
            className="filter-select"
            value={statusFilter}
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
      {isAddGroup && (
        <div className="table-form-container mx-2">
          <div className="form-header">
            <h2>
              <i className="fas fa-plus pe-1"></i> Add New Group
            </h2>
            <button className="btn" onClick={() => setIsAddGroup(false)}>
              <i className="fas fa-times"></i>
            </button>
          </div>

          {/* Form Fields */}
          <form
            autoComplete="off"
            className="padding-2"
            onSubmit={handleAddGroups}
          >
            <div className="form-grid border-bottom pt-0">
              <div className="row form-style">
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="trno" className="form-label">
                    TRNO
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-user position-absolute z-0 input-icon"></i>
                    <input
                      type="text"
                      className="form-control ps-5 text-font input-centered"
                      id="trno"
                      placeholder="*******************"
                      disabled
                    />
                  </div>
                </div>
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="name" className="form-label">
                    Name <span className="text-danger fs-6">*</span>
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-user position-absolute z-0 input-icon"></i>
                    <input
                      type="text"
                      className="form-control ps-5 text-font"
                      id="name"
                      placeholder="Enter group name"
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
                  <label htmlFor="groupCode" className="form-label">
                    Code <span className="text-danger fs-6">*</span>
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-user position-absolute z-0 input-icon"></i>
                    <input
                      type="text"
                      className="form-control ps-5 text-font"
                      id="groupCode"
                      placeholder="Enter code"
                      value={formData.groupCode}
                      onChange={(e) =>
                        setFormData({ ...formData, groupCode: e.target.value })
                      }
                    />
                  </div>
                  {errors.name && (
                    <span className="error-message">{errors.groupCode}</span>
                  )}
                </div>
                <div className="row form-style">
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
              </div>
            </div>
            <div className="form-actions">
              {error && (
                <div className="alert alert-danger mb-3" role="alert">
                  {error}
                </div>
              )}
              <button
                type="submit"
                className="btn btn-primary border border-0 text-8 px-3 fw-medium py-2 me-3 float-end"
                disabled={loading}
              >
                {loading ? (
                  <span>
                    <i className="fa-solid fa-spinner fa-spin me-1"></i>{" "}
                    Saving...
                  </span>
                ) : (
                  <span>
                    <i className="fa-solid fa-floppy-disk me-1"></i> Save
                    Changes
                  </span>
                )}
              </button>
              <button
                className="btn btn-secondary border border-0 text-8 px-3 fw-medium py-2 bg-secondary me-3 float-end"
                onClick={handleReset}
                type="button"
                disabled={loading}
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
            {/* Left side - selected count */}
            <div className="selected-count d-flex align-items-center gap-2">
              <input
                type="checkbox"
                id="select-all"
                checked={selectAll}
                onChange={handleSelectAllChange}
              />
              <label htmlFor="select-all">
                {selectedGroups.length} Selected
              </label>
            </div>

            {/* Right side - buttons and file input */}
            <div className="d-flex align-items-center gap-2 ms-auto">
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
              <button
                className="btn btn-outline-success text-8"
                onClick={() => {
                  const rowData = sortedFilteredTypes.filter((row) =>
                    selectedGroups.includes(row.id)
                  );
                  exportToExcel(rowData, "Groups");
                }}
              >
                <i className="fas fa-file-export me-1"></i>
                Export Selected
              </button>
              <button
                className="btn-action btn-danger text-8"
                onClick={() => {
                  setConfirmType("multi");
                  handleShowConfirm("multi");
                }}
                disabled={deleteLoading || selectedGroups.length === 0}
              >
                {deleteLoading ? (
                  <span>
                    <i className="fa-solid fa-spinner fa-spin me-1"></i>{" "}
                    Deleting...
                  </span>
                ) : (
                  <span>
                    <i className="fas fa-trash me-1"></i> Delete Selected
                  </span>
                )}
              </button>
            </div>
          </div>

          {dataError && (
            <div className="alert alert-danger" role="alert">
              {dataError}
            </div>
          )}
          <table>
            <thead>
              <tr>
                <th className="checkbox-cell">
                  <input type="checkbox" disabled />
                </th>
                <th>TRNO</th>
                <th>Group Name</th>
                <th>Group Code</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="text-break">
              {dataLoading ? (
                <tr>
                  <td colSpan="5" className="text-center py-3">
                    <i className="fa-solid fa-spinner fa-spin me-2"></i>{" "}
                    Loading...
                  </td>
                </tr>
              ) : sortedFilteredTypes.length === 0 ? (
                <tr className="no-data-row">
                  <td colSpan="5" className="no-data-cell">
                    <div className="no-data-content">
                      <i className="fas fa-layer-group no-data-icon"></i>
                      <p className="no-data-text">No groups found</p>
                      <p className="no-data-subtext">
                        Click the "Add New Group" button to create your first
                        group
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedFilteredTypes.map((group) => (
                  <tr key={group.id}>
                    <td className="checkbox-cell ps-4">
                      <input
                        type="checkbox"
                        checked={selectedGroups.includes(group.id)}
                        onChange={() => handleGroupCheckboxChange(group.id)}
                      />
                    </td>
                    <td className="ps-4">
                      <div>
                        <span>{group.trno}</span>
                      </div>
                    </td>
                    <td className="ps-4">
                      <div>
                        <span>{group.name}</span>
                      </div>
                    </td>
                    <td className="ps-4">
                      <div>
                        <span>{group.groupCode}</span>
                      </div>
                    </td>
                    <td className="ps-4">
                      <span
                        className={`badge status ${group.status.toLowerCase()}`}
                      >
                        {group.status}
                      </span>
                    </td>
                    <td className="actions ps-3">
                      <button
                        className="btn-icon btn-primary"
                        title="View Details"
                        onClick={(e) => handleViewDetails(group, e)}
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      {ability.can("edit", "Group Master") && (
                        <button
                          className="btn-icon btn-success"
                          title="Edit"
                          onClick={(e) => handleEditDetails(group, e)}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                      )}
                      {ability.can("edit", "Group Master") && (
                        <button
                          className="btn-icon btn-danger"
                          title="Delete"
                          onClick={() => {
                            setGroupIdState(group.id);
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
              {groups.length > 0
                ? (pagination.currentPage - 1) * pagination.itemsPerPage + 1
                : 0}
              -
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
              {[...Array(pagination.totalPages).keys()].map((page) => (
                <button
                  key={page + 1}
                  className={`btn-page ${
                    pagination.currentPage === page + 1 ? "active" : ""
                  }`}
                  onClick={() => handlePageChange(page + 1)}
                >
                  {page + 1}
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
        <div className="modal fade" id="groupConfirmModal" tabIndex="-1">
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

      {/* View Group Details Modal */}
      {isShowGroupDetails && (
        <div
          className="modal fade"
          ref={groupModalRef}
          id="groupDetailModal"
          tabIndex="-1"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fa-solid fa-circle-info me-2"></i>View Group
                  Details
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
                    <span>{groupDetails.trno}</span>
                  </div>

                  <div className="detail-item">
                    <strong>Group Name:</strong>
                    <span>{groupDetails.name}</span>
                  </div>

                  <div className="detail-item">
                    <strong>Group Code:</strong>
                    <span>{groupDetails.groupCode}</span>
                  </div>

                  <div className="detail-item">
                    <strong>Status:</strong>
                    <span
                      className={`badge status ${groupDetails.status?.toLowerCase()} w-50`}
                    >
                      {groupDetails.status?.charAt(0).toUpperCase() +
                        groupDetails.status?.slice(1)}
                    </span>
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
                  <i className="fa-solid fa-xmark me-1"></i>Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Group Details Modal */}
      {isEditGroupDetails && (
        <div
          className="modal fade"
          ref={groupEditModalRef}
          id="groupEditModal"
          tabIndex="-1"
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fa-solid fa-pencil me-2 font-1"></i>Edit Group
                </h5>
                <button
                  type="button"
                  className="btn"
                  onClick={() => {
                    if (groupEditModalRef.current) {
                      const bsModal = Modal.getInstance(
                        groupEditModalRef.current
                      );
                      bsModal?.hide();
                    }
                    setIsEditGroupDetails(false);
                    setError(null);
                  }}
                  aria-label="Close"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              {/* Modal Body */}
              <div className="modal-body">
                <form
                  autoComplete="off"
                  className="padding-2"
                  onSubmit={handleEditGroup}
                >
                  <div className="form-grid pt-0">
                    <div className="row form-style">
                      <div className="col-4 d-flex flex-column form-group">
                        <label htmlFor="trno" className="form-label">
                          TRNO
                        </label>
                        <div className="position-relative w-100">
                          <i className="fas fa-user position-absolute z-0 input-icon"></i>
                          <input
                            type="text"
                            className="form-control ps-5 text-font input-centered"
                            id="trno"
                            value={groupDetails.trno}
                            disabled
                          />
                        </div>
                      </div>
                      <div className="col-4 d-flex flex-column form-group">
                        <label htmlFor="name" className="form-label">
                          Name <span className="text-danger fs-6">*</span>
                        </label>
                        <div className="position-relative w-100">
                          <i className="fas fa-user position-absolute z-0 input-icon"></i>
                          <input
                            type="text"
                            className="form-control ps-5 text-font"
                            id="name"
                            placeholder="Enter group name"
                            value={groupDetails.name}
                            onChange={(e) =>
                              setGroupDetails({
                                ...groupDetails,
                                name: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className="col-4 d-flex flex-column form-group">
                        <label htmlFor="groupCode" className="form-label">
                          Code <span className="text-danger fs-6">*</span>
                        </label>
                        <div className="position-relative w-100">
                          <i className="fas fa-user position-absolute z-0 input-icon"></i>
                          <input
                            type="text"
                            className="form-control ps-5 text-font"
                            id="groupCode"
                            placeholder="Enter code"
                            value={groupDetails.groupCode}
                            onChange={(e) =>
                              setGroupDetails({
                                ...groupDetails,
                                groupCode: e.target.value,
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
                              id="editSwitchCheckChecked"
                              checked={editSwitchChecked}
                              onChange={(e) => {
                                const newStatus = e.target.checked
                                  ? "active"
                                  : "inactive";
                                setEditSwitchChecked(e.target.checked);
                                setGroupDetails({
                                  ...groupDetails,
                                  status: newStatus,
                                });
                              }}
                            />
                            <label
                              className="form-check-label"
                              htmlFor="editSwitchCheckChecked"
                            ></label>
                          </div>
                          <select
                            className="form-control text-font switch-padding"
                            id="status"
                            value={groupDetails.status}
                            onChange={(e) => {
                              const newStatus = e.target.value;
                              setEditSwitchChecked(newStatus === "active");
                              setGroupDetails({
                                ...groupDetails,
                                status: newStatus,
                              });
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
              <div className="modal-footer">
                {error && (
                  <div className="alert alert-danger w-100" role="alert">
                    {error}
                  </div>
                )}
                <button
                  className="btn btn-primary add-btn"
                  onClick={(e) => {
                    handleEditGroup(e);
                  }}
                  disabled={loading}
                >
                  {loading ? (
                    <span>
                      <i className="fa-solid fa-spinner fa-spin me-1"></i>{" "}
                      Saving...
                    </span>
                  ) : (
                    <span>
                      <i className="fa-solid fa-floppy-disk me-1"></i> Save
                      Changes
                    </span>
                  )}
                </button>
                <button
                  className="btn btn-secondary add-btn"
                  onClick={() => {
                    if (groupEditModalRef.current) {
                      const bsModal = Modal.getInstance(
                        groupEditModalRef.current
                      );
                      bsModal?.hide();
                    }
                    setIsEditGroupDetails(false);
                    setError(null);
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

export default GroupMaster;
