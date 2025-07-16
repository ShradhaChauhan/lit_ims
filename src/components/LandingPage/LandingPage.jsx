import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import "./LandingPage.css";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
  LabelList,
} from "recharts";
import api from "../../services/api";
import { toast } from "react-toastify";

// Sample data - replace with actual API calls in production
const inventoryStatusData = [
  { name: "In Stock", value: 65, color: "#4CAF50" },
  { name: "Low Stock", value: 25, color: "#FFC107" },
  { name: "Out of Stock", value: 10, color: "#F44336" },
];

const monthlyInventoryData = [
  { name: "Jan", inflow: 4000, outflow: 2400 },
  { name: "Feb", inflow: 3000, outflow: 1398 },
  { name: "Mar", inflow: 2000, outflow: 9800 },
  { name: "Apr", inflow: 2780, outflow: 3908 },
  { name: "May", inflow: 1890, outflow: 4800 },
  { name: "Jun", inflow: 2390, outflow: 3800 },
  { name: "Jul", inflow: 3490, outflow: 4300 },
];

const topMovingItems = [
  { name: "Item A", quantity: 120 },
  { name: "Item B", quantity: 98 },
  { name: "Item C", quantity: 86 },
  { name: "Item D", quantity: 75 },
  { name: "Item E", quantity: 62 },
];

// Custom tooltip for QC status
const QCTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="label">{`${payload[0].name}: ${payload[0].value}`}</p>
        <p className="desc">{getQCDescription(payload[0].name)}</p>
      </div>
    );
  }
  return null;
};

// Helper function to get QC status description
const getQCDescription = (status) => {
  switch (status) {
    case "Pass":
      return "Items that passed quality check";
    case "Fail":
      return "Items that failed quality check";
    case "Pending":
      return "Items awaiting quality inspection";
    default:
      return "Unknown status";
  }
};

// Color mapping for QC status
const QC_COLORS = {
  Pass: "#2e7d32", // Green
  Fail: "#d32f2f", // Red
  Pending: "#f9a825", // Amber
};

const LandingPage = () => {
  const { rightSideComponent, setRightSideComponent } = useContext(AppContext);
  const [qcData, setQcData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inventorySummary, setInventorySummary] = useState({
    totalItems: 0,
    totalValue: 0,
    lowStockItems: 0,
    recentTransactions: 0,
  });
  const [qcSummary, setQcSummary] = useState({
    total: 0,
    passRate: 0,
    failRate: 0,
    pendingRate: 0,
  });

  // Fetch QC data from the correct API endpoint
  const getQCData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/api/receipt/iqc-count");
      const { data } = response.data;

      // Calculate total
      const totalCount = data.pendingCount + data.passCount + data.failCount;

      // Format data for chart
      const chartData = [
        { name: "Pass", value: data.passCount, fill: QC_COLORS["Pass"] },
        { name: "Fail", value: data.failCount, fill: QC_COLORS["Fail"] },
        {
          name: "Pending",
          value: data.pendingCount,
          fill: QC_COLORS["Pending"],
        },
      ];

      // Calculate rates
      setQcSummary({
        total: totalCount,
        passRate: totalCount
          ? Math.round((data.passCount / totalCount) * 100)
          : 0,
        failRate: totalCount
          ? Math.round((data.failCount / totalCount) * 100)
          : 0,
        pendingRate: totalCount
          ? Math.round((data.pendingCount / totalCount) * 100)
          : 0,
      });

      setQcData(chartData);
    } catch (error) {
      toast.error("Error: Unable to fetch QC data.");
      console.error("Error fetching QC data:", error);

      // Set default data for visualization
      const defaultData = [
        { name: "Pass", value: 10, fill: QC_COLORS["Pass"] },
        { name: "Fail", value: 0, fill: QC_COLORS["Fail"] },
        { name: "Pending", value: 5, fill: QC_COLORS["Pending"] },
      ];

      setQcData(defaultData);
      setQcSummary({
        total: 15,
        passRate: 67,
        failRate: 0,
        pendingRate: 33,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch inventory summary data
  const getInventorySummary = async () => {
    // In a real application, replace this with actual API call
    setInventorySummary({
      totalItems: 1245,
      totalValue: 567890,
      lowStockItems: 28,
      recentTransactions: 156,
    });
  };

  useEffect(() => {
    getQCData();
    getInventorySummary();
  }, []);

  return (
    <div className="dashboard-container">
      {/* Simple Header */}
      <div className="dashboard-header">
        <div>
          <h2 className="dashboard-title">Dashboard</h2>
          <p className="dashboard-breadcrumb">
            <Link to="/dashboard">
              <i className="fas fa-home"></i>
            </Link>
            <span> / Dashboard</span>
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="card-icon blue">
            <i className="fas fa-box"></i>
          </div>
          <div className="card-content">
            <h3>{inventorySummary.totalItems}</h3>
            <p>Total Items</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon green">
            <i className="fas fa-dollar-sign"></i>
          </div>
          <div className="card-content">
            <h3>${inventorySummary.totalValue.toLocaleString()}</h3>
            <p>Inventory Value</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon orange">
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <div className="card-content">
            <h3>{inventorySummary.lowStockItems}</h3>
            <p>Low Stock Items</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon purple">
            <i className="fas fa-exchange-alt"></i>
          </div>
          <div className="card-content">
            <h3>{inventorySummary.recentTransactions}</h3>
            <p>Recent Transactions</p>
          </div>
        </div>
      </div>

      {/* Enhanced Quality Check Status */}
      <div className="chart-container qc-status-container">
        <div className="chart-header">
          <h3>Quality Check Status</h3>
          <Link to="/incoming-qc" className="view-all-link">
            View All QC Records <i className="fas fa-arrow-right"></i>
          </Link>
        </div>

        {isLoading ? (
          <div className="loading-indicator">
            <i className="fas fa-spinner fa-spin"></i> Loading QC data...
          </div>
        ) : (
          <div className="qc-content">
            <div className="qc-summary">
              <div className="qc-stat">
                <div className="stat-value">{qcSummary.total}</div>
                <div className="stat-label">Total Items</div>
              </div>
              <div className="qc-stat pass">
                <div className="stat-value">{qcSummary.passRate}%</div>
                <div className="stat-label">Pass Rate</div>
              </div>
              <div className="qc-stat fail">
                <div className="stat-value">{qcSummary.failRate}%</div>
                <div className="stat-label">Fail Rate</div>
              </div>
              <div className="qc-stat hold">
                <div className="stat-value">{qcSummary.pendingRate}%</div>
                <div className="stat-label">Pending Rate</div>
              </div>
            </div>

            <div className="qc-chart">
              {qcSummary.total === 0 ? (
                <div className="no-data-message">
                  <i className="fas fa-info-circle"></i> No QC data available at
                  this time.
                </div>
              ) : (
                <div className="qc-charts-container">
                  <div className="qc-pie-chart">
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={qcData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          label={(entry) => `${entry.name}: ${entry.value}`}
                        >
                          {qcData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip content={<QCTooltip />} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="qc-bar-chart">
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={qcData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip content={<QCTooltip />} />
                        <Bar
                          dataKey="value"
                          name="Quantity"
                          radius={[4, 4, 0, 0]}
                        >
                          {qcData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                          <LabelList dataKey="value" position="top" />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Charts Row 1 */}
      <div className="charts-row">
        <div className="chart-container">
          <div className="chart-header">
            <h3>Inventory Status</h3>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={inventoryStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                  label
                >
                  {inventoryStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-container">
          <div className="chart-header">
            <h3>Monthly Inventory Flow</h3>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={monthlyInventoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="inflow"
                  stackId="1"
                  stroke="#8884d8"
                  fill="#8884d8"
                />
                <Area
                  type="monotone"
                  dataKey="outflow"
                  stackId="1"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="charts-row">
        <div className="chart-container">
          <div className="chart-header">
            <h3>Top Moving Items</h3>
          </div>
          <div className="chart-body">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart layout="vertical" data={topMovingItems}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip />
                <Legend />
                <Bar dataKey="quantity" fill="#26a69a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="quick-links-container">
        <h3>Quick Actions</h3>
        <div className="quick-links">
          <Link to="/material-incoming" className="quick-link">
            <i className="fas fa-truck-loading"></i>
            <span>Material Incoming</span>
          </Link>
          <Link to="/issue-to-production" className="quick-link">
            <i className="fas fa-dolly"></i>
            <span>Issue to Production</span>
          </Link>
          <Link to="/inventory-audit-report" className="quick-link">
            <i className="fas fa-chart-bar"></i>
            <span>Inventory Report</span>
          </Link>
          <Link to="/item-master" className="quick-link">
            <i className="fas fa-boxes"></i>
            <span>Item Master</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
