import React, { useContext, useState } from "react";
import "./Users.css";
import { AppContext } from "../../context/AppContext";

const Users = () => {
  // const [showAddUserModal, setShowAddUserModal] = useState(false);
  const { isAddUser, setIsAddUser } = useContext(AppContext);

  const [accessModules, setAccessModules] = useState([]);

  const handleCheckboxChange = (e) => {
    const { id, checked } = e.target;

    setAccessModules((prev) =>
      checked ? [...prev, id] : prev.filter((item) => item !== id)
    );
  };

  const modules = [
    "vendorMaster",
    "itemMaster",
    "warehouseMaster",
    "bom",
    "typeMaster",
    "groupMaster",
    "partMaster",
    "incoming",
    "incomingMaster",
    "iqc",
    "requisition",
    "issueProduction",
    "requisitionReceipt",
    "productionReceipt",
    "wipReturn",
  ];

  const moduleLabels = {
    vendorMaster: "Vendor Master",
    itemMaster: "Item Master",
    warehouseMaster: "Warehouse Master",
    bom: "BOM",
    typeMaster: "Type Master",
    groupMaster: "Group Master",
    partMaster: "Part Master",
    incoming: "Incoming",
    incomingMaster: "Incoming Reprint",
    iqc: "IQC",
    requisition: "Requisition",
    issueProduction: "Issue Production",
    requisitionReceipt: "Requisition Receipt",
    productionReceipt: "Production Receipt",
    wipReturn: "WIP Return",
  };

  // const handleAddUser = () => {
  //   // Add User Logic
  //   setShowAddUserModal(true);
  // };

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
      {isAddUser && (
        <div className="table-form-container">
          <div className="form-container">
            <div className="form-header">
              <h2>
                <i className="fas fa-user-plus"></i> Add New User
              </h2>
            </div>
            <form autoComplete="off" className="userForm">
              <div className="row">
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="userId" className="form-label">
                    User Name
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-user position-absolute input-icon"></i>
                    <input
                      type="text"
                      className="form-control ps-5"
                      id="userId"
                      placeholder="Enter Full Name"
                    />
                  </div>
                </div>
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <div className="position-relative w-100">
                    <i className="fa-solid fa-envelope position-absolute input-icon"></i>
                    <input
                      type="email"
                      className="form-control ps-5"
                      id="email"
                      placeholder="Enter Email"
                    />
                  </div>
                </div>
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="userId" className="form-label">
                    Password
                  </label>
                  <div className="position-relative w-100">
                    <i className="fa-solid fa-key position-absolute input-icon"></i>
                    <input
                      type="password"
                      className="form-control ps-5 ms-2"
                      id="password"
                      placeholder="Password"
                    />
                  </div>
                </div>
              </div>
              <div className="row mt-2">
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="role" className="form-label">
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
                  </div>
                </div>
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="department" className="form-label">
                    Department
                  </label>
                  <div className="position-relative w-100">
                    <i className="fa-solid fa-building position-absolute input-icon"></i>
                    <select
                      className="form-control ps-5 ms-2"
                      id="department"
                      placeholder="Department"
                      data-bs-toggle="dropdown"
                    >
                      <option value="">Select Department</option>
                      <option value="production">Production</option>
                      <option value="store">Store</option>
                    </select>
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
                  </div>
                </div>
              </div>
              <div>
                <p className="text-heading">Module Permissions</p>
                <div className="row">
                  <div className="col-md-3 table-list-container">
                    <table>
                      <thead>
                        <tr>
                          <th>
                            <i className="fa-solid fa-database me-2"></i>Masters
                          </th>
                          <th>
                            <i className="fas fa-sort"></i> Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr id="vendorMaster">
                          <td className="user-info">Vendor Master</td>
                          <td className="icon-align">
                            <button
                              className="btn-icon btn-primary"
                              title="View Details"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button
                              className="btn-icon btn-success"
                              title="Edit"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                          </td>
                        </tr>
                        <tr id="partMaster">
                          <td className="user-info">Part Master</td>
                          <td className="icon-align">
                            <button
                              className="btn-icon btn-primary"
                              title="View Details"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button
                              className="btn-icon btn-success"
                              title="Edit"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                          </td>
                        </tr>
                        <tr id="bom">
                          <td className="user-info">BOM</td>
                          <td className="icon-align">
                            <button
                              className="btn-icon btn-primary"
                              title="View Details"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button
                              className="btn-icon btn-success"
                              title="Edit"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                          </td>
                        </tr>
                        <tr id="partMaster">
                          <td className="user-info">Group Master</td>
                          <td className="icon-align">
                            <button
                              className="btn-icon btn-primary"
                              title="View Details"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button
                              className="btn-icon btn-success"
                              title="Edit"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                          </td>
                        </tr>
                        <tr id="partMaster">
                          <td className="user-info">Item Master</td>
                          <td className="icon-align">
                            <button
                              className="btn-icon btn-primary"
                              title="View Details"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button
                              className="btn-icon btn-success"
                              title="Edit"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                          </td>
                        </tr>
                        <tr id="partMaster">
                          <td className="user-info">Warehouse Master</td>
                          <td className="icon-align">
                            <button
                              className="btn-icon btn-primary"
                              title="View Details"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button
                              className="btn-icon btn-success"
                              title="Edit"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="col-md-3 table-list-container">
                    <table>
                      <thead>
                        <tr>
                          <th>
                            <i className="fa-solid fa-database me-2"></i>
                            Transactions
                          </th>
                          <th>
                            <i className="fas fa-sort"></i> Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr id="incoming">
                          <td className="user-info">Incoming</td>
                          <td className="icon-align">
                            <button
                              className="btn-icon btn-primary"
                              title="View Details"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button
                              className="btn-icon btn-success"
                              title="Edit"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                          </td>
                        </tr>
                        <tr id="incomingRerint">
                          <td className="user-info">Incoming Reprint</td>
                          <td className="icon-align">
                            <button
                              className="btn-icon btn-primary"
                              title="View Details"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button
                              className="btn-icon btn-success"
                              title="Edit"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                          </td>
                        </tr>
                        <tr id="iqc">
                          <td className="user-info">IQC Check</td>
                          <td className="icon-align">
                            <button
                              className="btn-icon btn-primary"
                              title="View Details"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button
                              className="btn-icon btn-success"
                              title="Edit"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                          </td>
                        </tr>
                        <tr id="requisition">
                          <td className="user-info">Requisition</td>
                          <td className="icon-align">
                            <button
                              className="btn-icon btn-primary"
                              title="View Details"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button
                              className="btn-icon btn-success"
                              title="Edit"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                          </td>
                        </tr>
                        <tr id="issueProduction">
                          <td className="user-info">Issue Production</td>
                          <td className="icon-align">
                            <button
                              className="btn-icon btn-primary"
                              title="View Details"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button
                              className="btn-icon btn-success"
                              title="Edit"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                          </td>
                        </tr>
                        <tr id="requisitionReceipt">
                          <td className="user-info">Requisition Receipt</td>
                          <td className="icon-align">
                            <button
                              className="btn-icon btn-primary"
                              title="View Details"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button
                              className="btn-icon btn-success"
                              title="Edit"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                          </td>
                        </tr>
                        <tr id="production">
                          <td className="user-info">Production</td>
                          <td className="icon-align">
                            <button
                              className="btn-icon btn-primary"
                              title="View Details"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button
                              className="btn-icon btn-success"
                              title="Edit"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                          </td>
                        </tr>
                        <tr id="wip">
                          <td className="user-info">WIP</td>
                          <td className="icon-align">
                            <button
                              className="btn-icon btn-primary"
                              title="View Details"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button
                              className="btn-icon btn-success"
                              title="Edit"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="col-md-3 table-list-container">
                    <table>
                      <thead>
                        <tr>
                          <th>
                            <i className="fa-solid fa-database me-2"></i>Reports
                          </th>
                          <th>
                            <i className="fas fa-sort"></i> Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr id="inventoryReports">
                          <td className="user-info">Inventory Reports</td>
                          <td className="icon-align">
                            <button
                              className="btn-icon btn-primary"
                              title="View Details"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button
                              className="btn-icon btn-success"
                              title="Edit"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                          </td>
                        </tr>
                        <tr id="transactionReports">
                          <td className="user-info">Transaction Reports</td>
                          <td className="icon-align">
                            <button
                              className="btn-icon btn-primary"
                              title="View Details"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button
                              className="btn-icon btn-success"
                              title="Edit"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                          </td>
                        </tr>
                        <tr id="productionReports">
                          <td className="user-info">Production Reports</td>
                          <td className="icon-align">
                            <button
                              className="btn-icon btn-primary"
                              title="View Details"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button
                              className="btn-icon btn-success"
                              title="Edit"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="col-md-3 table-list-container">
                    <table>
                      <thead>
                        <tr>
                          <th>
                            <i className="fa-solid fa-database me-2"></i>
                            Administration
                          </th>
                          <th>
                            <i className="fas fa-sort"></i> Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr id="userManagement">
                          <td className="user-info">User Management</td>
                          <td className="icon-align">
                            <button
                              className="btn-icon btn-primary"
                              title="View Details"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button
                              className="btn-icon btn-success"
                              title="Edit"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                          </td>
                        </tr>
                        <tr id="roleManagement">
                          <td className="user-info">Role Management</td>
                          <td className="icon-align">
                            <button
                              className="btn-icon btn-primary"
                              title="View Details"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button
                              className="btn-icon btn-success"
                              title="Edit"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                          </td>
                        </tr>
                        <tr id="systemSettings">
                          <td className="user-info">System settings</td>
                          <td className="icon-align">
                            <button
                              className="btn-icon btn-primary"
                              title="View Details"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button
                              className="btn-icon btn-success"
                              title="Edit"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                          </td>
                        </tr>
                        <tr id="auditLogs">
                          <td className="user-info">Audit Logs</td>
                          <td className="icon-align">
                            <button
                              className="btn-icon btn-primary"
                              title="View Details"
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button
                              className="btn-icon btn-success"
                              title="Edit"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <button className="btn btn-primary border border-0 add-user-btn me-3 mb-3 mt-3 float-end">
                <i className="fa-solid fa-floppy-disk"></i> Save Changes
              </button>
              <button
                className="btn btn-primary border border-0 add-user-btn me-3 mb-3 mt-3 float-end"
                onClick={() => setIsAddUser(false)}
              >
                <i className="fa-solid fa-xmark"></i> Cancel
              </button>
              <div className="row">
                <div className="col-6 d-flex align-items-center mt-2">
                  <div className="dropdown col-12">
                    {/* <button
                  className="btn btn-light dropdown-toggle ms-2"
                  type="button"
                  data-bs-toggle="dropdown"
                >
                  Access
                </button> */}

                    <ul
                      className="dropdown-menu p-3"
                      style={{ maxHeight: "300px", overflowY: "auto" }}
                    >
                      {modules.map((id) => (
                        <li key={id}>
                          <input
                            type="checkbox"
                            className="form-check-input me-2"
                            id={id}
                            checked={accessModules.includes(id)}
                            onChange={handleCheckboxChange}
                          />
                          <label htmlFor={id}>{moduleLabels[id]}</label>
                        </li>
                      ))}
                    </ul>

                    {/* Selected Access Display */}
                    {accessModules.length > 0 && (
                      <div className="mt-2 ms-2 d-flex flex-wrap gap-2">
                        {accessModules.map((id, key) => (
                          <div>
                            <span key={id} className="badge bg-success">
                              {moduleLabels[id]}
                              {/* <button
                          type="button"
                          className="btn-close"
                          onClick={() => ""}
                        ></button> */}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
      <div className="table-form-container">
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
