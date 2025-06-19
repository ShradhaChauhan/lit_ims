import React, { useState } from "react";
import "./VendorMaster.css";
import VendorModal from "../../Modals/VendorModal";

const VendorMaster = () => {
  const [showModal, setShowModal] = useState(false);
  const [vendorName, setVendorName] = useState("");

  const handleShowVendorDetails = (name) => {
    setVendorName(name);
    setShowModal(true);
  };

  return (
    <div className="row">
      {/* Add User Form */}
      <div className="col-10">
        <form>
          <div className="row">
            <div className="col-6 d-flex align-items-center justify-content-center">
              <select
                className="form-select ms-2"
                aria-label="Type"
                defaultValue={"Type"}
              >
                <option disabled>Type</option>
                <option value="1">Vendor</option>
                <option value="2">Customer</option>
              </select>
            </div>
          </div>
          <div className="row">
            <div className="col-6 d-flex align-items-center justify-content-center mt-2">
              <input
                type="number"
                className="form-control ms-2"
                id="code"
                placeholder="Code"
              />
            </div>
            <div className="col-6 d-flex align-items-center justify-content-center mt-2">
              <input
                type="text"
                className="form-control ms-2"
                id="name"
                placeholder="Name"
              />
            </div>
          </div>
          <div className="row">
            <div className="col-6 d-flex align-items-center justify-content-center mt-2">
              <input
                type="text"
                className="form-control ms-2"
                id="add1"
                placeholder="Address 1"
              />
            </div>
            <div className="col-6 d-flex align-items-center justify-content-center mt-2">
              <input
                type="number"
                className="form-control ms-2"
                id="phoneNo"
                placeholder="Phone Number"
              />
            </div>
          </div>
          <div className="row">
            <div className="col-6 d-flex align-items-center justify-content-center mt-2">
              <input
                type="text"
                className="form-control ms-2"
                id="add2"
                placeholder="Address 2"
              />
            </div>
            <div className="col-6 d-flex align-items-center justify-content-center mt-2">
              <input
                type="email"
                className="form-control ms-2"
                id="email"
                placeholder="Email"
              />
            </div>
          </div>
          <button className="btn btn-secondary float-end mt-2">Save</button>
        </form>
      </div>
      {/* Table content */}
      <div>
        <div className="search-container col-4 mx-1 mt-2 position-relative">
          <input
            type="text"
            className="form-control search-input ps-5"
            placeholder="Search..."
          />
          <i className="fas fa-search search-icon position-absolute"></i>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Vendors</th>
            </tr>
          </thead>
          <tbody>
            {/* Map the Vendors/Customers data here */}
            <tr
              className="tableRow"
              onClick={() =>
                handleShowVendorDetails(
                  "AV LABELS SOLUTION INDIA PRIVATE LIMITED"
                )
              }
            >
              <th scope="row">1</th>
              <td>AV LABELS SOLUTION INDIA PRIVATE LIMITED</td>
            </tr>
            <tr
              className="tableRow"
              onClick={() =>
                handleShowVendorDetails("SHENZHEN JPC TECHNOLOGY CO. LTD.")
              }
            >
              <th scope="row">2</th>
              <td>SHENZHEN JPC TECHNOLOGY CO. LTD.</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Modal */}
      <VendorModal
        vendorName={vendorName}
        showModal={showModal}
        setShowModal={setShowModal}
      />
    </div>
  );
};

export default VendorMaster;
