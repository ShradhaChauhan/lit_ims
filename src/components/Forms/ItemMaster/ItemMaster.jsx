import React, { useContext, useState, useEffect } from "react";
import ItemMasterModal from "../../Modals/ItemMasterModal";
import { AppContext } from "../../../context/AppContext";
import api from "../../../services/api";

const ItemMaster = () => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const { isAddItem, setIsAddItem } = useContext(AppContext);
  const [isReset, setIsReset] = useState(false);
  const [status, setStatus] = useState("active");
  const [isChecked, setIsChecked] = useState(true);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [types, setTypes] = useState([]);
  const [groups, setGroups] = useState([]);
  
  // Pagination states
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    uom: "",
    type: "",
    barcode: "",
    groupName: "",
    price: "",
    stQty: "",
    life: "",
    status: "active",
  });

  // Fetch items data
  useEffect(() => {
    fetchItems();
  }, [pagination.currentPage, pagination.itemsPerPage]);

  // Fetch types data
  useEffect(() => {
    fetchTypes();
    fetchGroups();
  }, []);

  const fetchTypes = () => {
    api.get("/api/type/all")
      .then(response => {
        console.log("Types fetched:", response.data);
        setTypes(response.data.types || []);
      })
      .catch(error => {
        console.error("Error fetching types:", error);
      });
  };

  const fetchGroups = () => {
    api.get("/api/group/all")
      .then(response => {
        console.log("Groups fetched:", response.data);
        setGroups(response.data.groups || []);
      })
      .catch(error => {
        console.error("Error fetching groups:", error);
      });
  };

  const fetchItems = () => {
    setLoading(true);
    
    // Add pagination parameters to the API call
    api.get("/api/items/all", {
      params: {
        page: pagination.currentPage,
        limit: pagination.itemsPerPage
      }
    })
      .then(response => {
        console.log("Items fetched:", response.data);
        
        // Assuming the API returns data in this format:
        // { items: [...], totalItems: number, totalPages: number }
        // Adjust according to your actual API response
        setItems(response.data.items || []);
        
        // Update pagination info if it's provided by the API
        if (response.data.totalItems !== undefined) {
          setPagination(prev => ({
            ...prev,
            totalItems: response.data.totalItems,
            totalPages: response.data.totalPages || Math.ceil(response.data.totalItems / prev.itemsPerPage)
          }));
        }
        
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching items:", error);
        setLoading(false);
      });
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.totalPages || newPage === pagination.currentPage) {
      return;
    }
    
    setPagination(prev => ({
      ...prev,
      currentPage: newPage
    }));
    
    // fetchItems will be called by the useEffect that depends on currentPage
  };

  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = parseInt(e.target.value);
    
    setPagination(prev => ({
      ...prev,
      itemsPerPage: newItemsPerPage,
      currentPage: 1 // Reset to first page when changing items per page
    }));
    
    // fetchItems will be called by the useEffect that depends on itemsPerPage
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const totalPages = pagination.totalPages;
    const currentPage = pagination.currentPage;
    
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    if (currentPage <= 3) {
      return [1, 2, 3, 4, 5, '...', totalPages];
    }
    
    if (currentPage >= totalPages - 2) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  const handleItemCheckboxChange = (itemId) => {
    setSelectedItems((prevSelected) =>
      prevSelected.includes(itemId)
        ? prevSelected.filter((id) => id !== itemId)
        : [...prevSelected, itemId]
    );
  };

  const handleSelectAllChange = (e) => {
    const checked = e.target.checked;
    setSelectAll(checked);
    if (checked) {
      const allItemIds = items.map((item) => item.id);
      setSelectedItems(allItemIds);
    } else {
      setSelectedItems([]);
    }
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    const finalData = {
      name: formData.name,
      code: formData.code,
      uom: formData.uom,
      type: formData.type,
      barcode: formData.barcode,
      groupName: formData.groupName,
      price: formData.price,
      stQty: formData.stQty,
      life: formData.life,
      status: formData.status,
    };

    console.log("Submitting add item form");
    
    api.post("/api/items/add", finalData)
      .then(response => {
        console.log("Item added successfully:", response.data);
        // Reset form or show success message
        handleReset(e);
        // Optionally close the form
        setIsAddItem(false);
        // Refresh the items list
        fetchItems();
      })
      .catch(error => {
        console.error("Error adding item:", error);
        // Handle error (show error message)
      });
  };

  const handleDeleteItem = (itemId) => {
    if (!window.confirm("Are you sure you want to delete this item?")) {
      return;
    }
    
    setDeleting(true);
    api.delete(`/api/items/delete/${itemId}`)
      .then(response => {
        console.log("Item deleted successfully:", response.data);
        // Refresh the items list
        fetchItems();
        setDeleting(false);
      })
      .catch(error => {
        console.error("Error deleting item:", error);
        setDeleting(false);
        // Handle error (show error message)
        alert("Error deleting item. Please try again.");
      });
  };

  const handleDeleteSelected = () => {
    if (selectedItems.length === 0) {
      alert("Please select at least one item to delete.");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${selectedItems.length} selected item(s)?`)) {
      return;
    }
    
    setDeleting(true);
    
    // Create an array of promises for each delete operation
    const deletePromises = selectedItems.map(itemId => 
      api.delete(`/api/items/delete/${itemId}`)
    );
    
    // Execute all delete operations
    Promise.all(deletePromises)
      .then(responses => {
        console.log("Items deleted successfully:", responses);
        // Refresh the items list
        fetchItems();
        // Clear selection
        setSelectedItems([]);
        setSelectAll(false);
        setDeleting(false);
      })
      .catch(error => {
        console.error("Error deleting items:", error);
        setDeleting(false);
        // Handle error (show error message)
        alert("Error deleting items. Please try again.");
      });
  };

  const handleReset = (e) => {
    e.preventDefault();
    setFormData({
      name: "",
      code: "",
      uom: "",
      type: "",
      barcode: "",
      groupName: "",
      price: "",
      stQty: "",
      life: "",
      status: "active",
    });
    setIsChecked(true);
  };

  // Calculate the display range for the pagination info
  const getDisplayRange = () => {
    const start = (pagination.currentPage - 1) * pagination.itemsPerPage + 1;
    const end = Math.min(start + items.length - 1, pagination.totalItems);
    
    if (items.length === 0) {
      return "0";
    }
    
    return `${start}-${end}`;
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
            placeholder="Search by items..."
          />
        </div>
        <div className="filter-options">
          <select className="filter-select">
            <option value="">All Groups</option>
            {groups.map(group => (
              <option key={group.id} value={group.id}>
                {group.name}
              </option>
            ))}
          </select>
          <select className="filter-select">
            <option value="">All Types</option>
            {types.map(type => (
              <option key={type.id} value={type.name}>
                {type.name}
              </option>
            ))}
          </select>
          <select className="filter-select">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Form Header Section */}
      {isAddItem && (
        <div className="table-form-container">
          <div className="form-header">
            <h2>
              <i className="fas fa-box"></i> Add New Item
            </h2>
            <button
              className="btn-close"
              onClick={() => setIsAddItem(false)}
            ></button>
          </div>
          {/* Form Fields */}
          <form
            autoComplete="off"
            className="padding-2"
            onSubmit={handleAddItem}
          >
            <div className="form-grid border-bottom pt-0">
              <div className="row form-style">
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="name" className="form-label mb-0 ms-2">
                    Item Name
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-box position-absolute input-icon"></i>
                    <input
                      type="text"
                      className="form-control ps-5 text-font"
                      id="name"
                      placeholder="Enter item name"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="code" className="form-label mb-0 ms-2">
                    Item Code
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-qrcode position-absolute input-icon"></i>
                    <input
                      type="text"
                      className="form-control ps-5 text-font"
                      id="code"
                      placeholder="Enter item code"
                      required
                      value={formData.code}
                      onChange={(e) =>
                        setFormData({ ...formData, code: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="uom" className="form-label mb-0 ms-2">
                    UOM
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-ruler position-absolute input-icon"></i>
                    <select
                      className="form-control ps-5 ms-2 text-font"
                      id="uom"
                      placeholder="UOM"
                      required
                      value={formData.uom}
                      onChange={(e) =>
                        setFormData({ ...formData, uom: e.target.value })
                      }
                    >
                      <option value="" disabled hidden className="text-muted">
                        Select UOM
                      </option>
                      <option value="pcs">Pcs</option>
                      <option value="Kg">Kg</option>
                    </select>
                    <i className="fa-solid fa-angle-down position-absolute down-arrow-icon"></i>
                  </div>
                </div>
              </div>
              <div className="row form-style">
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="type" className="form-label mb-0 ms-2">
                    Type
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-tags position-absolute input-icon"></i>
                    <select
                      className="form-control ps-5 ms-2 text-font"
                      id="type"
                      placeholder="Type"
                      required
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value })
                      }
                    >
                      <option value="" disabled hidden className="text-muted">
                        Select Type Name
                      </option>
                      {types.map(type => (
                        <option key={type.id} value={type.name}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                    <i className="fa-solid fa-angle-down position-absolute down-arrow-icon"></i>
                  </div>
                </div>
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="barcode" className="form-label mb-0  ms-2">
                    Barcode
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-qrcode position-absolute input-icon"></i>
                    <input
                      type="text"
                      className="form-control ps-5 text-font"
                      id="barcode"
                      placeholder="Enter barcode"
                      required
                      value={formData.barcode}
                      onChange={(e) =>
                        setFormData({ ...formData, barcode: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="groupName" className="form-label mb-0 ms-2">
                    Group
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-layer-group position-absolute input-icon"></i>
                    <select
                      className="form-control ps-5 ms-2 text-font"
                      id="groupName"
                      placeholder="Group"
                      required
                      value={formData.groupName}
                      onChange={(e) =>
                        setFormData({ ...formData, groupName: e.target.value })
                      }
                    >
                      <option value="" disabled hidden className="text-muted">
                        Select Group
                      </option>
                      {groups.map(group => (
                        <option key={group.id} value={group.name}>
                          {group.name}
                        </option>
                      ))}
                    </select>
                    <i className="fa-solid fa-angle-down position-absolute down-arrow-icon"></i>
                  </div>
                </div>
              </div>
              <div className="row form-style">
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="price" className="form-label mb-0  ms-2">
                    Price
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-rupee-sign position-absolute input-icon"></i>
                    <input
                      type="text"
                      className="form-control ps-5 text-font"
                      id="price"
                      placeholder="Enter price"
                      required
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="stQty" className="form-label mb-0  ms-2">
                    ST QTY
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-cubes position-absolute input-icon"></i>
                    <input
                      type="text"
                      className="form-control ps-5 text-font"
                      id="stQty"
                      placeholder="Enter ST QTY"
                      required
                      value={formData.stQty}
                      onChange={(e) =>
                        setFormData({ ...formData, stQty: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="life" className="form-label mb-0  ms-2">
                    Life (In Days)
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-clock position-absolute input-icon"></i>
                    <input
                      type="text"
                      className="form-control ps-5 text-font"
                      id="life"
                      placeholder="Enter life (in days)"
                      required
                      value={formData.life}
                      onChange={(e) =>
                        setFormData({ ...formData, life: e.target.value })
                      }
                    />
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
                type="submit"
              >
                <i className="fa-solid fa-floppy-disk me-1"></i> Save Changes
              </button>
              <button
                className="btn btn-secondary border border-0 add-btn bg-secondary me-3 float-end"
                type="button"
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
                {selectedItems.length} Selected
              </label>
            </div>
            <div className="bulk-actions">
              <button className="btn-action">
                <i className="fas fa-file-export"></i>
                Export Selected
              </button>
              <button 
                className="btn-action btn-danger"
                onClick={handleDeleteSelected}
                disabled={selectedItems.length === 0 || deleting}
              >
                {deleting ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Deleting...
                  </>
                ) : (
                  <>
                    <i className="fas fa-trash"></i>
                    Delete Selected
                  </>
                )}
              </button>
            </div>
          </div>
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
                  Name <i className="fas fa-sort color-gray ms-2"></i>
                </th>
                <th>
                  Code <i className="fas fa-sort color-gray ms-2"></i>
                </th>
                <th>UOM</th>
                <th>Type</th>
                <th>Barcode</th>
                <th>Group</th>
                <th>ST Qty</th>
                <th>Life</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="12" className="text-center">
                    <div className="my-3">
                      <i className="fas fa-spinner fa-spin me-2"></i> Loading items...
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr className="no-data-row">
                  <td colSpan="12" className="no-data-cell">
                    <div className="no-data-content">
                      <i className="fas fa-box-open no-data-icon"></i>
                      <p className="no-data-text">No items found</p>
                      <p className="no-data-subtext">
                        Click the "Add New" button to create your first item
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id}>
                    <td className="checkbox-cell">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => handleItemCheckboxChange(item.id)}
                      />
                    </td>
                    <td>
                      <div>
                        <span>{item.name}</span>
                      </div>
                    </td>
                    <td>
                      <div>
                        <span>{item.code}</span>
                      </div>
                    </td>
                    <td>
                      <div>
                        <span>{item.uom}</span>
                      </div>
                    </td>
                    <td>{item.type}</td>
                    <td>{item.barcode || "-"}</td>
                    <td>{item.groupName || "-"}</td>
                    <td>{item.stQty || "-"}</td>
                    <td>{item.life || "-"}</td>
                    <td>
                      <span
                        className={`badge status ${item.status?.toLowerCase()}`}
                      >
                        {item.status || "-"}
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
                        onClick={() => handleDeleteItem(item.id)}
                        disabled={deleting}
                      >
                        {deleting ? (
                          <i className="fas fa-spinner fa-spin"></i>
                        ) : (
                          <i className="fas fa-trash"></i>
                        )}
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
              Showing {getDisplayRange()} of {pagination.totalItems} entries
            </div>
            <div className="pagination">
              <button 
                className="btn-page" 
                disabled={pagination.currentPage === 1 || loading}
                onClick={() => handlePageChange(pagination.currentPage - 1)}
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              
              {getPageNumbers().map((page, index) => (
                page === "..." ? (
                  <span key={`ellipsis-${index}`} className="pagination-ellipsis">...</span>
                ) : (
                  <button 
                    key={page} 
                    className={`btn-page ${pagination.currentPage === page ? 'active' : ''}`}
                    onClick={() => handlePageChange(page)}
                    disabled={loading}
                  >
                    {page}
                  </button>
                )
              ))}
              
              <button 
                className="btn-page" 
                disabled={pagination.currentPage === pagination.totalPages || loading}
                onClick={() => handlePageChange(pagination.currentPage + 1)}
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
            <div className="items-per-page">
              <select 
                value={pagination.itemsPerPage}
                onChange={handleItemsPerPageChange}
                disabled={loading}
              >
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

export default ItemMaster;
