import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Badge,
  Form,
  InputGroup,
  Button,
  Pagination,
} from "react-bootstrap";
import {
  FaSearch,
  FaFilter,
  FaSort,
  FaExclamationTriangle,
  FaInfoCircle,
  FaCheckCircle,
  FaFileExport,
} from "react-icons/fa";
import api from "../../../services/api";
import exportToExcel from "../../../utils/exportToExcel";

const EventsTable = ({ activeTab }) => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortField, setSortField] = useState("timestamp");
  const [sortDirection, setSortDirection] = useState("desc");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [eventsPerPage] = useState(10);

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        // Try to use existing API endpoints based on the active tab
        let endpoint = "";
        switch (activeTab) {
          case "production":
            endpoint = "/api/production-receipt/table";
            break;
          case "quality":
            endpoint = "/api/receipt/qc-status/result";
            break;
          default:
            // Use dummy data for tabs without API
            setEvents(generateDummyEvents(activeTab));
            setIsLoading(false);
            return;
        }

        const response = await api.get(endpoint);
        // Process the data based on the active tab
        let processedEvents = [];

        if (activeTab === "production") {
          processedEvents = processProductionEvents(response.data.data);
        } else if (activeTab === "quality") {
          processedEvents = processQualityEvents(response.data.data);
        }

        setEvents(processedEvents);
      } catch (error) {
        console.error(`Error fetching ${activeTab} events:`, error);
        // Fallback to dummy data on error
        setEvents(generateDummyEvents(activeTab));
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [activeTab]);

  useEffect(() => {
    // Apply filters and sorting
    let result = [...events];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(
        (event) =>
          event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.machine?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.operator?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((event) => event.status === statusFilter);
    }

    // Apply sorting
    result.sort((a, b) => {
      if (a[sortField] < b[sortField]) return sortDirection === "asc" ? -1 : 1;
      if (a[sortField] > b[sortField]) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    setFilteredEvents(result);
  }, [events, searchTerm, statusFilter, sortField, sortDirection]);

  // Process production events
  const processProductionEvents = (data) => {
    // This is a placeholder for data processing logic
    // In a real application, you would transform the API data into events format
    return generateDummyEvents("production");
  };

  // Process quality events
  const processQualityEvents = (data) => {
    // This is a placeholder for data processing logic
    return generateDummyEvents("quality");
  };

  // Generate dummy events for demonstration
  const generateDummyEvents = (tab) => {
    const statuses = ["info", "warning", "error", "success"];
    const machines = [
      "CNC-01",
      "Assembly-02",
      "Packaging-03",
      "Testing-04",
      "Welding-05",
    ];
    const operators = [
      "John D.",
      "Sarah M.",
      "Robert K.",
      "Lisa T.",
      "Michael P.",
    ];

    let events = [];
    const count = 50; // Generate 50 events

    for (let i = 0; i < count; i++) {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const timestamp = new Date();
      timestamp.setHours(timestamp.getHours() - Math.floor(Math.random() * 72)); // Random time in last 72 hours

      let description = "";
      switch (tab) {
        case "production":
          description = getRandomProductionEvent(status);
          break;
        case "quality":
          description = getRandomQualityEvent(status);
          break;
        case "store":
          description = getRandomStoreEvent(status);
          break;
        case "sales":
          description = getRandomSalesEvent(status);
          break;
        case "vendor":
          description = getRandomVendorEvent(status);
          break;
        case "workforce":
          description = getRandomWorkforceEvent(status);
          break;
        default:
          description = "Generic event";
      }

      events.push({
        id: i + 1,
        timestamp,
        status,
        description,
        machine: machines[Math.floor(Math.random() * machines.length)],
        operator: operators[Math.floor(Math.random() * operators.length)],
        duration: status === "error" ? Math.floor(Math.random() * 120) + 5 : 0, // Duration in minutes for errors
        details: `Details for event #${i + 1}`,
      });
    }

    return events;
  };

  const getRandomProductionEvent = (status) => {
    const events = {
      info: [
        "Production batch started",
        "Shift change completed",
        "Maintenance scheduled",
        "Production target achieved",
      ],
      warning: [
        "Machine performance degrading",
        "Production rate below target",
        "Material running low",
        "Minor process deviation detected",
      ],
      error: [
        "Machine breakdown",
        "Emergency stop activated",
        "Critical process failure",
        "Production line stopped",
      ],
      success: [
        "Production target exceeded",
        "Zero defects in batch",
        "Maintenance completed successfully",
        "New efficiency record achieved",
      ],
    };

    return events[status][Math.floor(Math.random() * events[status].length)];
  };

  const getRandomQualityEvent = (status) => {
    const events = {
      info: [
        "Quality check initiated",
        "Batch sampling completed",
        "Quality audit scheduled",
        "New quality procedure implemented",
      ],
      warning: [
        "Quality metrics trending down",
        "Increased defect rate detected",
        "Calibration due soon",
        "Minor quality deviation",
      ],
      error: [
        "Batch failed quality check",
        "Critical defect detected",
        "Quality standard violation",
        "Product recall required",
      ],
      success: [
        "Zero defects in inspection",
        "Quality audit passed",
        "Calibration completed successfully",
        "Quality improvement target achieved",
      ],
    };

    return events[status][Math.floor(Math.random() * events[status].length)];
  };

  const getRandomStoreEvent = (status) => {
    const events = {
      info: [
        "Inventory count initiated",
        "New stock received",
        "Reorder point reached",
        "Stock transfer completed",
      ],
      warning: [
        "Stock level low",
        "Inventory discrepancy detected",
        "Approaching expiry date",
        "Storage capacity at 80%",
      ],
      error: [
        "Stock out situation",
        "Damaged inventory detected",
        "Storage temperature deviation",
        "Expired items found",
      ],
      success: [
        "Inventory reconciliation completed",
        "Optimal stock level achieved",
        "Storage optimization completed",
        "Inventory turnover target met",
      ],
    };

    return events[status][Math.floor(Math.random() * events[status].length)];
  };

  const getRandomSalesEvent = (status) => {
    const events = {
      info: [
        "New order received",
        "Customer inquiry logged",
        "Price update scheduled",
        "Sales meeting completed",
      ],
      warning: [
        "Order fulfillment delayed",
        "Sales target at risk",
        "Customer complaint received",
        "Pricing discrepancy detected",
      ],
      error: [
        "Order cancellation",
        "Payment rejection",
        "Major customer dispute",
        "Critical delivery failure",
      ],
      success: [
        "Sales target exceeded",
        "Large order confirmed",
        "New customer acquired",
        "Perfect delivery record maintained",
      ],
    };

    return events[status][Math.floor(Math.random() * events[status].length)];
  };

  const getRandomVendorEvent = (status) => {
    const events = {
      info: [
        "Vendor evaluation initiated",
        "New supplier onboarded",
        "Contract review scheduled",
        "Supplier meeting completed",
      ],
      warning: [
        "Supplier delivery delay",
        "Quality issues with supplier",
        "Price increase notification",
        "Supplier capacity constraint",
      ],
      error: [
        "Supplier contract breach",
        "Critical material shortage",
        "Supplier quality certification expired",
        "Major non-conformance detected",
      ],
      success: [
        "Supplier excellence award",
        "Cost reduction achieved",
        "Perfect delivery performance",
        "Successful supplier audit",
      ],
    };

    return events[status][Math.floor(Math.random() * events[status].length)];
  };

  const getRandomWorkforceEvent = (status) => {
    const events = {
      info: [
        "New employee onboarded",
        "Training session completed",
        "Performance review scheduled",
        "Shift schedule updated",
      ],
      warning: [
        "Increased absenteeism",
        "Skill gap identified",
        "Overtime threshold reached",
        "Safety refresher training needed",
      ],
      error: [
        "Safety incident reported",
        "Critical skill shortage",
        "Compliance violation",
        "Unplanned absence",
      ],
      success: [
        "Zero safety incidents",
        "Training certification completed",
        "Productivity target exceeded",
        "Employee recognition awarded",
      ],
    };

    return events[status][Math.floor(Math.random() * events[status].length)];
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const renderStatusBadge = (status) => {
    switch (status) {
      case "info":
        return (
          <Badge bg="info" className="d-flex align-items-center">
            <FaInfoCircle className="me-1" /> Info
          </Badge>
        );
      case "warning":
        return (
          <Badge bg="warning" className="d-flex align-items-center">
            <FaExclamationTriangle className="me-1" /> Warning
          </Badge>
        );
      case "error":
        return (
          <Badge bg="danger" className="d-flex align-items-center">
            <FaExclamationTriangle className="me-1" /> Error
          </Badge>
        );
      case "success":
        return (
          <Badge bg="success" className="d-flex align-items-center">
            <FaCheckCircle className="me-1" /> Success
          </Badge>
        );
      default:
        return <Badge bg="secondary">Unknown</Badge>;
    }
  };

  // Pagination logic
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = filteredEvents.slice(
    indexOfFirstEvent,
    indexOfLastEvent
  );
  const totalPages = Math.ceil(filteredEvents.length / eventsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <Card className="shadow-sm border-0 mb-4">
      <Card.Header className="bg-white">
        <div className="d-flex justify-content-between align-items-center">
          <h6 className="mb-0">
            {activeTab === "production" && "Production Events"}
            {activeTab === "quality" && "Quality Events"}
            {activeTab === "store" && "Inventory Events"}
            {activeTab === "sales" && "Sales Events"}
            {activeTab === "vendor" && "Vendor Events"}
            {activeTab === "workforce" && "Workforce Events"}
          </h6>
          <div className="d-flex">
            <InputGroup size="sm" className="me-2" style={{ width: "200px" }}>
              <InputGroup.Text>
                <FaSearch />
              </InputGroup.Text>
              <Form.Control
                className="text-8"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
            <Form.Select
              size="sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="me-2 text-8"
              style={{ width: "120px" }}
            >
              <option value="all">All Status</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
              <option value="success">Success</option>
            </Form.Select>
            <Button
              variant="outline-secondary"
              size="sm"
              className="me-2 text-8"
            >
              <FaFilter /> Filter
            </Button>
            <Button
              variant="outline-success text-8"
              size="sm"
              onClick={() => {
                const dataToExport = currentEvents.map((event) => ({
                  Timestamp: event.timestamp.toLocaleString(),
                  Status: event.status,
                  Description: event.description,
                  Machine: event.machine,
                  Operator: event.operator,
                  Duration: event.duration > 0 ? `${event.duration} min` : "-",
                }));
                exportToExcel(
                  dataToExport,
                  `${
                    activeTab.charAt(0).toUpperCase() + activeTab.slice(1)
                  } Events`
                );
              }}
            >
              <i className="fas fa-file-export"></i> Export Excel
            </Button>
          </div>
        </div>
      </Card.Header>
      <Card.Body className="p-0">
        {isLoading ? (
          <div className="text-center py-5">Loading events...</div>
        ) : (
          <Table hover responsive className="mb-0">
            <thead className="table-light">
              <tr>
                <th
                  onClick={() => handleSort("timestamp")}
                  style={{ cursor: "pointer" }}
                >
                  Timestamp <FaSort className="ms-1" size={12} />
                </th>
                <th
                  onClick={() => handleSort("status")}
                  style={{ cursor: "pointer" }}
                >
                  Status <FaSort className="ms-1" size={12} />
                </th>
                <th
                  onClick={() => handleSort("description")}
                  style={{ cursor: "pointer" }}
                >
                  Description <FaSort className="ms-1" size={12} />
                </th>
                <th
                  onClick={() => handleSort("machine")}
                  style={{ cursor: "pointer" }}
                >
                  Machine <FaSort className="ms-1" size={12} />
                </th>
                <th
                  onClick={() => handleSort("operator")}
                  style={{ cursor: "pointer" }}
                >
                  Operator <FaSort className="ms-1" size={12} />
                </th>
                <th>Duration</th>
              </tr>
            </thead>
            <tbody>
              {currentEvents.length > 0 ? (
                currentEvents.map((event) => (
                  <tr key={event.id}>
                    <td>{event.timestamp.toLocaleString()}</td>
                    <td>{renderStatusBadge(event.status)}</td>
                    <td>{event.description}</td>
                    <td>{event.machine}</td>
                    <td>{event.operator}</td>
                    <td>
                      {event.duration > 0 ? `${event.duration} min` : "-"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-3">
                    No events found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        )}
      </Card.Body>
      <Card.Footer className="bg-white">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            Showing {indexOfFirstEvent + 1} to{" "}
            {Math.min(indexOfLastEvent, filteredEvents.length)} of{" "}
            {filteredEvents.length} entries
          </div>
          <Pagination className="mb-0">
            <Pagination.First
              onClick={() => paginate(1)}
              disabled={currentPage === 1}
            />
            <Pagination.Prev
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
            />

            {[...Array(Math.min(5, totalPages)).keys()].map((i) => {
              const pageNum =
                currentPage > 3
                  ? i + currentPage - 2 <= totalPages
                    ? i + currentPage - 2
                    : totalPages - 4 + i
                  : i + 1;

              if (pageNum > 0 && pageNum <= totalPages) {
                return (
                  <Pagination.Item
                    key={pageNum}
                    active={pageNum === currentPage}
                    onClick={() => paginate(pageNum)}
                  >
                    {pageNum}
                  </Pagination.Item>
                );
              }
              return null;
            })}

            <Pagination.Next
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
            />
            <Pagination.Last
              onClick={() => paginate(totalPages)}
              disabled={currentPage === totalPages}
            />
          </Pagination>
        </div>
      </Card.Footer>
    </Card>
  );
};

export default EventsTable;
