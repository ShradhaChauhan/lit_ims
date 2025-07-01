import React, { useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "../../../context/AppContext";
import { Link } from "react-router-dom";
import { Modal } from "bootstrap";

const GroupMaster = () => {
  const { isAddGroup, setIsAddGroup } = useContext(AppContext);
  const groupModalRef = useRef(null);
  const groupEditModalRef = useRef(null);
  const [isShowGroupDetails, setIsShowGroupDetails] = useState(false);
  const [isEditGroupDetails, setIsEditGroupDetails] = useState(false);
  const [groupDetails, setGroupDetails] = useState({
    id: "",
    trNo: "",
    name: "",
    status: "",
  });
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [status, setStatus] = useState("active");
  const [isChecked, setIsChecked] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    status: "active",
  });
  const groups = [
    {
      id: 1,
      trNo: "*****",
      name: "Lisa",
      status: "Active",
    },
  ];

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

  const handleAddGroups = (e) => {
    e.preventDefault();
    const finalData = {
      name: formData.name,
      status: formData.status,
    };

    console.log("Submitting add group form");
    fetch("", {
      method: "POST",
      body: finalData,
    }).then(function (response) {
      console.log(response);
      return response.json();
    });
    console.log("Form submitted. ", finalData);
  };

  const handleEditGroup = (e) => {
    e.preventDefault();
    console.log("Group has been edited");
  };

  const handleViewDetails = (group, e) => {
    e.preventDefault();
    console.log(group);
    setGroupDetails(group);
    setIsShowGroupDetails(true);
  };

  const handleEditDetails = (group, e) => {
    e.preventDefault();
    console.log(group);
    setGroupDetails(group);
    setIsEditGroupDetails(true);
  };

  useEffect(() => {
    if (isShowGroupDetails && groupModalRef.current) {
      const bsModal = new Modal(groupModalRef.current, {
        backdrop: "static",
      });
      bsModal.show();

      // Optional: hide modal state when it's closed
      groupModalRef.current.addEventListener("hidden.bs.modal", () =>
        setIsShowGroupDetails(false)
      );
    } else if (isEditGroupDetails && groupEditModalRef.current) {
      const bsModal = new Modal(groupEditModalRef.current, {
        backdrop: "static",
      });
      bsModal.show();

      // Hide modal state when it's closed
      groupEditModalRef.current.addEventListener("hidden.bs.modal", () =>
        setIsEditGroupDetails(false)
      );
    }
  }, [isShowGroupDetails, isEditGroupDetails]);

  const handleReset = (e) => {
    e.preventDefault();
    setFormData({
      name: "",
      status: "active",
    });
    setStatus("active");
    setIsChecked(true);
  };

  const handleSetIsAddGroup = () => {
    setIsAddGroup(true);
  };

  return (
    <div>
      {/* Header section */}
      <nav className="navbar bg-light border-body" data-bs-theme="light">
        <div className="container-fluid">
          <div className="mt-4">
            <h3 className="nav-header header-style">Group Master</h3>
            <p className="breadcrumb">
              <Link to="/dashboard">
                <i className="fas fa-home text-8"></i>
              </Link>{" "}
              <span className="ms-1 mt-1 text-small-gray">
                / Masters / Group Master
              </span>
            </p>
          </div>

          {/* Add Group Button */}

          <button
            className="btn btn-primary add-btn"
            onClick={handleSetIsAddGroup}
          >
            <i className="fa-solid fa-user-plus"></i> Add New Group
          </button>
        </div>
      </nav>

      {/* Search and Filter Section */}
      <div className="search-filter-container mx-2">
        <div className="search-box">
          <i className="fas fa-search position-absolute input-icon"></i>
          <input
            type="text"
            className="form-control vendor-search-bar"
            placeholder="Search by groups..."
          />
        </div>
        <div className="filter-options">
          <select className="filter-select">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Form Header Section */}
      {isAddGroup && (
        <div className="table-form-container mx-2">
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
                  <label htmlFor="trNo" className="form-label">
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
                  <label htmlFor="name" className="form-label">
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
              <button
                className="btn btn-primary border border-0 text-8 px-3 fw-medium py-2 me-3 float-end"
                onClick={handleAddGroups}
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
            <button className="btn-action btn-danger">
              <i className="fas fa-trash"></i>
              Delete Selected
            </button>
          </div>
          <table>
            <thead>
              <tr>
                <th className="checkbox-cell">
                  <input type="checkbox" id="select-all" />
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
              {groups.length === 0 ? (
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
                    <td className="checkbox-cell ps-4">
                      <input
                        type="checkbox"
                        checked={selectedGroups.includes(group.id)}
                        onChange={() => handleGroupCheckboxChange(group.id)}
                      />
                    </td>
                    <td className="ps-4">
                      <div>
                        <span>{group.trNo}</span>
                      </div>
                    </td>
                    <td className="ps-4">
                      <div>
                        <span>{group.name}</span>
                      </div>
                    </td>
                    <td className="ps-4">
                      <span
                        className={`badge status ${group.status.toLowerCase()}`}
                      >
                        {group.status}
                      </span>
                    </td>
                    <td className="actions">
                      <button
                        className="btn-icon btn-primary"
                        title="View Details"
                        onClick={(e) => handleViewDetails(group, e)}
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      <button
                        className="btn-icon btn-success"
                        title="Edit"
                        onClick={(e) => handleEditDetails(group, e)}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button className="btn-icon btn-danger" title="Delete">
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

      {/* View Group Details Modal */}
      {isShowGroupDetails && (
        <div
          className="modal fade"
          ref={groupModalRef}
          id="groupDetailModal"
          tabIndex="-1"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  View {groupDetails.name}'s Details
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
                  <strong>TRNO:</strong> {groupDetails.trNo}
                </p>
                <p>
                  <strong>Name:</strong> {groupDetails.name}
                </p>
                <p>
                  <strong>Status:</strong> {groupDetails.status}
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

      {/* Edit Group Details Modal */}
      {isEditGroupDetails && (
        <div
          className="modal fade"
          ref={groupEditModalRef}
          id="groupEditModal"
          tabIndex="-1"
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Group</h5>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                ></button>
              </div>
              {/* Modal Body */}
              <div className="modal-body">
                <form
                  autoComplete="off"
                  className="padding-2"
                  onSubmit={handleEditGroup}
                >
                  <div className="form-grid pt-0">
                    <div className="row form-style">
                      <div className="col-4 d-flex flex-column form-group">
                        <label htmlFor="trNo" className="form-label">
                          TRNO
                        </label>
                        <div className="position-relative w-100">
                          <i className="fas fa-user position-absolute input-icon"></i>
                          <input
                            type="text"
                            className="form-control ps-5 text-font input-centered"
                            id="trNo"
                            value={groupDetails.trNo}
                            disabled
                          />
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
                            className="form-control ps-5 text-font"
                            id="name"
                            placeholder="Enter group name"
                            required
                            value={groupDetails.name}
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
                              checked={groupDetails == "active" ? true : false}
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
                            value={groupDetails.status}
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
                </form>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-primary border border-0 text-8 px-3 fw-medium py-2 me-3 float-end"
                  data-bs-dismiss="modal"
                  onClick={(e) => {
                    document.activeElement?.blur();
                    handleEditGroup(e);
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

export default GroupMaster;
