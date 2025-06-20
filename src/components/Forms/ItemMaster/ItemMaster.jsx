import React from "react";
import ItemMasterModal from "../../Modals/ItemMasterModal";

const ItemMaster = () => {
  return (
    <div className="row">
      {/* Add Item Form */}
      <div className="col-md-10">
        <form>
          <div className="row">
            <div className="col-md-6 d-flex align-items-center justify-content-center mt-2">
              <input
                type="text"
                className="form-control ms-2"
                id="itemName"
                placeholder="Item Name"
              />
            </div>
            <div className="col-md-6 d-flex align-items-center justify-content-center mt-2">
              <input
                type="text"
                className="form-control ms-2"
                id="itemCode"
                placeholder="Item Code"
              />
            </div>
          </div>
          <div className="row">
            <div className="col-md-6 d-flex align-items-center justify-content-center mt-2">
              <select
                className="form-select ms-2"
                aria-label="UOM"
                defaultValue={"UOM"}
              >
                <option disabled>UOM</option>
                <option value="1">Pcs.</option>
                <option value="2">Kg</option>
              </select>
            </div>
            <div className="col-md-6 d-flex align-items-center justify-content-center mt-2">
              <select
                className="form-select ms-2"
                aria-label="Type Name"
                defaultValue={"Type Name"}
              >
                <option disabled>Type Name</option>
                <option value="1">A Type</option>
                <option value="2">B Type</option>
                <option value="2">C Type</option>
              </select>
            </div>
          </div>
          <div className="row">
            <div className="col-md-6 d-flex align-items-center justify-content-center mt-2">
              <input
                type="number"
                className="form-control ms-2"
                id="barcode"
                placeholder="Barcode"
              />
            </div>
            <div className="col-md-6 d-flex align-items-center justify-content-center mt-2">
              <select
                className="form-select ms-2"
                aria-label="Group"
                defaultValue={"Group"}
              >
                <option disabled>Group</option>
                <option value="1">30502-IC</option>
                <option value="2">STICKER</option>
                <option value="2">IR LED</option>
                <option value="2">CRYSTAL</option>
              </select>
            </div>
          </div>
          <div className="row">
            <div className="col-md-6 d-flex align-items-center justify-content-center mt-2">
              <select
                className="form-select ms-2"
                aria-label="Status"
                defaultValue={"Status"}
              >
                <option disabled>Status</option>
                <option value="1">Yes</option>
                <option value="2">No</option>
              </select>
            </div>
            <div className="col-md-6 d-flex align-items-center justify-content-center mt-2">
              <input
                type="number"
                className="form-control ms-2"
                id="price"
                placeholder="Price"
              />
            </div>
          </div>
          <div className="row">
            <div className="col-md-6 d-flex align-items-center justify-content-center mt-2">
              <select
                className="form-select ms-2"
                aria-label="ST QTY"
                defaultValue={"ST QTY"}
              >
                <option disabled>ST QTY</option>
                <option value="1">SMT</option>
                <option value="2">MI</option>
                <option value="3">Assembly</option>
                <option value="4">Moulding</option>
              </select>
            </div>
            <div className="col-md-6 d-flex align-items-center justify-content-center mt-2">
              <input
                type="number"
                className="form-control ms-2"
                id="life"
                placeholder="Life (In Days)"
              />
            </div>
          </div>
          <button className="btn btn-secondary float-end mt-2">Save</button>
        </form>
      </div>
      {/* Table content */}
      <div>
        <div className="row">
          <div className="col-md-4">
            <input
              className="form-control"
              type="text"
              id="itemName"
              placeholder="Item Name"
            />
          </div>
          <div className="col-md-4">
            <input
              className="form-control"
              type="text"
              id="itemCode"
              placeholder="Item Code"
            />
          </div>
          <div className="col-md-4 search-container">
            <input
              type="text"
              className="form-control search-input ps-5"
              placeholder="Search..."
            />
            <i className="fas fa-search search-icon position-absolute"></i>
          </div>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Code</th>
              <th scope="col">Item Name</th>
              <th scope="col">Item Code</th>
              <th scope="col">Status</th>
              <th scope="col">Group</th>
              <th scope="col">Type Name</th>
              <th scope="col">Barcode</th>
              <th scope="col">UOM</th>
            </tr>
          </thead>
          <tbody>
            {/* Map the Vendors/Customers data here */}
            <tr className="tableRow">
              <th scope="row">1</th>
              <td>213165</td>
              <td>Marker</td>
              <td>0120</td>
              <td>Yes</td>
              <td>Marker Set</td>
              <td>Marker</td>
              <td>025846</td>
              <td>Pcs.</td>
            </tr>
            <tr className="tableRow">
              <th scope="row">2</th>
              <td>SHENZHEN JPC TECHNOLOGY CO. LTD.</td>
              <td>AV LABELS SOLUTION INDIA PRIVATE LIMITED</td>
              <td>AV LABELS SOLUTION INDIA PRIVATE LIMITED</td>
              <td>AV LABELS SOLUTION INDIA PRIVATE LIMITED</td>
              <td>AV LABELS SOLUTION INDIA PRIVATE LIMITED</td>
              <td>AV LABELS SOLUTION INDIA PRIVATE LIMITED</td>
              <td>AV LABELS SOLUTION INDIA PRIVATE LIMITED</td>
              <td>AV LABELS SOLUTION INDIA PRIVATE LIMITED</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <ItemMasterModal />
    </div>
  );
};

export default ItemMaster;
