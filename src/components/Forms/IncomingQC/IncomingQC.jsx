import React, { useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../../services/api";
import { Modal } from "bootstrap";

const IncomingQC = () => {
  const [isShowQualityCheckForm, setIsShowQualityCheckForm] = useState(false);
  const [searchBatchNo, setSearchBatchNo] = useState("");
  const [iqc, setIqc] = useState([]);
  const [passFailQC, setPassFailQC] = useState([]);
  const [batchDetails, setBatchDetails] = useState([]);
  const [isFail, setIsFail] = useState(false);
  const [isPass, setIsPass] = useState("");
  const passRef = useRef(null);
  const failRef = useRef(null);
  const [defectCategory, setDefectCategory] = useState("");
  const [remarks, setRemarks] = useState("");

  // select QC to be deleted
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  // Confirm modal states
  const [message, setMesssage] = useState("");
  const [confirmState, setConfirmState] = useState(false);
  const [confirmType, setConfirmType] = useState("");
  const [partnerIdState, setPartnerIdState] = useState("");
  const [isConfirmModal, setIsConfirmModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(null);
  const [selectedQCs, setSelectedQCs] = useState([]);

  // Add new state for search-bar and filters
  const [searchQuery, setSearchQuery] = useState("");
  const [vendorFilter, setVendorFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("");
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [totalItems, setTotalItems] = useState(0);

  /* Press Alt + P to pass transaction. */
  useHotkeys(
    ["alt+p"],
    (e) => {
      e.preventDefault();

      passRef.current?.focus();

      return false;
    },
    []
  );

  /* Press Alt + P to pass transaction. */
  useHotkeys(
    ["alt+f"],
    (e) => {
      e.preventDefault();

      failRef.current?.focus();

      return false;
    },
    []
  );

  // Add useEffect for filtering
  useEffect(() => {
    filterVendors();
  }, [iqc, searchQuery, vendorFilter, typeFilter, warehouseFilter]);

  // Function to filter vendors
  const filterVendors = () => {
    let filtered = [...iqc];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (iqc) =>
          iqc.itemName?.toLowerCase().includes(query) ||
          iqc.itemCode?.toLowerCase().includes(query) ||
          iqc.batchNumber?.toLowerCase().includes(query) ||
          iqc.vendorName?.toLowerCase().includes(query) ||
          iqc.vendorCode?.toLowerCase().includes(query) ||
          iqc.quantity?.toLowerCase().includes(query)
      );
    }

    // Apply type filter
    if (vendorFilter) {
      filtered = filtered.filter(
        (vendor) =>
          vendor.vendorName.toLowerCase() === vendorFilter.toLowerCase()
      );
    }

    // Apply status filter
    if (typeFilter) {
      filtered = filtered.filter(
        (type) => type.status.toLowerCase() === typeFilter.toLowerCase()
      );
    }

    setFilteredVendors(filtered);
    setTotalItems(filtered.length);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle type filter change
  const handleVendorFilterChange = (e) => {
    setVendorFilter(e.target.value);
  };

  // Handle status filter change
  const handleTypeFilterChange = (e) => {
    setTypeFilter(e.target.value);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setTypeFilter("");
    setVendorFilter("");
  };

  // Fetch pending IQC from API
  const fetchPendingQC = async () => {
    try {
      const response = await api.get("/api/receipt/pending-qc");
      setIqc(response.data.data);
    } catch (error) {
      toast.error("Error in fetching pending IQC");
      console.error("Error fetching pending IQC:", error);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchPendingQC();
  }, []);

  // Fetch pass/fail IQC from API
  const fetchPassFailQC = async () => {
    try {
      const response = await api.get("/api/receipt/qc-status/result");
      setPassFailQC(response.data.data);
    } catch (error) {
      toast.error("Error in fetching pass/fail IQC");
      console.error("Error fetching pass/fail IQC:", error);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchPassFailQC();
  }, []);

  // Update search input handler
  const handleSearchBatchNo = async (batchno) => {
    console.log("Inside handleSearchBatchNo function with batchno: " + batchno);
    try {
      const response = await api.get(
        `/api/receipt/qc/item-by-batch?batchNo=${batchno}`
      );
      console.log(response.data.data);
      const data = response.data.data;
      setBatchDetails(Array.isArray(data) ? data : [data]);
      setIsShowQualityCheckForm(true);
    } catch (error) {
      toast.error("Error in fetching batch details");
      console.error("Error fetching batch details:", error);
    }
  };

  // Confirm useEffect for confirm modal
  useEffect(() => {
    let modal = null;

    if (isConfirmModal) {
      const modalElement = document.getElementById("incomingQcConfirmModal");

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

  const handleShowConfirm = () => {
    if (selectedItems.length === 0) {
      toast.error("Please select at least one QC to delete.");
      return;
    }
    setMesssage(`Are you sure you want to delete the selected QC(s)?`);
    setIsConfirmModal(true);
  };

  const handleYesConfirm = () => {
    handleDeleteSelected();
  };

  // Submit button function
  const handlePassBatch = async (e) => {
    e.preventDefault();
    try {
      const data = {
        id: batchDetails[0].id,
        qcStatus: isFail ? "FAIL" : "PASS",
        defectCategory: defectCategory,
        remarks: remarks,
      };
      console.log(data);
      const response = await api.put("/api/receipt/qc-status/update", data);
      fetchPassFailQC();
      fetchPendingQC();
      toast.success("Batch details are passed successfully");
      setIsShowQualityCheckForm(false);
    } catch (error) {
      toast.error("Error in fetching batch details");
      console.error("Error fetching batch details:", error);
      setIsShowQualityCheckForm(false);
    }
  };

  // QC delete related functions
  const handleItemCheckboxChange = (qcId) => {
    setSelectedItems((prevSelected) =>
      prevSelected.includes(qcId)
        ? prevSelected.filter((id) => id !== qcId)
        : [...prevSelected, qcId]
    );
  };

  const handleSelectAllChange = (e) => {
    const checked = e.target.checked;
    setSelectAll(checked);
    if (checked) {
      const allQCIds = iqc.map((batch) => batch.id);
      setSelectedItems(allQCIds);
    } else {
      setSelectedItems([]);
    }
  };

  const handleDeleteSelected = () => {
    // Create an array of promises for each delete operation
    const deletePromises = selectedItems.map((qcId) =>
      api.delete(`/api/receipt/delete-pending/${qcId}`)
    );

    // Execute all delete operations
    Promise.all(deletePromises)
      .then((responses) => {
        console.log("QC's deleted successfully:", responses);
        // Check if all deletions were successful
        const allSuccessful = responses.every(
          (response) => response.data.status
        );

        if (allSuccessful) {
          toast.success("Successfully deleted selected QC's");
          // Refresh the items list
          // Clear selection
          setSelectedItems([]);
          setSelectAll(false);
        } else {
          // Some deletions failed
          toast.error("Some items could not be deleted. Please try again.");
        }
        setIsConfirmModal(false);
        fetchPendingQC();
      })
      .catch((error) => {
        console.error("Error deleting items:", error);
        // Handle error (show error message)
        setIsConfirmModal(false);
        toast.error("Error deleting items. Please try again.");
      });
  };

  return (
    <div>
      {/* Header section */}
      <nav className="navbar bg-light border-body" data-bs-theme="light">
        <div className="container-fluid">
          <div className="mt-4">
            <h3 className="nav-header header-style">
              Incoming Quality Control (IQC)
            </h3>
            <p className="breadcrumb">
              <Link to="/dashboard">
                <i className="fas fa-home text-8"></i>
              </Link>{" "}
              <span className="ms-1 mt-1 text-small-gray">
                / Transactions / IQC
              </span>
            </p>
          </div>
        </div>
      </nav>

      {/* Form Header Section */}
      <div className="table-form-container mx-2 mb-4">
        <div className="form-header">
          <h2>
            <i className="fas fa-barcode"></i> Scan Batch
          </h2>
        </div>
        {/* Form Fields */}
        <form autoComplete="off" className="padding-2">
          <div className="form-grid pt-0 m-0">
            <div className="row form-style">
              <div className="col-12 d-flex flex-column form-group">
                <label htmlFor="scanBatch" className="form-label">
                  Scan or Enter Batch Number
                </label>
                <div className="search-box">
                  <i className="fas fa-barcode position-absolute z-0 input-icon"></i>
                  <input
                    type="text"
                    className="form-control vendor-search-bar"
                    placeholder="Scan or type batch number..."
                    value={searchBatchNo}
                    onChange={(e) => {
                      setSearchBatchNo(e.target.value);
                      handleSearchBatchNo(e.target.value);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Quality Check Form */}
      {isShowQualityCheckForm && (
        <div className="table-form-container mx-2 mb-4">
          <div className="form-header">
            <h2>
              <i className="fas fa-circle-check"></i> Quality Check
            </h2>
          </div>
          {/* Form Fields */}
          <form autoComplete="off" className="padding-2">
            <div className="form-grid pt-0">
              <div className="row form-style">
                <p className="text-8 font-weight p-0">Batch Details</p>
                {Array.isArray(batchDetails) &&
                  batchDetails.map((batch) => (
                    <div className="batch-details" key={batch.id}>
                      <div className="row px-2">
                        <div>
                          <strong className="text-8 text-gray">
                            Batch No:
                          </strong>
                          <span className="text-8 float-end">
                            {batch.batchNumber}
                          </span>
                        </div>
                      </div>

                      <div className="row px-2">
                        <div>
                          <strong className="text-8 text-gray">
                            Item Code:
                          </strong>
                          <span className="text-8 float-end">
                            {batch.itemCode}
                          </span>
                        </div>
                      </div>

                      <div className="row px-2">
                        <div>
                          <strong className="text-8 text-gray">
                            Item Name:
                          </strong>
                          <span className="text-8 float-end">
                            {batch.itemName}
                          </span>
                        </div>
                      </div>

                      <div className="row px-2">
                        <div>
                          <strong className="text-8 text-gray">
                            Quantity:
                          </strong>
                          <span className="text-8 float-end">
                            {batch.quantity}
                          </span>
                        </div>
                      </div>

                      <div className="row px-2">
                        <div>
                          <strong className="text-8 text-gray">Vendor:</strong>
                          <span className="text-8 float-end">
                            {batch.vendorName}
                          </span>
                        </div>
                      </div>

                      <div className="row px-2">
                        <div>
                          <strong className="text-8 text-gray">
                            Received:
                          </strong>
                          <span className="text-8 float-end">
                            {batch.createdAt}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
            <div>
              <p className="text-8 font-weight p-0">Quality Status</p>
              <div className="row">
                <div className="col-6">
                  <button
                    type="button"
                    className={`btn w-100 ${
                      isPass === "PASS" ? "btn-success" : "btn-outline-success"
                    }`}
                    ref={passRef}
                    onClick={() => {
                      setIsPass("PASS");
                      setIsFail(false);
                    }}
                  >
                    Pass (Alt + P)
                  </button>
                </div>
                <div className="col-6">
                  <button
                    type="button"
                    className={`btn w-100 ${
                      isFail ? "btn-danger" : "btn-outline-danger"
                    }`}
                    ref={failRef}
                    onClick={() => {
                      setIsFail(true);
                      setIsPass("");
                    }}
                  >
                    Fail (Alt + F)
                  </button>
                </div>
              </div>
            </div>
            {isFail && (
              <div>
                <label
                  htmlFor="category"
                  className="form-label mb-0 text-8 font-weight py-3"
                >
                  Defect Category
                </label>
                <div className="position-relative w-100">
                  <i className="fa-solid fa-triangle-exclamation position-absolute z-0 input-icon"></i>
                  <select
                    className="form-control ps-5 text-font"
                    id="category"
                    placeholder="Select defect category"
                    value=""
                    onChange={(e) => setDefectCategory(e.target.value)}
                  >
                    <option value="" disabled hidden className="text-muted">
                      Select defect category
                    </option>
                    <option value="Broken/Damaged">Broken/Damaged</option>
                    <option value="Color Mismatch">Color Mismatch</option>
                    <option value="Dimensional Issue">Dimensional Issue</option>
                    <option value="Issue Label">Issue Label</option>
                    <option value="Material Defect">Material Defect</option>
                    <option value="Missing Components">
                      Missing Components
                    </option>
                    <option value="Packaging Damage">Packaging Damage</option>
                    <option value="Quality Below Spec">
                      Quality Below Spec
                    </option>
                    <option value="Surface Defect">Surface Defect</option>
                    <option value="Wrong Item">Wrong Item</option>
                  </select>
                  <i className="fa-solid fa-angle-down position-absolute down-arrow-icon"></i>
                </div>
              </div>
            )}

            {isFail && (
              <div>
                <label
                  htmlFor="remarks"
                  className="form-label mb-0 text-8 font-weight py-3"
                >
                  Remarks
                </label>
                <div className="position-relative w-100">
                  <i className="fas fa-comment position-absolute z-0 input-icon"></i>
                  <textarea
                    type="text"
                    className="form-control ps-5 text-font pt-3"
                    id="remarks"
                    placeholder="Enter additional remarks"
                    onChange={(e) => setRemarks(e.target.value)}
                  ></textarea>
                </div>
              </div>
            )}
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-primary add-btn"
                onClick={handlePassBatch}
              >
                <i className="fa-solid fa-floppy-disk me-1"></i> Submit Quality
                Check
              </button>
              <button
                className="btn btn-danger add-btn"
                type="button"
                onClick={() => setIsShowQualityCheckForm(false)}
              >
                <i className="fa-solid fa-xmark me-1"></i> Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search and Filter Section */}
      <div className="search-filter-container mx-2">
        <div className="search-box">
          <i className="fas fa-search position-absolute z-0 input-icon"></i>
          <input
            type="text"
            className="form-control vendor-search-bar"
            placeholder="Search pending items..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        <div className="filter-options">
          <select
            className="filter-select"
            id="item"
            value={vendorFilter}
            onChange={handleVendorFilterChange}
          >
            <option value="" disabled hidden className="text-muted">
              All Vendors
            </option>
            <option value="v1"></option>
          </select>
          <select
            className="filter-select"
            id="vendorName"
            value={typeFilter}
            onChange={handleTypeFilterChange}
          >
            <option value="" disabled hidden className="text-muted">
              All Item Types
            </option>
            <option value="abc"></option>
          </select>
          <select className="filter-select" id="vendorName" defaultValue="">
            <option value="" disabled hidden className="text-muted">
              All Warehouses
            </option>
            <option value="abc"></option>
          </select>
          <button className="filter-select" onClick={handleResetFilters}>
            <i className="fas fa-filter me-2"></i>
            Reset Filters
          </button>
        </div>
      </div>

      {/* Pending Transactions Table Section */}
      <div>
        <div className="table-form-container mx-2 mt-4">
          <div className="form-header">
            <h2>
              {" "}
              <i className="fas fa-hourglass-half"></i>Pending Transactions
            </h2>
          </div>
          {/* Table Header */}
          <div className="table-header">
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
              <button className="btn-action">
                <i className="fas fa-file-export"></i>
                Export Selected
              </button>
              <button className="btn-action">
                <i className="fas fa-clock-rotate-left"></i>
                View Recent
              </button>
              <button
                className="btn-action btn-danger"
                onClick={handleShowConfirm}
              >
                <i className="fas fa-trash"></i> Delete Selected
              </button>
            </div>
          </div>
          <div className="item-table-container mt-3">
            <table>
              <thead>
                <tr>
                  <th className="checkbox-cell">
                    <input type="checkbox" id="select-all-header" disabled />
                  </th>
                  <th>
                    Item Name <i className="fas fa-sort color-gray"></i>
                  </th>
                  <th>
                    Item Code <i className="fas fa-sort color-gray"></i>
                  </th>
                  <th>
                    Batch No <i className="fas fa-sort color-gray"></i>
                  </th>
                  <th>
                    Vendor Name <i className="fas fa-sort color-gray"></i>
                  </th>
                  <th>
                    Quantity <i className="fas fa-sort color-gray"></i>
                  </th>
                  <th>
                    Received Date <i className="fas fa-sort color-gray"></i>
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {iqc.map((i) => (
                  <tr key={i.id}>
                    <td className="checkbox-cell ps-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(i.id)}
                        onChange={() => handleItemCheckboxChange(i.id)}
                      />
                    </td>
                    <td className="ps-4">{i.itemName}</td>
                    <td className="ps-4">{i.itemCode}</td>
                    <td className="ps-4 text-break">{i.batchNumber}</td>
                    <td className="ps-4">{i.vendorName}</td>
                    <td className="ps-4">{i.quantity}</td>
                    <td className="ps-4">{i.createdAt}</td>
                    {/* Mar 15, 2024, 09:30 AM */}
                    <td className="actions ps-4">
                      <button
                        className="btn btn-primary"
                        style={{ fontSize: "0.7rem" }}
                        onClick={() => {
                          handleSearchBatchNo(i.batchNumber);
                        }}
                      >
                        <i className="fa-solid fa-clipboard-check me-1"></i>{" "}
                        Start QC
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="pagination-container">
            <div className="pagination-info">
              Showing 1 to 5 of 10 pending items
            </div>
            <div className="pagination">
              <button className="btn-page" disabled>
                <i className="fas fa-chevron-left"></i>
              </button>
              {/* Generate page buttons */}

              <button className="btn btn-primary">1</button>

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

      {/* Completed Transactions Table Section */}
      <div>
        <div className="table-form-container mx-2 mt-4 mb-4">
          <div className="form-header">
            <h2>
              {" "}
              <i className="fas fa-clipboard-check"></i>Completed Transactions
            </h2>
          </div>

          <div className="item-table-container mt-3">
            <table>
              <thead>
                <tr>
                  <th>
                    Item Name <i className="fas fa-sort color-gray"></i>
                  </th>
                  <th>
                    Item Code <i className="fas fa-sort color-gray"></i>
                  </th>
                  <th>
                    Batch No <i className="fas fa-sort color-gray"></i>
                  </th>
                  <th>
                    Vendor Name <i className="fas fa-sort color-gray"></i>
                  </th>
                  <th>
                    Quantity <i className="fas fa-sort color-gray"></i>
                  </th>
                  <th>
                    Received Date <i className="fas fa-sort color-gray"></i>
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {passFailQC.map((pfqc) => (
                  <tr key={pfqc.id}>
                    <td className="ps-4">{pfqc.itemName}</td>
                    <td className="ps-4">{pfqc.itemCode}</td>
                    <td className="ps-4 text-break">{pfqc.batchNumber}</td>
                    <td className="ps-4">{pfqc.vendorName}</td>
                    <td className="ps-4">{pfqc.quantity}</td>
                    <td className="ps-4">{pfqc.createdAt}</td>
                    <td className="actions ps-4">
                      <span
                        className={`badge status ${
                          pfqc.status === "PASS" ? "active" : "inactive"
                        }`}
                      >
                        {pfqc.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="pagination-container">
            <div className="pagination-info">
              Showing 1 to 5 of 10 pending items
            </div>
            <div className="pagination">
              <button className="btn-page" disabled>
                <i className="fas fa-chevron-left"></i>
              </button>
              {/* Generate page buttons */}

              <button className="btn btn-primary">1</button>

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
        <div className="modal fade" id="incomingQcConfirmModal" tabIndex="-1">
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
    </div>
  );
};

export default IncomingQC;
