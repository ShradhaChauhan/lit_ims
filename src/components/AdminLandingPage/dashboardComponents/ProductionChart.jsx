import React, { useState, useEffect } from "react";
import { Card, Form } from "react-bootstrap";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
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
import ProductionKpiCharts from "./ProductionKpiCharts";
import QualityDashboard from "./QualityDashboard";
import StockDashboard from "./StockDashboard";

const ProductionChart = ({ activeTab }) => {
  const [chartType, setChartType] = useState("line");
  const [timeRange, setTimeRange] = useState("day");
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (activeTab === "quality" || activeTab === "store") return; // Skip data fetching for quality and store tabs

      setIsLoading(true);
      try {
        // Try to use existing API endpoints based on the active tab
        let endpoint = "";
        switch (activeTab) {
          case "production":
            endpoint = "/api/production-receipt/table";
            break;
          default:
            // Use dummy data for tabs without API
            setChartData(generateDummyData(timeRange, activeTab));
            setIsLoading(false);
            return;
        }

        const response = await api.get(endpoint);
        // Process the data based on the active tab
        let processedData = [];

        if (activeTab === "production") {
          processedData = processProductionData(response.data.data, timeRange);
        }

        setChartData(processedData);
      } catch (error) {
        console.error(`Error fetching ${activeTab} data:`, error);
        // Fallback to dummy data on error
        setChartData(generateDummyData(timeRange, activeTab));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activeTab, timeRange]);

  // Process production data
  const processProductionData = (data, timeRange) => {
    // This is a placeholder for data processing logic
    return generateDummyData(timeRange, "production");
  };

  // Generate dummy data for demonstration
  const generateDummyData = (timeRange, tab) => {
    const data = [];
    let points = 0;

    switch (timeRange) {
      case "day":
        points = 24; // 24 hours
        break;
      case "week":
        points = 7; // 7 days
        break;
      case "month":
        points = 30; // 30 days
        break;
      default:
        points = 24;
    }

    // Generate data based on tab
    for (let i = 0; i < points; i++) {
      let entry = {};

      if (timeRange === "day") {
        entry.name = `${i}:00`;
      } else if (timeRange === "week") {
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        entry.name = days[i % 7];
      } else {
        entry.name = `Day ${i + 1}`;
      }

      switch (tab) {
        case "production":
          entry.output = Math.floor(Math.random() * 100) + 50;
          entry.target = 100;
          entry.efficiency = Math.floor(Math.random() * 30) + 70;
          break;
        case "sales":
          entry.revenue = Math.floor(Math.random() * 10000) + 5000;
          entry.target = 12000;
          entry.orders = Math.floor(Math.random() * 20) + 5;
          break;
        case "vendor":
          entry.onTime = Math.floor(Math.random() * 20) + 80;
          entry.quality = Math.floor(Math.random() * 10) + 90;
          entry.cost = Math.floor(Math.random() * 30) + 70;
          break;
        case "workforce":
          entry.productivity = Math.floor(Math.random() * 20) + 80;
          entry.attendance = Math.floor(Math.random() * 10) + 90;
          entry.overtime = Math.floor(Math.random() * 20);
          break;
        default:
          entry.value = Math.floor(Math.random() * 100);
      }

      data.push(entry);
    }

    return data;
  };

  const renderChart = () => {
    if (isLoading) {
      return <div className="text-center py-5">Loading chart data...</div>;
    }

    const getChartConfig = () => {
      switch (activeTab) {
        case "production":
          return {
            lines: [
              { dataKey: "output", stroke: "#8884d8", name: "Output" },
              { dataKey: "target", stroke: "#82ca9d", name: "Target" },
              {
                dataKey: "efficiency",
                stroke: "#ffc658",
                name: "Efficiency %",
              },
            ],
            areas: [
              {
                dataKey: "output",
                fill: "#8884d8",
                stroke: "#8884d8",
                name: "Output",
              },
              {
                dataKey: "target",
                fill: "#82ca9d",
                stroke: "#82ca9d",
                name: "Target",
              },
            ],
            bars: [
              { dataKey: "output", fill: "#8884d8", name: "Output" },
              { dataKey: "target", fill: "#82ca9d", name: "Target" },
            ],
          };
        case "sales":
          return {
            lines: [
              { dataKey: "revenue", stroke: "#8884d8", name: "Revenue" },
              { dataKey: "target", stroke: "#82ca9d", name: "Target" },
              { dataKey: "orders", stroke: "#ffc658", name: "Orders" },
            ],
            areas: [
              {
                dataKey: "revenue",
                fill: "#8884d8",
                stroke: "#8884d8",
                name: "Revenue",
              },
              {
                dataKey: "target",
                fill: "#82ca9d",
                stroke: "#82ca9d",
                name: "Target",
              },
            ],
            bars: [
              { dataKey: "revenue", fill: "#8884d8", name: "Revenue" },
              { dataKey: "orders", fill: "#ffc658", name: "Orders" },
            ],
          };
        case "vendor":
          return {
            lines: [
              {
                dataKey: "onTime",
                stroke: "#8884d8",
                name: "On-Time Delivery %",
              },
              {
                dataKey: "quality",
                stroke: "#82ca9d",
                name: "Quality Rating %",
              },
              { dataKey: "cost", stroke: "#ffc658", name: "Cost Efficiency %" },
            ],
            areas: [
              {
                dataKey: "onTime",
                fill: "#8884d8",
                stroke: "#8884d8",
                name: "On-Time Delivery %",
              },
              {
                dataKey: "quality",
                fill: "#82ca9d",
                stroke: "#82ca9d",
                name: "Quality Rating %",
              },
            ],
            bars: [
              {
                dataKey: "onTime",
                fill: "#8884d8",
                name: "On-Time Delivery %",
              },
              { dataKey: "quality", fill: "#82ca9d", name: "Quality Rating %" },
              { dataKey: "cost", fill: "#ffc658", name: "Cost Efficiency %" },
            ],
          };
        case "workforce":
          return {
            lines: [
              {
                dataKey: "productivity",
                stroke: "#8884d8",
                name: "Productivity %",
              },
              {
                dataKey: "attendance",
                stroke: "#82ca9d",
                name: "Attendance %",
              },
              {
                dataKey: "overtime",
                stroke: "#ffc658",
                name: "Overtime Hours",
              },
            ],
            areas: [
              {
                dataKey: "productivity",
                fill: "#8884d8",
                stroke: "#8884d8",
                name: "Productivity %",
              },
              {
                dataKey: "attendance",
                fill: "#82ca9d",
                stroke: "#82ca9d",
                name: "Attendance %",
              },
            ],
            bars: [
              {
                dataKey: "productivity",
                fill: "#8884d8",
                name: "Productivity %",
              },
              { dataKey: "attendance", fill: "#82ca9d", name: "Attendance %" },
              { dataKey: "overtime", fill: "#ffc658", name: "Overtime Hours" },
            ],
          };
        default:
          return {
            lines: [{ dataKey: "value", stroke: "#8884d8", name: "Value" }],
            areas: [
              {
                dataKey: "value",
                fill: "#8884d8",
                stroke: "#8884d8",
                name: "Value",
              },
            ],
            bars: [{ dataKey: "value", fill: "#8884d8", name: "Value" }],
          };
      }
    };

    const config = getChartConfig();

    switch (chartType) {
      case "line":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {config.lines.map((line, index) => (
                <Line
                  key={index}
                  type="monotone"
                  dataKey={line.dataKey}
                  stroke={line.stroke}
                  name={line.name}
                  activeDot={{ r: 8 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );
      case "area":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {config.areas.map((area, index) => (
                <Area
                  key={index}
                  type="monotone"
                  dataKey={area.dataKey}
                  fill={area.fill}
                  stroke={area.stroke}
                  name={area.name}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              {config.bars.map((bar, index) => (
                <Bar
                  key={index}
                  dataKey={bar.dataKey}
                  fill={bar.fill}
                  name={bar.name}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  // Render Quality Dashboard for quality tab
  if (activeTab === "quality") {
    return <QualityDashboard />;
  }

  // Render Stock Dashboard for store tab
  if (activeTab === "store") {
    return <StockDashboard />;
  }

  return (
    <>
      {/* Show KPI charts only in Production tab */}
      {activeTab === "production" && <ProductionKpiCharts />}

      <Card className="shadow-sm border-0 mb-4">
        <Card.Header className="bg-white d-flex justify-content-between align-items-center">
          <h6 className="mb-0">
            {activeTab === "production" && "Production Output"}
            {activeTab === "sales" && "Sales Performance"}
            {/* {activeTab === 'vendor' && 'Vendor Rating'} */}
            {/* {activeTab === "workforce" && "Workforce Analytics"} */}
          </h6>
          <div className="d-flex">
            <Form.Select
              size="sm"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="me-2 text-8"
              style={{ width: "120px" }}
            >
              <option value="day">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </Form.Select>
            <Form.Select
              size="sm"
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              style={{ width: "100px" }}
            >
              <option value="line">Line</option>
              <option value="area">Area</option>
              <option value="bar">Bar</option>
            </Form.Select>
          </div>
        </Card.Header>
        <Card.Body>{renderChart()}</Card.Body>
      </Card>
    </>
  );
};

export default ProductionChart;
