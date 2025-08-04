import React, { useContext, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  FaMoneyBill,
  FaReceipt,
  FaExclamation,
  FaClipboardList,
  FaArrowRight,
  FaArrowAltCircleLeft,
  FaArrowAltCircleRight,
  FaCross,
  FaTimes,
  FaExclamationTriangle,
} from "react-icons/fa";
import api from "../../services/api";
import { toast } from "react-toastify";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  format,
  parse,
  eachDayOfInterval,
  startOfMonth,
  endOfMonth,
  parseISO,
  isSameDay,
  isValid,
} from "date-fns";
import { AppContext } from "../../context/AppContext";

// Sliding window dummy data
const frames = [
  { id: 1, text: "Frame 1: Welcome to Inventory" },
  { id: 2, text: "Frame 2: Track your Orders" },
  { id: 3, text: "Frame 3: Review Reports" },
  { id: 4, text: "Frame 4: Analyze Stock" },
];

const LandingPage = () => {
  // All states
  const [totalItems, setTotalItems] = useState(0);
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const [pendingQC, setPendingQC] = useState(0);
  const [qcPassCount, setQcPassCount] = useState(0);
  const [qcFailCount, setQcFailCount] = useState(0);
  const [materialRequest, setMaterialRequest] = useState(0);
  const [materialReceipt, setMaterialReceipt] = useState(0);
  const [wipReturn, setWipReturn] = useState(0);
  const [materialTransfer, setMaterialTransfer] = useState(0);
  const [selectedItem, setSelectedItem] = useState("");
  const [items, setItems] = useState([]);
  const [current, setCurrent] = useState(0);
  const intervalRef = useRef(null);
  const [range, setRange] = useState("7");
  const [lineChartData, setLineChartData] = useState([]);
  const [qcLineChartData, setQCLineChartData] = useState([]);
  const [materialReceiptData, setMaterialReceiptData] = useState([]);
  const [wipReturnData, setWipReturnData] = useState([]);
  const [wipRejectedItems, setWipRejectedItems] = useState([]);
  const [incomingMaterialToday, setIncomingMaterialToday] = useState([]);
  const { istoken } = useContext(AppContext);
  // Sliding window
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // if (istoken) {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % frames.length);
    }, 10000); // every 4 seconds

    return () => clearInterval(interval); // cleanup
    // }
  }, []);

  // Fetch Pending QC
  const fetchStoreItems = async () => {
    try {
      const response = await api.get("/api/items/all");
      setItems(response.data.data);
    } catch (error) {
      toast.error("Error in fetching items list");
      console.error("Error fetching items list:", error);
    }
  };

  useEffect(() => {
    fetchStoreItems();
  }, []);

  // Fetch QC Pass/Fail list
  const fetchQCPassFail = async () => {
    try {
      const response = await api.get("/api/receipt/qc-status/result");
      const rawData = response.data.data;
      const today = new Date();

      // Step 1: Initialize all time slots (1 AM to 12 PM)
      const chartMap = {};
      for (let hour = 0; hour < 24; hour++) {
        const date = new Date();
        date.setHours(hour, 0, 0, 0);
        const timeStr = format(date, "h a"); // 1 AM, 2 PM, etc.
        chartMap[timeStr] = { time: timeStr, pass: 0, fail: 0 };
      }

      // Step 2: Add actual data
      rawData.forEach((entry) => {
        const parsedDate = parse(
          entry.createdAt,
          "dd-MM-yyyy hh:mm:ss a",
          new Date()
        );

        if (isSameDay(parsedDate, today)) {
          const timeStr = format(parsedDate, "h a");

          if (!chartMap[timeStr]) {
            chartMap[timeStr] = { time: timeStr, pass: 0, fail: 0 };
          }

          if (entry.status === "PASS") {
            chartMap[timeStr].pass += entry.quantity;
          } else if (entry.status === "FAIL") {
            chartMap[timeStr].fail += entry.quantity;
          }
        }
      });

      // Step 3: Convert and sort
      const chartDataArray = Object.values(chartMap).sort(
        (a, b) =>
          new Date(`2000-01-01 ${a.time}`) - new Date(`2000-01-01 ${b.time}`)
      );

      setLineChartData(chartDataArray);
    } catch (error) {
      toast.error("Error in fetching QC pass and fail list");
      console.error("Error fetching QC pass and fail list:", error);
    }
  };

  useEffect(() => {
    fetchQCPassFail();
  }, []);

  // Material Request
  const prepareChartData = (data) => {
    const today = new Date();
    const chartMap = {};

    // Step 1: Pre-fill all 24 hours with 0
    for (let h = 0; h < 24; h++) {
      const hour = new Date(2000, 0, 1, h); // dummy date
      const timeStr = format(hour, "h a"); // "1 AM", "2 PM", etc.
      chartMap[timeStr] = { time: timeStr, bom: 0, item: 0 };
    }

    // Step 2: Override with actual data (only today's)
    data.forEach((entry) => {
      const parsedDate = parse(
        entry.createdAt,
        "dd-MM-yyyy hh:mm:ss a",
        new Date()
      );

      if (isSameDay(parsedDate, today)) {
        const timeStr = format(parsedDate, "h a");
        const totalQty = entry.items.reduce((sum, i) => sum + i.quantity, 0);

        if (entry.type === "bom") chartMap[timeStr].bom += totalQty;
        else if (entry.type === "item") chartMap[timeStr].item += totalQty;
      }
    });

    // Step 3: Return sorted array by time
    return Object.values(chartMap).sort(
      (a, b) =>
        new Date(`2000-01-01 ${a.time}`) - new Date(`2000-01-01 ${b.time}`)
    );
  };

  const fetchMaterialRequestMonthly = async () => {
    try {
      const res = await api.get("/api/requisitions/recent");
      const fullMonthData = prepareChartData(res.data.data);
      setQCLineChartData(fullMonthData);
    } catch (error) {
      console.error("Error fetching material transfer data:", error);
    }
  };

  useEffect(() => {
    fetchMaterialRequestMonthly();
  }, []);

  // Material Issue Transfer
  const prepareReceiptChartData = (data) => {
    const today = new Date();
    const allDates = eachDayOfInterval({
      start: startOfMonth(today),
      end: endOfMonth(today),
    });

    // Step 1: Initialize all dates for the month
    const chartMap = {};
    allDates.forEach((dateObj) => {
      const dateStr = format(dateObj, "dd MMMM yyyy"); // e.g. "24 July 2025"
      chartMap[dateStr] = { day: dateStr, bom: 0, item: 0 };
    });

    // Step 2: Fill actual data
    data.forEach((entry) => {
      const parsedDate = parseISO(entry.receiptDate);

      // Skip if receiptDate is missing or invalid
      if (!entry.receiptDate || !isValid(parsedDate)) {
        console.warn("Skipping invalid or missing receiptDate entry:", entry);
        return;
      }

      const dateStr = format(parsedDate, "dd MMMM yyyy");

      // Skip if this date is outside the current month (i.e. not initialized in chartMap)
      if (!chartMap[dateStr]) {
        console.warn("Date not in current month range:", dateStr);
        return;
      }

      const itemCount = entry.items?.length || 0;

      if (entry.type === "bom") {
        chartMap[dateStr].bom += itemCount;
      } else if (entry.type === "item") {
        chartMap[dateStr].item += itemCount;
      }
    });

    // Step 3: Convert to sorted array
    return Object.values(chartMap).sort(
      (a, b) => new Date(a.day) - new Date(b.day)
    );
  };

  const fetchMaterialReceiptMonthly = async () => {
    try {
      const response = await api.get("/api/production-receipt/table");
      const fullMonthData = prepareReceiptChartData(response.data.data);
      setMaterialReceiptData(fullMonthData);
    } catch (error) {
      toast.error("Error in fetching material receipt data");
      console.error("Error fetching material receipt data:", error);
    }
  };

  useEffect(() => {
    fetchMaterialReceiptMonthly();
  }, []);

  // Banner Carousel

  // WIP Return
  const prepareWIPChartData = (data) => {
    const today = new Date();
    const allDates = eachDayOfInterval({
      start: startOfMonth(today),
      end: endOfMonth(today),
    });

    // Step 1: Initialize all dates in chartMap
    const chartMap = {};
    allDates.forEach((dateObj) => {
      const dateStr = format(dateObj, "dd MMMM yyyy");
      chartMap[dateStr] = {
        day: dateStr,
        defective: 0,
        excess: 0,
        reusable: 0,
      };
    });

    // Step 2: Aggregate values based on returnType
    data.forEach((entry) => {
      const parsedDate = parseISO(entry.date);
      const dateStr = format(parsedDate, "dd MMMM yyyy");

      const value = entry.totalValue || 0;

      if (!chartMap[dateStr]) {
        chartMap[dateStr] = {
          day: dateStr,
          defective: 0,
          excess: 0,
          reusable: 0,
        };
      }

      switch (entry.returnType) {
        case "Defective Material":
          chartMap[dateStr].defective += value;
          break;
        case "Excess Material":
          chartMap[dateStr].excess += value;
          break;
        default:
          break;
      }
    });

    return Object.values(chartMap).sort(
      (a, b) => new Date(a.day) - new Date(b.day)
    );
  };

  const fetchWipReturnMonthly = async () => {
    try {
      const response = await api.get("/api/wip-return/recent/summary");
      const fullMonthData = prepareWIPChartData(response.data.data);
      setWipReturnData(fullMonthData);
    } catch (error) {
      toast.error("Error in fetching material receipt data");
      console.error("Error fetching material receipt data:", error);
    }
  };

  useEffect(() => {
    fetchWipReturnMonthly();
  }, []);

  const fetchIncomingMaterialToday = async () => {
    try {
      const date = format(Date.now(), "yyyy-MM-dd");
      const response = await api.get(`/api/receipt/items-by-date?date=${date}`);
      setTotalItems(response.data.data.count);
      const rawData = response.data.data.items;
      const today = new Date();

      // Step 1: Initialize time slots using 0–23 as keys
      const chartMap = {};
      for (let hour = 0; hour < 24; hour++) {
        chartMap[hour] = {
          hour: hour, // numeric hour
          timeLabel: `${hour}:00`, // Optional: for display on X-axis
          inward: 0,
          outward: 0,
        };
      }

      // Step 2: Add actual data
      rawData.forEach((entry) => {
        const parsedDate = parse(
          entry.createdAt,
          "yyyy-MM-dd HH:mm:ss",
          new Date()
        );

        if (isSameDay(parsedDate, today)) {
          const hour = parsedDate.getHours(); // 0–23
          if (chartMap[hour]) {
            chartMap[hour].inward += 1;
          }
        }
      });

      // Step 3: Set chart data
      const chartDataArray = Object.values(chartMap);
      setIncomingMaterialToday(chartDataArray);
    } catch (error) {
      toast.error("Error in fetching material receipt data");
      console.error("Error fetching material receipt data:", error);
    }
  };

  useEffect(() => {
    fetchIncomingMaterialToday();
  }, []);

  const fetchWipRejectedItems = async () => {
    try {
      const response = await api.get("/api/wip-return/count-defective");
      console.log(response.data.data);
      setWipRejectedItems(response.data.data);
    } catch (error) {
      toast.error("Error in fetching wip rejected items");
      console.error("Error fetching wip rejected items:", error);
    }
  };

  useEffect(() => {
    fetchWipRejectedItems();
  }, []);

  const chartData = [
    {
      title: "Store Material Inward",
      lineColor1: "#3b82f6",
      lineColor2: "#efcd44ff",
      data: incomingMaterialToday,
    },
    {
      title: "IQC",
      lineColor1: "#0c8a40ff",
      lineColor2: "#d42f12ff",
      data: lineChartData,
    },
    {
      title: "Material Issue Request",
      lineColor1: "#550c8aff",
      lineColor2: "#e88711ff",
      data: qcLineChartData,
    },
    {
      title: "Material Receipt",
      lineColor1: "#8a0c55ff",
      lineColor2: "#1edabaff",
      data: materialReceiptData,
    },
    {
      title: "WIP Return",
      lineColor1: "#04f962ff",
      lineColor2: "#1e50daff",
      data: wipReturnData,
    },
  ];

  const total = chartData.length;
  // Auto-slide
  useEffect(() => {
    // if (istoken) {
    startAutoSlide();
    return stopAutoSlide;
    // }
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

  // Pie Chart Sample data
  const data =
    qcPassCount + qcFailCount + pendingQC === 0
      ? []
      : [
          { name: "QC Passed", value: qcPassCount },
          { name: "QC Failed", value: qcFailCount },
          { name: "QC Pending", value: pendingQC },
        ];

  const COLORS = ["#16A34A", "#DC2626", "#3B82F6"];

  const CustomLegend = ({ payload }) => {
    return (
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "10px",
          marginTop: "20px",
        }}
      >
        {payload.map((entry, index) => (
          <div
            key={`item-${index}`}
            style={{ display: "flex", alignItems: "center" }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                backgroundColor: entry.color,
                marginRight: 5,
              }}
            />
            <span style={{ fontSize: 14, color: entry.color }}>
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  // Fetch Total Items
  // const fetchTotalItems = async () => {
  //   try {
  //     const response = await api.get("/api/items/all");
  //     setTotalItems(response.data.data.length);
  //   } catch (error) {
  //     toast.error("Error in fetching total items");
  //     console.error("Error fetching total items:", error);
  //   }
  // };

  // useEffect(() => {
  //   fetchTotalItems();
  // }, []);

  // Fetch Pending Approvals
  const fetchPendingApprovals = async () => {
    try {
      const response = await api.get(
        "/api/stock-adjustments/requests?status=PENDING"
      );
      setPendingApprovals(response.data.data.length);
    } catch (error) {
      toast.error("Error in fetching pending approvals");
      console.error("Error fetching pending approvals:", error);
    }
  };

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  // Fetch Pending QC
  const fetchPendingQC = async () => {
    try {
      const response = await api.get("/api/receipt/iqc-count");
      setPendingQC(response.data.data.pendingCount);
      setQcPassCount(response.data.data.passCount);
      setQcFailCount(response.data.data.failCount);
    } catch (error) {
      toast.error("Error in fetching pending QC");
      console.error("Error fetching pending QC:", error);
    }
  };

  useEffect(() => {
    fetchPendingQC();
  }, []);

  // Fetch material request
  const fetchMaterialRequest = async () => {
    try {
      const response = await api.get("/api/requisitions/recent");
      setMaterialRequest(response.data.data.length);
    } catch (error) {
      toast.error("Error in fetching material request");
      console.error("Error fetching material request:", error);
    }
  };

  useEffect(() => {
    fetchMaterialRequest();
  }, []);

  // Fetch material receipt
  const fetchMaterialReceipt = async () => {
    try {
      const response = await api.get("/api/production-receipt/table");
      setMaterialReceipt(response.data.data.length);
    } catch (error) {
      toast.error("Error in fetching material receipt");
      console.error("Error fetching material receipt:", error);
    }
  };

  useEffect(() => {
    fetchMaterialReceipt();
  }, []);

  // Fetch material receipt
  const fetchWIPreturn = async () => {
    try {
      const response = await api.get("/api/wip-return/recent/summary");
      setWipReturn(response.data.data.length);
    } catch (error) {
      toast.error("Error in fetching wip return");
      console.error("Error fetching wip return:", error);
    }
  };

  useEffect(() => {
    fetchWIPreturn();
  }, []);

  // Fetch material receipt
  const fetchMaterialTransfer = async () => {
    try {
      const response = await api.get("/api/issue-production/all-issue");
      setMaterialTransfer(response.data.data.length);
    } catch (error) {
      toast.error("Error in fetching material transfer");
      console.error("Error fetching material transfer:", error);
    }
  };

  useEffect(() => {
    fetchMaterialTransfer();
  }, []);

  // Card data for line chart
  const cardData = [
    {
      title: "Total Incoming Material",
      value: totalItems,
      change:
        totalItems === 0
          ? "0 incoming material"
          : "+" + totalItems + " from yesterday",
      icon: <FaBoxOpen />,
      iconColor: "bg-primary",
      changeColor: "text-success",
    },
    {
      title: "QC Pending",
      value: pendingQC,
      change:
        pendingQC === 0 ? "0 pending QC" : "+" + pendingQC + " from yesterday",
      icon: <FaClipboardList />,
      iconColor: pendingQC === 0 ? "bg-warning" : "bg-danger",
      changeColor: pendingQC === 0 ? "text-success" : "text-danger",
    },
    {
      title: "Material Request",
      value: materialRequest,
      change:
        materialRequest === 0
          ? "0 material request"
          : "+" + materialRequest + " material request",
      icon: <FaIndustry />,
      iconColor: materialRequest === 0 ? "bg-success" : "bg-danger",
      changeColor: materialRequest === 0 ? "text-success" : "text-danger",
    },
    {
      title: "Pending Approvals",
      value: pendingApprovals,
      change:
        pendingApprovals === 0
          ? "0 pending approvals"
          : "+" + pendingApprovals + " pending approvals",
      icon: <FaClock />,
      iconColor: pendingApprovals === 0 ? "bg-warning" : "bg-danger",
      changeColor: pendingApprovals === 0 ? "text-success" : "text-danger",
    },
    {
      title: "Material Transfer",
      value: materialTransfer,
      change:
        materialTransfer === 0
          ? "0 material transfer"
          : "+" + materialTransfer + " material transfer",
      icon: <FaArrowAltCircleRight />,
      iconColor: materialTransfer === 0 ? "bg-primary" : "bg-success",
      changeColor: materialTransfer === 0 ? "text-primary" : "text-success",
    },
    {
      title: "Material Receipt",
      value: materialReceipt,
      change:
        materialReceipt === 0
          ? "0 material receipt"
          : "+" + materialReceipt + " confirmed material receipt",
      icon: <FaReceipt />,
      iconColor: "bg-success",
      changeColor: "text-success",
    },
    {
      title: "WIP Returns",
      value: wipReturn,
      change:
        wipReturn === 0 ? "0 WIP return" : "+" + wipReturn + " WIP return",
      icon: <FaUndoAlt />,
      iconColor: wipReturn === 0 ? "bg-warning" : "bg-success",
      changeColor: wipReturn === 0 ? "text-danger" : "text-success",
    },
    {
      title: "Total Rejected Items (IQC)",
      value: qcFailCount,
      change:
        qcFailCount === 0
          ? "0 items rejected"
          : "+" + qcFailCount + " items rejected",
      icon: <FaTimes />,
      iconColor: qcFailCount === 0 ? "bg-info" : "bg-danger",
      changeColor: qcFailCount === 0 ? "text-success" : "text-danger",
    },
    {
      title: "Total Rejected Items (WIP)",
      value: wipRejectedItems,
      change:
        wipRejectedItems === 0
          ? "0 items rejected"
          : "+" + wipRejectedItems + " items rejected",
      icon: <FaExclamationTriangle />,
      iconColor: wipRejectedItems === 0 ? "bg-info" : "bg-danger",
      changeColor: wipRejectedItems === 0 ? "text-success" : "text-danger",
    },
  ];

  return (
    <div>
      {/* Header section */}
      <nav className="navbar text-dark border-body" data-bs-theme="light">
        <div className="container-fluid p-0">
          <div className="mt-4">
            <h3 className="nav-header header-style text-dark">Dashboard</h3>
            <p className="breadcrumb">
              <Link to="/dashboard">
                <i className="fas fa-home text-8"></i>
              </Link>{" "}
              <span className="ms-1 mt-1 text-small-gray">/ Dashboard</span>
            </p>
          </div>
        </div>
      </nav>

      {/* Card  */}
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
      {/* Banner */}
      <div className="container-fluid">
        <div className="row" style={{ overflow: "visible" }}>
          {/* Banner Carousel */}
          <div
            className="col-8 graph-carousel border rounded p-3 bg-white shadow-sm mt-4 p-4"
            onMouseEnter={stopAutoSlide}
            onMouseLeave={startAutoSlide}
          >
            <button className="carousel-arrow left" onClick={handlePrev}>
              &#8249;
            </button>
            <button className="carousel-arrow right" onClick={handleNext}>
              &#8250;
            </button>

            <div>
              {/* {chartData[current].title === "Store Material Inward" && (
                <select
                  className="filter-select"
                  value={selectedItem}
                  onLoad={fetchStoreItems}
                  onChange={(e) => {
                    setSelectedItem(e.target.value);
                  }}
                >
                  <option value="">Select Items</option>
                  {items.map((items, index) => (
                    <option key={index} value={items.id}>
                      {items.name}
                    </option>
                  ))}
                </select>
              )} */}
              <h5 className="text-center text-dark">
                {chartData[current].title}
              </h5>
            </div>

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
            <ResponsiveContainer width="95%" height={300}>
              <LineChart data={chartData[current].data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey={
                    chartData[current].title === "IQC" ||
                    chartData[current].title === "Material Issue Request"
                      ? "time"
                      : chartData[current].title === "Store Material Inward"
                      ? "hour"
                      : "day"
                  }
                />
                <YAxis />
                <Tooltip />
                <Legend />
                {chartData[current].title !== "WIP Return" && (
                  <Line
                    type="monotone"
                    dataKey={`${
                      chartData[current].title === "IQC"
                        ? "pass"
                        : chartData[current].title ===
                            "Material Issue Request" ||
                          chartData[current].title === "Material Receipt" ||
                          chartData[current].title === "WIP Return"
                        ? "bom"
                        : "inward"
                    }`}
                    stroke={chartData[current].lineColor1}
                    strokeWidth={3}
                  />
                )}
                {chartData[current].title !== "WIP Return" && (
                  <Line
                    type="monotone"
                    dataKey={`${
                      chartData[current].title === "IQC"
                        ? "fail"
                        : chartData[current].title ===
                            "Material Issue Request" ||
                          chartData[current].title === "Material Receipt" ||
                          chartData[current].title === "WIP Return"
                        ? "item"
                        : "outward"
                    }`}
                    stroke={chartData[current].lineColor2}
                    strokeWidth={3}
                  />
                )}
                {chartData[current].title === "WIP Return" && (
                  <Line
                    type="monotone"
                    dataKey="defective"
                    stroke="#ef4444"
                    strokeWidth={3}
                  />
                )}
                {chartData[current].title === "WIP Return" && (
                  <Line
                    type="monotone"
                    dataKey="excess"
                    stroke="#f59e0b"
                    strokeWidth={3}
                  />
                )}
                {chartData[current].title === "WIP Return" && (
                  <Line
                    type="monotone"
                    dataKey="reusable"
                    stroke="#10b981"
                    strokeWidth={3}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="col-md-4 d-flex align-items-center justify-content-center">
            {data.length === 0 ? (
              <PieChart width={400} height={300}>
                <Pie
                  data={[{ name: "No Data", value: 1 }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  fill="#d6d8db" // Bootstrap gray-300
                />
                <text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#6c757d" // Bootstrap text-secondary
                  fontSize="14"
                  fontWeight="bold"
                >
                  No QC data
                </text>
              </PieChart>
            ) : (
              <PieChart width={400} height={300}>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                  <text
                    x="50%"
                    y="45%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#343a40" // Bootstrap text-dark
                    fontSize="14"
                    fontWeight="bold"
                  >
                    QC Status
                  </text>
                </Pie>
                <Tooltip />
                <Legend content={<CustomLegend />} />
              </PieChart>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
