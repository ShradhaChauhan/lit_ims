import { Modal } from "bootstrap";
import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const Reports = () => {
  const [isShowDetails, setIsShowDetails] = useState(false);
  const reportModalRef = useRef(null);
  const [reports, setReports] = useState([
    {
      location: "IQC",
      warehouseName: "Moulding Shop Floor",
      warehouseCode: "ADP-11",
      branch: "LIT INDIA PVT LTD UNIT-II",
    },
    {
      location: "IQC",
      warehouseName: "FG",
      warehouseCode: "ANT-11",
      branch: "LIT INDIA PVT LTD UNIT-II",
    },
  ]);

  const [warehouseDetails, setWarehouseDetails] = useState([
    {
      location: "R1",
      itemCode: "10021256",
      itemName: "Item 1",
      quantity: 100,
      iqcStatus: "Ok",
    },
    {
      location: "R2",
      itemCode: "10054322",
      itemName: "Item 2",
      quantity: 500,
      iqcStatus: "Not Ok",
    },
  ]);
  useEffect(() => {
    if (isShowDetails && reportModalRef.current) {
      const bsModal = new Modal(reportModalRef.current, {
        backdrop: "static",
      });
      bsModal.show();

      // Optional: hide modal state when it's closed
      reportModalRef.current.addEventListener("hidden.bs.modal", () =>
        setIsShowDetails(false)
      );
    }
  }, [isShowDetails]);
  return (
    <div>
      {" "}
      {/* Header Section */}
      <nav className="navbar bg-light border-body" data-bs-theme="light">
        <div className="container-fluid">
          <div className="mt-4">
            <h3 className="nav-header header-style">Inventory Audit Report</h3>
            <p className="breadcrumb">
              <Link to="/dashboard">
                <i className="fas fa-home text-8"></i>
              </Link>{" "}
              <span className="ms-1 mt-1 text-small-gray">
                / Inventory Audit Report
              </span>
            </p>
          </div>
        </div>
      </nav>
      {/* Search and Filter Section */}
      <div className="search-filter-container mx-2">
        <div className="search-box">
          <i className="fas fa-search position-absolute z-0 input-icon"></i>
          <input
            type="text"
            className="form-control vendor-search-bar"
            placeholder="Search by warehouse..."
          />
        </div>
        <div className="filter-options">
          <select className="filter-select">
            <option value="">All Locations</option>
            <option value="W1">W1</option>
            <option value="W2">W2</option>
          </select>
          <select className="filter-select">
            <option value="">IQC Status</option>
            <option value="Ok">Ok</option>
            <option value="Not Ok">Not Ok</option>
          </select>

          <button className="filter-select">
            <i className="fas fa-filter me-2"></i>
            Reset Filters
          </button>
        </div>
      </div>
      {/* Table Section */}
      <div className="margin-2 mx-2">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Location</th>
                <th>Warehouse Name</th>
                <th>Warehouse Code</th>
                <th>Branch</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="text-break">
              {reports.length === 0 ? (
                <tr className="no-data-row">
                  <td colSpan="4" className="no-data-cell">
                    <div className="no-data-content">
                      <i className="fa-solid fa-chart-line no-data-icon"></i>
                      <p className="no-data-text">No audit reports found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.id}>
                    <td className="ps-4">
                      <div>
                        <span>{report.location}</span>
                      </div>
                    </td>
                    <td className="ps-4">
                      <div>
                        <span>{report.warehouseName}</span>
                      </div>
                    </td>
                    <td className="ps-4">
                      <div>
                        <span>{report.warehouseCode}</span>
                      </div>
                    </td>
                    <td className="ps-4">
                      <div>
                        <span>{report.branch}</span>
                      </div>
                    </td>
                    <td className="actions ps-4">
                      <button
                        className="btn-icon btn-primary"
                        title="View Details"
                        onClick={() => setIsShowDetails(true)}
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
      </div>
      {/* View Part Details Modal */}
      {isShowDetails && (
        <div
          className="modal fade modal-lg"
          ref={reportModalRef}
          id="reportDetailModal"
          tabIndex="-1"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-circle-info me-2"></i>
                  View Stock Details
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <div className="margin-2 mx-2">
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Location</th>
                          <th>Item Code</th>
                          <th>Item Name</th>
                          <th>Quantity</th>
                          <th>IQC Status</th>
                        </tr>
                      </thead>
                      <tbody className="text-break">
                        {warehouseDetails.length === 0 ? (
                          <tr className="no-data-row">
                            <td colSpan="5" className="no-data-cell">
                              <div className="no-data-content">
                                <i className="fas fa-cogs no-data-icon"></i>
                                <p className="no-data-text">No parts found</p>
                                <p className="no-data-subtext">
                                  Click the "Add New Part" button to create your
                                  first part
                                </p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          warehouseDetails.map((warehouseDetail) => (
                            <tr key={warehouseDetail.id}>
                              <td className="ps-4">
                                <div>
                                  <span>{warehouseDetail.location}</span>
                                </div>
                              </td>
                              <td className="ps-4">
                                <div>
                                  <span>{warehouseDetail.itemCode}</span>
                                </div>
                              </td>
                              <td className="ps-4">
                                <div>
                                  <span>{warehouseDetail.itemName}</span>
                                </div>
                              </td>
                              <td className="ps-4">
                                <div>
                                  <span>{warehouseDetail.quantity}</span>
                                </div>
                              </td>
                              <td className="ps-3">
                                <div>
                                  <span
                                    className={`badge status ${
                                      warehouseDetail.iqcStatus === "Ok"
                                        ? "active"
                                        : "inactive"
                                    }`}
                                  >
                                    {warehouseDetail.iqcStatus}
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
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
                  <i className="fas fa-xmark me-2"></i>Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
