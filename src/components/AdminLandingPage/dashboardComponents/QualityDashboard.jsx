import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Table,
  Badge,
  Modal,
  Form,
  Button,
  InputGroup,
} from "react-bootstrap";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import api from "../../../services/api";
import * as XLSX from "xlsx";

const QualityDashboard = () => {
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedKPI, setSelectedKPI] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [filterStatus, setFilterStatus] = useState("all");

  // Historical KPI data
  const [kpiHistory] = useState({
    pendingQC: [
      {
        date: "2024-03-01",
        value: 15,
        status: "High",
        comments: "Above threshold",
      },
      {
        date: "2024-03-02",
        value: 12,
        status: "Medium",
        comments: "Improving",
      },
      {
        date: "2024-03-03",
        value: 10,
        status: "Low",
        comments: "Within target",
      },
    ],
    qualityYield: [
      {
        date: "2024-03-01",
        value: 95.2,
        status: "Below Target",
        comments: "Need improvement",
      },
      {
        date: "2024-03-02",
        value: 96.5,
        status: "Below Target",
        comments: "Improving",
      },
      {
        date: "2024-03-03",
        value: 97.8,
        status: "On Target",
        comments: "Meeting targets",
      },
    ],
    qualityRate: [
      {
        date: "2024-03-01",
        value: 97.8,
        status: "On Target",
        comments: "Stable performance",
      },
      {
        date: "2024-03-02",
        value: 98.1,
        status: "On Target",
        comments: "Good progress",
      },
      {
        date: "2024-03-03",
        value: 98.5,
        status: "On Target",
        comments: "Excellent",
      },
    ],
    totalRejectionRate: [
      {
        date: "2024-03-01",
        value: 2.2,
        status: "High",
        comments: "Above threshold",
      },
      {
        date: "2024-03-02",
        value: 2.0,
        status: "Medium",
        comments: "Improving",
      },
      {
        date: "2024-03-03",
        value: 1.8,
        status: "Low",
        comments: "Good progress",
      },
    ],
    reworkRate: [
      {
        date: "2024-03-01",
        value: 1.5,
        status: "High",
        comments: "Above target",
      },
      {
        date: "2024-03-02",
        value: 1.3,
        status: "Medium",
        comments: "Improving",
      },
      {
        date: "2024-03-03",
        value: 1.1,
        status: "Low",
        comments: "Near target",
      },
    ],
    scrapPercentage: [
      {
        date: "2024-03-01",
        value: 0.7,
        status: "High",
        comments: "Above threshold",
      },
      {
        date: "2024-03-02",
        value: 0.6,
        status: "Medium",
        comments: "Improving",
      },
      {
        date: "2024-03-03",
        value: 0.5,
        status: "On Target",
        comments: "Met target",
      },
    ],
  });

  // Handle modal open
  const handleKPIClick = (kpiData, title) => {
    const kpiKey = title
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[^a-z0-9]/g, "");
    const matchingKey = Object.keys(kpiHistory).find(
      (key) => key.toLowerCase() === kpiKey
    );
    setSelectedKPI({
      ...kpiData,
      title,
      key: matchingKey || kpiKey,
    });
    setShowModal(true);
  };

  // Handle filter clear
  const handleClearFilters = () => {
    setSearchTerm("");
    setDateRange({ start: "", end: "" });
    setFilterStatus("all");
  };
  // Fetch pending QC data
  useEffect(() => {
    const fetchPendingQC = async () => {
      try {
        const response = await api.get("/api/qc/pending-count");
        const pendingCount = response.data.count;
        const totalCount = response.data.total;

        setKpiData((prev) => ({
          ...prev,
          pendingQC: {
            ...prev.pendingQC,
            value: (pendingCount / totalCount) * 100,
            data: [
              { name: "Pending", value: (pendingCount / totalCount) * 100 },
              {
                name: "Completed",
                value: 100 - (pendingCount / totalCount) * 100,
              },
            ],
          },
        }));
      } catch (error) {
        console.error("Error fetching pending QC data:", error);
      }
    };

    fetchPendingQC();
    // Fetch data every 5 minutes
    const interval = setInterval(fetchPendingQC, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  // States for different data sections
  const [kpiData, setKpiData] = useState({
    pendingQC: {
      value: 15,
      target: 0,
      data: [
        { name: "Pending", value: 15 },
        { name: "Completed", value: 85 },
      ],
      colors: ["#FFA726", "#E0E0E0"],
    },
    qualityYield: {
      value: 95.2,
      target: 98,
      data: [
        { name: "Achieved", value: 95.2 },
        { name: "Gap", value: 4.8 },
      ],
      colors: ["#4CAF50", "#E0E0E0"],
    },
    qualityRate: {
      value: 97.8,
      target: 99,
      data: [
        { name: "Pass", value: 97.8 },
        { name: "Fail", value: 2.2 },
      ],
      colors: ["#2196F3", "#E0E0E0"],
    },
    totalRejectionRate: {
      value: 2.2,
      target: 1,
      data: [
        { name: "Rejection", value: 2.2 },
        { name: "Pass", value: 97.8 },
      ],
      colors: ["#F44336", "#E0E0E0"],
    },
    reworkRate: {
      value: 1.5,
      target: 1,
      data: [
        { name: "Rework", value: 1.5 },
        { name: "Good", value: 98.5 },
      ],
      colors: ["#FF9800", "#E0E0E0"],
    },
    scrapPercentage: {
      value: 0.7,
      target: 0.5,
      data: [
        { name: "Scrap", value: 0.7 },
        { name: "Good", value: 99.3 },
      ],
      colors: ["#9C27B0", "#E0E0E0"],
    },
  });

  const [qualityMetrics, setQualityMetrics] = useState([
    { date: "2024-03-01", pass: 95, fail: 3, hold: 2 },
    { date: "2024-03-02", pass: 97, fail: 2, hold: 1 },
    { date: "2024-03-03", pass: 96, fail: 2, hold: 2 },
    { date: "2024-03-04", pass: 98, fail: 1, hold: 1 },
    { date: "2024-03-05", pass: 97, fail: 2, hold: 1 },
    { date: "2024-03-06", pass: 95, fail: 3, hold: 2 },
    { date: "2024-03-07", pass: 96, fail: 2, hold: 2 },
  ]);

  const [defectRateData, setDefectRateData] = useState([
    { date: "2024-03-01", defectRate: 2.5, reworkRate: 1.2 },
    { date: "2024-03-02", defectRate: 2.1, reworkRate: 1.5 },
    { date: "2024-03-03", defectRate: 2.3, reworkRate: 1.3 },
    { date: "2024-03-04", defectRate: 1.9, reworkRate: 1.1 },
    { date: "2024-03-05", defectRate: 2.0, reworkRate: 1.4 },
    { date: "2024-03-06", defectRate: 1.8, reworkRate: 1.0 },
    { date: "2024-03-07", defectRate: 1.7, reworkRate: 0.9 },
  ]);

  const [topDefects, setTopDefects] = useState([
    { category: "Dimensional Error", count: 45, percentage: "25%" },
    { category: "Surface Finish", count: 32, percentage: "18%" },
    { category: "Assembly Issue", count: 28, percentage: "15%" },
    { category: "Material Quality", count: 25, percentage: "14%" },
    { category: "Packaging Defect", count: 20, percentage: "11%" },
    { category: "Color Variation", count: 15, percentage: "8%" },
    { category: "Labeling Error", count: 12, percentage: "7%" },
    { category: "Weight Variance", count: 5, percentage: "2%" },
  ]);

  const [rejectionSources, setRejectionSources] = useState([
    { name: "Process Rejection", value: 65 },
    { name: "Vendor Rejection", value: 35 },
  ]);

  const [topVendors, setTopVendors] = useState([
    {
      name: "Premier Electronics",
      qualityScore: 98.5,
      rejectionRate: 1.5,
      onTimeDelivery: 99,
    },
    {
      name: "Global Components Ltd",
      qualityScore: 97.2,
      rejectionRate: 2.8,
      onTimeDelivery: 98,
    },
    {
      name: "Reliable Parts Co",
      qualityScore: 96.8,
      rejectionRate: 3.2,
      onTimeDelivery: 97.5,
    },
    {
      name: "Tech Solutions Inc",
      qualityScore: 96.5,
      rejectionRate: 3.5,
      onTimeDelivery: 96.8,
    },
    {
      name: "Quality Manufacturing",
      qualityScore: 95.9,
      rejectionRate: 4.1,
      onTimeDelivery: 95.5,
    },
    {
      name: "Superior Supplies",
      qualityScore: 95.5,
      rejectionRate: 4.5,
      onTimeDelivery: 94.8,
    },
  ]);

  const [batchQC, setBatchQC] = useState([
    {
      batchNo: "B12345",
      product: "(203658) LLOYD Remote",
      status: "PASS",
      sampleSize: 100,
      defectsFound: 2,
      yield: 98,
    },
    {
      batchNo: "B12346",
      product: "(203659) Samsung Controller",
      status: "PASS",
      sampleSize: 150,
      defectsFound: 3,
      yield: 98,
    },
    {
      batchNo: "B12347",
      product: "(203660) PCB Assembly",
      status: "FAIL",
      sampleSize: 80,
      defectsFound: 12,
      yield: 85,
    },
    {
      batchNo: "B12348",
      product: "(203661) Power Supply",
      status: "PASS",
      sampleSize: 120,
      defectsFound: 1,
      yield: 99.2,
    },
    {
      batchNo: "B12349",
      product: "(203662) Display Module",
      status: "PASS",
      sampleSize: 90,
      defectsFound: 2,
      yield: 97.8,
    },
    {
      batchNo: "B12350",
      product: "(203663) LED Panel",
      status: "FAIL",
      sampleSize: 200,
      defectsFound: 18,
      yield: 91,
    },
    {
      batchNo: "B12351",
      product: "(203664) Circuit Board",
      status: "PASS",
      sampleSize: 75,
      defectsFound: 1,
      yield: 98.7,
    },
  ]);

  const [qualityEvents, setQualityEvents] = useState([
    {
      id: "QE001",
      date: "2024-03-01",
      type: "Supplier Deviation",
      description: "Dimensional deviation in component XYZ (2.5mm)",
      severity: "High",
      status: "Open",
      assignedTo: "John Doe",
    },
    {
      id: "QE002",
      date: "2024-03-02",
      type: "Customer Complaint",
      description: "Surface finish issue reported",
      severity: "Medium",
      status: "Closed",
      assignedTo: "Jane Smith",
    },
    {
      id: "QE003",
      date: "2024-03-03",
      type: "Process Deviation",
      description: "Temperature control deviation in Assembly Line 2",
      severity: "High",
      status: "Open",
      assignedTo: "Mike Johnson",
    },
    {
      id: "QE004",
      date: "2024-03-03",
      type: "Supplier Deviation",
      description: "Batch received with incorrect specifications (15% deviation)",
      severity: "High",
      status: "In Progress",
      assignedTo: "Sarah Wilson",
    },
    {
      id: "QE005",
      date: "2024-03-04",
      type: "Supplier Deviation",
      description: "Color variation in finished product (Delta E: 3.2)",
      severity: "Low",
      status: "Closed",
      assignedTo: "Tom Brown",
    },
    {
      id: "QE006",
      date: "2024-03-04",
      type: "Equipment Issue",
      description: "Calibration error in testing equipment",
      severity: "Medium",
      status: "In Progress",
      assignedTo: "David Clark",
    },
    {
      id: "QE007",
      date: "2024-03-05",
      type: "Documentation",
      description: "Missing test records for Batch B12345",
      severity: "Low",
      status: "Open",
      assignedTo: "Emma Davis",
    },
    {
      id: "QE008",
      date: "2024-03-05",
      type: "Customer Complaint",
      description: "Packaging damage reported by retailer",
      severity: "Medium",
      status: "Open",
      assignedTo: "John Doe",
    },
  ]);

  // Render KPI Charts
  const renderKpiChart = (data, title, subtitle) => (
    <Card
      className="h-100 shadow-sm border-0"
      style={{ cursor: "pointer" }}
      onClick={() => handleKPIClick(data, title)}
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

  // Render Quality Metrics Chart
  const renderQualityMetricsCharts = () => (
    <Row className="mb-4">
      <Col lg={7}>
        <Card className="shadow-sm border-0">
          <Card.Header className="bg-white">
            <h6 className="mb-0">Quality Metrics Trend</h6>
          </Card.Header>
          <Card.Body>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={qualityMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="pass"
                  stroke="#4CAF50"
                  name="Pass"
                />
                <Line
                  type="monotone"
                  dataKey="fail"
                  stroke="#F44336"
                  name="Fail"
                />
                <Line
                  type="monotone"
                  dataKey="hold"
                  stroke="#FFC107"
                  name="Hold"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card.Body>
        </Card>
      </Col>
      <Col lg={5}>
        <Card className="shadow-sm border-0 h-100">
          <Card.Header className="bg-white">
            <h6 className="mb-0">Quality Distribution</h6>
          </Card.Header>
          <Card.Body>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Pass", value: 95 },
                    { name: "Fail", value: 3 },
                    { name: "Hold", value: 2 },
                  ]}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                >
                  <Cell fill="#4CAF50" />
                  <Cell fill="#F44336" />
                  <Cell fill="#FFC107" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );

  // Render Defect and Rework Rate Chart
  const renderDefectRateChart = () => (
    <Card className="shadow-sm border-0 mb-4">
      <Card.Header className="bg-white">
        <h6 className="mb-0">Defect & Rework Rate Trend</h6>
      </Card.Header>
      <Card.Body>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={defectRateData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="defectRate"
              stroke="#F44336"
              name="Defect Rate"
            />
            <Line
              type="monotone"
              dataKey="reworkRate"
              stroke="#FF9800"
              name="Rework Rate"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card.Body>
    </Card>
  );

  // Export to Excel function
  const exportToExcel = (data, filename) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  // Render Top Defects and Rejection Sources
  const renderDefectAnalysis = () => (
    <Row className="mb-4">
      <Col lg={7}>
        <Card className="shadow-sm border-0">
          <Card.Header className="bg-white d-flex justify-content-between align-items-center">
            <h6 className="mb-0">Top Defect Categories</h6>
            <Button
              variant="outline-success"
              className="text-8"
              size="sm"
              onClick={() => exportToExcel(topDefects, "top_defects")}
            >
              <i className="fas fa-file-export"></i> Export Excel
            </Button>
          </Card.Header>
          <Card.Body>
            <Table hover>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Count</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                {topDefects.map((defect, index) => (
                  <tr key={index}>
                    <td>{defect.category}</td>
                    <td>{defect.count}</td>
                    <td>{defect.percentage}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Col>
      <Col lg={5}>
        <Card className="shadow-sm border-0">
          <Card.Header className="bg-white">
            <h6 className="mb-0">Rejection Sources</h6>
          </Card.Header>
          <Card.Body>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={rejectionSources}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                >
                  <Cell fill="#F44336" />
                  <Cell fill="#FF9800" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );

  // Render Top Vendors Table
  const renderTopVendors = () => (
    <Card className="shadow-sm border-0 mb-4">
      <Card.Header className="bg-white d-flex justify-content-between align-items-center">
        <h6 className="mb-0">Top Vendors Performance</h6>
        <Button
          variant="outline-success"
          className="text-8"
          size="sm"
          onClick={() => exportToExcel(topVendors, "vendor_performance")}
        >
          <i className="fas fa-file-export me-1"></i>Export to Excel
        </Button>
      </Card.Header>
      <Card.Body>
        <Table hover>
          <thead>
            <tr>
              <th>Vendor Name</th>
              <th>Quality Score</th>
              <th>Rejection Rate</th>
              <th>On-Time Delivery</th>
            </tr>
          </thead>
          <tbody>
            {topVendors.map((vendor, index) => (
              <tr key={index}>
                <td>{vendor.name}</td>
                <td>{vendor.qualityScore}%</td>
                <td>{vendor.rejectionRate}%</td>
                <td>{vendor.onTimeDelivery}%</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );

  // Render Quality Events Table
  const renderQualityEvents = () => (
    <Card className="shadow-sm border-0 mb-4">
      <Card.Header className="bg-white d-flex justify-content-between align-items-center">
        <h6 className="mb-0">Quality Events</h6>
        <Button
          variant="outline-success"
          className="text-8"
          size="sm"
          onClick={() => exportToExcel(qualityEvents, "quality_events")}
        >
          <i className="fas fa-file-export me-1"></i>Export to Excel
        </Button>
      </Card.Header>
      <Card.Body>
        <Table hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Date</th>
              <th>Type</th>
              <th>Description</th>
              <th>Severity</th>
              <th>Status</th>
              <th>Assigned To</th>
            </tr>
          </thead>
          <tbody>
            {qualityEvents.map((event, index) => (
              <tr key={index}>
                <td>{event.id}</td>
                <td>{event.date}</td>
                <td>{event.type}</td>
                <td>{event.description}</td>
                <td>
                  <Badge
                    bg={
                      event.severity === "High"
                        ? "danger"
                        : event.severity === "Medium"
                        ? "warning"
                        : "info"
                    }
                  >
                    {event.severity}
                  </Badge>
                </td>
                <td>
                  <Badge bg={event.status === "Open" ? "primary" : "success"}>
                    {event.status}
                  </Badge>
                </td>
                <td>{event.assignedTo}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );

  // Render Batch Level QC Table
  const renderBatchQC = () => (
    <Card className="shadow-sm border-0 mb-4">
      <Card.Header className="bg-white d-flex justify-content-between align-items-center">
        <h6 className="mb-0">Batch Level QC</h6>
        <Button
          variant="outline-success"
          className="text-8"
          size="sm"
          onClick={() => exportToExcel(batchQC, "batch_qc")}
        >
          <i className="fas fa-file-export me-1"></i>Export to Excel
        </Button>
      </Card.Header>
      <Card.Body>
        <Table hover>
          <thead>
            <tr>
              <th>Batch No</th>
              <th>Product</th>
              <th>Status</th>
              <th>Sample Size</th>
              <th>Defects Found</th>
              <th>Yield %</th>
            </tr>
          </thead>
          <tbody>
            {batchQC.map((batch, index) => (
              <tr key={index}>
                <td>{batch.batchNo}</td>
                <td>{batch.product}</td>
                <td>
                  <Badge bg={batch.status === "PASS" ? "success" : "danger"}>
                    {batch.status}
                  </Badge>
                </td>
                <td>{batch.sampleSize}</td>
                <td>{batch.defectsFound}</td>
                <td>{batch.yield}%</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );

  // Get filtered KPI history
  const getFilteredKPIHistory = () => {
    if (!selectedKPI?.key) return [];

    const kpiKey = selectedKPI.key.toLowerCase().replace(/\s+/g, "");
    const historyData = kpiHistory[kpiKey];

    if (!historyData) return [];

    let data = [...historyData];

    // Apply search filter
    if (searchTerm) {
      data = data.filter(
        (item) =>
          item.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.comments.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply date range filter
    if (dateRange.start) {
      data = data.filter((item) => item.date >= dateRange.start);
    }
    if (dateRange.end) {
      data = data.filter((item) => item.date <= dateRange.end);
    }

    // Apply status filter
    if (filterStatus !== "all") {
      data = data.filter(
        (item) => item.status.toLowerCase() === filterStatus.toLowerCase()
      );
    }

    return data;
  };

  // Render KPI Modal
  const renderKPIModal = () => (
    <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{selectedKPI?.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-4">
          <Row className="g-3">
            <Col md={3}>
              <InputGroup>
                <Form.Control
                  className="text-8"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={2}>
              <Form.Control
                className="text-8"
                type="date"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange({ ...dateRange, start: e.target.value })
                }
              />
            </Col>
            <Col md={2}>
              <Form.Control
                className="text-8"
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange({ ...dateRange, end: e.target.value })
                }
              />
            </Col>
            <Col md={2}>
              <Form.Select
                className="text-8"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
                <option value="on target">On Target</option>
                <option value="below target">Below Target</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Button
                className="text-8"
                variant="outline-secondary"
                size="sm"
                onClick={handleClearFilters}
              >
                <i class="fa-solid fa-filter me-1"></i>Clear Filters
              </Button>{" "}
              <Button
                variant="outline-success"
                className="text-8"
                size="sm"
                onClick={() =>
                  exportToExcel(
                    getFilteredKPIHistory(),
                    `${selectedKPI.title}_history`
                  )
                }
              >
                <i class="fa-solid fa-file-export me-1"></i> Export to Excel
              </Button>
            </Col>
          </Row>
        </div>

        {selectedKPI && (
          <div>
            <Table hover>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Value (%)</th>
                  <th>Status</th>
                  <th>Comments</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredKPIHistory().map((item, index) => (
                  <tr key={index}>
                    <td>{item.date}</td>
                    <td>{item.value}</td>
                    <td>
                      <Badge
                        bg={
                          item.status === "High"
                            ? "danger"
                            : item.status === "Medium"
                            ? "warning"
                            : item.status === "Low"
                            ? "success"
                            : item.status === "On Target"
                            ? "success"
                            : "secondary"
                        }
                      >
                        {item.status}
                      </Badge>
                    </td>
                    <td>{item.comments}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );

  return (
    <div>
      {renderKPIModal()}
      {/* KPI Charts */}
      <Row className="g-3 mb-4">
        <Col md={2} lg={2}>
          {renderKpiChart(
            kpiData.pendingQC,
            "Pending QC",
            "Items awaiting inspection"
          )}
        </Col>
        <Col md={2} lg={2}>
          {renderKpiChart(
            kpiData.qualityYield,
            "Quality Yield",
            `Target: ${kpiData.qualityYield.target}%`
          )}
        </Col>
        <Col md={2} lg={2}>
          {renderKpiChart(
            kpiData.qualityRate,
            "Quality Rate",
            `Target: ${kpiData.qualityRate.target}%`
          )}
        </Col>
        <Col md={2} lg={2}>
          {renderKpiChart(
            kpiData.totalRejectionRate,
            "Total Rejection",
            `Target: < ${kpiData.totalRejectionRate.target}%`
          )}
        </Col>
        <Col md={2} lg={2}>
          {renderKpiChart(
            kpiData.reworkRate,
            "Rework Rate",
            `Target: < ${kpiData.reworkRate.target}%`
          )}
        </Col>
        <Col md={2} lg={2}>
          {renderKpiChart(
            kpiData.scrapPercentage,
            "Scrap Rate",
            `Target: < ${kpiData.scrapPercentage.target}%`
          )}
        </Col>
      </Row>

      {/* Quality Metrics Charts */}
      {renderQualityMetricsCharts()}

      {/* Defect Rate Chart */}
      {renderDefectRateChart()}

      {/* Defect Analysis */}
      {renderDefectAnalysis()}

      {/* Top Vendors */}
      {renderTopVendors()}

      {/* Batch Level QC */}
      {renderBatchQC()}

      {/* Quality Events */}
      {renderQualityEvents()}
    </div>
  );
};

export default QualityDashboard;
