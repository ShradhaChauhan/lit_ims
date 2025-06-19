import React, { useState } from "react";
import AddUserModal from "../Modals/AddUserModal";

const Users = () => {
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  const handleAddUser = () => {
    // Add User Logic
    setShowAddUserModal(true);
  };

  return (
    <div>
      <button className="btn btn-secondary m-3" onClick={handleAddUser}>
        Add User
      </button>

      {/* Add User Modal */}
      {showAddUserModal && (
        <div
          className="modal show fade d-block"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add User</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowAddUserModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <AddUserModal />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleAddUser}
                >
                  Save
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddUserModal(false)}
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

export default Users;
