import React, { useEffect, useState } from "react";
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
  RadialBarChart,
  RadialBar,
  LabelList,
} from "recharts";
import { toast } from "react-toastify";
import api from "../../services/api";
import { Link } from "react-router-dom";
import "./LandingPage.css";

const COLORS = ["#2e7d32", "#d32f2f", "#f9a825"];

const dummyFreshnessData = [
  { duration: "<3 Days", percent: 80 },
  { duration: "3-7 Days", percent: 85 },
  { duration: "8-14 Days", percent: 90 },
  { duration: "15-28 Days", percent: 86 },
];

const dummyTurnoverData = [
  { year: "30 Days", value: 10.7 },
  { year: "60 Days", value: 12.3 },
  { year: "90 Days", value: 12.1 },
  { year: "120 Days", value: 15.7 },
  { year: "150 Days", value: 17.1 },
];

const dummySellTimeData = [
  { category: "Food & Beverages", days: 4.2 },
  { category: "Household Care", days: 11.2 },
  { category: "Personal Care", days: 14.1 },
  { category: "Tobacco", days: 22.1 },
];

const GaugeChart = ({ title, value, max, color }) => {
  const data = [{ name: title, value }];

  return (
    <div style={{ width: 200, height: 160, textAlign: "center" }}>
      <h5>{title}</h5>
      <RadialBarChart
        width={200}
        height={160}
        innerRadius="70%"
        outerRadius="100%"
        data={data}
        startAngle={180}
        endAngle={0}
      >
        <RadialBar minAngle={15} clockWise dataKey="value" fill={color}>
          <LabelList
            dataKey="value"
            position="center"
            formatter={() => `${value}`}
          />
        </RadialBar>
      </RadialBarChart>
    </div>
  );
};

const LandingPage = () => {
  const [qcData, setQcData] = useState([]);

  const getPassFailQC = async () => {
    try {
      const response = await api.get("/api/receipt/qc-status/result");
      const rawData = response.data.data;

      const statusMap = {};
      rawData.forEach((item) => {
        const status = item.status.toUpperCase();
        const quantity = Number(item.quantity);
        statusMap[status] = (statusMap[status] || 0) + quantity;
      });

      const chartData = Object.entries(statusMap).map(([status, count]) => ({
        status,
        count,
      }));

      setQcData(chartData);
    } catch (error) {
      toast.error("Error: Unable to fetch QC status.");
      console.error("Error fetching QC data:", error);
    }
  };

  useEffect(() => {
    getPassFailQC();
  }, []);

  return (
    <div className="p-4">
      {/* Header */}
      <nav className="navbar bg-light border-body" data-bs-theme="light">
        <div className="container-fluid">
          <div className="mt-4">
            <h3 className="nav-header header-style">Dashboard</h3>
            <p className="breadcrumb">
              <Link to="/dashboard">
                <i className="fas fa-home text-8"></i>
              </Link>{" "}
              <span className="ms-1 mt-1 text-small-gray">/ Dashboard</span>
            </p>
          </div>
        </div>
      </nav>
      <div>
        <div className="dashboard-card section">
          <h4 className="text-center mb-3">Quality Check Status</h4>
          {/* Section: Gauges */}
          <div className="d-flex gap-4 flex-wrap justify-content-center mt-4">
            <GaugeChart title="Pass" value={120} max={30} color="#2e7d32" />
            <GaugeChart title="Hold" value={50} max={10} color="#f9a825" />
            <GaugeChart title="Fail" value={15} max={100} color="#d32f2f" />
          </div>
        </div>
        {/* Section: QC Pie Chart */}
        {/* <div style={{ width: "100%", height: 400, marginTop: 40 }}>
        <h4 className="text-center mb-3">Quality Check Status</h4>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={qcData}
              dataKey="count"
              nameKey="status"
              cx="50%"
              cy="50%"
              outerRadius={120}
              label
            >
              {qcData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div> */}

        {/* Section: Paytm Model Production */}
        <div className="mt-5 dashboard-card section">
          <h4 className="text-center mb-3">Paytm Model Production</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dummyFreshnessData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="duration" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="percent" fill="#6fcce8ff" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Section: Inventory Turnover */}
        <div className="mt-5 dashboard-card section">
          <h4 className="text-center mb-3">Ageing Report</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dummyTurnoverData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#26a69a" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Section: Avg Time to Sell */}
        {/* <div className="mt-5">
        <h4 className="text-center mb-3">Average Time to Sell (in Days)</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dummySellTimeData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="category" type="category" />
            <Tooltip />
            <Bar dataKey="days" fill="#ab47bc" />
          </BarChart>
        </ResponsiveContainer>
      </div> */}
      </div>
    </div>
  );
};

export default LandingPage;
