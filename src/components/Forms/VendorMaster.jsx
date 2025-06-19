import React from "react";

const VendorMaster = () => {
  return (
    <div className="row">
      <div className="col-10">
        <form>
          <div className="row">
            <div className="col-6 d-flex align-items-center justify-content-center">
              <input
                type="text"
                className="form-control ms-2"
                id="type"
                placeholder="Type"
              />
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
        </form>
      </div>
      <div className="col-2">
        <div className="search-container mx-1 mt-2 position-relative">
          <input
            type="text"
            className="form-control search-input ps-5"
            placeholder="Search..."
          />
          <i className="fas fa-search search-icon position-absolute"></i>
        </div>
        <div></div>
      </div>
    </div>
  );
};

export default VendorMaster;
