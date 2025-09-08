import React, { useState, useEffect } from "react";
import { Card, Table, Badge, Row, Col } from "react-bootstrap";
import api from "../../../services/api";

const LineDashboard = ({ activeTab }) => {
  const [lineData, setLineData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(null);

  useEffect(() => {
    if (activeTab === "production") {
      fetchLineData();
      // Set up auto-refresh every 30 seconds
      const interval = setInterval(() => {
        fetchLineData();
      }, 30000);
      setRefreshInterval(interval);
    } else {
      // Clear interval when tab is changed
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [activeTab]);

  const fetchLineData = async () => {
    setLoading(true);
    try {
      // Replace with actual API endpoint when implemented
      // const response = await api.get("/api/line-monitoring");
      // setLineData(response.data);

      // For now, use sample data
      setLineData([
        {
          id: 1,
          lineNumber: "Line 1",
          product: "Product A",
          supervisor: "John Doe",
          peopleCount: 12,
          startTime: "08:00",
          stopTime: "17:00",
          status: "active",
          currentActivity: "Running",
          efficiency: 92,
          lastUpdated: new Date().toLocaleTimeString(),
        },
        {
          id: 2,
          lineNumber: "Line 2",
          product: "Product B",
          supervisor: "Jane Smith",
          peopleCount: 8,
          startTime: "09:00",
          stopTime: "18:00",
          status: "inactive",
          currentActivity: "Stopped - Material Shortage",
          efficiency: 0,
          lastUpdated: new Date().toLocaleTimeString(),
        },
        {
          id: 3,
          lineNumber: "Line 3",
          product: "Product C",
          supervisor: "Mike Johnson",
          peopleCount: 10,
          startTime: "07:30",
          stopTime: "16:30",
          status: "active",
          currentActivity: "Running",
          efficiency: 87,
          lastUpdated: new Date().toLocaleTimeString(),
        },
      ]);
    } catch (error) {
      console.error("Error fetching line data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    if (status === "active") {
      return <Badge bg="success">Active</Badge>;
    } else {
      return <Badge bg="danger">Inactive</Badge>;
    }
  };

  const getEfficiencyClass = (efficiency) => {
    if (efficiency >= 90) return "text-success";
    if (efficiency >= 70) return "text-warning";
    return "text-danger";
  };

  if (activeTab !== "line-monitoring") {
    return null;
  }

  return (
    <Card className="mb-4">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h6 className="mb-0">
          <i className="fas fa-industry me-2"></i>
          Production Line Status
        </h6>
        <span className="text-muted small">
          Auto-refreshes every 30 seconds | Last updated:{" "}
          {new Date().toLocaleTimeString()}
        </span>
      </Card.Header>
      <Card.Body>
        {loading ? (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : lineData.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-muted">No active production lines found</p>
          </div>
        ) : (
          <>
            <Row>
              {lineData.map((line) => (
                <Col md={4} key={line.id} className="mb-3">
                  <Card
                    className={`h-100 ${
                      line.status === "active"
                        ? "border-success"
                        : "border-danger"
                    }`}
                  >
                    <Card.Header
                      className={
                        line.status === "active"
                          ? "bg-success text-white"
                          : "bg-danger text-white"
                      }
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <h6 className="mb-0 text-8">{line.lineNumber}</h6>
                        {getStatusBadge(line.status)}
                      </div>
                    </Card.Header>
                    <Card.Body className="text-8">
                      <div className="mb-2">
                        <strong>Product:</strong> {line.product}
                      </div>
                      <div className="mb-2">
                        <strong>Supervisor:</strong> {line.supervisor}
                      </div>
                      <div className="mb-2">
                        <strong>People:</strong> {line.peopleCount}
                      </div>
                      <div className="mb-2">
                        <strong>Hours:</strong> {line.startTime} -{" "}
                        {line.stopTime}
                      </div>
                      <div className="mb-2">
                        <strong>Current Activity:</strong>{" "}
                        {line.currentActivity}
                      </div>
                      <div className="mb-0">
                        <strong>Efficiency:</strong>
                        <span className={getEfficiencyClass(line.efficiency)}>
                          {" "}
                          {line.efficiency}%
                        </span>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </>
        )}
      </Card.Body>
    </Card>
  );
};

export default LineDashboard;
