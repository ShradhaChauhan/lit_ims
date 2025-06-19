import React from "react";

const AddUserModal = () => {
  return (
    <div>
      <form>
        <div className="row">
          <div className="col-6 d-flex align-items-center justify-content-center">
            <input
              type="text"
              className="form-control ms-2"
              id="userId"
              placeholder="User Name"
            />
          </div>
          <div className="col-6 d-flex align-items-center justify-content-center mt-2">
            <input
              type="password"
              className="form-control ms-2"
              id="password"
              placeholder="Password"
            />
          </div>
        </div>
        <div className="row">
          <div className="col-6 d-flex align-items-center justify-content-center mt-2">
            <input
              type="text"
              className="form-control ms-2"
              id="role"
              placeholder="Role"
              disabled
            />
          </div>
          <div className="col-6 d-flex align-items-center mt-2">
            <div className="dropdown col-12">
              <button
                className="btn btn-light dropdown-toggle ms-2"
                type="button"
                data-bs-toggle="dropdown"
              >
                Access
              </button>
              <ul className="dropdown-menu p-3">
                <li>
                  <input
                    type="checkbox"
                    className="form-check-input me-2"
                    id="vendorMaster"
                  />
                  <label htmlFor="vendorMaster">Vendor Master</label>
                </li>
                <li>
                  <input
                    type="checkbox"
                    className="form-check-input me-2"
                    id="itemMaster"
                  />
                  <label htmlFor="itemMaster">Item Master</label>
                </li>
                <li>
                  <input
                    type="checkbox"
                    className="form-check-input me-2"
                    id="warehouseMaster"
                  />
                  <label htmlFor="warehouseMaster">Warehouse Master</label>
                </li>
                <li>
                  <input
                    type="checkbox"
                    className="form-check-input me-2"
                    id="bom"
                  />
                  <label htmlFor="bom">BOM</label>
                </li>
                <li>
                  <input
                    type="checkbox"
                    className="form-check-input me-2"
                    id="typeMaster"
                  />
                  <label htmlFor="typeMaster">Type Master</label>
                </li>
                <li>
                  <input
                    type="checkbox"
                    className="form-check-input me-2"
                    id="groupMaster"
                  />
                  <label htmlFor="groupMaster">Group Master</label>
                </li>
                <li>
                  <input
                    type="checkbox"
                    className="form-check-input me-2"
                    id="partMaster"
                  />
                  <label htmlFor="partMaster">Part Master</label>
                </li>
                <li>
                  <input
                    type="checkbox"
                    className="form-check-input me-2"
                    id="incoming"
                  />
                  <label htmlFor="incoming">Incoming</label>
                </li>
                <li>
                  <input
                    type="checkbox"
                    className="form-check-input me-2"
                    id="incomingMaster"
                  />
                  <label htmlFor="incomingMaster">Incoming Reprint</label>
                </li>
                <li>
                  <input
                    type="checkbox"
                    className="form-check-input me-2"
                    id="iqc"
                  />
                  <label htmlFor="iqc">IQC</label>
                </li>
                <li>
                  <input
                    type="checkbox"
                    className="form-check-input me-2"
                    id="requisition"
                  />
                  <label htmlFor="requisition">Requisition</label>
                </li>{" "}
                <li>
                  <input
                    type="checkbox"
                    className="form-check-input me-2"
                    id="issueProduction"
                  />
                  <label htmlFor="issueProduction">Issue Production</label>
                </li>
                <li>
                  <input
                    type="checkbox"
                    className="form-check-input me-2"
                    id="requisitionReceipt"
                  />
                  <label htmlFor="requisitionReceipt">
                    Requisition Receipt
                  </label>
                </li>{" "}
                <li>
                  <input
                    type="checkbox"
                    className="form-check-input me-2"
                    id="productionReceipt"
                  />
                  <label htmlFor="productionReceipt">Production Receipt</label>
                </li>
                <li>
                  <input
                    type="checkbox"
                    className="form-check-input me-2"
                    id="wipReturn"
                  />
                  <label htmlFor="wipReturn">WIP Return</label>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddUserModal;
