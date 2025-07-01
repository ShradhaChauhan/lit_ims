import React, { useContext, useEffect, useRef, useState } from "react";
import ItemMasterModal from "../../Modals/ItemMasterModal";
import { AppContext } from "../../../context/AppContext";
import { Link } from "react-router-dom";
import { Modal } from "bootstrap";

const ItemMaster = () => {
  const itemModalRef = useRef(null);
  const itemEditModalRef = useRef(null);
  const [isShowItemDetails, setIsShowItemDetails] = useState(false);
  const [isEditItemDetails, setIsEditItemDetails] = useState(false);

  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const { isAddItem, setIsAddItem } = useContext(AppContext);
  const [isReset, setIsReset] = useState(false);
  const [status, setStatus] = useState("active");
  const [isChecked, setIsChecked] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    uom: "",
    type: "",
    barcode: "",
    group: "",
    price: "",
    stQty: "",
    life: "",
    status: "active",
  });

  const [itemDetails, setItemDetails] = useState({
    id: "",
    name: "",
    code: "",
    uom: "",
    type: "",
    barcode: "",
    group: "",
    price: "",
    stQty: "",
    life: "",
    status: "",
  });

  const items = [
    {
      id: 1,
      name: "Annie",
      code: "023546",
      uom: "Kg",
      type: "A Type",
      barcode: "123654",
      group: "Capacitor",
      price: "500",
      stQty: "1000",
      life: "1 year",
      status: "active",
    },
  ];

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
      group: formData.group,
      price: formData.price,
      stQty: formData.stQty,
      life: formData.life,
      status: formData.status,
    };

    console.log("Submitting add item form");
    fetch("", {
      method: "POST",
      body: finalData,
    }).then(function (response) {
      console.log(response);
      return response.json();
    });
    console.log("Form submitted. ", finalData);
  };

  const handleReset = (e) => {
    e.preventDefault();
    setFormData({
      name: "",
      code: "",
      uom: "",
      type: "",
      barcode: "",
      group: "",
      price: "",
      stQty: "",
      life: "",
      status: "active",
    });
    setIsChecked(true);
    setStatus("active");
  };

  const handleSetIsAddVendor = () => {
    setIsAddItem(true);
  };

  const handleViewDetails = (item, e) => {
    e.preventDefault();
    console.log(item);
    setItemDetails(item);
    setIsShowItemDetails(true);
  };

  const handleEditDetails = (item, e) => {
    e.preventDefault();
    console.log(item);
    setItemDetails(item);
    setIsEditItemDetails(true);
  };

  const handleEditItem = (e) => {
    e.preventDefault();
    console.log("Item has been edited");
  };

  useEffect(() => {
    if (isShowItemDetails && itemModalRef.current) {
      const bsModal = new Modal(itemModalRef.current, {
        backdrop: "static",
      });
      bsModal.show();

      // Optional: hide modal state when it's closed
      itemModalRef.current.addEventListener("hidden.bs.modal", () =>
        setIsShowItemDetails(false)
      );
    } else if (isEditItemDetails && itemEditModalRef.current) {
      const bsModal = new Modal(itemEditModalRef.current, {
        backdrop: "static",
      });
      bsModal.show();

      // Hide modal state when it's closed
      itemEditModalRef.current.addEventListener("hidden.bs.modal", () =>
        setIsEditItemDetails(false)
      );
    }
  }, [isShowItemDetails, isEditItemDetails]);

  return (
    <div>
      {/* Header section */}
      <nav className="navbar bg-light border-body" data-bs-theme="light">
        <div className="container-fluid">
          <div className="mt-4">
            <h3 className="nav-header header-style">Item Master</h3>
            <p className="breadcrumb">
              <Link to="/dashboard">
                <i className="fas fa-home text-8"></i>
              </Link>{" "}
              <span className="ms-1 mt-1 text-small-gray">
                / Masters / Item Master
              </span>
            </p>
          </div>

          {/* Add Item Button */}

          <button
            className="btn btn-primary add-btn"
            onClick={handleSetIsAddVendor}
          >
            <i className="fa-solid fa-user-plus"></i> Add New Item
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
            placeholder="Search by items..."
          />
        </div>
        <div className="filter-options">
          <select className="filter-select">
            <option value="">All Groups</option>
          </select>
          <select className="filter-select">
            <option value="">All Types</option>
            <option value="vendor">Vendors Only</option>
            <option value="customer">Customers Only</option>
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
        <div className="table-form-container mx-2">
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
                <div className="col-4 d-flex flex-column form-group ps-2">
                  <label htmlFor="name" className="form-label mb-0">
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
                  <label htmlFor="code" className="form-label mb-0">
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
                <div className="col-4 d-flex flex-column form-group ps-2">
                  <label htmlFor="type" className="form-label mb-0">
                    Type
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-tags position-absolute input-icon"></i>
                    <select
                      className="form-control ps-5 text-font"
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
                      <option value="a">A Type</option>
                      <option value="b">B Type</option>
                      <option value="c">C Type</option>
                    </select>
                    <i className="fa-solid fa-angle-down position-absolute down-arrow-icon"></i>
                  </div>
                </div>
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="barcode" className="form-label mb-0">
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
                  <label htmlFor="group" className="form-label mb-0 ms-2">
                    Group
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-layer-group position-absolute input-icon"></i>
                    <select
                      className="form-control ps-5 ms-2 text-font"
                      id="group"
                      placeholder="Group"
                      required
                      value={formData.group}
                      onChange={(e) =>
                        setFormData({ ...formData, group: e.target.value })
                      }
                    >
                      <option value="" disabled hidden className="text-muted">
                        Select Group
                      </option>
                      <option value="capacitor">Capacitor</option>
                      <option value="irLed">IR LED</option>
                      <option value="spring">Spring</option>
                    </select>
                    <i className="fa-solid fa-angle-down position-absolute down-arrow-icon"></i>
                  </div>
                </div>
              </div>
              <div className="row form-style">
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="price" className="form-label mb-0">
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
                  <label htmlFor="stQty" className="form-label mb-0">
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
                      className="form-control ps-5 text-font ms-2"
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
                className="btn btn-primary border border-0 text-8 px-3 fw-medium py-2 me-3 float-end"
                onClick={handleAddItem}
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
                {selectedItems.length} Selected
              </label>
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
              {items.length === 0 ? (
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
                    <td className="checkbox-cell ps-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => handleItemCheckboxChange(item.id)}
                      />
                    </td>
                    <td className="ps-4">
                      <div>
                        <span>{item.name}</span>
                      </div>
                    </td>
                    <td className="ps-4">
                      <div>
                        <span>{item.code}</span>
                      </div>
                    </td>
                    <td className="ps-4">
                      <div>
                        <span>{item.uom}</span>
                      </div>
                    </td>
                    <td className="ps-4">
                      <div>
                        <span>{item.type}</span>
                      </div>
                    </td>
                    <td className="ps-4">
                      <div>
                        <span>{item.barcode}</span>
                      </div>
                    </td>
                    <td className="ps-4">
                      <div>
                        <span>{item.group}</span>
                      </div>
                    </td>
                    <td className="ps-4">{item.price}</td>
                    <td className="ps-4">
                      <div>
                        <span>{item.life}</span>
                      </div>
                    </td>
                    <td className="ps-4">
                      <span
                        className={`badge status ${item.status.toLowerCase()}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="actions">
                      <button
                        className="btn-icon btn-primary"
                        title="View Details"
                        onClick={(e) => handleViewDetails(item, e)}
                      >
                        <i className="fas fa-eye"></i>
                      </button>
                      <button
                        className="btn-icon btn-success"
                        title="Edit"
                        onClick={(e) => handleEditDetails(item, e)}
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
      {/* View Item Details Modal */}
      {isShowItemDetails && (
        <div
          className="modal fade"
          ref={itemModalRef}
          id="itemDetailModal"
          tabIndex="-1"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  View {itemDetails.name}'s Details
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
                  <strong>Name:</strong> {itemDetails.name}
                </p>
                <p>
                  <strong>Code:</strong> {itemDetails.code}
                </p>
                <p>
                  <strong>UOM:</strong> {itemDetails.uom}
                </p>
                <p>
                  <strong>Type:</strong> {itemDetails.type}
                </p>
                <p>
                  <strong>Barcode:</strong> {itemDetails.barcode}
                </p>
                <p>
                  <strong>Group:</strong> {itemDetails.group}
                </p>
                <p>
                  <strong>ST Qty:</strong> {itemDetails.stQty}
                </p>
                <p>
                  <strong>Life:</strong> {itemDetails.life}
                </p>
                <p>
                  <strong>Status:</strong> {itemDetails.status}
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

      {/* Edit Item Details Modal */}
      {isEditItemDetails && (
        <div
          className="modal fade"
          ref={itemEditModalRef}
          id="itemEditModal"
          tabIndex="-1"
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Item</h5>
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
                  onSubmit={handleAddItem}
                >
                  <div className="form-grid pt-0">
                    <div className="row form-style">
                      <div className="col-4 d-flex flex-column form-group ps-2">
                        <label htmlFor="name" className="form-label mb-0">
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
                            value={itemDetails.name}
                            onChange={(e) =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                          />
                        </div>
                      </div>
                      <div className="col-4 d-flex flex-column form-group">
                        <label htmlFor="code" className="form-label mb-0">
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
                            value={itemDetails.code}
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
                            value={itemDetails.uom}
                            onChange={(e) =>
                              setFormData({ ...formData, uom: e.target.value })
                            }
                          >
                            <option
                              value=""
                              disabled
                              hidden
                              className="text-muted"
                            >
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
                      <div className="col-4 d-flex flex-column form-group ps-2">
                        <label htmlFor="type" className="form-label mb-0">
                          Type
                        </label>
                        <div className="position-relative w-100">
                          <i className="fas fa-tags position-absolute input-icon"></i>
                          <select
                            className="form-control ps-5 text-font"
                            id="type"
                            placeholder="Type"
                            required
                            value={itemDetails.type}
                            onChange={(e) =>
                              setFormData({ ...formData, type: e.target.value })
                            }
                          >
                            <option
                              value=""
                              disabled
                              hidden
                              className="text-muted"
                            >
                              Select Type Name
                            </option>
                            <option value="a">A Type</option>
                            <option value="b">B Type</option>
                            <option value="c">C Type</option>
                          </select>
                          <i className="fa-solid fa-angle-down position-absolute down-arrow-icon"></i>
                        </div>
                      </div>
                      <div className="col-4 d-flex flex-column form-group">
                        <label htmlFor="barcode" className="form-label mb-0">
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
                            value={itemDetails.barcode}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                barcode: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className="col-4 d-flex flex-column form-group">
                        <label htmlFor="group" className="form-label mb-0 ms-2">
                          Group
                        </label>
                        <div className="position-relative w-100">
                          <i className="fas fa-layer-group position-absolute input-icon"></i>
                          <select
                            className="form-control ps-5 ms-2 text-font"
                            id="group"
                            placeholder="Group"
                            required
                            value={itemDetails.group}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                group: e.target.value,
                              })
                            }
                          >
                            <option
                              value=""
                              disabled
                              hidden
                              className="text-muted"
                            >
                              Select Group
                            </option>
                            <option value="capacitor">Capacitor</option>
                            <option value="irLed">IR LED</option>
                            <option value="spring">Spring</option>
                          </select>
                          <i className="fa-solid fa-angle-down position-absolute down-arrow-icon"></i>
                        </div>
                      </div>
                    </div>
                    <div className="row form-style">
                      <div className="col-4 d-flex flex-column form-group">
                        <label htmlFor="price" className="form-label mb-0">
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
                            value={itemDetails.price}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                price: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className="col-4 d-flex flex-column form-group">
                        <label htmlFor="stQty" className="form-label mb-0">
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
                            value={itemDetails.stQty}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                stQty: e.target.value,
                              })
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
                            className="form-control ps-5 text-font ms-2"
                            id="life"
                            placeholder="Enter life (in days)"
                            required
                            value={itemDetails.life}
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
                              checked={
                                itemDetails.status == "active" ? true : false
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
                </form>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-primary border border-0 text-8 px-3 fw-medium py-2 me-3 float-end"
                  data-bs-dismiss="modal"
                  onClick={(e) => {
                    document.activeElement?.blur();
                    handleEditItem(e);
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

export default ItemMaster;
