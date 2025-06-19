import React from "react";

const VendorModal = ({ vendorName, showModal, setShowModal }) => {
  return (
    <div>
      {showModal && (
        <div
          className="modal show fade d-block"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{vendorName}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <table className="table">
                  <thead>
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">Name</th>
                      <th scope="col">Code</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Map the Vendors/Customers details here */}
                    <tr
                      className="tableRow"
                      onClick={() =>
                        handleShowVendorDetails(
                          "AV LABELS SOLUTION INDIA PRIVATE LIMITED"
                        )
                      }
                    >
                      <th scope="row">1</th>
                      <td>Speaker</td>
                      <td>0121</td>
                    </tr>
                    <tr
                      className="tableRow"
                      onClick={() =>
                        handleShowVendorDetails(
                          "SHENZHEN JPC TECHNOLOGY CO. LTD."
                        )
                      }
                    >
                      <th scope="row">2</th>
                      <td>Cable</td>
                      <td>0345</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorModal;
