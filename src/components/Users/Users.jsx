import React, { useContext, useState, useEffect } from "react";
import "./Users.css";
import { AppContext } from "../../context/AppContext";
import AddUserModal from "../Modals/AddUserModal";
import api from "../../services/api";

const Users = () => {
  const { isAddUser, setIsAddUser, branchDropdownValues } =
    useContext(AppContext);
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
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch users from API
  useEffect(() => {
    fetchUsers();
  }, [currentPage, itemsPerPage]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/users/all-staff");
      if (response.data && response.data.users) {
        const allUsers = response.data.users.map(user => ({
          id: user.id,
          name: user.username,
          role: user.role,
          time: formatDateTime(user.lastLoginDateTime),
          email: user.email,
          img: `https://ui-avatars.com/api/?name=${user.username.replace(/ /g, '+')}&size=32&background=2563eb&color=fff`,
          status: user.status,
          department: user.department,
          lastLoginIp: user.lastLoginIp,
          companyId: user.companyId,
          branchIds: user.branchIds
        }));
        
        setTotalItems(allUsers.length);
        setTotalPages(Math.ceil(allUsers.length / itemsPerPage));
        
        // Apply pagination to the users
        const startIndex = (currentPage - 1) * itemsPerPage;
        const paginatedUsers = allUsers.slice(startIndex, startIndex + itemsPerPage);
        setUsers(paginatedUsers);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "Never";
    try {
      const date = new Date(dateTimeString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      
      // Format time with AM/PM
      let hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      const formattedHours = hours.toString().padStart(2, '0');
      
      return `${day}/${month}/${year} ${formattedHours}:${minutes} ${ampm}`;
    } catch (error) {
      return "Invalid Date";
    }
  };
  
  // Handle page change
  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };
  
  // Handle items per page change
  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = parseInt(e.target.value, 10);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };
  
  // Calculate displayed item range
  const getItemRange = () => {
    const start = (currentPage - 1) * itemsPerPage + 1;
    const end = Math.min(start + itemsPerPage - 1, totalItems);
    return `${start}-${end}`;
  };

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
    api.post("/api/users/create", finalData)
      .then((response) => {
        console.log(response);
        if (response.data && response.data.status === "success") {
          alert(response.data.message); // Show success message
          handleReset(e); // Reset form after successful submission
          setIsAddUser(false); // Close the form
          fetchUsers(); // Refresh the user list
        }
      })
      .catch((error) => {
        console.error("Error submitting form:", error);
        if (error.response && error.response.data && error.response.data.message) {
          alert(error.response.data.message); // Show error message
        } else {
          alert("An error occurred. Please try again later.");
        }
      });
    console.log("Form submitted. ", finalData);
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
    setIsChecked(true);
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

  // Handle delete user
  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) {
      return;
    }
    
    setDeleteLoading(true);
    try {
      const response = await api.delete(`/api/users/delete/${userId}`);
      if (response.data && response.data.status === "success") {
        alert(response.data.message);
        fetchUsers(); // Refresh the user list
        // Remove from selected users if it was selected
        if (selectedUsers.includes(userId)) {
          setSelectedUsers(selectedUsers.filter(id => id !== userId));
        }
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      if (error.response && error.response.data && error.response.data.message) {
        alert(error.response.data.message);
      } else {
        alert("An error occurred while deleting the user.");
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) {
      alert("Please select users to delete");
      return;
    }
    
    if (!window.confirm(`Are you sure you want to delete ${selectedUsers.length} selected users?`)) {
      return;
    }
    
    setDeleteLoading(true);
    let successCount = 0;
    let errorCount = 0;
    
    try {
      for (const userId of selectedUsers) {
        try {
          const response = await api.delete(`/api/users/delete/${userId}`);
          if (response.data && response.data.status === "success") {
            successCount++;
          }
        } catch (error) {
          errorCount++;
          console.error(`Error deleting user ${userId}:`, error);
        }
      }
      
      alert(`${successCount} users deleted successfully. ${errorCount} deletions failed.`);
      fetchUsers(); // Refresh the user list
      setSelectedUsers([]); // Clear selection
      setSelectAll(false);
    } catch (error) {
      console.error("Error in bulk delete:", error);
    } finally {
      setDeleteLoading(false);
    }
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
                  className="btn btn-primary border border-0 add-btn me-3 float-end"
                  onClick={handleAddUser}
                >
                  <i className="fa-solid fa-floppy-disk me-1"></i> Save Changes
                </button>
                <button
                  className="btn btn-secondary border border-0 bg-secondary add-btn me-3 float-end"
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
              <button 
                className="btn-action btn-danger"
                onClick={handleBulkDelete}
                disabled={selectedUsers.length === 0 || deleteLoading}
              >
                {deleteLoading ? (
                  <><i className="fas fa-spinner fa-spin"></i> Deleting...</>
                ) : (
                  <><i className="fas fa-trash"></i> Delete Selected</>
                )}
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
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center">Loading users...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center">No users found</td>
                </tr>
              ) : (
                users.map((user) => (
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
                      <button className="btn-icon btn-success" title="Edit">
                        <i className="fas fa-edit"></i>
                      </button>
                      <button 
                        className="btn-icon btn-danger" 
                        title="Delete"
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={deleteLoading}
                      >
                        <i className={deleteLoading ? "fas fa-spinner fa-spin" : "fas fa-trash"}></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="pagination-container">
            <div className="pagination-info">Showing {getItemRange()} of {totalItems} entries</div>
            <div className="pagination">
              <button 
                className="btn-page" 
                disabled={currentPage === 1} 
                onClick={() => handlePageChange(currentPage - 1)}
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              {/* Generate page buttons */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Show pages around current page
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    className={`btn-page ${currentPage === pageNum ? 'active' : ''}`}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button 
                className="btn-page" 
                disabled={currentPage === totalPages} 
                onClick={() => handlePageChange(currentPage + 1)}
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
            <div className="items-per-page">
              <select value={itemsPerPage} onChange={handleItemsPerPageChange}>
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
      {isShowUserDetails && <AddUserModal />}
    </div>
  );
};

export default Users;
