import React, { useContext, useState } from "react";
import "./Users.css";
import { AppContext } from "../../context/AppContext";

const Users = () => {
  // const [showAddUserModal, setShowAddUserModal] = useState(false);
  const { isAddUser, setIsAddUser } = useContext(AppContext);
  const [isReset, setIsReset] = useState(false);
  const [accessModules, setAccessModules] = useState([]);
  const [isChecked, setIsChecked] = useState(true);
  const [status, setStatus] = useState("active");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const users = [
    {
      id: 1,
      name: "John Smith",
      role: "Admin",
      time: "2024-02-20 10:30 AM",
      email: "john@example.com",
      img: "https://ui-avatars.com/api/?name=John+Smith&size=32&background=2563eb&color=fff",
      status: "Active",
    },
    {
      id: 2,
      name: "Mike Johnson",
      role: "Manager",
      time: "2024-06-12 08:52 AM",
      email: "mike@example.com",
      img: "https://ui-avatars.com/api/?name=Mike+Johnson&size=32&background=2563eb&color=fff",
      status: "Inactive",
    },
  ];

  const masters = [
    {
      id: 1,
      name: "Vendor Master",
      type: "vendorMaster",
    },
    {
      id: 2,
      name: "Part Master",
      type: "partMaster",
    },
    {
      id: 3,
      name: "BOM",
      type: "bom",
    },
    {
      id: 4,
      name: "Group Master",
      type: "groupMaster",
    },
    {
      id: 5,
      name: "Item Master",
      type: "itemMaster",
    },
    {
      id: 6,
      name: "Warehouse Master",
      type: "warehouseMaster",
    },
  ];

  const transactions = [
    {
      id: 1,
      name: "Incoming",
      type: "incoming",
    },
    {
      id: 2,
      name: "Incoming Reprint",
      type: "incomingReprint",
    },
    {
      id: 3,
      name: "IQC Check",
      type: "iqcCheck",
    },
    {
      id: 4,
      name: "Requisition",
      type: "requisition",
    },
    {
      id: 5,
      name: "Issue Production",
      type: "issueProduction",
    },
    {
      id: 6,
      name: "Requisition Receipt",
      type: "requisitionReceipt",
    },
    {
      id: 7,
      name: "Production",
      type: "production",
    },
    {
      id: 8,
      name: "WIP",
      type: "wip",
    },
  ];

  const reports = [
    {
      id: 1,
      name: "Inventory Reports",
      type: "inventoryReports",
    },
    {
      id: 2,
      name: "Transaction Reports",
      type: "transactionReports",
    },
    {
      id: 3,
      name: "Production Reports",
      type: "productionReports",
    },
  ];

  const administrations = [
    {
      id: 1,
      name: "User Management",
      type: "userManagement",
    },
    {
      id: 2,
      name: "Role Management",
      type: "roleManagement",
    },
    {
      id: 3,
      name: "System Settings",
      type: "systemSettings",
    },
    {
      id: 4,
      name: "Audit Logs",
      type: "auditLogs",
    },
  ];

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

  const handleUserCheckboxChange = (userId) => {
    setSelectedUsers((prevSelected) =>
      prevSelected.includes(userId)
        ? prevSelected.filter((id) => id !== userId)
        : [...prevSelected, userId]
    );
  };

  const handleSelectAllChange = (e) => {
    const checked = e.target.checked;
    setSelectAll(checked);
    if (checked) {
      const allUserIds = users.map((user) => user.id);
      setSelectedUsers(allUserIds);
    } else {
      setSelectedUsers([]);
    }
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    alert("User Added Successfully");
  };

  const handleCheckboxChange = (e) => {
    const { id, checked } = e.target;

    setAccessModules((prev) =>
      checked ? [...prev, id] : prev.filter((item) => item !== id)
    );
  };

  const handleSwitchState = (e, status) => {
    e.preventDefault();
    status === "active" ? setIsChecked(true) : setIsChecked(false);
  };

  const handleViewDetails = (e) => {
    e.preventDefault();
    alert("Will come soon...");
  };

  const handleEditUser = (e) => {
    e.preventDefault();
    alert("Coming soon...");
  };

  return (
    <div>
      {/* Search and Filter Section */}
      <div className="search-filter-container">
        <div className="search-container content-container">
          <div className="position-relative w-100">
            <i className="fas fa-search position-absolute input-icon"></i>
            <input
              type="text"
              className="form-control search-bar-style"
              id="search"
              placeholder="Search users by name, email, or role..."
            />
          </div>
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
              <button
                className="btn-close"
                onClick={() => setIsAddUser(false)}
              ></button>
            </div>
            {/* Form Fields Section */}
            <form autoComplete="off" className="user-form">
              <div className="form-grid">
                <div className="row">
                  <div className="col-4 d-flex flex-column form-group">
                    <label htmlFor="userId" className="form-label">
                      Full name
                    </label>
                    <div className="position-relative w-100">
                      <i className="fas fa-user position-absolute input-icon"></i>
                      <input
                        type="text"
                        className="form-control text-font ps-5"
                        id="userId"
                        placeholder="Enter full name"
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
                        className="form-control text-font ps-5"
                        id="email"
                        placeholder="Enter email address"
                        autoComplete="off"
                      />
                    </div>
                  </div>
                  <div className="col-4 d-flex flex-column form-group">
                    <label htmlFor="pass" className="form-label">
                      Password
                    </label>
                    <div className="position-relative w-100">
                      <i className="fas fa-lock position-absolute input-icon"></i>
                      <input
                        type="password"
                        className="form-control text-font ps-5"
                        id="pass"
                        placeholder="Enter your password"
                        autoComplete="off"
                      />
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-4 d-flex flex-column form-group">
                    <label htmlFor="role" className="form-label">
                      Role
                    </label>
                    <div className="position-relative w-100">
                      <i className="fas fa-user-tag position-absolute input-icon"></i>
                      <select
                        className="form-control ps-5 text-font"
                        id="role"
                        placeholder="Role"
                        data-bs-toggle="dropdown"
                      >
                        <option value="">Select Role</option>
                        <option value="admin">Admin</option>
                        <option value="executive">Executive</option>
                        <option value="manager">Manager</option>
                      </select>
                      <i className="fa-solid fa-angle-down position-absolute down-arrow-icon"></i>
                    </div>
                  </div>
                  <div className="col-4 d-flex flex-column form-group">
                    <label htmlFor="department" className="form-label">
                      Department
                    </label>
                    <div className="position-relative w-100">
                      <i className="fa-solid fa-building position-absolute input-icon"></i>
                      <select
                        className="form-control ps-5 text-font"
                        id="department"
                        placeholder="Department"
                        data-bs-toggle="dropdown"
                      >
                        <option value="">Select Department</option>
                        <option value="production">Production</option>
                        <option value="store">Store</option>
                      </select>
                      <i className="fa-solid fa-angle-down position-absolute down-arrow-icon"></i>
                    </div>
                  </div>
                  <div className="col-4 d-flex flex-column form-group">
                    <label htmlFor="status" className="form-label">
                      Status
                    </label>
                    <div className="position-relative w-100">
                      <div className="form-check form-switch position-absolute input-icon padding-left-2">
                        <input
                          className="form-check-input text-font switch-style"
                          type="checkbox"
                          role="switch"
                          id="switchCheckChecked"
                          checked={isChecked}
                          onChange={(e) => {
                            setIsChecked(e.target.checked);
                            setStatus(e.target.checked ? "active" : "inactive");
                          }}
                        />

                        <label
                          className="form-check-label"
                          htmlFor="switchCheckChecked"
                        ></label>
                      </div>
                      <select
                        className="form-control text-font switch-padding"
                        id="status"
                        value={status}
                        onChange={(e) => {
                          const newStatus = e.target.value;
                          setStatus(newStatus);
                          setIsChecked(newStatus === "active");
                        }}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                      <i className="fa-solid fa-angle-down position-absolute down-arrow-icon"></i>
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-4 d-flex flex-column form-group">
                    <label htmlFor="branch" className="form-label">
                      Branch
                    </label>
                    <div className="position-relative w-100">
                      <i className="fa-solid fa-sitemap position-absolute input-icon"></i>
                      <select
                        className="form-control ps-5 text-font"
                        id="branch"
                        placeholder="Branch"
                        data-bs-toggle="dropdown"
                      >
                        <option value="">Select Branch</option>
                        <option value="iqc">IQC</option>
                        <option value="executive">Production</option>
                      </select>
                      <i className="fa-solid fa-angle-down position-absolute down-arrow-icon"></i>
                    </div>
                  </div>
                </div>
              </div>

              <div className="permissions-section">
                <p className="text-heading">Module Permissions</p>
                <div className="row">
                  <div className="table-list-container">
                    <table>
                      <thead>
                        <tr>
                          <th className="p-0">
                            <i className="fa-solid fa-database icon-blue-color me-2"></i>
                            Masters
                          </th>
                          <th className="p-0">
                            <span className="icon-align">
                              <button
                                className="btn-icon btn-primary margin-right-10"
                                title="View Details"
                              >
                                <i className="fas fa-eye view-primary view-icon"></i>
                              </button>
                              <button
                                className="btn-icon btn-success"
                                title="Edit"
                              >
                                <i className="fas fa-edit edit-success view-icon"></i>
                              </button>
                            </span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {masters.map((master) => (
                          <tr key={master.type}>
                            <td className="user-info">{master.name}</td>
                            <td className="icon-align">
                              <button
                                className="btn-icon btn-primary margin-right-10"
                                title="View Details"
                                onClick={handleViewDetails}
                              >
                                <i className="fas fa-eye view-primary view-icon"></i>
                              </button>
                              <button
                                className="btn-icon btn-success"
                                title="Edit"
                                onClick={handleEditUser}
                              >
                                <i className="fas fa-edit edit-success view-icon"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="table-list-container">
                    <table>
                      <thead>
                        <tr>
                          <th className="p-0">
                            <i className="fas fa-exchange-alt icon-blue-color me-2"></i>
                            Transactions
                          </th>
                          <th className="p-0">
                            <span className="icon-align">
                              <button
                                className="btn-icon btn-primary margin-right-10"
                                title="View Details"
                              >
                                <i className="fas fa-eye view-primary view-icon"></i>
                              </button>
                              <button
                                className="btn-icon btn-success"
                                title="Edit"
                              >
                                <i className="fas fa-edit edit-success view-icon"></i>
                              </button>
                            </span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map((transaction) => (
                          <tr key={transaction.type}>
                            <td className="user-info">{transaction.name}</td>
                            <td className="icon-align">
                              <button
                                className="btn-icon btn-primary margin-right-10"
                                title="View Details"
                                onClick={handleViewDetails}
                              >
                                <i className="fas fa-eye view-primary view-icon"></i>
                              </button>
                              <button
                                className="btn-icon btn-success"
                                title="Edit"
                                onClick={handleEditUser}
                              >
                                <i className="fas fa-edit edit-success view-icon"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="table-list-container">
                    <table>
                      <thead>
                        <tr>
                          <th className="p-0">
                            <i className="fas fa-chart-bar icon-blue-color me-2"></i>
                            Reports
                          </th>
                          <th className="p-0">
                            <span className="icon-align">
                              <button
                                className="btn-icon btn-primary margin-right-10"
                                title="View Details"
                              >
                                <i className="fas fa-eye view-primary view-icon"></i>
                              </button>
                              <button
                                className="btn-icon btn-success"
                                title="Edit"
                              >
                                <i className="fas fa-edit edit-success view-icon"></i>
                              </button>
                            </span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {reports.map((report) => (
                          <tr key={report.type}>
                            <td className="user-info">{report.name}</td>
                            <td className="icon-align">
                              <button
                                className="btn-icon btn-primary margin-right-10"
                                title="View Details"
                                onClick={handleViewDetails}
                              >
                                <i className="fas fa-eye view-primary view-icon"></i>
                              </button>
                              <button
                                className="btn-icon btn-success"
                                title="Edit"
                                onClick={handleEditUser}
                              >
                                <i className="fas fa-edit edit-success view-icon"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="table-list-container">
                    <table>
                      <thead>
                        <tr>
                          <th className="p-0">
                            <i className="fas fa-cog icon-blue-color me-2"></i>
                            Administration
                          </th>
                          <th className="p-0">
                            <span className="icon-align">
                              <button
                                className="btn-icon btn-primary margin-right-10"
                                title="View Details"
                              >
                                <i className="fas fa-eye view-primary view-icon"></i>
                              </button>
                              <button
                                className="btn-icon btn-success"
                                title="Edit"
                              >
                                <i className="fas fa-edit edit-success view-icon"></i>
                              </button>
                            </span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {administrations.map((administration) => (
                          <tr key={administration.type}>
                            <td className="user-info">{administration.name}</td>
                            <td className="icon-align">
                              <button
                                className="btn-icon btn-primary margin-right-10"
                                title="View Details"
                                onClick={handleViewDetails}
                              >
                                <i className="fas fa-eye view-primary view-icon"></i>
                              </button>
                              <button
                                className="btn-icon btn-success"
                                title="Edit"
                                onClick={handleEditUser}
                              >
                                <i className="fas fa-edit edit-success view-icon"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="form-actions">
                <button
                  className="btn btn-primary border border-0 add-btn me-3 float-end"
                  onClick={handleAddUser}
                >
                  <i className="fa-solid fa-floppy-disk me-1"></i> Save Changes
                </button>
                <button
                  className="btn btn-secondary border border-0 bg-secondary add-btn me-3 float-end"
                  onClick={() => setIsReset(true)}
                >
                  {/* <i className="fa-solid fa-xmark me-1"></i> */}
                  <i className="fa-solid fa-arrows-rotate me-1"></i> Reset
                </button>
              </div>
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
                      <div className="mt-2 d-flex flex-wrap gap-2">
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
      <div className="margin-2">
        {/* Table Section */}
        <div className="table-container">
          {/* Table Header */}
          <div className="table-header">
            <div className="selected-count">
              <input
                type="checkbox"
                id="select-all"
                checked={selectAll}
                onChange={handleSelectAllChange}
              />
              <label htmlFor="select-all">
                {selectedUsers.length} Selected
              </label>
            </div>
            <div className="bulk-actions">
              <button className="btn-action">
                <i className="fas fa-envelope"></i>
                Email Selected
              </button>
              <button className="btn-action btn-danger">
                <i className="fas fa-trash"></i>
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
                  User <i className="fas fa-sort color-gray"></i>
                </th>
                <th>
                  Role <i className="fas fa-sort color-gray"></i>
                </th>
                <th>
                  Email <i className="fas fa-sort color-gray"></i>
                </th>
                <th>Last Login</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="checkbox-cell">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleUserCheckboxChange(user.id)}
                    />
                  </td>
                  <td>
                    <div className="user-info">
                      <img src={user.img} alt={user.name} />
                      <span>{user.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${user.role.toLowerCase()}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>{user.email}</td>
                  <td>{user.time}</td>
                  <td>
                    <span
                      className={`badge status ${user.status.toLowerCase()}`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="actions">
                    <button
                      className="btn-icon btn-primary"
                      title="View Details"
                    >
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
              ))}
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
              <button className="btn-page" disabled>
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
    </div>
  );
};

export default Users;
