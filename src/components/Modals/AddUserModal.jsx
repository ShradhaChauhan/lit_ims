import React, { useState } from "react";

const AddUserModal = () => {
  const [accessModules, setAccessModules] = useState([]);

  const handleCheckboxChange = (e) => {
    const { id, checked } = e.target;

    setAccessModules((prev) =>
      checked ? [...prev, id] : prev.filter((item) => item !== id)
    );
  };

  const modules = [
    "vendorMaster",
    "itemMaster",
    "warehouseMaster",
    "bom",
    "typeMaster",
    "groupMaster",
    "partMaster",
    "incoming",
    "incomingMaster",
    "iqc",
    "requisition",
    "issueProduction",
    "requisitionReceipt",
    "productionReceipt",
    "wipReturn",
  ];

  const moduleLabels = {
    vendorMaster: "Vendor Master",
    itemMaster: "Item Master",
    warehouseMaster: "Warehouse Master",
    bom: "BOM",
    typeMaster: "Type Master",
    groupMaster: "Group Master",
    partMaster: "Part Master",
    incoming: "Incoming",
    incomingMaster: "Incoming Reprint",
    iqc: "IQC",
    requisition: "Requisition",
    issueProduction: "Issue Production",
    requisitionReceipt: "Requisition Receipt",
    productionReceipt: "Production Receipt",
    wipReturn: "WIP Return",
  };

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

              <ul
                className="dropdown-menu p-3"
                style={{ maxHeight: "300px", overflowY: "auto" }}
              >
                {modules.map((id) => (
                  <li key={id}>
                    <input
                      type="checkbox"
                      className="form-check-input me-2"
                      id={id}
                      checked={accessModules.includes(id)}
                      onChange={handleCheckboxChange}
                    />
                    <label htmlFor={id}>{moduleLabels[id]}</label>
                  </li>
                ))}
              </ul>

              {/* Selected Access Display */}
              {accessModules.length > 0 && (
                <div className="mt-2 ms-2 d-flex flex-wrap gap-2">
                  {accessModules.map((id, key) => (
                    <div>
                      <span key={id} className="badge bg-success">
                        {moduleLabels[id]}
                        {/* <button
                          type="button"
                          className="btn-close"
                          onClick={() => ""}
                        ></button> */}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddUserModal;
