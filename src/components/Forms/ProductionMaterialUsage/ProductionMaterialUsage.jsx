import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../../services/api";

const ProductionMaterialUsage = () => {
  const [materials, setMaterials] = useState([]);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState("");
  const [workOrders, setWorkOrders] = useState([]);

  // Load materials when work order changes
  useEffect(() => {
    if (!selectedWorkOrder) {
      setMaterials([]);
      return;
    }

    console.log(selectedWorkOrder);

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
  useEffect(() => {
    fetchWorkOrders();
  }, []);

  // Auto generate transaction number
  const generateTransactionNumber = () => {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `PRD-${year}-${randomNum}`;
  };

  const [transactionNumber, setTransactionNumber] = useState(
    generateTransactionNumber()
  );
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
                  Work Order
                </label>
                <div className="position-relative w-100">
                  <i className="fas fa-file-lines position-absolute z-0 input-icon"></i>
                  <select
                    className="form-control ps-5 text-font"
                    id="workOrder"
                    value={selectedWorkOrder}
                    onChange={(e) => setSelectedWorkOrder(e.target.value)}
                  >
                    <option value="" className="text-muted">
                      Select Work Order
                    </option>
                    {workOrders.map((wo) => (
                      <option key={wo.issueNumber} value={wo.issueNumber}>
                        {wo.issueNumber} - {wo.description}
                      </option>
                    ))}
                  </select>
                  <i className="fa-solid fa-angle-down position-absolute down-arrow-icon"></i>
                </div>
              </div>
            </div>
            {/* Material Usage Table Section */}
            <div className="margin-2">
              <div className="table-container">
                <div className="table-header">
                  <h6>Material Usage</h6>
                </div>
                <table>
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
              <button type="button" className="btn btn-primary add-btn">
                <i className="fa-solid fa-floppy-disk me-1"></i> Save Production
                Record
              </button>
              <button className="btn btn-secondary add-btn me-2" type="button">
                <i className="fa-solid fa-xmark me-1"></i> Clear
              </button>
            </div>
            {/* Recent Production Records Table Section */}
            <div className="margin-2">
              <div className="table-container">
                <div className="table-header">
                  <h6>Recent Production Records</h6>
                </div>
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Work Order</th>
                      <th>Line</th>
                      <th>Shift</th>
                      <th>Target Qty</th>
                      <th>Produced Qty</th>
                      <th>Yield Rate</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody className="text-break">
                    <tr className="no-data-row">
                      <td colSpan="8" className="no-data-cell">
                        <div className="no-data-content">
                          <i className="fas fa-clock-rotate-left no-data-icon"></i>
                          <p className="no-data-text">No Recent Records</p>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>{" "}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductionMaterialUsage;
