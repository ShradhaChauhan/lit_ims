import React from "react";

const ItemMasterModal = ({ item, onClose }) => {
  return (
    <div className="modal-content">
      <div className="modal-header">
        <h5 className="modal-title">
          <i className="fas fa-circle-info me-2"></i>
          Item Details
        </h5>
        <button
          type="button"
          className="btn-close"
          onClick={onClose}
          aria-label="Close"
        ></button>
      </div>
      <div className="modal-body">
        <div className="user-details-grid">
          <div className="detail-item">
            <strong>Group:</strong>
            <span>{item?.groupName || "-"}</span>
          </div>

          <div className="detail-item">
            <strong>Name:</strong>
            <span>{item?.name || "-"}</span>
          </div>

          <div className="detail-item">
            <strong>Code:</strong>
            <span>{item?.code || "-"}</span>
          </div>

          <div className="detail-item">
            <strong>UOM:</strong>
            <span>{item?.uom || "-"}</span>
          </div>

          <div className="detail-item">
            <strong>Price:</strong>
            <span>{item?.price ? `₹${item.price}` : "-"}</span>
          </div>

          <div className="detail-item">
            <strong>ST Qty:</strong>
            <span>{item?.stQty || "-"}</span>
          </div>

          <div className="detail-item">
            <strong>Life:</strong>
            <span>{item?.life ? `${item.life} days` : "-"}</span>
          </div>

          <div className="detail-item">
            <strong>Status:</strong>
            <span
              className={`badge status ${
                item?.status?.toLowerCase() || "inactive"
              } w-25`}
            >
              {item?.status || "Inactive"}
            </span>
          </div>

          <div className="detail-item">
            <strong>Inventory Item:</strong>
            <span>{item?.inventoryItem || "-"}</span>
          </div>

          {item?.iqc && (
            <div className="detail-item">
              <strong>IQC Required:</strong>
              <span>{item?.iqc || "-"}</span>
            </div>
          )}
        </div>
      </div>
      <div className="modal-footer">
        <button
          type="button"
          className="btn btn-secondary add-btn"
          onClick={onClose}
        >
          <i className="fa-solid fa-xmark me-2"></i>
          Close
        </button>
      </div>
    </div>
  );
};

export default ItemMasterModal;
