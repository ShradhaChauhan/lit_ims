import React, { useState, useEffect } from 'react';
import { Card, ListGroup, Badge, Button, Form } from 'react-bootstrap';
import { 
  FaBell, 
  FaExclamationTriangle, 
  FaInfoCircle, 
  FaCheckCircle, 
  FaFilter,
  FaAngleDown,
  FaAngleUp,
  FaTrash,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa';
import api from '../../../services/api';

const NotificationsPanel = ({ activeTab }) => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');
  const [readFilter, setReadFilter] = useState('all');

  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true);
      try {
        // Try to use existing API endpoints
        let endpoint = '/api/alerts/unread';
        
        try {
          const response = await api.get(endpoint);
          const processedNotifications = processApiNotifications(response.data.data);
          setNotifications(processedNotifications);
        } catch (apiError) {
          console.error('Error fetching notifications from API:', apiError);
          // Fallback to dummy data
          setNotifications(generateDummyNotifications(activeTab));
        }
      } catch (error) {
        console.error('Error in notification fetch:', error);
        setNotifications(generateDummyNotifications(activeTab));
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, [activeTab]);

  useEffect(() => {
    // Apply filters
    let result = [...notifications];
    
    // Apply type filter
    if (typeFilter !== 'all') {
      result = result.filter(notification => notification.type === typeFilter);
    }
    
    // Apply read filter
    if (readFilter !== 'all') {
      const isRead = readFilter === 'read';
      result = result.filter(notification => notification.isRead === isRead);
    }
    
    setFilteredNotifications(result);
  }, [notifications, typeFilter, readFilter]);

  // Process API notifications
  const processApiNotifications = (apiData) => {
    if (!Array.isArray(apiData) || apiData.length === 0) {
      return generateDummyNotifications(activeTab);
    }
    
    return apiData.map((item, index) => {
      // Map API data to our notification format
      return {
        id: item.id || index + 1,
        timestamp: new Date(item.createdAt || Date.now()),
        type: mapApiSeverityToType(item.severity || 'info'),
        message: item.message || 'No message provided',
        source: item.source || 'System',
        isRead: item.isRead || false,
        details: item.details || {}
      };
    });
  };

  // Map API severity to our type
  const mapApiSeverityToType = (severity) => {
    switch (severity.toLowerCase()) {
      case 'critical':
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'success':
        return 'success';
      default:
        return 'info';
    }
  };

  // Generate dummy notifications
  const generateDummyNotifications = (tab) => {
    const types = ['info', 'warning', 'error', 'success'];
    const sources = ['System', 'Machine', 'Quality', 'Inventory', 'Production', 'Maintenance'];
    
    let notifications = [];
    const count = 15; // Generate 15 notifications
    
    for (let i = 0; i < count; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const timestamp = new Date();
      timestamp.setMinutes(timestamp.getMinutes() - Math.floor(Math.random() * 120)); // Random time in last 2 hours
      
      let message = '';
      switch (tab) {
        case 'production':
          message = getRandomProductionNotification(type);
          break;
        case 'quality':
          message = getRandomQualityNotification(type);
          break;
        case 'store':
          message = getRandomStoreNotification(type);
          break;
        case 'sales':
          message = getRandomSalesNotification(type);
          break;
        case 'vendor':
          message = getRandomVendorNotification(type);
          break;
        case 'workforce':
          message = getRandomWorkforceNotification(type);
          break;
        default:
          message = getRandomProductionNotification(type);
      }
      
      notifications.push({
        id: i + 1,
        timestamp,
        type,
        message,
        source: sources[Math.floor(Math.random() * sources.length)],
        isRead: Math.random() > 0.7, // 30% chance of being read
        details: {}
      });
    }
    
    // Sort by timestamp (newest first)
    return notifications.sort((a, b) => b.timestamp - a.timestamp);
  };

  const getRandomProductionNotification = (type) => {
    const notifications = {
      info: [
        'Production batch #12345 started',
        'Shift change completed successfully',
        'Maintenance scheduled for Machine CNC-01',
        'Daily production target updated to 1,500 units'
      ],
      warning: [
        'Machine CNC-02 performance degrading',
        'Production rate below target by 15%',
        'Material inventory running low',
        'Minor process deviation detected in Assembly-03'
      ],
      error: [
        'Machine Welding-05 breakdown detected',
        'Emergency stop activated on Production Line 2',
        'Critical process failure in Packaging-03',
        'Production halted due to quality issues'
      ],
      success: [
        'Production target exceeded by 10%',
        'Zero defects achieved in batch #12345',
        'Maintenance completed successfully',
        'New efficiency record achieved on Assembly-01'
      ]
    };
    
    return notifications[type][Math.floor(Math.random() * notifications[type].length)];
  };

  const getRandomQualityNotification = (type) => {
    const notifications = {
      info: [
        'Quality check initiated for batch #12345',
        'Batch sampling completed for incoming materials',
        'Quality audit scheduled for tomorrow',
        'New quality procedure implemented'
      ],
      warning: [
        'Quality metrics trending down for Product A',
        'Increased defect rate detected in Assembly-02',
        'Calibration due for testing equipment',
        'Minor quality deviation in batch #12345'
      ],
      error: [
        'Batch #12345 failed quality check',
        'Critical defect detected in Product B',
        'Quality standard violation in Assembly-03',
        'Product recall required for batch #54321'
      ],
      success: [
        'Zero defects in inspection of batch #12345',
        'Quality audit passed with no findings',
        'Calibration completed successfully',
        'Quality improvement target achieved'
      ]
    };
    
    return notifications[type][Math.floor(Math.random() * notifications[type].length)];
  };

  const getRandomStoreNotification = (type) => {
    const notifications = {
      info: [
        'Inventory count initiated for warehouse A',
        'New stock received for Item X-123',
        'Reorder point reached for Item Y-456',
        'Stock transfer completed to Production Line 1'
      ],
      warning: [
        'Stock level low for Item Z-789',
        'Inventory discrepancy detected for Item X-123',
        'Items approaching expiry date in Zone B',
        'Storage capacity at 80% in Warehouse C'
      ],
      error: [
        'Stock out situation for critical Item Z-789',
        'Damaged inventory detected in shipment #12345',
        'Storage temperature deviation in Cold Storage',
        'Expired items found in Zone D'
      ],
      success: [
        'Inventory reconciliation completed successfully',
        'Optimal stock level achieved for all critical items',
        'Storage optimization completed in Warehouse A',
        'Inventory turnover target met for Q2'
      ]
    };
    
    return notifications[type][Math.floor(Math.random() * notifications[type].length)];
  };

  const getRandomSalesNotification = (type) => {
    const notifications = {
      info: [
        'New order #12345 received from Customer ABC',
        'Customer XYZ inquiry logged for Product A',
        'Price update scheduled for Product Line B',
        'Sales meeting completed with Customer DEF'
      ],
      warning: [
        'Order #12345 fulfillment delayed',
        'Monthly sales target at risk by 15%',
        'Customer complaint received for order #54321',
        'Pricing discrepancy detected in Quote #789'
      ],
      error: [
        'Order #12345 cancellation by Customer ABC',
        'Payment rejection for Invoice #54321',
        'Major dispute with Customer XYZ',
        'Critical delivery failure for Order #789'
      ],
      success: [
        'Monthly sales target exceeded by 10%',
        'Large order #12345 confirmed by Customer ABC',
        'New customer XYZ acquired',
        'Perfect delivery record maintained for Q2'
      ]
    };
    
    return notifications[type][Math.floor(Math.random() * notifications[type].length)];
  };

  const getRandomVendorNotification = (type) => {
    const notifications = {
      info: [
        'Vendor ABC evaluation initiated',
        'New supplier XYZ onboarded for Material A',
        'Contract review scheduled with Vendor DEF',
        'Supplier meeting completed with Vendor GHI'
      ],
      warning: [
        'Supplier ABC delivery delay for Material X',
        'Quality issues detected with Vendor DEF materials',
        'Price increase notification from Supplier XYZ',
        'Supplier ABC capacity constraint reported'
      ],
      error: [
        'Supplier XYZ contract breach detected',
        'Critical material shortage from Vendor ABC',
        'Supplier DEF quality certification expired',
        'Major non-conformance detected in Vendor GHI shipment'
      ],
      success: [
        'Supplier ABC awarded excellence recognition',
        '10% cost reduction achieved with Vendor XYZ',
        'Perfect delivery performance from Supplier DEF',
        'Successful supplier audit completed for Vendor GHI'
      ]
    };
    
    return notifications[type][Math.floor(Math.random() * notifications[type].length)];
  };

  const getRandomWorkforceNotification = (type) => {
    const notifications = {
      info: [
        'New employee John Doe onboarded',
        'Safety training session completed for Team A',
        'Performance review scheduled for next week',
        'Shift schedule updated for Production Line 1'
      ],
      warning: [
        'Increased absenteeism in Assembly Team',
        'Skill gap identified in Maintenance Team',
        'Overtime threshold reached for Production Team',
        'Safety refresher training needed for Team B'
      ],
      error: [
        'Safety incident reported in Warehouse Area',
        'Critical skill shortage in Quality Team',
        'Compliance violation in working hours',
        'Unplanned absence affecting Production Line 2'
      ],
      success: [
        'Zero safety incidents this month',
        'Training certification completed for all teams',
        'Productivity target exceeded by Team A',
        'Employee of the month awarded to Jane Smith'
      ]
    };
    
    return notifications[type][Math.floor(Math.random() * notifications[type].length)];
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'info': return <FaInfoCircle className="text-info" />;
      case 'warning': return <FaExclamationTriangle className="text-warning" />;
      case 'error': return <FaExclamationTriangle className="text-danger" />;
      case 'success': return <FaCheckCircle className="text-success" />;
      default: return <FaInfoCircle className="text-info" />;
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'info': return <Badge bg="info">Info</Badge>;
      case 'warning': return <Badge bg="warning">Warning</Badge>;
      case 'error': return <Badge bg="danger">Error</Badge>;
      case 'success': return <Badge bg="success">Success</Badge>;
      default: return <Badge bg="secondary">Unknown</Badge>;
    }
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? { ...notification, isRead: true } : notification
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({ ...notification, isRead: true })));
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diffMs = now - timestamp;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hr ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day ago`;
  };

  return (
    <Card className="shadow-sm border-0 mb-4">
      <Card.Header className="bg-white d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <FaBell className="me-2 text-primary" />
          <h5 className="mb-0">Notifications</h5>
          {!isCollapsed && filteredNotifications.filter(n => !n.isRead).length > 0 && (
            <Badge bg="danger" pill className="ms-2">
              {filteredNotifications.filter(n => !n.isRead).length}
            </Badge>
          )}
        </div>
        <div className="d-flex">
          <Button 
            variant="outline-secondary" 
            size="sm" 
            className="me-2"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? <FaAngleDown /> : <FaAngleUp />}
          </Button>
          {!isCollapsed && (
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={markAllAsRead}
              disabled={!filteredNotifications.some(n => !n.isRead)}
            >
              <FaEye className="me-1" /> Mark all read
            </Button>
          )}
        </div>
      </Card.Header>
      
      {!isCollapsed && (
        <>
          <div className="p-2 border-bottom bg-light">
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex">
                <Form.Select 
                  size="sm" 
                  value={typeFilter} 
                  onChange={e => setTypeFilter(e.target.value)}
                  className="me-2"
                  style={{ width: '120px' }}
                >
                  <option value="all">All Types</option>
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="error">Error</option>
                  <option value="success">Success</option>
                </Form.Select>
                <Form.Select 
                  size="sm" 
                  value={readFilter} 
                  onChange={e => setReadFilter(e.target.value)}
                  style={{ width: '120px' }}
                >
                  <option value="all">All Status</option>
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                </Form.Select>
              </div>
              <Button 
                variant="outline-danger" 
                size="sm"
                onClick={clearAllNotifications}
                disabled={filteredNotifications.length === 0}
              >
                <FaTrash className="me-1" /> Clear All
              </Button>
            </div>
          </div>
          
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {isLoading ? (
              <div className="text-center py-4">Loading notifications...</div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-4 text-muted">
                <FaBell size={24} className="mb-2" />
                <p>No notifications to display</p>
              </div>
            ) : (
              <ListGroup variant="flush">
                {filteredNotifications.map(notification => (
                  <ListGroup.Item 
                    key={notification.id}
                    className={`d-flex ${!notification.isRead ? 'bg-light' : ''}`}
                  >
                    <div className="me-3 mt-1">
                      {getTypeIcon(notification.type)}
                    </div>
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-start">
                        <p className="mb-0 fw-semibold">{notification.message}</p>
                        <small className="text-muted ms-2">
                          {formatTimeAgo(notification.timestamp)}
                        </small>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mt-1">
                        <div>
                          <small className="text-muted me-2">Source: {notification.source}</small>
                          {getTypeBadge(notification.type)}
                        </div>
                        <div>
                          {!notification.isRead && (
                            <Button 
                              variant="outline-secondary" 
                              size="sm" 
                              className="me-1 py-0 px-1"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <FaEye size={12} />
                            </Button>
                          )}
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            className="py-0 px-1"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <FaTrash size={12} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </div>
        </>
      )}
    </Card>
  );
};

export default NotificationsPanel;
