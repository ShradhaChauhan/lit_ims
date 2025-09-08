import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, ProgressBar, Button } from 'react-bootstrap';
import { FaCircle, FaExclamationTriangle, FaTools, FaCog, FaChartLine, FaInfoCircle } from 'react-icons/fa';
import api from '../../../services/api';

const MachinesGrid = ({ activeTab }) => {
  const [machines, setMachines] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  useEffect(() => {
    const fetchMachines = async () => {
      setIsLoading(true);
      try {
        // Try to use an existing API endpoint if available
        // For now, we'll use dummy data
        setMachines(generateDummyMachines());
      } catch (error) {
        console.error('Error fetching machines:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMachines();
  }, []);

  // Generate dummy machine data
  const generateDummyMachines = () => {
    const machineTypes = ['CNC', 'Assembly', 'Packaging', 'Testing', 'Welding', 'Painting', 'Molding'];
    const statuses = ['running', 'idle', 'maintenance', 'error', 'offline'];
    
    return Array.from({ length: 12 }, (_, i) => {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const utilization = status === 'running' ? 
        Math.floor(Math.random() * 30) + 70 : 
        status === 'idle' ? 
          Math.floor(Math.random() * 30) + 30 : 
          Math.floor(Math.random() * 30);
      
      return {
        id: i + 1,
        name: `${machineTypes[i % machineTypes.length]}-${String(i + 1).padStart(2, '0')}`,
        status,
        utilization,
        uptime: Math.floor(Math.random() * 500) + 100, // hours
        lastMaintenance: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000), // Random date in last 30 days
        nextMaintenance: new Date(Date.now() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000), // Random date in next 30 days
        operator: ['John D.', 'Sarah M.', 'Robert K.', 'Lisa T.', 'Michael P.'][Math.floor(Math.random() * 5)],
        alerts: Math.floor(Math.random() * 3),
        efficiency: Math.floor(Math.random() * 20) + 80, // 80-100%
        defectRate: Math.floor(Math.random() * 5), // 0-5%
      };
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'running': return 'success';
      case 'idle': return 'warning';
      case 'maintenance': return 'info';
      case 'error': return 'danger';
      case 'offline': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'running': return <FaCircle className="text-success" />;
      case 'idle': return <FaCircle className="text-warning" />;
      case 'maintenance': return <FaTools className="text-info" />;
      case 'error': return <FaExclamationTriangle className="text-danger" />;
      case 'offline': return <FaCircle className="text-secondary" />;
      default: return <FaCircle className="text-secondary" />;
    }
  };

  const getUtilizationVariant = (utilization) => {
    if (utilization >= 80) return 'success';
    if (utilization >= 60) return 'info';
    if (utilization >= 40) return 'warning';
    return 'danger';
  };

  const renderGridView = () => (
    <Row className="g-3">
      {machines.map(machine => (
        <Col key={machine.id} xs={12} sm={6} md={4} lg={3}>
          <Card className={`h-100 shadow-sm border-${getStatusColor(machine.status)}`}>
            <Card.Header className={`bg-${getStatusColor(machine.status)} bg-opacity-10 d-flex justify-content-between align-items-center`}>
              <h6 className="mb-0">{machine.name}</h6>
              <div className="d-flex align-items-center">
                {getStatusIcon(machine.status)}
                <span className="ms-1 text-capitalize">{machine.status}</span>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <small>Utilization</small>
                  <small>{machine.utilization}%</small>
                </div>
                <ProgressBar 
                  variant={getUtilizationVariant(machine.utilization)} 
                  now={machine.utilization} 
                />
              </div>
              
              <div className="d-flex justify-content-between mb-2">
                <div>
                  <small className="text-muted d-block">Uptime</small>
                  <span>{machine.uptime} hrs</span>
                </div>
                <div className="text-end">
                  <small className="text-muted d-block">Efficiency</small>
                  <span>{machine.efficiency}%</span>
                </div>
              </div>
              
              <div className="d-flex justify-content-between">
                <div>
                  <small className="text-muted d-block">Operator</small>
                  <span>{machine.operator}</span>
                </div>
                <div className="text-end">
                  {machine.alerts > 0 && (
                    <Badge bg="danger" className="d-flex align-items-center">
                      <FaExclamationTriangle className="me-1" /> {machine.alerts} Alert{machine.alerts > 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );

  const renderListView = () => (
    <div className="table-responsive">
      <table className="table table-hover">
        <thead>
          <tr>
            <th>Machine</th>
            <th>Status</th>
            <th>Utilization</th>
            <th>Operator</th>
            <th>Uptime</th>
            <th>Efficiency</th>
            <th>Next Maintenance</th>
            <th>Alerts</th>
          </tr>
        </thead>
        <tbody>
          {machines.map(machine => (
            <tr key={machine.id}>
              <td>{machine.name}</td>
              <td>
                <Badge bg={getStatusColor(machine.status)} className="d-flex align-items-center" style={{ width: 'fit-content' }}>
                  {getStatusIcon(machine.status)}
                  <span className="ms-1 text-capitalize">{machine.status}</span>
                </Badge>
              </td>
              <td>
                <div style={{ width: '100px' }}>
                  <ProgressBar 
                    variant={getUtilizationVariant(machine.utilization)} 
                    now={machine.utilization} 
                    label={`${machine.utilization}%`}
                    style={{ height: '10px' }}
                  />
                </div>
              </td>
              <td>{machine.operator}</td>
              <td>{machine.uptime} hrs</td>
              <td>{machine.efficiency}%</td>
              <td>{machine.nextMaintenance.toLocaleDateString()}</td>
              <td>
                {machine.alerts > 0 ? (
                  <Badge bg="danger" className="d-flex align-items-center" style={{ width: 'fit-content' }}>
                    <FaExclamationTriangle className="me-1" /> {machine.alerts}
                  </Badge>
                ) : (
                  <Badge bg="success" className="d-flex align-items-center" style={{ width: 'fit-content' }}>
                    <FaCheckCircle className="me-1" /> OK
                  </Badge>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <Card className="shadow-sm border-0 mb-4">
      <Card.Header className="bg-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Machine Status</h5>
        <div className="d-flex">
          <Button 
            variant={viewMode === 'grid' ? 'primary' : 'outline-primary'} 
            size="sm"
            className="me-2"
            onClick={() => setViewMode('grid')}
          >
            <i className="fas fa-th"></i> Grid
          </Button>
          <Button 
            variant={viewMode === 'list' ? 'primary' : 'outline-primary'} 
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <i className="fas fa-list"></i> List
          </Button>
        </div>
      </Card.Header>
      <Card.Body>
        {isLoading ? (
          <div className="text-center py-5">Loading machines...</div>
        ) : (
          viewMode === 'grid' ? renderGridView() : renderListView()
        )}
      </Card.Body>
      <Card.Footer className="bg-white d-flex justify-content-between">
        <div>
          <Badge bg="success" className="me-2">Running: {machines.filter(m => m.status === 'running').length}</Badge>
          <Badge bg="warning" className="me-2">Idle: {machines.filter(m => m.status === 'idle').length}</Badge>
          <Badge bg="info" className="me-2">Maintenance: {machines.filter(m => m.status === 'maintenance').length}</Badge>
          <Badge bg="danger" className="me-2">Error: {machines.filter(m => m.status === 'error').length}</Badge>
          <Badge bg="secondary">Offline: {machines.filter(m => m.status === 'offline').length}</Badge>
        </div>
        <div>
          <Button variant="outline-secondary" size="sm">
            <FaCog className="me-1" /> Configure
          </Button>
        </div>
      </Card.Footer>
    </Card>
  );
};

export default MachinesGrid;
