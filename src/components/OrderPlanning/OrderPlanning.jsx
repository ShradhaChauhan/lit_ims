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
  FaCalendarAlt,
  FaWarehouse,
  FaIndustry,
  FaChartLine,
} from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import api from "../../services/api";
import exportToExcel from "../../utils/exportToExcel";
import "./OrderPlanning.css";

const OrderPlanning = () => {
  // State for active tab
  const [activeTab, setActiveTab] = useState("planning");

  // State for search and filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    warehouse: "",
    productionLine: "",
    itemType: "",
    dateRange: "month",
  });

  // State for planning data
  const [planningData, setPlanningData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  // State for form data
  const [formData, setFormData] = useState({
    planDate: new Date(),
    itemId: "",
    itemName: "",
    targetQuantity: "",
    warehouseId: "",
    productionLine: "",
    notes: "",
  });

  // State for modal
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPlanId, setCurrentPlanId] = useState(null);

  // State for reports
  const [reportType, setReportType] = useState("monthly");
  const [reportDate, setReportDate] = useState(new Date());
  const [reportData, setReportData] = useState([]);

  // State for warehouses, items, and production lines (would come from API)
  const [warehouses, setWarehouses] = useState([]);
  const [items, setItems] = useState([]);
  const [productionLines, setProductionLines] = useState([]);

  // Mock data for demonstration
  useEffect(() => {
    // Mock warehouses
    setWarehouses([
      { id: "W1", name: "Main Production Facility" },
      { id: "W2", name: "Secondary Production Facility" },
      { id: "W3", name: "Assembly Warehouse" },
    ]);

    // Mock items
    setItems([
      { id: "I1", name: "Product A", type: "Finished Good" },
      { id: "I2", name: "Product B", type: "Finished Good" },
      { id: "I3", name: "Component X", type: "Component" },
      { id: "I4", name: "Component Y", type: "Component" },
    ]);

    // Mock production lines
    setProductionLines([
      { id: "L1", name: "Line 1" },
      { id: "L2", name: "Line 2" },
      { id: "L3", name: "Line 3" },
      { id: "L4", name: "Assembly Line" },
    ]);

    // Mock planning data
    const mockPlanningData = [
      {
        id: "P1",
        planDate: new Date(2024, 3, 15),
        itemId: "I1",
        itemName: "Product A",
        itemType: "Finished Good",
        targetQuantity: 500,
        warehouseId: "W1",
        warehouseName: "Main Production Facility",
        productionLine: "L1",
        productionLineName: "Line 1",
        actualQuantity: 480,
        status: "Completed",
        variance: -20,
        notes: "Regular production run",
      },
      {
        id: "P2",
        planDate: new Date(2024, 3, 16),
        itemId: "I2",
        itemName: "Product B",
        itemType: "Finished Good",
        targetQuantity: 300,
        warehouseId: "W2",
        warehouseName: "Secondary Production Facility",
        productionLine: "L2",
        productionLineName: "Line 2",
        actualQuantity: 320,
        status: "Completed",
        variance: 20,
        notes: "Increased production due to high demand",
      },
      {
        id: "P3",
        planDate: new Date(2024, 3, 17),
        itemId: "I3",
        itemName: "Component X",
        itemType: "Component",
        targetQuantity: 1000,
        warehouseId: "W1",
        warehouseName: "Main Production Facility",
        productionLine: "L3",
        productionLineName: "Line 3",
        actualQuantity: 950,
        status: "Completed",
        variance: -50,
        notes: "Machine downtime for 1 hour",
      },
      {
        id: "P4",
        planDate: new Date(2024, 3, 18),
        itemId: "I4",
        itemName: "Component Y",
        itemType: "Component",
        targetQuantity: 800,
        warehouseId: "W3",
        warehouseName: "Assembly Warehouse",
        productionLine: "L4",
        productionLineName: "Assembly Line",
        actualQuantity: 0,
        status: "Pending",
        variance: 0,
        notes: "Scheduled production",
      },
    ];

    setPlanningData(mockPlanningData);
    setFilteredData(mockPlanningData);

    // Mock report data
    const mockReportData = [
      {
        month: "April 2024",
        itemId: "I1",
        itemName: "Product A",
        planned: 5000,
        actual: 4800,
        variance: -200,
        status: "Underproduced",
      },
      {
        month: "April 2024",
        itemId: "I2",
        itemName: "Product B",
        planned: 3000,
        actual: 3200,
        variance: 200,
        status: "Overproduced",
      },
      {
        month: "April 2024",
        itemId: "I3",
        itemName: "Component X",
        planned: 10000,
        actual: 9500,
        variance: -500,
        status: "Underproduced",
      },
      {
        month: "April 2024",
        itemId: "I4",
        itemName: "Component Y",
        planned: 8000,
        actual: 8200,
        variance: 200,
        status: "Overproduced",
      },
    ];

    setReportData(mockReportData);
  }, []);

  // Filter data when search term or filters change
  useEffect(() => {
    let filtered = [...planningData];

    // Apply search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.itemName.toLowerCase().includes(search) ||
          item.warehouseName.toLowerCase().includes(search) ||
          item.productionLineName.toLowerCase().includes(search) ||
          item.notes.toLowerCase().includes(search)
      );
    }

    // Apply filters
    if (filters.warehouse) {
      filtered = filtered.filter(
        (item) => item.warehouseId === filters.warehouse
      );
    }

    if (filters.productionLine) {
      filtered = filtered.filter(
        (item) => item.productionLine === filters.productionLine
      );
    }

    if (filters.itemType) {
      filtered = filtered.filter((item) => item.itemType === filters.itemType);
    }

    // Apply date range filter
    if (filters.dateRange === "today") {
      const today = new Date();
      filtered = filtered.filter(
        (item) =>
          item.planDate.getDate() === today.getDate() &&
          item.planDate.getMonth() === today.getMonth() &&
          item.planDate.getFullYear() === today.getFullYear()
      );
    } else if (filters.dateRange === "week") {
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      filtered = filtered.filter(
        (item) => item.planDate >= startOfWeek && item.planDate <= endOfWeek
      );
    } else if (filters.dateRange === "month") {
      const today = new Date();
      filtered = filtered.filter(
        (item) =>
          item.planDate.getMonth() === today.getMonth() &&
          item.planDate.getFullYear() === today.getFullYear()
      );
    }

    setFilteredData(filtered);
  }, [searchTerm, filters, planningData]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle date change
  const handleDateChange = (date) => {
    setFormData((prev) => ({ ...prev, planDate: date }));
  };

  // Handle report date change
  const handleReportDateChange = (date) => {
    setReportDate(date);
    // In a real app, this would trigger an API call to get report data for the selected date
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      warehouse: "",
      productionLine: "",
      itemType: "",
      dateRange: "month",
    });
    setSearchTerm("");
  };

  // Handle modal open for adding new plan
  const handleAddPlan = () => {
    setIsEditing(false);
    setFormData({
      planDate: new Date(),
      itemId: "",
      itemName: "",
      targetQuantity: "",
      warehouseId: "",
      productionLine: "",
      notes: "",
    });
    setShowModal(true);
  };

  // Handle modal open for editing existing plan
  const handleEditPlan = (plan) => {
    setIsEditing(true);
    setCurrentPlanId(plan.id);
    setFormData({
      planDate: plan.planDate,
      itemId: plan.itemId,
      itemName: plan.itemName,
      targetQuantity: plan.targetQuantity,
      warehouseId: plan.warehouseId,
      productionLine: plan.productionLine,
      notes: plan.notes,
    });
    setShowModal(true);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate form
    if (
      !formData.itemId ||
      !formData.targetQuantity ||
      !formData.warehouseId ||
      !formData.productionLine
    ) {
      alert("Please fill all required fields");
      return;
    }

    // Get item details
    const selectedItem = items.find((item) => item.itemId === formData.itemId);
    const selectedWarehouse = warehouses.find(
      (wh) => wh.id === formData.warehouseId
    );
    const selectedLine = productionLines.find(
      (line) => line.id === formData.productionLine
    );

    if (isEditing) {
      // Update existing plan
      const updatedData = planningData.map((plan) => {
        if (plan.id === currentPlanId) {
          return {
            ...plan,
            planDate: formData.planDate,
            itemId: formData.itemId,
            itemName: selectedItem?.name || formData.itemName,
            targetQuantity: Number(formData.targetQuantity),
            warehouseId: formData.warehouseId,
            warehouseName: selectedWarehouse?.name || "",
            productionLine: formData.productionLine,
            productionLineName: selectedLine?.name || "",
            notes: formData.notes,
          };
        }
        return plan;
      });

      setPlanningData(updatedData);
    } else {
      // Add new plan
      const newPlan = {
        id: `P${planningData.length + 1}`,
        planDate: formData.planDate,
        itemId: formData.itemId,
        itemName: items.find((item) => item.id === formData.itemId)?.name || "",
        itemType: items.find((item) => item.id === formData.itemId)?.type || "",
        targetQuantity: Number(formData.targetQuantity),
        warehouseId: formData.warehouseId,
        warehouseName:
          warehouses.find((wh) => wh.id === formData.warehouseId)?.name || "",
        productionLine: formData.productionLine,
        productionLineName:
          productionLines.find((line) => line.id === formData.productionLine)
            ?.name || "",
        actualQuantity: 0,
        status: "Pending",
        variance: 0,
        notes: formData.notes,
      };

      setPlanningData([...planningData, newPlan]);
    }

    // Close modal
    setShowModal(false);
  };

  // Handle delete plan
  const handleDeletePlan = (planId) => {
    if (
      window.confirm("Are you sure you want to delete this production plan?")
    ) {
      const updatedData = planningData.filter((plan) => plan.id !== planId);
      setPlanningData(updatedData);
    }
  };

  // Handle export to Excel
  const handleExport = () => {
    if (activeTab === "planning") {
      exportToExcel(filteredData, "Production_Planning");
    } else {
      exportToExcel(reportData, "Production_Report");
    }
  };

  // Handle item selection
  const handleItemSelection = (e) => {
    const itemId = e.target.value;
    const selectedItem = items.find((item) => item.id === itemId);
    setFormData((prev) => ({
      ...prev,
      itemId,
      itemName: selectedItem?.name || "",
    }));
  };

  // Render planning table
  const renderPlanningTable = () => (
    <div className="table-responsive">
      <Table hover className="align-middle">
        <thead>
          <tr>
            <th>Date</th>
            <th>Item</th>
            <th>Warehouse</th>
            <th>Production Line</th>
            <th>Target Qty</th>
            <th>Actual Qty</th>
            <th>Variance</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.length > 0 ? (
            filteredData.map((plan) => (
              <tr key={plan.id}>
                <td>{plan.planDate.toLocaleDateString()}</td>
                <td>
                  <div>{plan.itemName}</div>
                  <small className="text-muted">{plan.itemType}</small>
                </td>
                <td>{plan.warehouseName}</td>
                <td>{plan.productionLineName}</td>
                <td>{plan.targetQuantity.toLocaleString()}</td>
                <td>{plan.actualQuantity.toLocaleString()}</td>
                <td>
                  <span
                    className={
                      plan.variance < 0
                        ? "text-danger"
                        : plan.variance > 0
                        ? "text-success"
                        : ""
                    }
                  >
                    {plan.variance > 0 ? "+" : ""}
                    {plan.variance.toLocaleString()}
                  </span>
                </td>
                <td>
                  <Badge
                    bg={
                      plan.status === "Completed"
                        ? plan.variance < 0
                          ? "danger"
                          : plan.variance > 0
                          ? "success"
                          : "primary"
                        : "secondary"
                    }
                  >
                    {plan.status}
                  </Badge>
                </td>
                <td>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="me-1"
                    onClick={() => handleEditPlan(plan)}
                  >
                    <FaEdit />
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDeletePlan(plan.id)}
                  >
                    <FaTrash />
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="9" className="text-center py-3">
                No production plans found
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );

  // Render report table
  const renderReportTable = () => (
    <div className="table-responsive">
      <Table hover className="align-middle">
        <thead>
          <tr>
            <th>Period</th>
            <th>Item</th>
            <th>Planned Qty</th>
            <th>Actual Qty</th>
            <th>Variance</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {reportData.length > 0 ? (
            reportData.map((report, index) => (
              <tr key={index}>
                <td>{report.month}</td>
                <td>{report.itemName}</td>
                <td>{report.planned.toLocaleString()}</td>
                <td>{report.actual.toLocaleString()}</td>
                <td>
                  <span
                    className={
                      report.variance < 0
                        ? "text-danger"
                        : report.variance > 0
                        ? "text-success"
                        : ""
                    }
                  >
                    {report.variance > 0 ? "+" : ""}
                    {report.variance.toLocaleString()}
                  </span>
                </td>
                <td>
                  <Badge
                    bg={
                      report.status === "Underproduced" ? "danger" : "success"
                    }
                  >
                    {report.status}
                  </Badge>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center py-3">
                No report data found
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );

  return (
    <div className="order-planning-container">
      {/* Header section */}
      <nav className="navbar bg-light border-body" data-bs-theme="light">
        <div className="container-fluid">
          <div className="mt-4">
            <h3 className="nav-header header-style">Order Planning</h3>
            <p className="breadcrumb">
              <Link to="/dashboard">
                <i className="fas fa-home text-8"></i>
              </Link>{" "}
              <span className="ms-1 mt-1 text-small-gray">
                / Order Planning
              </span>
            </p>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <Container fluid>
        {/* Tabs */}
        <Card className="mb-4 shadow-sm border-0">
          <Card.Body>
            <Nav
              variant="tabs"
              className="mb-3"
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k)}
            >
              <Nav.Item>
                <Nav.Link eventKey="planning">
                  <FaCalendarAlt className="me-1" /> Production Planning
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="report">
                  <FaChartLine className="me-1" /> Monthly Report
                </Nav.Link>
              </Nav.Item>
            </Nav>

            {/* Planning Tab Content */}
            {activeTab === "planning" && (
              <>
                <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
                  <div className="d-flex flex-wrap gap-2 mb-2 mb-md-0">
                    <Form.Select
                      size="sm"
                      name="dateRange"
                      className="text-8"
                      value={filters.dateRange}
                      onChange={handleFilterChange}
                      style={{ width: "120px" }}
                    >
                      <option value="month">This Month</option>
                      <option value="week">This Week</option>
                      <option value="today">Today</option>
                    </Form.Select>
                    <Form.Select
                      size="sm"
                      className="text-8"
                      name="warehouse"
                      value={filters.warehouse}
                      onChange={handleFilterChange}
                      style={{ width: "200px" }}
                    >
                      <option value="">All Warehouses</option>
                      {warehouses.map((warehouse) => (
                        <option key={warehouse.id} value={warehouse.id}>
                          {warehouse.name}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Select
                      className="text-8"
                      size="sm"
                      name="productionLine"
                      value={filters.productionLine}
                      onChange={handleFilterChange}
                      style={{ width: "180px" }}
                    >
                      <option value="">All Production Lines</option>
                      {productionLines.map((line) => (
                        <option key={line.id} value={line.id}>
                          {line.name}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Select
                      size="sm"
                      className="text-8"
                      name="itemType"
                      value={filters.itemType}
                      onChange={handleFilterChange}
                      style={{ width: "150px" }}
                    >
                      <option value="">All Item Types</option>
                      <option value="Finished Good">Finished Good</option>
                      <option value="Component">Component</option>
                    </Form.Select>
                    <Button
                      className="text-8"
                      variant="outline-secondary"
                      size="sm"
                      onClick={handleResetFilters}
                    >
                      <i class="fa-solid fa-filter me-1"></i>Reset
                    </Button>
                  </div>
                  <div className="d-flex gap-2">
                    <InputGroup size="sm" style={{ width: "200px" }}>
                      <InputGroup.Text>
                        <FaSearch />
                      </InputGroup.Text>
                      <Form.Control
                        className="text-8"
                        type="search"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </InputGroup>
                    <Button
                      variant="outline-success"
                      className="text-8"
                      size="sm"
                      onClick={handleExport}
                    >
                      <FaFileExport /> Export
                    </Button>
                    <Button
                      variant="primary"
                      className="text-8"
                      size="sm"
                      onClick={handleAddPlan}
                    >
                      <FaPlus /> Add Plan
                    </Button>
                  </div>
                </div>

                {renderPlanningTable()}
              </>
            )}

            {/* Report Tab Content */}
            {activeTab === "report" && (
              <>
                <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
                  <div className="d-flex flex-wrap gap-2 mb-2 mb-md-0">
                    <Form.Select
                      size="sm"
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value)}
                      style={{ width: "120px" }}
                    >
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="yearly">Yearly</option>
                    </Form.Select>
                    <div className="d-flex align-items-center">
                      <DatePicker
                        selected={reportDate}
                        onChange={handleReportDateChange}
                        dateFormat={
                          reportType === "monthly"
                            ? "MM/yyyy"
                            : reportType === "quarterly"
                            ? "QQQ yyyy"
                            : "yyyy"
                        }
                        showMonthYearPicker={reportType === "monthly"}
                        showQuarterYearPicker={reportType === "quarterly"}
                        showYearPicker={reportType === "yearly"}
                        className="form-control form-control-sm"
                        style={{ width: "120px" }}
                      />
                    </div>
                  </div>
                  <div className="d-flex gap-2">
                    <InputGroup size="sm" style={{ width: "200px" }}>
                      <InputGroup.Text>
                        <FaSearch />
                      </InputGroup.Text>
                      <Form.Control
                        type="search"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </InputGroup>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={handleExport}
                    >
                      <FaFileExport /> Export
                    </Button>
                  </div>
                </div>

                {renderReportTable()}
              </>
            )}
          </Card.Body>
        </Card>
      </Container>

      {/* Add/Edit Plan Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i class="fa-solid fa-circle-info me-2"></i>
            {isEditing ? "Edit Production Plan" : "Add Production Plan"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="planDate">
                  <Form.Label className="text-8">Plan Date*</Form.Label>
                  <br />
                  <DatePicker
                    selected={formData.planDate}
                    onChange={handleDateChange}
                    className="form-control text-8"
                    dateFormat="dd/MM/yyyy"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="itemId">
                  <Form.Label className="text-8">Item*</Form.Label>
                  <Form.Select
                    name="itemId"
                    className="text-8"
                    value={formData.itemId}
                    onChange={handleItemSelection}
                    required
                  >
                    <option value="">Select Item</option>
                    {items.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} ({item.type})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="warehouseId">
                  <Form.Label className="text-8">
                    Production Warehouse*
                  </Form.Label>
                  <Form.Select
                    className="text-8"
                    name="warehouseId"
                    value={formData.warehouseId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Warehouse</option>
                    {warehouses.map((warehouse) => (
                      <option key={warehouse.id} value={warehouse.id}>
                        {warehouse.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="productionLine">
                  <Form.Label className="text-8">Production Line*</Form.Label>
                  <Form.Select
                    className="text-8"
                    name="productionLine"
                    value={formData.productionLine}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Production Line</option>
                    {productionLines.map((line) => (
                      <option key={line.id} value={line.id}>
                        {line.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="targetQuantity">
                  <Form.Label className="text-8">Target Quantity*</Form.Label>
                  <Form.Control
                    className="text-8"
                    type="number"
                    name="targetQuantity"
                    placeholder="Target Quantity"
                    value={formData.targetQuantity}
                    onChange={handleInputChange}
                    min="1"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="notes">
                  <Form.Label className="text-8">Notes</Form.Label>
                  <Form.Control
                    className="text-8"
                    as="textarea"
                    rows={2}
                    placeholder="Add notes..."
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            className="text-8"
            onClick={() => setShowModal(false)}
          >
            <i class="fa-solid fa-xmark me-2 text-8"></i>Cancel
          </Button>
          <Button variant="primary" className="text-8" onClick={handleSubmit}>
            <i class="fa-solid fa-floppy-disk me-2 text-8"></i>
            {isEditing ? "Update" : "Save"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default OrderPlanning;
