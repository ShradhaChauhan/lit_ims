import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import "./LineMonitoring.css";
import api from "../../services/api";
import { toast } from "react-toastify";
import LineMonitoringModal from "../../components/Modals/LineMonitoringModal";
import * as XLSX from "xlsx";

const LineMonitoring = () => {
  const [showModal, setShowModal] = useState(false);
  const [lineData, setLineData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentLine, setCurrentLine] = useState(null);

  useEffect(() => {
    fetchLineData();
  }, []);

  const fetchLineData = async () => {
    setLoading(true);
    try {
      // Replace with actual API endpoint when implemented
      const response = await api.get("/api/line-monitoring");
      setLineData(response.data);
    } catch (error) {
      console.error("Error fetching line data:", error);
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
          timeEntries: [
            { id: 1, start: "08:00", stop: "12:00", reason: "" },
            { id: 2, start: "13:00", stop: "17:00", reason: "Lunch Break" },
          ],
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
          timeEntries: [
            { id: 1, start: "09:00", stop: "13:00", reason: "" },
            { id: 2, start: "14:00", stop: "16:00", reason: "Lunch Break" },
            {
              id: 3,
              start: "16:30",
              stop: "18:00",
              reason: "Material Shortage",
            },
          ],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLine = () => {
    setEditMode(false);
    setCurrentLine(null);
    setShowModal(true);
  };

  const handleEditLine = (line) => {
    setEditMode(true);
    setCurrentLine(line);
    setShowModal(true);
  };

  const handleSaveLine = async (lineDetails) => {
    try {
      if (editMode) {
        // Update existing line
        // Replace with actual API endpoint when implemented
        // await api.put(`/api/line-monitoring/${lineDetails.id}`, lineDetails);
        setLineData(
          lineData.map((line) =>
            line.id === lineDetails.id ? lineDetails : line
          )
        );
        toast.success("Line details updated successfully");
      } else {
        // Add new line
        // Replace with actual API endpoint when implemented
        // const response = await api.post("/api/line-monitoring", lineDetails);
        const newLine = {
          ...lineDetails,
          id: lineData.length + 1,
          timeEntries: [
            {
              id: 1,
              start: lineDetails.startTime,
              stop: lineDetails.stopTime,
              reason: "",
            },
          ],
        };
        setLineData([...lineData, newLine]);
        toast.success("Line added successfully");
      }
    } catch (error) {
      console.error("Error saving line data:", error);
      toast.error("Failed to save line data");
    }
    setShowModal(false);
  };

  const getStatusBadge = (status) => {
    if (status === "active") {
      return <span className="badge bg-success">Active</span>;
    } else {
      return <span className="badge bg-danger">Inactive</span>;
    }
  };

  // Function to export data to Excel
  const handleExportToExcel = () => {
    if (lineData.length === 0) {
      toast.warning("No data available to export!");
      return;
    }

    // Format data for export
    const exportData = lineData.map((line) => ({
      Line: line.lineNumber,
      Product: line.product,
      Supervisor: line.supervisor,
      "People Count": line.peopleCount,
      "Start Time": line.startTime,
      "Stop Time": line.stopTime,
      Status: line.status,
      "Current Activity": line.currentActivity,
      Efficiency: line.efficiency + "%",
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Line Monitoring");

    // Generate and save file
    XLSX.writeFile(wb, "Line_Monitoring_Data.xlsx");
    toast.success("Successfully exported to Excel");
  };

  return (
    <div className="line-monitoring-container">
      {/* Header section */}
      <nav className="navbar bg-light border-body" data-bs-theme="light">
        <div className="container-fluid">
          <div className="mt-4">
            <h3 className="nav-header header-style">Line Monitoring</h3>
            <p className="breadcrumb">
              <Link to="/dashboard">
                <i className="fas fa-home text-8"></i>
              </Link>{" "}
              <span className="ms-1 mt-1 text-small-gray">
                / Line Monitoring
              </span>
            </p>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <Container fluid>
        <Card className="mb-4">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Production Line Monitoring</h5>
            <div className="d-flex gap-2">
              <Button
                variant="outline-success text-8"
                size="sm"
                onClick={handleExportToExcel}
              >
                <i className="fas fa-file-export"></i> Export Excel
              </Button>
              <Button variant="primary text-8" onClick={handleAddLine}>
                <i className="fas fa-plus me-2"></i>Add New Line
              </Button>
            </div>
          </Card.Header>
          <Card.Body>
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <Table responsive striped hover>
                <thead>
                  <tr>
                    <th>Line</th>
                    <th>Product</th>
                    <th>Supervisor</th>
                    <th>People Count</th>
                    <th>Start Time</th>
                    <th>Stop Time</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {lineData.map((line) => (
                    <tr key={line.id}>
                      <td>{line.lineNumber}</td>
                      <td>{line.product}</td>
                      <td>{line.supervisor}</td>
                      <td>{line.peopleCount}</td>
                      <td>{line.startTime}</td>
                      <td>{line.stopTime}</td>
                      <td>{getStatusBadge(line.status)}</td>
                      <td>
                        <Button
                          variant=""
                          size="sm"
                          className="me-2 btn-icon edit"
                          onClick={() => handleEditLine(line)}
                        >
                          <i className="fas fa-edit"></i>
                        </Button>
                        <Button
                          variant=""
                          size="sm"
                          className="btn-icon delete"
                          onClick={() => {
                            // Delete functionality
                            // For now just log
                            console.log("Delete line", line.id);
                          }}
                        >
                          <i className="fas fa-trash"></i>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      </Container>

      {/* Modal for adding/editing line */}
      <LineMonitoringModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        handleSave={handleSaveLine}
        editMode={editMode}
        lineData={currentLine}
      />
    </div>
  );
};

export default LineMonitoring;
