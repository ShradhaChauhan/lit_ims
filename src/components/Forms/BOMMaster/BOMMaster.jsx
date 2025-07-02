import React, { useContext, useEffect, useRef, useState } from "react";
import { AppContext } from "../../../context/AppContext";
import api from "../../../services/api";
import { Link } from "react-router-dom";
import { Modal } from "bootstrap";

const BOMMaster = () => {
  const [errors, setErrors] = useState({});
  const { isAddBom, setIsAddBom } = useContext(AppContext);
  const bomModalRef = useRef(null);
  const bomEditModalRef = useRef(null);
  const [isShowBomDetails, setIsShowBomDetails] = useState(false);
  const [isEditBomDetails, setIsEditBomDetails] = useState(false);
  const [bomDetails, setBomDetails] = useState({
    id: "",
    code: "",
    name: "",
    itemsCount: "",
    totalQuantity: "",
    totalValue: "",
    status: "",
  });
  const [selectedBoms, setSelectedBoms] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isReset, setIsReset] = useState(false);
  const idRef = useRef(2);
  const [status, setStatus] = useState("active");
  const [isChecked, setIsChecked] = useState(true);
  const [warehouses, setWarehouses] = useState([]);
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    status: "active",
    items: [],
  });
  const [isAddBomPart, setIsAddBomPart] = useState([{ id: 1 }]);
  
  // Initialize formData.items with one empty item when component mounts
  useEffect(() => {
    if (formData.items.length === 0) {
      setFormData(prev => ({
        ...prev,
        items: isAddBomPart.map(part => ({
          id: part.id,
          item: "",
          code: "",
          uom: "",
          quantity: "",
          warehouse: ""
        }))
      }));
    }
  }, []);

  const boms = [];

  useEffect(() => {
    // Fetch warehouses from API using axios
    api.get("/api/warehouses")
      .then(response => {
        if (response.data.status && response.data.data) {
          setWarehouses(response.data.data);
        } else {
          setWarehouses(response.data.warehouses || []);
        }
      })
      .catch(error => {
        console.error("Error fetching warehouses:", error);
      });

    // Fetch items from API
    api.get("/api/items/all")
      .then(response => {
        if (response.data.status && response.data.data) {
          setItems(response.data.data);
        } else {
          setItems(response.data.items || []);
        }
      })
      .catch(error => {
        console.error("Error fetching items:", error);
      });
  }, []);

  const handleBomCheckboxChange = (bomId) => {
    setSelectedBoms((prevSelected) =>
      prevSelected.includes(bomId)
        ? prevSelected.filter((id) => id !== bomId)
        : [...prevSelected, bomId]
    );
  };

  const handleSelectAllChange = (e) => {
    const checked = e.target.checked;
    setSelectAll(checked);
    if (checked) {
      const allBomIds = boms.map((bom) => bom.id);
      setSelectedBoms(allBomIds);
    } else {
      setSelectedBoms([]);
    }
  };

  const handleDeleteItem = (itemId) => {
    // Remove the item from isAddBomPart
    setIsAddBomPart(prevParts => prevParts.filter(part => part.id !== itemId));
    
    // Remove the item from formData.items
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  };

  const handleAddBoms = (e) => {
    e.preventDefault();
    const newErrors = validateForm(formData);
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const finalData = {
        name: formData.name,
        code: formData.code,
        status: formData.status,
        items: formData.items.map(item => {
          const selectedItem = items.find(i => i.id === parseInt(item.item)) || {};
          const selectedWarehouse = warehouses.find(w => w.id === parseInt(item.warehouse)) || {};
          
          return {
            itemId: parseInt(item.item) || 0,
            itemName: selectedItem.name || "",
            itemCode: item.code || "",
            uom: item.uom || "",
            quantity: parseFloat(item.quantity) || 0,
            warehouseId: parseInt(item.warehouse) || 0,
            warehouseName: selectedWarehouse.name || ""
          };
        })
      };

      console.log("Submitting add bom form");
      api.post("/api/bom/add", finalData)
        .then(response => {
          console.log(response.data);
          // Reset form after successful submission
          setFormData({
            name: "",
            code: "",
            status: "active",
            items: [
              {
                id: 1,
                item: "",
                code: "",
                uom: "",
                quantity: "",
                warehouse: ""
              }
            ]
          });
          setIsAddBomPart([{ id: 1 }]);
          idRef.current = 2;
          setIsChecked(true);
          setStatus("active");
          setIsAddBom(false); // Close the form after successful submission
        })
        .catch(error => {
          console.error("Error adding BOM:", error);
        });
      console.log("Form submitted.", finalData);
    }
  };
     

  const validateForm = (data) => {
    const errors = {};

    if (!data.name.trim()) {
      errors.name = "BOM name is required";
    }

    if (!data.code) {
      errors.code = "Code is required";
    } else if (!/^\d+$/.test(data.code)) {
      errors.code = "Code must only be in digits";
    }

    return errors;
  };

  const handleEditBom = (e) => {
    e.preventDefault();
    console.log("BOM has been edited");
  };

  const handleViewDetails = (bom, e) => {
    e.preventDefault();
    console.log(bom);
    setBomDetails(bom);
    setIsShowBomDetails(true);
  };

  const handleEditDetails = (bom, e) => {
    e.preventDefault();
    console.log(bom);
    setBomDetails(bom);
    setIsEditBomDetails(true);
  };

  useEffect(() => {
    if (isShowBomDetails && bomModalRef.current) {
      const bsModal = new Modal(bomModalRef.current, {
        backdrop: "static",
      });
      bsModal.show();

      // Optional: hide modal state when it's closed
      bomModalRef.current.addEventListener("hidden.bs.modal", () =>
        setIsShowBomDetails(false)
      );
    } else if (isEditBomDetails && bomEditModalRef.current) {
      const bsModal = new Modal(bomEditModalRef.current, {
        backdrop: "static",
      });
      bsModal.show();

      // Hide modal state when it's closed
      bomEditModalRef.current.addEventListener("hidden.bs.modal", () =>
        setIsEditBomDetails(false)
      );
    }
  }, [isShowBomDetails, isEditBomDetails]);

  const handleReset = (e) => {
    e.preventDefault();
    setFormData({
      name: "",
      code: "",
      status: "active",
      items: isAddBomPart.map(part => ({
        id: part.id,
        item: "",
        code: "",
        uom: "",
        quantity: "",
        warehouse: ""
      }))
    });
    setIsChecked(true);
    setStatus("active");
  };
  const handleSetIsAddBOM = () => {
    setIsAddBom(true);
  };

  return (
    <div>
      {/* Header section */}
      <nav className="navbar bg-light border-body" data-bs-theme="light">
        <div className="container-fluid">
          <div className="mt-4">
            <h3 className="nav-header header-style">BOM Master</h3>
            <p className="breadcrumb">
              <Link to="/dashboard">
                <i className="fas fa-home text-8"></i>
              </Link>{" "}
              <span className="ms-1 mt-1 text-small-gray">
                / Masters / BOM Master
              </span>
            </p>
          </div>
          {/* Add BOM Button */}

          <button
            className="btn btn-primary add-btn"
            onClick={handleSetIsAddBOM}
          >
            <i className="fa-solid fa-plus pe-1"></i> Add New BOM
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
            placeholder="Search by types..."
          />
        </div>
        <div className="filter-options">
          <select className="filter-select">
            <option value="">All Parts</option>
          </select>
          <select className="filter-select">
            <option value="">All Warehouses</option>
          </select>
          <select className="filter-select">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Form Header Section */}
      {isAddBom && (
        <div className="table-form-container mx-2">
          <div className="form-header">
            <h2>
              <i className="fas fa-sitemap"></i> Add New Bom
            </h2>
            <button
              className="btn-close"
              onClick={() => setIsAddBom(false)}
            ></button>
          </div>

          {/* Form Fields */}
          <form
            autoComplete="off"
            className="padding-2"
            onSubmit={handleAddBoms}
          >
            <div className="form-grid border-bottom pt-0">
              <div className="row form-style">
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="bomName" className="form-label">
                    BOM Name
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-file-alt position-absolute input-icon"></i>
                    <input
                      type="text"
                      className="form-control ps-5 text-font"
                      id="bomName"
                      placeholder="Enter BOM name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                  {errors.name && (
                    <span className="error-message">{errors.name}</span>
                  )}
                </div>
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="bomCode" className="form-label">
                    BOM Code
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-qrcode position-absolute input-icon"></i>
                    <input
                      type="text"
                      className="form-control ps-5 text-font"
                      id="bomCode"
                      placeholder="Enter BOM code"
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({ ...formData, code: e.target.value })
                      }
                    />
                  </div>
                  {errors.code && (
                    <span className="error-message">{errors.code}</span>
                  )}
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
                      <option value="" disabled hidden className="text-muted">
                        Select Status
                      </option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                    <i className="fa-solid fa-angle-down position-absolute down-arrow-icon"></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="parts-section">
              <div className="bom-list-header">
                <h2>Items List</h2>
              </div>
              <div className="item-table-container mt-3">
                <table>
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Code</th>
                      <th>UOM</th>
                      <th>Quantity</th>
                      <th>Warehouse</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isAddBomPart.map((bomPart, index) => {
                      const currentItem = formData.items.find(item => item.id === bomPart.id) || {
                        id: bomPart.id,
                        item: "",
                        code: "",
                        uom: "",
                        quantity: "",
                        warehouse: ""
                      };
                      
                      return (
                        <tr key={bomPart.id}>
                          <td>
                            <div className="field-wrapper">
                              <div className="position-relative w-100">
                                <i className="fas fa-cogs position-absolute input-icon"></i>
                                <select
                                  className="form-control text-font w-100 ps-5"
                                  required
                                  value={currentItem.item}
                                  onChange={(e) => {
                                    const selectedItem = items.find(item => item.id === parseInt(e.target.value));
                                    const updatedItems = [...formData.items];
                                    const itemIndex = updatedItems.findIndex(item => item.id === bomPart.id);
                                    
                                    if (itemIndex !== -1) {
                                      updatedItems[itemIndex] = {
                                        ...updatedItems[itemIndex],
                                        item: e.target.value,
                                        code: selectedItem ? selectedItem.code : '',
                                        uom: selectedItem ? selectedItem.uom : '',
                                        quantity: selectedItem && selectedItem.stQty ? selectedItem.stQty.toString() : ''
                                      };
                                    } else {
                                      updatedItems.push({
                                        id: bomPart.id,
                                        item: e.target.value,
                                        code: selectedItem ? selectedItem.code : '',
                                        uom: selectedItem ? selectedItem.uom : '',
                                        quantity: selectedItem && selectedItem.stQty ? selectedItem.stQty.toString() : '',
                                        warehouse: ""
                                      });
                                    }
                                    
                                    setFormData({
                                      ...formData,
                                      items: updatedItems
                                    });
                                  }}
                                >
                                  <option value="">Select Item</option>
                                  {items.map(item => (
                                    <option key={item.id} value={item.id}>
                                      {item.name} ({item.code})
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="field-wrapper">
                              <input
                                type="text"
                                className="form-control text-font w-100"
                                readOnly
                                required
                                value={currentItem.code || ""}
                              />
                            </div>
                          </td>
                          <td>
                            <div className="field-wrapper">
                              <input
                                type="text"
                                className="form-control text-font w-100"
                                readOnly
                                required
                                value={currentItem.uom || ""}
                              />
                            </div>
                          </td>
                          <td>
                            <div className="field-wrapper">
                              <input
                                type="number"
                                className="form-control text-font w-100"
                                min="0.01"
                                step="0.01"
                                required
                                value={currentItem.quantity || ""}
                                onChange={(e) => {
                                  const updatedItems = [...formData.items];
                                  const itemIndex = updatedItems.findIndex(item => item.id === bomPart.id);
                                  
                                  if (itemIndex !== -1) {
                                    updatedItems[itemIndex] = {
                                      ...updatedItems[itemIndex],
                                      quantity: e.target.value
                                    };
                                  }
                                  
                                  setFormData({
                                    ...formData,
                                    items: updatedItems
                                  });
                                }}
                              />
                            </div>
                          </td>
                          <td>
                            <div className="">
                              <div className="position-relative w-100">
                                <i className="fas fa-warehouse position-absolute input-icon"></i>
                                <select
                                  className="form-control text-font w-100 ps-5"
                                  id={`warehouse-${bomPart.id}`}
                                  title="Select Warehouse"
                                  required
                                  value={currentItem.warehouse || ""}
                                  onChange={(e) => {
                                    const updatedItems = [...formData.items];
                                    const itemIndex = updatedItems.findIndex(item => item.id === bomPart.id);
                                    
                                    if (itemIndex !== -1) {
                                      updatedItems[itemIndex] = {
                                        ...updatedItems[itemIndex],
                                        warehouse: e.target.value
                                      };
                                    } else {
                                      updatedItems.push({
                                        id: bomPart.id,
                                        item: "",
                                        code: "",
                                        uom: "",
                                        quantity: "",
                                        warehouse: e.target.value
                                      });
                                    }
                                    
                                    setFormData({
                                      ...formData,
                                      items: updatedItems
                                    });
                                  }}
                                >
                                  <option value="">Select Warehouse</option>
                                  {warehouses.map(warehouse => (
                                    <option key={warehouse.id} value={warehouse.id}>
                                      {warehouse.name} ({warehouse.code})
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </td>
                          <td className="actions">
                            <div className="field-wrapper">
                              <button
                                type="button"
                                className="btn-icon btn-primary ms-2"
                                title="View Item Details"
                              >
                                <i className="fas fa-info-circle"></i>
                              </button>
                              <button
                                type="button"
                                className="btn-icon btn-danger ms-2"
                                title="Remove Item"
                                onClick={() => handleDeleteItem(bomPart.id)}
                                disabled={isAddBomPart.length <= 1}
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                <button
                  type="button"
                  className="btn btn-secondary text-font m-3"
                  onClick={() => {
                    const newId = idRef.current++;
                    // Add new part to isAddBomPart
                    setIsAddBomPart((prevParts) => [
                      ...prevParts,
                      { id: newId },
                    ]);
                    
                    // Add a new empty item to formData.items
                    setFormData(prev => ({
                      ...prev,
                      items: [
                        ...prev.items,
                        {
                          id: newId,
                          item: "",
                          code: "",
                          uom: "",
                          quantity: "",
                          warehouse: ""
                        }
                      ]
                    }));
                  }}
                >
                  <i className="fas fa-plus me-2"></i>
                  Add Item
                </button>
              </div>
            </div>

            <div className="form-actions">
              <button
                className="btn btn-primary border border-0 text-8 px-3 fw-medium py-2 me-3 float-end"
                onClick={handleAddBoms}
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
              <label htmlFor="select-all">{selectedBoms.length} Selected</label>
            </div>
            <div className="bulk-actions">
              <button className="btn-action">
                <i className="fas fa-file-export"></i>
                Export Selected
              </button>
              <button className="btn-action btn-danger">
                <i className="fas fa-trash"></i>
                Delete Selected
              </button>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th className="checkbox-cell">
                  <input type="checkbox" id="select-all" />
                </th>
                <th>
                  Name <i className="fas fa-sort color-gray ms-2"></i>
                </th>
                <th>
                  Code <i className="fas fa-sort color-gray ms-2"></i>
                </th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {boms.length === 0 ? (
                <tr className="no-data-row">
                  <td colSpan="8" className="no-data-cell text-center">
                    <div
                      className="no-data-content d-flex flex-column align-items-center justify-content-center"
                      style={{ minHeight: "200px" }}
                    >
                      <i className="fas fa-sitemap no-data-icon mb-3"></i>
                      <p className="no-data-text mb-1">No BOM's added</p>
                      <p className="no-data-subtext">
                        Click the "Add New BOM" button to create your first Bill
                        of Materials
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                boms.map((bom) => (
                  <tr key={bom.id}>
                    <td className="checkbox-cell">
                      <input
                        type="checkbox"
                        checked={selectedBoms.includes(bom.id)}
                        onChange={() => handleBomCheckboxChange(bom.id)}
                      />
                    </td>
                    <td>
                      <div>
                        <span>{bom.name}</span>
                      </div>
                    </td>
                    <td>
                      <div>
                        <span>{bom.code}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${bom.status}`}>
                        {bom.status}
                      </span>
                    </td>
                    <td className="actions">
                      <button
                        className="btn-icon btn-primary"
                        title="View Details"
                        onClick={(e) => handleViewDetails(bom, e)}
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      <button className="btn-icon btn-success" title="Edit"
                        onClick={(e) => handleEditDetails(bom, e)}>
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

      {/* BOM View Modal */}
      <div
        className="modal fade"
        id="bomViewModal"
        tabIndex="-1"
        aria-labelledby="bomViewModalLabel"
        aria-hidden="true"
        ref={bomModalRef}
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="bomViewModalLabel">
                BOM Details
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              {bomDetails && (
                <div className="bom-details">
                  <div className="row mb-3">
                    <div className="col-6">
                      <p><strong>Name:</strong> {bomDetails.name}</p>
                    </div>
                    <div className="col-6">
                      <p><strong>Code:</strong> {bomDetails.code}</p>
                    </div>
                  </div>
                  <div className="row mb-3">
                    <div className="col-6">
                      <p><strong>Status:</strong> {bomDetails.status}</p>
                    </div>
                    <div className="col-6">
                      <p><strong>Items Count:</strong> {bomDetails.itemsCount || 0}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* BOM Edit Modal */}
      <div
        className="modal fade"
        id="bomEditModal"
        tabIndex="-1"
        aria-labelledby="bomEditModalLabel"
        aria-hidden="true"
        ref={bomEditModalRef}
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="bomEditModalLabel">
                Edit BOM
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleEditBom}>
                {bomDetails && (
                  <div className="row">
                    <div className="col-6 mb-3">
                      <label htmlFor="editBomName" className="form-label">Name</label>
                      <input
                        type="text"
                        className="form-control"
                        id="editBomName"
                        value={bomDetails.name}
                        onChange={(e) =>
                          setBomDetails({ ...bomDetails, name: e.target.value })
                        }
                      />
                    </div>
                    <div className="col-6 mb-3">
                      <label htmlFor="editBomCode" className="form-label">Code</label>
                      <input
                        type="text"
                        className="form-control"
                        id="editBomCode"
                        value={bomDetails.code}
                        onChange={(e) =>
                          setBomDetails({ ...bomDetails, code: e.target.value })
                        }
                      />
                    </div>
                    <div className="col-12 mb-3">
                      <label htmlFor="editBomStatus" className="form-label">Status</label>
                      <select
                        className="form-control"
                        id="editBomStatus"
                        value={bomDetails.status}
                        onChange={(e) =>
                          setBomDetails({ ...bomDetails, status: e.target.value })
                        }
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                )}
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    data-bs-dismiss="modal"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BOMMaster;
