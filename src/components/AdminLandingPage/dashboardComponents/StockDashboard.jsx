import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Row,
  Col,
  Table,
  Badge,
  Form,
  Button,
  Alert,
  Nav,
  Tab,
  Modal,
} from "react-bootstrap";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  FaBoxOpen,
  FaExclamationTriangle,
  FaClock,
  FaSearch,
  FaFilter,
  FaFileExport,
  FaWarehouse,
  FaIndustry,
  FaBox,
  FaTools,
  FaCogs,
} from "react-icons/fa";
import api from "../../../services/api";
import exportToExcel from "../../../utils/exportToExcel";

const StockDashboard = () => {
  // States for different data sections
  const [kpiData, setKpiData] = useState({
    totalInventoryValue: {
      value: "₹" + (1245000).toLocaleString("en-IN"), // ₹12,45,000
      target: (1500000).toLocaleString("en-IN"), // 15,00,000
      data: [
        { name: "Current", value: (1245000).toLocaleString("en-IN") },
        { name: "Gap", value: (255000).toLocaleString("en-IN") },
      ],
      colors: ["#2196F3", "#E0E0E0"],
    },
    lowStockItems: {
      value: 12,
      target: 0,
      data: [
        { name: "Low Stock", value: 12 },
        { name: "Normal", value: 88 },
      ],
      colors: ["#FFA726", "#E0E0E0"],
    },
    nearExpiryItems: {
      value: 8,
      target: 0,
      data: [
        { name: "Near Expiry", value: 8 },
        { name: "Safe", value: 92 },
      ],
      colors: ["#F44336", "#E0E0E0"],
    },
    pendingApproval: {
      value: 15,
      target: 0,
      data: [
        { name: "Pending", value: 15 },
        { name: "Completed", value: 85 },
      ],
      colors: ["#9C27B0", "#E0E0E0"],
    },
    stockForIncoming: {
      value: 25,
      target: 0,
      data: [
        { name: "Pending", value: 25 },
        { name: "Ready", value: 75 },
      ],
      colors: ["#4CAF50", "#E0E0E0"],
    },
    qcPassedStock: {
      value: 45,
      target: 100,
      data: [
        { name: "Passed", value: 45 },
        { name: "Pending", value: 55 },
      ],
      colors: ["#FF9800", "#E0E0E0"],
    },
  });

  // State for KPI detail modal
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({
    title: "",
    data: [],
    originalData: [], // Keep original data for filtering
  });
  const [modalSearch, setModalSearch] = useState("");
  const [modalFilters, setModalFilters] = useState({});
  const [filteredData, setFilteredData] = useState([]);
  const [modalCurrentPage, setModalCurrentPage] = useState(1);

  // Top 5 moving items data
  const [topMovingItems, setTopMovingItems] = useState([
    { name: "Item A", movement: 150, value: "₹ 45,000" },
    { name: "Item B", movement: 120, value: "₹ 36,000" },
    { name: "Item C", movement: 100, value: "₹ 30,000" },
    { name: "Item D", movement: 80, value: "₹ 24,000" },
    { name: "Item E", movement: 60, value: "₹ 18,000" },
  ]);

  const [stockByCategory, setStockByCategory] = useState([
    { name: "Incoming Pending", value: 25, color: "#2196F3" },
    { name: "Done with Incoming", value: 20, color: "#FFC107" },
    { name: "QC Passed", value: 30, color: "#4CAF50" },
    { name: "Returned", value: 5, color: "#F44336" },
    { name: "Finished Goods", value: 20, color: "#9C27B0" },
  ]);

  // States for Reports section
  const [activeReport, setActiveReport] = useState("inward");
  const [dateRange, setDateRange] = useState("day");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Dummy data for each report type
  const reportData = {
    inward: [
      { date: "2024-03-15", grnNo: "GRN001", itemCode: "IC001", itemName: "Raw Material A", quantity: 100, status: "Received" },
      { date: "2024-03-14", grnNo: "GRN002", itemCode: "IC002", itemName: "Raw Material B", quantity: 150, status: "Pending" },
      { date: "2024-03-13", grnNo: "GRN003", itemCode: "IC003", itemName: "Raw Material C", quantity: 200, status: "Received" },
      { date: "2024-03-12", grnNo: "GRN004", itemCode: "IC004", itemName: "Raw Material D", quantity: 120, status: "Rejected" },
      { date: "2024-03-11", grnNo: "GRN005", itemCode: "IC005", itemName: "Raw Material E", quantity: 180, status: "Received" },
      { date: "2024-03-10", grnNo: "GRN006", itemCode: "IC006", itemName: "Raw Material F", quantity: 90, status: "Pending" },
      { date: "2024-03-09", grnNo: "GRN007", itemCode: "IC007", itemName: "Raw Material G", quantity: 160, status: "Received" },
      { date: "2024-03-08", grnNo: "GRN008", itemCode: "IC008", itemName: "Raw Material H", quantity: 140, status: "Rejected" },
      { date: "2024-03-07", grnNo: "GRN009", itemCode: "IC009", itemName: "Raw Material I", quantity: 170, status: "Received" },
      { date: "2024-03-06", grnNo: "GRN010", itemCode: "IC010", itemName: "Raw Material J", quantity: 110, status: "Pending" },
      { date: "2024-03-05", grnNo: "GRN011", itemCode: "IC011", itemName: "Raw Material K", quantity: 130, status: "Received" },
      { date: "2024-03-04", grnNo: "GRN012", itemCode: "IC012", itemName: "Raw Material L", quantity: 190, status: "Rejected" },
    ],
    outward: [
      { date: "2024-03-15", issueNo: "ISS001", itemCode: "IC001", itemName: "Raw Material A", quantity: 50, status: "Issued" },
      { date: "2024-03-14", issueNo: "ISS002", itemCode: "IC002", itemName: "Raw Material B", quantity: 75, status: "Pending" },
      { date: "2024-03-13", issueNo: "ISS003", itemCode: "IC003", itemName: "Raw Material C", quantity: 100, status: "Issued" },
      { date: "2024-03-12", issueNo: "ISS004", itemCode: "IC004", itemName: "Raw Material D", quantity: 60, status: "Rejected" },
      { date: "2024-03-11", issueNo: "ISS005", itemCode: "IC005", itemName: "Raw Material E", quantity: 90, status: "Issued" },
      { date: "2024-03-10", issueNo: "ISS006", itemCode: "IC006", itemName: "Raw Material F", quantity: 45, status: "Pending" },
      { date: "2024-03-09", issueNo: "ISS007", itemCode: "IC007", itemName: "Raw Material G", quantity: 80, status: "Issued" },
      { date: "2024-03-08", issueNo: "ISS008", itemCode: "IC008", itemName: "Raw Material H", quantity: 70, status: "Rejected" },
      { date: "2024-03-07", issueNo: "ISS009", itemCode: "IC009", itemName: "Raw Material I", quantity: 85, status: "Issued" },
      { date: "2024-03-06", issueNo: "ISS010", itemCode: "IC010", itemName: "Raw Material J", quantity: 55, status: "Pending" },
      { date: "2024-03-05", issueNo: "ISS011", itemCode: "IC011", itemName: "Raw Material K", quantity: 65, status: "Issued" },
      { date: "2024-03-04", issueNo: "ISS012", itemCode: "IC012", itemName: "Raw Material L", quantity: 95, status: "Rejected" },
    ],
    ledger: [
      { date: "2024-03-15", itemCode: "IC001", itemName: "Raw Material A", opening: 100, inward: 50, outward: 30, closing: 120 },
      { date: "2024-03-14", itemCode: "IC002", itemName: "Raw Material B", opening: 150, inward: 75, outward: 45, closing: 180 },
      { date: "2024-03-13", itemCode: "IC003", itemName: "Raw Material C", opening: 200, inward: 100, outward: 60, closing: 240 },
      { date: "2024-03-12", itemCode: "IC004", itemName: "Raw Material D", opening: 120, inward: 60, outward: 35, closing: 145 },
      { date: "2024-03-11", itemCode: "IC005", itemName: "Raw Material E", opening: 180, inward: 90, outward: 55, closing: 215 },
      { date: "2024-03-10", itemCode: "IC006", itemName: "Raw Material F", opening: 90, inward: 45, outward: 25, closing: 110 },
      { date: "2024-03-09", itemCode: "IC007", itemName: "Raw Material G", opening: 160, inward: 80, outward: 50, closing: 190 },
      { date: "2024-03-08", itemCode: "IC008", itemName: "Raw Material H", opening: 140, inward: 70, outward: 40, closing: 170 },
      { date: "2024-03-07", itemCode: "IC009", itemName: "Raw Material I", opening: 170, inward: 85, outward: 52, closing: 203 },
      { date: "2024-03-06", itemCode: "IC010", itemName: "Raw Material J", opening: 110, inward: 55, outward: 32, closing: 133 },
      { date: "2024-03-05", itemCode: "IC011", itemName: "Raw Material K", opening: 130, inward: 65, outward: 38, closing: 157 },
      { date: "2024-03-04", itemCode: "IC012", itemName: "Raw Material L", opening: 190, inward: 95, outward: 58, closing: 227 },
    ],
    consumption: [
      { date: "2024-03-15", itemCode: "IC001", itemName: "Raw Material A", consumed: 30, wastage: 2, efficiency: "93.3%" },
      { date: "2024-03-14", itemCode: "IC002", itemName: "Raw Material B", consumed: 45, wastage: 3, efficiency: "93.3%" },
      { date: "2024-03-13", itemCode: "IC003", itemName: "Raw Material C", consumed: 60, wastage: 4, efficiency: "93.3%" },
      { date: "2024-03-12", itemCode: "IC004", itemName: "Raw Material D", consumed: 35, wastage: 2, efficiency: "94.3%" },
      { date: "2024-03-11", itemCode: "IC005", itemName: "Raw Material E", consumed: 55, wastage: 3, efficiency: "94.5%" },
      { date: "2024-03-10", itemCode: "IC006", itemName: "Raw Material F", consumed: 25, wastage: 1, efficiency: "96.0%" },
      { date: "2024-03-09", itemCode: "IC007", itemName: "Raw Material G", consumed: 50, wastage: 3, efficiency: "94.0%" },
      { date: "2024-03-08", itemCode: "IC008", itemName: "Raw Material H", consumed: 40, wastage: 2, efficiency: "95.0%" },
      { date: "2024-03-07", itemCode: "IC009", itemName: "Raw Material I", consumed: 52, wastage: 3, efficiency: "94.2%" },
      { date: "2024-03-06", itemCode: "IC010", itemName: "Raw Material J", consumed: 32, wastage: 2, efficiency: "93.8%" },
      { date: "2024-03-05", itemCode: "IC011", itemName: "Raw Material K", consumed: 38, wastage: 2, efficiency: "94.7%" },
      { date: "2024-03-04", itemCode: "IC012", itemName: "Raw Material L", consumed: 58, wastage: 4, efficiency: "93.1%" },
    ],
    minmax: [
      { itemCode: "IC001", itemName: "Raw Material A", minStock: 50, maxStock: 200, currentStock: 120, status: "Normal" },
      { itemCode: "IC002", itemName: "Raw Material B", minStock: 75, maxStock: 300, currentStock: 180, status: "Normal" },
      { itemCode: "IC003", itemName: "Raw Material C", minStock: 100, maxStock: 400, currentStock: 240, status: "Normal" },
      { itemCode: "IC004", itemName: "Raw Material D", minStock: 60, maxStock: 240, currentStock: 45, status: "Low" },
      { itemCode: "IC005", itemName: "Raw Material E", minStock: 90, maxStock: 360, currentStock: 215, status: "Normal" },
      { itemCode: "IC006", itemName: "Raw Material F", minStock: 45, maxStock: 180, currentStock: 110, status: "Normal" },
      { itemCode: "IC007", itemName: "Raw Material G", minStock: 80, maxStock: 320, currentStock: 40, status: "Low" },
      { itemCode: "IC008", itemName: "Raw Material H", minStock: 70, maxStock: 280, currentStock: 170, status: "Normal" },
      { itemCode: "IC009", itemName: "Raw Material I", minStock: 85, maxStock: 340, currentStock: 203, status: "Normal" },
      { itemCode: "IC010", itemName: "Raw Material J", minStock: 55, maxStock: 220, currentStock: 35, status: "Low" },
      { itemCode: "IC011", itemName: "Raw Material K", minStock: 65, maxStock: 260, currentStock: 157, status: "Normal" },
      { itemCode: "IC012", itemName: "Raw Material L", minStock: 95, maxStock: 380, currentStock: 227, status: "Normal" },
    ],
    nonmoving: [
      { itemCode: "IC001", itemName: "Raw Material A", lastMovement: "2024-02-15", daysNonMoving: 30, currentStock: 120, value: 12000 },
      { itemCode: "IC002", itemName: "Raw Material B", lastMovement: "2024-02-01", daysNonMoving: 44, currentStock: 180, value: 18000 },
      { itemCode: "IC003", itemName: "Raw Material C", lastMovement: "2024-01-15", daysNonMoving: 61, currentStock: 240, value: 24000 },
      { itemCode: "IC004", itemName: "Raw Material D", lastMovement: "2024-02-20", daysNonMoving: 25, currentStock: 145, value: 14500 },
      { itemCode: "IC005", itemName: "Raw Material E", lastMovement: "2024-02-10", daysNonMoving: 35, currentStock: 215, value: 21500 },
      { itemCode: "IC006", itemName: "Raw Material F", lastMovement: "2024-01-30", daysNonMoving: 46, currentStock: 110, value: 11000 },
      { itemCode: "IC007", itemName: "Raw Material G", lastMovement: "2024-02-05", daysNonMoving: 40, currentStock: 190, value: 19000 },
      { itemCode: "IC008", itemName: "Raw Material H", lastMovement: "2024-01-25", daysNonMoving: 51, currentStock: 170, value: 17000 },
      { itemCode: "IC009", itemName: "Raw Material I", lastMovement: "2024-02-25", daysNonMoving: 20, currentStock: 203, value: 20300 },
      { itemCode: "IC010", itemName: "Raw Material J", lastMovement: "2024-01-20", daysNonMoving: 56, currentStock: 133, value: 13300 },
      { itemCode: "IC011", itemName: "Raw Material K", lastMovement: "2024-02-12", daysNonMoving: 33, currentStock: 157, value: 15700 },
      { itemCode: "IC012", itemName: "Raw Material L", lastMovement: "2024-01-10", daysNonMoving: 66, currentStock: 227, value: 22700 },
    ],
    expiry: [
      { itemCode: "IC001", itemName: "Raw Material A", expiryDate: "2024-06-15", daysToExpiry: 90, currentStock: 120, batchNo: "BA001" },
      { itemCode: "IC002", itemName: "Raw Material B", expiryDate: "2024-05-01", daysToExpiry: 45, currentStock: 180, batchNo: "BA002" },
      { itemCode: "IC003", itemName: "Raw Material C", expiryDate: "2024-04-15", daysToExpiry: 30, currentStock: 240, batchNo: "BA003" },
      { itemCode: "IC004", itemName: "Raw Material D", expiryDate: "2024-06-20", daysToExpiry: 95, currentStock: 145, batchNo: "BA004" },
      { itemCode: "IC005", itemName: "Raw Material E", expiryDate: "2024-05-10", daysToExpiry: 55, currentStock: 215, batchNo: "BA005" },
      { itemCode: "IC006", itemName: "Raw Material F", expiryDate: "2024-04-30", daysToExpiry: 44, currentStock: 110, batchNo: "BA006" },
      { itemCode: "IC007", itemName: "Raw Material G", expiryDate: "2024-06-05", daysToExpiry: 80, currentStock: 190, batchNo: "BA007" },
      { itemCode: "IC008", itemName: "Raw Material H", expiryDate: "2024-05-25", daysToExpiry: 70, currentStock: 170, batchNo: "BA008" },
      { itemCode: "IC009", itemName: "Raw Material I", expiryDate: "2024-04-25", daysToExpiry: 39, currentStock: 203, batchNo: "BA009" },
      { itemCode: "IC010", itemName: "Raw Material J", expiryDate: "2024-06-10", daysToExpiry: 85, currentStock: 133, batchNo: "BA010" },
      { itemCode: "IC011", itemName: "Raw Material K", expiryDate: "2024-05-15", daysToExpiry: 60, currentStock: 157, batchNo: "BA011" },
      { itemCode: "IC012", itemName: "Raw Material L", expiryDate: "2024-04-20", daysToExpiry: 34, currentStock: 227, batchNo: "BA012" },
    ],
    supplier: [
      { supplierCode: "SP001", supplierName: "Supplier A", onTimeDelivery: "95%", qualityRating: "A", rejectionRate: "2%", avgDelay: 1 },
      { supplierCode: "SP002", supplierName: "Supplier B", onTimeDelivery: "88%", qualityRating: "B", rejectionRate: "5%", avgDelay: 3 },
      { supplierCode: "SP003", supplierName: "Supplier C", onTimeDelivery: "92%", qualityRating: "A", rejectionRate: "3%", avgDelay: 2 },
      { supplierCode: "SP004", supplierName: "Supplier D", onTimeDelivery: "85%", qualityRating: "C", rejectionRate: "7%", avgDelay: 4 },
      { supplierCode: "SP005", supplierName: "Supplier E", onTimeDelivery: "90%", qualityRating: "B", rejectionRate: "4%", avgDelay: 2 },
      { supplierCode: "SP006", supplierName: "Supplier F", onTimeDelivery: "87%", qualityRating: "B", rejectionRate: "5%", avgDelay: 3 },
      { supplierCode: "SP007", supplierName: "Supplier G", onTimeDelivery: "93%", qualityRating: "A", rejectionRate: "2%", avgDelay: 1 },
      { supplierCode: "SP008", supplierName: "Supplier H", onTimeDelivery: "86%", qualityRating: "C", rejectionRate: "6%", avgDelay: 4 },
      { supplierCode: "SP009", supplierName: "Supplier I", onTimeDelivery: "91%", qualityRating: "B", rejectionRate: "4%", avgDelay: 2 },
      { supplierCode: "SP010", supplierName: "Supplier J", onTimeDelivery: "89%", qualityRating: "B", rejectionRate: "5%", avgDelay: 3 },
      { supplierCode: "SP011", supplierName: "Supplier K", onTimeDelivery: "94%", qualityRating: "A", rejectionRate: "3%", avgDelay: 1 },
      { supplierCode: "SP012", supplierName: "Supplier L", onTimeDelivery: "84%", qualityRating: "C", rejectionRate: "8%", avgDelay: 5 },
    ],
  };

  // Filter modal data based on search and filters
  const filterModalData = useCallback(() => {
    let filtered = [...modalData.originalData];

    // Apply search
    if (modalSearch) {
      const searchLower = modalSearch.toLowerCase();
      filtered = filtered.filter((item) =>
        Object.values(item).some((val) =>
          String(val).toLowerCase().includes(searchLower)
        )
      );
    }

    // Apply filters
    Object.entries(modalFilters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter(
          (item) => String(item[key]) === String(value)
        );
      }
    });

    setFilteredData(filtered);
  }, [modalSearch, modalFilters, modalData.originalData]);

  // Clear all filters
  const handleClearFilters = () => {
    setModalSearch("");
    setModalFilters({});
    setFilteredData(modalData.originalData);
  };

  // Generate random data for inventory items
  const generateInventoryItems = (count) => {
    const categories = ["Raw Material", "Packaging", "Finished Goods", "WIP", "Consumables"];
    const statuses = ["Active", "Inactive", "On Hold"];
    const items = [];
    
    for (let i = 1; i <= count; i++) {
      items.push({
        itemCode: `ITEM${i.toString().padStart(3, '0')}`,
        name: `Item ${i}`,
        category: categories[Math.floor(Math.random() * categories.length)],
        quantity: Math.floor(Math.random() * 1000),
        value: `₹${(Math.random() * 100000).toFixed(2)}`,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        lastUpdated: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
    }
    return items;
  };

  // Handle KPI card click
  const handleCardClick = (type) => {
    let modalInfo = {
      title: "",
      data: [],
      originalData: [],
    };

    // Reset modal state
    setModalCurrentPage(1);
    setModalSearch("");
    setModalFilters({});

    switch (type) {
      case "inventory":
        const inventoryData = generateInventoryItems(25);
        modalInfo = {
          title: "Total Inventory Details",
          data: inventoryData,
          originalData: inventoryData,
        };
        break;
      case "lowStock":
        const lowStockData = generateInventoryItems(15).map(item => ({
          ...item,
          available: Math.floor(Math.random() * 50),
          required: Math.floor(Math.random() * 100) + 50,
          status: Math.random() > 0.5 ? "Critical" : "Warning",
          daysToReorder: Math.floor(Math.random() * 30)
        }));
        modalInfo = {
          title: "Low Stock Items Details",
          data: lowStockData,
          originalData: lowStockData,
        };
        break;
      case "expiry":
        const expiryData = generateInventoryItems(20).map(item => ({
          ...item,
          expiryDate: new Date(Date.now() + Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          daysToExpiry: Math.floor(Math.random() * 90),
          batchNo: `BATCH${Math.floor(Math.random() * 1000)}`,
          status: Math.random() > 0.5 ? "Critical" : "Warning"
        }));
        modalInfo = {
          title: "Near Expiry Items Details",
          data: expiryData,
          originalData: expiryData,
        };
        break;
      case "pendingApproval":
        const approvalData = generateInventoryItems(18).map(item => ({
          ...item,
          requestDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          requestedBy: ["John", "Jane", "Mike", "Sarah", "Tom"][Math.floor(Math.random() * 5)],
          approver: ["Manager1", "Manager2", "Manager3"][Math.floor(Math.random() * 3)],
          status: ["Pending", "In Review", "On Hold"][Math.floor(Math.random() * 3)]
        }));
        modalInfo = {
          title: "Pending Approval Items",
          data: approvalData,
          originalData: approvalData,
        };
        break;
      case "incomingStock":
        const incomingData = generateInventoryItems(22).map(item => ({
          ...item,
          expected: Math.floor(Math.random() * 500),
          available: Math.floor(Math.random() * 200),
          supplier: `Supplier ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
          expectedDate: new Date(Date.now() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: ["In Transit", "Processing", "Ordered"][Math.floor(Math.random() * 3)]
        }));
        modalInfo = {
          title: "Stock Left for Incoming",
          data: incomingData,
          originalData: incomingData,
        };
        break;
      case "qcPassed":
        const qcData = generateInventoryItems(16).map(item => ({
          ...item,
          passDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          inspector: ["John", "Jane", "Mike", "Sarah", "Tom"][Math.floor(Math.random() * 5)],
          qualityScore: (Math.random() * 100).toFixed(1) + "%",
          remarks: Math.random() > 0.7 ? "Minor issues found" : "No issues",
          status: Math.random() > 0.3 ? "Passed" : "Conditional Pass"
        }));
        modalInfo = {
          title: "QC Passed Stock",
          data: qcData,
          originalData: qcData,
        };
        break;
    }

    setModalData(modalInfo);
    setShowModal(true);
  };

  // Render KPI Card
  const renderKpiCard = (data, title, subtitle, type) => (
    <Card 
      className="h-100 shadow-sm border-0" 
      style={{ cursor: 'pointer' }}
      onClick={() => handleCardClick(type)}
    >
      <Card.Body>
        <div className="d-flex flex-column h-100">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="text-muted mb-0">{title}</h6>
            <div
              className="icon-box rounded-circle p-2"
              style={{ backgroundColor: data.colors[0] + "20" }}
            >
              {type === "inventory" && <FaWarehouse color={data.colors[0]} />}
              {type === "lowStock" && (
                <FaExclamationTriangle color={data.colors[0]} />
              )}
              {type === "expiry" && <FaClock color={data.colors[0]} />}
              {type === "pendingApproval" && <FaTools color={data.colors[0]} />}
              {type === "incomingStock" && <FaBox color={data.colors[0]} />}
              {type === "qcPassed" && <FaCogs color={data.colors[0]} />}
            </div>
          </div>
          <div className="text-center">
            <h3 className="mb-1 fs-4" style={{ color: data.colors[0] }}>
              {title === "Total Inventory Value"
                ? `₹ ${data.value.toLocaleString()}`
                : title === "QC Passed Stock"
                ? `${data.value}%`
                : data.value}
            </h3>
            <small className="text-muted">{subtitle}</small>
          </div>
        </div>
      </Card.Body>
    </Card>
  );

  // Render KPI Cards
  const renderKpiCards = () => (
    <Row className="g-3 mb-4">
      <Col md={2}>
        {renderKpiCard(
          kpiData.totalInventoryValue,
          "Inventory",
          `Total: ${kpiData.totalInventoryValue.value.toLocaleString()}`,
          "inventory"
        )}
      </Col>
      <Col md={2}>
        {renderKpiCard(
          kpiData.lowStockItems,
          "Low Stock",
          "Below Threshold",
          "lowStock"
        )}
      </Col>
      <Col md={2}>
        {renderKpiCard(
          kpiData.nearExpiryItems,
          "Near Expiry",
          "Expiring Soon",
          "expiry"
        )}
      </Col>
      <Col md={2}>
        {renderKpiCard(
          kpiData.pendingApproval,
          "Pending",
          "Awaiting Approval",
          "pendingApproval"
        )}
      </Col>
      <Col md={2}>
        {renderKpiCard(
          kpiData.stockForIncoming,
          "Incoming",
          "Pending Entry",
          "incomingStock"
        )}
      </Col>
      <Col md={2}>
        {renderKpiCard(
          kpiData.qcPassedStock,
          "QC Passed",
          `Target: ${kpiData.qcPassedStock.target}%`,
          "qcPassed"
        )}
      </Col>
    </Row>
  );

  // Render Stock by Category
  const renderStockByCategory = () => (
    <Card className="shadow-sm border-0 mb-4 h-100">
      <Card.Header className="bg-white">
        <h6 className="mb-0">Stock by Category</h6>
      </Card.Header>
      <Card.Body>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={stockByCategory}
            margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
            barSize={40}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              interval={0}
              tick={{ fontSize: 12, fill: "#666" }}
              height={60}
              angle={-15}
              textAnchor="end"
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#666" }}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              cursor={{ fill: "rgba(0, 0, 0, 0.05)" }}
              contentStyle={{
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              }}
              formatter={(value) => [`${value}%`, "Items"]}
            />
            <Bar dataKey="value" name="Items" radius={[4, 4, 0, 0]}>
              {stockByCategory.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  style={{ filter: "brightness(1.1)" }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card.Body>
      <Card.Footer className="bg-white border-0">
        {/* <div className="d-flex justify-content-between align-items-center">
          <small className="text-muted">Stock Distribution</small>
          <small className="text-muted">
            Total Items:{" "}
            {stockByCategory.reduce((acc, curr) => acc + curr.value, 0)}%
          </small>
        </div> */}
      </Card.Footer>
    </Card>
  );

  // Function to get filtered data based on search term and status
  const getFilteredData = (data) => {
    return data.filter((item) => {
      const matchesSearch = Object.values(item).some(
        (value) =>
          value &&
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
      const matchesStatus =
        filterStatus === "all" ||
        (item.status &&
          item.status.toLowerCase() === filterStatus.toLowerCase());
      return matchesSearch && matchesStatus;
    });
  };

  // Function to get paginated data
  const getPaginatedData = (data) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return data.slice(startIndex, startIndex + itemsPerPage);
  };

  // Function to render pagination
  const renderPagination = (totalItems) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    return (
      <div className="d-flex justify-content-between align-items-center mt-3 bg-white">
        <small className="text-muted">
          Showing {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} items
        </small>
        <div className="d-flex gap-2">
          <Button
            variant="outline-primary"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline-primary"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    );
  };

  // Function to render table based on report type
  const renderTable = (reportType) => {
    const data = reportData[reportType] || [];
    const filteredData = getFilteredData(data);
    const paginatedData = getPaginatedData(filteredData);

    const getTableHeaders = () => {
      if (data.length === 0) return [];
      return Object.keys(data[0]).map((key) => ({
        key,
        label: key
          .split(/(?=[A-Z])|_/)
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" "),
      }));
    };

    return (
      <div className="bg-white">
        <Table hover responsive className="mb-0">
          <thead>
            <tr>
              {getTableHeaders().map(({ key, label }) => (
                <th key={key}>{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item, index) => (
              <tr key={index}>
                {Object.values(item).map((value, i) => (
                  <td key={i}>{value}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </Table>
        {renderPagination(filteredData.length)}
      </div>
    );
  };

  // Render Reports Section
  const renderReports = () => (
    <Card className="shadow-sm border-0">
      <Card.Header className="bg-white">
        <h6 className="mb-0">Stock Reports</h6>
      </Card.Header>
      <Card.Body>
        <Tab.Container
          defaultActiveKey="inward"
          onSelect={(key) => {
            setActiveReport(key);
            setCurrentPage(1);
          }}
        >
          <div className="mb-3">
            <Nav variant="tabs" className="text-8">
              <Nav.Item>
                <Nav.Link eventKey="inward">Material Inward</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="outward">Material Outward</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="ledger">Stock Ledger</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="consumption">Material Consumption</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="minmax">Min-Max Stock</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="nonmoving">Non-moving Stock</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="expiry">Expiry Report</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="supplier">Supplier Performance</Nav.Link>
              </Nav.Item>
            </Nav>
          </div>

          <div className="mb-3 d-flex justify-content-between align-items-center">
            <div className="d-flex gap-2">
              <Form.Select
                size="sm"
                style={{ width: "120px" }}
                value={dateRange}
                className="text-8"
                onChange={(e) => {
                  setDateRange(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="day">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </Form.Select>
              <Form.Select
                className="text-8"
                size="sm"
                style={{ width: "120px" }}
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </Form.Select>
            </div>
            <div className="d-flex gap-2">
              <Form.Control
                size="sm"
                className="text-8"
                type="search"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                style={{ width: "200px" }}
              />
              <Button
                variant="outline-success"
                className="text-8"
                size="sm"
                onClick={() => {
                  const data = getFilteredData(reportData[activeReport] || []);
                  exportToExcel(
                    data,
                    `Stock Report - ${
                      activeReport.charAt(0).toUpperCase() +
                      activeReport.slice(1)
                    }`
                  );
                }}
              >
                <FaFileExport className="me-1" /> Export Excel
              </Button>
            </div>
          </div>

          <Tab.Content>
            <Tab.Pane eventKey="inward">{renderTable("inward")}</Tab.Pane>
            <Tab.Pane eventKey="outward">{renderTable("outward")}</Tab.Pane>
            <Tab.Pane eventKey="ledger">{renderTable("ledger")}</Tab.Pane>
            <Tab.Pane eventKey="consumption">{renderTable("consumption")}</Tab.Pane>
            <Tab.Pane eventKey="minmax">{renderTable("minmax")}</Tab.Pane>
            <Tab.Pane eventKey="nonmoving">{renderTable("nonmoving")}</Tab.Pane>
            <Tab.Pane eventKey="expiry">{renderTable("expiry")}</Tab.Pane>
            <Tab.Pane eventKey="supplier">{renderTable("supplier")}</Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </Card.Body>
    </Card>
  );

  // Render Top 5 Moving Items
  const renderTopMovingItems = () => (
    <Card className="shadow-sm border-0 mb-4 h-100">
      <Card.Header className="bg-white">
        <h6 className="mb-0">Top 5 Moving Items</h6>
      </Card.Header>
      <Card.Body>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={topMovingItems}
            margin={{ top: 20, right: 30, left: 20, bottom: 30 }}
            barSize={40}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#666" }}
              interval={0}
              angle={-15}
              textAnchor="end"
              height={60}
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
              formatter={(value, name) => [value, "Movement"]}
            />
            <Bar dataKey="movement" name="Movement" radius={[4, 4, 0, 0]}>
              {topMovingItems.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={`hsl(207, 90%, ${65 - index * 5}%)`}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card.Body>
      <Card.Footer className="bg-white border-0">
        {/* <div className="d-flex justify-content-between align-items-center">
          <small className="text-muted">Movement Trend</small>
          <small className="text-muted">
            Total Movement:{" "}
            {topMovingItems.reduce((acc, curr) => acc + curr.movement, 0)}
          </small>
        </div> */}
      </Card.Footer>
    </Card>
  );

  // Effect to update filtered data when search or filters change
  useEffect(() => {
    filterModalData();
  }, [modalSearch, modalFilters, modalData.originalData, filterModalData]);

  // Render KPI Detail Modal
  const renderModal = () => {
    const getUniqueValues = (key) => {
      return [...new Set(modalData.originalData.map((item) => item[key]))];
    };

    const getFilterOptions = () => {
      if (!modalData.data[0]) return [];
      const excludeFields = [
        "value",
        "quantity",
        "available",
        "required",
        "daysLeft",
        "expected",
      ];
      return Object.keys(modalData.data[0]).filter(
        (key) => !excludeFields.includes(key)
      );
    };

    // Get paginated data for modal
    const getPaginatedModalData = () => {
      const startIndex = (modalCurrentPage - 1) * itemsPerPage;
      return filteredData.slice(startIndex, startIndex + itemsPerPage);
    };

    // Render modal pagination
    const renderModalPagination = () => {
      const totalPages = Math.ceil(filteredData.length / itemsPerPage);
      return (
        <div className="d-flex gap-2">
          <Button
            variant="outline-primary"
            size="sm"
            disabled={modalCurrentPage === 1}
            onClick={() => setModalCurrentPage(modalCurrentPage - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline-primary"
            size="sm"
            disabled={modalCurrentPage === totalPages}
            onClick={() => setModalCurrentPage(modalCurrentPage + 1)}
          >
            Next
          </Button>
        </div>
      );
    };

    const paginatedData = getPaginatedModalData();
    const startIndex = (modalCurrentPage - 1) * itemsPerPage;

    return (
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{modalData.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <Row className="g-2">
              <Col md={6}>
                <Form.Control
                  type="search"
                  placeholder="Search..."
                  value={modalSearch}
                  onChange={(e) => {
                    setModalSearch(e.target.value);
                    setModalCurrentPage(1);
                  }}
                />
              </Col>
              {getFilterOptions().map((key) => (
                <Col md={3} key={key}>
                  <Form.Select
                    value={modalFilters[key] || ""}
                    onChange={(e) => {
                      setModalFilters((prev) => ({
                        ...prev,
                        [key]: e.target.value || "",
                      }));
                      setModalCurrentPage(1);
                    }}
                  >
                    <option value="">Filter by {key}</option>
                    {getUniqueValues(key).map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
              ))}
              <Col md={3}>
                <Button
                  variant="outline-secondary"
                  onClick={() => {
                    handleClearFilters();
                    setModalCurrentPage(1);
                  }}
                >
                  Clear Filters
                </Button>
              </Col>
            </Row>
          </div>

          <Table hover responsive>
            <thead>
              <tr>
                {modalData.data[0] &&
                  Object.keys(modalData.data[0]).map((key, index) => (
                    <th key={index}>
                      {key
                        .split(/(?=[A-Z])|_/)
                        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(" ")}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item, index) => (
                <tr key={index}>
                  {Object.values(item).map((value, i) => (
                    <td key={i}>{value}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </Table>
        </Modal.Body>
        <Modal.Footer>
          <div className="d-flex gap-2 w-100 justify-content-between align-items-center">
            <div>
              <small className="text-muted">
                Showing {startIndex + 1} to{" "}
                {Math.min(startIndex + itemsPerPage, filteredData.length)} of{" "}
                {filteredData.length} items
              </small>
            </div>
            <div className="d-flex gap-2 align-items-center">
              {renderModalPagination()}
              <Button
                variant="outline-success"
                size="sm"
                className="ms-2"
                onClick={() => exportToExcel(filteredData, modalData.title)}
              >
                <FaFileExport className="me-1" /> Export Excel
              </Button>
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal.Footer>
      </Modal>
    );
  };

  return (
    <div>
      {/* KPI Cards */}
      {renderKpiCards()}

      {/* Charts Row */}
      <Row className="mb-4">
        <Col lg={6}>{renderTopMovingItems()}</Col>
        <Col lg={6}>{renderStockByCategory()}</Col>
      </Row>

      {/* Reports Row */}
      <Row className="mb-4">
        <Col lg={12}>{renderReports()}</Col>
      </Row>

      {/* Modal */}
      {renderModal()}
    </div>
  );
};

export default StockDashboard;
