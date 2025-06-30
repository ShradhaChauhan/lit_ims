import React, { useContext, useState } from "react";
import "./Users.css";
import { AppContext } from "../../context/AppContext";
import { useRef, useEffect } from "react";
import { Modal } from "bootstrap";

const Users = () => {
  const userModalRef = useRef(null);
  const userEditModalRef = useRef(null);

  const {
    isAddUser,
    setIsAddUser,
    branchDropdownValues,
    setBranchDropdownValues,
  } = useContext(AppContext);
  const [accessModules, setAccessModules] = useState([]);
  const [isChecked, setIsChecked] = useState(true);
  const [status, setStatus] = useState("active");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    department: "",
    status: "active",
    branch: "",
  });
  const [isShowUserDetails, setIsShowUserDetails] = useState(false);
  const [isEditUserDetails, setIsEditUserDetails] = useState(false);
  const [userDetails, setUserDetails] = useState({
    id: "",
    name: "",
    role: "",
    time: "",
    email: "",
    img: "",
    status: "",
  });
  const [masterViewPermissions, setMasterViewPermissions] = useState({});
  const [isAllMastersViewChecked, setIsAllMastersViewChecked] = useState(false);
  const [masterEditPermissions, setMasterEditPermissions] = useState({});
  const [isAllMastersEditChecked, setIsAllMastersEditChecked] = useState(false);
  const [isAllTransactionsEditChecked, setIsAllTransactionsEditChecked] =
    useState(false);
  const [isAllTransactionsViewChecked, setIsAllTransactionsViewChecked] =
    useState(false);
  const [isAllReportsEditChecked, setIsAllReportsEditChecked] = useState(false);
  const [isAllReportsViewChecked, setIsAllReportsViewChecked] = useState(false);
  const [isAllAdministrationsEditChecked, setIsAllAdministrationsEditChecked] =
    useState(false);
  const [isAllAdministrationsViewChecked, setIsAllAdministrationsViewChecked] =
    useState(false);
  const [transactionViewPermissions, setTransactionViewPermissions] = useState(
    {}
  );
  const [transactionEditPermissions, setTransactionEditPermissions] = useState(
    {}
  );
  const [reportViewPermissions, setReportViewPermissions] = useState({});
  const [reportEditPermissions, setReportEditPermissions] = useState({});
  const [adminViewPermissions, setAdminViewPermissions] = useState({});
  const [adminEditPermissions, setAdminEditPermissions] = useState({});

  const users = [
    {
      id: 1,
      name: "John Smith",
      role: "Admin",
      lastLogin: "2024-02-20 10:30 AM",
      email: "john@example.com",
      img: "https://ui-avatars.com/api/?name=John+Smith&size=32&background=2563eb&color=fff",
      status: "Active",
    },
    {
      id: 2,
      name: "Mike Johnson",
      role: "Manager",
      lastLogin: "2024-06-12 08:52 AM",
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
      name: "BOM Master",
      type: "bomMaster",
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
    "bomMaster",
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
    bom: "BOM Master",
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

  const collectPermissions = () => {
    const all = [...masters, ...transactions, ...reports, ...administrations];
    return all.map((mod) => ({
      pageName: mod.name,
      canView:
        masterViewPermissions[mod.type] ||
        transactionViewPermissions[mod.type] ||
        reportViewPermissions[mod.type] ||
        adminViewPermissions[mod.type] ||
        false,
      canEdit:
        masterEditPermissions[mod.type] ||
        transactionEditPermissions[mod.type] ||
        reportEditPermissions[mod.type] ||
        adminEditPermissions[mod.type] ||
        false,
    }));
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    const finalData = {
      username: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role.toUpperCase(),
      branch: formData.branch,
      department: formData.department,
      status: formData.status,
      permissions: collectPermissions(),
    };

    console.log("Submitting form");
    fetch("", {
      method: "POST",
      body: finalData,
    }).then(function (response) {
      console.log(response);
      return response.json();
    });
    console.log("Form submitted. ", finalData);
  };

  const handleEditUser = (e) => {
    e.preventDefault();
    console.log("User has been edited");
  };

  const handleMasterViewAllChange = (e) => {
    const checked = e.target.checked;
    setIsAllMastersViewChecked(checked);

    const updatedPermissions = {};
    masters.forEach((item) => {
      updatedPermissions[item.type] = checked;
    });
    setMasterViewPermissions(updatedPermissions);
  };

  const handleMasterEditAllChange = (e) => {
    const checked = e.target.checked;
    setIsAllMastersEditChecked(checked);

    const updatedPermissions = {};
    masters.forEach((item) => {
      updatedPermissions[item.type] = checked;
    });
    setMasterEditPermissions(updatedPermissions);
  };

  const handleSingleMasterViewChange = (type) => {
    setMasterViewPermissions((prev) => {
      const updated = { ...prev, [type]: !prev[type] };
      const allChecked = masters.every((item) => updated[item.type]);
      setIsAllMastersViewChecked(allChecked);
      return updated;
    });
  };

  const handleSingleMasterEditChange = (type) => {
    setMasterEditPermissions((prev) => {
      const updated = { ...prev, [type]: !prev[type] };
      const allChecked = masters.every((item) => updated[item.type]);
      setIsAllMastersEditChecked(allChecked);
      return updated;
    });
  };

  const handleTransactionViewAllChange = (e) => {
    const checked = e.target.checked;
    setIsAllTransactionsViewChecked(checked);

    const updatedTransViewPermissions = {};
    transactions.forEach((item) => {
      updatedTransViewPermissions[item.type] = checked;
    });
    setTransactionViewPermissions(updatedTransViewPermissions);
  };

  const handleTransactionEditAllChange = (e) => {
    const checked = e.target.checked;
    setIsAllTransactionsEditChecked(checked);

    const updatedTransEditPermissions = {};
    transactions.forEach((item) => {
      updatedTransEditPermissions[item.type] = checked;
    });
    setTransactionEditPermissions(updatedTransEditPermissions);
  };

  const handleReportViewAllChange = (e) => {
    const checked = e.target.checked;
    setIsAllReportsViewChecked(checked);

    const updatedReportViewPermissions = {};
    reports.forEach((item) => {
      updatedReportViewPermissions[item.type] = checked;
    });
    setReportViewPermissions(updatedReportViewPermissions);
  };

  const handleReportEditAllChange = (e) => {
    const checked = e.target.checked;
    setIsAllReportsEditChecked(checked);

    const updatedReportEditPermissions = {};
    reports.forEach((item) => {
      updatedReportEditPermissions[item.type] = checked;
    });
    setReportEditPermissions(updatedReportEditPermissions);
  };

  const handleAdministrationViewAllChange = (e) => {
    const checked = e.target.checked;
    setIsAllAdministrationsViewChecked(checked);

    const updatedAdminViewPermissions = {};
    administrations.forEach((item) => {
      updatedAdminViewPermissions[item.type] = checked;
    });
    setAdminViewPermissions(updatedAdminViewPermissions);
  };

  const handleAdministrationEditAllChange = (e) => {
    const checked = e.target.checked;
    setIsAllAdministrationsEditChecked(checked);

    const updatedAdminEditPermissions = {};
    administrations.forEach((item) => {
      updatedAdminEditPermissions[item.type] = checked;
    });
    setAdminEditPermissions(updatedAdminEditPermissions);
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

  const handleCheckboxChange = (e) => {
    const { id, checked } = e.target;

    setAccessModules((prev) =>
      checked ? [...prev, id] : prev.filter((item) => item !== id)
    );
  };

  const handleReset = (e) => {
    e.preventDefault();
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "",
      department: "",
      status: "active",
      branch: "",
    });
    setStatus("active");
    setIsChecked(true);
    setStatus("active");
    setAccessModules([]);
    setMasterViewPermissions({});
    setTransactionViewPermissions({});
    setTransactionEditPermissions({});
    setReportViewPermissions({});
    setReportEditPermissions({});
    setAdminViewPermissions({});
    setAdminEditPermissions({});
    setIsAllMastersViewChecked(false);
    setMasterEditPermissions({});
    setIsAllMastersEditChecked(false);
  };

  const handleViewDetails = (user, e) => {
    e.preventDefault();
    console.log(user);
    setUserDetails(user);
    setIsShowUserDetails(true);
  };

  const handleEditDetails = (user, e) => {
    e.preventDefault();
    console.log(user);
    setUserDetails(user);
    setIsEditUserDetails(true);
  };

  const handleLoadBranchDropdownValues = async (e) => {
    e.preventDefault();

    try {
      const response = await api.get("/api/branch/by-company"); // Replace with your actual API endpoint
      const branchList = response.data;
      const formattedBranches = branchList.map((branch) => ({
        label: `${branch.name} (${branch.code})`,
        value: branch.id,
      }));
      setBranchDropdownValues(formattedBranches); // Update dropdown with branch list
      setIsAddUser(true);
    } catch (error) {
      console.error("Failed to load branch dropdown values:", error);
      alert("Failed to load branches. Please try again.");
    }
  };

  useEffect(() => {
    if (isShowUserDetails && userModalRef.current) {
      const bsModal = new Modal(userModalRef.current, {
        backdrop: "static",
      });
      bsModal.show();

      // Optional: hide modal state when it's closed
      userModalRef.current.addEventListener("hidden.bs.modal", () =>
        setIsShowUserDetails(false)
      );
    } else if (isEditUserDetails && userEditModalRef.current) {
      const bsModal = new Modal(userEditModalRef.current, {
        backdrop: "static",
      });
      bsModal.show();

      // Hide modal state when it's closed
      userEditModalRef.current.addEventListener("hidden.bs.modal", () =>
        setIsEditUserDetails(false)
      );
    }
  }, [isShowUserDetails, isEditUserDetails]);

  return (
    <div>
      {/* Header section */}
      <nav className="navbar bg-light border-body" data-bs-theme="light">
        <div className="container-fluid p-0">
          <div className="mt-4">
            <h3 className="nav-header header-style">User Management</h3>
            <p className="breadcrumb">
              <a href="#">
                <i className="fas fa-home text-8"></i>
              </a>{" "}
              <span className="ms-1 mt-1 text-small-gray">
                / Settings / User Management
              </span>
            </p>
          </div>

          {/* Add User Button */}

          <button
            className="btn btn-primary add-btn"
            onClick={handleLoadBranchDropdownValues}
          >
            <i className="fa-solid fa-user-plus"></i> Add New User
          </button>
        </div>
      </nav>
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
            <form
              autoComplete="off"
              className="user-form"
              onSubmit={handleAddUser}
            >
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
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
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
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
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
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({ ...formData, password: e.target.value })
                        }
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
                        required
                        value={formData.role}
                        onChange={(e) =>
                          setFormData({ ...formData, role: e.target.value })
                        }
                      >
                        <option value="" disabled hidden className="text-muted">
                          Select Role
                        </option>
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
                        required
                        value={formData.department}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            department: e.target.value,
                          })
                        }
                      >
                        <option value="" disabled hidden className="text-muted">
                          Select Department
                        </option>
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
                      <div className="form-check form-switch position-absolute input-icon mt-1 padding-left-2">
                        <input
                          className="form-check-input text-font switch-style"
                          type="checkbox"
                          role="switch"
                          id="switchCheckChecked"
                          checked={isChecked}
                          onChange={(e) => {
                            const newStatus = e.target.checked
                              ? "active"
                              : "inactive";
                            setIsChecked(e.target.checked);
                            setStatus(newStatus);
                            setFormData({
                              ...formData,
                              status: newStatus,
                            });
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

                          setFormData((prev) => ({
                            ...prev,
                            status: newStatus,
                          }));
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
                        required
                        value={formData.branch}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            branch: e.target.value,
                          })
                        }
                      >
                        <option value="" disabled hidden className="text-muted">
                          Select Branch
                        </option>

                        {branchDropdownValues.map((branch) => (
                          <option key={branch.value} value={branch.value}>
                            {branch.label}
                          </option>
                        ))}
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
                              <div className="permission-controls">
                                <label
                                  className="checkbox-wrapper"
                                  title="View Access"
                                >
                                  <input
                                    type="checkbox"
                                    checked={isAllMastersViewChecked}
                                    onChange={handleMasterViewAllChange}
                                  />
                                  <i className="fas fa-eye permission-icon primary"></i>
                                </label>
                                <label
                                  className="checkbox-wrapper"
                                  title="Edit Access"
                                >
                                  <input
                                    type="checkbox"
                                    checked={isAllMastersEditChecked}
                                    onChange={handleMasterEditAllChange}
                                  />

                                  <i className="fas fa-edit permission-icon success"></i>
                                </label>
                              </div>
                            </span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {masters.map((master) => (
                          <tr key={master.type}>
                            <td className="user-info">{master.name}</td>
                            <td className="icon-align">
                              <div className="permission-controls">
                                <label
                                  className="checkbox-wrapper"
                                  title="View Access"
                                >
                                  <input
                                    type="checkbox"
                                    checked={
                                      !!masterViewPermissions[master.type]
                                    }
                                    onChange={() =>
                                      handleSingleMasterViewChange(master.type)
                                    }
                                  />
                                  <i className="fas fa-eye permission-icon primary"></i>
                                </label>
                                <label
                                  className="checkbox-wrapper"
                                  title="Edit Access"
                                >
                                  <input
                                    type="checkbox"
                                    checked={
                                      !!masterEditPermissions[master.type]
                                    }
                                    onChange={() =>
                                      handleSingleMasterEditChange(master.type)
                                    }
                                  />

                                  <i className="fas fa-edit permission-icon success"></i>
                                </label>
                              </div>
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
                              <div className="permission-controls">
                                <label
                                  className="checkbox-wrapper"
                                  title="View Access"
                                >
                                  <input
                                    type="checkbox"
                                    checked={isAllTransactionsViewChecked}
                                    onChange={handleTransactionViewAllChange}
                                  />
                                  <i className="fas fa-eye permission-icon primary"></i>
                                </label>
                                <label
                                  className="checkbox-wrapper"
                                  title="Edit Access"
                                >
                                  <input
                                    type="checkbox"
                                    checked={isAllTransactionsEditChecked}
                                    onChange={handleTransactionEditAllChange}
                                  />
                                  <i className="fas fa-edit permission-icon success"></i>
                                </label>
                              </div>
                            </span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map((transaction) => (
                          <tr key={transaction.type}>
                            <td className="user-info">{transaction.name}</td>
                            <td className="icon-align">
                              <div className="permission-controls">
                                <label
                                  className="checkbox-wrapper"
                                  title="View Access"
                                >
                                  <input
                                    type="checkbox"
                                    checked={
                                      !!transactionViewPermissions[
                                        transaction.type
                                      ]
                                    }
                                    onChange={() =>
                                      setTransactionViewPermissions((prev) => ({
                                        ...prev,
                                        [transaction.type]:
                                          !prev[transaction.type],
                                      }))
                                    }
                                  />

                                  <i className="fas fa-eye permission-icon primary"></i>
                                </label>
                                <label
                                  className="checkbox-wrapper"
                                  title="Edit Access"
                                >
                                  <input
                                    type="checkbox"
                                    checked={
                                      !!transactionEditPermissions[
                                        transaction.type
                                      ]
                                    }
                                    onChange={() =>
                                      setTransactionEditPermissions((prev) => ({
                                        ...prev,
                                        [transaction.type]:
                                          !prev[transaction.type],
                                      }))
                                    }
                                  />
                                  <i className="fas fa-edit permission-icon success"></i>
                                </label>
                              </div>
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
                              <div className="permission-controls">
                                <label
                                  className="checkbox-wrapper"
                                  title="View Access"
                                >
                                  <input
                                    type="checkbox"
                                    checked={isAllReportsViewChecked}
                                    onChange={handleReportViewAllChange}
                                  />
                                  <i className="fas fa-eye permission-icon primary"></i>
                                </label>
                                <label
                                  className="checkbox-wrapper"
                                  title="Edit Access"
                                >
                                  <input
                                    type="checkbox"
                                    checked={isAllReportsEditChecked}
                                    onChange={handleReportEditAllChange}
                                  />
                                  <i className="fas fa-edit permission-icon success"></i>
                                </label>
                              </div>
                            </span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {reports.map((report) => (
                          <tr key={report.type}>
                            <td className="user-info">{report.name}</td>
                            <td className="icon-align">
                              <div className="permission-controls">
                                <label
                                  className="checkbox-wrapper"
                                  title="View Access"
                                >
                                  <input
                                    type="checkbox"
                                    checked={
                                      !!reportViewPermissions[report.type]
                                    }
                                    onChange={() =>
                                      setReportViewPermissions((prev) => ({
                                        ...prev,
                                        [report.type]: !prev[report.type],
                                      }))
                                    }
                                  />
                                  <i className="fas fa-eye permission-icon primary"></i>
                                </label>
                                <label
                                  className="checkbox-wrapper"
                                  title="Edit Access"
                                >
                                  <input
                                    type="checkbox"
                                    checked={
                                      !!reportEditPermissions[report.type]
                                    }
                                    onChange={() =>
                                      setReportEditPermissions((prev) => ({
                                        ...prev,
                                        [report.type]: !prev[report.type],
                                      }))
                                    }
                                  />
                                  <i className="fas fa-edit permission-icon success"></i>
                                </label>
                              </div>
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
                              <div className="permission-controls">
                                <label
                                  className="checkbox-wrapper"
                                  title="View Access"
                                >
                                  <input
                                    type="checkbox"
                                    checked={isAllAdministrationsViewChecked}
                                    onChange={handleAdministrationViewAllChange}
                                  />
                                  <i className="fas fa-eye permission-icon primary"></i>
                                </label>
                                <label
                                  className="checkbox-wrapper"
                                  title="Edit Access"
                                >
                                  <input
                                    type="checkbox"
                                    checked={isAllAdministrationsEditChecked}
                                    onChange={handleAdministrationEditAllChange}
                                  />
                                  <i className="fas fa-edit permission-icon success"></i>
                                </label>
                              </div>
                            </span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {administrations.map((administration) => (
                          <tr key={administration.type}>
                            <td className="user-info">{administration.name}</td>
                            <td className="icon-align">
                              <div className="permission-controls">
                                <label
                                  className="checkbox-wrapper"
                                  title="View Access"
                                >
                                  <input
                                    type="checkbox"
                                    checked={
                                      !!adminViewPermissions[
                                        administration.type
                                      ]
                                    }
                                    onChange={() =>
                                      setAdminViewPermissions((prev) => ({
                                        ...prev,
                                        [administration.type]:
                                          !prev[administration.type],
                                      }))
                                    }
                                  />
                                  <i className="fas fa-eye permission-icon primary"></i>
                                </label>
                                <label
                                  className="checkbox-wrapper"
                                  title="Edit Access"
                                >
                                  <input
                                    type="checkbox"
                                    checked={
                                      !!adminEditPermissions[
                                        administration.type
                                      ]
                                    }
                                    onChange={() =>
                                      setAdminEditPermissions((prev) => ({
                                        ...prev,
                                        [administration.type]:
                                          !prev[administration.type],
                                      }))
                                    }
                                  />
                                  <i className="fas fa-edit permission-icon success"></i>
                                </label>
                              </div>
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
                  className="btn btn-primary border border-0 text-8 px-3 fw-medium py-2 me-3 float-end"
                  onClick={handleAddUser}
                >
                  <i className="fa-solid fa-floppy-disk me-1"></i> Save Changes
                </button>
                <button
                  className="btn btn-secondary border border-0 bg-secondary text-8 px-3 fw-medium py-2 me-3 float-end"
                  onClick={handleReset}
                >
                  <i className="fa-solid fa-arrows-rotate me-1"></i> Reset
                </button>
              </div>
              <div className="row">
                <div className="col-6 d-flex align-items-center mt-2">
                  <div className="dropdown col-12">
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
      {/* Table Section */}
      <div className="margin-2">
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
                      onClick={(e) => handleViewDetails(user, e)}
                    >
                      <i className="fas fa-eye"></i>
                    </button>
                    <button
                      className="btn-icon btn-success"
                      title="Edit"
                      onClick={(e) => handleEditDetails(user, e)}
                    >
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
      {/* View User Details Modal */}
      {isShowUserDetails && (
        <div
          className="modal fade"
          ref={userModalRef}
          id="userDetailModal"
          tabIndex="-1"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  View {userDetails.name}'s Details
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  <strong>Name:</strong> {userDetails.name}
                </p>
                <p>
                  <strong>Email:</strong> {userDetails.email}
                </p>
                <p>
                  <strong>Role:</strong> {userDetails.role}
                </p>
                <p>
                  <strong>Status:</strong> {userDetails.status}
                </p>
                <p>
                  <strong>Last Login:</strong> {userDetails.lastLogin}
                </p>
                <p>
                  <strong>Permissions:</strong> {}
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  data-bs-dismiss="modal"
                  onClick={() => {
                    document.activeElement?.blur();
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Details Modal */}
      {isEditUserDetails && (
        <div
          className="modal fade"
          ref={userEditModalRef}
          id="userEditModal"
          tabIndex="-1"
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit User</h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              {/* Modal Body */}
              <div className="modal-body">
                <div className="table-form-container">
                  <div className="form-container">
                    {/* Form Fields Section */}
                    <form
                      autoComplete="off"
                      className="user-form"
                      onSubmit={handleEditUser}
                    >
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
                                value={userDetails.name}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    name: e.target.value,
                                  })
                                }
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
                                value={userDetails.email}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    email: e.target.value,
                                  })
                                }
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
                                value={"*****"}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    password: e.target.value,
                                  })
                                }
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
                                required
                                value={userDetails.role}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    role: e.target.value,
                                  })
                                }
                              >
                                <option
                                  value=""
                                  disabled
                                  hidden
                                  className="text-muted"
                                >
                                  Select Role
                                </option>
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
                                required
                                value={"HQ"}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    department: e.target.value,
                                  })
                                }
                              >
                                <option
                                  value=""
                                  disabled
                                  hidden
                                  className="text-muted"
                                >
                                  Select Department
                                </option>
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
                              <div className="form-check form-switch position-absolute input-icon mt-1 padding-left-2">
                                <input
                                  className="form-check-input text-font switch-style"
                                  type="checkbox"
                                  role="switch"
                                  id="switchCheckChecked"
                                  checked={
                                    userDetails.status === "Active"
                                      ? true
                                      : false
                                  }
                                  onChange={(e) => {
                                    const newStatus = e.target.checked
                                      ? "active"
                                      : "inactive";
                                    setIsChecked(e.target.checked);
                                    setStatus(newStatus);
                                    setFormData({
                                      ...formData,
                                      status: newStatus,
                                    });
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
                                value={userDetails.status}
                                onChange={(e) => {
                                  const newStatus = e.target.value;
                                  setStatus(newStatus);
                                  setIsChecked(newStatus === "active");

                                  setFormData((prev) => ({
                                    ...prev,
                                    status: newStatus,
                                  }));
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
                                required
                                value={"Branch"}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    branch: e.target.value,
                                  })
                                }
                              >
                                <option
                                  value=""
                                  disabled
                                  hidden
                                  className="text-muted"
                                >
                                  Select Branch
                                </option>

                                {branchDropdownValues.map((val) => (
                                  <option key={val.value} value={val.value}>
                                    {val.label}
                                  </option>
                                ))}
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
                                      <div className="permission-controls">
                                        <label
                                          className="checkbox-wrapper"
                                          title="View Access"
                                        >
                                          <input
                                            type="checkbox"
                                            checked={isAllMastersViewChecked}
                                            onChange={handleMasterViewAllChange}
                                          />
                                          <i className="fas fa-eye permission-icon primary"></i>
                                        </label>
                                        <label
                                          className="checkbox-wrapper"
                                          title="Edit Access"
                                        >
                                          <input
                                            type="checkbox"
                                            checked={isAllMastersEditChecked}
                                            onChange={handleMasterEditAllChange}
                                          />

                                          <i className="fas fa-edit permission-icon success"></i>
                                        </label>
                                      </div>
                                    </span>
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {masters.map((master) => (
                                  <tr key={master.type}>
                                    <td className="user-info">{master.name}</td>
                                    <td className="icon-align">
                                      <div className="permission-controls">
                                        <label
                                          className="checkbox-wrapper"
                                          title="View Access"
                                        >
                                          <input
                                            type="checkbox"
                                            checked={
                                              !!masterViewPermissions[
                                                master.type
                                              ]
                                            }
                                            onChange={() =>
                                              handleSingleMasterViewChange(
                                                master.type
                                              )
                                            }
                                          />
                                          <i className="fas fa-eye permission-icon primary"></i>
                                        </label>
                                        <label
                                          className="checkbox-wrapper"
                                          title="Edit Access"
                                        >
                                          <input
                                            type="checkbox"
                                            checked={
                                              !!masterEditPermissions[
                                                master.type
                                              ]
                                            }
                                            onChange={() =>
                                              handleSingleMasterEditChange(
                                                master.type
                                              )
                                            }
                                          />

                                          <i className="fas fa-edit permission-icon success"></i>
                                        </label>
                                      </div>
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
                                      <div className="permission-controls">
                                        <label
                                          className="checkbox-wrapper"
                                          title="View Access"
                                        >
                                          <input
                                            type="checkbox"
                                            checked={
                                              isAllTransactionsViewChecked
                                            }
                                            onChange={
                                              handleTransactionViewAllChange
                                            }
                                          />
                                          <i className="fas fa-eye permission-icon primary"></i>
                                        </label>
                                        <label
                                          className="checkbox-wrapper"
                                          title="Edit Access"
                                        >
                                          <input
                                            type="checkbox"
                                            checked={
                                              isAllTransactionsEditChecked
                                            }
                                            onChange={
                                              handleTransactionEditAllChange
                                            }
                                          />
                                          <i className="fas fa-edit permission-icon success"></i>
                                        </label>
                                      </div>
                                    </span>
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {transactions.map((transaction) => (
                                  <tr key={transaction.type}>
                                    <td className="user-info">
                                      {transaction.name}
                                    </td>
                                    <td className="icon-align">
                                      <div className="permission-controls">
                                        <label
                                          className="checkbox-wrapper"
                                          title="View Access"
                                        >
                                          <input
                                            type="checkbox"
                                            checked={
                                              !!transactionViewPermissions[
                                                transaction.type
                                              ]
                                            }
                                            onChange={() =>
                                              setTransactionViewPermissions(
                                                (prev) => ({
                                                  ...prev,
                                                  [transaction.type]:
                                                    !prev[transaction.type],
                                                })
                                              )
                                            }
                                          />

                                          <i className="fas fa-eye permission-icon primary"></i>
                                        </label>
                                        <label
                                          className="checkbox-wrapper"
                                          title="Edit Access"
                                        >
                                          <input
                                            type="checkbox"
                                            checked={
                                              !!transactionEditPermissions[
                                                transaction.type
                                              ]
                                            }
                                            onChange={() =>
                                              setTransactionEditPermissions(
                                                (prev) => ({
                                                  ...prev,
                                                  [transaction.type]:
                                                    !prev[transaction.type],
                                                })
                                              )
                                            }
                                          />
                                          <i className="fas fa-edit permission-icon success"></i>
                                        </label>
                                      </div>
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
                                      <div className="permission-controls">
                                        <label
                                          className="checkbox-wrapper"
                                          title="View Access"
                                        >
                                          <input
                                            type="checkbox"
                                            checked={isAllReportsViewChecked}
                                            onChange={handleReportViewAllChange}
                                          />
                                          <i className="fas fa-eye permission-icon primary"></i>
                                        </label>
                                        <label
                                          className="checkbox-wrapper"
                                          title="Edit Access"
                                        >
                                          <input
                                            type="checkbox"
                                            checked={isAllReportsEditChecked}
                                            onChange={handleReportEditAllChange}
                                          />
                                          <i className="fas fa-edit permission-icon success"></i>
                                        </label>
                                      </div>
                                    </span>
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {reports.map((report) => (
                                  <tr key={report.type}>
                                    <td className="user-info">{report.name}</td>
                                    <td className="icon-align">
                                      <div className="permission-controls">
                                        <label
                                          className="checkbox-wrapper"
                                          title="View Access"
                                        >
                                          <input
                                            type="checkbox"
                                            checked={
                                              !!reportViewPermissions[
                                                report.type
                                              ]
                                            }
                                            onChange={() =>
                                              setReportViewPermissions(
                                                (prev) => ({
                                                  ...prev,
                                                  [report.type]:
                                                    !prev[report.type],
                                                })
                                              )
                                            }
                                          />
                                          <i className="fas fa-eye permission-icon primary"></i>
                                        </label>
                                        <label
                                          className="checkbox-wrapper"
                                          title="Edit Access"
                                        >
                                          <input
                                            type="checkbox"
                                            checked={
                                              !!reportEditPermissions[
                                                report.type
                                              ]
                                            }
                                            onChange={() =>
                                              setReportEditPermissions(
                                                (prev) => ({
                                                  ...prev,
                                                  [report.type]:
                                                    !prev[report.type],
                                                })
                                              )
                                            }
                                          />
                                          <i className="fas fa-edit permission-icon success"></i>
                                        </label>
                                      </div>
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
                                      <div className="permission-controls">
                                        <label
                                          className="checkbox-wrapper"
                                          title="View Access"
                                        >
                                          <input
                                            type="checkbox"
                                            checked={
                                              isAllAdministrationsViewChecked
                                            }
                                            onChange={
                                              handleAdministrationViewAllChange
                                            }
                                          />
                                          <i className="fas fa-eye permission-icon primary"></i>
                                        </label>
                                        <label
                                          className="checkbox-wrapper"
                                          title="Edit Access"
                                        >
                                          <input
                                            type="checkbox"
                                            checked={
                                              isAllAdministrationsEditChecked
                                            }
                                            onChange={
                                              handleAdministrationEditAllChange
                                            }
                                          />
                                          <i className="fas fa-edit permission-icon success"></i>
                                        </label>
                                      </div>
                                    </span>
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {administrations.map((administration) => (
                                  <tr key={administration.type}>
                                    <td className="user-info">
                                      {administration.name}
                                    </td>
                                    <td className="icon-align">
                                      <div className="permission-controls">
                                        <label
                                          className="checkbox-wrapper"
                                          title="View Access"
                                        >
                                          <input
                                            type="checkbox"
                                            checked={
                                              !!adminViewPermissions[
                                                administration.type
                                              ]
                                            }
                                            onChange={() =>
                                              setAdminViewPermissions(
                                                (prev) => ({
                                                  ...prev,
                                                  [administration.type]:
                                                    !prev[administration.type],
                                                })
                                              )
                                            }
                                          />
                                          <i className="fas fa-eye permission-icon primary"></i>
                                        </label>
                                        <label
                                          className="checkbox-wrapper"
                                          title="Edit Access"
                                        >
                                          <input
                                            type="checkbox"
                                            checked={
                                              !!adminEditPermissions[
                                                administration.type
                                              ]
                                            }
                                            onChange={() =>
                                              setAdminEditPermissions(
                                                (prev) => ({
                                                  ...prev,
                                                  [administration.type]:
                                                    !prev[administration.type],
                                                })
                                              )
                                            }
                                          />
                                          <i className="fas fa-edit permission-icon success"></i>
                                        </label>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-6 d-flex align-items-center mt-2">
                          <div className="dropdown col-12">
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
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-primary border border-0 text-8 px-3 fw-medium py-2 me-3 float-end"
                  data-bs-dismiss="modal"
                  onClick={(e) => {
                    document.activeElement?.blur();
                    handleEditUser(e);
                  }}
                >
                  <i className="fa-solid fa-floppy-disk me-1"></i> Save Changes
                </button>
                <button
                  className="btn btn-secondary border border-0 bg-secondary text-8 px-3 fw-medium py-2 me-3 float-end"
                  data-bs-dismiss="modal"
                  onClick={() => {
                    document.activeElement?.blur();
                  }}
                >
                  <i className="fa-solid fa-x-mark me-1"></i> Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
