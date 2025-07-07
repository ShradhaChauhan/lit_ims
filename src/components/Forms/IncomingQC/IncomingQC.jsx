import React, { useEffect, useRef, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../../services/api";

const IncomingQC = () => {
  const [isShowQualityCheckForm, setIsShowQualityCheckForm] = useState(false);
  const [searchBatchNo, setSearchBatchNo] = useState("");
  const [iqc, setIqc] = useState([]);
  const passRef = useRef(null);
  const failRef = useRef(null);

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

  // Fetch types from API
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

  // Filter types based on search term and status filter
  const filteredTypes = iqc.filter((i) => {
    // Search term filter
    const searchFields = [
      i.itemName?.toLowerCase() || "",
      i.itemCode?.toLowerCase() || "",
      i.quantity?.toLowerCase() || "",
      i.batchNumber?.toLowerCase() || "",
      i.vendorName?.toLowerCase() || "",
      i.createdAt?.toLowerCase() || "",
    ];

    const searchTermLower = searchBatchNo.toLowerCase();
    const matchesSearch =
      searchBatchNo === "" ||
      searchFields.some((field) => field.includes(searchTermLower));

    return matchesSearch && matchesStatus;
  });

  // Update search input handler
  const handleSearchBatchNo = (e) => {
    setSearchBatchNo(e.target.value);
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
                  <i className="fas fa-barcode position-absolute input-icon"></i>
                  <input
                    type="text"
                    className="form-control vendor-search-bar"
                    placeholder="Scan or type batch number..."
                    value={searchBatchNo}
                    onChange={handleSearchBatchNo}
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
                <div className="batch-details">
                  <div className="row px-2">
                    <div>
                      <strong className="text-8 text-gray">Batch No:</strong>
                      <span className="text-8 float-end">BAT001</span>
                    </div>
                  </div>

                  <div className="row px-2">
                    <div>
                      <strong className="text-8 text-gray">Item Code:</strong>
                      <span className="text-8 float-end">ALM-2MM</span>
                    </div>
                  </div>

                  <div className="row px-2">
                    <div>
                      <strong className="text-8 text-gray">Item Name:</strong>
                      <span className="text-8 float-end">
                        Aluminum Sheet 2mm
                      </span>
                    </div>
                  </div>

                  <div className="row px-2">
                    <div>
                      <strong className="text-8 text-gray">Quantity:</strong>
                      <span className="text-8 float-end">500</span>
                    </div>
                  </div>

                  <div className="row px-2">
                    <div>
                      <strong className="text-8 text-gray">Vendor:</strong>
                      <span className="text-8 float-end">
                        Metal Supplies Ltd
                      </span>
                    </div>
                  </div>

                  <div className="row px-2">
                    <div>
                      <strong className="text-8 text-gray">Received:</strong>
                      <span className="text-8 float-end">
                        Mar 15, 2024, 09:30 AM
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <p className="text-8 font-weight p-0">Quality Status</p>
              <div className="row">
                <div className="col-6">
                  <button
                    type="button"
                    className="btn btn-outline-success w-100"
                    ref={passRef}
                  >
                    Pass (Alt + P)
                  </button>
                </div>
                <div className="col-6">
                  <button
                    type="button"
                    className="btn btn-outline-danger w-100"
                    ref={failRef}
                  >
                    Fail (Alt + F)
                  </button>
                </div>
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary add-btn">
                <i className="fa-solid fa-floppy-disk me-1"></i> Submit Quality
                Check
              </button>
              <button className="btn btn-danger add-btn" type="button">
                <i className="fa-solid fa-xmark me-1"></i> Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search and Filter Section */}
      <div className="search-filter-container mx-2">
        <div className="search-box">
          <i className="fas fa-search position-absolute input-icon"></i>
          <input
            type="text"
            className="form-control vendor-search-bar"
            placeholder="Search pending items..."
          />
        </div>
        <div className="filter-options">
          <select className="filter-select" id="item" defaultValue="">
            <option value="" disabled hidden className="text-muted">
              All Vendors
            </option>
            <option value="v1"></option>
          </select>
          <select className="filter-select" id="vendorName" defaultValue="">
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
          <button className="filter-select">
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
              <input type="checkbox" id="select-all" />
              <label htmlFor="select-all">0 Selected</label>
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
              <button className="btn-action btn-danger">
                <i className="fas fa-trash"></i> Delete Selected
              </button>
            </div>
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
                {iqc.map((i) => (
                  <tr>
                    <td className="ps-4">i.batchNumber</td>
                    <td className="ps-4">i.itemName</td>
                    <td className="ps-4">i.itemCode</td>
                    <td className="ps-4">i.vendorName</td>
                    <td className="ps-4">i.quantity</td>
                    <td className="ps-4">i.createdAt</td>
                    {/* Mar 15, 2024, 09:30 AM */}
                    <td className="actions ps-4">
                      <button
                        className="btn btn-primary qc-btn"
                        onClick={() => setIsShowQualityCheckForm(true)}
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

      {/* Pending Transactions Table Section */}
      <div>
        <div className="table-form-container mx-2 mt-4">
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
                <tr>
                  <td className="ps-4">Speaker</td>
                  <td className="ps-4">1000</td>
                  <td className="ps-4">512026</td>
                  <td className="ps-4">Ram Kapoor</td>
                  <td className="ps-4">1200</td>
                  <td className="ps-4">Mar 15, 2024, 09:20 AM</td>
                  <td className="actions ps-4">
                    <span className={`badge status active`}>OK</span>
                  </td>
                </tr>
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
    </div>
  );
};

export default IncomingQC;
