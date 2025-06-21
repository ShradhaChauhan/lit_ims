import React, { useContext, useState } from "react";
import "./VendorMaster.css";
import VendorModal from "../../Modals/VendorModal";
import { AppContext } from "../../../context/AppContext";

const VendorMaster = () => {
  const { isAddVendor, setIsAddVendor } = useContext(AppContext);

  return (
    <div className="">
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
          <select className="filter-select">
            <option value="">All Types</option>
            <option value="vendor">Vendors Only</option>
            <option value="customer">Customers Only</option>
          </select>
          <select className="filter-select">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button className="btn-filter more-filter">
            <i className="fas fa-filter"></i>
            More Filters
          </button>
        </div>
      </div>

      {/* Form Header Section */}
      {isAddVendor && (
        <div className="table-form-container">
          <div className="form-header">
            <h2>
              <i className="fas fa-user-plus"></i> Add New Vendor/Customer
            </h2>
            <button className="btn-close" onClick={() => setIsAddVendor(false)}>
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
          {/* Form Fields */}
          <form autoComplete="off" className="righ-side-form">
            <div className="row form-style">
              <div className="col-4 d-flex flex-column form-group">
                <label htmlFor="type" className="form-label">
                  Type
                </label>
                <div className="position-relative w-100">
                  <i className="fas fa-user-tag position-absolute input-icon"></i>
                  <select
                    className="form-control ps-5 ms-2"
                    id="type"
                    placeholder="Type"
                    data-bs-toggle="dropdown"
                  >
                    <option value="">Select Type</option>
                    <option value="vendor">Vendor</option>
                    <option value="customer">Customer</option>
                  </select>
                  <i class="fa-solid fa-angle-down position-absolute down-arrow-icon"></i>
                </div>
              </div>
              <div className="col-4 d-flex flex-column form-group">
                <label htmlFor="name" className="form-label">
                  Name
                </label>
                <div className="position-relative w-100">
                  <i className="fas fa-user position-absolute input-icon"></i>
                  <input
                    type="text"
                    className="form-control ps-5"
                    id="name"
                    placeholder="Enter full name"
                  />
                </div>
              </div>
              <div className="col-4 d-flex flex-column form-group">
                <label htmlFor="mobile" className="form-label">
                  Mobile
                </label>
                <div className="position-relative w-100">
                  <i className="fas fa-phone position-absolute input-icon"></i>
                  <input
                    type="tel"
                    className="form-control ps-5 ms-2"
                    id="mobile"
                    placeholder="Enter mobile number"
                  />
                </div>
              </div>
            </div>
            <div className="row form-style">
              <div className="col-4 d-flex flex-column form-group">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <div className="position-relative w-100">
                  <i className="fa-solid fa-envelope position-absolute input-icon"></i>
                  <input
                    type="email"
                    className="form-control ps-5 ms-2"
                    id="email"
                    placeholder="Enter email address"
                  />
                </div>
                {/* <label htmlFor="role" className="form-label">
                Role
              </label>
              <div className="position-relative w-100">
                <i className="fa-solid fa-briefcase position-absolute input-icon"></i>
                <select
                  className="form-control ps-5 ms-2"
                  id="role"
                  placeholder="Role"
                  data-bs-toggle="dropdown"
                >
                  <option value="">Select Role</option>
                  <option value="admin">Admin</option>
                  <option value="executive">Executive</option>
                  <option value="manager">Manager</option>
                </select>
              </div> */}
              </div>
              <div className="col-4 d-flex flex-column form-group">
                <label htmlFor="city" className="form-label">
                  City
                </label>
                <div className="position-relative w-100">
                  <i className="fas fa-city position-absolute input-icon"></i>
                  <input
                    type="text"
                    className="form-control ps-5 ms-2"
                    id="city"
                    placeholder="Enter city"
                  />
                </div>
              </div>
              <div className="col-4 d-flex flex-column form-group">
                <label htmlFor="state" className="form-label">
                  State
                </label>
                <div className="position-relative w-100">
                  <i className="fa-solid fa-map-pin position-absolute input-icon"></i>
                  <input
                    type="text"
                    className="form-control ps-5 ms-2"
                    id="state"
                    placeholder="Enter state"
                  />
                </div>
              </div>
            </div>
            <div className="row form-style">
              <div className="col-4 d-flex flex-column form-group">
                <label htmlFor="address" className="form-label">
                  Address
                </label>
                <div className="position-relative w-100">
                  <i className="fas fa-map-marker-alt position-absolute input-icon"></i>
                  <textarea
                    type="text"
                    className="form-control ps-5 ms-2"
                    id="address"
                    placeholder="Enter complete address"
                  ></textarea>
                </div>
              </div>
              <div className="col-4 d-flex flex-column form-group">
                <label htmlFor="status" className="form-label">
                  Status
                </label>
                <div className="position-relative w-100">
                  <i className="fa-solid fa-toggle-on position-absolute input-icon"></i>
                  <select
                    className="form-control ps-5 ms-2"
                    id="status"
                    placeholder="Status"
                    data-bs-toggle="dropdown"
                  >
                    <option value="">Select Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <i class="fa-solid fa-angle-down position-absolute down-arrow-icon"></i>
                </div>
              </div>
            </div>
            <button
              className="btn btn-primary border border-0 add-user-btn me-3 mb-3 mt-3 float-end"
              onClick={() => setIsAddVendor(false)}
            >
              <i className="fa-solid fa-xmark"></i> Cancel
            </button>
            <button className="btn btn-secondary border border-0 add-user-btn me-3 mb-3 mt-3 float-end">
              <i className="fa-solid fa-floppy-disk"></i> Save Changes
            </button>
          </form>
        </div>
      )}

      {/* Table Section */}
      <div className="table-container">
        <div className="table-header">
          <div className="selected-count">
            <input type="checkbox" id="select-all" />
            <label htmlFor="select-all">0 Selected</label>
          </div>
          <div className="bulk-actions">
            <button className="btn btn-outline-success btn-style">
              <i className="fas fa-envelope pe-2"></i>
              Email Selected
            </button>
            <button className="btn btn-outline-danger btn-style">
              <i className="fas fa-trash pe-2"></i>
              Delete Selected
            </button>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th className="checkbox-cell">
                <input type="checkbox" id="select-all" />
              </th>
              <th>
                Name <i className="fas fa-sort"></i>
              </th>
              <th>
                Type <i className="fas fa-sort"></i>
              </th>
              <th>
                Email <i className="fas fa-sort"></i>
              </th>
              <th>Mobile</th>
              <th>
                City <i className="fas fa-sort"></i>
              </th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="checkbox-cell">
                <input type="checkbox" />
              </td>
              <td>
                <div className="user-info">
                  <img
                    src="https://ui-avatars.com/api/?name=John+Smith&size=32&background=2563eb&color=fff"
                    alt="John Smith"
                  />
                  <span>John Smith</span>
                </div>
              </td>
              <td>
                <span className="badge vendor">Vendor</span>
              </td>
              <td>john@example.com</td>
              <td>+1 234 567 890</td>
              <td>New York</td>
              <td>
                <span className="status active">Active</span>
              </td>
              <td className="actions">
                <button className="btn-icon btn-primary" title="View Details">
                  <i className="fas fa-eye"></i>
                </button>
                <button className="btn-icon btn-success" title="Edit">
                  <i className="fas fa-edit"></i>
                </button>
                <button className="btn-icon btn-danger" title="Delete">
                  <i className="fas fa-trash"></i>
                </button>
              </td>
            </tr>
            <tr>
              <td className="checkbox-cell">
                <input type="checkbox" />
              </td>
              <td>
                <div className="user-info">
                  <img
                    src="https://ui-avatars.com/api/?name=Sarah+Johnson&size=32&background=2563eb&color=fff"
                    alt="Sarah Johnson"
                  />
                  <span>Sarah Johnson</span>
                </div>
              </td>
              <td>
                <span className="badge customer">Customer</span>
              </td>
              <td>sarah@example.com</td>
              <td>+1 234 567 891</td>
              <td>Los Angeles</td>
              <td>
                <span className="status inactive">Inactive</span>
              </td>
              <td className="actions">
                <button className="btn-icon  btn-primary" title="View Details">
                  <i className="fas fa-eye"></i>
                </button>
                <button className="btn-icon  btn-success" title="Edit">
                  <i className="fas fa-edit"></i>
                </button>
                <button className="btn-icon btn-danger" title="Delete">
                  <i className="fas fa-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Pagination */}
        <div className="pagination-container">
          <div className="pagination-info">Showing 1-2 of 25 entries</div>
          <div className="pagination">
            <button className="btn-page" disabled>
              <i className="fas fa-chevron-left"></i>
            </button>
            <button className="btn-page active">1</button>
            <button className="btn-page">2</button>
            <button className="btn-page">3</button>
            <span className="pagination-ellipsis">...</span>
            <button className="btn-page">12</button>
            <button className="btn-page">
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
  );
};

export default VendorMaster;
