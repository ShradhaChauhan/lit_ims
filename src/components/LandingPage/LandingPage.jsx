import React, { useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css";
import {
  FaBoxOpen,
  FaClock,
  FaClipboardCheck,
  FaIndustry,
  FaTruckLoading,
  FaShippingFast,
  FaUndoAlt,
  FaChartLine,
} from "react-icons/fa";
import api from "../../services/api";
import { toast } from "react-toastify";

const cardData = [
  {
    title: "Total Items",
    value: "15,234",
    change: "+12% from last month",
    icon: <FaBoxOpen />,
    iconColor: "bg-primary",
    changeColor: "text-success",
  },
  {
    title: "Pending Approvals",
    value: "8",
    change: "+3 from yesterday",
    icon: <FaClock />,
    iconColor: "bg-warning",
    changeColor: "text-danger",
  },
  {
    title: "QC Pending",
    value: "12",
    change: "+5 from yesterday",
    icon: <FaClipboardCheck />,
    iconColor: "bg-danger",
    changeColor: "text-danger",
  },
  {
    title: "Production Orders",
    value: "23",
    change: "+8% from last week",
    icon: <FaIndustry />,
    iconColor: "bg-success",
    changeColor: "text-success",
  },
  {
    title: "Incoming Process",
    value: "47",
    change: "15 pending QC",
    icon: <FaTruckLoading />,
    iconColor: "bg-primary",
    changeColor: "text-success",
  },
  {
    title: "Production Dispatch",
    value: "34",
    change: "8 pending issue",
    icon: <FaShippingFast />,
    iconColor: "bg-info",
    changeColor: "text-success",
  },
  {
    title: "WIP Returns",
    value: "7",
    change: "-2 from yesterday",
    icon: <FaUndoAlt />,
    iconColor: "bg-warning",
    changeColor: "text-danger",
  },
  {
    title: "Audit Accuracy",
    value: "94.3%",
    change: "+2.1% from last audit",
    icon: <FaChartLine />,
    iconColor: "bg-success",
    changeColor: "text-success",
  },
];

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const dataSets = {
  7: [
    { name: "Mon", Inward: 70, Outward: 30 },
    { name: "Tue", Inward: 60, Outward: 50 },
    { name: "Wed", Inward: 80, Outward: 40 },
    { name: "Thu", Inward: 65, Outward: 70 },
    { name: "Fri", Inward: 60, Outward: 90 },
    { name: "Sat", Inward: 55, Outward: 40 },
    { name: "Sun", Inward: 45, Outward: 85 },
  ],
  30: [
    // Add realistic or dummy data
  ],
  90: [
    // Add realistic or dummy data
  ],
};

// Sliding window dummy data
const frames = [
  { id: 1, text: "Frame 1: Welcome to Inventory" },
  { id: 2, text: "Frame 2: Track your Orders" },
  { id: 3, text: "Frame 3: Review Reports" },
  { id: 4, text: "Frame 4: Analyze Stock" },
];

const LandingPage = () => {
  const [range, setRange] = useState("7");

  // Sliding window
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % frames.length);
    }, 4000); // every 4 seconds

    return () => clearInterval(interval); // cleanup
  }, []);

  // Line Chart
  const LineChartCard = ({ title, data }) => (
    <div style={{ width: "100%", height: 300, boxSizing: "border-box" }}>
      <h5 className="text-center mb-3">{title}</h5>
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="inward"
            stroke="#007bff"
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="outward"
            stroke="#dc3545"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  // Banner Carousel
  const chartData = [
    {
      title: "Week 1",
      lineColor1: "#3b82f6",
      lineColor2: "#ef4444",
      data: [
        { day: "Mon", inward: 50, outward: 30 },
        { day: "Tue", inward: 45, outward: 40 },
        { day: "Wed", inward: 65, outward: 30 },
        { day: "Thu", inward: 70, outward: 20 },
        { day: "Fri", inward: 60, outward: 80 },
        { day: "Sat", inward: 55, outward: 50 },
        { day: "Sun", inward: 40, outward: 75 },
      ],
    },
    {
      title: "Week 2",
      lineColor1: "#a23bf6ff",
      lineColor2: "#ef5e44ff",
      data: [
        { day: "Mon", inward: 30, outward: 25 },
        { day: "Tue", inward: 35, outward: 30 },
        { day: "Wed", inward: 50, outward: 45 },
        { day: "Thu", inward: 60, outward: 40 },
        { day: "Fri", inward: 55, outward: 60 },
        { day: "Sat", inward: 70, outward: 50 },
        { day: "Sun", inward: 65, outward: 55 },
      ],
    },
    // Add more as needed
  ];

  const [current, setCurrent] = useState(0);
  const intervalRef = useRef(null);
  const total = chartData.length;

  // Auto-slide
  useEffect(() => {
    startAutoSlide();
    return stopAutoSlide;
  }, []);

  const startAutoSlide = () => {
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % total);
    }, 9000);
  };

  const stopAutoSlide = () => {
    clearInterval(intervalRef.current);
  };

  const handlePrev = () => {
    setCurrent((prev) => (prev - 1 + total) % total);
  };

  const handleNext = () => {
    setCurrent((prev) => (prev + 1) % total);
  };

  return (
    <div className="dashboard-container">
      {/* Header section */}
      <nav className="navbar bg-light border-body" data-bs-theme="light">
        <div className="container-fluid p-0">
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

      {/* Banner  */}
      <div className="summary row g-4">
        {cardData.map((card, index) => (
          <div className="col-sm-6 col-md-4 col-lg-3" key={index}>
            <div className="card h-100 shadow-sm border-0 rounded-3">
              <div className="card-body d-flex flex-column">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <h6 className="text-muted">{card.title}</h6>
                  <div
                    className={`icon-box text-white d-flex align-items-center justify-content-center rounded-circle ${card.iconColor}`}
                    style={{ width: 32, height: 32 }}
                  >
                    {card.icon}
                  </div>
                </div>
                <h4 className="fw-bold">{card.value}</h4>
                <p className={`mb-0 small ${card.changeColor}`}>
                  {card.change}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Banner Carousel */}
      <div
        className="graph-carousel border rounded position-relative p-3 bg-white shadow-sm mt-4 p-4"
        onMouseEnter={stopAutoSlide}
        onMouseLeave={startAutoSlide}
      >
        <button className="carousel-arrow left" onClick={handlePrev}>
          &#8249;
        </button>
        <button className="carousel-arrow right" onClick={handleNext}>
          &#8250;
        </button>

        <h5 className="text-center">{chartData[current].title}</h5>
        {/* Buttons on Right */}
        {/* <div className="text-end flex-grow-1">
              {["7", "30", "90"].map((day) => (
                <button
                  key={day}
                  className={`btn btn-sm mx-1 ${
                    range === day ? "btn-primary" : "btn-outline-secondary"
                  }`}
                  onClick={() => setRange(day)}
                >
                  {day} Days
                </button>
              ))}
            </div> */}
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData[current].data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="inward"
              stroke={chartData[current].lineColor1}
              strokeWidth={3}
            />
            <Line
              type="monotone"
              dataKey="outward"
              stroke={chartData[current].lineColor2}
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default LandingPage;
