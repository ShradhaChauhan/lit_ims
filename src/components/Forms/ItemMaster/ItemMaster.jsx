import React, { useContext, useState } from "react";
import ItemMasterModal from "../../Modals/ItemMasterModal";
import { AppContext } from "../../../context/AppContext";

const ItemMaster = () => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const { isAddItem, setIsAddItem } = useContext(AppContext);
  const [isReset, setIsReset] = useState(false);

  const items = [
    {
      id: 1,
      name: "Speaker",
      code: "01",
      uom: "Pcs.",
      typeName: "1",
      barcode: "012540",
      group: "Raw material",
      status: "Active",
      price: "10000",
      stQty: "100",
      life: "6 Months",
    },
    {
      id: 2,
      name: "IC",
      code: "02",
      uom: "Pcs.",
      typeName: "2",
      barcode: "012545",
      group: "Raw material",
      status: "Active",
      price: "20000",
      stQty: "200",
      life: "1 year",
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
    alert("Item Added Successfully");
  };

  const handleReset = () => {
    // setFormData(initialFormState); //
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
            placeholder="Search by item name, code..."
          />
        </div>
        <div className="filter-options">
          <input
            type="text"
            className="form-control text-font"
            id="itemCode"
            placeholder="Item code"
            aria-label="Item code"
          />
          <input
            type="text"
            className="form-control text-font"
            id="itemName"
            placeholder="Item name"
            aria-label="Item name"
          />
        </div>
        <div>
          <input
            type="date"
            className="form-control text-font"
            id="date"
            name="date"
          />
        </div>
      </div>

      {/* Form Header Section */}
      {isAddItem && (
        <div className="table-form-container">
          <div className="form-header">
            <h2>
              <i className="fas fa-user-plus"></i> Add New Item
            </h2>
            <button
              className="btn-close"
              onClick={() => setIsAddItem(false)}
            ></button>
          </div>
          {/* Form Fields */}
          <form autoComplete="off" className="padding-2">
            <div className="form-grid border-bottom pt-0">
              <div className="row form-style">
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="name" className="form-label  ms-2">
                    Item Name
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-user position-absolute input-icon"></i>
                    <input
                      type="text"
                      className="form-control ps-5 text-font"
                      id="name"
                      placeholder="Enter item name"
                    />
                  </div>
                </div>
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="code" className="form-label  ms-2">
                    Item Code
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-user position-absolute input-icon"></i>
                    <input
                      type="text"
                      className="form-control ps-5 text-font"
                      id="code"
                      placeholder="Enter item code"
                    />
                  </div>
                </div>
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="uom" className="form-label ms-2">
                    UOM
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-user-tag position-absolute input-icon"></i>
                    <select
                      className="form-control ps-5 ms-2 text-font"
                      id="uom"
                      placeholder="UOM"
                      data-bs-toggle="dropdown"
                    >
                      <option value="">Select UOM</option>
                      <option value="pcs">Pcs</option>
                      <option value="Kg">Kg</option>
                    </select>
                    <i className="fa-solid fa-angle-down position-absolute down-arrow-icon"></i>
                  </div>
                </div>
              </div>
              <div className="row form-style">
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="typeName" className="form-label ms-2">
                    Type Name
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-user-tag position-absolute input-icon"></i>
                    <select
                      className="form-control ps-5 ms-2 text-font"
                      id="typeName"
                      placeholder="Type Name"
                      data-bs-toggle="dropdown"
                    >
                      <option value="">Select Type Name</option>
                      <option value="a">A Type</option>
                      <option value="b">B Type</option>
                      <option value="c">C Type</option>
                    </select>
                    <i className="fa-solid fa-angle-down position-absolute down-arrow-icon"></i>
                  </div>
                </div>
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="barcode" className="form-label  ms-2">
                    Barcode
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-user position-absolute input-icon"></i>
                    <input
                      type="text"
                      className="form-control ps-5 text-font"
                      id="barcode"
                      placeholder="Enter barcode"
                    />
                  </div>
                </div>
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="group" className="form-label ms-2">
                    Group
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-user-tag position-absolute input-icon"></i>
                    <select
                      className="form-control ps-5 ms-2 text-font"
                      id="group"
                      placeholder="Group"
                      data-bs-toggle="dropdown"
                    >
                      <option value="">Select Group</option>
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
                  <label htmlFor="price" className="form-label  ms-2">
                    Price
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-user position-absolute input-icon"></i>
                    <input
                      type="text"
                      className="form-control ps-5 text-font"
                      id="price"
                      placeholder="Enter price"
                    />
                  </div>
                </div>
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="stQty" className="form-label ms-2">
                    ST QTY
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-user-tag position-absolute input-icon"></i>
                    <select
                      className="form-control ps-5 ms-2 text-font"
                      id="stQty"
                      placeholder="ST QTY"
                      data-bs-toggle="dropdown"
                    >
                      <option value="">Select ST QTY</option>
                      <option value="smt">SMT</option>
                      <option value="mi">MI</option>
                      <option value="molding">Molding</option>
                      <option value="assemble">Assemble</option>
                    </select>
                    <i className="fa-solid fa-angle-down position-absolute down-arrow-icon"></i>
                  </div>
                </div>
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="life" className="form-label  ms-2">
                    Life (In Days)
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-user position-absolute input-icon"></i>
                    <input
                      type="text"
                      className="form-control ps-5 text-font"
                      id="life"
                      placeholder="Enter life (in days)"
                    />
                  </div>
                </div>
              </div>
              <div className="row form-style">
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="date" className="form-label  ms-2">
                    Date
                  </label>
                  <div className="position-relative w-100">
                    <input
                      type="date"
                      className="form-control text-font"
                      id="date"
                      name="date"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="form-actions">
              <button
                className="btn btn-primary border border-0 add-btn me-3 float-end"
                onClick={handleAddItem}
              >
                <i className="fa-solid fa-floppy-disk me-1"></i> Save Changes
              </button>
              <button
                className="btn btn-secondary border border-0 add-btn bg-secondary me-3 float-end"
                onClick={() => setIsReset(true)}
              >
                {/* <i className="fa-solid fa-xmark me-1"></i> */}
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
          </div>
          <table>
            <thead>
              <tr>
                <th className="checkbox-cell">
                  <input type="checkbox" id="select-all" />
                </th>
                <th>
                  Item Name <i className="fas fa-sort color-gray ms-2"></i>
                </th>
                <th>
                  Item Code <i className="fas fa-sort color-gray ms-2"></i>
                </th>
                <th>
                  UOM <i className="fas fa-sort color-gray ms-2"></i>
                </th>
                <th>Price</th>
                <th>Status</th>
                {/* <th>
                  Type Name <i className="fas fa-sort color-gray ms-2"></i>
                </th>
                <th>Barcode</th>
                <th>
                  Group <i className="fas fa-sort color-gray ms-2"></i>
                </th>             

                <th>St Qty</th>
                <th>Life (In Days)</th>*/}
                <td className="actions">
                  <button className="btn-icon btn-primary" title="View Details">
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
            </thead>
            <tbody>
              {items.map((item) => (
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
                  <td>{item.price}</td>
                  <td>
                    <span
                      className={`badge status ${item.status.toLowerCase()}`}
                    >
                      {item.status}
                    </span>
                  </td>
                  {/* <td>
                    <div>
                      <span>{item.typeName}</span>
                    </div>
                  </td>
                  <td>{item.barcode}</td> 
                  <td>{item.group}</td>
                 
                  <td>{item.stQty}</td>
                  <td>{item.life}</td>*/}
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
              ))}
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

export default ItemMaster;
