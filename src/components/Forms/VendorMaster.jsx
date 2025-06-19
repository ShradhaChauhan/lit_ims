import React from "react";

const VendorMaster = () => {
  return (
    <div>
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
            {/* <label htmlFor="code" className="form-label">
              Code
            </label> */}
            <input
              type="number"
              className="form-control ms-2"
              id="code"
              placeholder="Code"
            />
          </div>
          <div className="col-6 d-flex align-items-center justify-content-center mt-2">
            {/* <label htmlFor="name" className="form-label">
              Name
            </label> */}
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
            {/* <label htmlFor="add1" className="form-label">
              Add1
            </label> */}
            <input
              type="text"
              className="form-control ms-2"
              id="add1"
              placeholder="Address 1"
            />
          </div>
          <div className="col-6 d-flex align-items-center justify-content-center mt-2">
            {/* <label htmlFor="phoneNo" className="form-label">
              PhNo
            </label> */}
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
            {/* <label htmlFor="add2" className="form-label">
              Add2
            </label> */}
            <input
              type="text"
              className="form-control ms-2"
              id="add2"
              placeholder="Address 2"
            />
          </div>
          <div className="col-6 d-flex align-items-center justify-content-center mt-2">
            {/* <label htmlFor="email" className="form-label">
              Email
            </label> */}
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
  );
};

export default VendorMaster;
