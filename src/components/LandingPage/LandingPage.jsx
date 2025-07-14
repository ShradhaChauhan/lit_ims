import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { toast } from "react-toastify";
import api from "../../services/api";
import { Link } from "react-router-dom";

const LandingPage = () => {
  const [data, setData] = useState([]);

  const COLORS = ["#2e7d32", "#d32f2f", "#f9a825"]; // Green, Red, Yellow

  const getPassFailQC = async () => {
    try {
      const response = await api.get("/api/receipt/qc-status/result");

      const rawData = response.data.data;

      // Group by status and sum quantities
      const statusMap = {};

      rawData.forEach((item) => {
        const status = item.status.toUpperCase();
        const quantity = Number(item.quantity);

        statusMap[status] = (statusMap[status] || 0) + quantity;
      });

      // Convert to chart-friendly format
      const chartData = Object.entries(statusMap).map(([status, count]) => ({
        status,
        count,
      }));

      setData(chartData);
    } catch (error) {
      toast.error("Error: Unable to fetch pass/fail QC.");
      console.error("Error fetching pass/fail QC:", error);
    }
  };

  useEffect(() => {
    getPassFailQC();
  }, []);

  return (
    <div>
      {" "}
      {/* Header section */}
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
        <div style={{ width: "100%", height: 400 }}>
          <h4 className="text-center mb-3">Quality Check Status</h4>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={120}
                fill="#8884d8"
                label
              >
                {data.map((entry, index) => (
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
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
