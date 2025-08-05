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
    "bomMaster",
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
    vendorMaster: "Business Partner",
    itemMaster: "Item Master",
    warehouseMaster: "Warehouse Master",
    bom: "BOM Master",
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
      <div className="modal" tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Modal title</h5>
              <button
                type="button"
                className="btn"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <p>Modal body text goes here.</p>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Close
              </button>
              <button type="button" className="btn btn-primary">
                Save changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddUserModal;
