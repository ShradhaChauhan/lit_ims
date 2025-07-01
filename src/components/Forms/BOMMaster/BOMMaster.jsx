import React, { useContext, useRef, useState, useEffect } from "react";
import { AppContext } from "../../../context/AppContext";
import api from "../../../services/api";

const BOM = () => {
  const { isAddBom, setIsAddBom } = useContext(AppContext);

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

  const handleAddBoms = (e) => {
    e.preventDefault();
    const finalData = {
      name: formData.name,
      code: formData.code,
      status: formData.status,
      items: formData.items.map(item => {
        const selectedItem = items.find(i => i.id === parseInt(item.item)) || {};
        const selectedWarehouse = warehouses.find(w => w.id === parseInt(item.warehouse)) || {};
        
        return {
          itemId: parseInt(item.item),
          itemName: selectedItem.name || "",
          itemCode: item.code,
          uom: item.uom,
          quantity: parseFloat(item.quantity),
          warehouseId: parseInt(item.warehouse),
          warehouseName: selectedWarehouse.name || ""
        };
      }),
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
    console.log("Form submitted. ", finalData);
  };

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
  };

  // Handle delete item
  const handleDeleteItem = (itemId) => {
    // If it's the last item, don't delete it
    if (isAddBomPart.length <= 1) {
      return;
    }
    
    // Remove the item from isAddBomPart
    setIsAddBomPart(prevParts => prevParts.filter(part => part.id !== itemId));
    
    // Remove the corresponding item from formData.items
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
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
        <div className="table-form-container">
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
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
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
                      required
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({ ...formData, code: e.target.value })
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
                className="btn btn-primary border border-0 add-btn me-3 float-end"
                onClick={handleAddBoms}
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
                <th>Items Count</th>
                <th>Total Quantity</th>
                <th>Total Value</th>
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
                      <div>
                        <span>{bom.uom}</span>
                      </div>
                    </td>
                    <td>
                      <div>
                        <span>{bom.qty}</span>
                      </div>
                    </td>
                    <td>
                      <div>
                        <span>{bom.warehouse}</span>
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
    </div>
  );
};

export default BOM;
