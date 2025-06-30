import React, { useContext, useState } from "react";
import "./VendorMaster.css";
import { AppContext } from "../../../context/AppContext";
import { Link } from "react-router-dom";

const VendorMaster = () => {
  const { isAddVendor, setIsAddVendor } = useContext(AppContext);
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [status, setStatus] = useState("active");
  const [isChecked, setIsChecked] = useState(true);
  const [formData, setFormData] = useState({
    type: "",
    name: "",
    mobile: "",
    email: "",
    city: "",
    state: "",
    pincode: "",
    address: "",
    status: "active",
  });

  const initialFormState = {
    type: "",
    name: "",
    mobile: "",
    email: "",
    city: "",
    state: "",
    pincode: "",
    address: "",
    status: "",
  };

  const handleAddPartner = (e) => {
    e.preventDefault();
    const finalData = {
      type: formData.type,
      name: formData.name,
      mobile: formData.mobile,
      email: formData.email,
      city: formData.city,
      state: formData.state,
      pincode: formData.pincode,
      address: formData.address,
      status: formData.status,
    };

    console.log("Submitting add partner form");
    fetch("", {
      method: "POST",
      body: finalData,
    }).then(function (response) {
      console.log(response);
      return response.json();
    });
    console.log("Form submitted. ", finalData);
  };

  const handleReset = (e) => {
    e.preventDefault();
    setFormData({
      type: "",
      name: "",
      mobile: "",
      email: "",
      city: "",
      state: "",
      pincode: "",
      address: "",
      status: "active",
    });
    setIsChecked(true);
    setStatus("active");
  };

  const handleVendorCheckboxChange = (vendorId) => {
    setSelectedVendors((prevSelected) =>
      prevSelected.includes(vendorId)
        ? prevSelected.filter((id) => id !== vendorId)
        : [...prevSelected, vendorId]
    );
  };

  const handleSelectAllChange = (e) => {
    const checked = e.target.checked;
    setSelectAll(checked);
    if (checked) {
      const allVendorIds = vendors.map((vendor) => vendor.id);
      setSelectedVendors(allVendorIds);
    } else {
      setSelectedVendors([]);
    }
  };

  const vendors = [
    {
      id: 1,
      name: "John Smith",
      type: "Vendor",
      mobile: "+1 234 567 890",
      email: "john@example.com",
      img: "https://ui-avatars.com/api/?name=John+Smith&size=32&background=2563eb&color=fff",
      city: "New York",
      pincode: "210250",
      status: "Active",
    },
    {
      id: 2,
      name: "Sarah Johnson",
      type: "Customer",
      mobile: "+1 234 567 891",
      email: "sarah@example.com",
      img: "https://ui-avatars.com/api/?name=John+Smith&size=32&background=2563eb&color=fff",
      city: "Los Angeles",
      pincode: "100201",
      status: "Inactive",
    },
  ];

  const handleSetIsAddVendor = (e) => {
    e.preventDefault();
    setIsAddVendor(true);
  };

  return (
    <div>
      {/* Header section */}
      <nav className="navbar bg-light border-body" data-bs-theme="light">
        <div className="container-fluid">
          <div className="mt-4">
            <h3 className="nav-header header-style">Business Partner</h3>
            <p className="breadcrumb">
              <Link to="/dashboard">
                <i className="fas fa-home text-8"></i>
              </Link>{" "}
              <span className="ms-1 mt-1 text-small-gray">
                / Masters / Business Partner
              </span>
            </p>
          </div>

          {/* Add Partner Button */}

          <button
            className="btn btn-primary add-btn"
            onClick={handleSetIsAddVendor}
          >
            <i className="fa-solid fa-user-plus"></i> Add New Partner
          </button>
        </div>
      </nav>

      {/* Search and Filter Section */}
      <div className="search-filter-container mx-2">
        <div className="search-box">
          <i className="fas fa-search position-absolute input-icon"></i>
          <input
            type="text"
            className="form-control vendor-search-bar"
            placeholder="Search by name, email, or city..."
          />
        </div>
        <div className="filter-options">
          <select className="filter-select">
            <option value="">All Types</option>
            <option value="vendor">Vendors Only</option>
            <option value="customer">Customers Only</option>
          </select>
          <select className="filter-select">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button className="filter-select">
            <i className="fas fa-filter me-2"></i>
            More Filters
          </button>
        </div>
      </div>

      {/* Form Header Section */}
      {isAddVendor && (
        <div className="table-form-container mx-2">
          <div className="form-header">
            <h2>
              <i className="fas fa-user-plus"></i> Add New Partner
            </h2>
            <button
              className="btn-close"
              onClick={() => setIsAddVendor(false)}
            ></button>
          </div>
          {/* Form Fields */}
          <form
            autoComplete="off"
            className="padding-2"
            onSubmit={handleAddPartner}
          >
            <div className="form-grid border-bottom pt-0">
              <div className="row form-style">
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="type" className="form-label ms-2">
                    Type
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-user-tag position-absolute input-icon"></i>
                    <select
                      className="form-control ps-5 ms-2 text-font"
                      id="type"
                      required
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({ ...formData, type: e.target.value })
                      }
                    >
                      <option value="" disabled hidden className="text-muted">
                        Select Type
                      </option>
                      <option value="vendor">Vendor</option>
                      <option value="customer">Customer</option>
                    </select>
                    <i className="fa-solid fa-angle-down position-absolute down-arrow-icon"></i>
                  </div>
                </div>
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="name" className="form-label  ms-2">
                    Name
                  </label>
                  <div className="position-relative w-100 ms-2">
                    <i className="fas fa-user position-absolute ps-2 input-icon"></i>
                    <input
                      type="text"
                      className="form-control ps-5 text-font"
                      id="name"
                      placeholder="Enter full name"
                      required
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="mobile" className="form-label  ms-2">
                    Mobile
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-phone position-absolute ps-2 input-icon"></i>
                    <input
                      type="tel"
                      className="form-control ps-5 ms-2 text-font"
                      id="mobile"
                      placeholder="Enter mobile number"
                      required
                      value={formData.mobile}
                      onChange={(e) =>
                        setFormData({ ...formData, mobile: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="row form-style">
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="email" className="form-label  ms-2">
                    Email
                  </label>
                  <div className="position-relative w-100">
                    <i className="fa-solid fa-envelope ps-2 position-absolute input-icon"></i>
                    <input
                      type="email"
                      className="form-control ps-5 ms-2 text-font"
                      id="email"
                      placeholder="Enter email address"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="city" className="form-label  ms-2">
                    City
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-city position-absolute ps-2 input-icon"></i>
                    <input
                      type="text"
                      className="form-control ps-5 ms-2 text-font"
                      id="city"
                      placeholder="Enter city"
                      required
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="state" className="form-label  ms-2">
                    State
                  </label>
                  <div className="position-relative w-100">
                    <i className="fa-solid fa-location-crosshairs ps-2 position-absolute input-icon"></i>
                    <input
                      type="text"
                      className="form-control ps-5 ms-2 text-font"
                      id="state"
                      placeholder="Enter state"
                      required
                      value={formData.state}
                      onChange={(e) =>
                        setFormData({ ...formData, state: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="row form-style">
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="pincode" className="form-label  ms-2">
                    Pincode
                  </label>
                  <div className="position-relative w-100">
                    <i className="fa-solid fa-map-pin ps-2 position-absolute input-icon"></i>
                    <input
                      type="text"
                      className="form-control ps-5 ms-2 text-font"
                      id="pincode"
                      placeholder="Enter pincode"
                      required
                      value={formData.pincode}
                      onChange={(e) =>
                        setFormData({ ...formData, pincode: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="address" className="form-label  ms-2">
                    Address
                  </label>
                  <div className="position-relative w-100">
                    <i className="fas fa-map-marker-alt ps-2 position-absolute input-icon"></i>
                    <textarea
                      type="text"
                      className="form-control pt-3 ps-5 ms-2 text-font"
                      id="address"
                      placeholder="Enter complete address"
                      required
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                    ></textarea>
                  </div>
                </div>
                <div className="col-4 d-flex flex-column form-group">
                  <label htmlFor="status" className="form-label ms-2">
                    Status
                  </label>
                  <div className="position-relative w-100 ms-2">
                    <div className="form-check form-switch position-absolute input-icon mt-1 padding-left-2">
                      <input
                        className="form-check-input text-font switch-style"
                        type="checkbox"
                        role="switch"
                        id="switchCheckChecked"
                        checked={isChecked}
                        onChange={(e) => {
                          const newStatus = e.target.checked
                            ? "active"
                            : "inactive";
                          setIsChecked(e.target.checked);
                          setStatus(newStatus);
                          setFormData({
                            ...formData,
                            status: newStatus,
                          });
                        }}
                      />

                      <label
                        className="form-check-label"
                        htmlFor="switchCheckChecked"
                      ></label>
                    </div>
                    <select
                      className="form-control text-font switch-padding"
                      id="status"
                      value={status}
                      onChange={(e) => {
                        const newStatus = e.target.value;
                        setStatus(newStatus);
                        setIsChecked(newStatus === "active");

                        setFormData((prev) => ({
                          ...prev,
                          status: newStatus,
                        }));
                      }}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                    <i className="fa-solid fa-angle-down position-absolute down-arrow-icon"></i>
                  </div>
                </div>
              </div>
            </div>
            <div className="form-actions">
              <button
                className="btn btn-primary border border-0 text-8 px-3 fw-medium py-2 me-3 float-end"
                onClick={handleAddPartner}
              >
                <i className="fa-solid fa-floppy-disk me-1"></i> Save Changes
              </button>
              <button
                className="btn btn-secondary border border-0 text-8 px-3 fw-medium py-2 bg-secondary me-3 float-end"
                onClick={handleReset}
              >
                <i className="fa-solid fa-arrows-rotate me-1"></i> Reset
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="margin-2 mx-2">
        {/* Table Section */}
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
                {selectedVendors.length} Selected
              </label>
            </div>
            <div className="bulk-actions">
              <button className="btn-action">
                <i className="fas fa-envelope"></i>
                Email Selected
              </button>
              <button className="btn-action btn-danger">
                <i className="fas fa-trash"></i>
                Delete Selected
              </button>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th className="checkbox-cell">
                  <input type="checkbox" id="select-all" />
                </th>
                <th>
                  Name <i className="fas fa-sort color-gray ms-2"></i>
                </th>
                <th>
                  Type <i className="fas fa-sort color-gray ms-2"></i>
                </th>
                <th>
                  Email <i className="fas fa-sort color-gray ms-2"></i>
                </th>
                <th>Mobile</th>
                <th>
                  City <i className="fas fa-sort color-gray ms-2"></i>
                </th>
                <th>Pincode</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((vendor) => (
                <tr key={vendor.id}>
                  <td className="checkbox-cell">
                    <input
                      type="checkbox"
                      checked={selectedVendors.includes(vendor.id)}
                      onChange={() => handleVendorCheckboxChange(vendor.id)}
                    />
                  </td>
                  <td>
                    <div className="user-info">
                      <img src={vendor.img} alt={vendor.name} />
                      <span>{vendor.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${vendor.type.toLowerCase()}`}>
                      {vendor.type}
                    </span>
                  </td>
                  <td>{vendor.email}</td>
                  <td>{vendor.mobile}</td>
                  <td>{vendor.city}</td>
                  <td>{vendor.pincode}</td>
                  <td>
                    <span
                      className={`badge status ${vendor.status.toLowerCase()}`}
                    >
                      {vendor.status}
                    </span>
                  </td>
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
              <button className="btn-page disabled">
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

export default VendorMaster;
