import React, { useState } from "react";
import {
  Card,
  Row,
  Col,
  Modal,
  Form,
  InputGroup,
  Button,
  Table,
} from "react-bootstrap";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faFilter,
  faFileExport,
  faClipboardList,
  faClock,
  faDolly,
  faCheckCircle,
} from "@fortawesome/free-solid-svg-icons";
import exportToExcel from "../../../utils/exportToExcel";

const ProductionKpiCharts = () => {
  const [showModal, setShowModal] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [selectedKpi, setSelectedKpi] = useState(null);
  const [selectedMaterialView, setSelectedMaterialView] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const getFilteredMaterialRequests = () => {
    let filteredData = materialRequestsData.recentRequests;

    // Filter by view type
    if (selectedMaterialView === "pending_approval") {
      filteredData = filteredData.filter(
        (request) => request.status === "Pending"
      );
    } else if (selectedMaterialView === "pending_transfer") {
      filteredData = filteredData.filter(
        (request) => request.status === "Approved"
      );
    } else if (selectedMaterialView === "completed") {
      filteredData = filteredData.filter(
        (request) => request.status === "Completed"
      );
    }

    // Filter by search term
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filteredData = filteredData.filter((request) =>
        Object.values(request).some((val) =>
          val.toString().toLowerCase().includes(searchLower)
        )
      );
    }

    // Filter by date range
    if (dateRange.start) {
      filteredData = filteredData.filter(
        (request) => request.date >= dateRange.start
      );
    }
    if (dateRange.end) {
      filteredData = filteredData.filter(
        (request) => request.date <= dateRange.end
      );
    }

    return filteredData;
  };

  const resetPagination = () => {
    setCurrentPage(1);
  };

  const handleMaterialCardClick = (viewType) => {
    setSelectedMaterialView(viewType);
    setShowMaterialModal(true);
    resetPagination();
  };

  // Sample detailed data for each KPI - replace with actual API data
  const detailedData = {
    productionPercentage: [
      {
        id: 1,
        date: "2025-09-01",
        orderNo: "ORD001",
        planned: 100,
        achieved: 87,
        percentage: 87,
      },
      {
        id: 2,
        date: "2025-09-02",
        orderNo: "ORD002",
        planned: 150,
        achieved: 135,
        percentage: 90,
      },
      // Add more sample data
    ],
    activeOrders: [
      {
        id: 1,
        date: "2025-09-01",
        orderNo: "ORD003",
        status: "In Progress",
        product: "Item A",
        quantity: 100,
      },
      {
        id: 2,
        date: "2025-09-02",
        orderNo: "ORD004",
        status: "Pending",
        product: "Item B",
        quantity: 150,
      },
      // Add more sample data
    ],
    bomRatio: [
      {
        id: 1,
        date: "2025-09-01",
        orderNo: "ORD005",
        plannedComponents: 50,
        actualComponents: 48,
        matchPercentage: 96,
      },
      {
        id: 2,
        date: "2025-09-02",
        orderNo: "ORD006",
        plannedComponents: 75,
        actualComponents: 72,
        matchPercentage: 95,
      },
    ],
    // Add sample data for other KPIs
  };

  const handleCardClick = (kpiType) => {
    setSelectedKpi(kpiType);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedKpi(null);
    setSearchTerm("");
    setDateRange({ start: "", end: "" });
  };

  const handleExportToExcel = () => {
    const filteredData = getFilteredData();
    if (filteredData.length === 0) return;

    const sheetName =
      selectedKpi === "productionPercentage"
        ? "Production Rate"
        : selectedKpi === "activeOrders"
        ? "Active Orders"
        : selectedKpi === "scrapPercentage"
        ? "Scrap Rate"
        : selectedKpi === "reworkPercentage"
        ? "Rework Rate"
        : selectedKpi === "bomRatio"
        ? "BOM Ratio"
        : selectedKpi === "dispatchRate"
        ? "Dispatch Rate"
        : "KPI Details";

    exportToExcel(filteredData, sheetName);
  };

  const getFilteredData = () => {
    if (!selectedKpi) return [];

    let data = detailedData[selectedKpi] || [];

    if (searchTerm) {
      data = data.filter((item) =>
        Object.values(item).some((val) =>
          val.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (dateRange.start) {
      data = data.filter((item) => item.date >= dateRange.start);
    }

    if (dateRange.end) {
      data = data.filter((item) => item.date <= dateRange.end);
    }

    return data;
  };

  // Sample material requests data
  const materialRequestsData = {
    completedRequests: 25,
    pendingApproval: 12,
    pendingTransfer: 8,
    get totalRequests() {
      return (
        this.completedRequests + this.pendingApproval + this.pendingTransfer
      );
    },
    recentRequests: [
      // Pending Approval Requests (12)
      ...Array(12)
        .fill(null)
        .map((_, index) => ({
          id: index + 1,
          date: new Date(2025, 8, index + 1).toISOString().split("T")[0],
          requestNo: `MR${String(index + 1).padStart(3, "0")}`,
          itemName: `Raw Material ${String.fromCharCode(65 + (index % 26))}`,
          quantity: Math.floor(Math.random() * 100) + 50,
          status: "Pending",
          requestedBy: ["John Doe", "Jane Smith", "Mike Johnson"][index % 3],
        })),
      // Pending Transfer Requests (8)
      ...Array(8)
        .fill(null)
        .map((_, index) => ({
          id: index + 13,
          date: new Date(2025, 8, index + 1).toISOString().split("T")[0],
          requestNo: `MR${String(index + 13).padStart(3, "0")}`,
          itemName: `Raw Material ${String.fromCharCode(
            65 + ((index + 12) % 26)
          )}`,
          quantity: Math.floor(Math.random() * 100) + 50,
          status: "Approved",
          requestedBy: ["John Doe", "Jane Smith", "Mike Johnson"][index % 3],
        })),
      // Completed Requests (25)
      ...Array(25)
        .fill(null)
        .map((_, index) => ({
          id: index + 21,
          date: new Date(2025, 8, index + 1).toISOString().split("T")[0],
          requestNo: `MR${String(index + 21).padStart(3, "0")}`,
          itemName: `Raw Material ${String.fromCharCode(
            65 + ((index + 20) % 26)
          )}`,
          quantity: Math.floor(Math.random() * 100) + 50,
          status: "Completed",
          requestedBy: ["John Doe", "Jane Smith", "Mike Johnson"][index % 3],
        })),
    ],
  };

  // Sample WIP return data
  const wipReturnData = {
    returns: [
      {
        id: 1,
        date: "2025-09-01",
        itemName: "Product A",
        quantity: 10,
        reason: "Excess Material",
        returnedBy: "John Doe",
      },
      {
        id: 2,
        date: "2025-09-02",
        itemName: "Product B",
        quantity: 5,
        reason: "Vendor Rejection",
        returnedBy: "Jane Smith",
      },
      {
        id: 3,
        date: "2025-09-03",
        itemName: "Product C",
        quantity: 8,
        reason: "Process Rejection",
        returnedBy: "Mike Johnson",
      },
      {
        id: 4,
        date: "2025-09-04",
        itemName: "Product D",
        quantity: 3,
        reason: "Other",
        returnedBy: "Sarah Wilson",
      },
    ],
    reasonStats: [
      { name: "Excess Material", value: 40 },
      { name: "Vendor Rejection", value: 30 },
      { name: "Process Rejection", value: 20 },
      { name: "Other", value: 10 },
    ],
  };

  // Sample data - replace with actual API data
  const kpiData = {
    productionPercentage: {
      value: 87.8,
      target: 90,
      data: [
        { name: "Achieved", value: 87.8 },
        { name: "Gap", value: 12.2 },
      ],
      colors: ["#2196F3", "#E0E0E0"],
    },
    activeOrders: {
      value: 78.3,
      total: 45,
      data: [
        { name: "In Progress", value: 78.3 },
        { name: "Pending", value: 21.7 },
      ],
      colors: ["#FF9800", "#E0E0E0"],
    },
    scrapPercentage: {
      value: 3.2,
      target: 5,
      data: [
        { name: "Scrap", value: 3.2 },
        { name: "Good", value: 96.8 },
      ],
      colors: ["#F44336", "#E0E0E0"],
    },
    reworkPercentage: {
      value: 4.5,
      target: 6,
      data: [
        { name: "Rework", value: 4.5 },
        { name: "Good", value: 95.5 },
      ],
      colors: ["#00BCD4", "#E0E0E0"],
    },
    bomRatio: {
      value: 95.5,
      target: 98,
      data: [
        { name: "BOM Match", value: 95.5 },
        { name: "BOM Mismatch", value: 4.5 },
      ],
      colors: ["#4CAF50", "#E0E0E0"],
    },
    dispatchRate: {
      value: 92.5,
      target: 95,
      data: [
        { name: "Achieved", value: 92.5 },
        { name: "Gap", value: 7.5 },
      ],
      colors: ["#007aa5", "#E0E0E0"],
    },
  };

  const renderKpiChart = (data, title, subtitle, kpiType) => (
    <Card
      className="h-100 shadow-sm border-0"
      style={{ cursor: "pointer", transition: "transform 0.2s" }}
      onClick={() => handleCardClick(kpiType)}
      onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
      onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      <Card.Body>
        <div className="d-flex flex-column h-100">
          <div className="text-center mb-3">
            <h6 className="text-muted mb-1">{title}</h6>
            <h3 className="mb-0 fs-5" style={{ color: data.colors[0] }}>
              {data.value}%
            </h3>
            <small className="text-muted">{subtitle}</small>
          </div>
          <div style={{ height: "80px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.data}
                  cx="50%"
                  cy="50%"
                  innerRadius={25}
                  outerRadius={35}
                  fill="#8884d8"
                  paddingAngle={2}
                  dataKey="value"
                >
                  {data.data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={data.colors[index]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `${value.toFixed(1)}%`}
                  contentStyle={{ borderRadius: "8px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card.Body>
    </Card>
  );

  return (
    <div className="mb-4">
      <Row className="g-3">
        <Col md={4} lg={2}>
          {renderKpiChart(
            kpiData.productionPercentage,
            "Production Rate",
            `Target: ${kpiData.productionPercentage.target}%`,
            "productionPercentage"
          )}
        </Col>
        <Col md={4} lg={2}>
          {renderKpiChart(
            kpiData.activeOrders,
            "Active Orders",
            `${kpiData.activeOrders.total} Total Orders`,
            "activeOrders"
          )}
        </Col>
        <Col md={4} lg={2}>
          {renderKpiChart(
            kpiData.scrapPercentage,
            "Scrap Rate",
            `Target: < ${kpiData.scrapPercentage.target}%`,
            "scrapPercentage"
          )}
        </Col>
        <Col md={4} lg={2}>
          {renderKpiChart(
            kpiData.reworkPercentage,
            "Rework Rate",
            `Target: < ${kpiData.reworkPercentage.target}%`,
            "reworkPercentage"
          )}
        </Col>
        <Col md={4} lg={2}>
          {renderKpiChart(
            kpiData.bomRatio,
            "BOM Ratio",
            `Target: ${kpiData.bomRatio.target}%`,
            "bomRatio"
          )}
        </Col>
        <Col md={4} lg={2}>
          {renderKpiChart(
            kpiData.dispatchRate,
            "Dispatch Rate",
            `Target: ${kpiData.dispatchRate.target}%`,
            "dispatchRate"
          )}
        </Col>
      </Row>

      {/* Material Requests Section */}
      <div className="mt-4">
        <h5 className="mb-3">Material Requests Overview</h5>
        <Row className="g-3 mb-4">
          <Col lg={3} md={6}>
            <Card
              className="border-0 shadow-sm"
              style={{ cursor: "pointer", transition: "transform 0.2s" }}
              onClick={() => handleMaterialCardClick("all")}
              onMouseOver={(e) =>
                (e.currentTarget.style.transform = "scale(1.02)")
              }
              onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <h6 className="text-muted mb-1">Total Requests</h6>
                    <h3 className="mb-0">
                      {materialRequestsData.totalRequests}
                    </h3>
                  </div>
                  <div className="fs-1 text-primary">
                    <FontAwesomeIcon icon={faClipboardList} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={3} md={6}>
            <Card
              className="border-0 shadow-sm"
              style={{ cursor: "pointer", transition: "transform 0.2s" }}
              onClick={() => handleMaterialCardClick("pending_approval")}
              onMouseOver={(e) =>
                (e.currentTarget.style.transform = "scale(1.02)")
              }
              onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <h6 className="text-muted mb-1">Pending Approval</h6>
                    <h3 className="mb-0">
                      {materialRequestsData.pendingApproval}
                    </h3>
                  </div>
                  <div className="fs-1 text-warning">
                    <FontAwesomeIcon icon={faClock} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={3} md={6}>
            <Card
              className="border-0 shadow-sm"
              style={{ cursor: "pointer", transition: "transform 0.2s" }}
              onClick={() => handleMaterialCardClick("pending_transfer")}
              onMouseOver={(e) =>
                (e.currentTarget.style.transform = "scale(1.02)")
              }
              onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <h6 className="text-muted mb-1">Pending Transfer</h6>
                    <h3 className="mb-0">
                      {materialRequestsData.pendingTransfer}
                    </h3>
                  </div>
                  <div className="fs-1 text-info">
                    <FontAwesomeIcon icon={faDolly} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col lg={3} md={6}>
            <Card
              className="border-0 shadow-sm"
              style={{ cursor: "pointer", transition: "transform 0.2s" }}
              onClick={() => handleMaterialCardClick("completed")}
              onMouseOver={(e) =>
                (e.currentTarget.style.transform = "scale(1.02)")
              }
              onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              <Card.Body>
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <h6 className="text-muted mb-1">Completed</h6>
                    <h3 className="mb-0">
                      {materialRequestsData.completedRequests}
                    </h3>
                  </div>
                  <div className="fs-1 text-success">
                    <FontAwesomeIcon icon={faCheckCircle} />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>

      {/* WIP Returns Section */}
      <div className="mt-4">
        <h5 className="mb-3">WIP Returns Analysis</h5>
        <Row>
          <Col md={7}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <h6 className="mb-3">Recent WIP Returns</h6>
                <div className="table-responsive">
                  <Table hover className="mb-0">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Item Name</th>
                        <th>Quantity</th>
                        <th>Reason</th>
                        <th>Returned By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {wipReturnData.returns.map((item) => (
                        <tr key={item.id}>
                          <td>{item.date}</td>
                          <td>{item.itemName}</td>
                          <td>{item.quantity}</td>
                          <td>{item.reason}</td>
                          <td>{item.returnedBy}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={5}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body>
                <h6 className="mb-3">Return Reasons Distribution</h6>
                <div style={{ height: "300px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={wipReturnData.reasonStats}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {wipReturnData.reasonStats.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              [
                                "#FF9800", // Excess Material - Orange
                                "#f44336", // Vendor Rejection - Red
                                "#2196F3", // Process Rejection - Blue
                                "#9E9E9E", // Other - Grey
                              ][index]
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Material Requests Modal */}
      <Modal
        show={showMaterialModal}
        onHide={() => setShowMaterialModal(false)}
        size="xl"
      >
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center justify-content-between w-100">
            <div>
              <FontAwesomeIcon icon={faClipboardList} className="me-2" />
              {selectedMaterialView === "all" && "All Material Requests"}
              {selectedMaterialView === "pending_approval" &&
                "Pending Approval Requests"}
              {selectedMaterialView === "pending_transfer" &&
                "Pending Transfer Requests"}
              {selectedMaterialView === "completed" && "Completed Requests"}
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <Row className="g-3">
              <Col md={3}>
                <InputGroup>
                  <InputGroup.Text className="text-8">
                    <FontAwesomeIcon icon={faSearch} />
                  </InputGroup.Text>
                  <Form.Control
                    className="text-8"
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      resetPagination();
                    }}
                  />
                </InputGroup>
              </Col>
              <Col md={3}>
                <InputGroup>
                  <InputGroup.Text className="text-8">From</InputGroup.Text>
                  <Form.Control
                    className="text-8"
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => {
                      setDateRange({ ...dateRange, start: e.target.value });
                      resetPagination();
                    }}
                  />
                </InputGroup>
              </Col>
              <Col md={2}>
                <InputGroup>
                  <InputGroup.Text className="text-8">To</InputGroup.Text>
                  <Form.Control
                    className="text-8"
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => {
                      setDateRange({ ...dateRange, end: e.target.value });
                      resetPagination();
                    }}
                  />
                </InputGroup>
              </Col>
              <Col md={4} className="d-flex align-items-center">
                <Button
                  variant="outline-secondary"
                  onClick={() => {
                    setSearchTerm("");
                    setDateRange({ start: "", end: "" });
                    resetPagination();
                  }}
                  className="me-2 text-8"
                >
                  <FontAwesomeIcon icon={faFilter} className="me-2" />
                  Clear Filters
                </Button>
                <Button
                  variant="outline-success"
                  className="text-8"
                  onClick={() => {
                    /* Add export function */
                  }}
                >
                  <FontAwesomeIcon icon={faFileExport} className="me-2" />
                  Export
                </Button>
              </Col>
            </Row>
          </div>

          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Request No</th>
                  <th>Item Name</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  <th>Requested By</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const filteredData = getFilteredMaterialRequests();
                  const startIndex = (currentPage - 1) * itemsPerPage;
                  const paginatedData = filteredData.slice(
                    startIndex,
                    startIndex + itemsPerPage
                  );

                  return paginatedData.map((request) => (
                    <tr key={request.id}>
                      <td>{request.date}</td>
                      <td>{request.requestNo}</td>
                      <td>{request.itemName}</td>
                      <td>{request.quantity}</td>
                      <td>
                        <span
                          className={`badge bg-${
                            request.status === "Pending"
                              ? "warning"
                              : request.status === "Approved"
                              ? "info"
                              : "success"
                          }`}
                        >
                          {request.status}
                        </span>
                      </td>
                      <td>{request.requestedBy}</td>
                    </tr>
                  ));
                })()}
              </tbody>
            </Table>
          </div>

          {/* Pagination */}
          {(() => {
            const filteredData = getFilteredMaterialRequests();
            const totalPages = Math.ceil(filteredData.length / itemsPerPage);

            return totalPages > 1 ? (
              <div className="d-flex justify-content-between align-items-center mt-3">
                <div className="text-muted text-8">
                  Showing{" "}
                  {Math.min(
                    (currentPage - 1) * itemsPerPage + 1,
                    filteredData.length
                  )}{" "}
                  to {Math.min(currentPage * itemsPerPage, filteredData.length)}{" "}
                  of {filteredData.length} entries
                </div>
                <div className="text-8">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    className="me-2"
                  >
                    Previous
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (pageNum) => (
                      <Button
                        key={pageNum}
                        variant={
                          pageNum === currentPage
                            ? "secondary"
                            : "outline-secondary"
                        }
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="me-2"
                      >
                        {pageNum}
                      </Button>
                    )
                  )}
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            ) : null;
          })()}
        </Modal.Body>
      </Modal>

      {/* KPI Details Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="xl">
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center justify-content-between w-100">
            <div>
              <i className="fa-solid fa-circle-info me-2"></i>
              {selectedKpi === "productionPercentage" &&
                "Production Rate Details"}
              {selectedKpi === "activeOrders" && "Active Orders Details"}
              {selectedKpi === "scrapPercentage" && "Scrap Rate Details"}
              {selectedKpi === "reworkPercentage" && "Rework Rate Details"}
              {selectedKpi === "bomRatio" && "BOM Ratio Details"}
              {selectedKpi === "dispatchRate" && "Dispatch Rate Details"}
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <Row className="g-3">
              <Col md={3}>
                <InputGroup>
                  <InputGroup.Text className="text-8">
                    <FontAwesomeIcon icon={faSearch} />
                  </InputGroup.Text>
                  <Form.Control
                    className="text-8"
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
              </Col>
              <Col md={3}>
                <InputGroup>
                  <InputGroup.Text className="text-8">From</InputGroup.Text>
                  <Form.Control
                    className="text-8"
                    type="date"
                    value={dateRange.start}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, start: e.target.value })
                    }
                  />
                </InputGroup>
              </Col>
              <Col md={2}>
                <InputGroup>
                  <InputGroup.Text className="text-8">To</InputGroup.Text>
                  <Form.Control
                    className="text-8"
                    type="date"
                    value={dateRange.end}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, end: e.target.value })
                    }
                  />
                </InputGroup>
              </Col>
              <Col md={4} className="d-flex align-items-center">
                <button
                  className="btn btn-outline-secondary text-8"
                  onClick={() => {
                    setSearchTerm("");
                    setDateRange({ start: "", end: "" });
                  }}
                  type="button"
                >
                  <FontAwesomeIcon icon={faFilter} className="me-2 text" />
                  Clear Filters
                </button>
                <Button
                  variant="outline-success text-8"
                  size="sm"
                  onClick={() => handleExportToExcel()}
                  className="ms-3"
                >
                  <FontAwesomeIcon icon={faFileExport} className="me-2" />
                  Export to Excel
                </Button>
              </Col>
            </Row>
          </div>

          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Order No</th>
                  {selectedKpi === "productionPercentage" && (
                    <>
                      <th>Planned</th>
                      <th>Achieved</th>
                      <th>Percentage</th>
                    </>
                  )}
                  {selectedKpi === "activeOrders" && (
                    <>
                      <th>Status</th>
                      <th>Product</th>
                      <th>Quantity</th>
                    </>
                  )}
                  {selectedKpi === "bomRatio" && (
                    <>
                      <th>Planned Components</th>
                      <th>Actual Components</th>
                      <th>Match Percentage</th>
                    </>
                  )}
                  {/* Add more columns based on KPI type */}
                </tr>
              </thead>
              <tbody>
                {getFilteredData().map((item) => (
                  <tr key={item.id}>
                    <td>{item.date}</td>
                    <td>{item.orderNo}</td>
                    {selectedKpi === "productionPercentage" && (
                      <>
                        <td>{item.planned}</td>
                        <td>{item.achieved}</td>
                        <td>{item.percentage}%</td>
                      </>
                    )}
                    {selectedKpi === "activeOrders" && (
                      <>
                        <td>{item.status}</td>
                        <td>{item.product}</td>
                        <td>{item.quantity}</td>
                      </>
                    )}
                    {selectedKpi === "bomRatio" && (
                      <>
                        <td>{item.plannedComponents}</td>
                        <td>{item.actualComponents}</td>
                        <td>{item.matchPercentage}%</td>
                      </>
                    )}
                    {/* Add more cell rendering based on KPI type */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ProductionKpiCharts;
