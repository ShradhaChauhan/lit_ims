import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Table,
  Nav,
  Tab,
  Badge,
  Modal,
  InputGroup,
  Alert,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import {
  FaSearch,
  FaFilter,
  FaFileExport,
  FaPlus,
  FaEdit,
  FaTrash,
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaChartBar,
} from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import api from "../../services/api";
import exportToExcel from "../../utils/exportToExcel";
import "./VendorRating.css";

const VendorRating = () => {
  // State for active tab
  const [activeTab, setActiveTab] = useState("ratings");

  // State for search and filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    rating: "",
    dateRange: "month",
  });

  // State for vendors data
  const [vendorsData, setVendorsData] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State for rating form
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [ratingFormData, setRatingFormData] = useState({
    vendorId: "",
    vendorName: "",
    qualityRating: 0,
    deliveryRating: 0,
    priceRating: 0,
    serviceRating: 0,
    comments: "",
    date: new Date(),
  });

  // State for edit mode
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentRatingId, setCurrentRatingId] = useState(null);

  // Mock data for demonstration
  const mockVendors = [
    {
      id: 1,
      name: "ABC Suppliers",
      category: "Raw Materials",
      contactPerson: "John Doe",
      phone: "123-456-7890",
      email: "john@abcsuppliers.com",
      qualityRating: 4.5,
      deliveryRating: 4.0,
      priceRating: 3.5,
      serviceRating: 4.2,
      overallRating: 4.05,
      lastRated: "2024-03-15",
    },
    {
      id: 2,
      name: "XYZ Manufacturing",
      category: "Components",
      contactPerson: "Jane Smith",
      phone: "987-654-3210",
      email: "jane@xyzmanufacturing.com",
      qualityRating: 3.8,
      deliveryRating: 4.2,
      priceRating: 4.5,
      serviceRating: 3.9,
      overallRating: 4.1,
      lastRated: "2024-03-10",
    },
    {
      id: 3,
      name: "Global Packaging",
      category: "Packaging",
      contactPerson: "Robert Johnson",
      phone: "555-123-4567",
      email: "robert@globalpackaging.com",
      qualityRating: 3.2,
      deliveryRating: 3.5,
      priceRating: 4.8,
      serviceRating: 3.7,
      overallRating: 3.8,
      lastRated: "2024-03-05",
    },
    {
      id: 4,
      name: "Tech Solutions Inc",
      category: "Electronics",
      contactPerson: "Sarah Williams",
      phone: "777-888-9999",
      email: "sarah@techsolutions.com",
      qualityRating: 4.9,
      deliveryRating: 4.7,
      priceRating: 3.2,
      serviceRating: 4.5,
      overallRating: 4.33,
      lastRated: "2024-03-01",
    },
    {
      id: 5,
      name: "Precision Parts",
      category: "Components",
      contactPerson: "Michael Brown",
      phone: "222-333-4444",
      email: "michael@precisionparts.com",
      qualityRating: 4.2,
      deliveryRating: 3.8,
      priceRating: 4.0,
      serviceRating: 4.3,
      overallRating: 4.08,
      lastRated: "2024-02-28",
    },
    {
      id: 6,
      name: "Reliable Electronics",
      category: "Electronics",
      contactPerson: "Emily Chen",
      phone: "444-555-6666",
      email: "emily@reliableelectronics.com",
      qualityRating: 4.7,
      deliveryRating: 4.5,
      priceRating: 3.8,
      serviceRating: 4.6,
      overallRating: 4.4,
      lastRated: "2024-03-12",
    },
    {
      id: 7,
      name: "Quality Metals Ltd",
      category: "Raw Materials",
      contactPerson: "David Wilson",
      phone: "666-777-8888",
      email: "david@qualitymetals.com",
      qualityRating: 4.8,
      deliveryRating: 4.3,
      priceRating: 3.9,
      serviceRating: 4.4,
      overallRating: 4.35,
      lastRated: "2024-03-08",
    },
    {
      id: 8,
      name: "Smart Packaging Solutions",
      category: "Packaging",
      contactPerson: "Lisa Anderson",
      phone: "888-999-0000",
      email: "lisa@smartpackaging.com",
      qualityRating: 4.1,
      deliveryRating: 4.4,
      priceRating: 4.2,
      serviceRating: 4.3,
      overallRating: 4.25,
      lastRated: "2024-03-03",
    },
    {
      id: 9,
      name: "Industrial Services Co",
      category: "Services",
      contactPerson: "Mark Thompson",
      phone: "111-222-3333",
      email: "mark@industrialservices.com",
      qualityRating: 4.3,
      deliveryRating: 4.6,
      priceRating: 4.1,
      serviceRating: 4.8,
      overallRating: 4.45,
      lastRated: "2024-02-25",
    },
    {
      id: 10,
      name: "Green Materials Inc",
      category: "Raw Materials",
      contactPerson: "Rachel Green",
      phone: "333-444-5555",
      email: "rachel@greenmaterials.com",
      qualityRating: 4.6,
      deliveryRating: 4.1,
      priceRating: 3.7,
      serviceRating: 4.4,
      overallRating: 4.2,
      lastRated: "2024-03-14",
    },
    {
      id: 11,
      name: "Circuit Masters",
      category: "Electronics",
      contactPerson: "Alan Zhang",
      phone: "555-666-7777",
      email: "alan@circuitmasters.com",
      qualityRating: 4.4,
      deliveryRating: 4.2,
      priceRating: 3.9,
      serviceRating: 4.5,
      overallRating: 4.25,
      lastRated: "2024-03-07",
    },
    {
      id: 12,
      name: "Premium Components",
      category: "Components",
      contactPerson: "Sophie Martinez",
      phone: "777-888-9999",
      email: "sophie@premiumcomponents.com",
      qualityRating: 4.5,
      deliveryRating: 4.3,
      priceRating: 3.8,
      serviceRating: 4.6,
      overallRating: 4.3,
      lastRated: "2024-03-11",
    },
    {
      id: 13,
      name: "Eco Packaging Ltd",
      category: "Packaging",
      contactPerson: "Tom Baker",
      phone: "999-000-1111",
      email: "tom@ecopackaging.com",
      qualityRating: 4.2,
      deliveryRating: 4.0,
      priceRating: 4.3,
      serviceRating: 4.1,
      overallRating: 4.15,
      lastRated: "2024-03-09",
    },
    {
      id: 14,
      name: "Maintenance Pro",
      category: "Services",
      contactPerson: "James Wilson",
      phone: "222-333-4444",
      email: "james@maintenancepro.com",
      qualityRating: 4.7,
      deliveryRating: 4.8,
      priceRating: 4.0,
      serviceRating: 4.9,
      overallRating: 4.6,
      lastRated: "2024-03-13",
    },
    {
      id: 15,
      name: "Advanced Materials",
      category: "Raw Materials",
      contactPerson: "Patricia Lee",
      phone: "444-555-6666",
      email: "patricia@advancedmaterials.com",
      qualityRating: 4.3,
      deliveryRating: 4.4,
      priceRating: 4.2,
      serviceRating: 4.3,
      overallRating: 4.3,
      lastRated: "2024-03-06",
    },
  ];

  // Categories for filter
  const categories = [
    "Raw Materials",
    "Components",
    "Packaging",
    "Electronics",
    "Services",
  ];

  // Fetch vendors data
  useEffect(() => {
    // In a real application, you would fetch data from API
    // For now, using mock data
    setLoading(true);
    setVendorsData(mockVendors);
    setFilteredVendors(mockVendors);
    setLoading(false);
  }, []);

  // Filter vendors based on search term and filters
  useEffect(() => {
    if (!vendorsData.length) return;

    let filtered = [...vendorsData];

    try {
      // Apply search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filtered = filtered.filter(
          (vendor) =>
            vendor.name.toLowerCase().includes(searchLower) ||
            vendor.category.toLowerCase().includes(searchLower) ||
            vendor.contactPerson.toLowerCase().includes(searchLower)
        );
      }

      // Apply category filter
      if (filters.category) {
        filtered = filtered.filter(
          (vendor) => vendor.category === filters.category
        );
      }

      // Apply rating filter
      if (filters.rating) {
        const ratingValue = parseFloat(filters.rating);
        filtered = filtered.filter(
          (vendor) => vendor.overallRating >= ratingValue
        );
      }

      // Apply date range filter
      if (filters.dateRange) {
        const today = new Date();
        let startDate = new Date();

        switch (filters.dateRange) {
          case "week":
            startDate.setDate(today.getDate() - 7);
            break;
          case "month":
            startDate.setMonth(today.getMonth() - 1);
            break;
          case "quarter":
            startDate.setMonth(today.getMonth() - 3);
            break;
          case "year":
            startDate.setFullYear(today.getFullYear() - 1);
            break;
          default:
            startDate = null;
        }

        if (startDate) {
          filtered = filtered.filter((vendor) => {
            const lastRatedDate = new Date(vendor.lastRated);
            return lastRatedDate >= startDate;
          });
        }
      }

      console.log("Filtered vendors:", filtered); // Debug log
      setFilteredVendors(filtered);
    } catch (error) {
      console.error("Error in filtering:", error);
      setFilteredVendors(vendorsData); // Fallback to showing all vendors if filtering fails
    }
  }, [searchTerm, filters, vendorsData]);

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchTerm("");
    setFilters({
      category: "",
      rating: "",
      dateRange: "month",
    });
  };

  // Handle rating form submission
  const handleRatingSubmit = (e) => {
    e.preventDefault();

    // Calculate overall rating
    const { qualityRating, deliveryRating, priceRating, serviceRating } =
      ratingFormData;
    const overallRating = (
      (parseFloat(qualityRating) +
        parseFloat(deliveryRating) +
        parseFloat(priceRating) +
        parseFloat(serviceRating)) /
      4
    ).toFixed(2);

    // In a real application, you would save this to the database
    // For now, update the local state
    if (isEditMode && currentRatingId) {
      // Update existing rating
      setVendorsData((prevData) =>
        prevData.map((vendor) =>
          vendor.id === currentRatingId
            ? {
                ...vendor,
                qualityRating: parseFloat(qualityRating),
                deliveryRating: parseFloat(deliveryRating),
                priceRating: parseFloat(priceRating),
                serviceRating: parseFloat(serviceRating),
                overallRating: parseFloat(overallRating),
                lastRated: new Date().toISOString().split("T")[0],
              }
            : vendor
        )
      );
    } else {
      // This would be an API call in a real application
      console.log("Rating submitted:", { ...ratingFormData, overallRating });
    }

    // Reset form and close modal
    setRatingFormData({
      vendorId: "",
      vendorName: "",
      qualityRating: 0,
      deliveryRating: 0,
      priceRating: 0,
      serviceRating: 0,
      comments: "",
      date: new Date(),
    });
    setIsEditMode(false);
    setCurrentRatingId(null);
    setShowRatingForm(false);
  };

  // Open rating form for a specific vendor
  const handleRateVendor = (vendor) => {
    setRatingFormData({
      vendorId: vendor.id,
      vendorName: vendor.name,
      qualityRating: vendor.qualityRating || 0,
      deliveryRating: vendor.deliveryRating || 0,
      priceRating: vendor.priceRating || 0,
      serviceRating: vendor.serviceRating || 0,
      comments: "",
      date: new Date(),
    });
    setIsEditMode(true);
    setCurrentRatingId(vendor.id);
    setShowRatingForm(true);
  };

  // Open empty rating form
  const handleAddNewRating = () => {
    setRatingFormData({
      vendorId: "",
      vendorName: "",
      qualityRating: 0,
      deliveryRating: 0,
      priceRating: 0,
      serviceRating: 0,
      comments: "",
      date: new Date(),
    });
    setIsEditMode(false);
    setCurrentRatingId(null);
    setShowRatingForm(true);
  };

  // Handle form field changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setRatingFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Render star ratings
  const renderStarRating = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<FaStar key={i} className="text-warning" />);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<FaStarHalfAlt key={i} className="text-warning" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-warning" />);
      }
    }

    return <div className="d-flex">{stars}</div>;
  };

  // Export data to Excel
  const handleExportData = () => {
    exportToExcel(filteredVendors, "VendorRatings");
  };

  return (
    <div className="vendor-rating-container">
      {/* Header section */}
      <nav className="navbar bg-light border-body" data-bs-theme="light">
        <div className="container-fluid">
          <div className="mt-4">
            <h3 className="nav-header header-style">Vendor Rating</h3>
            <p className="breadcrumb">
              <Link to="/dashboard">
                <i className="fas fa-home text-8"></i>
              </Link>{" "}
              <span className="ms-1 mt-1 text-small-gray">/ Vendor Rating</span>
            </p>
          </div>

          {/* Add Rating Button */}
          <button
            className="btn btn-primary add-btn"
            onClick={handleAddNewRating}
          >
            <FaPlus className="me-1" /> Add New Rating
          </button>
        </div>
      </nav>

      {/* Tabs Navigation */}
      <div className="tabs-container mx-2 mt-3">
        <Nav variant="tabs" className="custom-tabs">
          <Nav.Item>
            <Nav.Link
              active={activeTab === "ratings"}
              onClick={() => setActiveTab("ratings")}
              className={activeTab === "ratings" ? "active-tab" : ""}
            >
              <FaStar className="me-2" /> Vendor Ratings
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              active={activeTab === "analytics"}
              onClick={() => setActiveTab("analytics")}
              className={activeTab === "analytics" ? "active-tab" : ""}
            >
              <FaChartBar className="me-2" /> Rating Analytics
            </Nav.Link>
          </Nav.Item>
        </Nav>
      </div>

      {/* Content based on active tab */}
      <div className="tab-content mx-2 mt-3">
        {activeTab === "ratings" && (
          <>
            {/* Search and Filter Section */}
            <div className="search-filter-container">
              <div className="search-box text-8">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  className="form-control vendor-search-bar"
                  placeholder="Search vendors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="filter-options">
                <select
                  className="filter-select text-8"
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                >
                  <option value="">All Categories</option>
                  {categories.map((category, index) => (
                    <option key={index} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <select
                  className="filter-select text-8"
                  name="rating"
                  value={filters.rating}
                  onChange={handleFilterChange}
                >
                  <option value="">All Ratings</option>
                  <option value="4.5">4.5+ Stars</option>
                  <option value="4">4+ Stars</option>
                  <option value="3.5">3.5+ Stars</option>
                  <option value="3">3+ Stars</option>
                </select>
                <select
                  className="filter-select text-8"
                  name="dateRange"
                  value={filters.dateRange}
                  onChange={handleFilterChange}
                >
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                  <option value="quarter">Last Quarter</option>
                  <option value="year">Last Year</option>
                </select>
                <button
                  className="filter-select text-8"
                  onClick={handleResetFilters}
                >
                  <FaFilter className="me-2" />
                  Reset Filters
                </button>
                <button
                  className="btn btn-outline-success text-8"
                  onClick={handleExportData}
                >
                  <FaFileExport className="me-1" />
                  Export Data
                </button>
              </div>
            </div>

            {/* Vendors Table */}
            <div className="table-container mt-3">
              {loading ? (
                <div className="text-center my-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-2">Loading vendor data...</p>
                </div>
              ) : error ? (
                <Alert variant="danger">{error}</Alert>
              ) : (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Vendor Name</th>
                      <th>Category</th>
                      <th>Contact Person</th>
                      <th>Quality</th>
                      <th>Delivery</th>
                      <th>Price</th>
                      <th>Service</th>
                      <th>Overall Rating</th>
                      <th>Last Rated</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="10" className="text-center py-4">
                          <div
                            className="spinner-border text-primary"
                            role="status"
                          >
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredVendors?.length === 0 ? (
                      <tr>
                        <td colSpan="10" className="text-center py-4">
                          No vendors found matching your criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredVendors.map((vendor) => (
                        <tr key={vendor.id}>
                          <td>{vendor.name}</td>
                          <td>{vendor.category}</td>
                          <td>
                            <div>{vendor.contactPerson}</div>
                            <div className="text-muted small">
                              {vendor.email}
                            </div>
                          </td>
                          <td>{renderStarRating(vendor.qualityRating)}</td>
                          <td>{renderStarRating(vendor.deliveryRating)}</td>
                          <td>{renderStarRating(vendor.priceRating)}</td>
                          <td>{renderStarRating(vendor.serviceRating)}</td>
                          <td>
                            <div className="d-flex align-items-center">
                              {renderStarRating(vendor.overallRating)}
                              <span className="ms-2 fw-bold">
                                {vendor.overallRating}
                              </span>
                            </div>
                          </td>
                          <td>{vendor.lastRated}</td>
                          <td className="actions">
                            <button
                              className="btn-icon btn-primary"
                              title="Rate Vendor"
                              onClick={() => handleRateVendor(vendor)}
                            >
                              <FaStar />
                            </button>
                            <button
                              className="btn-icon btn-success"
                              title="Edit"
                            >
                              <FaEdit />
                            </button>
                            <button
                              className="btn-icon btn-danger"
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {activeTab === "analytics" && (
          <div className="analytics-container">
            <div className="row">
              <div className="col-md-12 mb-4">
                <div className="card">
                  <div className="card-body">
                    <h5 className="card-title">Vendor Rating Analytics</h5>
                    <p className="card-text">
                      Analytics dashboard will be implemented here with charts
                      and graphs showing vendor performance trends, comparison
                      charts, and historical data.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Rating Form Modal */}
      <Modal
        show={showRatingForm}
        onHide={() => setShowRatingForm(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <i class="fa-solid fa-circle-info me-2"></i>
            {isEditMode ? "Update Vendor Rating" : "Add New Vendor Rating"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleRatingSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-8">Vendor Name</Form.Label>
                  {isEditMode ? (
                    <Form.Control
                      className="text-8"
                      type="text"
                      value={ratingFormData.vendorName}
                      readOnly
                    />
                  ) : (
                    <Form.Select
                      className="text-8"
                      name="vendorId"
                      value={ratingFormData.vendorId}
                      onChange={handleFormChange}
                      required
                    >
                      <option value="">Select Vendor</option>
                      {vendorsData.map((vendor) => (
                        <option key={vendor.id} value={vendor.id}>
                          {vendor.name}
                        </option>
                      ))}
                    </Form.Select>
                  )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="text-8">Rating Date</Form.Label>
                  <br />
                  <DatePicker
                    selected={ratingFormData.date}
                    onChange={(date) =>
                      setRatingFormData((prev) => ({ ...prev, date }))
                    }
                    className="form-control text-8"
                    dateFormat="yyyy-MM-dd"
                    maxDate={new Date()}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="text-8">Quality Rating</Form.Label>
                  <Form.Range
                    name="qualityRating"
                    min="0"
                    max="5"
                    step="0.5"
                    value={ratingFormData.qualityRating}
                    onChange={handleFormChange}
                  />
                  <div className="d-flex justify-content-between text-8">
                    <span>0</span>
                    <span className="fw-bold">
                      {ratingFormData.qualityRating}
                    </span>
                    <span>5</span>
                  </div>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="text-8">Delivery Rating</Form.Label>
                  <Form.Range
                    name="deliveryRating"
                    min="0"
                    max="5"
                    step="0.5"
                    value={ratingFormData.deliveryRating}
                    onChange={handleFormChange}
                  />
                  <div className="d-flex justify-content-between text-8">
                    <span>0</span>
                    <span className="fw-bold">
                      {ratingFormData.deliveryRating}
                    </span>
                    <span>5</span>
                  </div>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="text-8">Price Rating</Form.Label>
                  <Form.Range
                    name="priceRating"
                    min="0"
                    max="5"
                    step="0.5"
                    value={ratingFormData.priceRating}
                    onChange={handleFormChange}
                  />
                  <div className="d-flex justify-content-between text-8">
                    <span>0</span>
                    <span className="fw-bold">
                      {ratingFormData.priceRating}
                    </span>
                    <span>5</span>
                  </div>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="text-8">Service Rating</Form.Label>
                  <Form.Range
                    name="serviceRating"
                    min="0"
                    max="5"
                    step="0.5"
                    value={ratingFormData.serviceRating}
                    onChange={handleFormChange}
                  />
                  <div className="d-flex justify-content-between text-8">
                    <span>0</span>
                    <span className="fw-bold">
                      {ratingFormData.serviceRating}
                    </span>
                    <span>5</span>
                  </div>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label className="text-8">Comments</Form.Label>
              <Form.Control
                className="text-8"
                as="textarea"
                rows={3}
                name="comments"
                value={ratingFormData.comments}
                onChange={handleFormChange}
                placeholder="Add any comments about the vendor's performance..."
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            className="text-8"
            onClick={() => setShowRatingForm(false)}
          >
            <i class="fa-solid fa-xmark me-2"></i>Cancel
          </Button>
          <Button
            variant="primary"
            className="text-8"
            onClick={handleRatingSubmit}
          >
            <i class="fa-solid fa-floppy-disk me-2"></i>
            {isEditMode ? "Update Rating" : "Submit Rating"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default VendorRating;
