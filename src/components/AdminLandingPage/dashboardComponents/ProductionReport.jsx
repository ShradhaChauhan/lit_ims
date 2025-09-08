import React, { useState, useEffect } from "react";
import { Card, Row, Col, Table, Pagination, Button } from "react-bootstrap";
import api from "../../../services/api";
import moment from "moment";
import * as XLSX from "xlsx";

const ProductionReport = ({ activeTab }) => {
  // If not on production tab, don't render anything
  if (activeTab !== "production") {
    return null;
  }
  const [orderStats, setOrderStats] = useState({
    totalOrders: 0,
    inProgress: 0,
    completed: 0,
  });
  const [orders, setOrders] = useState([
    {
      orderNumber: "ORD-2024-001",
      product: "Lithium Battery Pack 48V",
      quantity: 50,
      status: "Completed",
      timestamp: "2024-03-10T09:30:00",
    },
    {
      orderNumber: "ORD-2024-002",
      product: "EV Controller Unit",
      quantity: 25,
      status: "In Progress",
      timestamp: "2024-03-10T10:15:00",
    },
    {
      orderNumber: "ORD-2024-003",
      product: "Battery Management System",
      quantity: 75,
      status: "In Progress",
      timestamp: "2024-03-10T11:00:00",
    },
    {
      orderNumber: "ORD-2024-004",
      product: "Power Distribution Module",
      quantity: 30,
      status: "Completed",
      timestamp: "2024-03-10T11:45:00",
    },
    {
      orderNumber: "ORD-2024-005",
      product: "Charging Interface Module",
      quantity: 40,
      status: "In Progress",
      timestamp: "2024-03-10T12:30:00",
    },
    {
      orderNumber: "ORD-2024-006",
      product: "Motor Controller",
      quantity: 60,
      status: "Completed",
      timestamp: "2024-03-10T13:15:00",
    },
    {
      orderNumber: "ORD-2024-007",
      product: "DC-DC Converter",
      quantity: 45,
      status: "In Progress",
      timestamp: "2024-03-10T14:00:00",
    },
    {
      orderNumber: "ORD-2024-008",
      product: "Thermal Management Unit",
      quantity: 35,
      status: "Completed",
      timestamp: "2024-03-10T14:45:00",
    },
    {
      orderNumber: "ORD-2024-009",
      product: "Battery Cell Module",
      quantity: 100,
      status: "In Progress",
      timestamp: "2024-03-10T15:30:00",
    },
    {
      orderNumber: "ORD-2024-010",
      product: "Power Electronics Unit",
      quantity: 55,
      status: "Completed",
      timestamp: "2024-03-10T16:15:00",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;

  useEffect(() => {
    // Set dummy stats
    setOrderStats({
      totalOrders: orders.length,
      inProgress: orders.filter((order) => order.status === "In Progress")
        .length,
      completed: orders.filter((order) => order.status === "Completed").length,
    });
  }, [orders]);

  // Get current orders for pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);

  // Change page
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Export to Excel function
  const exportToExcel = () => {
    const exportData = orders.map((order) => ({
      "Order Number": order.orderNumber,
      Product: order.product,
      Quantity: order.quantity,
      Status: order.status,
      Timestamp: moment(order.timestamp).format("MMM DD, YYYY HH:mm"),
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Production Orders");
    XLSX.writeFile(wb, "Production_Orders.xlsx");
  };

  // Generate pagination items
  const totalPages = Math.ceil(orders.length / ordersPerPage);

  const renderPaginationItems = () => {
    let items = [];
    for (let number = 1; number <= totalPages; number++) {
      items.push(
        <Pagination.Item
          key={number}
          active={number === currentPage}
          onClick={() => handlePageChange(number)}
        >
          {number}
        </Pagination.Item>
      );
    }
    return items;
  };

  // KPI Card Component
  const KpiCard = ({ title, value, icon, color }) => (
    <Card className="kpi-card mb-4">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h6 className="text-muted mb-2">{title}</h6>
            <h3 className="mb-0">{value}</h3>
          </div>
          <div className={`icon-circle bg-${color}`}>
            <i className={`fas ${icon} text-white`}></i>
          </div>
        </div>
      </Card.Body>
    </Card>
  );

  return (
    <div className="production-report mb-4">
      <h4 className="mb-4">Production Report</h4>

      {/* KPI Cards */}
      <Row>
        <Col md={4}>
          <KpiCard
            title="Total Orders"
            value={orderStats.totalOrders}
            icon="fa-shopping-cart"
            color="primary"
          />
        </Col>
        <Col md={4}>
          <KpiCard
            title="In Progress"
            value={orderStats.inProgress}
            icon="fa-clock"
            color="warning"
          />
        </Col>
        <Col md={4}>
          <KpiCard
            title="Completed"
            value={orderStats.completed}
            icon="fa-check-circle"
            color="success"
          />
        </Col>
      </Row>

      {/* Orders Table */}
      <Card className="mt-3">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">Recent Orders</h5>
            <div>
              <Button
                variant="outline-success text-8"
                size="sm"
                className="me-2"
                onClick={exportToExcel}
              >
                <i className="fas fa-file-export"></i> Export Excel
              </Button>
            </div>
          </div>
          <div className="table-responsive">
            <Table hover>
              <thead>
                <tr>
                  <th>Order Number</th>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center">
                      Loading...
                    </td>
                  </tr>
                ) : currentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  currentOrders.map((order) => (
                    <tr key={order.orderNumber}>
                      <td>{order.orderNumber}</td>
                      <td>{order.product}</td>
                      <td>{order.quantity}</td>
                      <td>
                        <span
                          className={`badge bg-${
                            order.status === "Completed" ? "success" : "warning"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td>
                        {moment(order.timestamp).format("MMM DD, YYYY HH:mm")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
            {/* Pagination */}
            <div className="d-flex justify-content-between align-items-center mt-3">
              <div className="text-muted">
                Showing {indexOfFirstOrder + 1} to{" "}
                {Math.min(indexOfLastOrder, orders.length)} of {orders.length}{" "}
                entries
              </div>
              <Pagination className="mb-0">
                <Pagination.First
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                />
                <Pagination.Prev
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                />
                {renderPaginationItems()}
                <Pagination.Next
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                />
                <Pagination.Last
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                />
              </Pagination>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ProductionReport;
