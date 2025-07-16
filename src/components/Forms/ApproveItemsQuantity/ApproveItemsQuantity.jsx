import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./ApproveItemsQuantity.css"; // External CSS for hover styles

const ApproveItemsQuantity = () => {
  const [selectedAction, setSelectedAction] = useState(null); // "approve" | "reject" | null

  const toggleAction = (action) => {
    if (selectedAction === action) {
      setSelectedAction(null); // Deselect if clicked again
    } else {
      setSelectedAction(action);
    }
  };

  return (
    <div>
      {/* Header */}
      <nav className="navbar bg-light border-body" data-bs-theme="light">
        <div className="container-fluid">
          <div className="mt-4">
            <h3 className="nav-header header-style">Approve Items Quantity</h3>
            <p className="breadcrumb">
              <Link to="/dashboard">
                <i className="fas fa-home text-8"></i>
              </Link>{" "}
              <span className="ms-1 mt-1 text-small-gray">
                / Transactions / Approve Items Quantity
              </span>
            </p>
          </div>
        </div>
      </nav>

      {/* Table */}
      <div className="margin-2 mx-2">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>
                  Item Name <i className="fas fa-sort color-gray ms-2"></i>
                </th>
                <th>
                  Item Code <i className="fas fa-sort color-gray ms-2"></i>
                </th>
                <th>Std Qty</th>
                <th>New Qty</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="ps-4">I1</td>
                <td className="ps-4">100200</td>
                <td className="ps-4">200</td>
                <td className="ps-4">150</td>
                <td className="ps-4">
                  <div className="d-flex gap-2">
                    <button
                      className={`btn btn-sm icon-btn approve-btn ${
                        selectedAction === "approve" ? "selected" : ""
                      }`}
                      onClick={() => toggleAction("approve")}
                      title="Approve"
                    >
                      <i className="fas fa-check"></i>
                    </button>
                    <button
                      className={`btn btn-sm icon-btn reject-btn ${
                        selectedAction === "reject" ? "selected" : ""
                      }`}
                      onClick={() => toggleAction("reject")}
                      title="Reject"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <button
          className="btn btn-primary float-end mt-3 me-2 text-font"
          title="Approve"
        >
          <i className="fas fa-thumbs-up me-2"></i>
          Approve
        </button>
      </div>
    </div>
  );
};

export default ApproveItemsQuantity;
