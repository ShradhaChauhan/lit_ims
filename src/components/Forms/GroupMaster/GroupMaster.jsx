import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../../../context/AppContext";
import api from "../../../services/api";

const GroupMaster = () => {
  const { isAddGroup, setIsAddGroup } = useContext(AppContext);

  const [selectedGroups, setSelectedGroups] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [status, setStatus] = useState("active");
  const [isChecked, setIsChecked] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    status: "active",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Data loading state
  const [groups, setGroups] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState(null);
  
  // Pagination state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalItems: 0,
    itemsPerPage: 10,
    totalPages: 1,
  });
  
  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Load groups data
  const loadGroups = async () => {
    setDataLoading(true);
    setDataError(null);
    
    try {
      const response = await api.get("/api/group/all", {
        params: {
          page: pagination.currentPage,
          limit: pagination.itemsPerPage,
          search: searchTerm,
          status: statusFilter,
        },
      });
      
      // Updated to handle the new API response structure
      const groupsData = response.data.data || [];
      setGroups(groupsData);
      
      // Update pagination based on the available data
      setPagination(prev => ({
        ...prev,
        totalItems: groupsData.length,
        totalPages: Math.ceil(groupsData.length / prev.itemsPerPage),
      }));
    } catch (err) {
      console.error("Error loading groups:", err);
      setDataError(err.response?.data?.message || "Error loading groups");
      setGroups([]);
    } finally {
      setDataLoading(false);
    }
  };

  // Load data on component mount and when pagination, search or filter changes
  useEffect(() => {
    loadGroups();
  }, [pagination.currentPage, pagination.itemsPerPage, searchTerm, statusFilter]);

  const handleGroupCheckboxChange = (groupId) => {
    setSelectedGroups((prevSelected) =>
      prevSelected.includes(groupId)
        ? prevSelected.filter((id) => id !== groupId)
        : [...prevSelected, groupId]
    );
  };

  const handleSelectAllChange = (e) => {
    const checked = e.target.checked;
    setSelectAll(checked);
    if (checked) {
      const allGroupIds = groups.map((group) => group.id);
      setSelectedGroups(allGroupIds);
    } else {
      setSelectedGroups([]);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedGroups.length === 0) {
      return;
    }
    
    if (!window.confirm(`Are you sure you want to delete ${selectedGroups.length} selected group(s)?`)) {
      return;
    }
    
    setDeleteLoading(true);
    setDataError(null);
    
    try {
      // Delete groups one by one
      for (const groupId of selectedGroups) {
        await api.delete(`/api/group/delete/${groupId}`);
      }
      
      // Clear selection and reload data
      setSelectedGroups([]);
      setSelectAll(false);
      loadGroups();
    } catch (err) {
      console.error("Error deleting groups:", err);
      setDataError(err.response?.data?.message || "Error deleting groups");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteSingle = async (groupId) => {
    if (!window.confirm("Are you sure you want to delete this group?")) {
      return;
    }
    
    setDataLoading(true);
    setDataError(null);
    
    try {
      await api.delete(`/api/group/delete/${groupId}`);
      
      // If the deleted group was selected, remove it from selection
      if (selectedGroups.includes(groupId)) {
        setSelectedGroups(prev => prev.filter(id => id !== groupId));
      }
      
      // Reload data
      loadGroups();
    } catch (err) {
      console.error("Error deleting group:", err);
      setDataError(err.response?.data?.message || "Error deleting group");
    } finally {
      setDataLoading(false);
    }
  };

  const handleAddGroups = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const finalData = {
      name: formData.name,
      status: formData.status,
    };

    try {
      const response = await api.post("/api/group/save", finalData);
      console.log("Group added successfully:", response.data);
      setFormData({
        name: "",
        status: "active",
      });
      setIsChecked(true);
      setIsAddGroup(false);
      // Reload the groups data after adding a new group
      loadGroups();
    } catch (err) {
      console.error("Error adding group:", err);
      setError(err.response?.data?.message || "Error adding group");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = (e) => {
    e.preventDefault();
    setFormData({
      name: "",
      status: "active",
    });
    setIsChecked(true);
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination({...pagination, currentPage: newPage});
    }
  };

  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = parseInt(e.target.value);
    setPagination({
      ...pagination,
      itemsPerPage: newItemsPerPage,
      currentPage: 1, // Reset to first page when changing items per page
    });
  };

  // Handle search and filter
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPagination({...pagination, currentPage: 1}); // Reset to first page when searching
  };

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value);
    setPagination({...pagination, currentPage: 1}); // Reset to first page when filtering
  };

  return (
    <div>
      {/* Search and Filter Section */}
      <div className="search-filter-container">
        <div className="search-box">
          <i className="fas fa-search position-absolute input-icon"></i>
          <input
            type="text"
            className="form-control vendor-search-bar"
            placeholder="Search by groups..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        <div className="filter-options">
          <select 
            className="filter-select"
            value={statusFilter}
            onChange={handleStatusFilter}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Form Header Section */}
      {isAddGroup && (
        <div className="table-form-container">
          <div className="form-header">
            <h2>
              <i className="fas fa-user-plus"></i> Add New Group
            </h2>
            <button
              className="btn-close"
              onClick={() => setIsAddGroup(false)}
            ></button>
          </div>

          {/* Form Fields */}
          <form
            autoComplete="off"
            className="padding-2"
            onSubmit={handleAddGroups}
          >
            <div className="form-grid border-bottom pt-0">
              <div className="row form-style">
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="trNo" className="form-label  ms-2">
                    TRNO
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-user position-absolute input-icon"></i>
                    <input
                      type="text"
                      className="form-control ps-5 text-font input-centered"
                      id="trNo"
                      placeholder="*******************"
                      disabled
                    />
                  </div>
                </div>
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="name" className="form-label  ms-2">
                    Name
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-user position-absolute input-icon"></i>
                    <input
                      type="text"
                      className="form-control ps-5 text-font"
                      id="name"
                      placeholder="Enter group name"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
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
            </div>
            <div className="form-actions">
              {error && (
                <div className="alert alert-danger mb-3" role="alert">
                  {error}
                </div>
              )}
              <button
                type="submit"
                className="btn btn-primary border border-0 add-btn me-3 float-end"
                disabled={loading}
              >
                {loading ? (
                  <span>
                    <i className="fa-solid fa-spinner fa-spin me-1"></i> Saving...
                  </span>
                ) : (
                  <span>
                    <i className="fa-solid fa-floppy-disk me-1"></i> Save Changes
                  </span>
                )}
              </button>
              <button
                className="btn btn-secondary border border-0 add-btn bg-secondary me-3 float-end"
                onClick={handleReset}
                type="button"
                disabled={loading}
              >
                <i className="fa-solid fa-arrows-rotate me-1"></i> Reset
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table Section */}
      <div className="margin-2">
        <div className="table-container">
          <div className="table-header">
            <div className="selected-count">
              <input
                type="checkbox"
                id="select-all"
                checked={selectAll}
                onChange={handleSelectAllChange}
              />
              <label htmlFor="select-all">
                {selectedGroups.length} Selected
              </label>
            </div>
            <button 
              className="btn-action btn-danger"
              onClick={handleDeleteSelected}
              disabled={deleteLoading || selectedGroups.length === 0}
            >
              {deleteLoading ? (
                <span>
                  <i className="fa-solid fa-spinner fa-spin me-1"></i> Deleting...
                </span>
              ) : (
                <span>
                  <i className="fas fa-trash"></i> Delete Selected
                </span>
              )}
            </button>
          </div>
          {dataError && (
            <div className="alert alert-danger" role="alert">
              {dataError}
            </div>
          )}
          <table>
            <thead>
              <tr>
                <th className="checkbox-cell">
                  <input 
                    type="checkbox" 
                    checked={selectAll}
                    onChange={handleSelectAllChange}
                  />
                </th>
                <th>
                  TRNO <i className="fas fa-sort color-gray ms-2"></i>
                </th>
                <th>
                  Name <i className="fas fa-sort color-gray ms-2"></i>
                </th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {dataLoading ? (
                <tr>
                  <td colSpan="5" className="text-center py-3">
                    <i className="fa-solid fa-spinner fa-spin me-2"></i> Loading...
                  </td>
                </tr>
              ) : groups.length === 0 ? (
                <tr className="no-data-row">
                  <td colSpan="5" className="no-data-cell">
                    <div className="no-data-content">
                      <i className="fas fa-layer-group no-data-icon"></i>
                      <p className="no-data-text">No groups found</p>
                      <p className="no-data-subtext">
                        Click the "Add New Group" button to create your first
                        group
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                groups.map((group) => (
                  <tr key={group.id}>
                    <td className="checkbox-cell">
                      <input
                        type="checkbox"
                        checked={selectedGroups.includes(group.id)}
                        onChange={() => handleGroupCheckboxChange(group.id)}
                      />
                    </td>
                    <td>
                      <div>
                        <span>{group.trno}</span>
                      </div>
                    </td>
                    <td>
                      <div>
                        <span>{group.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${group.status}`}>
                        {group.status}
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
                      <button 
                        className="btn-icon btn-danger" 
                        title="Delete"
                        onClick={() => handleDeleteSingle(group.id)}
                      >
                        <i className="fas fa-trash"></i>
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
              Showing {groups.length > 0 ? (pagination.currentPage - 1) * pagination.itemsPerPage + 1 : 0}-
              {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems} entries
            </div>
            <div className="pagination">
              <button 
                className="btn-page" 
                disabled={pagination.currentPage === 1}
                onClick={() => handlePageChange(pagination.currentPage - 1)}
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              {[...Array(pagination.totalPages).keys()].map(page => (
                <button 
                  key={page + 1}
                  className={`btn-page ${pagination.currentPage === page + 1 ? 'active' : ''}`}
                  onClick={() => handlePageChange(page + 1)}
                >
                  {page + 1}
                </button>
              ))}
              <button 
                className="btn-page" 
                disabled={pagination.currentPage === pagination.totalPages}
                onClick={() => handlePageChange(pagination.currentPage + 1)}
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
            <div className="items-per-page">
              <select value={pagination.itemsPerPage} onChange={handleItemsPerPageChange}>
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

export default GroupMaster;
