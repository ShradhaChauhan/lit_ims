import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../../services/api";

const ProductionMaterialUsage = () => {
  const [materials, setMaterials] = useState([]);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState("");
  const [workOrders, setWorkOrders] = useState([]);
  const [recentRecords, setRecentRecords] = useState([]);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);

  // Load materials when work order changes
  useEffect(() => {
    if (!selectedWorkOrder) {
      setMaterials([]);
      return;
    }

    console.log("Selected work order:", selectedWorkOrder);

    api
      .get(
        `/api/issue-production/summary-by-issue?issueNumber=${selectedWorkOrder}`
      )
      .then((response) => {
        console.log("Materials fetched:", response.data);
        if (response.data.status && response.data.data?.items) {
          // Transform the API response data to match the table structure
          const transformedMaterials = response.data.data.items.map((item) => ({
            id: item.id,
            material: item.itemName,
            batchno: item.batchNumber,
            availableQty: item.totalIssued || 0,
            usedQty: 0,
            scrapQty: 0,
            remainingQty: item.totalIssued || 0,
            status: "Available",
          }));
          setMaterials(transformedMaterials);
        } else {
          toast.error(response.data.message || "Failed to fetch materials");
          setMaterials([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching materials:", error);
        toast.error("Error loading materials. Please try again.");
        setMaterials([]);
      });
  }, [selectedWorkOrder]);

  const fetchWorkOrders = () => {
    api
      .get("/api/issue-production/all-issue")
      .then((response) => {
        console.log("Work orders fetched:", response.data);
        if (response.data.status && response.data.data) {
          // Transform the data to include both issue number and description
          const formattedWorkOrders = response.data.data.map((issueNumber) => ({
            issueNumber,
            description: "LED Display Assembly", // This should come from API if available
          }));
          setWorkOrders(formattedWorkOrders);
        } else {
          toast.error(response.data.message || "Failed to fetch work orders");
          setWorkOrders([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching work orders:", error);
        toast.error("Error loading work orders. Please try again.");
        setWorkOrders([]);
      });
  };
  const fetchRecentRecords = () => {
    api
      .get("/api/production-usage/summary")
      .then((response) => {
        if (response.data.status && response.data.data) {
          // Sort the records in descending order by id
          const sortedRecords = [...response.data.data].sort(
            (a, b) => b.id - a.id
          );
          setRecentRecords(sortedRecords);
        } else {
          toast.error(
            response.data.message || "Failed to fetch recent records"
          );
        }
      })
      .catch((error) => {
        console.error("Error fetching recent records:", error);
        toast.error("Error loading recent records. Please try again.");
      });
  };

  const handleViewDetails = (record) => {
    api
      .get(`/api/production-usage/${record.id}`)
      .then((response) => {
        if (response.data.status && response.data.data) {
          setSelectedRecord(response.data.data);
          setShowDetailsModal(true);
        } else {
          toast.error(
            response.data.message || "Failed to fetch record details"
          );
        }
      })
      .catch((error) => {
        console.error("Error fetching record details:", error);
        toast.error("Error loading record details. Please try again.");
      });
  };

  useEffect(() => {
    fetchWorkOrders();
    fetchRecentRecords();
  }, []);

  // Auto generate transaction number
  const generateTransactionNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const randomNum = String(Math.floor(1 + Math.random() * 9999)).padStart(
      4,
      "0"
    );
    return `PU${year}${month}${day}${randomNum}`;
  };

  const [transactionNumber, setTransactionNumber] = useState(
    generateTransactionNumber()
  );

  const handleClear = () => {
    setSelectedWorkOrder(""); // Reset work order selection
    setMaterials([]); // Clear materials table
    setTransactionNumber(generateTransactionNumber()); // Generate new transaction number
  };

  const handleSave = () => {
    if (!selectedWorkOrder || materials.length === 0) {
      toast.error("Please select a work order and ensure materials are loaded");
      return;
    }

    const payload = {
      transactionNumber,
      workOrder: selectedWorkOrder,
      items: materials.map((material) => ({
        itemCode: material.id,
        itemName: material.material,
        batchNumber: material.batchno,
        availableQty: material.availableQty,
        usedQty: material.usedQty,
        scrapQty: material.scrapQty,
        remainingQty: material.remainingQty,
        status:
          material.status === "Consumed"
            ? "USED"
            : material.status.toUpperCase(),
      })),
    };

    api
      .post("/api/production-usage/save", payload)
      .then((response) => {
        if (response.data.status) {
          toast.success(
            response.data.message || "Production usage saved successfully"
          );
          // Reset form
          setSelectedWorkOrder("");
          setMaterials([]);
          setTransactionNumber(generateTransactionNumber());
          // Refresh recent records
          fetchRecentRecords();
        } else {
          toast.error(
            response.data.message || "Failed to save production usage"
          );
        }
      })
      .catch((error) => {
        console.error("Error saving production usage:", error);
        toast.error("Error saving production usage. Please try again.");
      });
  };
  return (
    <div>
      {/* Header section */}
      <nav className="navbar bg-light border-body" data-bs-theme="light">
        <div className="container-fluid">
          <div className="mt-4">
            <h3 className="nav-header header-style">
              Production Material Usage
            </h3>
            <p className="breadcrumb">
              <Link to="/dashboard">
                <i className="fas fa-home text-8"></i>
              </Link>{" "}
              <span className="ms-1 mt-1 text-small-gray">
                / Transactions / Production Material Usage
              </span>
            </p>
          </div>
        </div>
      </nav>

      {/* Form Section */}
      <div className="table-form-container mx-2 mb-3">
        <div className="form-header">
          <h2>
            <i className="fas fa-industry"></i> Production Usage Entry
          </h2>
          <p>
            Transaction #: <strong>{transactionNumber}</strong>
          </p>
        </div>
        {/* Form Fields */}
        <form autoComplete="off" className="padding-2">
          <div className="form-grid pt-0">
            <div className="row form-style">
              <div className="col-3 d-flex flex-column form-group">
                <label htmlFor="workOrder" className="form-label">
                  Work Order <span className="text-danger fs-6">*</span>
                </label>
                <div className="position-relative w-100">
                  <i className="fas fa-file-lines position-absolute z-0 input-icon"></i>
                  <select
                    className={`form-select ps-5 text-font ${
                      selectedWorkOrder ? "" : "text-secondary"
                    }`}
                    id="workOrder"
                    value={selectedWorkOrder}
                    onChange={(e) => setSelectedWorkOrder(e.target.value)}
                  >
                    <option value="" className="text-muted">
                      Select Work Order
                    </option>
                    {workOrders.map((wo) => (
                      <option key={wo.issueNumber} value={wo.issueNumber}>
                        {wo.issueNumber}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            {/* Material Usage Table Section */}
            <div className="margin-2">
              <div className="table-container">
                <div className="table-header">
                  <h6>Material Usage</h6>
                </div>
                <table className="table table-striped table-hover table-sm p-2 align-middle">
                  <thead>
                    <tr>
                      <th>Material</th>
                      <th>Batch No</th>
                      <th>Available Qty</th>
                      <th>Used Qty</th>
                      <th>Scrap Qty</th>
                      <th>Remaining Qty</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-break">
                    {materials.length === 0 ? (
                      <tr className="no-data-row">
                        <td colSpan="7" className="no-data-cell">
                          <div className="no-data-content">
                            <i className="fas fa-industry no-data-icon"></i>
                            <p className="no-data-text">
                              No Materials Selected
                            </p>
                            <p className="no-data-subtext">
                              Select a work order to load materials
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      materials.map((material) => (
                        <tr key={material.id}>
                          <td className="ps-4">
                            <div>
                              <span>{material.material}</span>
                            </div>
                          </td>
                          <td className="ps-4">
                            <div>
                              <span>{material.batchno}</span>
                            </div>
                          </td>

                          <td className="ps-4">
                            <div>
                              <span>{material.availableQty}</span>
                            </div>
                          </td>

                          <td className="ps-4">
                            <div>
                              <span>
                                <input
                                  type="number"
                                  id="usedQty"
                                  className="form-control text-font"
                                  value={String(material.usedQty)}
                                  onChange={(e) => {
                                    const input = e.target.value.replace(
                                      /^0+(?=\d)/,
                                      ""
                                    );
                                    const value = Number(input);

                                    const updatedMaterials = materials.map(
                                      (m) => {
                                        if (m.id === material.id) {
                                          const totalUsed = value;
                                          const totalScrap = Number(m.scrapQty);
                                          const remaining =
                                            m.availableQty -
                                            (totalUsed + totalScrap);

                                          const status =
                                            remaining === m.availableQty
                                              ? "Available"
                                              : remaining === 0
                                              ? "Consumed"
                                              : "In Progress";

                                          return {
                                            ...m,
                                            usedQty: totalUsed,
                                            remainingQty: remaining,
                                            status,
                                          };
                                        }
                                        return m;
                                      }
                                    );

                                    setMaterials(updatedMaterials);
                                  }}
                                />
                              </span>
                            </div>
                          </td>
                          <td className="ps-4">
                            <div>
                              <span>
                                <input
                                  type="number"
                                  id="scrapQty"
                                  className="form-control text-font"
                                  value={String(material.scrapQty)}
                                  onChange={(e) => {
                                    const input = e.target.value.replace(
                                      /^0+(?=\d)/,
                                      ""
                                    );
                                    const value = Number(input);

                                    const updatedMaterials = materials.map(
                                      (m) => {
                                        if (m.id === material.id) {
                                          const totalUsed = Number(m.usedQty);
                                          const totalScrap = value;
                                          const remaining =
                                            m.availableQty -
                                            (totalUsed + totalScrap);

                                          const status =
                                            remaining === m.availableQty
                                              ? "Available"
                                              : remaining === 0
                                              ? "Consumed"
                                              : "In Progress";

                                          return {
                                            ...m,
                                            scrapQty: totalScrap,
                                            remainingQty: remaining,
                                            status,
                                          };
                                        }
                                        return m;
                                      }
                                    );

                                    setMaterials(updatedMaterials);
                                  }}
                                />
                              </span>
                            </div>
                          </td>
                          <td className="ps-4">
                            <div>
                              <span>{material.remainingQty}</span>
                            </div>
                          </td>
                          <td className="ps-4">
                            <div>
                              <span>
                                {material.availableQty === material.remainingQty
                                  ? "Available"
                                  : material.remainingQty === 0
                                  ? "Consumed"
                                  : "In Progress"}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>{" "}
            {/* Production Output Table Section */}
            {/* <div className="margin-2">
              <div className="table-container">
                <div className="row form-style p-4">
                  <h6 className="mb-2">Production Output</h6>

                  <div className="col-3 d-flex flex-column text-font">
                    <div className="row bg-gray font-weight me-2 p-3 d-flex align-items-center justify-content-between">
                      <p className="col-6 font-gray mb-0">Target Quantity:</p>
                      <p className="col-6 mb-0 text-end">0</p>
                    </div>
                  </div>

                  <div className="col-3 d-flex flex-column text-font">
                    <div className="row bg-gray font-weight me-2 p-3 d-flex align-items-center justify-content-between">
                      <p className="col-6 font-gray mb-0">Produced Quantity:</p>
                      <p className="col-6 mb-0 text-end">0</p>
                    </div>
                  </div>

                  <div className="col-3 d-flex flex-column text-font">
                    <div className="row bg-gray font-weight me-2 p-3 d-flex align-items-center justify-content-between">
                      <p className="col-6 font-gray mb-0">
                        Defective Quantity:
                      </p>
                      <p className="col-6 mb-0 text-end">0</p>
                    </div>
                  </div>
                  <div className="col-3 d-flex flex-column text-font">
                    <div className="row bg-gray font-weight me-2 p-3 d-flex align-items-center justify-content-between">
                      <p className="col-6 font-gray mb-0">Yield Rate:</p>
                      <p className="col-6 mb-0 text-end">0%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>{" "} */}
            {/* Button Section */}
            <div className="form-actions">
              <button
                type="button"
                className="btn btn-primary add-btn"
                onClick={handleSave}
              >
                <i className="fa-solid fa-floppy-disk me-1"></i> Save Production
                Record
              </button>
              <button
                className="btn btn-secondary add-btn me-2"
                type="button"
                onClick={handleClear}
              >
                <i className="fa-solid fa-xmark me-1"></i> Clear
              </button>
            </div>
            {/* Recent Production Records Table Section */}
            <div className="margin-2">
              <div className="table-container">
                <div className="table-header">
                  <h6>Recent Production Records</h6>
                </div>
                <table className="table table-striped table-hover table-sm p-2 align-middle">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Work Order</th>
                      <th>TRNO</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-break">
                    {recentRecords.length === 0 ? (
                      <tr className="no-data-row">
                        <td colSpan="4" className="no-data-cell">
                          <div className="no-data-content">
                            <i className="fas fa-clock-rotate-left no-data-icon"></i>
                            <p className="no-data-text">No Recent Records</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      recentRecords
                        .slice(
                          (currentPage - 1) * recordsPerPage,
                          currentPage * recordsPerPage
                        )
                        .map((record) => (
                          <tr key={record.id}>
                            <td className="ps-4">
                              <div>
                                <span>{record.usageDate}</span>
                              </div>
                            </td>
                            <td className="ps-4">
                              <div>
                                <span>{record.workOrder}</span>
                              </div>
                            </td>
                            <td className="ps-4">
                              <div>
                                <span>{record.transactionNumber}</span>
                              </div>
                            </td>
                            <td className="ps-4 actions">
                              <button
                                type="button"
                                className="btn-icon btn-primary"
                                title="View Details"
                                onClick={() => handleViewDetails(record)}
                              >
                                <i className="fas fa-eye"></i>
                              </button>
                            </td>
                          </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              {recentRecords.length > 0 && (
                <div className="pagination-container">
                  <div className="pagination-info">
                    Showing {(currentPage - 1) * recordsPerPage + 1}-
                    {Math.min(
                      currentPage * recordsPerPage,
                      recentRecords.length
                    )}{" "}
                    of {recentRecords.length} entries
                  </div>
                  <div className="pagination">
                    <button
                      className="btn-page"
                      disabled={currentPage === 1}
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                    >
                      <i className="fas fa-chevron-left"></i>
                    </button>

                    {Array.from(
                      {
                        length: Math.ceil(
                          recentRecords.length / recordsPerPage
                        ),
                      },
                      (_, i) => i + 1
                    ).map((page) => (
                      <button
                        key={page}
                        className={`btn-page ${
                          currentPage === page ? "active" : ""
                        }`}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      className="btn-page"
                      disabled={
                        currentPage ===
                        Math.ceil(recentRecords.length / recordsPerPage)
                      }
                      onClick={() =>
                        setCurrentPage((prev) =>
                          Math.min(
                            prev + 1,
                            Math.ceil(recentRecords.length / recordsPerPage)
                          )
                        )
                      }
                    >
                      <i className="fas fa-chevron-right"></i>
                    </button>
                  </div>
                  <div className="items-per-page">
                    <select
                      value={recordsPerPage}
                      onChange={(e) => {
                        const newRecordsPerPage = Number(e.target.value);
                        setRecordsPerPage(newRecordsPerPage);
                        setCurrentPage(1); // Reset to first page when changing items per page
                      }}
                      disabled={loading}
                      className="form-select form-select-sm"
                    >
                      <option value="10">10 per page</option>
                      <option value="25">25 per page</option>
                      <option value="50">50 per page</option>
                      <option value="100">100 per page</option>
                    </select>
                  </div>
                </div>
              )}
            </div>{" "}
          </div>
        </form>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedRecord && (
        <>
          <div className="modal show d-block" tabIndex="-1" role="dialog">
            <div className="modal-dialog modal-lg" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    {" "}
                    <i className="fas fa-circle-check me-2"></i>Production
                    Material Usage Details
                  </h5>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => setShowDetailsModal(false)}
                    aria-label="Close"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
                <div className="modal-body">
                  <div className="row mb-3">
                    <div className="user-details-grid">
                      <div className="detail-item">
                        <strong>Transaction Number:</strong>{" "}
                        <span>{selectedRecord.transactionNumber}</span>
                      </div>
                      <div className="detail-item">
                        <strong>Work Order:</strong>{" "}
                        <span>{selectedRecord.workOrder}</span>
                      </div>

                      <div className="detail-item">
                        <strong>Usage Date:</strong>{" "}
                        <span>{selectedRecord.usageDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="table-container">
                    <div className="table-header">
                      <h6>Material Usage Details</h6>
                    </div>
                    <table className="table table-striped table-hover table-sm p-2 align-middle">
                      <thead>
                        <tr>
                          <th className="ps-4">Batch Number</th>
                          <th>Used Qty</th>
                          <th>Scrap Qty</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody className="text-break">
                        {selectedRecord.items.map((item, index) => (
                          <tr key={index}>
                            <td className="ps-4">{item.batchNumber}</td>
                            <td>{item.usedQty}</td>
                            <td>{item.scrapQty}</td>
                            <td>{item.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary add-btn"
                    onClick={() => setShowDetailsModal(false)}
                  >
                    <i className="fa-solid fa-xmark me-1"></i> Close
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop show"></div>
        </>
      )}
    </div>
  );
};

export default ProductionMaterialUsage;
