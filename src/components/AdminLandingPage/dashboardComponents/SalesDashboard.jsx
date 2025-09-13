import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Table,
  Badge,
  Form,
  Button,
  InputGroup,
} from "react-bootstrap";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  FaSearch,
  FaFileExport,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaCheckCircle,
} from "react-icons/fa";
import api from "../../../services/api";
import exportToExcel from "../../../utils/exportToExcel";

const SalesDashboard = () => {
  // State for search and filters
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState("month");

  // State for production data
  const [productionData, setProductionData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  // State for summary data
  const [summary, setSummary] = useState({
    totalPlanned: 0,
    totalActual: 0,
    totalMissed: 0,
    totalExtra: 0,
    performancePercentage: 0,
  });

  // State for chart data
  const [chartData, setChartData] = useState([]);
  const [trendData, setTrendData] = useState([]);

  // Mock data for demonstration
  useEffect(() => {
    // Mock production data
    const mockProductionData = [
      {
        id: "P1",
        date: "2024-04-15",
        itemId: "I1",
        itemName: "Product A",
        itemType: "Finished Good",
        planned: 500,
        actual: 480,
        variance: -20,
        status: "Missed",
        warehouse: "Main Production Facility",
        productionLine: "Line 1",
      },
      {
        id: "P2",
        date: "2024-04-16",
        itemId: "I2",
        itemName: "Product B",
        itemType: "Finished Good",
        planned: 300,
        actual: 320,
        variance: 20,
        status: "Extra",
        warehouse: "Secondary Production Facility",
        productionLine: "Line 2",
      },
      {
        id: "P3",
        date: "2024-04-17",
        itemId: "I3",
        itemName: "Component X",
        itemType: "Component",
        planned: 1000,
        actual: 950,
        variance: -50,
        status: "Missed",
        warehouse: "Main Production Facility",
        productionLine: "Line 3",
      },
      {
        id: "P4",
        date: "2024-04-18",
        itemId: "I4",
        itemName: "Component Y",
        itemType: "Component",
        planned: 800,
        actual: 820,
        variance: 20,
        status: "Extra",
        warehouse: "Assembly Warehouse",
        productionLine: "Assembly Line",
      },
      {
        id: "P5",
        date: "2024-04-19",
        itemId: "I1",
        itemName: "Product A",
        itemType: "Finished Good",
        planned: 600,
        actual: 580,
        variance: -20,
        status: "Missed",
        warehouse: "Main Production Facility",
        productionLine: "Line 1",
      },
    ];

    setProductionData(mockProductionData);
    setFilteredData(mockProductionData);

    // Calculate summary
    const totalPlanned = mockProductionData.reduce(
      (sum, item) => sum + item.planned,
      0
    );
    const totalActual = mockProductionData.reduce(
      (sum, item) => sum + item.actual,
      0
    );
    const totalMissed = mockProductionData
      .filter((item) => item.variance < 0)
      .reduce((sum, item) => sum + Math.abs(item.variance), 0);
    const totalExtra = mockProductionData
      .filter((item) => item.variance > 0)
      .reduce((sum, item) => sum + item.variance, 0);
    const performancePercentage = (totalActual / totalPlanned) * 100;

    setSummary({
      totalPlanned,
      totalActual,
      totalMissed,
      totalExtra,
      performancePercentage,
    });

    // Prepare chart data
    const chartData = [
      { name: "Product A", planned: 1100, actual: 1060, variance: -40 },
      { name: "Product B", planned: 300, actual: 320, variance: 20 },
      { name: "Component X", planned: 1000, actual: 950, variance: -50 },
      { name: "Component Y", planned: 800, actual: 820, variance: 20 },
    ];

    setChartData(chartData);

    // Prepare trend data
    const trendData = [
      { name: "Week 1", planned: 2500, actual: 2400, efficiency: 96 },
      { name: "Week 2", planned: 2700, actual: 2650, efficiency: 98 },
      { name: "Week 3", planned: 2800, actual: 2750, efficiency: 98 },
      { name: "Week 4", planned: 3000, actual: 2950, efficiency: 98 },
      { name: "Week 5", planned: 3200, actual: 3150, efficiency: 98 },
    ];

    setTrendData(trendData);
  }, []);

  // Filter data when search term or date range changes
  useEffect(() => {
    let filtered = [...productionData];

    // Apply search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.itemName.toLowerCase().includes(search) ||
          item.warehouse.toLowerCase().includes(search) ||
          item.productionLine.toLowerCase().includes(search)
      );
    }

    // Apply date range filter
    if (dateRange === "today") {
      const today = new Date().toISOString().split("T")[0];
      filtered = filtered.filter((item) => item.date === today);
    } else if (dateRange === "week") {
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const startDate = startOfWeek.toISOString().split("T")[0];

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      const endDate = endOfWeek.toISOString().split("T")[0];

      filtered = filtered.filter(
        (item) => item.date >= startDate && item.date <= endDate
      );
    }
    // Month is default, no additional filtering needed

    setFilteredData(filtered);

    // Recalculate summary based on filtered data
    if (filtered.length > 0) {
      const totalPlanned = filtered.reduce(
        (sum, item) => sum + item.planned,
        0
      );
      const totalActual = filtered.reduce((sum, item) => sum + item.actual, 0);
      const totalMissed = filtered
        .filter((item) => item.variance < 0)
        .reduce((sum, item) => sum + Math.abs(item.variance), 0);
      const totalExtra = filtered
        .filter((item) => item.variance > 0)
        .reduce((sum, item) => sum + item.variance, 0);
      const performancePercentage = (totalActual / totalPlanned) * 100;

      setSummary({
        totalPlanned,
        totalActual,
        totalMissed,
        totalExtra,
        performancePercentage,
      });
    }
  }, [searchTerm, dateRange, productionData]);

  // Handle export to Excel
  const handleExport = () => {
    exportToExcel(filteredData, "Production_Performance");
  };

  // Render KPI cards
  const renderKpiCards = () => (
    <Row className="g-3 mb-4">
      <Col md={3}>
        <Card className="h-100 shadow-sm border-0">
          <Card.Body>
            <div className="d-flex flex-column h-100">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="text-muted mb-0">Total Planned</h6>
                <div
                  className="icon-box rounded-circle p-2"
                  style={{ backgroundColor: "#0d6efd20" }}
                >
                  <FaCalendarAlt color="#0d6efd" />
                </div>
              </div>
              <div className="text-center">
                <h3 className="mb-1 fs-4" style={{ color: "#0d6efd" }}>
                  {summary.totalPlanned.toLocaleString()}
                </h3>
                <small className="text-muted">Units</small>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
      <Col md={3}>
        <Card className="h-100 shadow-sm border-0">
          <Card.Body>
            <div className="d-flex flex-column h-100">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="text-muted mb-0">Total Actual</h6>
                <div
                  className="icon-box rounded-circle p-2"
                  style={{ backgroundColor: "#19875420" }}
                >
                  <FaCheckCircle color="#198754" />
                </div>
              </div>
              <div className="text-center">
                <h3 className="mb-1 fs-4" style={{ color: "#198754" }}>
                  {summary.totalActual.toLocaleString()}
                </h3>
                <small className="text-muted">Units</small>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
      <Col md={3}>
        <Card className="h-100 shadow-sm border-0">
          <Card.Body>
            <div className="d-flex flex-column h-100">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="text-muted mb-0">Missed Production</h6>
                <div
                  className="icon-box rounded-circle p-2"
                  style={{ backgroundColor: "#dc354520" }}
                >
                  <FaExclamationTriangle color="#dc3545" />
                </div>
              </div>
              <div className="text-center">
                <h3 className="mb-1 fs-4" style={{ color: "#dc3545" }}>
                  {summary.totalMissed.toLocaleString()}
                </h3>
                <small className="text-muted">Units Below Target</small>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
      <Col md={3}>
        <Card className="h-100 shadow-sm border-0">
          <Card.Body>
            <div className="d-flex flex-column h-100">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="text-muted mb-0">Extra Production</h6>
                <div
                  className="icon-box rounded-circle p-2"
                  style={{ backgroundColor: "#19875420" }}
                >
                  <FaCheckCircle color="#198754" />
                </div>
              </div>
              <div className="text-center">
                <h3 className="mb-1 fs-4" style={{ color: "#198754" }}>
                  {summary.totalExtra.toLocaleString()}
                </h3>
                <small className="text-muted">Units Above Target</small>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );

  // Render production comparison chart
  const renderProductionComparisonChart = () => (
    <Card className="shadow-sm border-0 mb-4">
      <Card.Header className="bg-white">
        <h6 className="mb-0">Production Comparison by Item</h6>
      </Card.Header>
      <Card.Body>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
            barSize={30}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              interval={0}
              tick={{ fontSize: 12, fill: "#666" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#666" }}
            />
            <Tooltip
              cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
              contentStyle={{
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              }}
            />
            <Legend />
            <Bar
              dataKey="planned"
              name="Planned"
              fill="#0d6efd"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="actual"
              name="Actual"
              fill="#198754"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </Card.Body>
    </Card>
  );

  // Render production trend chart
  const renderProductionTrendChart = () => (
    <Card className="shadow-sm border-0 mb-4">
      <Card.Header className="bg-white">
        <h6 className="mb-0">Production Efficiency Trend</h6>
      </Card.Header>
      <Card.Body>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart
            data={trendData}
            margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#666" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#666" }}
              domain={[90, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              cursor={{ stroke: "#f5f5f5" }}
              contentStyle={{
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              }}
              formatter={(value) => [`${value}%`, "Efficiency"]}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="efficiency"
              stroke="#0d6efd"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card.Body>
    </Card>
  );

  // Render production variance table
  const renderProductionVarianceTable = () => (
    <Card className="shadow-sm border-0">
      <Card.Header className="bg-white d-flex justify-content-between align-items-center">
        <h6 className="mb-0">Production Variance Details</h6>
        <div className="d-flex gap-2">
          <Form.Select
            className="text-8"
            size="sm"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            style={{ width: "120px" }}
          >
            <option value="month">This Month</option>
            <option value="week">This Week</option>
            <option value="today">Today</option>
          </Form.Select>
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
            <i className="fas fa-file-export"></i> Export Excel
          </Button>
        </div>
      </Card.Header>
      <Card.Body>
        <div className="table-responsive">
          <Table hover className="align-middle">
            <thead>
              <tr>
                <th>Date</th>
                <th>Item</th>
                <th>Warehouse</th>
                <th>Production Line</th>
                <th>Planned</th>
                <th>Actual</th>
                <th>Variance</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <tr key={item.id}>
                    <td>{item.date}</td>
                    <td>
                      <div>{item.itemName}</div>
                      <small className="text-muted">{item.itemType}</small>
                    </td>
                    <td>{item.warehouse}</td>
                    <td>{item.productionLine}</td>
                    <td>{item.planned.toLocaleString()}</td>
                    <td>{item.actual.toLocaleString()}</td>
                    <td>
                      <span
                        className={
                          item.variance < 0
                            ? "text-danger"
                            : item.variance > 0
                            ? "text-success"
                            : ""
                        }
                      >
                        {item.variance > 0 ? "+" : ""}
                        {item.variance.toLocaleString()}
                      </span>
                    </td>
                    <td>
                      <Badge
                        bg={item.status === "Missed" ? "danger" : "success"}
                      >
                        {item.status}
                      </Badge>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-3">
                    No production variance data found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
  );

  return (
    <div>
      {/* KPI Cards */}
      {renderKpiCards()}

      {/* Charts Row */}
      <Row className="mb-4">
        <Col lg={6}>{renderProductionComparisonChart()}</Col>
        <Col lg={6}>{renderProductionTrendChart()}</Col>
      </Row>

      {/* Production Variance Table */}
      <Row className="mb-4">
        <Col lg={12}>{renderProductionVarianceTable()}</Col>
      </Row>
    </div>
  );
};

export default SalesDashboard;
