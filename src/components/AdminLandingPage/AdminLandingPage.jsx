import React, { useState, useEffect } from "react";
import { Container, Row, Col, Nav } from "react-bootstrap";
import { Link } from "react-router-dom";
import "./AdminLandingPage.css";
import Cookies from "js-cookie";
import api from "../../services/api";

// Import components from dashboardComponents directory
import KpiCards from "./dashboardComponents/KpiCards";
import ProductionChart from "./dashboardComponents/ProductionChart";
import EventsTable from "./dashboardComponents/EventsTable";
import MachinesGrid from "./dashboardComponents/MachinesGrid";
import NotificationsPanel from "./dashboardComponents/NotificationsPanel";
import NotificationDropdown from "./dashboardComponents/NotificationDropdown";
import ProductionReport from "./dashboardComponents/ProductionReport";
import SalesDashboard from "./dashboardComponents/SalesDashboard";
import LineDashboard from "./dashboardComponents/LineDashboard";

const AdminLandingPage = () => {
  const [activeTab, setActiveTab] = useState("production");
  const [isLoading, setIsLoading] = useState(false);

  // Get user permissions from cookies
  const permissions = JSON.parse(Cookies.get("permissions") || "[]");

  // Check if user has view access
  const hasViewPermission = (pageName, permissions) => {
    const perm = permissions.find((p) => p.pageName === pageName);
    return perm?.canView === true;
  };

  return (
    <div className="dashboard-container">
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

          {/* Notification Bell */}
          <div className="d-flex align-items-center">
            <NotificationDropdown permissions={permissions} />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <Container fluid>
        {/* KPI Cards with Navigation Tabs */}
        <KpiCards activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main Content Area */}
        <Row className="mb-4">
          {/* Left Column - Charts and Tables */}
          <Col lg={12}>
            {/* Production Chart */}
            <ProductionChart activeTab={activeTab} />

            {/* Production Report */}
            <ProductionReport activeTab={activeTab} />

            {/* Line Monitoring Dashboard */}
            <LineDashboard activeTab={activeTab} />

            {/* Sales Dashboard */}
            {activeTab === "sales" && <SalesDashboard />}

            {/* Events Table */}
            <EventsTable activeTab={activeTab} />
          </Col>

          {/* Right Column - Machines and Notifications */}
          {/* <Col lg={4}> */}
          {/* Notifications Panel */}
          {/* <NotificationsPanel activeTab={activeTab} /> */}

          {/* Machines Grid */}
          {/* <MachinesGrid activeTab={activeTab} /> */}
          {/* </Col> */}
        </Row>
      </Container>
    </div>
  );
};

export default AdminLandingPage;
