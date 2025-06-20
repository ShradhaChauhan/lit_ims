import React, { useState } from "react";
import AddUserModal from "../Modals/AddUserModal";
import "./Users.css";

const Users = () => {
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  const handleAddUser = () => {
    // Add User Logic
    setShowAddUserModal(true);
  };

  return (
    <div>
      {/* Search and Filter Section */}
      <div className="search-filter-container">
        {/* <div className="form-control search-input">
          <i className="fas fa-search"></i>
          <input type="text" placeholder="Search by users by name" />
        </div> */}
        <div className="search-container col-md-8">
          <input
            type="text"
            className="form-control search-input ps-5"
            placeholder="Search..."
          />
          <i className="fas fa-search search-icon position-absolute"></i>
        </div>
        <div className="filter-options">
          <select className="filter-select">
            <option value="">All Roles</option>
            <option value="active">Admin</option>
            <option value="inactive">Manager</option>
          </select>
        </div>
        <div className="filter-options">
          <select className="filter-select">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Form Section */}
      <div className="form-container"></div>

      {/* Table Section */}
      <div className="table-container">
        {/* Table Header */}
        <div className="table-header">
          <div className="selected-count">
            <input type="checkbox" id="select-all" />
            <label htmlFor="select-all">0 Selected</label>
          </div>
          <div className="bulk-actions">
            <button className="btn btn-outline-success">
              <i className="fas fa-envelope pe-2"></i>
              Email Selected
            </button>
            <button className="btn btn-outline-danger">
              <i className="fas fa-trash pe-2"></i>
              Delete Selected
            </button>
          </div>
        </div>
        {/* Table list */}
        <table>
          <thead>
            <tr>
              <th className="checkbox-cell">
                <input type="checkbox" id="select-all" />
              </th>
              <th>
                User <i className="fas fa-sort"></i>
              </th>
              <th>
                Role <i className="fas fa-sort"></i>
              </th>
              <th>
                Email <i className="fas fa-sort"></i>
              </th>
              <th>
                Last Login <i className="fas fa-sort"></i>
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
                <span className="badge admin">Admin</span>
              </td>
              <td>john@example.com</td>
              <td>2024-02-20 10:30 AM</td>
              <td>
                <span className="status active">active</span>
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
                    src="https://ui-avatars.com/api/?name=Mike+Johnson&size=32&background=2563eb&color=fff"
                    alt="Sarah Johnson"
                  />
                  <span>Mike</span>
                </div>
              </td>
              <td>
                <span className="badge manager">Manager</span>
              </td>
              <td>sarah@example.com</td>
              <td>2024-06-12 09:40 PM</td>
              <td>
                <span className="status inactive">inactive</span>
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

      {/* Add User Modal */}
      {/* {showAddUserModal && (
        <div
          className="modal show fade d-block"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add User</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAddUserModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <AddUserModal />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleAddUser}
                >
                  Save
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddUserModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )} */}
    </div>
  );
};

export default Users;
