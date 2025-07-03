import React from "react";

const ItemMasterModal = ({ item, onClose }) => {
  return (
    <div className="modal-content">
      <div className="modal-header">
        <h5 className="modal-title">
          <i className="fas fa-box me-2"></i>
          Item Details
        </h5>
        <button
          type="button"
          className="btn-close"
          onClick={onClose}
          aria-label="Close"
        ></button>
      </div>
      <div className="modal-body p-4">
        <div className="item-details">
          <div className="row mb-3">
            <div className="col-md-6">
              <div className="detail-group">
                <label className="detail-label small text-muted mb-1">
                  <i className="fas fa-box-open me-2"></i>
                  Name
                </label>
                <div className="detail-value fw-medium">{item?.name || "-"}</div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="detail-group">
                <label className="detail-label small text-muted mb-1">
                  <i className="fas fa-qrcode me-2"></i>
                  Code
                </label>
                <div className="detail-value fw-medium">{item?.code || "-"}</div>
              </div>
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <div className="detail-group">
                <label className="detail-label small text-muted mb-1">
                  <i className="fas fa-ruler me-2"></i>
                  UOM
                </label>
                <div className="detail-value fw-medium">{item?.uom || "-"}</div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="detail-group">
                <label className="detail-label small text-muted mb-1">
                  <i className="fas fa-tags me-2"></i>
                  Type
                </label>
                <div className="detail-value fw-medium">{item?.type || "-"}</div>
              </div>
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <div className="detail-group">
                <label className="detail-label small text-muted mb-1">
                  <i className="fas fa-barcode me-2"></i>
                  Barcode
                </label>
                <div className="detail-value fw-medium">{item?.barcode || "-"}</div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="detail-group">
                <label className="detail-label small text-muted mb-1">
                  <i className="fas fa-layer-group me-2"></i>
                  Group
                </label>
                <div className="detail-value fw-medium">{item?.groupName || "-"}</div>
              </div>
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <div className="detail-group">
                <label className="detail-label small text-muted mb-1">
                  <i className="fas fa-rupee-sign me-2"></i>
                  Price
                </label>
                <div className="detail-value fw-medium">
                  {item?.price ? `₹${item.price}` : "-"}
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="detail-group">
                <label className="detail-label small text-muted mb-1">
                  <i className="fas fa-cubes me-2"></i>
                  ST Qty
                </label>
                <div className="detail-value fw-medium">{item?.stQty || "-"}</div>
              </div>
            </div>
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <div className="detail-group">
                <label className="detail-label small text-muted mb-1">
                  <i className="fas fa-clock me-2"></i>
                  Life
                </label>
                <div className="detail-value fw-medium">
                  {item?.life ? `${item.life} days` : "-"}
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="detail-group">
                <label className="detail-label small text-muted mb-1">
                  <i className="fas fa-toggle-on me-2"></i>
                  Status
                </label>
                <div className="detail-value">
                  <span className={`badge status ${item?.status?.toLowerCase() || "inactive"}`}>
                    {item?.status || "Inactive"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-footer">
        <button
          type="button"
          className="btn btn-secondary border border-0 text-8 px-3 fw-medium py-2"
          onClick={onClose}
        >
          <i className="fa-solid fa-x me-2"></i>
          Close
        </button>
      </div>
    </div>
  );
};

export default ItemMasterModal;
