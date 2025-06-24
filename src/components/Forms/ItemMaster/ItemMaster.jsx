import React from "react";
import ItemMasterModal from "../../Modals/ItemMasterModal";

const ItemMaster = () => {
  return (
    <div>
      <div className="row">
        {/* Search and Filter Section */}
        <div className="search-filter-container">
          <div className="search-box">
            <i className="fas fa-search position-absolute input-icon"></i>
            <input
              type="text"
              className="form-control vendor-search-bar"
              placeholder="Search by name, email, or city..."
            />
          </div>
          <div className="filter-options">
            <input
              type="text"
              className="form-control text-font"
              id="itemCode"
              placeholder="Item code"
              aria-label="Item code"
            />
            <input
              type="text"
              className="form-control text-font"
              id="itemName"
              placeholder="Item name"
              aria-label="Item name"
            />
            {/* <select className="filter-select">
            <option value="">All Types</option>
            <option value="vendor">Vendors Only</option>
            <option value="customer">Customers Only</option>
          </select>
          <select className="filter-select">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select> */}
            {/* <button className="filter-select">
            <i className="fas fa-filter me-2"></i>
            More Filters
          </button> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemMaster;
