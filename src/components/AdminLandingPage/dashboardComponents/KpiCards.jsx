import React from "react";
import { Card, Row, Col, Badge } from "react-bootstrap";
import {
  FaClock,
  FaChartLine,
  FaPercentage,
  FaCheckCircle,
  FaExclamationTriangle,
  FaCogs,
  FaChartBar,
  FaDollarSign,
} from "react-icons/fa";

const KpiCards = ({ activeTab, setActiveTab }) => {
  // KPI data - in a real app, this would come from API
  const kpiData = [
    {
      title: "Total Production",
      value: "21,055",
      icon: <FaChartBar size={22} />,
      color: "warning",
      trend: "up",
      change: "+9%",
    },
    {
      title: "Efficiency",
      value: "78.5%",
      icon: <FaChartLine size={22} />,
      color: "primary",
      trend: "up",
      change: "+2.4%",
    },
    // {
    //   title: 'Downtime',
    //   value: '42 min',
    //   icon: <FaClock size={22} />,
    //   color: 'warning',
    //   trend: 'down',
    //   change: '-15 min'
    // },
    // {
    //   title: 'Throughput',
    //   value: '1,250 units',
    //   icon: <FaIndustry size={22} />,
    //   color: 'success',
    //   trend: 'up',
    //   change: '+120 units'
    // },

    // {
    //   title: 'Quality Rate',
    //   value: '99.1%',
    //   icon: <FaCheckCircle size={22} />,
    //   color: 'success',
    //   trend: 'up',
    //   change: '+0.3%'
    // },
    // {
    //   title: 'Scrap Rate',
    //   value: '0.9%',
    //   icon: <FaExclamationTriangle size={22} />,
    //   color: 'danger',
    //   trend: 'down',
    //   change: '-0.3%'
    // },
    // {
    //   title: 'Dispatch Rate',
    //   value: '70.3%',
    //   icon: <FaCogs size={22} />,
    //   color: 'warning',
    //   trend: 'down',
    //   change: '-1.5%'
    // },
    {
      title: "Revenue",
      value: "$125,450",
      icon: <FaDollarSign size={22} />,
      color: "success",
      trend: "up",
      change: "+$12,340",
    },
    {
      title: "Profit Margin",
      value: "23.4%",
      icon: <FaChartLine size={22} />,
      color: "info",
      trend: "up",
      change: "+1.2%",
    },
  ];

  // Tabs for different sections
  const tabs = [
    { id: "production", name: "Production" },
    { id: "line-monitoring", name: "Line Monitoring" },
    { id: "quality", name: "Quality" },
    { id: "store", name: "Store" },
    { id: "sales", name: "Sales" },
    // { id: 'vendor', name: 'Vendor Rating' },
    { id: "workforce", name: "Workforce" },
  ];

  return (
    <div className="mb-4">
      <Row className="g-3">
        {kpiData.map((kpi, index) => (
          <Col key={index} xs={12} sm={6} md={3} lg={3} xl={3}>
            <Card className="kpi-card h-100 shadow-sm border-0">
              <Card.Body>
                <div className="d-flex flex-column">
                  <div className="text-muted fw-medium mb-1 fs-6">
                    {kpi.title}
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <h3 className="fw-bold fs-5 mb-0">{kpi.value}</h3>
                    <div className={`icon-container text-${kpi.color}`}>
                      {kpi.icon}
                    </div>
                  </div>
                  <div className="d-flex align-items-center mt-2">
                    <Badge
                      bg={kpi.trend === "up" ? "success" : "danger"}
                      className="me-2 badge-trend"
                    >
                      {kpi.trend === "up" ? "↑" : "↓"} {kpi.change}
                    </Badge>
                    <small className="text-muted">from last period</small>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Navigation Tabs */}
      <div className="nav-tabs-container mt-4">
        <ul className="nav nav-tabs">
          {tabs.map((tab) => (
            <li className="nav-item" key={tab.id}>
              <button
                className={`nav-link ${activeTab === tab.id ? "active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default KpiCards;
