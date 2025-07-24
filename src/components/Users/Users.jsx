import React, { useContext, useState, useEffect, useRef } from "react";
import "./Users.css";
import { AppContext } from "../../context/AppContext";
import api from "../../services/api";
import { Modal } from "bootstrap";
import Select from "react-select";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const Users = () => {
  // Search filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [selectedOptions, setSelectedOptions] = useState([]);
  const [errors, setErrors] = useState({});
  const userModalRef = useRef(null);
  const userEditModalRef = useRef(null);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterRole, filterStatus]);

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
    confirmPassword: "",
    role: "",
    department: "",
    status: "active",
    branch: "",
  });
  const [isShowUserDetails, setIsShowUserDetails] = useState(false);
  const [isEditUserDetails, setIsEditUserDetails] = useState(false);
  const [isConfirmModal, setIsConfirmModal] = useState(false);
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

  const [userModal, setUserModal] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

  // Confirm modal states
  const [message, setMesssage] = useState("");
  const [confirmState, setConfirmState] = useState(false);
  const [confirmType, setConfirmType] = useState("");

  // Delete userId state
  const [userIdState, setUserIdState] = useState("");

  // Add validateForm function to validate user form data
  const validateForm = (data, isUpdate = false) => {
    const errors = {};

    if (!data.name || data.name.trim() === "") {
      errors.name = "Full name is required";
    }

    if (!data.email || data.email.trim() === "") {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(data.email)) {
      errors.email = "Email is invalid";
    }

    // Skip password validation for updates if password field is empty
    if (isUpdate && (!data.password || data.password.trim() === "")) {
      // Skip password validation for updates
    } else {
      if (!data.password || data.password.trim() === "") {
        errors.password = "Password is required";
      } else if (data.password.length < 6) {
        errors.password = "Password must be at least 6 characters";
      }

      if (data.password !== data.confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
      }
    }

    if (!data.role || data.role.trim() === "") {
      errors.role = "Role is required";
    }

    if (!data.department || data.department.trim() === "") {
      errors.department = "Department is required";
    }

    // Check if branch is selected - using selectedOptions from state
    if (!selectedOptions || selectedOptions.length === 0) {
      errors.branch = "At least one branch must be selected";
    }
    return errors;
  };

  // Fetch users from API
  useEffect(() => {
    fetchUsers();
  }, [currentPage, itemsPerPage]);

  // Dedicated useEffect for handling userDetailModal
  useEffect(() => {
    let modal = null;

    if (
      isShowUserDetails &&
      userDetails &&
      Object.keys(userDetails).length > 0
    ) {
      console.log("User detail modal should show with data:", userDetails.name);

      // Ensure any previous modal instance is disposed
      if (userModal) {
        userModal.dispose();
      }

      // Clean up any existing modal artifacts
      cleanupModalArtifacts();

      const modalElement = document.getElementById("userDetailModal");
      if (modalElement) {
        modal = new Modal(modalElement, {
          keyboard: true,
          backdrop: true,
        });

        // Add event listeners
        modalElement.addEventListener("hidden.bs.modal", () => {
          console.log("Modal was hidden, cleaning up state");
          cleanupModalArtifacts();
          setIsShowUserDetails(false);
          setUserDetails({});
        });

        // Show the modal
        modal.show();

        // Store modal reference
        setUserModal(modal);
      }
    }

    // Clean up function
    return () => {
      if (modal) {
        modal.dispose();
        cleanupModalArtifacts();
      }
    };
  }, [isShowUserDetails, userDetails.id]); // Only re-run if these values change

  // Update useEffect for edit modal
  useEffect(() => {
    let modal = null;

    if (isEditUserDetails) {
      console.log("Edit modal should show");
      const modalElement = document.getElementById("userEditModal");

      if (modalElement) {
        // Dispose any existing modal instance first
        if (editModal) {
          editModal.dispose();
        }

        // Clean up any existing modal artifacts
        cleanupModalArtifacts();

        // Create new modal
        modal = new Modal(modalElement, {
          backdrop: "static",
          keyboard: false,
        });

        // Add event listener for when modal is hidden
        modalElement.addEventListener("hidden.bs.modal", () => {
          console.log("Edit modal was hidden, cleaning up");
          cleanupModalArtifacts();
          setIsEditUserDetails(false);
        });

        // Show the modal
        modal.show();

        // Store modal reference
        setEditModal(modal);
      }
    }

    // Cleanup function
    return () => {
      if (modal) {
        modal.dispose();
        cleanupModalArtifacts();
      }
    };
  }, [isEditUserDetails]);

  // Confirm useEffect for confirm modal
  useEffect(() => {
    let modal = null;

    if (isConfirmModal) {
      const modalElement = document.getElementById("userConfirmModal");

      if (modalElement) {
        // Clean up any existing modal artifacts
        cleanupModalArtifacts();

        // Create new modal
        modal = new Modal(modalElement, {
          backdrop: "static",
          keyboard: false,
        });

        // Add event listener for when modal is hidden
        modalElement.addEventListener("hidden.bs.modal", () => {
          cleanupModalArtifacts();
          setIsConfirmModal(false);
        });

        // Show the modal
        modal.show();

        // Store modal reference
        setConfirmModal(modal);
      }
    }

    // Cleanup function
    return () => {
      if (modal) {
        modal.dispose();
        cleanupModalArtifacts();
      }
    };
  }, [isConfirmModal]);

  useEffect(() => {
    // Check master permissions
    const allMastersView = masters.every((m) => masterViewPermissions[m.type]);
    const allMastersEdit = masters.every((m) => masterEditPermissions[m.type]);
    setIsAllMastersViewChecked(allMastersView);
    setIsAllMastersEditChecked(allMastersEdit);

    // Check transaction permissions
    const allTransactionsView = transactions.every(
      (t) => transactionViewPermissions[t.type]
    );
    const allTransactionsEdit = transactions.every(
      (t) => transactionEditPermissions[t.type]
    );
    setIsAllTransactionsViewChecked(allTransactionsView);
    setIsAllTransactionsEditChecked(allTransactionsEdit);

    // Check report permissions
    const allReportsView = reports.every((r) => reportViewPermissions[r.type]);
    const allReportsEdit = reports.every((r) => reportEditPermissions[r.type]);
    setIsAllReportsViewChecked(allReportsView);
    setIsAllReportsEditChecked(allReportsEdit);

    // Check administration permissions
    const allAdminsView = administrations.every(
      (a) => adminViewPermissions[a.type]
    );
    const allAdminsEdit = administrations.every(
      (a) => adminEditPermissions[a.type]
    );
    setIsAllAdministrationsViewChecked(allAdminsView);
    setIsAllAdministrationsEditChecked(allAdminsEdit);
  }, [
    masterViewPermissions,
    masterEditPermissions,
    transactionViewPermissions,
    transactionEditPermissions,
    reportViewPermissions,
    reportEditPermissions,
    adminViewPermissions,
    adminEditPermissions,
  ]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      console.log("Fetching users...");
      const response = await api.get("/api/users/all-staff");
      console.log("Users API response:", response.data);

      if (response.data && response.data.data) {
        const allUsers = response.data.data.map((user) => ({
          id: user.id,
          name: user.username,
          role: user.role,
          time: formatDateTime(user.lastLoginDateTime),
          email: user.email,
          img: `https://ui-avatars.com/api/?name=${user.username.replace(
            / /g,
            "+"
          )}&size=32&background=2563eb&color=fff`,
          status: user.status,
          department: user.department,
          lastLoginIp: user.lastLoginIp,
          companyId: user.companyId,
          branchIds: user.branchIds,
          permissions: user.permissions || [], // Ensure permissions are included
        }));

        console.log("Processed users:", allUsers);

        setTotalItems(allUsers.length);
        setTotalPages(Math.ceil(allUsers.length / itemsPerPage));

        // Apply pagination to the users
        const startIndex = (currentPage - 1) * itemsPerPage;
        const paginatedUsers = allUsers.slice(
          startIndex,
          startIndex + itemsPerPage
        );
        setUsers(paginatedUsers);
        console.log("Updated users state with:", paginatedUsers);
      } else {
        toast.warning("No users were found.");
        console.warn("No users data found in the response:", response.data);
      }
    } catch (error) {
      toast.error("Error in fetching users. Please try again");
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "Never";
    try {
      const date = new Date(dateTimeString);
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();

      // Format time with AM/PM
      let hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, "0");
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      const formattedHours = hours.toString().padStart(2, "0");

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
      name: "Material Incoming",
      type: "materialIncoming",
    },
    {
      id: 2,
      name: "IQC",
      type: "iqc",
    },
    {
      id: 3,
      name: "Material Issue Request",
      type: "materialIssueRequest",
    },
    {
      id: 4,
      name: "Issue to Production",
      type: "issuetoProduction",
    },
    {
      id: 5,
      name: "Production Floor Receipt",
      type: "productionFloorReceipt",
    },
    {
      id: 6,
      name: "Production Material Usage",
      type: "productionMaterialUsage",
    },
    {
      id: 7,
      name: "WIP Return",
      type: "wipReturn",
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
    {
      id: 5,
      name: "Approve Items Quantity",
      type: "approveItemsQuantity",
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
    "materialIncoming",
    "incomingMaster",
    "incomingQualityControl",
    "materialIssueRequest",
    "materialIssueTransfer",
    "materialReceipt",
    "productionMaterialUsage",
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
    incoming: "Store Material Inward",
    iqc: "Incoming Quality Control",
    requisition: "Material Issue Request",
    issueProduction: "Material Issue Transfer",
    requisitionReceipt: "Material Receipt",
    productionReceipt: "Production Material Usage",
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
    console.log("Form data before validation:", formData);
    console.log("Selected branches:", selectedOptions);

    const newErrors = validateForm(formData);
    setErrors(newErrors);
    console.log("Validation errors:", newErrors);

    if (Object.keys(newErrors).length !== 0) {
      toast.error(
        "All fields are required. Please complete the form before submission"
      );
    }
    if (Object.keys(newErrors).length === 0) {
      const finalData = {
        username: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role.toUpperCase(),
        branchIds: selectedOptions.map((option) => option.value), // Get branch IDs from selectedOptions
        department: formData.department,
        status: formData.status,
        permissions: collectPermissions(),
      };

      console.log("Submitting form with data:", finalData);
      api
        .post("/api/users/create", finalData)
        .then((response) => {
          console.log("Add user response:", response);
          if (response.data && response.data.status === true) {
            toast.success(response.data.message);
            handleReset(e); // Reset form after successful submission
            setIsAddUser(false); // Close the form

            // Add a small delay before fetching users to ensure the server has processed the change
            setTimeout(() => {
              console.log("Refreshing users list after adding new user");
              fetchUsers(); // Refresh the user list
            }, 500);
          } else {
            // Server returned a response but with status false
            console.error("Server returned error:", response.data);
            toast.error(
              response.data.message ||
                "Failed to create user. Please check the form and try again."
            );
          }
        })
        .catch((error) => {
          console.error("Error submitting form:", error);
          console.error("Error response:", error.response);
          if (
            error.response &&
            error.response.data &&
            error.response.data.message
          ) {
            toast.error(error.response.data.message);
          } else {
            toast.error("An error occurred. Please try again later.");
          }
        });
    }
  };

  const handleMasterViewAllChange = (e) => {
    const checked = e.target.checked;
    setIsAllMastersViewChecked(checked);

    const updatedViewPermissions = {};
    masters.forEach((item) => {
      updatedViewPermissions[item.type] = checked;
    });
    setMasterViewPermissions(updatedViewPermissions);
  };

  const handleMasterEditAllChange = (e) => {
    const checked = e.target.checked;
    setIsAllMastersEditChecked(checked);

    const updatedEditPermissions = {};
    const updatedViewPermissions = { ...masterViewPermissions };

    masters.forEach((item) => {
      updatedEditPermissions[item.type] = checked;
      if (checked) {
        // Auto-check view if enabling edit
        updatedViewPermissions[item.type] = true;
      }
    });

    setMasterEditPermissions(updatedEditPermissions);
    setMasterViewPermissions(updatedViewPermissions);

    const allViewChecked = masters.every((m) => updatedViewPermissions[m.type]);
    setIsAllMastersViewChecked(allViewChecked);
  };

  const handleSingleMasterViewChange = (type) => {
    console.log(
      `Changing master view permission for ${type} to ${!masterViewPermissions[
        type
      ]}`
    );
    const updatedPermissions = {
      ...masterViewPermissions,
      [type]: !masterViewPermissions[type],
    };
    setMasterViewPermissions(updatedPermissions);
    // Check if all masters are now checked
    const allChecked = masters.every((item) => updatedPermissions[item.type]);
    setIsAllMastersViewChecked(allChecked);
  };

  const handleSingleMasterEditChange = (type) => {
    const isEditing = !masterEditPermissions[type];

    setMasterEditPermissions((prev) => ({
      ...prev,
      [type]: isEditing,
    }));

    // Auto-check view if enabling edit
    if (isEditing && !masterViewPermissions[type]) {
      setMasterViewPermissions((prev) => ({
        ...prev,
        [type]: true,
      }));
    }

    const allEditChecked = masters.every(
      (m) => m.type in masterEditPermissions && masterEditPermissions[m.type]
    );
    setIsAllMastersEditChecked(allEditChecked);
  };

  const handleSingleTransactionEditChange = (type) => {
    const isEditing = !transactionEditPermissions[type];

    setTransactionEditPermissions((prev) => ({
      ...prev,
      [type]: isEditing,
    }));

    if (isEditing && !transactionViewPermissions[type]) {
      setTransactionViewPermissions((prev) => ({
        ...prev,
        [type]: true,
      }));
    }
  };

  const handleTransactionViewAllChange = (e) => {
    const checked = e.target.checked;
    setIsAllTransactionsViewChecked(checked);
    const updatedPermissions = {};
    transactions.forEach((item) => {
      updatedPermissions[item.type] = checked;
    });
    setTransactionViewPermissions(updatedPermissions);
  };

  const handleTransactionEditAllChange = (e) => {
    const checked = e.target.checked;
    setIsAllTransactionsEditChecked(checked);

    const updatedEditPermissions = {};
    const updatedViewPermissions = { ...transactionViewPermissions };

    transactions.forEach((item) => {
      updatedEditPermissions[item.type] = checked;
      if (checked) {
        updatedViewPermissions[item.type] = true;
      }
    });

    setTransactionEditPermissions(updatedEditPermissions);
    setTransactionViewPermissions(updatedViewPermissions);

    const allViewChecked = transactions.every(
      (t) => updatedViewPermissions[t.type]
    );
    setIsAllTransactionsViewChecked(allViewChecked);
  };

  const handleSingleReportEditChange = (type) => {
    const isEditing = !reportEditPermissions[type];

    setReportEditPermissions((prev) => ({
      ...prev,
      [type]: isEditing,
    }));

    if (isEditing && !reportViewPermissions[type]) {
      setReportViewPermissions((prev) => ({
        ...prev,
        [type]: true,
      }));
    }
  };

  const handleReportViewAllChange = (e) => {
    const checked = e.target.checked;
    setIsAllReportsViewChecked(checked);
    const updatedPermissions = {};
    reports.forEach((item) => {
      updatedPermissions[item.type] = checked;
    });
    setReportViewPermissions(updatedPermissions);
  };

  const handleReportEditAllChange = (e) => {
    const checked = e.target.checked;
    setIsAllReportsEditChecked(checked);

    const updatedEditPermissions = {};
    const updatedViewPermissions = { ...reportViewPermissions };

    reports.forEach((item) => {
      updatedEditPermissions[item.type] = checked;
      if (checked) {
        updatedViewPermissions[item.type] = true;
      }
    });

    setReportEditPermissions(updatedEditPermissions);
    setReportViewPermissions(updatedViewPermissions);

    const allViewChecked = reports.every((r) => updatedViewPermissions[r.type]);
    setIsAllReportsViewChecked(allViewChecked);
  };

  const handleSingleAdminEditChange = (type) => {
    const isEditing = !adminEditPermissions[type];

    setAdminEditPermissions((prev) => ({
      ...prev,
      [type]: isEditing,
    }));

    if (isEditing && !adminViewPermissions[type]) {
      setAdminViewPermissions((prev) => ({
        ...prev,
        [type]: true,
      }));
    }
  };

  const handleAdministrationViewAllChange = (e) => {
    const checked = e.target.checked;
    setIsAllAdministrationsViewChecked(checked);
    const updatedPermissions = {};
    administrations.forEach((item) => {
      updatedPermissions[item.type] = checked;
    });
    setAdminViewPermissions(updatedPermissions);
  };

  const handleAdministrationEditAllChange = (e) => {
    const checked = e.target.checked;
    setIsAllAdministrationsEditChecked(checked);

    const updatedEditPermissions = {};
    const updatedViewPermissions = { ...adminViewPermissions };

    administrations.forEach((item) => {
      updatedEditPermissions[item.type] = checked;
      if (checked) {
        updatedViewPermissions[item.type] = true;
      }
    });

    setAdminEditPermissions(updatedEditPermissions);
    setAdminViewPermissions(updatedViewPermissions);

    const allViewChecked = administrations.every(
      (a) => updatedViewPermissions[a.type]
    );
    setIsAllAdministrationsViewChecked(allViewChecked);
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
    console.log("Resetting form");

    // Reset form data
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "", // Added this field which was missing
      role: "",
      department: "",
      status: "active",
      branch: "",
    });

    // Reset all state variables
    setStatus("active");
    setIsChecked(true);
    setAccessModules([]);

    // Reset all permissions
    setMasterViewPermissions({});
    setMasterEditPermissions({});
    setTransactionViewPermissions({});
    setTransactionEditPermissions({});
    setReportViewPermissions({});
    setReportEditPermissions({});
    setAdminViewPermissions({});
    setAdminEditPermissions({});

    // Reset permission checkboxes
    setIsAllMastersViewChecked(false);
    setIsAllMastersEditChecked(false);
    setIsAllTransactionsViewChecked(false);
    setIsAllTransactionsEditChecked(false);
    setIsAllReportsViewChecked(false);
    setIsAllReportsEditChecked(false);
    setIsAllAdministrationsViewChecked(false);
    setIsAllAdministrationsEditChecked(false);

    // Reset branch selection
    setSelectedOptions([]);

    // Reset validation errors
    setErrors({});

    console.log("Form reset complete");
  };

  const handleViewDetails = async (user, e) => {
    e.preventDefault();
    try {
      console.log("Fetching details for user:", user.id);

      // First reset any existing user details
      setUserDetails({});

      const response = await api.get(`/api/users/${user.id}`);
      console.log("User details response:", response.data);

      if (response.data && response.data.status === true) {
        const userData = response.data.data;

        // Make a clean permissions array by filtering out duplicates if needed
        const uniquePermissions = userData.permissions
          ? [
              ...new Map(
                userData.permissions.map((p) => [p.pageName, p])
              ).values(),
            ]
          : [];

        console.log("Unique permissions:", uniquePermissions);

        // Set user details with clean data
        setUserDetails({
          ...userData,
          id: user.id,
          name: userData.username,
          role: userData.role,
          email: userData.email,
          status: userData.status,
          department: userData.department,
          permissions: uniquePermissions,
        });

        // Now set flag to show modal
        setIsShowUserDetails(true);

        // Initialize the modal after a short delay
        setTimeout(() => {
          const modalElement = document.getElementById("userDetailModal");
          if (modalElement) {
            const modal = new Modal(modalElement, {
              keyboard: true,
              backdrop: true,
            });
            setUserModal(modal);
            modal.show();
          }
        }, 100);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      toast.error("Failed to fetch user details. Please try again.");
    }
  };

  // Add cleanup for modal
  const handleCloseModal = () => {
    console.log("Closing user details modal");
    if (userModal) {
      userModal.hide();
      cleanupModalArtifacts();
    }

    // Add a small delay before resetting states to allow animation to complete
    setTimeout(() => {
      setIsShowUserDetails(false);
      setUserDetails({});
    }, 300);
  };

  const handleCloseConfirmModal = () => {
    if (confirmModal) {
      confirmModal.hide();
      cleanupModalArtifacts();
    }

    // Add a small delay before resetting states to allow animation to complete
    setTimeout(() => {
      setIsConfirmModal(false);
    }, 300);
  };

  // Handle edit user details
  const handleEditDetails = async (user, e) => {
    e.preventDefault();
    console.log("Edit details for user:", user); // Log the user object

    try {
      // First load branch data
      const branchResponse = await api.get("/api/branch/by-company");
      if (branchResponse.data && branchResponse.data.status === true) {
        const branchList = branchResponse.data.data;
        const formattedBranches = branchList.map((branch) => ({
          label: `${branch.name} (${branch.code})`,
          value: branch.id,
        }));
        setBranchDropdownValues(formattedBranches);
      }

      // Then fetch user details
      console.log("Fetching user details for ID:", user.id); // Log the user ID
      const response = await api.get(`/api/users/${user.id}`);
      console.log("User details response:", response.data); // Log the full response

      if (response.data && response.data.status === true) {
        const userData = response.data.data;
        console.log("User data received:", userData); // Log the user data

        // Set initial status state based on user data
        setIsChecked(userData.status.toUpperCase() === "ACTIVE");
        setStatus(userData.status.toUpperCase());

        // Set user details with all necessary fields
        const updatedUserDetails = {
          ...userData,
          id: user.id, // Make sure to set the user ID correctly
          name: userData.username,
          role: userData.role,
          email: userData.email,
          status: userData.status.toUpperCase(),
          department: userData.department,
          password: "", // Clear password field for security
          confirmPassword: "", // Clear confirm password field
        };

        console.log("Setting user details to:", updatedUserDetails); // Log the updated user details
        setUserDetails(updatedUserDetails);

        // Also update formData state to match
        setFormData({
          name: userData.username,
          email: userData.email,
          password: "",
          confirmPassword: "",
          role: userData.role,
          department: userData.department,
          status: userData.status.toUpperCase(),
          branch: "",
        });

        // Set selected branch options from the branches array in response
        if (userData.branches && Array.isArray(userData.branches)) {
          const selectedBranches = userData.branches.map((branch) => ({
            label: `${branch.name} (${branch.code})`,
            value: branch.id,
          }));
          setSelectedOptions(selectedBranches);
        } else {
          setSelectedOptions([]);
        }

        // Set permissions based on user data
        if (userData.permissions && Array.isArray(userData.permissions)) {
          console.log("Setting permissions from:", userData.permissions);

          // Reset all permissions first
          const newMasterViewPermissions = {};
          const newMasterEditPermissions = {};
          const newTransactionViewPermissions = {};
          const newTransactionEditPermissions = {};
          const newReportViewPermissions = {};
          const newReportEditPermissions = {};
          const newAdminViewPermissions = {};
          const newAdminEditPermissions = {};

          // Create a mapping of permission names to modules for more accurate matching
          const permissionMapping = {};

          // Map exact permission names to modules
          masters.forEach((master) => {
            const exactName = master.name;
            const withoutMaster = master.name.replace(" Master", "");
            permissionMapping[exactName] = {
              type: master.type,
              category: "master",
            };
            permissionMapping[withoutMaster] = {
              type: master.type,
              category: "master",
            };
          });

          transactions.forEach((transaction) => {
            permissionMapping[transaction.name] = {
              type: transaction.type,
              category: "transaction",
            };
          });

          reports.forEach((report) => {
            permissionMapping[report.name] = {
              type: report.type,
              category: "report",
            };
          });

          administrations.forEach((admin) => {
            permissionMapping[admin.name] = {
              type: admin.type,
              category: "admin",
            };
          });

          console.log("Permission mapping:", permissionMapping);

          // Set permissions based on user data
          userData.permissions.forEach((permission) => {
            const { pageName, canView, canEdit } = permission;
            console.log(
              `Processing permission: ${pageName}, canView: ${canView}, canEdit: ${canEdit}`
            );

            // Find exact match first
            let moduleInfo = permissionMapping[pageName];

            // If no exact match, try without "Master" suffix
            if (!moduleInfo && pageName.includes("Master")) {
              moduleInfo = permissionMapping[pageName.replace(" Master", "")];
            }

            // If still no match, try a more fuzzy match as last resort
            if (!moduleInfo) {
              const possibleKeys = Object.keys(permissionMapping);
              for (const key of possibleKeys) {
                // Check for significant overlap (more than 50% match)
                if (
                  (pageName.includes(key) && key.length > 3) ||
                  (key.includes(pageName) && pageName.length > 3)
                ) {
                  moduleInfo = permissionMapping[key];
                  console.log(`Fuzzy match found: ${pageName} -> ${key}`);
                  break;
                }
              }
            }

            if (moduleInfo) {
              const { type: moduleType, category: moduleCategory } = moduleInfo;
              console.log(
                `Found match for ${pageName}: type=${moduleType}, category=${moduleCategory}`
              );

              if (canView) {
                if (moduleCategory === "master") {
                  newMasterViewPermissions[moduleType] = true;
                } else if (moduleCategory === "transaction") {
                  newTransactionViewPermissions[moduleType] = true;
                } else if (moduleCategory === "report") {
                  newReportViewPermissions[moduleType] = true;
                } else if (moduleCategory === "admin") {
                  newAdminViewPermissions[moduleType] = true;
                }
              }

              if (canEdit) {
                if (moduleCategory === "master") {
                  newMasterEditPermissions[moduleType] = true;
                } else if (moduleCategory === "transaction") {
                  newTransactionEditPermissions[moduleType] = true;
                } else if (moduleCategory === "report") {
                  newReportEditPermissions[moduleType] = true;
                } else if (moduleCategory === "admin") {
                  newAdminEditPermissions[moduleType] = true;
                }
              }
            } else {
              console.warn(`No module match found for permission: ${pageName}`);
            }
          });

          console.log(
            "Setting master view permissions:",
            newMasterViewPermissions
          );
          console.log(
            "Setting master edit permissions:",
            newMasterEditPermissions
          );

          // Set all permissions at once
          setMasterViewPermissions(newMasterViewPermissions);
          setMasterEditPermissions(newMasterEditPermissions);
          setTransactionViewPermissions(newTransactionViewPermissions);
          setTransactionEditPermissions(newTransactionEditPermissions);
          setReportViewPermissions(newReportViewPermissions);
          setReportEditPermissions(newReportEditPermissions);
          setAdminViewPermissions(newAdminViewPermissions);
          setAdminEditPermissions(newAdminEditPermissions);

          // Update the "all checked" states after setting permissions
          setTimeout(() => {
            const allMastersView = masters.every(
              (m) => newMasterViewPermissions[m.type]
            );
            const allMastersEdit = masters.every(
              (m) => newMasterEditPermissions[m.type]
            );
            const allTransactionsView = transactions.every(
              (t) => newTransactionViewPermissions[t.type]
            );
            const allTransactionsEdit = transactions.every(
              (t) => newTransactionEditPermissions[t.type]
            );
            const allReportsView = reports.every(
              (r) => newReportViewPermissions[r.type]
            );
            const allReportsEdit = reports.every(
              (r) => newReportEditPermissions[r.type]
            );
            const allAdminsView = administrations.every(
              (a) => newAdminViewPermissions[a.type]
            );
            const allAdminsEdit = administrations.every(
              (a) => newAdminEditPermissions[a.type]
            );

            setIsAllMastersViewChecked(allMastersView);
            setIsAllMastersEditChecked(allMastersEdit);
            setIsAllTransactionsViewChecked(allTransactionsView);
            setIsAllTransactionsEditChecked(allTransactionsEdit);
            setIsAllReportsViewChecked(allReportsView);
            setIsAllReportsEditChecked(allReportsEdit);
            setIsAllAdministrationsViewChecked(allAdminsView);
            setIsAllAdministrationsEditChecked(allAdminsEdit);

            console.log("All masters view checked:", allMastersView);
            console.log("All masters edit checked:", allMastersEdit);
          }, 100);
        }

        // Set edit modal to true and initialize modal
        setIsEditUserDetails(true);

        // Initialize modal after a short delay to ensure DOM is ready
        setTimeout(() => {
          const modalElement = document.getElementById("userEditModal");
          if (modalElement) {
            const modal = new Modal(modalElement);
            setEditModal(modal);
            modal.show();
          }
        }, 200);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      toast.error("Failed to fetch user details. Please try again.");
    }
  };

  const handleShowConfirm = (type) => {
    if (type === "single") {
      setMesssage("Are you sure you want to delete this user?");
      setIsConfirmModal(true);
    } else {
      if (selectedUsers.length === 0) {
        toast.error("Please select users to delete");
        return;
      }
      setMesssage(
        `Are you sure you want to delete ${selectedUsers.length} selected users?`
      );
      setIsConfirmModal(true);
    }
  };

  const handleYesConfirm = () => {
    if (confirmType === "single") handleDeleteUser(userIdState);
    else handleBulkDelete();
  };

  // Handle delete user
  const handleDeleteUser = async (userId) => {
    setDeleteLoading(true);
    try {
      const response = await api.delete(`/api/users/delete/${userId}`);
      if (response.data && response.data.status === true) {
        toast.success(response.data.message);
        fetchUsers(); // Refresh the user list
        // Remove from selected users if it was selected
        if (selectedUsers.includes(userId)) {
          setSelectedUsers(selectedUsers.filter((id) => id !== userId));
        }
      }
      setUserIdState("");
      setIsConfirmModal(false);
    } catch (error) {
      console.error("Error deleting user:", error);
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        toast.error(error.response.data.message);
      } else {
        toast.error("An error occurred while deleting the user.");
      }
      setIsConfirmModal(false);
      setUserIdState("");
    } finally {
      setIsConfirmModal(false);
      setDeleteLoading(false);
      setUserIdState("");
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    setDeleteLoading(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const userId of selectedUsers) {
        try {
          const response = await api.delete(`/api/users/delete/${userId}`);
          if (response.data && response.data.status === true) {
            successCount++;
          }
          setIsConfirmModal(false);
        } catch (error) {
          errorCount++;
          console.error(`Error deleting user ${userId}:`, error);
          toast.error(`Error deleting user ${userId}:`, error);
        }
      }
      console.log(
        `${successCount} users deleted successfully. ${errorCount} deletions failed.`
      );

      toast.success("Users deleted successfully");
      fetchUsers(); // Refresh the user list
      setSelectedUsers([]); // Clear selection
      setSelectAll(false);
      setIsConfirmModal(false);
    } catch (error) {
      console.error("Error in bulk delete:", error);
      toast.error("Error in deleting users. Please try again.");
      setIsConfirmModal(false);
    } finally {
      setIsConfirmModal(false);
      setDeleteLoading(false);
    }
  };

  const handleLoadBranchDropdownValues = async (e) => {
    e.preventDefault();

    try {
      const response = await api.get("/api/branch/by-company"); // API call
      const branchList = response.data.data;

      const formattedBranches = branchList.map((branch) => ({
        label: `${branch.name} (${branch.code})`,
        value: branch.id,
      }));

      setBranchDropdownValues(formattedBranches); // ✅ Set dropdown values
      setIsAddUser(true); // ✅ Open the Add User form/modal
    } catch (error) {
      console.error("Failed to load branch dropdown values:", error);
      toast.error("Failed to load branches. Please try again.");
    }
  };

  // Add handleCloseEditModal function
  const handleCloseEditModal = (e) => {
    console.log("Closing edit modal");
    handleReset(e);
    // First hide the modal using Bootstrap's API
    if (editModal) {
      editModal.hide();
      cleanupModalArtifacts();
    }

    // Add a small delay before resetting states to allow animation to complete
    setTimeout(() => {
      setIsEditUserDetails(false);
      setUserDetails({});
      setSelectedOptions([]);
      setErrors({});
    }, 300);
  };

  // Update handleEditUser function to match the required API structure
  const handleEditUser = async (e) => {
    e.preventDefault();
    console.log("handleEditUser called"); // Debug log
    console.log("Current masterViewPermissions:", masterViewPermissions);
    console.log("Current masterEditPermissions:", masterEditPermissions);
    console.log(
      "Current transactionViewPermissions:",
      transactionViewPermissions
    );
    console.log(
      "Current transactionEditPermissions:",
      transactionEditPermissions
    );
    console.log("Current reportViewPermissions:", reportViewPermissions);
    console.log("Current reportEditPermissions:", reportEditPermissions);
    console.log("Current adminViewPermissions:", adminViewPermissions);
    console.log("Current adminEditPermissions:", adminEditPermissions);

    // Validate form data with isUpdate=true to skip password validation if empty
    const validationErrors = validateForm(
      {
        ...userDetails,
        branch: selectedOptions,
      },
      true
    );

    console.log("Validation errors:", validationErrors); // Debug log
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      console.log("Form has validation errors"); // Debug log
      return;
    }

    // Format permissions according to the required structure
    const formattedPermissions = [];

    // Add master permissions with the original names from API
    masters.forEach((master) => {
      // Use the exact name as in the server's expected format
      formattedPermissions.push({
        pageName: master.name, // Keep the original name with "Master" suffix
        canView: !!masterViewPermissions[master.type],
        canEdit: !!masterEditPermissions[master.type],
      });
    });

    // Add transaction permissions
    transactions.forEach((transaction) => {
      formattedPermissions.push({
        pageName: transaction.name,
        canView: !!transactionViewPermissions[transaction.type],
        canEdit: !!transactionEditPermissions[transaction.type],
      });
    });

    // Add report permissions
    reports.forEach((report) => {
      formattedPermissions.push({
        pageName: report.name,
        canView: !!reportViewPermissions[report.type],
        canEdit: !!reportEditPermissions[report.type],
      });
    });

    // Add administration permissions
    administrations.forEach((admin) => {
      formattedPermissions.push({
        pageName: admin.name,
        canView: !!adminViewPermissions[admin.type],
        canEdit: !!adminEditPermissions[admin.type],
      });
    });

    console.log("Formatted permissions:", formattedPermissions); // Debug log

    // Prepare the update payload according to the API format
    const updatedUser = {
      id: userDetails.id, // Explicitly include the user ID in the payload
      username: userDetails.name,
      email: userDetails.email,
      role: userDetails.role.toUpperCase(), // Ensure role is uppercase
      department: userDetails.department,
      status: userDetails.status.toUpperCase(), // Ensure status is uppercase
      branchIds: selectedOptions.map((option) => option.value),
      permissions: formattedPermissions,
    };

    // Only include password if it was changed
    if (userDetails.password && userDetails.password.trim() !== "") {
      updatedUser.password = userDetails.password;
    }

    console.log("Current user details:", userDetails); // Debug log
    console.log("Updating user with data:", updatedUser); // Debug log
    console.log("User ID being updated:", userDetails.id); // Debug log

    try {
      // Make sure we have a valid user ID
      if (!userDetails.id) {
        toast.error("Error: Missing user ID for update");
        return;
      }

      // Try multiple API endpoint formats to ensure one works
      let response;
      let endpoint = `/api/users/update/${userDetails.id}`;
      console.log("Trying API endpoint:", endpoint); // Debug log

      try {
        response = await api({
          method: "put",
          url: endpoint,
          data: updatedUser,
          headers: {
            "Content-Type": "application/json",
          },
        });
        handleReset(e);
      } catch (err) {
        console.log("First endpoint failed, trying alternate endpoint");
        handleReset(e);
        // Try alternate endpoint format
        endpoint = `/api/users/${userDetails.id}`;
        console.log("Trying alternate API endpoint:", endpoint); // Debug log

        response = await api({
          method: "put",
          url: endpoint,
          data: updatedUser,
          headers: {
            "Content-Type": "application/json",
          },
        });
      }

      console.log("Update response:", response); // Debug log

      if (response.data && response.data.status === true) {
        // First properly hide the modal using Bootstrap's API
        if (editModal) {
          editModal.hide();
        }

        // Clean up any modal artifacts
        cleanupModalArtifacts();

        // Reset modal state
        setIsEditUserDetails(false);

        // Reset form states
        setUserDetails({});
        setSelectedOptions([]);
        setErrors({});

        // Refresh user list
        await fetchUsers();

        // Show success message after all UI updates
        setTimeout(() => {
          toast.success(response.data.message);
        }, 100);
      } else {
        console.error("API returned success=false:", response.data);
        toast.error(
          response.data.message || "Update failed. Please try again."
        );
      }
    } catch (error) {
      console.error("Error updating user:", error);
      console.error("Error response:", error.response); // Debug log

      // More detailed error logging
      if (error.response) {
        console.error("Error status:", error.response.status);
        console.error("Error headers:", error.response.headers);
        console.error("Error data:", error.response.data);
      }

      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(
          "An error occurred while updating the user. Please try again later."
        );
      }
    }
  };

  // Global function to clean up modal artifacts
  const cleanupModalArtifacts = () => {
    console.log("Cleaning up modal artifacts");
    document.body.classList.remove("modal-open");
    document.body.style.paddingRight = "";
    document.body.style.overflow = "";
    const backdrops = document.getElementsByClassName("modal-backdrop");
    while (backdrops.length > 0) {
      backdrops[0].remove();
    }
  };

  // Add useEffect for component mount/unmount to ensure modals are cleaned up
  useEffect(() => {
    // On component unmount, clean up any modal artifacts
    return () => {
      cleanupModalArtifacts();
    };
  }, []);

  // Role based access
  const { getPermission } = useContext(AppContext);
  const { canView, canEdit } = getPermission("User Management");

  // Reset all filters
  const handleResetFilters = () => {
    setSearchTerm("");
    setFilterRole("");
    setFilterStatus("");
  };

  return (
    <div>
      {/* Header section */}
      <nav className="navbar bg-light border-body" data-bs-theme="light">
        <div className="container-fluid p-0">
          <div className="mt-4">
            <h3 className="nav-header header-style">User Management</h3>
            <p className="breadcrumb">
              <Link to="/dashboard">
                <i className="fas fa-home text-8"></i>
              </Link>{" "}
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
            <i className="fa-solid fa-plus pe-1"></i> Add New User
          </button>
        </div>
      </nav>
      {/* Search and Filter Section */}
      <div className="search-filter-container">
        <div className="search-container content-container">
          <div className="position-relative w-100">
            <i className="fas fa-search position-absolute z-0 input-icon"></i>
            <input
              type="text"
              className="form-control search-bar-style"
              id="search"
              placeholder="Search users by name, email, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="filter-options">
          <select
            className="filter-select"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Manager">Manager</option>
          </select>
        </div>
        <div className="filter-options">
          <select
            className="filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        <button className="filter-select" onClick={handleResetFilters}>
          <i className="fas fa-filter me-2"></i>
          Reset Filters
        </button>
      </div>
      {/* Form Section */}
      {isAddUser && (
        <div className="table-form-container">
          <div className="form-container">
            <div className="form-header">
              <h2>
                <i className="fas fa-plus pe-1"></i> Add New User
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
                      Full name <span className="text-danger fs-6">*</span>
                    </label>
                    <div className="position-relative w-100">
                      <i className="fas fa-user position-absolute z-0 input-icon"></i>
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
                    {errors.name && (
                      <span className="error-message">{errors.name}</span>
                    )}
                  </div>
                  <div className="col-4 d-flex flex-column form-group">
                    <label htmlFor="email" className="form-label">
                      Email <span className="text-danger fs-6">*</span>
                    </label>
                    <div className="position-relative w-100">
                      <i className="fa-solid fa-envelope position-absolute z-0 input-icon"></i>
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
                    {errors.email && (
                      <span className="error-message">{errors.email}</span>
                    )}
                  </div>
                  <div className="col-4 d-flex flex-column form-group">
                    <label htmlFor="pass" className="form-label">
                      Password <span className="text-danger fs-6">*</span>
                    </label>
                    <div className="position-relative w-100">
                      <i className="fas fa-lock position-absolute z-0 input-icon"></i>
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
                    {errors.password && (
                      <span className="error-message">{errors.password}</span>
                    )}
                  </div>
                </div>
                <div className="row">
                  <div className="col-4 d-flex flex-column form-group">
                    <label htmlFor="cnfpass" className="form-label">
                      Confirm Password{" "}
                      <span className="text-danger fs-6">*</span>
                    </label>
                    <div className="position-relative w-100">
                      <i className="fas fa-lock position-absolute z-0 input-icon"></i>
                      <input
                        type="password"
                        className="form-control text-font ps-5"
                        id="cnfpass"
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            confirmPassword: e.target.value,
                          })
                        }
                        autoComplete="off"
                      />
                    </div>
                    {errors.confirmPassword && (
                      <span className="error-message">
                        {errors.confirmPassword}
                      </span>
                    )}
                  </div>
                  <div className="col-4 d-flex flex-column form-group">
                    <label htmlFor="role" className="form-label">
                      Role <span className="text-danger fs-6">*</span>
                    </label>
                    <div className="position-relative w-100">
                      <i className="fas fa-user-tag position-absolute z-0 input-icon"></i>
                      <select
                        className={`form-select ps-5 text-font ${
                          formData.role ? "" : "text-secondary"
                        }`}
                        id="role"
                        value={formData.role}
                        onChange={(e) =>
                          setFormData({ ...formData, role: e.target.value })
                        }
                      >
                        <option value="" disabled hidden className="text-muted">
                          Select Role
                        </option>
                        <option value="admin">Admin</option>
                        {/* <option value="executive">Executive</option> */}
                        <option value="manager">Manager</option>
                      </select>
                    </div>
                    {errors.role && (
                      <span className="error-message">{errors.role}</span>
                    )}
                  </div>
                  <div className="col-4 d-flex flex-column form-group">
                    <label htmlFor="department" className="form-label">
                      Department <span className="text-danger fs-6">*</span>
                    </label>
                    <div className="position-relative w-100">
                      <i className="fa-solid fa-building position-absolute z-0 input-icon"></i>
                      <select
                        className={`form-select ps-5 text-font ${
                          formData.department ? "" : "text-secondary"
                        }`}
                        id="department"
                        value={formData.department}
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
                          style={{ color: "#6c757d !important" }}
                        >
                          Select Department
                        </option>
                        <option value="production">Production</option>
                        <option value="store">Store</option>
                      </select>
                      {/* <i className="fa-solid fa-angle-down position-absolute down-arrow-icon"></i> */}
                    </div>
                    {errors.department && (
                      <span className="error-message">{errors.department}</span>
                    )}
                  </div>
                </div>
                <div className="row">
                  <div className="col-4 d-flex flex-column form-group">
                    <label htmlFor="status" className="form-label">
                      Status
                    </label>
                    <div className="position-relative w-100">
                      <div className="form-check form-switch position-absolute z-0 input-icon mt-1 padding-left-2">
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
                  <div className="col-4 d-flex flex-column form-group">
                    <label htmlFor="branch" className="form-label mb-0">
                      Branch <span className="text-danger fs-6">*</span>
                    </label>
                    <div className="position-relative w-100">
                      <i className="fa-solid fa-sitemap position-absolute z-0 input-icon"></i>
                      <Select
                        className="form-control p-0 text-font border-0"
                        options={branchDropdownValues}
                        isMulti
                        id="branch"
                        value={selectedOptions}
                        onChange={(options) => {
                          console.log("Branch selection changed:", options);
                          setSelectedOptions(options || []);
                        }}
                        placeholder="Select branches..."
                      />

                      {/* <i className="fa-solid fa-angle-down position-absolute down-arrow-icon"></i> */}
                    </div>
                    {errors.branch && (
                      <span className="error-message">{errors.branch}</span>
                    )}
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
                      <tbody className="text-break">
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
                      <tbody className="text-break">
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
                                      handleSingleTransactionEditChange(
                                        transaction.type
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
                      <tbody className="text-break">
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
                                      handleSingleReportEditChange(report.type)
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
                      <tbody className="text-break">
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
                                      handleSingleAdminEditChange(
                                        administration.type
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
              <button
                className="btn-action btn-danger"
                onClick={() => {
                  setConfirmType("multi");
                  handleShowConfirm("multi");
                }}
                disabled={selectedUsers.length === 0 || deleteLoading}
              >
                {deleteLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> Deleting...
                  </>
                ) : (
                  <>
                    <i className="fas fa-trash"></i> Delete Selected
                  </>
                )}
              </button>
            </div>
          </div>
          {/* Table list */}
          <table>
            <thead>
              <tr>
                <th className="checkbox-cell">
                  <input type="checkbox" id="select-all" disabled />
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
            <tbody className="text-break">
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center">
                    No users found
                  </td>
                </tr>
              ) : (
                users
                  .filter((user) => {
                    const search = searchTerm.toLowerCase();
                    const matchSearch =
                      user.name.toLowerCase().includes(search) ||
                      user.email.toLowerCase().includes(search) ||
                      user.role.toLowerCase().includes(search);

                    const matchRole =
                      filterRole === "" ||
                      user.role.toLowerCase() === filterRole.toLowerCase();

                    const matchStatus =
                      filterStatus === "" ||
                      user.status.toLowerCase() === filterStatus.toLowerCase();

                    return matchSearch && matchRole && matchStatus;
                  })
                  .map((user) => (
                    <tr key={user.id}>
                      <td className="checkbox-cell ps-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleUserCheckboxChange(user.id)}
                        />
                      </td>
                      <td className="ps-4">
                        <div className="user-info">
                          <img src={user.img} alt={user.name} />
                          <span>{user.name}</span>
                        </div>
                      </td>
                      <td className="ps-4">
                        <span className={`badge ${user.role.toLowerCase()}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="ps-4">{user.email}</td>
                      <td className="ps-4">{user.time}</td>
                      <td className="ps-4">
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
                        <button
                          className="btn-icon btn-danger"
                          title="Delete"
                          onClick={() => {
                            setUserIdState(user.id);
                            setConfirmType("single");
                            handleShowConfirm("single");
                          }}
                          disabled={deleteLoading}
                        >
                          <i
                            className={
                              deleteLoading
                                ? "fas fa-spinner fa-spin"
                                : "fas fa-trash"
                            }
                          ></i>
                        </button>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="pagination-container">
            <div className="pagination-info">
              Showing {getItemRange()} of {totalItems} entries
            </div>
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
                    className={`btn-page ${
                      currentPage === pageNum ? "active" : ""
                    }`}
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

      {/* Confirmation dialog modal */}
      {isConfirmModal && (
        <div className="modal fade" id="userConfirmModal" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-circle-check me-2"></i>
                  Confirm
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseConfirmModal}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">{message}</div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-primary add-btn"
                  onClick={handleYesConfirm}
                >
                  <i className="fas fa-check me-2"></i>
                  Yes
                </button>
                <button
                  type="button"
                  className="btn btn-secondary add-btn"
                  onClick={() => {
                    setConfirmState(false);
                    handleCloseConfirmModal();
                  }}
                >
                  <i className="fas fa-times me-2"></i>
                  No
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View User Details Modal */}
      {isShowUserDetails && (
        <div className="modal fade" id="userDetailModal" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-user-circle me-2"></i>
                  User Details
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                {/* Basic Information */}
                <div className="user-details-grid">
                  <div className="detail-item">
                    <strong>Full Name</strong>
                    <span>{userDetails.username}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Email Address</strong>
                    <span>{userDetails.email}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Role</strong>
                    <span
                      className={`badge ${userDetails.role?.toLowerCase()} w-25`}
                    >
                      {userDetails.role}
                    </span>
                  </div>
                  <div className="detail-item">
                    <strong>Department</strong>
                    <span className="text-capitalize">
                      {userDetails.department}
                    </span>
                  </div>
                  <div className="detail-item">
                    <strong>Status</strong>
                    <span
                      className={`badge status ${userDetails.status?.toLowerCase()} w-25`}
                    >
                      {userDetails.status}
                    </span>
                  </div>
                  <div className="detail-item">
                    <strong>Company</strong>
                    <span>{userDetails.companyName}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Last Login Time</strong>
                    <span>
                      {formatDateTime(userDetails.lastLoginDateTime) || "Never"}
                    </span>
                  </div>
                  <div className="detail-item">
                    <strong>Last Login IP</strong>
                    <span>{userDetails.lastLoginIp || "N/A"}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Assigned Branches</strong>
                    <span>
                      {userDetails.branches
                        ?.map((branch) => `${branch.name} (${branch.code})`)
                        .join(", ") || "None assigned"}
                    </span>
                  </div>
                </div>

                {/* Permissions Table */}
                <div className="permissions-section">
                  <h6 className="px-3 pt-3 mb-3">
                    <i className="fas fa-lock me-2"></i>
                    Module Permissions
                  </h6>
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th style={{ width: "60%" }}>Module Name</th>
                          <th style={{ width: "20%" }} className="text-center">
                            View
                          </th>
                          <th style={{ width: "20%" }} className="text-center">
                            Edit
                          </th>
                        </tr>
                      </thead>
                      <tbody className="text-break">
                        {userDetails.permissions &&
                        userDetails.permissions.length > 0 ? (
                          // Only render unique permissions by pageName
                          [
                            ...new Map(
                              userDetails.permissions.map((p) => [
                                p.pageName,
                                p,
                              ])
                            ).values(),
                          ].map((permission, index) => {
                            console.log(
                              `Rendering permission: ${permission.pageName}, view: ${permission.canView}, edit: ${permission.canEdit}`
                            );
                            return (
                              <tr key={index}>
                                <td className="align-middle">
                                  <span className="fw-medium">
                                    {permission.pageName}
                                  </span>
                                </td>
                                <td className="text-center align-middle">
                                  <i
                                    className={`fas ${
                                      permission.canView
                                        ? "fa-check text-success"
                                        : "fa-times text-danger"
                                    }`}
                                  ></i>
                                </td>
                                <td className="text-center align-middle">
                                  <i
                                    className={`fas ${
                                      permission.canEdit
                                        ? "fa-check text-success"
                                        : "fa-times text-danger"
                                    }`}
                                  ></i>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan="3" className="text-center">
                              No permissions found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary add-btn"
                  onClick={handleCloseModal}
                >
                  <i className="fas fa-times me-2"></i>
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
          id="userEditModal"
          tabIndex="-1"
          aria-labelledby="editUserModalLabel"
          aria-hidden="true"
          data-bs-backdrop="static"
          data-bs-keyboard="false"
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="editUserModalLabel">
                  <i className="fas fa-user-edit me-2 font-1"></i>
                  Edit User
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseEditModal}
                  aria-label="Close"
                ></button>
              </div>
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
                              Full Name{" "}
                              <span className="text-danger fs-6">*</span>
                            </label>
                            <div className="position-relative w-100">
                              <i className="fas fa-user position-absolute z-0 input-icon"></i>
                              <input
                                type="text"
                                className="form-control text-font ps-5"
                                id="userId"
                                value={userDetails.name}
                                onChange={(e) =>
                                  setUserDetails({
                                    ...userDetails,
                                    name: e.target.value,
                                  })
                                }
                                placeholder="Enter full name"
                              />
                            </div>
                          </div>
                          <div className="col-4 d-flex flex-column form-group">
                            <label htmlFor="email" className="form-label">
                              Email <span className="text-danger fs-6">*</span>
                            </label>
                            <div className="position-relative w-100">
                              <i className="fa-solid fa-envelope position-absolute z-0 input-icon"></i>
                              <input
                                type="email"
                                className="form-control text-font ps-5"
                                id="email"
                                placeholder="Enter email address"
                                value={userDetails.email}
                                onChange={(e) =>
                                  setUserDetails({
                                    ...userDetails,
                                    email: e.target.value,
                                  })
                                }
                                autoComplete="off"
                              />
                            </div>
                          </div>
                          <div className="col-4 d-flex flex-column form-group">
                            <label htmlFor="pass" className="form-label">
                              Password{" "}
                              <span className="text-danger fs-6">*</span>
                            </label>
                            <div className="position-relative w-100">
                              <i className="fas fa-lock position-absolute z-0 input-icon"></i>
                              <input
                                type="password"
                                className="form-control text-font ps-5"
                                id="pass"
                                placeholder="Enter new password (optional)"
                                value={userDetails.password || ""}
                                onChange={(e) =>
                                  setUserDetails({
                                    ...userDetails,
                                    password: e.target.value,
                                  })
                                }
                                autoComplete="off"
                              />
                            </div>
                            {errors.password && (
                              <span className="error-message">
                                {errors.password}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-4 d-flex flex-column form-group">
                            <label htmlFor="cnfpass" className="form-label">
                              Confirm Password{" "}
                              <span className="text-danger fs-6">*</span>
                            </label>
                            <div className="position-relative w-100">
                              <i className="fas fa-lock position-absolute z-0 input-icon"></i>
                              <input
                                type="password"
                                className="form-control text-font ps-5"
                                id="cnfpass"
                                placeholder="Confirm new password (optional)"
                                value={userDetails.confirmPassword || ""}
                                onChange={(e) =>
                                  setUserDetails({
                                    ...userDetails,
                                    confirmPassword: e.target.value,
                                  })
                                }
                                autoComplete="off"
                              />
                            </div>
                            {errors.confirmPassword && (
                              <span className="error-message">
                                {errors.confirmPassword}
                              </span>
                            )}
                          </div>
                          <div className="col-4 d-flex flex-column form-group">
                            <label htmlFor="role" className="form-label">
                              Role <span className="text-danger fs-6">*</span>
                            </label>
                            <div className="position-relative w-100">
                              <i className="fas fa-user-tag position-absolute z-0 input-icon"></i>
                              <select
                                className={`form-select ps-5 text-font ${
                                  userDetails.role ? "" : "text-secondary"
                                }`}
                                id="role"
                                value={userDetails.role}
                                onChange={(e) =>
                                  setUserDetails({
                                    ...userDetails,
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
                                <option value="ADMIN">Admin</option>
                                <option value="MANAGER">Manager</option>
                                <option value="USER">User</option>
                              </select>
                              <i className="fa-solid fa-angle-down position-absolute down-arrow-icon"></i>
                            </div>
                          </div>
                          <div className="col-4 d-flex flex-column form-group">
                            <label htmlFor="department" className="form-label">
                              Department{" "}
                              <span className="text-danger fs-6">*</span>
                            </label>
                            <div className="position-relative w-100">
                              <i className="fa-solid fa-building position-absolute z-0 input-icon"></i>
                              <select
                                className={`form-select ps-5 text-font ${
                                  userDetails.department ? "" : "text-secondary"
                                }`}
                                id="department"
                                value={userDetails.department}
                                onChange={(e) =>
                                  setUserDetails({
                                    ...userDetails,
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
                                <option value="Sales">Sales</option>
                                <option value="Production">Production</option>
                                <option value="Store">Store</option>
                                <option value="Quality">Quality</option>
                                <option value="IT">IT</option>
                              </select>
                              <i className="fa-solid fa-angle-down position-absolute down-arrow-icon"></i>
                            </div>
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-4 d-flex flex-column form-group">
                            <label htmlFor="status" className="form-label">
                              Status
                            </label>
                            <div className="position-relative w-100">
                              <div className="form-check form-switch position-absolute z-0 input-icon mt-1 padding-left-2">
                                <input
                                  className="form-check-input text-font switch-style"
                                  type="checkbox"
                                  role="switch"
                                  id="switchCheckChecked"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    const newStatus = e.target.checked
                                      ? "ACTIVE"
                                      : "INACTIVE";
                                    setIsChecked(e.target.checked);
                                    setStatus(newStatus);
                                    setUserDetails((prev) => ({
                                      ...prev,
                                      status: newStatus,
                                    }));
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
                                  setIsChecked(newStatus === "ACTIVE");
                                  setUserDetails((prev) => ({
                                    ...prev,
                                    status: newStatus,
                                  }));
                                }}
                              >
                                <option value="ACTIVE">Active</option>
                                <option value="INACTIVE">Inactive</option>
                              </select>
                              <i className="fa-solid fa-angle-down position-absolute down-arrow-icon"></i>
                            </div>
                          </div>
                          <div className="col-4 d-flex flex-column form-group">
                            <label htmlFor="branch" className="form-label">
                              Branch <span className="text-danger fs-6">*</span>
                            </label>
                            <div className="position-relative w-100">
                              <i className="fa-solid fa-sitemap position-absolute z-0 input-icon"></i>
                              <Select
                                className="form-control ps-5 text-font"
                                options={branchDropdownValues}
                                isMulti
                                id="branch"
                                value={selectedOptions}
                                onChange={(options) => {
                                  console.log(
                                    "Branch selection changed:",
                                    options
                                  );
                                  setSelectedOptions(options || []);
                                }}
                                placeholder="Select branches..."
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="">
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
                              <tbody className="text-break">
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
                              <tbody className="text-break">
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
                              <tbody className="text-break">
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
                              <tbody className="text-break">
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
                      <div className="modal-footer">
                        <button
                          type="submit"
                          className="btn btn-primary border border-0 text-8 px-3 fw-medium py-2 me-3"
                        >
                          <i className="fa-solid fa-floppy-disk me-1"></i> Save
                          Changes
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary border border-0 text-8 px-3 fw-medium py-2 me-3"
                          onClick={handleCloseEditModal}
                        >
                          <i className="fa-solid fa-times me-1"></i> Close
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
