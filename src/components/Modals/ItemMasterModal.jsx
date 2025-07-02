import React from "react";

const ItemMasterModal = ({ item, onClose }) => {
  return (
    <div className="modal-content">
      <div className="modal-header">
        <h5 className="modal-title">Item Details: {item?.name}</h5>
        <button
          type="button"
          className="btn-close"
          onClick={onClose}
          aria-label="Close"
        ></button>
      </div>
      <div className="modal-body">
        <div className="item-details">
          <div className="detail-row">
            <span className="detail-label">Name:</span>
            <span className="detail-value">{item?.name}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Code:</span>
            <span className="detail-value">{item?.code}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">UOM:</span>
            <span className="detail-value">{item?.uom}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Type:</span>
            <span className="detail-value">{item?.type}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Barcode:</span>
            <span className="detail-value">{item?.barcode}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Group:</span>
            <span className="detail-value">{item?.group}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Price:</span>
            <span className="detail-value">₹{item?.price}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">ST Qty:</span>
            <span className="detail-value">{item?.stQty}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Life:</span>
            <span className="detail-value">{item?.life} days</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Status:</span>
            <span className={`badge status ${item?.status?.toLowerCase()}`}>
              {item?.status || "-"}
            </span>
          </div>
        </div>
      </div>
      <div className="modal-footer">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ItemMasterModal;
