import React, { useContext, useState, useRef, useEffect } from "react";
import { Modal } from "bootstrap";
import "./VendorMaster.css";
import { AppContext } from "../../../context/AppContext";
import { Link } from "react-router-dom";
import api from "../../../services/api";
import { toast } from "react-toastify";
import { AbilityContext } from "../../../utils/AbilityContext";
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import exportToExcel from "../../../utils/exportToExcel";

const VendorMaster = () => {
  const [errors, setErrors] = useState({});
  const partnerModalRef = useRef(null);
  const partnerEditModalRef = useRef(null);
  const { isAddVendor, setIsAddVendor } = useContext(AppContext);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isShowPartnerDetails, setIsShowPartnerDetails] = useState(false);
  const [isEditPartnerDetails, setIsEditPartnerDetails] = useState(false);
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [status, setStatus] = useState("active");
  const [isChecked, setIsChecked] = useState(true);
  const countryRef = useRef(null);
  const stateRef = useRef(null);
  const cityRef = useRef(null);
  const [username, setUsername] = useState("");
  const [domain, setDomain] = useState(""); // Remove preset domain
  const domains = ["litgroup.in"];

  // Dropdown should hide on click of outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (countryRef.current && !countryRef.current.contains(event.target)) {
        setShowCountryDropdown(false);
      }
      if (stateRef.current && !stateRef.current.contains(event.target)) {
        setShowStateDropdown(false);
      }
      if (cityRef.current && !cityRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Confirm modal states
  const [message, setMesssage] = useState("");
  const [confirmState, setConfirmState] = useState(false);
  const [confirmType, setConfirmType] = useState("");
  const [partnerIdState, setPartnerIdState] = useState("");
  const [isConfirmModal, setIsConfirmModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(null);

  // Country list
  const [countryList, setCountryList] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countryId, setCountryId] = useState(1);

  // State list
  const [stateList, setStateList] = useState([]);
  const [selectedState, setSelectedState] = useState(null);
  const [showStateDropdown, setShowStateDropdown] = useState(false);
  const [stateId, setStateId] = useState("");

  // City
  const [query, setQuery] = useState("");
  const [cityList, setCityList] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const [formData, setFormData] = useState({
    type: "",
    name: "",
    mobile: "",
    email: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
    address: "",
    status: "active",
    code: "", // Add code field to formData
  });

  const [viewModal, setViewModal] = useState(null);
  const [editModal, setEditModal] = useState(null);

  // Add new state for search and filters
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [filteredVendors, setFilteredVendors] = useState([]);

  // City
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await api.get(`/api/location/cities?stateId=${stateId}`);
        setCityList(res.data.data);
        console.log("Cities fetched:", res.data.data);
      } catch (err) {
        console.error("Error fetching cities:", err);
      }
    };

    const timeout = setTimeout(fetchCities, 300); // debounce
    return () => clearTimeout(timeout);
  }, [selectedState]);

  const handleSelect = (city) => {
    setSelectedCity(city);
    setQuery(city.name);
    setFormData({ ...formData, city: city.name });
    setShowDropdown(false);
  };

  // Country
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await api.get("/api/location/countries");
        console.log("Country : " + response.data);
        setCountryList(response.data.data);
      } catch (err) {
        console.error("Error fetching states:", err);
      }
    };

    const timeout = setTimeout(fetchCountries, 300);
    return () => clearTimeout(timeout);
  }, []);

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setFormData({ ...formData, country: country.name });
    setShowCountryDropdown(false);
    setCountryId(country.id);
  };

  // State
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await api.get(
          `/api/location/states?countryId=${countryId}`
        );
        setStateList(response.data.data);
      } catch (err) {
        console.error("Error fetching states:", err);
      }
    };

    const timeout = setTimeout(fetchStates, 300); // debounce
    return () => clearTimeout(timeout);
  }, [selectedCountry]);

  const handleStateSelect = (state) => {
    setSelectedState(state);
    setFormData({ ...formData, state: state.name });
    setShowStateDropdown(false);
    setStateId(state.id);
  };

  // Confirm useEffect for confirm modal
  useEffect(() => {
    let modal = null;

    if (isConfirmModal) {
      const modalElement = document.getElementById("vendorConfirmModal");

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

  // Initialize filteredVendors with vendors on mount and when vendors change
  useEffect(() => {
    setFilteredVendors(vendors);
  }, [vendors]);

  // Initialize modals
  useEffect(() => {
    if (isShowPartnerDetails && partnerModalRef.current && !viewModal) {
      const modal = new Modal(partnerModalRef.current);
      setViewModal(modal);
      modal.show();
    }
  }, [isShowPartnerDetails, viewModal]);

  useEffect(() => {
    if (isEditPartnerDetails && partnerEditModalRef.current && !editModal) {
      const modal = new Modal(partnerEditModalRef.current);
      setEditModal(modal);
      modal.show();
    }
  }, [isEditPartnerDetails, editModal]);

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

  const handleShowConfirm = (type) => {
    if (type === "single") {
      setMesssage("Are you sure you want to delete this partner?");
      setIsConfirmModal(true);
    } else {
      if (selectedVendors.length === 0) {
        toast.error("Please select at least one partner to delete.");
        return;
      }
      setMesssage(
        `Are you sure you want to delete ${selectedVendors.length} selected partner(s)?`
      );
      setIsConfirmModal(true);
    }
  };

  const handleYesConfirm = () => {
    if (confirmType === "single") handleDeletePartner(partnerIdState);
    else handleDeleteSelected();
  };

  // Fetch vendor/customer data from the API
  const fetchVendors = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/vendor-customer/all");

      // Handle new API response format
      if (
        response.data &&
        response.data.status === true &&
        response.data.data
      ) {
        setVendors(response.data.data);
        setTotalItems(response.data.data.length);
      }
      // Handle old API response format for backward compatibility
      else if (response.data && response.data.businessPartner) {
        setVendors(response.data.businessPartner);
        setTotalItems(response.data.businessPartner.length);
      }
    } catch (error) {
      console.error("Error fetching vendor/customer data:", error);
      toast.error("Error in fetching business partner details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  // Function to handle Add Vendor button click
  const handleSetIsAddVendor = () => {
    setIsAddVendor(true);
  };

  // Add useEffect for filtering
  useEffect(() => {
    filterVendors();
  }, [vendors, searchQuery, typeFilter, statusFilter]);

  // Function to filter vendors
  const filterVendors = () => {
    let filtered = [...vendors];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (vendor) =>
          vendor.name?.toLowerCase().includes(query) ||
          vendor.email?.toLowerCase().includes(query) ||
          vendor.city?.toLowerCase().includes(query) ||
          vendor.mobile?.toLowerCase().includes(query)
      );
    }

    // Apply type filter
    if (typeFilter) {
      filtered = filtered.filter(
        (vendor) => vendor.type.toLowerCase() === typeFilter.toLowerCase()
      );
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(
        (vendor) => vendor.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }

    setFilteredVendors(filtered);
    setTotalItems(filtered.length);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle type filter change
  const handleTypeFilterChange = (e) => {
    setTypeFilter(e.target.value);
  };

  // Handle status filter change
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setTypeFilter("");
    setStatusFilter("");
  };

  // Calculate pagination values
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredVendors.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredVendors.length / itemsPerPage);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Previous page
  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Next page
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Handle items per page change
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value, 10));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Form validation function
  const validateForm = (data) => {
    const errors = {};

    if (!data.type) errors.type = "Type is required";
    if (!data.name) errors.name = "Name is required";
    if (!data.mobile) errors.mobile = "Mobile number is required";
    else if (!/^\d{10}$/.test(data.mobile))
      errors.mobile = "Mobile number must be 10 digits";
    if (data.email && !/\S+@\S+\.\S+/.test(data.email))
      errors.email = "Email is not valid";
    if (!data.country) errors.country = "Country is required";
    if (!data.city) errors.city = "City is required";
    if (!data.state) errors.state = "State is required";
    if (!data.pincode) errors.pincode = "Pincode is required";
    else if (!/^\d{6}$/.test(data.pincode))
      errors.pincode = "Pincode must be 6 digits";
    if (!data.address) errors.address = "Address is required";
    if (!data.code) errors.code = "Code is required"; // Validate code

    return errors;
  };

  const [partnerDetails, setPartnerDetails] = useState({
    id: "",
    type: "",
    name: "",
    mobile: "",
    email: "",
    city: "",
    state: "",
    pincode: "",
    address: "",
    status: "",
    addresses: [], // Update partnerDetails state to include addresses array
  });

  const handleAddPartner = async (e) => {
    e.preventDefault();
    const newErrors = validateForm(formData);
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        // Format the payload according to required structure
        const payload = {
          code: formData.code,
          type: formData.type.toUpperCase(),
          name: formData.name,
          mobile: formData.mobile,
          email: formData.email,
          status: formData.status.toUpperCase(),
          addresses: [
            {
              address: formData.address,
              city: formData.city,
              state: formData.state,
              pincode: formData.pincode,
              country: formData.country,
            },
          ],
        };

        const response = await api.post("/api/vendor-customer/add", payload);
        console.log("Partner added successfully:", response.data);

        if (response.data && response.data.status === true) {
          toast.success("Partner added successfully!");
        } else {
          toast.success("Partner added successfully");
        }

        // Reset the form
        handleReset(e);

        // Close the form popup/modal
        setIsAddVendor(false);

        // Refresh the vendor list
        fetchVendors();
      } catch (error) {
        console.error("Error adding partner:", error);
        toast.error("Error adding partner. Please try again.");
      }
    } else {
      toast.error("Form submission failed due to validation errors.");
    }
  };

  const handleDeletePartner = async (id) => {
    try {
      const response = await api.delete(`/api/vendor-customer/delete/${id}`);

      // Handle new API response format
      if (response.data && response.data.status === true) {
        toast.success("Partner deleted successfully!");
      } else {
        toast.success("Partner deleted successfully!");
      }
      setIsConfirmModal(false);
      // Refresh the vendor list
      fetchVendors();
    } catch (error) {
      console.error("Error deleting partner:", error);
      toast.error("Error deleting partner. Please try again.");
      setIsConfirmModal(false);
    }
  };

  const handleDeleteSelected = async () => {
    try {
      // Create an array of promises for each delete operation
      const deletePromises = selectedVendors.map((id) =>
        api.delete(`/api/vendor-customer/delete/${id}`)
      );

      // Wait for all delete operations to complete
      const results = await Promise.all(deletePromises);

      // Check if any of the responses use the new format
      const hasNewFormat = results.some(
        (res) => res.data && res.data.status === true
      );

      if (hasNewFormat) {
        toast.success(
          `${selectedVendors.length} partners deleted successfully!`
        );
      } else {
        toast.success("Selected partners deleted successfully!");
      }

      // Clear selection and refresh the vendor list
      setSelectedVendors([]);
      setSelectAll(false);
      fetchVendors();
      setIsConfirmModal(false);
    } catch (error) {
      setIsConfirmModal(false);
      console.error("Error deleting selected partners:", error);
      toast.error("Error deleting selected partners. Please try again.");
    }
  };

  const handleEditPartner = async (e) => {
    e.preventDefault();
    const newErrors = validateForm(partnerDetails);
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        const response = await api.put(
          `/api/vendor-customer/update/${partnerDetails.id}`,
          partnerDetails
        );

        if (response.data && response.data.status === true) {
          toast.success("Partner updated successfully!");
        } else {
          toast.success("Partner updated successfully!");
        }

        // Refresh the vendor list
        fetchVendors();

        // Close the modal
        handleCloseEditModal();
      } catch (error) {
        console.error("Error updating partner:", error);
        toast.error("Error updating partner. Please try again.");
      }
    }
  };

  const handleReset = (e) => {
    e.preventDefault();
    setFormData({
      type: "",
      name: "",
      mobile: "",
      email: "",
      city: "",
      state: "",
      pincode: "",
      address: "",
      status: "active",
      code: "", // Reset code field
    });
    setQuery("");
    setIsChecked(true);
    setStatus("active");
  };

  const handleVendorCheckboxChange = (vendorId) => {
    setSelectedVendors((prevSelected) =>
      prevSelected.includes(vendorId)
        ? prevSelected.filter((id) => id !== vendorId)
        : [...prevSelected, vendorId]
    );
  };

  const handleSelectAllChange = (e) => {
    const checked = e.target.checked;
    setSelectAll(checked);
    if (checked) {
      const allVendorIds = currentItems.map((vendor) => vendor.id);
      setSelectedVendors(allVendorIds);
    } else {
      setSelectedVendors([]);
    }
  };

  const handleViewPartner = async (partnerId) => {
    try {
      const response = await api.get(`/api/vendor-customer/get/${partnerId}`);
      if (response.data && response.data.status === true) {
        const { data } = response.data;
        setPartnerDetails({
          id: data.id,
          code: data.code,
          type: data.type,
          name: data.name,
          mobile: data.mobile,
          email: data.email,
          status: data.status,
          addresses: data.addresses || [],
        });
      }
      setIsShowPartnerDetails(true);
    } catch (error) {
      console.error("Error fetching partner details:", error);
      toast.error("Error fetching partner details. Please try again.");
    }
  };

  const handleShowEditModal = async (partnerId) => {
    try {
      const response = await api.get(`/api/vendor-customer/get/${partnerId}`);
      if (response.data && response.data.status === true) {
        setPartnerDetails(response.data.data);
      } else if (response.data) {
        setPartnerDetails(response.data);
      }
      setIsEditPartnerDetails(true);
    } catch (error) {
      console.error("Error fetching partner details:", error);
      toast.error("Error fetching partner details. Please try again.");
    }
  };

  const handleCloseViewModal = () => {
    if (viewModal) {
      viewModal.hide();
      setViewModal(null);
    }
    setIsShowPartnerDetails(false);
  };

  const handleCloseEditModal = () => {
    if (editModal) {
      editModal.hide();
      setEditModal(null);
    }
    setIsEditPartnerDetails(false);
    setErrors({});
  };

  // RBAC
  const ability = useContext(AbilityContext);

  // Excel import
  const [excelData, setExcelData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (evt) => {
      const arrayBuffer = evt.target.result;
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const parsedData = XLSX.utils.sheet_to_json(worksheet);
      // console.log("parsedData: " + JSON.stringify(parsedData));
      setExcelData(parsedData);
    };

    reader.readAsArrayBuffer(file);
  };

  const handleSaveToAPI = async () => {
    if (excelData.length === 0) {
      toast.error("Please select an excel file");
      return;
    }

    setIsLoading(true);

    const validRows = [];
    const invalidRows = [];

    for (let i = 0; i < excelData.length; i++) {
      const row = excelData[i];

      const payload = {
        code: row.code,
        type: row.type.toUpperCase(),
        name: row.name,
        mobile: row.mobile,
        email: row.email,
        status: row.status.toUpperCase(),
        addresses: [
          {
            address: row.address,
            city: row.city,
            state: row.state,
            pincode: row.pincode,
            country: row.country,
          },
        ],
      };

      const invalidFields = {};

      for (const key in payload) {
        if (!payload[key]) {
          invalidFields[key] = true;
        }
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (payload.email && !emailRegex.test(payload.email)) {
        invalidFields["email"] = true;
      }

      if (Object.keys(invalidFields).length > 0) {
        invalidRows.push({ rowNumber: i + 2, rowData: payload, invalidFields });
      } else {
        validRows.push(payload);
      }
    }
    let partialSuccess = false;
    try {
      for (const row of validRows) {
        await api.post("/api/vendor-customer/add", row);
      }
      partialSuccess = true;
      if (invalidRows.length > 0) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet("Invalid Rows");

        // Add header
        const header = [
          "Row No.",
          "Type",
          "Code", // Add code to header
          "Name",
          "Mobile",
          "Email",
          "Address",
          "City",
          "Country",
          "State",
          "Pincode",
          "Status",
        ];
        worksheet.addRow(header);

        // Add invalid data rows
        invalidRows.forEach(({ rowNumber, rowData, invalidFields }) => {
          const rowValues = [
            rowNumber,
            rowData.type || "",
            rowData.code || "", // Add code to row values
            rowData.name || "",
            rowData.mobile || "",
            rowData.email || "",
            rowData.address || "",
            rowData.city || "",
            rowData.country || "",
            rowData.state || "",
            rowData.pincode || "",
            rowData.status || "",
          ];
          const newRow = worksheet.addRow(rowValues);

          rowValues.forEach((val, colIdx) => {
            const key = header[colIdx].toLowerCase().replace(" ", "");
            const cell = newRow.getCell(colIdx + 1);

            if (invalidFields[key] || val === "") {
              cell.fill = {
                type: "pattern",
                pattern: "solid",
                fgColor: { argb: "FFFF0000" }, // Red
              };
              cell.font = {
                color: { argb: "FFFFFFFF" }, // White text
                bold: true,
              };
            }
          });
        });

        worksheet.columns.forEach((col) => {
          col.width = 20;
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        saveAs(blob, "Invalid_VendorMaster_Rows.xlsx");

        toast.warn(
          "Some rows were skipped. Excel file with details downloaded."
        );
      } else {
        toast.success("Excel imported successfully");
      }

      fetchVendors();
    } catch (error) {
      console.error("Error saving excel data:", error);

      if (!partialSuccess) {
        toast.error(error.response?.data?.message || "Error importing Excel");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {isLoading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.7)", // semi-transparent background
            zIndex: 9999,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            pointerEvents: "all", // blocks clicks
          }}
        >
          <div
            className="spinner-border text-primary"
            role="status"
            style={{ width: "4rem", height: "4rem" }}
          >
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {/* Header section */}
      <nav className="navbar bg-light border-body" data-bs-theme="light">
        <div className="container-fluid">
          <div className="mt-4">
            <h3 className="nav-header header-style">Business Partner</h3>
            <p className="breadcrumb">
              <Link to="/dashboard">
                <i className="fas fa-home text-8"></i>
              </Link>{" "}
              <span className="ms-1 mt-1 text-small-gray">
                / Masters / Business Partner
              </span>
            </p>
          </div>

          {/* Add Partner Button */}

          {ability.can("edit", "Business Partner") && (
            <button
              className="btn btn-primary add-btn"
              onClick={handleSetIsAddVendor}
            >
              <i className="fa-solid fa-plus pe-1"></i> Add New Partner
            </button>
          )}
        </div>
      </nav>

      {/* Update Search and Filter Section */}
      <div className="search-filter-container mx-2">
        <div className="search-box">
          <i className="fas fa-search position-absolute z-0 input-icon"></i>
          <input
            type="text"
            className="form-control vendor-search-bar"
            placeholder="Search by name, email, mobile or city..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
        <div className="filter-options">
          <select
            className="filter-select"
            value={typeFilter}
            onChange={handleTypeFilterChange}
          >
            <option value="">All Types</option>
            <option value="vendor">Vendors Only</option>
            <option value="customer">Customers Only</option>
          </select>
          <select
            className="filter-select"
            value={statusFilter}
            onChange={handleStatusFilterChange}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button className="filter-select" onClick={handleResetFilters}>
            <i className="fas fa-filter me-2"></i>
            Reset Filters
          </button>
        </div>
      </div>

      {/* Form Header Section */}
      {isAddVendor && (
        <div className="table-form-container mx-2">
          <div className="form-header">
            <h2>
              <i className="fas fa-plus pe-1"></i> Add New Partner
            </h2>
            <button
              className="btn"
              onClick={(e) => {
                handleReset(e);
                setIsAddVendor(false);
              }}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          {/* Form Fields */}
          <form
            autoComplete="off"
            className="padding-2"
            onSubmit={handleAddPartner}
          >
            <div className="form-grid border-bottom pt-0">
              <div className="row form-style">
                <div className="col-3 d-flex flex-column form-group">
                  <label htmlFor="type" className="form-label ms-2">
                    Type <span className="text-danger fs-6">*</span>
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-user-tag position-absolute ps-2 z-0 input-icon"></i>
                    <select
                      className="form-control ps-5 ms-2 text-font"
                      id="type"
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value })
                      }
                    >
                      <option value="" disabled hidden className="text-muted">
                        Select Type
                      </option>
                      <option value="vendor">Vendor</option>
                      <option value="customer">Customer</option>
                    </select>
                    <i className="fa-solid fa-angle-down position-absolute down-arrow-icon"></i>
                  </div>
                  {errors.type && (
                    <span className="error-message ms-2">{errors.type}</span>
                  )}
                </div>
                <div className="col-3 d-flex flex-column form-group">
                  <label htmlFor="code" className="form-label ms-2">
                    Code <span className="text-danger fs-6">*</span>
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-hashtag position-absolute ps-2 z-0 input-icon"></i>
                    <input
                      type="text"
                      className="form-control ps-5 ms-2 text-font"
                      id="code"
                      placeholder="Enter partner code"
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({ ...formData, code: e.target.value })
                      }
                    />
                  </div>
                  {errors.code && (
                    <span className="error-message ms-2">{errors.code}</span>
                  )}
                </div>
                <div className="col-3 d-flex flex-column form-group">
                  <label htmlFor="name" className="form-label  ms-2">
                    Name <span className="text-danger fs-6">*</span>
                  </label>
                  <div className="position-relative w-100 ms-2">
                    <i className="fas fa-user position-absolute z-0 input-icon"></i>
                    <input
                      type="text"
                      className="form-control ps-5 text-font"
                      id="name"
                      placeholder="Enter full name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                  {errors.name && (
                    <span className="error-message ms-2">{errors.name}</span>
                  )}
                </div>
                <div className="col-3 d-flex flex-column form-group">
                  <label htmlFor="mobile" className="form-label  ms-2">
                    Mobile <span className="text-danger fs-6">*</span>
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-phone position-absolute ps-2 z-0 input-icon"></i>
                    <input
                      type="tel"
                      className="form-control ps-5 ms-2 text-font"
                      id="mobile"
                      placeholder="Enter 10-digit mobile number"
                      maxLength={10}
                      value={formData.mobile}
                      onChange={(e) =>
                        setFormData({ ...formData, mobile: e.target.value })
                      }
                    />
                  </div>
                  {errors.mobile && (
                    <span className="error-message ms-2">{errors.mobile}</span>
                  )}
                </div>
              </div>
              <div className="row form-style">
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="email" className="form-label  ms-2">
                    Email <span className="text-danger fs-6">*</span>
                  </label>
                  <div className="position-relative w-100">
                    <i className="fa-solid fa-envelope ps-2 position-absolute z-0 input-icon"></i>
                    <input
                      type="email"
                      className="form-control ps-5 ms-2 text-font"
                      id="email"
                      placeholder="Enter email address"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                  {errors.email && (
                    <span className="error-message ms-2">{errors.email}</span>
                  )}
                </div>
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="country" className="form-label  ms-2">
                    Country <span className="text-danger fs-6">*</span>
                  </label>
                  <div className="position-relative w-100" ref={countryRef}>
                    {/* Left-side icon inside input */}
                    <i className="fas fa-earth-americas position-absolute input-icon-start ps-2"></i>

                    {/* Input */}
                    <input
                      id="country"
                      type="text"
                      className="form-control ps-5 ms-2 text-font"
                      value={formData.country}
                      onChange={(e) => {
                        setShowCountryDropdown(true);
                        setFormData({ ...formData, country: e.target.value });
                      }}
                      placeholder="Search country"
                    />

                    {/* Dropdown */}
                    {showCountryDropdown &&
                      formData.country.trim() !== "" &&
                      countryList.length > 0 && (
                        <ul
                          className="position-absolute w-100 bg-white border mt-1 rounded shadow text-font dropdown-list py-2"
                          style={{
                            maxHeight: "200px",
                            overflowY: "auto",
                            zIndex: 1050,
                          }}
                        >
                          {countryList.map((country, index) => (
                            <li
                              key={index}
                              onClick={() => handleCountrySelect(country)}
                              className="dropdown-item px-3 py-2"
                            >
                              {country.name}
                            </li>
                          ))}
                        </ul>
                      )}

                    {/* Right-side dropdown arrow */}
                    <i className="fa-solid fa-angle-down position-absolute input-icon-end"></i>
                  </div>
                  {errors.country && (
                    <span className="error-message ms-2">{errors.country}</span>
                  )}
                </div>
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="state" className="form-label  ms-2">
                    State <span className="text-danger fs-6">*</span>
                  </label>
                  <div className="position-relative w-100" ref={stateRef}>
                    {/* Left-side icon inside input */}
                    <i className="fas fa-location-dot position-absolute input-icon-start ps-2"></i>

                    {/* Input */}
                    <input
                      id="state"
                      type="text"
                      className="form-control ps-5 ms-2 text-font"
                      value={formData.state}
                      onChange={(e) => {
                        setShowStateDropdown(true);
                        setFormData({ ...formData, state: e.target.value });
                      }}
                      placeholder="Search state"
                    />

                    {/* Dropdown */}
                    {showStateDropdown &&
                      formData.state.trim() !== "" &&
                      stateList.length > 0 && (
                        <ul
                          className="position-absolute w-100 bg-white border mt-1 rounded shadow text-font dropdown-list py-2"
                          style={{
                            maxHeight: "200px",
                            overflowY: "auto",
                            zIndex: 1050,
                          }}
                        >
                          {stateList
                            .filter((state) =>
                              state.name
                                .toLowerCase()
                                .includes(formData.state.toLowerCase())
                            )
                            .map((state, index) => (
                              <li
                                key={index}
                                onClick={() => handleStateSelect(state)}
                                className="dropdown-item px-3 py-2"
                              >
                                {state.name}
                              </li>
                            ))}
                        </ul>
                      )}

                    {/* Right-side dropdown arrow */}
                    <i className="fa-solid fa-angle-down position-absolute input-icon-end"></i>
                  </div>
                  {errors.state && (
                    <span className="error-message ms-2">{errors.state}</span>
                  )}
                </div>
              </div>
              <div className="row form-style">
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="city" className="form-label  ms-2">
                    City <span className="text-danger fs-6">*</span>
                  </label>
                  <div className="position-relative w-100" ref={cityRef}>
                    <i className="fas fa-city position-absolute ps-2 z-0 input-icon-start"></i>
                    <input
                      type="text"
                      className="form-control ps-5 ms-2 text-font"
                      value={query}
                      onChange={(e) => {
                        setQuery(e.target.value);
                        setShowDropdown(true);
                        setFormData({ ...formData, city: e.target.value });
                      }}
                      placeholder="Search city"
                    />

                    {showDropdown && cityList.length > 0 && (
                      <ul
                        className="position-absolute w-100 bg-white border mt-1 rounded shadow text-font dropdown-list py-2"
                        style={{
                          maxHeight: "200px",
                          overflowY: "auto",
                          zIndex: 1050,
                        }}
                      >
                        {cityList
                          .filter((city) =>
                            city.name
                              .toLowerCase()
                              .includes(formData.city.toLowerCase())
                          )
                          .map((city, index) => (
                            <li
                              key={index}
                              onClick={() => handleSelect(city)}
                              className="dropdown-item px-3 py-2"
                              style={{ cursor: "pointer" }}
                            >
                              {city.name}
                            </li>
                          ))}
                      </ul>
                    )}
                    <i className="fa-solid fa-angle-down position-absolute down-arrow-icon input-icon-end"></i>
                  </div>
                  {errors.city && (
                    <span className="error-message ms-2">{errors.city}</span>
                  )}
                </div>
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="pincode" className="form-label  ms-2">
                    Pincode <span className="text-danger fs-6">*</span>
                  </label>
                  <div className="position-relative w-100">
                    <i className="fa-solid fa-map-pin ps-2 position-absolute z-0 input-icon"></i>
                    <input
                      type="text"
                      className="form-control ps-5 ms-2 text-font"
                      id="pincode"
                      placeholder="Enter pincode"
                      maxLength={6}
                      value={formData.pincode}
                      onChange={(e) =>
                        setFormData({ ...formData, pincode: e.target.value })
                      }
                    />
                  </div>
                  {errors.pincode && (
                    <span className="error-message ms-2">{errors.pincode}</span>
                  )}
                </div>
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="address" className="form-label  ms-2">
                    Address <span className="text-danger fs-6">*</span>
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-map-marker-alt ps-2 position-absolute z-0 input-icon"></i>
                    <textarea
                      type="text"
                      className="form-control pt-3 ps-5 ms-2 text-font"
                      id="address"
                      placeholder="Enter complete address"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                    ></textarea>
                  </div>
                  {errors.address && (
                    <span className="error-message ms-2">{errors.address}</span>
                  )}
                </div>
              </div>
              <div className="row form-style">
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="status" className="form-label ms-2">
                    Status
                  </label>
                  <div className="position-relative w-100 ms-2">
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
              </div>
            </div>
            <div className="form-actions">
              <button
                className="btn btn-primary border border-0 text-8 px-3 fw-medium py-2 me-3 float-end"
                onClick={handleAddPartner}
              >
                <i className="fa-solid fa-floppy-disk me-1"></i> Save Changes
              </button>
              <button
                className="btn btn-secondary border border-0 text-8 px-3 fw-medium py-2 bg-secondary me-3 float-end"
                onClick={handleReset}
              >
                <i className="fa-solid fa-arrows-rotate me-1"></i> Reset
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table Section */}
      <div className="margin-2 mx-2">
        <div className="table-container">
          <div className="table-header d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div className="selected-count">
              <input
                type="checkbox"
                id="select-all"
                checked={selectAll}
                onChange={handleSelectAllChange}
              />
              <label htmlFor="select-all">
                {selectedVendors.length} Selected
              </label>
            </div>
            <div className="bulk-actions">
              <div className="d-flex align-items-center gap-2">
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  className="form-control form-control-sm w-auto text-8"
                  onChange={handleFileUpload}
                />

                <button
                  className="btn btn-outline-secondary text-8"
                  onClick={handleSaveToAPI}
                >
                  <i className="fas fa-file-import me-1"></i> Import Excel
                </button>
              </div>
              <button
                className="btn btn-outline-success text-8"
                onClick={() => {
                  const rowData = currentItems.filter((row) =>
                    selectedVendors.includes(row.id)
                  );
                  exportToExcel(rowData, "Business Partners");
                }}
              >
                <i className="fas fa-file-export me-1"></i>
                Export Selected
              </button>
              <button
                className="btn-action btn-danger"
                onClick={() => {
                  setConfirmType("multi");
                  handleShowConfirm("multi");
                }}
              >
                <i className="fas fa-trash"></i>
                Delete Selected
              </button>
            </div>
          </div>
          <table className="table table-striped table-hover table-sm p-2">
            <thead>
              <tr>
                <th className="checkbox-cell">
                  <input type="checkbox" id="select-all-header" disabled />
                </th>
                <th>Partner Code</th>
                <th>Name</th>
                <th>Type</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>City</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody className="text-break">
              {loading ? (
                <tr>
                  <td colSpan="12" className="text-center">
                    <div className="my-3">
                      <i className="fas fa-spinner fa-spin me-2"></i> Loading
                      vendors and customers...
                    </div>
                  </td>
                </tr>
              ) : filteredVendors.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center">
                    <div className="p-4">
                      <i className="fas fa-search fa-3x mb-3 text-muted"></i>
                      <h5>No matching partners found</h5>
                      <p className="text-muted">
                        Click on "Add New Partner" button to add new partners
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentItems.map((vendor) => (
                  <tr key={vendor.id}>
                    <td className="checkbox-cell ps-4">
                      <input
                        type="checkbox"
                        checked={selectedVendors.includes(vendor.id)}
                        onChange={() => handleVendorCheckboxChange(vendor.id)}
                      />
                    </td>
                    <td className="ps-4">{vendor.code}</td>
                    <td className="ps-3">
                      <div className="user-info">
                        <img
                          src={`https://ui-avatars.com/api/?name=${vendor.name}&size=32&background=2563eb&color=fff`}
                          alt={vendor.name}
                        />
                        <span>{vendor.name}</span>
                      </div>
                    </td>
                    <td className="ps-4">
                      <span className={`badge ${vendor.type.toLowerCase()}`}>
                        {vendor.type.charAt(0).toUpperCase() +
                          vendor.type.slice(1)}
                      </span>
                    </td>
                    <td className="ps-4">{vendor.email}</td>
                    <td className="ps-4">{vendor.mobile}</td>
                    <td className="ps-4">
                      {vendor.addresses && vendor.addresses[0]
                        ? vendor.addresses[0].city
                        : ""}
                    </td>
                    {/* <td>{vendor.pincode}</td> */}
                    <td className="ps-4">
                      <span
                        className={`badge status ${vendor.status.toLowerCase()}`}
                      >
                        {vendor.status.charAt(0).toUpperCase() +
                          vendor.status.slice(1)}
                      </span>
                    </td>
                    <td className="ps-4">
                      <button
                        className="btn-icon btn-primary"
                        title="View Details"
                        onClick={() => handleViewPartner(vendor.id)}
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      {ability.can("edit", "Business Partner") && (
                        <button
                          className="btn-icon btn-success"
                          title="Edit"
                          onClick={() => handleShowEditModal(vendor.id)}
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                      )}
                      {ability.can("edit", "Business Partner") && (
                        <button
                          className="btn-icon btn-danger"
                          title="Delete"
                          onClick={() => {
                            setPartnerIdState(vendor.id);
                            setConfirmType("single");
                            handleShowConfirm("single");
                          }}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {!loading && filteredVendors.length > 0 && (
            <div className="pagination-container">
              <div className="pagination-info">
                Showing {indexOfFirstItem + 1}-
                {Math.min(indexOfLastItem, filteredVendors.length)} of{" "}
                {filteredVendors.length} entries
              </div>
              <div className="pagination">
                <button
                  className="btn-page"
                  onClick={goToPrevPage}
                  disabled={currentPage === 1}
                >
                  <i className="fas fa-chevron-left"></i>
                </button>

                {/* Modified page number logic */}
                {Array.from({ length: totalPages }, (_, i) => {
                  const pageNum = i + 1;
                  // Show first page
                  if (pageNum === 1)
                    return (
                      <button
                        key={pageNum}
                        className={`btn-page ${
                          currentPage === pageNum ? "active" : ""
                        }`}
                        onClick={() => paginate(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );

                  // Show dots after page 1 if there are many pages
                  if (pageNum === 2 && currentPage > 5)
                    return <span key="dots1">...</span>;

                  // Show current page and 2 pages before and after
                  if (
                    pageNum >= currentPage - 2 &&
                    pageNum <= currentPage + 2 &&
                    pageNum <= totalPages
                  )
                    return (
                      <button
                        key={pageNum}
                        className={`btn-page ${
                          currentPage === pageNum ? "active" : ""
                        }`}
                        onClick={() => paginate(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );

                  // Show dots before last page if there are many pages ahead
                  if (
                    pageNum === totalPages - 1 &&
                    currentPage < totalPages - 4
                  )
                    return <span key="dots2">...</span>;

                  // Show last page
                  if (pageNum === totalPages)
                    return (
                      <button
                        key={pageNum}
                        className={`btn-page ${
                          currentPage === pageNum ? "active" : ""
                        }`}
                        onClick={() => paginate(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );

                  return null;
                })}

                <button
                  className="btn-page"
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
              <div className="items-per-page">
                <select
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                  className="form-select"
                >
                  <option value="10">10 per page</option>
                  <option value="25">25 per page</option>
                  <option value="50">50 per page</option>
                  <option value="100">100 per page</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation dialog modal */}
      {isConfirmModal && (
        <div className="modal fade" id="vendorConfirmModal" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-circle-check me-2"></i>
                  Confirm
                </h5>
                <button
                  type="button"
                  className="btn"
                  onClick={handleCloseConfirmModal}
                  aria-label="Close"
                >
                  <i className="fas fa-times"></i>
                </button>
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

      {/* View Partner Details Modal */}
      {isShowPartnerDetails && (
        <div
          className="modal fade"
          ref={partnerModalRef}
          id="userDetailModal"
          tabIndex="-1"
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-circle-info me-2"></i>
                  Partner Details
                </h5>
                <button
                  type="button"
                  className="btn"
                  onClick={handleCloseViewModal}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="modal-body">
                <div className="user-details-grid">
                  <div className="detail-item">
                    <strong>Partner Code:</strong>
                    <span>{partnerDetails.code}</span>
                  </div>

                  <div className="detail-item">
                    <strong>Name:</strong>
                    <span>{partnerDetails.name}</span>
                  </div>

                  <div className="detail-item">
                    <strong>Type:</strong>
                    <span
                      className={`badge ${partnerDetails.type?.toLowerCase()} w-50`}
                    >
                      {partnerDetails.type?.charAt(0).toUpperCase() +
                        partnerDetails.type?.slice(1)}
                    </span>
                  </div>
                  <div className="detail-item">
                    <strong>Email:</strong>
                    <span>{partnerDetails.email}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Mobile:</strong>
                    <span>{partnerDetails.mobile}</span>
                  </div>
                  <div className="detail-item">
                    <strong>Status:</strong>
                    <span
                      className={`badge status ${partnerDetails.status?.toLowerCase()} w-50`}
                    >
                      {partnerDetails.status?.charAt(0).toUpperCase() +
                        partnerDetails.status?.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="addresses-section mt-4">
                  <h6 className="mb-3">Addresses</h6>
                  {partnerDetails.addresses?.map((addr, index) => (
                    <div
                      key={addr.id}
                      className="address-card p-3 mb-3 border rounded"
                    >
                      <h6 className="mb-2">Address {index + 1}</h6>
                      <div className="row">
                        <div className="col-md-6">
                          <p>
                            <strong>Address:</strong> {addr.address}
                          </p>
                          <p>
                            <strong>City:</strong> {addr.city}
                          </p>
                          <p>
                            <strong>State:</strong> {addr.state}
                          </p>
                        </div>
                        <div className="col-md-6">
                          <p>
                            <strong>Pincode:</strong> {addr.pincode}
                          </p>
                          <p>
                            <strong>Country:</strong> {addr.country}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-primary add-btn"
                  onClick={() => {
                    handleCloseViewModal();
                    handleShowEditModal(partnerDetails.id);
                  }}
                >
                  <i className="fa-solid fa-edit me-1"></i> Edit
                </button>
                <button
                  type="button"
                  className="btn btn-secondary add-btn"
                  onClick={handleCloseViewModal}
                >
                  <i className="fa-solid fa-xmark me-1"></i> Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Partner Details Modal */}
      {isEditPartnerDetails && (
        <div
          className="modal fade"
          ref={partnerEditModalRef}
          id="userEditModal"
          tabIndex="-1"
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fa-solid fa-pencil me-2 font-1"></i>
                  Edit Partner
                </h5>
                <button
                  type="button"
                  className="btn"
                  onClick={handleCloseEditModal}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              {/* Modal Body */}
              <div className="modal-body">
                <div className="table-form-container mx-2">
                  {/* Form Fields */}
                  <form
                    autoComplete="off"
                    className="padding-2"
                    onSubmit={handleEditPartner}
                  >
                    <div className="form-grid pt-0">
                      <div className="row form-style">
                        <div className="col-4 d-flex flex-column form-group">
                          <label htmlFor="type" className="form-label ms-2">
                            Type <span className="text-danger fs-6">*</span>
                          </label>
                          <div className="position-relative w-100">
                            <i className="fas fa-user-tag position-absolute z-0 input-icon"></i>
                            <select
                              className="form-control ps-5 ms-2 text-font"
                              id="type"
                              value={partnerDetails.type || ""}
                              onChange={(e) =>
                                setPartnerDetails({
                                  ...partnerDetails,
                                  type: e.target.value,
                                })
                              }
                            >
                              <option
                                value=""
                                disabled
                                hidden
                                className="text-muted"
                              >
                                Select Type
                              </option>
                              <option value="vendor">Vendor</option>
                              <option value="customer">Customer</option>
                            </select>
                            <i className="fa-solid fa-angle-down position-absolute down-arrow-icon"></i>
                          </div>
                          {errors.type && (
                            <span className="error-message ms-2">
                              {errors.type}
                            </span>
                          )}
                        </div>
                        <div className="col-4 d-flex flex-column form-group">
                          <label htmlFor="name" className="form-label ms-2">
                            Name <span className="text-danger fs-6">*</span>
                          </label>
                          <div className="position-relative w-100 ms-2">
                            <i className="fas fa-user position-absolute ps-2 z-0 input-icon"></i>
                            <input
                              type="text"
                              className="form-control ps-5 text-font"
                              id="name"
                              placeholder="Enter full name"
                              value={partnerDetails.name || ""}
                              onChange={(e) =>
                                setPartnerDetails({
                                  ...partnerDetails,
                                  name: e.target.value,
                                })
                              }
                            />
                          </div>
                          {errors.name && (
                            <span className="error-message ms-2">
                              {errors.name}
                            </span>
                          )}
                        </div>
                        <div className="col-4 d-flex flex-column form-group">
                          <label htmlFor="mobile" className="form-label ms-2">
                            Mobile <span className="text-danger fs-6">*</span>
                          </label>
                          <div className="position-relative w-100">
                            <i className="fas fa-phone position-absolute ps-2 z-0 input-icon"></i>
                            <input
                              type="tel"
                              className="form-control ps-5 ms-2 text-font"
                              id="mobile"
                              placeholder="Enter mobile number"
                              value={partnerDetails.mobile || ""}
                              onChange={(e) =>
                                setPartnerDetails({
                                  ...partnerDetails,
                                  mobile: e.target.value,
                                })
                              }
                            />
                          </div>
                          {errors.mobile && (
                            <span className="error-message ms-2">
                              {errors.mobile}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="row form-style">
                        <div className="col-4 d-flex flex-column form-group">
                          <label htmlFor="email" className="form-label ms-2">
                            Email <span className="text-danger fs-6">*</span>
                          </label>
                          <div className="position-relative w-100">
                            <i className="fa-solid fa-envelope ps-2 position-absolute z-0 input-icon"></i>
                            <input
                              type="email"
                              className="form-control ps-5 ms-2 text-font"
                              id="email"
                              placeholder="Enter email address"
                              value={partnerDetails.email || ""}
                              onChange={(e) =>
                                setPartnerDetails({
                                  ...partnerDetails,
                                  email: e.target.value,
                                })
                              }
                            />
                          </div>
                          {errors.email && (
                            <span className="error-message ms-2">
                              {errors.email}
                            </span>
                          )}
                        </div>
                        <div className="col-4 d-flex flex-column form-group">
                          <label htmlFor="city" className="form-label ms-2">
                            City <span className="text-danger fs-6">*</span>
                          </label>
                          <div className="position-relative w-100">
                            <i className="fas fa-city position-absolute ps-2 z-0 input-icon"></i>
                            <input
                              type="text"
                              className="form-control ps-5 ms-2 text-font"
                              id="city"
                              placeholder="Enter city"
                              value={partnerDetails.city || ""}
                              onChange={(e) =>
                                setPartnerDetails({
                                  ...partnerDetails,
                                  city: e.target.value,
                                })
                              }
                            />
                          </div>
                          {errors.city && (
                            <span className="error-message ms-2">
                              {errors.city}
                            </span>
                          )}
                        </div>
                        <div className="col-4 d-flex flex-column form-group">
                          <label htmlFor="state" className="form-label ms-2">
                            State <span className="text-danger fs-6">*</span>
                          </label>
                          <div className="position-relative w-100">
                            <i className="fa-solid fa-location-crosshairs ps-2 position-absolute z-0 input-icon"></i>
                            <input
                              type="text"
                              className="form-control ps-5 ms-2 text-font"
                              id="state"
                              placeholder="Enter state"
                              value={partnerDetails.state || ""}
                              onChange={(e) =>
                                setPartnerDetails({
                                  ...partnerDetails,
                                  state: e.target.value,
                                })
                              }
                            />
                          </div>
                          {errors.state && (
                            <span className="error-message ms-2">
                              {errors.state}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="row form-style">
                        <div className="col-4 d-flex flex-column form-group">
                          <label htmlFor="pincode" className="form-label ms-2">
                            Pincode <span className="text-danger fs-6">*</span>
                          </label>
                          <div className="position-relative w-100">
                            <i className="fa-solid fa-map-pin ps-2 position-absolute z-0 input-icon"></i>
                            <input
                              type="text"
                              className="form-control ps-5 ms-2 text-font"
                              id="pincode"
                              maxLength={6}
                              placeholder="Enter pincode"
                              value={partnerDetails.pincode || ""}
                              onChange={(e) =>
                                setPartnerDetails({
                                  ...partnerDetails,
                                  pincode: e.target.value,
                                })
                              }
                            />
                          </div>
                          {errors.pincode && (
                            <span className="error-message ms-2">
                              {errors.pincode}
                            </span>
                          )}
                        </div>
                        <div className="col-4 d-flex flex-column form-group">
                          <label htmlFor="address" className="form-label ms-2">
                            Address <span className="text-danger fs-6">*</span>
                          </label>
                          <div className="position-relative w-100">
                            <i className="fas fa-map-marker-alt ps-2 position-absolute z-0 input-icon"></i>
                            <textarea
                              className="form-control pt-3 ps-5 ms-2 text-font"
                              id="address"
                              placeholder="Enter complete address"
                              value={partnerDetails.address || ""}
                              onChange={(e) =>
                                setPartnerDetails({
                                  ...partnerDetails,
                                  address: e.target.value,
                                })
                              }
                            ></textarea>
                          </div>
                          {errors.address && (
                            <span className="error-message ms-2">
                              {errors.address}
                            </span>
                          )}
                        </div>
                        <div className="col-4 d-flex flex-column form-group">
                          <label htmlFor="status" className="form-label ms-2">
                            Status
                          </label>
                          <div className="position-relative w-100 ms-2">
                            <div className="form-check form-switch position-absolute z-0 input-icon mt-1 padding-left-2">
                              <input
                                className="form-check-input text-font switch-style"
                                type="checkbox"
                                role="switch"
                                id="switchCheckChecked"
                                checked={partnerDetails.status === "active"}
                                onChange={(e) => {
                                  const newStatus = e.target.checked
                                    ? "active"
                                    : "inactive";
                                  setPartnerDetails({
                                    ...partnerDetails,
                                    status: newStatus,
                                  });
                                }}
                              />
                            </div>
                            <select
                              className="form-control text-font switch-padding"
                              id="status"
                              value={partnerDetails.status || "active"}
                              onChange={(e) => {
                                const newStatus = e.target.value;
                                setPartnerDetails({
                                  ...partnerDetails,
                                  status: newStatus,
                                });
                              }}
                            >
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                            </select>
                            <i className="fa-solid fa-angle-down position-absolute down-arrow-icon"></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="submit"
                  className="btn btn-primary add-btn"
                  onClick={handleEditPartner}
                >
                  <i className="fa-solid fa-floppy-disk me-1"></i> Save Changes
                </button>
                <button
                  type="button"
                  className="btn btn-secondary add-btn"
                  onClick={handleCloseEditModal}
                >
                  <i className="fa-solid fa-xmark me-1"></i> Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorMaster;
