import React, { useContext, useState, useEffect } from "react";
import { AppContext } from "../../../context/AppContext";
import api from "../../../services/api";

const PartMaster = () => {
  const { isAddPart, setIsAddPart } = useContext(AppContext);

  const [selectedParts, setSelectedParts] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [status, setStatus] = useState("active");
  const [isChecked, setIsChecked] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    uom: "",
    status: "active",
  });
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchParts();
  }, []);

  const fetchParts = () => {
    setLoading(true);
    setError(null);
    api.get("/api/part/all")
      .then(response => {
        console.log("Parts loaded:", response.data);
        setParts(response.data.data || []);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error loading parts:", error);
        setError("Failed to load parts. Please try again.");
        setLoading(false);
      });
  };

  const handlePartCheckboxChange = (partId) => {
    setSelectedParts((prevSelected) =>
      prevSelected.includes(partId)
        ? prevSelected.filter((id) => id !== partId)
        : [...prevSelected, partId]
    );
  };

  const handleSelectAllChange = (e) => {
    const checked = e.target.checked;
    setSelectAll(checked);
    if (checked) {
      const allPartIds = parts.map((part) => part.id);
      setSelectedParts(allPartIds);
    } else {
      setSelectedParts([]);
    }
  };

  const handleAddParts = (e) => {
    e.preventDefault();
    const finalData = {
      name: formData.name,
      code: formData.code,
      uom: formData.uom,
      status: formData.status,
    };

    console.log("Submitting add part form");
    api.post("/api/part/save", finalData)
      .then(response => {
        console.log("Part added successfully:", response.data);
        setIsAddPart(false);
        // Reset form after successful submission
        handleReset(e);
        // Refresh parts list
        fetchParts();
      })
      .catch(error => {
        console.error("Error adding part:", error);
      });
  };

  const handleReset = (e) => {
    e.preventDefault();
    setFormData({
      name: "",
      code: "",
      uom: "",
      status: "active",
    });
    setIsChecked(true);
  };

  const handleDeletePart = (partId) => {
    if (window.confirm("Are you sure you want to delete this part?")) {
      setLoading(true);
      api.delete(`/api/part/delete/${partId}`)
        .then(response => {
          console.log("Part deleted successfully:", response.data);
          // Refresh parts list after deletion
          fetchParts();
        })
        .catch(error => {
          console.error("Error deleting part:", error);
          setError("Failed to delete part. Please try again.");
          setLoading(false);
        });
    }
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
            placeholder="Search by types..."
          />
        </div>
        <div className="filter-options">
          <select className="filter-select">
            <option value="">All UOM</option>
            <option value="pcs">Pieces (PCS)</option>
            <option value="kg">Kilogram (KG)</option>
            <option value="gm">Gram (GM)</option>
            <option value="ltr">Litre (LTR)</option>
            <option value="mtr">Meter (MTR)</option>
            <option value="box">Box (BOX)</option>
          </select>
          <select className="filter-select">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Form Header Section */}
      {isAddPart && (
        <div className="table-form-container">
          <div className="form-header">
            <h2>
              <i className="fas fa-cogs"></i> Add New Part
            </h2>
            <button
              className="btn-close"
              onClick={() => setIsAddPart(false)}
            ></button>
          </div>

          {/* Form Fields */}
          <form
            autoComplete="off"
            className="padding-2"
            onSubmit={handleAddParts}
          >
            <div className="form-grid border-bottom pt-0">
              <div className="row form-style">
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="name" className="form-label">
                    Name
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-font position-absolute input-icon"></i>
                    <input
                      type="text"
                      className="form-control ps-5 text-font"
                      id="name"
                      placeholder="Enter part name"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="code" className="form-label">
                    Code
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-qrcode position-absolute input-icon"></i>
                    <input
                      type="text"
                      className="form-control ps-5 text-font"
                      id="code"
                      placeholder="Enter part code"
                      required
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({ ...formData, code: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="uom" className="form-label">
                    UOM
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-ruler position-absolute input-icon"></i>
                    <select
                      className="form-control ps-5 text-font"
                      id="uom"
                      required
                      value={formData.uom}
                      onChange={(e) =>
                        setFormData({ ...formData, uom: e.target.value })
                      }
                    >
                      <option value="" disabled hidden className="text-muted">
                        Select UOM
                      </option>
                      <option value="pcs">Pieces (PCS)</option>
                      <option value="kg">Kilogram (KG)</option>
                      <option value="gm">Gram (GM)</option>
                      <option value="ltr">Litre (LTR)</option>
                      <option value="mtr">Meter (MTR)</option>
                      <option value="box">Box (BOX)</option>
                    </select>
                    <i className="fa-solid fa-angle-down position-absolute down-arrow-icon"></i>
                  </div>
                </div>
              </div>
              <div className="row form-style">
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
                className="btn btn-primary border border-0 add-btn me-3 float-end"
                onClick={handleAddParts}
              >
                <i className="fa-solid fa-floppy-disk me-1"></i> Save Changes
              </button>
              <button
                className="btn btn-secondary border border-0 add-btn bg-secondary me-3 float-end"
                onClick={handleReset}
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
                {selectedParts.length} Selected
              </label>
            </div>
          </div>
          {loading ? (
            <div className="text-center p-3">
              <i className="fas fa-spinner fa-spin me-2"></i> Loading parts...
            </div>
          ) : error ? (
            <div className="alert alert-danger">{error}</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th className="checkbox-cell">
                    <input 
                      type="checkbox" 
                      id="select-all-header"
                      checked={selectAll}
                      onChange={handleSelectAllChange}
                    />
                  </th>
                  <th>
                    Code <i className="fas fa-sort color-gray ms-2"></i>
                  </th>
                  <th>
                    Name <i className="fas fa-sort color-gray ms-2"></i>
                  </th>
                  <th>
                    UOM <i className="fas fa-sort color-gray ms-2"></i>
                  </th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {parts.length === 0 ? (
                  <tr className="no-data-row">
                    <td colSpan="6" className="no-data-cell">
                      <div className="no-data-content">
                        <i className="fas fa-cogs no-data-icon"></i>
                        <p className="no-data-text">No parts found</p>
                        <p className="no-data-subtext">
                          Click the "Add New Part" button to create your first
                          part
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  parts.map((part) => (
                    <tr key={part.id}>
                      <td className="checkbox-cell">
                        <input
                          type="checkbox"
                          checked={selectedParts.includes(part.id)}
                          onChange={() => handlePartCheckboxChange(part.id)}
                        />
                      </td>
                      <td>
                        <div>
                          <span>{part.code}</span>
                        </div>
                      </td>
                      <td>
                        <div>
                          <span>{part.name}</span>
                        </div>
                      </td>
                      <td>
                        <div>
                          <span>{part.uom}</span>
                        </div>
                      </td>
                      <td>
                        <div>
                          <span className={`status-badge ${part.status}`}>
                            {part.status === "active" ? "Active" : "Inactive"}
                          </span>
                        </div>
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
                          onClick={() => handleDeletePart(part.id)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          <div className="pagination-container">
            <div className="pagination-info">
              {parts.length > 0 ? `Showing 1-${parts.length} of ${parts.length} entries` : "No entries"}
            </div>
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

export default PartMaster;
