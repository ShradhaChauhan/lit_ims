import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  FaTachometerAlt,
  FaCalendarAlt,
  FaFileInvoiceDollar,
  FaCogs,
  FaWallet,
  FaChartLine,
} from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";

// Sample data for Bar Chart
const barData = [
  { name: "Picklist Created", value: 12 },
  { name: "POD Created", value: 9 },
  { name: "Loads Generated", value: 8 },
  { name: "In Transit", value: 4 },
];

// Colors for Bar Chart
const barColors = ["#6366f1", "#a855f7", "#facc15", "#22c55e"];

// Data for Gauge Chart
const gaugeData = [
  { name: "On Time", value: 60, color: "#22c55e" },
  { name: "Delayed", value: 25, color: "#facc15" },
  { name: "Critical", value: 15, color: "#ef4444" },
];

const StoreLandingPage = () => {
  return (
    <div className="d-flex bg-dark text-light" style={{ minHeight: "100vh" }}>
      {/* Main Content */}
      <div className="flex-grow-1 p-4">
        {/* Summary Cards */}
        <div className="row mb-4">
          <div className="col-md-3">
            <div
              className="card text-center text-white"
              style={{ background: "#6366f1" }}
            >
              <div className="card-body">
                <h6>Shipments Today</h6>
                <h2>18</h2>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div
              className="card text-center text-white"
              style={{ background: "#22c55e" }}
            >
              <div className="card-body">
                <h6>On-Time</h6>
                <h2>10</h2>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div
              className="card text-center text-dark"
              style={{ background: "#facc15" }}
            >
              <div className="card-body">
                <h6>Delayed</h6>
                <h2>5</h2>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div
              className="card text-center text-white"
              style={{ background: "#ef4444" }}
            >
              <div className="card-body">
                <h6>Critical</h6>
                <h2>3</h2>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="row mb-4">
          {/* Bar Chart */}
          <div className="col-md-6">
            <div className="card bg-dark p-3">
              <h6>Today Status</h6>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={barData}>
                  <XAxis dataKey="name" stroke="#fff" />
                  <YAxis stroke="#fff" />
                  <Tooltip />
                  <Bar dataKey="value">
                    {barData.map((entry, index) => (
                      <Cell key={index} fill={barColors[index]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gauge Chart */}
          <div className="col-md-6">
            <div className="card bg-dark p-3 text-center">
              <h6>Delivery Timeliness</h6>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={gaugeData}
                    cx="50%"
                    cy="100%"
                    startAngle={180}
                    endAngle={0}
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {gaugeData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="card bg-dark p-3">
          <h6>Recent Shipments</h6>
          <table className="table table-dark table-striped">
            <thead>
              <tr>
                <th>Shipment ID</th>
                <th>Origin</th>
                <th>Destination</th>
                <th>ETA</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>SHIP1234</td>
                <td>NY</td>
                <td>LA</td>
                <td>2025-08-12</td>
                <td>
                  <span className="badge bg-success">On Time</span>
                </td>
              </tr>
              <tr>
                <td>SHIP5678</td>
                <td>TX</td>
                <td>CA</td>
                <td>2025-08-14</td>
                <td>
                  <span className="badge bg-warning text-dark">Delayed</span>
                </td>
              </tr>
              <tr>
                <td>SHIP9012</td>
                <td>FL</td>
                <td>NV</td>
                <td>2025-08-16</td>
                <td>
                  <span className="badge bg-danger">Critical</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StoreLandingPage;
